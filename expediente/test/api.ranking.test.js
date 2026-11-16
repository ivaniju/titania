'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { startApp, playTest } = require('./helpers');
const { createApp } = require('../lib/app');

let ctx;
let ana, blas, cruz, dora;
const rank = async (c, scope) => (await c.get(`/api/ranking?scope=${scope}`)).body;
const table = (r) => r.rows.map((x) => [x.position, x.name, x.points]);

test.before(async () => {
  ctx = await startApp();
  // Lunes 9 de febrero de 2026.
  ctx.clock.set('2026-02-09T09:00:00Z');
  ana = await ctx.signup('Ana', 'ana@example.com', 'policia-nacional');
  blas = await ctx.signup('Blas', 'blas@example.com', 'guardia-civil');
  cruz = await ctx.signup('Cruz', 'cruz@example.com', 'policia-nacional');
  dora = await ctx.signup('Dora', 'dora@example.com', 'policia-local');
  await playTest(ctx, ana, 'examen', 20);   // 100
  await playTest(ctx, ana, 'examen', 10);   // 50
  await playTest(ctx, blas, 'examen', 16);  // 80
  await playTest(ctx, cruz, 'examen', 12);  // 60
  await playTest(ctx, dora, 'estudio', 25); // estudia, pero sin puntos
});
test.after(async () => { await ctx.close(); });

test('ranking: orden, posición, oposición, liga y fila propia', async () => {
  const r = await rank(blas, 'semanal');
  assert.equal(r.scope, 'semanal');
  assert.deepEqual(table(r), [[1, 'Ana', 150], [2, 'Blas', 80], [3, 'Cruz', 60]]);
  assert.deepEqual(r.rows[1], { position: 2, name: 'Blas', oposicion: 'Guardia Civil', points: 80, league: 'Bronce', me: true });
  assert.deepEqual(r.rows.map((x) => x.me), [false, true, false]);
  assert.equal(r.me.position, 2);
  assert.deepEqual(Object.keys(r.rows[0]).sort(), ['league', 'me', 'name', 'oposicion', 'points', 'position']);

  // Quien no tiene puntos no aparece, y su fila propia es null.
  const d = await rank(dora, 'semanal');
  assert.equal(d.rows.length, 3);
  assert.equal(d.me, null);
  assert.equal((await dora.get('/api/ranking?scope=inventado')).status, 400);
});

test('ranking por oposición: solo la del usuario', async () => {
  assert.deepEqual(table(await rank(ana, 'oposicion')), [[1, 'Ana', 150], [2, 'Cruz', 60]]);
  assert.deepEqual(table(await rank(blas, 'oposicion')), [[1, 'Blas', 80]]);
  assert.deepEqual(table(await rank(dora, 'oposicion')), []);
});

test('periodos: semanal, mensual y 30 días acotan por fecha; histórico no', async () => {
  // Lunes siguiente: semana nueva. Ana hace un examen de 40.
  ctx.clock.set('2026-02-16T09:00:00Z');
  await playTest(ctx, ana, 'examen', 8);
  assert.deepEqual(table(await rank(ana, 'semanal')), [[1, 'Ana', 40]]);
  // Mensual y 30 días. Blas y Cruz llevan 6 días completos sin actividad: 5 penalizados.
  const decayed = (p) => Math.round(p * 0.9 ** 5);
  const expected = [[1, 'Ana', 190], [2, 'Blas', decayed(80)], [3, 'Cruz', decayed(60)]];
  assert.deepEqual(table(await rank(ana, 'mensual')), expected);
  assert.deepEqual(table(await rank(ana, 'global')), expected);
  const g = await rank(ana, 'global');
  assert.deepEqual([g.from, g.to, g.decays], ['2026-01-18', '2026-02-16', true]);
  // El histórico y el de oposición no penalizan.
  assert.deepEqual(table(await rank(ana, 'historico')), [[1, 'Ana', 190], [2, 'Blas', 80], [3, 'Cruz', 60]]);
  assert.deepEqual(table(await rank(cruz, 'oposicion')), [[1, 'Ana', 190], [2, 'Cruz', 60]]);
  assert.equal((await rank(ana, 'historico')).decays, false);
});

test('penalización: día de gracia y 0,9 diario desde el segundo día', async () => {
  // Miércoles 18: el martes 17 Ana no hizo nada (un día sin actividad: gracia).
  ctx.clock.set('2026-02-18T09:00:00Z');
  assert.equal((await rank(ana, 'semanal')).rows[0].points, 40);
  // Jueves 19: dos días sin actividad, uno penalizado.
  ctx.clock.set('2026-02-19T09:00:00Z');
  assert.equal((await rank(ana, 'semanal')).rows[0].points, 36);
  assert.equal((await rank(ana, 'mensual')).rows[0].points, 171);
  assert.equal((await ana.get('/api/me')).body.inactivity.days, 2);
  // Volver a estudiar (sin puntos) quita la penalización.
  await playTest(ctx, ana, 'estudio', 3);
  assert.equal((await rank(ana, 'semanal')).rows[0].points, 40);
  assert.equal((await rank(ana, 'mensual')).rows[0].points, 190);
});

