'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { startApp, correctIndexes, playTest } = require('./helpers');

let ctx;
test.before(async () => { ctx = await startApp(); });
test.after(async () => { await ctx.close(); });

const SECRET_KEYS = /"(correcta|explicacion|correct|fuente|tipo|tema|revealed)"/;

test('las rutas de usuario exigen sesión', async () => {
  const c = ctx.client();
  assert.equal((await c.get('/api/me')).status, 401);
  assert.equal((await c.get('/api/temario')).status, 401);
  assert.equal((await c.get('/api/ranking')).status, 401);
  assert.equal((await c.post('/api/tests', { mode: 'estudio' })).status, 401);
});

test('estudio: 25 preguntas y dictamen completo tras cada respuesta', async () => {
  const c = await ctx.signup('Estudiosa', 'estudio@example.com');
  assert.equal((await c.post('/api/tests', { mode: 'repaso' })).status, 422);
  const created = await c.post('/api/tests', { mode: 'estudio' });
  assert.equal(created.status, 201);
  const id = created.body.id;

  const fresh = await c.get(`/api/tests/${id}`);
  assert.equal(fresh.body.total, 25);
  assert.equal(fresh.body.format, 'estudio');
  assert.equal(new Set(fresh.body.questions.map((q) => q.id)).size, 25);
  assert.doesNotMatch(fresh.text, SECRET_KEYS, 'antes de responder no se envía ninguna corrección');
  for (const q of fresh.body.questions) assert.equal(q.opciones.length, 4);

  const correct = await correctIndexes(ctx, id);
  const [q1, q2] = fresh.body.questions;
  const right = await c.post(`/api/tests/${id}/answer`, { questionId: q1.id, option: correct.get(q1.id) });
  assert.equal(right.status, 200);
  assert.equal(right.body.correct, true);
  assert.equal(right.body.opciones.length, 4);
  assert.equal(right.body.opciones.filter((o) => o.correcta).length, 1);
  assert.equal(right.body.opciones[correct.get(q1.id)].correcta, true);
  for (const o of right.body.opciones) assert.ok(o.explicacion.length >= 20, 'las cuatro opciones llevan explicación');
  assert.ok(right.body.fuente.titulo && right.body.fuente.url);

  const wrongOption = (correct.get(q2.id) + 1) % 4;
  const wrong = await c.post(`/api/tests/${id}/answer`, { questionId: q2.id, option: wrongOption });
  assert.equal(wrong.body.correct, false);
  assert.equal(wrong.body.selected, wrongOption);

  // En estudio no se puede cambiar una respuesta ya corregida.
  assert.equal((await c.post(`/api/tests/${id}/answer`, { questionId: q1.id, option: 0 })).status, 409);
  assert.equal((await c.post(`/api/tests/${id}/answer`, { questionId: q1.id, option: 7 })).status, 422);
  assert.equal((await c.post(`/api/tests/${id}/answer`, { questionId: 'no-esta', option: 0 })).status, 404);

  // El estado solo revela las respondidas.
  const mid = await c.get(`/api/tests/${id}`);
  assert.equal(mid.body.answered, 2);
  assert.deepEqual(mid.body.questions.map((q) => Boolean(q.revealed)).slice(0, 3), [true, true, false]);
  assert.equal(mid.body.questions[2].opciones[0].correcta, undefined);

  const done = await c.post(`/api/tests/${id}/finish`);
  assert.equal(done.status, 200);
  assert.equal(done.body.finished, true);
  assert.equal(done.body.correct, 1);
  assert.equal(done.body.points, null, 'el estudio no da puntos');
  assert.ok(done.body.questions.every((q) => q.revealed));
  assert.equal((await c.post(`/api/tests/${id}/answer`, { questionId: fresh.body.questions[5].id, option: 0 })).status, 409);
  const again = await c.post(`/api/tests/${id}/finish`);
  assert.equal(again.status, 200);
  assert.equal(again.body.correct, 1);

  const me = (await c.get('/api/me')).body;
  assert.equal(me.points, 0);
  assert.equal(me.errorBank, 1);
  assert.equal(me.streak, 1);
});

