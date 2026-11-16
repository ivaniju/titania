'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const L = require('./logic');
const auth = require('./auth');
const bank = require('./bank');
const { createPool, withTx, migrate } = require('./db');
const { createLogger, errorFields } = require('./log');
const { consoleMailer } = require('./mailer');

const COOKIE = 'expediente_sid';
const SESSION_DAYS = 30;
const VERIFY_HOURS = 24;
const RESET_HOURS = 1;
const LOGIN_MAX_FAILURES = 5;
const LOGIN_WINDOW_MIN = 15;
const MAX_BODY = 16 * 1024;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; " +
    "font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/**
 * Crea la aplicación. Opciones:
 *   databaseUrl  cadena de conexión a PostgreSQL (obligatoria)
 *   schema       esquema de Postgres a usar (las pruebas aíslan cada fichero en uno propio)
 *   dataDir      carpeta con oposiciones.json y el banco de preguntas
 *   publicDir    carpeta de estáticos
 *   mailer       implementación de Mailer
 *   now          reloj inyectable, () => Date
 *   sessionSecret, appUrl, cookieSecure, trustProxy, logger
 * Devuelve { server, pool, close(), ... } con las migraciones aplicadas y el banco importado.
 */
async function createApp(options = {}) {
  const {
    databaseUrl,
    schema,
    dataDir = path.join(__dirname, '..', 'data'),
    publicDir = path.join(__dirname, '..', 'public'),
    now = () => new Date(),
    sessionSecret,
    appUrl = 'http://localhost:3000',
    cookieSecure = true,
    trustProxy = false,
    logger = createLogger(),
    random = Math.random,
  } = options;
  const mailer = options.mailer || consoleMailer({ from: 'Expediente <no-reply@localhost>' });
  if (!sessionSecret || sessionSecret.length < 16) throw new Error('SESSION_SECRET debe tener al menos 16 caracteres');

  // Validar los datos antes de tocar la base de datos: si el banco está mal, no se arranca.
  const { temario, questions: fileQuestions } = bank.loadData(dataDir);
  const pool = createPool({ databaseUrl, schema });
  let questions;
  try {
    await migrate(pool, { schema });
    questions = await bank.importQuestions(pool, fileQuestions, now());
  } catch (err) {
    await pool.end();
    throw err;
  }

  const oposiciones = new Map(temario.oposiciones.map((o) => [o.id, o]));
  const temas = new Map();
  for (const b of temario.bloques) for (const t of b.temas) temas.set(t.id, { tema: t, bloque: b });
  const db = (text, params) => pool.query(text, params);
  const tokenHash = (token) => auth.hashToken(token, sessionSecret);

  // ---------- utilidades ----------

  function activeIdsFor(oposicion) {
    const ids = [];
    for (const [id, q] of questions) if (q.active && q.data.oposiciones.includes(oposicion)) ids.push(id);
    return ids;
  }

  function minutesAgo(minutes) {
    return new Date(now().getTime() - minutes * 60000);
  }

  async function countAttempts(key, minutes) {
    const { rows } = await db('select count(*)::int as n from login_attempts where key = $1 and created_at > $2',
      [key, minutesAgo(minutes)]);
    return rows[0].n;
  }

  const recordAttempt = (key) => db('insert into login_attempts (key, created_at) values ($1, $2)', [key, now()]);

  /** Límite genérico por clave: cuenta cada intento. */
  async function throttle(key, max, minutes) {
    if (await countAttempts(key, minutes) >= max) {
      throw new HttpError(429, 'Demasiados intentos. Espera unos minutos y vuelve a probar.');
    }
    await recordAttempt(key);
  }

  async function issueEmailToken(userId, purpose, hours) {
    const token = auth.newToken();
    // Un token nuevo invalida los anteriores del mismo tipo.
    await db('update email_tokens set used_at = $3 where user_id = $1 and purpose = $2 and used_at is null',
      [userId, purpose, now()]);
    await db('insert into email_tokens (user_id, purpose, token_hash, expires_at) values ($1, $2, $3, $4)',
      [userId, purpose, tokenHash(token), new Date(now().getTime() + hours * 3600000)]);
    return token;
  }

  /** Consume un token de un solo uso. Devuelve el user_id o lanza 400. */
  async function consumeEmailToken(client, token, purpose) {
    if (typeof token !== 'string' || !token) throw new HttpError(400, 'El enlace no es válido o ha caducado.');
    const { rows } = await client.query(
      `update email_tokens set used_at = $3
       where token_hash = $1 and purpose = $2 and used_at is null and expires_at > $3
       returning user_id`, [tokenHash(token), purpose, now()]);
    if (!rows.length) throw new HttpError(400, 'El enlace no es válido o ha caducado.');
    return rows[0].user_id;
  }

  function sendMail(message, reqId) {
    // No se espera al proveedor: la respuesta no debe tardar distinto según exista o no la cuenta.
    Promise.resolve().then(() => mailer.send(message)).catch((err) => {
      logger.error('mail_failed', { reqId, provider: mailer.name, error: err.message });
    });
  }

  async function sendVerification(user, reqId) {
    const token = await issueEmailToken(user.id, 'verify', VERIFY_HOURS);
    sendMail({
      to: user.email,
      subject: 'Confirma tu email en Expediente',
      text: `Hola, ${user.name}:\n\nPara activar tu cuenta abre este enlace (caduca en ${VERIFY_HOURS} horas):\n\n` +
        `${appUrl}/#/verificar?token=${token}\n\nSi no has creado una cuenta, ignora este mensaje.`,
    }, reqId);
  }

  function cookieHeader(value, maxAge) {
    return `${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${cookieSecure ? '; Secure' : ''}`;
  }

  function validPassword(password) {
    if (typeof password !== 'string' || password.length < 8 || password.length > 200) {
      throw new HttpError(422, 'La contraseña debe tener entre 8 y 200 caracteres.');
    }
    return password;
  }

  function validEmail(email) {
    const value = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!EMAIL.test(value) || value.length > 254) throw new HttpError(422, 'Escribe un email válido.');
    return value;
  }

  // ---------- cuentas ----------

  async function register(ctx) {
    const { body } = ctx;
    const name = typeof body.name === 'string' ? body.name.trim().replace(/\s+/g, ' ') : '';
    if (name.length < 2 || name.length > 40) throw new HttpError(422, 'El nombre debe tener entre 2 y 40 caracteres.');
    const email = validEmail(body.email);
    const password = validPassword(body.password);
    if (!oposiciones.has(body.oposicion)) throw new HttpError(422, 'Elige una oposición.');
    await throttle(`register:ip:${ctx.ipKey}`, 10, 60);

    const { hash, salt } = await auth.hashPassword(password);
    const { rows } = await db('select id, name, email, email_verified_at from users where email = $1', [email]);
    const existing = rows[0];
    if (!existing) {
      const created = await db(
        `insert into users (name, email, password_hash, salt, oposicion, created_at)
         values ($1, $2, $3, $4, $5, $6) on conflict (email) do nothing returning id, name, email`,
        [name, email, hash, salt, body.oposicion, now()]);
      if (created.rows[0]) await sendVerification(created.rows[0], ctx.reqId);
    } else if (!existing.email_verified_at) {
      // Cuenta sin confirmar: vale el último registro. Quien confirme el email se queda con esos datos.
      await db('update users set name = $2, password_hash = $3, salt = $4, oposicion = $5 where id = $1',
        [existing.id, name, hash, salt, body.oposicion]);
      await sendVerification({ ...existing, name }, ctx.reqId);
    } else {
      sendMail({
        to: existing.email,
        subject: 'Ya tienes cuenta en Expediente',
        text: `Hola, ${existing.name}:\n\nAlguien ha intentado registrarse con este email, que ya tiene cuenta. ` +
          `Si has sido tú, entra con tu contraseña o recupérala en ${appUrl}/#/recuperar. Si no, ignora este mensaje.`,
      }, ctx.reqId);
    }
    // Misma respuesta exista o no la cuenta.
    return { status: 201, body: { ok: true, message: 'Te hemos enviado un correo para confirmar tu email.' } };
  }

  async function verifyEmail(ctx) {
    await withTx(pool, async (client) => {
      const userId = await consumeEmailToken(client, ctx.body.token, 'verify');
      await client.query('update users set email_verified_at = coalesce(email_verified_at, $2) where id = $1',
        [userId, now()]);
    });
    return { body: { ok: true } };
  }

  async function login(ctx) {
    const email = typeof ctx.body.email === 'string' ? ctx.body.email.trim().toLowerCase() : '';
    const password = typeof ctx.body.password === 'string' ? ctx.body.password : '';
    if (!email || !password) throw new HttpError(422, 'Escribe tu email y tu contraseña.');
    const emailKey = `login:email:${auth.opaqueKey(email, sessionSecret)}`;
    const ipKey = `login:ip:${ctx.ipKey}`;
    const [byEmail, byIp] = await Promise.all([
      countAttempts(emailKey, LOGIN_WINDOW_MIN), countAttempts(ipKey, LOGIN_WINDOW_MIN)]);
    if (byEmail >= LOGIN_MAX_FAILURES || byIp >= LOGIN_MAX_FAILURES) {
      throw new HttpError(429, 'Demasiados intentos fallidos. Espera 15 minutos y vuelve a probar.');
    }

    const { rows } = await db(
      'select id, name, email, password_hash, salt, email_verified_at from users where email = $1', [email]);
    const user = rows[0];
    let ok = false;
    if (user) ok = await auth.verifyPassword(password, user.salt, user.password_hash);
    else await auth.hashPassword(password); // mismo coste exista o no la cuenta
    if (!ok) {
      await Promise.all([recordAttempt(emailKey), recordAttempt(ipKey)]);
      throw new HttpError(401, 'Email o contraseña incorrectos.');
    }
    if (!user.email_verified_at) {
      await sendVerification(user, ctx.reqId);
      throw new HttpError(409, 'Tu email está sin confirmar. Te hemos reenviado el enlace de confirmación.');
    }
    await db('delete from login_attempts where key = $1', [emailKey]);

    const token = auth.newToken();
    await db('insert into sessions (user_id, token_hash, created_at, expires_at) values ($1, $2, $3, $4)',
      [user.id, tokenHash(token), now(), new Date(now().getTime() + SESSION_DAYS * 86400000)]);
    ctx.userId = user.id;
    return { body: { ok: true }, headers: { 'Set-Cookie': cookieHeader(token, SESSION_DAYS * 86400) } };
  }

  async function logout(ctx) {
    if (ctx.sessionToken) await db('delete from sessions where token_hash = $1', [tokenHash(ctx.sessionToken)]);
    return { body: { ok: true }, headers: { 'Set-Cookie': cookieHeader('', 0) } };
  }

  async function forgotPassword(ctx) {
    const email = validEmail(ctx.body.email);
    await throttle(`forgot:ip:${ctx.ipKey}`, 5, 15);
    await throttle(`forgot:email:${auth.opaqueKey(email, sessionSecret)}`, 3, 60);
    const { rows } = await db('select id, name, email from users where email = $1', [email]);
    if (rows[0]) {
      const token = await issueEmailToken(rows[0].id, 'reset', RESET_HOURS);
      sendMail({
        to: rows[0].email,
        subject: 'Recupera tu contraseña de Expediente',
        text: `Hola, ${rows[0].name}:\n\nPara elegir una contraseña nueva abre este enlace (caduca en 1 hora y solo sirve una vez):\n\n` +
          `${appUrl}/#/restablecer?token=${token}\n\nSi no lo has pedido, ignora este mensaje: tu contraseña no cambia.`,
      }, ctx.reqId);
    }
    return { body: { ok: true, message: 'Si hay una cuenta con ese email, te hemos enviado un enlace para cambiar la contraseña.' } };
  }

  async function resetPassword(ctx) {
    const password = validPassword(ctx.body.password);
    const { hash, salt } = await auth.hashPassword(password);
    await withTx(pool, async (client) => {
      const userId = await consumeEmailToken(client, ctx.body.token, 'reset');
      // Abrir el enlace demuestra el control del buzón: también confirma el email.
      await client.query(
        `update users set password_hash = $2, salt = $3, email_verified_at = coalesce(email_verified_at, $4)
         where id = $1`, [userId, hash, salt, now()]);
      await client.query('delete from sessions where user_id = $1', [userId]);
    });
    return { body: { ok: true } };
  }

  // ---------- portada ----------

  async function me(ctx) {
    const { user } = ctx;
    const today = L.madridDay(now());
    const [days, exams, errors, open] = await Promise.all([
      db('select day from activity_days where user_id = $1 order by day desc', [user.id]),
      db("select count(*)::int as n from tests where user_id = $1 and mode = 'examen' and day = $2", [user.id, today]),
      db(`select count(*)::int as n from error_bank e join questions q on q.id = e.question_id
          where e.user_id = $1 and q.active`, [user.id]),
      db(`select id, mode from tests where user_id = $1 and finished_at is null and started_at > $2
          order by started_at desc limit 1`, [user.id, new Date(now().getTime() - 86400000)]),
    ]);
    const active = new Set(days.rows.map((r) => r.day));
    const examsToday = exams.rows[0].n;
    const idle = L.inactiveDays(user.last_active_day, today);
    return {
      body: {
        user: {
          id: user.id, name: user.name, oposicion: user.oposicion,
          oposicionNombre: oposiciones.get(user.oposicion)?.nombre || user.oposicion,
        },
        today,
        streak: L.computeStreak(active, today),
        points: user.points,
        level: L.levelFor(user.points),
        league: L.leagueFor(user.points),
        exams: {
          limit: L.EXAM_DAILY_LIMIT, startedToday: examsToday,
          remaining: Math.max(0, L.EXAM_DAILY_LIMIT - examsToday),
        },
        errorBank: errors.rows[0].n,
        activity: L.lastDays(today, 14).map((day) => ({ day, active: active.has(day) })),
        inactivity: { days: idle, factor: L.decayFactor(user.last_active_day, today) },
        bankSize: activeIdsFor(user.oposicion).length,
        openTest: open.rows[0] || null,
      },
    };
  }

  function listOposiciones() {
    return { body: { oposiciones: temario.oposiciones.map((o) => ({ id: o.id, nombre: o.nombre })) } };
  }

  function getTemario(ctx) {
    const counts = new Map();
    for (const id of activeIdsFor(ctx.user.oposicion)) {
      const tema = questions.get(id).data.tema;
      counts.set(tema, (counts.get(tema) || 0) + 1);
    }
    const bloques = temario.bloques
      .filter((b) => b.oposiciones.includes(ctx.user.oposicion))
      .map((b) => ({
        id: b.id, titulo: b.titulo,
        temas: b.temas.map((t) => ({
          id: t.id, titulo: t.titulo, importancia: t.importancia, boe: t.boe, preguntas: counts.get(t.id) || 0,
        })),
      }));
    return { body: { oposicion: ctx.user.oposicion, bloques, pendiente: temario.pendiente || null } };
  }

  // ---------- tests ----------

  const isExamFormat = (mode) => mode === 'examen' || mode === 'errores-examen';

  async function markActive(client, userId, day) {
    await client.query('insert into activity_days (user_id, day) values ($1, $2) on conflict do nothing', [userId, day]);
    await client.query(
      'update users set last_active_day = $2 where id = $1 and (last_active_day is null or last_active_day < $2)',
      [userId, day]);
  }

  async function updateErrorBank(client, userId, questionId, correct) {
    if (correct) {
      await client.query('delete from error_bank where user_id = $1 and question_id = $2', [userId, questionId]);
    } else {
      await client.query('insert into error_bank (user_id, question_id) values ($1, $2) on conflict do nothing',
        [userId, questionId]);
    }
  }

  async function createTest(ctx) {
    const { user } = ctx;
    const mode = ctx.body.mode;
    if (!L.MODES.includes(mode)) throw new HttpError(422, 'Modo de test no válido.');
    const today = L.madridDay(now());
    const id = await withTx(pool, async (client) => {
      // Serializa las creaciones del mismo usuario para que el límite diario no se pueda saltar en paralelo.
      await client.query('select pg_advisory_xact_lock(hashtext($1))', [user.id]);
      let candidates;
      if (mode.startsWith('errores')) {
        const { rows } = await client.query('select question_id from error_bank where user_id = $1', [user.id]);
        candidates = rows.map((r) => r.question_id).filter((qid) => questions.get(qid)?.active);
        if (!candidates.length) throw new HttpError(409, 'No tienes fallos pendientes de repasar.');
      } else {
        candidates = activeIdsFor(user.oposicion);
        if (!candidates.length) throw new HttpError(409, 'Todavía no hay preguntas disponibles para tu oposición.');
      }
      if (mode === 'examen') {
        const { rows } = await client.query(
          "select count(*)::int as n from tests where user_id = $1 and mode = 'examen' and day = $2", [user.id, today]);
        if (rows[0].n >= L.EXAM_DAILY_LIMIT) {
          throw new HttpError(429, 'Has llegado al límite de 5 exámenes de hoy. Mañana tendrás otros cinco.');
        }
      }
      const seenRows = await client.query('select question_id, seen_at from seen_questions where user_id = $1', [user.id]);
      const seen = new Map(seenRows.rows.map((r) => [r.question_id, r.seen_at.getTime()]));
      const picked = L.pickQuestions(candidates, seen, L.SIZES[mode], random);

      const test = await client.query(
        'insert into tests (user_id, mode, day, started_at, total) values ($1, $2, $3, $4, $5) returning id',
        [user.id, mode, today, now(), picked.length]);
      const testId = test.rows[0].id;
      const rows = picked.map((qid, i) => ({ q: qid, p: i, o: L.shuffle([0, 1, 2, 3], random) }));
      await client.query(
        `insert into test_questions (test_id, question_id, position, option_order)
         select $1, r->>'q', (r->>'p')::int, array(select jsonb_array_elements_text(r->'o')::smallint)
         from jsonb_array_elements($2::jsonb) r`, [testId, JSON.stringify(rows)]);
      await client.query(
        `insert into seen_questions (user_id, question_id, seen_at) select $1, unnest($2::text[]), $3
         on conflict (user_id, question_id) do update set seen_at = excluded.seen_at`, [user.id, picked, now()]);
      return testId;
    });
    return { status: 201, body: { id } };
  }

  /** Carga un test comprobando que pertenece al usuario. Ajeno o inexistente: el mismo 404. */
  async function loadTest(client, ctx, { lock = false } = {}) {
    const id = ctx.params[0];
    if (!UUID.test(id)) throw new HttpError(404, 'Test no encontrado.');
    const { rows } = await client.query(
      `select id, mode, day, started_at, finished_at, total, correct, points from tests
       where id = $1 and user_id = $2${lock ? ' for update' : ''}`, [id, ctx.user.id]);
    if (!rows.length) throw new HttpError(404, 'Test no encontrado.');
    return rows[0];
  }

  async function loadRows(client, testId) {
    const { rows } = await client.query(
      `select question_id, position, option_order, selected_original from test_questions
       where test_id = $1 order by position`, [testId]);
    return rows;
  }

  const isCorrect = (row) => row.selected_original !== null &&
    questions.get(row.question_id).data.opciones[row.selected_original].correcta === true;

  /** Vista de una pregunta. Sin `reveal` no sale nada que delate la respuesta. */
  function viewQuestion(row, reveal) {
    const q = questions.get(row.question_id).data;
    const view = {
      id: row.question_id,
      position: row.position,
      enunciado: q.enunciado,
      selected: row.selected_original === null ? null : row.option_order.indexOf(row.selected_original),
      opciones: row.option_order.map((original) => {
        const o = q.opciones[original];
        return reveal ? { texto: o.texto, correcta: o.correcta, explicacion: o.explicacion } : { texto: o.texto };
      }),
    };
    if (reveal) {
      view.revealed = true;
      view.correct = isCorrect(row);
      view.tipo = q.tipo;
      view.tema = temas.get(q.tema)?.tema.titulo || q.tema;
      view.fuente = { titulo: q.fuente.titulo, url: q.fuente.url };
    }
    return view;
  }

  function viewTest(test, rows) {
    const finished = test.finished_at !== null;
    const study = !isExamFormat(test.mode);
    const view = {
      id: test.id,
      mode: test.mode,
      format: study ? 'estudio' : 'examen',
      finished,
      total: test.total,
      answered: rows.filter((r) => r.selected_original !== null).length,
      questions: rows.map((r) => viewQuestion(r, finished || (study && r.selected_original !== null))),
    };
    if (finished) {
      view.correct = test.correct;
      view.points = test.points;
    }
    return view;
  }

  async function getTest(ctx) {
    const test = await loadTest(pool, ctx);
    return { body: viewTest(test, await loadRows(pool, test.id)) };
  }

  async function answer(ctx) {
    const { questionId, option } = ctx.body;
    if (typeof questionId !== 'string' || !Number.isInteger(option) || option < 0 || option > 3) {
      throw new HttpError(422, 'Respuesta no válida.');
    }
    return withTx(pool, async (client) => {
      const test = await loadTest(client, ctx, { lock: true });
      if (test.finished_at) throw new HttpError(409, 'Este test ya está cerrado.');
      const { rows } = await client.query(
        `select question_id, position, option_order, selected_original from test_questions
         where test_id = $1 and question_id = $2`, [test.id, questionId]);
      const row = rows[0];
      if (!row) throw new HttpError(404, 'Esa pregunta no pertenece a este test.');
      const study = !isExamFormat(test.mode);
      if (study && row.selected_original !== null) throw new HttpError(409, 'Esta pregunta ya está respondida.');

      row.selected_original = row.option_order[option];
      await client.query(
        'update test_questions set selected_original = $3, answered_at = $4 where test_id = $1 and question_id = $2',
        [test.id, questionId, row.selected_original, now()]);
      await markActive(client, ctx.user.id, L.madridDay(now()));
      if (!study) return { body: { saved: true } };

      await updateErrorBank(client, ctx.user.id, questionId, isCorrect(row));
      return { body: viewQuestion(row, true) };
    });
  }

  async function finish(ctx) {
    return withTx(pool, async (client) => {
      const test = await loadTest(client, ctx, { lock: true });
      const rows = await loadRows(client, test.id);
      if (test.finished_at) return { body: viewTest(test, rows) };

      const correct = rows.filter(isCorrect).length;
      if (isExamFormat(test.mode)) {
        // En examen la lista de fallos se actualiza al entregar; sin responder cuenta como fallo.
        for (const row of rows) await updateErrorBank(client, ctx.user.id, row.question_id, isCorrect(row));
      }
      test.finished_at = now();
      test.correct = correct;
      test.points = test.mode === 'examen' ? L.examPoints(correct, rows.length) : null;
      await client.query('update tests set finished_at = $2, correct = $3, points = $4 where id = $1',
        [test.id, test.finished_at, test.correct, test.points]);
      if (test.mode === 'examen') {
        await client.query(
          `insert into exams (user_id, test_id, oposicion, day, points, correct, total)
           values ($1, $2, $3, $4, $5, $6, $7)`,
          [ctx.user.id, test.id, ctx.user.oposicion, L.madridDay(test.finished_at), test.points, correct, rows.length]);
        await client.query('update users set points = points + $2 where id = $1', [ctx.user.id, test.points]);
      }
      return { body: viewTest(test, rows) };
    });
  }

  // ---------- clasificación ----------

  const SCOPES = ['semanal', 'mensual', 'global', 'oposicion', 'historico'];
  const RANKING_SIZE = 100;

  async function ranking(ctx) {
    const scope = ctx.url.searchParams.get('scope') || 'semanal';
    if (!SCOPES.includes(scope)) throw new HttpError(400, 'Clasificación no válida.');
    const today = L.madridDay(now());
    const range = L.rangeForScope(scope, today);
    let rows;
    if (range) {
      // Periodos: los puntos del periodo se penalizan por inactividad antes de ordenar.
      ({ rows } = await db(
        `select u.id, u.name, u.oposicion, u.points as total, u.last_active_day, p.pts::int as pts
         from (select user_id, sum(points) as pts from exams where day between $1 and $2 group by user_id) p
         join users u on u.id = p.user_id`, [range.from, range.to]));
      for (const r of rows) r.pts = L.applyDecay(r.pts, r.last_active_day, today);
    } else if (scope === 'oposicion') {
      ({ rows } = await db(
        `select id, name, oposicion, points as total, points as pts from users
         where points > 0 and oposicion = $1 order by points desc limit $2`, [ctx.user.oposicion, RANKING_SIZE + 1]));
    } else {
      ({ rows } = await db(
        `select id, name, oposicion, points as total, points as pts from users
         where points > 0 order by points desc limit $1`, [RANKING_SIZE + 1]));
    }
    rows = rows.filter((r) => r.pts > 0).sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name, 'es'));
    const view = (r, position) => ({
      position,
      name: r.name,
      oposicion: oposiciones.get(r.oposicion)?.nombre || r.oposicion,
      points: r.pts,
      league: L.leagueFor(r.total).name,
      me: r.id === ctx.user.id,
    });
    const top = rows.slice(0, RANKING_SIZE).map((r, i) => view(r, i + 1));
    let mine = top.find((r) => r.me) || null;
    if (!mine) {
      const index = rows.findIndex((r) => r.id === ctx.user.id);
      if (index >= 0) mine = view(rows[index], index + 1);
      else if (!range && ctx.user.points > 0 && (scope === 'historico' || scope === 'oposicion')) {
        // Fuera del top: la posición es cuántos tienen más puntos, más uno.
        const { rows: above } = await db(
          `select count(*)::int as n from users where points > $1${scope === 'oposicion' ? ' and oposicion = $2' : ''}`,
          scope === 'oposicion' ? [ctx.user.points, ctx.user.oposicion] : [ctx.user.points]);
        mine = view({ ...ctx.user, total: ctx.user.points, pts: ctx.user.points }, above[0].n + 1);
      }
    }
    return {
      body: {
        scope,
        from: range ? range.from : null,
        to: range ? range.to : null,
        decays: Boolean(range),
        rows: top,
        me: mine,
      },
    };
  }

  // ---------- HTTP ----------

  const routes = [
    ['GET', /^\/healthz$/, health, { public: true }],
    ['GET', /^\/api\/oposiciones$/, listOposiciones, { public: true }],
    ['POST', /^\/api\/register$/, register, { public: true }],
    ['POST', /^\/api\/login$/, login, { public: true }],
    ['POST', /^\/api\/logout$/, logout, { public: true }],
    ['POST', /^\/api\/verify-email$/, verifyEmail, { public: true }],
    ['POST', /^\/api\/password\/forgot$/, forgotPassword, { public: true }],
    ['POST', /^\/api\/password\/reset$/, resetPassword, { public: true }],
    ['GET', /^\/api\/me$/, me],
    ['GET', /^\/api\/temario$/, getTemario],
    ['POST', /^\/api\/tests$/, createTest],
    ['GET', /^\/api\/tests\/([^/]+)$/, getTest],
    ['POST', /^\/api\/tests\/([^/]+)\/answer$/, answer],
    ['POST', /^\/api\/tests\/([^/]+)\/finish$/, finish],
    ['GET', /^\/api\/ranking$/, ranking],
  ];

  async function health() {
    await db('select 1');
    return { body: { ok: true } };
  }

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let size = 0;
      const chunks = [];
      req.on('data', (chunk) => {
        size += chunk.length;
        // Pasado el límite se descarta el resto para poder responder 400; si insiste, se corta.
        if (size > MAX_BODY * 64) req.destroy();
        else if (size <= MAX_BODY) chunks.push(chunk);
      });
      req.on('end', () => {
        if (size > MAX_BODY) return reject(new HttpError(400, 'La petición es demasiado grande.'));
        if (!size) return resolve({});
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'));
          if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('no es un objeto');
          resolve(parsed);
        } catch {
          reject(new HttpError(400, 'El cuerpo de la petición no es JSON válido.'));
        }
      });
      req.on('error', reject);
    });
  }

  function parseCookie(header) {
    for (const part of (header || '').split(';')) {
      const i = part.indexOf('=');
      if (i > 0 && part.slice(0, i).trim() === COOKIE) return part.slice(i + 1).trim();
    }
    return null;
  }

  function clientIp(req) {
    if (trustProxy) {
      const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
      if (forwarded) return forwarded;
    }
    return req.socket.remoteAddress || 'desconocida';
  }

  function send(res, status, body, headers = {}) {
    const payload = JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload),
      'Cache-Control': 'no-store',
      ...headers,
    });
    res.end(payload);
  }

  async function handleApi(req, res, ctx) {
    const route = routes.map(([method, pattern, handler, opts]) => ({ method, match: pattern.exec(ctx.url.pathname), handler, opts }))
      .filter((r) => r.match);
    if (!route.length) throw new HttpError(404, 'Ruta no encontrada.');
    const found = route.find((r) => r.method === req.method);
    if (!found) throw new HttpError(404, 'Ruta no encontrada.');
    ctx.params = found.match.slice(1);
    ctx.route = ctx.url.pathname.replace(/^(\/api\/tests\/)[^/]+/, '$1:id');

    if (req.method === 'POST') {
      // Defensa CSRF además de SameSite: solo JSON y, si hay Origin, que sea el propio.
      if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
        throw new HttpError(400, 'Las peticiones deben enviarse como application/json.');
      }
      const origin = req.headers.origin;
      if (origin && origin !== 'null') {
        let host = null;
        try { host = new URL(origin).host; } catch { /* origen ilegible */ }
        if (host !== req.headers.host) throw new HttpError(400, 'Origen de la petición no permitido.');
      }
      ctx.body = await readBody(req);
    }

    ctx.sessionToken = parseCookie(req.headers.cookie);
    if (!found.opts?.public) {
      if (ctx.sessionToken) {
        const { rows } = await db(
          `select u.id, u.name, u.oposicion, u.points, u.last_active_day
           from sessions s join users u on u.id = s.user_id
           where s.token_hash = $1 and s.expires_at > $2`, [tokenHash(ctx.sessionToken), now()]);
        ctx.user = rows[0];
      }
      if (!ctx.user) throw new HttpError(401, 'Inicia sesión para continuar.');
      ctx.userId = ctx.user.id;
    }
    const result = await found.handler(ctx);
    send(res, result.status || 200, result.body, result.headers);
  }

  const staticCache = new Map();
  function serveStatic(req, res, pathname) {
    if (req.method !== 'GET' && req.method !== 'HEAD') throw new HttpError(404, 'Ruta no encontrada.');
    let decoded;
    try { decoded = decodeURIComponent(pathname); } catch { throw new HttpError(400, 'Ruta no válida.'); }
    let file = path.join(publicDir, path.normalize(decoded));
    if (!file.startsWith(publicDir + path.sep) && file !== publicDir) throw new HttpError(404, 'Ruta no encontrada.');
    if (file === publicDir || decoded.endsWith('/')) file = path.join(publicDir, 'index.html');
    let entry = staticCache.get(file);
    if (!entry) {
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
        // Sin extensión se sirve la aplicación; un recurso que falta es un 404 de verdad.
        if (path.extname(file)) throw new HttpError(404, 'Ruta no encontrada.');
        file = path.join(publicDir, 'index.html');
      }
      const content = fs.readFileSync(file);
      entry = {
        content,
        type: MIME[path.extname(file)] || 'application/octet-stream',
        etag: `"${crypto.createHash('sha1').update(content).digest('base64url')}"`,
        immutable: file.includes(`${path.sep}fonts${path.sep}`),
      };
      if (process.env.NODE_ENV === 'production') staticCache.set(file, entry);
    }
    const headers = {
      'Content-Type': entry.type,
      ETag: entry.etag,
      'Cache-Control': entry.immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    };
    if (req.headers['if-none-match'] === entry.etag) {
      res.writeHead(304, headers);
      return res.end();
    }
    res.writeHead(200, { ...headers, 'Content-Length': entry.content.length });
    res.end(req.method === 'HEAD' ? undefined : entry.content);
  }

  const server = http.createServer(async (req, res) => {
    const started = process.hrtime.bigint();
    const reqId = crypto.randomUUID();
    const url = new URL(req.url, 'http://localhost');
    const ctx = { req, url, reqId, body: {}, params: [], route: null, userId: null };
    ctx.ipKey = auth.opaqueKey(clientIp(req), sessionSecret);
    res.setHeader('X-Request-Id', reqId);
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
    if (cookieSecure) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    let failure = null;
    try {
      if (url.pathname.startsWith('/api/') || url.pathname === '/healthz') await handleApi(req, res, ctx);
      else serveStatic(req, res, url.pathname);
    } catch (err) {
      const status = err instanceof HttpError ? err.status : 500;
      if (status === 500) failure = err;
      if (!res.headersSent) {
        send(res, status, { error: status === 500 ? 'Ha ocurrido un error inesperado. Inténtalo de nuevo.' : err.message });
      } else res.end();
    }
    // La ruta se registra como patrón y sin query: nunca lleva identificadores ni tokens.
    const fields = {
      reqId,
      method: req.method,
      route: ctx.route || (url.pathname.startsWith('/api/') ? 'api_desconocida' : 'estatico'),
      status: res.statusCode,
      ms: Math.round(Number(process.hrtime.bigint() - started) / 1e4) / 100,
    };
    if (ctx.userId) fields.userId = ctx.userId;
    if (failure) logger.error('request', { ...fields, ...errorFields(failure) });
    else logger.info('request', fields);
  });

  async function cleanup() {
    const t = now();
    await db('delete from sessions where expires_at < $1', [t]);
    await db('delete from email_tokens where expires_at < $1', [new Date(t.getTime() - 7 * 86400000)]);
    await db('delete from login_attempts where created_at < $1', [new Date(t.getTime() - 86400000)]);
  }
  const timer = setInterval(() => cleanup().catch((err) => logger.error('cleanup_failed', errorFields(err))), 3600000);
  timer.unref();

  return {
    server,
    pool,
    questionCount: fileQuestions.length,
    cleanup,
    async close() {
      clearInterval(timer);
      if (server.listening) await new Promise((resolve) => server.close(resolve));
      await pool.end();
    },
  };
}

module.exports = { createApp, HttpError, SECURITY_HEADERS };