test('marzo: el mensual empieza de cero y los 30 días aún alcanzan febrero', async () => {
  ctx.clock.set('2026-03-02T09:00:00Z');
  await playTest(ctx, dora, 'examen', 5); // 25
  assert.deepEqual(table(await rank(dora, 'mensual')), [[1, 'Dora', 25]]);
  assert.deepEqual(table(await rank(dora, 'semanal')), [[1, 'Dora', 25]]);
  // 30 días: los puntos de febrero siguen contando, muy penalizados por la inactividad.
  const d = (p, days) => Math.round(p * 0.9 ** days);
  assert.deepEqual(table(await rank(dora, 'global')),
    [[1, 'Ana', d(190, 9)], [2, 'Dora', 25], [3, 'Blas', d(80, 19)], [4, 'Cruz', d(60, 19)]]);
  assert.deepEqual(table(await rank(dora, 'historico')),
    [[1, 'Ana', 190], [2, 'Blas', 80], [3, 'Cruz', 60], [4, 'Dora', 25]]);
  assert.equal((await rank(dora, 'historico')).me.position, 4);
});

test('los datos sobreviven a un reinicio de la aplicación', async () => {
  const cookie = ana.cookie;
  const { schema, dataDir, clock, mailer } = ctx;
  await ctx.close({ keepSchema: true });
  ctx = await startApp({ schema, dataDir, clock, mailer });
  const again = ctx.client();
  again.setCookie(cookie);
  const me = await again.get('/api/me');
  assert.equal(me.status, 200, 'la sesión sigue siendo válida');
  assert.equal(me.body.user.name, 'Ana');
  assert.equal(me.body.points, 190);
  assert.deepEqual(table(await rank(again, 'historico')).slice(0, 2), [[1, 'Ana', 190], [2, 'Blas', 80]]);
  const migrations = await ctx.app.pool.query('select count(*)::int as n from schema_migrations');
  assert.equal(migrations.rows[0].n, 1, 'las migraciones no se vuelven a aplicar');
});

test('una pregunta retirada del banco se desactiva sin romper los tests antiguos', async () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const { makeQuestions } = require('./fixtures/demo-data');
  const c = await ctx.signup('Antigua', 'antigua@example.com');
  const old = await playTest(ctx, c, 'estudio', 0);
  const cookie = c.cookie;
  const { schema, dataDir, clock, mailer } = ctx;
  await ctx.close({ keepSchema: true });
  fs.writeFileSync(path.join(dataDir, 'questions.json'), JSON.stringify(makeQuestions({ common: 4, gcOnly: 0 })));
  ctx = await startApp({ schema, dataDir, clock, mailer });
  const again = ctx.client();
  again.setCookie(cookie);
  const me = (await again.get('/api/me')).body;
  assert.equal(me.bankSize, 4);
  assert.ok(me.errorBank <= 4, 'el repaso solo cuenta preguntas activas');
  const view = await again.get(`/api/tests/${old.id}`);
  assert.equal(view.status, 200);
  assert.equal(view.body.questions.length, 25);
  const next = (await again.post('/api/tests', { mode: 'estudio' })).body.id;
  assert.equal((await again.get(`/api/tests/${next}`)).body.total, 4);
});

test('con el banco vacío la app arranca y lo explica', async () => {
  const empty = await startApp({ questions: [] });
  try {
    const c = await empty.signup('Vacío', 'vacio@example.com');
    const res = await c.post('/api/tests', { mode: 'estudio' });
    assert.equal(res.status, 409);
    assert.match(res.body.error, /no hay preguntas disponibles/);
    assert.equal((await c.get('/api/me')).body.bankSize, 0);
    assert.equal((await c.get('/api/temario')).status, 200);
  } finally {
    await empty.close();
  }
});

test('un banco inválido impide arrancar', async () => {
  const { makeQuestions, writeDataDir } = require('./fixtures/demo-data');
  const questions = makeQuestions({ common: 2, gcOnly: 0 });
  delete questions[0].fuente;
  await assert.rejects(
    createApp({ databaseUrl: 'postgres://no-se-usa', dataDir: writeDataDir(questions), sessionSecret: 'x'.repeat(32) }),
    /sin fuente/);
});