test('examen: la corrección no sale del servidor hasta entregar', async () => {
  const c = await ctx.signup('Examinada', 'examen@example.com');
  const { id } = (await c.post('/api/tests', { mode: 'examen' })).body;
  const fresh = await c.get(`/api/tests/${id}`);
  assert.equal(fresh.body.total, 20);
  assert.equal(fresh.body.format, 'examen');
  assert.doesNotMatch(fresh.text, SECRET_KEYS);

  const correct = await correctIndexes(ctx, id);
  const qs = fresh.body.questions;
  // 17 aciertos, 2 fallos y 1 sin responder.
  for (let i = 0; i < 19; i++) {
    const right = correct.get(qs[i].id);
    const res = await c.post(`/api/tests/${id}/answer`, { questionId: qs[i].id, option: i < 17 ? right : (right + 1) % 4 });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { saved: true }, 'en examen responder solo confirma el guardado');
  }
  // En examen sí se puede cambiar la respuesta antes de entregar.
  const change = await c.post(`/api/tests/${id}/answer`, { questionId: qs[0].id, option: (correct.get(qs[0].id) + 2) % 4 });
  assert.deepEqual(change.body, { saved: true });
  await c.post(`/api/tests/${id}/answer`, { questionId: qs[0].id, option: correct.get(qs[0].id) });

  const mid = await c.get(`/api/tests/${id}`);
  assert.equal(mid.body.answered, 19);
  assert.doesNotMatch(mid.text, SECRET_KEYS, 'tampoco con respuestas guardadas');
  assert.equal(mid.body.points, undefined);
  assert.equal(mid.body.questions[0].selected, correct.get(qs[0].id));

  const done = await c.post(`/api/tests/${id}/finish`);
  assert.equal(done.body.correct, 17);
  assert.equal(done.body.points, 85, 'porcentaje de aciertos; sin responder cuenta como fallo');
  assert.equal(done.body.questions.length, 20);
  assert.ok(done.body.questions.every((q) => q.revealed && q.opciones.every((o) => o.explicacion)));
  assert.equal(done.body.questions[19].selected, null);
  assert.equal(done.body.questions[19].correct, false);

  // Entregar dos veces no suma dos veces.
  assert.equal((await c.post(`/api/tests/${id}/finish`)).body.points, 85);
  const me = (await c.get('/api/me')).body;
  assert.equal(me.points, 85);
  assert.equal(me.errorBank, 3, 'los fallos y la no respondida entran en el repaso');
  assert.deepEqual(me.exams, { limit: 5, startedToday: 1, remaining: 4 });
  const after = await c.get(`/api/tests/${id}`);
  assert.equal(after.body.finished, true);
  assert.equal(after.body.points, 85);
});

test('propiedad: un test ajeno responde 404 en todas sus rutas', async () => {
  const owner = await ctx.signup('Dueña', 'duena@example.com');
  const other = await ctx.signup('Curioso', 'curioso@example.com');
  const { id } = (await owner.post('/api/tests', { mode: 'examen' })).body;
  const q = (await owner.get(`/api/tests/${id}`)).body.questions[0];

  for (const c of [other, ctx.client()]) {
    const expected = c === other ? 404 : 401;
    assert.equal((await c.get(`/api/tests/${id}`)).status, expected);
    assert.equal((await c.post(`/api/tests/${id}/answer`, { questionId: q.id, option: 0 })).status, expected);
    assert.equal((await c.post(`/api/tests/${id}/finish`)).status, expected);
  }
  assert.equal((await other.get('/api/tests/no-es-un-uuid')).status, 404);
  assert.equal((await other.get('/api/tests/00000000-0000-4000-8000-000000000000')).status, 404);

  const mine = await owner.get(`/api/tests/${id}`);
  assert.equal(mine.status, 200);
  assert.equal(mine.body.finished, false, 'el intento ajeno no cerró el examen');
  assert.equal(mine.body.answered, 0);
});

test('límite diario: 5 exámenes iniciados, aunque se abandonen, por día de Madrid', async () => {
  ctx.clock.set('2026-05-04T08:00:00Z');
  const c = await ctx.signup('Insistente', 'limite-examen@example.com');
  const ids = [];
  for (let i = 0; i < 5; i++) {
    const res = await c.post('/api/tests', { mode: 'examen' });
    assert.equal(res.status, 201);
    ids.push(res.body.id);
    assert.equal((await c.get('/api/me')).body.exams.remaining, 4 - i);
  }
  // Ninguno está entregado: los cinco cuentan igual.
  const sixth = await c.post('/api/tests', { mode: 'examen' });
  assert.equal(sixth.status, 429);
  assert.match(sixth.body.error, /límite de 5 exámenes/);

  // Entregar uno no devuelve el hueco.
  await c.post(`/api/tests/${ids[0]}/finish`);
  assert.equal((await c.post('/api/tests', { mode: 'examen' })).status, 429);

  // El estudio y los repasos no gastan exámenes ni están limitados.
  assert.equal((await c.post('/api/tests', { mode: 'estudio' })).status, 201);
  assert.equal((await c.post('/api/tests', { mode: 'errores-examen' })).status, 201);
  assert.equal((await c.get('/api/me')).body.exams.remaining, 0);

  // 21:59 UTC del 4 de mayo son las 23:59 en Madrid: sigue siendo hoy.
  ctx.clock.set('2026-05-04T21:59:00Z');
  assert.equal((await c.post('/api/tests', { mode: 'examen' })).status, 429);
  // 22:01 UTC ya es 5 de mayo en Madrid, aunque en UTC siga siendo día 4.
  ctx.clock.set('2026-05-04T22:01:00Z');
  assert.equal((await c.post('/api/tests', { mode: 'examen' })).status, 201);
  assert.equal((await c.get('/api/me')).body.exams.remaining, 4);

  // Otro usuario tiene su propio contador.
  const other = await ctx.signup('Otra', 'otra-limite@example.com');
  assert.equal((await other.get('/api/me')).body.exams.remaining, 5);
});

