'use strict';
const crypto = require('node:crypto');
const { createApp } = require('../lib/app');
const { createPool } = require('../lib/db');
const { memoryMailer } = require('../lib/mailer');
const { writeDataDir } = require('./fixtures/demo-data');

const DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL ||
  'postgres://expediente:expediente@127.0.0.1:5432/expediente_test';

function createClock(start = '2026-03-10T10:00:00Z') {
  let t = new Date(start).getTime();
  return {
    now: () => new Date(t),
    set: (iso) => { t = new Date(iso).getTime(); },
    advance: (ms) => { t += ms; },
    advanceDays: (n) => { t += n * 86400000; },
  };
}

/** Arranca la app contra Postgres en un esquema propio, que se borra al cerrar. */
async function startApp(options = {}) {
  const schema = options.schema || `test_${crypto.randomBytes(6).toString('hex')}`;
  const clock = options.clock || createClock();
  const mailer = options.mailer || memoryMailer();
  const logs = options.logs || [];
  const logger = {
    info: (msg, f) => logs.push({ level: 'info', msg, ...f }),
    warn: (msg, f) => logs.push({ level: 'warn', msg, ...f }),
    error: (msg, f) => logs.push({ level: 'error', msg, ...f }),
  };
  const dataDir = options.dataDir || writeDataDir(options.questions);
  const app = await createApp({
    databaseUrl: DATABASE_URL, schema, dataDir, mailer, logger, now: clock.now,
    sessionSecret: 'secreto-de-pruebas-0123456789', appUrl: 'http://expediente.test', trustProxy: true,
    ...options.app,
  });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;

  function client() {
    let cookie = null;
    async function request(method, path, body, headers = {}) {
      const res = await fetch(base + path, {
        method,
        headers: {
          ...(body !== undefined ? { 'content-type': 'application/json' } : {}),
          ...(cookie ? { cookie } : {}),
          ...headers,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const set = res.headers.get('set-cookie');
      if (set) {
        const pair = set.split(';')[0];
        cookie = pair.endsWith('=') ? null : pair;
      }
      const text = await res.text();
      let json = null;
      try { json = JSON.parse(text); } catch { /* no es JSON */ }
      return { status: res.status, body: json, text, headers: res.headers, setCookie: set };
    }
    return {
      get: (path, headers) => request('GET', path, undefined, headers),
      post: (path, body = {}, headers) => request('POST', path, body, headers),
      setCookie: (value) => { cookie = value; },
      get cookie() { return cookie; },
    };
  }

  const tokenFrom = (mail) => /token=([\w-]+)/.exec(mail.text)[1];
  const lastMailTo = (email) => mailer.sent.filter((m) => m.to === email).at(-1);

  /** Registro, verificación y login por la API. Devuelve un cliente con sesión. */
  async function signup(name, email, oposicion = 'policia-nacional', password = 'contraseña-segura') {
    const c = client();
    const reg = await c.post('/api/register', { name, email, password, oposicion });
    if (reg.status !== 201) throw new Error(`registro: ${reg.status} ${reg.text}`);
    const ver = await c.post('/api/verify-email', { token: tokenFrom(lastMailTo(email)) });
    if (ver.status !== 200) throw new Error(`verificación: ${ver.status} ${ver.text}`);
    const log = await c.post('/api/login', { email, password });
    if (log.status !== 200) throw new Error(`login: ${log.status} ${log.text}`);
    return c;
  }

  async function close({ keepSchema = false } = {}) {
    await app.close();
    if (!keepSchema) {
      const pool = createPool({ databaseUrl: DATABASE_URL, max: 1 });
      await pool.query(`drop schema if exists ${schema} cascade`);
      await pool.end();
    }
  }

  return { app, base, schema, clock, mailer, logs, dataDir, client, signup, tokenFrom, lastMailTo, close };
}

/**
 * Responde todas las preguntas de un test. `pick(question)` devuelve el índice a marcar,
 * o null para dejarla sin responder. Consulta la base de datos para saber cuál es la
 * correcta: la API, a propósito, no lo dice.
 */
async function correctIndexes(ctx, testId) {
  const { rows } = await ctx.app.pool.query(
    `select tq.question_id, tq.option_order, q.data from test_questions tq
     join questions q on q.id = tq.question_id where tq.test_id = $1 order by tq.position`, [testId]);
  const map = new Map();
  for (const r of rows) {
    const original = r.data.opciones.findIndex((o) => o.correcta);
    map.set(r.question_id, r.option_order.indexOf(original));
  }
  return map;
}

/** Hace un test entero acertando las `hits` primeras preguntas y fallando el resto. */
async function playTest(ctx, c, mode, hits, { finish = true } = {}) {
  const created = await c.post('/api/tests', { mode });
  if (created.status !== 201) throw new Error(`crear test: ${created.status} ${created.text}`);
  const id = created.body.id;
  const correct = await correctIndexes(ctx, id);
  const test = (await c.get(`/api/tests/${id}`)).body;
  let i = 0;
  for (const q of test.questions) {
    const right = correct.get(q.id);
    const option = i < hits ? right : (right + 1) % 4;
    const res = await c.post(`/api/tests/${id}/answer`, { questionId: q.id, option });
    if (res.status !== 200) throw new Error(`responder: ${res.status} ${res.text}`);
    i += 1;
  }
  const result = finish ? (await c.post(`/api/tests/${id}/finish`)).body : null;
  return { id, test, result };
}

module.exports = { startApp, createClock, correctIndexes, playTest, DATABASE_URL };
