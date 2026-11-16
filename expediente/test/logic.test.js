'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../lib/logic');

test('madridDay usa el calendario de Madrid, no UTC', () => {
  // Invierno (UTC+1): las 23:30 UTC ya son el día siguiente en Madrid.
  assert.equal(L.madridDay(new Date('2026-01-15T22:59:00Z')), '2026-01-15');
  assert.equal(L.madridDay(new Date('2026-01-15T23:00:00Z')), '2026-01-16');
  // Verano (UTC+2): el cambio de día llega a las 22:00 UTC.
  assert.equal(L.madridDay(new Date('2026-07-15T21:59:00Z')), '2026-07-15');
  assert.equal(L.madridDay(new Date('2026-07-15T22:00:00Z')), '2026-07-16');
  // Cambio de hora de marzo de 2026 (día 29).
  assert.equal(L.madridDay(new Date('2026-03-28T23:30:00Z')), '2026-03-29');
  assert.equal(L.madridDay(new Date('2026-03-29T21:59:00Z')), '2026-03-29');
  assert.equal(L.madridDay(new Date('2026-03-29T22:00:00Z')), '2026-03-30');
});

test('aritmética de días, semanas y meses', () => {
  assert.equal(L.addDays('2026-02-28', 1), '2026-03-01');
  assert.equal(L.addDays('2026-01-01', -1), '2025-12-31');
  assert.equal(L.diffDays('2026-03-30', '2026-03-28'), 2); // atraviesa el cambio de hora
  assert.equal(L.weekStart('2026-03-10'), '2026-03-09'); // martes -> lunes
  assert.equal(L.weekStart('2026-03-09'), '2026-03-09'); // lunes
  assert.equal(L.weekStart('2026-03-15'), '2026-03-09'); // domingo
  assert.equal(L.monthStart('2026-03-31'), '2026-03-01');
  assert.deepEqual(L.lastDays('2026-03-02', 3), ['2026-02-28', '2026-03-01', '2026-03-02']);
});

test('rachas: días consecutivos, y hoy sin actividad no la rompe', () => {
  const today = '2026-03-10';
  assert.equal(L.computeStreak([], today), 0);
  assert.equal(L.computeStreak(['2026-03-10'], today), 1);
  assert.equal(L.computeStreak(['2026-03-08', '2026-03-09', '2026-03-10'], today), 3);
  // Hoy aún sin actividad: se mantiene mientras ayer la hubiera.
  assert.equal(L.computeStreak(['2026-03-08', '2026-03-09'], today), 2);
  // Ayer sin actividad: racha rota.
  assert.equal(L.computeStreak(['2026-03-07', '2026-03-08'], today), 0);
  // Un hueco corta la cuenta.
  assert.equal(L.computeStreak(['2026-03-06', '2026-03-08', '2026-03-09', '2026-03-10'], today), 3);
});

test('decaimiento: un día de gracia y 0,9 por cada día desde el segundo', () => {
  const today = '2026-03-10';
  assert.equal(L.decayFactor(null, today), 1);
  assert.equal(L.decayFactor('2026-03-10', today), 1); // activo hoy
  assert.equal(L.decayFactor('2026-03-09', today), 1); // activo ayer: ningún día perdido
  assert.equal(L.decayFactor('2026-03-08', today), 1); // un día sin actividad: gracia
  assert.equal(L.decayFactor('2026-03-07', today), 0.9); // segundo día
  assert.ok(Math.abs(L.decayFactor('2026-03-06', today) - 0.81) < 1e-9);
  assert.equal(L.inactiveDays('2026-03-07', today), 2);
  assert.equal(L.applyDecay(100, '2026-03-06', today), 81);
  assert.equal(L.applyDecay(100, '2026-03-09', today), 100);
});

test('puntos de examen: porcentaje de aciertos de 0 a 100', () => {
  assert.equal(L.examPoints(0, 20), 0);
  assert.equal(L.examPoints(20, 20), 100);
  assert.equal(L.examPoints(17, 20), 85);
  assert.equal(L.examPoints(1, 3), 33);
  assert.equal(L.examPoints(0, 0), 0);
});

test('niveles: 1 + floor(puntos / 200)', () => {
  assert.equal(L.levelFor(0).level, 1);
  assert.equal(L.levelFor(199).level, 1);
  assert.equal(L.levelFor(200).level, 2);
  assert.deepEqual(L.levelFor(450), { level: 3, pointsInLevel: 50, pointsForNext: 200, pct: 25 });
});

test('ligas por puntos acumulados', () => {
  const league = (p) => L.leagueFor(p).name;
  assert.equal(league(0), 'Bronce');
  assert.equal(league(499), 'Bronce');
  assert.equal(league(500), 'Plata');
  assert.equal(league(1499), 'Plata');
  assert.equal(league(1500), 'Oro');
  assert.equal(league(3000), 'Diamante');
  assert.equal(league(5999), 'Diamante');
  assert.equal(league(6000), 'Leyenda');
  assert.deepEqual(L.leagueFor(600).next, { name: 'Oro', from: 1500 });
  assert.equal(L.leagueFor(9000).next, null);
});

test('intervalos de los rankings por periodo', () => {
  const today = '2026-03-12'; // jueves
  assert.deepEqual(L.rangeForScope('semanal', today), { from: '2026-03-09', to: today });
  assert.deepEqual(L.rangeForScope('mensual', today), { from: '2026-03-01', to: today });
  assert.deepEqual(L.rangeForScope('global', today), { from: '2026-02-11', to: today });
  assert.equal(L.rangeForScope('historico', today), null);
  assert.equal(L.rangeForScope('oposicion', today), null);
});

test('selección anti-repetición: primero las no vistas, luego las más antiguas', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  const seen = new Map([['a', 300], ['b', 100], ['c', 200]]);
  for (let i = 0; i < 20; i++) {
    assert.deepEqual(L.pickQuestions(ids, seen, 3).sort(), ['d', 'e', 'f']);
    assert.deepEqual(L.pickQuestions(ids, seen, 4).sort(), ['b', 'd', 'e', 'f']);
    assert.deepEqual(L.pickQuestions(ids, seen, 5).sort(), ['b', 'c', 'd', 'e', 'f']);
  }
  assert.equal(L.pickQuestions(ids, seen, 25).length, 6);
});

test('shuffle conserva los elementos', () => {
  assert.deepEqual(L.shuffle([0, 1, 2, 3]).sort(), [0, 1, 2, 3]);
});