test('límite diario: peticiones simultáneas no lo saltan', async () => {
  ctx.clock.set('2026-05-06T08:00:00Z');
  const c = await ctx.signup('Rápida', 'rapida@example.com');
  const results = await Promise.all(Array.from({ length: 9 }, () => c.post('/api/tests', { mode: 'examen' })));
  assert.equal(results.filter((r) => r.status === 201).length, 5);
  assert.equal(results.filter((r) => r.status === 429).length, 4);
});

test('repaso de fallos: solo preguntas falladas, y salen de la lista al acertarlas', async () => {
  ctx.clock.set('2026-05-08T08:00:00Z');
  const c = await ctx.signup('Repaso', 'repaso@example.com');
  const none = await c.post('/api/tests', { mode: 'errores-estudio' });
  assert.equal(none.status, 409);
  assert.match(none.body.error, /No tienes fallos/);

  // Estudio con 22 aciertos y 3 fallos.
  const study = await playTest(ctx, c, 'estudio', 22);
  const failed = study.result.questions.filter((q) => !q.correct).map((q) => q.id).sort();
  assert.equal(failed.length, 3);
  assert.equal((await c.get('/api/me')).body.errorBank, 3);

  const { id } = (await c.post('/api/tests', { mode: 'errores-estudio' })).body;
  const review = (await c.get(`/api/tests/${id}`)).body;
  assert.deepEqual(review.questions.map((q) => q.id).sort(), failed);
  assert.equal(review.format, 'estudio');

  const correct = await correctIndexes(ctx, id);
  const [a, b] = review.questions;
  await c.post(`/api/tests/${id}/answer`, { questionId: a.id, option: correct.get(a.id) });
  assert.equal((await c.get('/api/me')).body.errorBank, 2, 'acertada: sale de la lista');
  await c.post(`/api/tests/${id}/answer`, { questionId: b.id, option: (correct.get(b.id) + 1) % 4 });
  assert.equal((await c.get('/api/me')).body.errorBank, 2, 'fallada de nuevo: se queda');
  await c.post(`/api/tests/${id}/finish`);

  // Repaso en formato examen: sin corrección hasta entregar, sin puntos y sin gastar exámenes.
  const exam = await c.post('/api/tests', { mode: 'errores-examen' });
  const examView = await c.get(`/api/tests/${exam.body.id}`);
  assert.equal(examView.body.total, 2);
  assert.doesNotMatch(examView.text, SECRET_KEYS);
  const examCorrect = await correctIndexes(ctx, exam.body.id);
  for (const q of examView.body.questions) {
    const res = await c.post(`/api/tests/${exam.body.id}/answer`, { questionId: q.id, option: examCorrect.get(q.id) });
    assert.deepEqual(res.body, { saved: true });
  }
  assert.equal((await c.get('/api/me')).body.errorBank, 2, 'en formato examen la lista cambia al entregar');
  const done = (await c.post(`/api/tests/${exam.body.id}/finish`)).body;
  assert.equal(done.correct, 2);
  assert.equal(done.points, null);
  const me = (await c.get('/api/me')).body;
  assert.equal(me.errorBank, 0);
  assert.equal(me.points, 0);
  assert.equal(me.exams.remaining, 5);
});

test('anti-repetición: prioriza las no vistas y baraja las opciones', async () => {
  const c = await ctx.signup('Variada', 'variada@example.com'); // policía nacional: 30 preguntas
  const first = await playTest(ctx, c, 'estudio', 25);
  const firstIds = new Set(first.test.questions.map((q) => q.id));
  const second = (await c.post('/api/tests', { mode: 'examen' })).body.id;
  const secondIds = (await c.get(`/api/tests/${second}`)).body.questions.map((q) => q.id);
  // Quedaban 5 sin ver: las 5 tienen que salir en el segundo test.
  assert.equal(secondIds.filter((id) => !firstIds.has(id)).length, 5);

  const { rows } = await ctx.app.pool.query(
    `select option_order from test_questions tq join tests t on t.id = tq.test_id
     join users u on u.id = t.user_id where u.email = 'variada@example.com'`);
  const orders = new Set(rows.map((r) => r.option_order.join('')));
  assert.ok(orders.size > 5, 'el orden de las opciones varía');
  for (const r of rows) assert.deepEqual([...r.option_order].sort(), [0, 1, 2, 3]);
});

test('el contenido se personaliza por oposición', async () => {
  const gc = await ctx.signup('Guardia', 'gc@example.com', 'guardia-civil');
  const pl = await ctx.signup('Local', 'pl@example.com', 'policia-local');
  const temarioGc = (await gc.get('/api/temario')).body;
  const temarioPl = (await pl.get('/api/temario')).body;
  assert.deepEqual(temarioGc.bloques.map((b) => b.id), ['bloque-comun', 'bloque-gc']);
  assert.deepEqual(temarioPl.bloques.map((b) => b.id), ['bloque-comun']);
  const temas = temarioGc.bloques.flatMap((b) => b.temas);
  assert.deepEqual(temas.map((t) => [t.id, t.preguntas, t.importancia]),
    [['tema-sumas', 15, 'alta'], ['tema-restas', 15, null], ['tema-dobles', 3, 'baja']]);
  assert.ok(temas.every((t) => t.boe.startsWith('https://')));
  assert.equal((await gc.get('/api/me')).body.bankSize, 33);
  assert.equal((await pl.get('/api/me')).body.bankSize, 30);

  // A Policía Local nunca le salen las preguntas exclusivas de Guardia Civil.
  for (let i = 0; i < 2; i++) {
    const { id } = (await pl.post('/api/tests', { mode: 'estudio' })).body;
    const qs = (await pl.get(`/api/tests/${id}`)).body.questions;
    assert.ok(qs.every((q) => !q.id.startsWith('ficticia-gc-')));
  }
});

test('/api/me: racha, libro de 14 días, nivel, liga y test abierto', async () => {
  ctx.clock.set('2026-06-01T09:00:00Z');
  const c = await ctx.signup('Constante', 'constante@example.com');
  let me = (await c.get('/api/me')).body;
  assert.equal(me.streak, 0);
  assert.equal(me.activity.length, 14);
  assert.ok(me.activity.every((d) => !d.active));
  assert.equal(me.openTest, null);

  for (let day = 0; day < 3; day++) {
    if (day) ctx.clock.advanceDays(1);
    await playTest(ctx, c, 'examen', 20);
  }
  me = (await c.get('/api/me')).body;
  assert.equal(me.today, '2026-06-03');
  assert.equal(me.streak, 3);
  assert.equal(me.points, 300);
  assert.deepEqual(me.level, { level: 2, pointsInLevel: 100, pointsForNext: 200, pct: 50 });
  assert.equal(me.league.name, 'Bronce');
  assert.deepEqual(me.league.next, { name: 'Plata', from: 500 });
  assert.deepEqual(me.activity.slice(-4).map((d) => [d.day, d.active]),
    [['2026-05-31', false], ['2026-06-01', true], ['2026-06-02', true], ['2026-06-03', true]]);

  // Día siguiente sin actividad todavía: la racha se mantiene.
  ctx.clock.advanceDays(1);
  me = (await c.get('/api/me')).body;
  assert.equal(me.streak, 3);
  assert.equal(me.inactivity.days, 0);
  // Un test abierto se puede retomar desde la portada; abrirlo sin responder no es actividad.
  const open = (await c.post('/api/tests', { mode: 'estudio' })).body.id;
  me = (await c.get('/api/me')).body;
  assert.deepEqual(me.openTest, { id: open, mode: 'estudio' });
  assert.equal(me.activity.at(-1).active, false);
  // Otro día más: ayer no hubo actividad y la racha se pierde.
  ctx.clock.advanceDays(1);
  me = (await c.get('/api/me')).body;
  assert.equal(me.streak, 0);
  assert.equal(me.inactivity.days, 1);
  assert.equal(me.inactivity.factor, 1);
  assert.equal(me.points, 300, 'los puntos acumulados no se penalizan');
});
