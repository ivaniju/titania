'use strict';
// Lógica pura de negocio: fechas en Madrid, rachas, decaimiento, puntos, niveles y ligas.
// Nada de aquí toca la base de datos ni el reloj: todo recibe sus datos por parámetro.

const TZ = 'Europe/Madrid';
const EXAM_DAILY_LIMIT = 5;
const SIZES = { estudio: 25, examen: 20, 'errores-estudio': 25, 'errores-examen': 20 };
const MODES = Object.keys(SIZES);
const LEAGUES = [
  { id: 'bronce', name: 'Bronce', from: 0 },
  { id: 'plata', name: 'Plata', from: 500 },
  { id: 'oro', name: 'Oro', from: 1500 },
  { id: 'diamante', name: 'Diamante', from: 3000 },
  { id: 'leyenda', name: 'Leyenda', from: 6000 },
];
const POINTS_PER_LEVEL = 200;
const DECAY = 0.9;

const dayFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
});

/** Día de calendario en Madrid ('YYYY-MM-DD') de un instante. */
function madridDay(date) {
  return dayFormat.format(date);
}

function toUtc(day) {
  const [y, m, d] = day.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

function fromUtc(ms) {
  return new Date(ms).toISOString().slice(0, 10);
}

function addDays(day, n) {
  return fromUtc(toUtc(day) + n * 86400000);
}

/** a - b, en días de calendario. */
function diffDays(a, b) {
  return Math.round((toUtc(a) - toUtc(b)) / 86400000);
}

/** Lunes de la semana del día dado. */
function weekStart(day) {
  const dow = new Date(toUtc(day)).getUTCDay(); // 0 = domingo
  return addDays(day, -((dow + 6) % 7));
}

function monthStart(day) {
  return day.slice(0, 8) + '01';
}

/**
 * Racha: días consecutivos con actividad. Si hoy aún no hay actividad,
 * la racha se mantiene mientras ayer la hubiera.
 */
function computeStreak(activeDays, today) {
  const set = activeDays instanceof Set ? activeDays : new Set(activeDays);
  let cursor = set.has(today) ? today : addDays(today, -1);
  let streak = 0;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * Días completos sin actividad desde la última. Hoy no cuenta hasta que termina:
 * con última actividad ayer el resultado es 0.
 */
function inactiveDays(lastActiveDay, today) {
  if (!lastActiveDay) return 0;
  return Math.max(0, diffDays(today, lastActiveDay) - 1);
}

/**
 * Factor de penalización por inactividad. El primer día sin actividad es de gracia;
 * desde el segundo, cada día multiplica por 0,9.
 */
function decayFactor(lastActiveDay, today) {
  const penalized = Math.max(0, inactiveDays(lastActiveDay, today) - 1);
  return Math.pow(DECAY, penalized);
}

function applyDecay(points, lastActiveDay, today) {
  return Math.round(points * decayFactor(lastActiveDay, today));
}

/** Porcentaje de aciertos de 0 a 100. Las no respondidas ya vienen contadas como fallo. */
function examPoints(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}

function levelFor(points) {
  const level = 1 + Math.floor(points / POINTS_PER_LEVEL);
  const inLevel = points % POINTS_PER_LEVEL;
  return {
    level,
    pointsInLevel: inLevel,
    pointsForNext: POINTS_PER_LEVEL,
    pct: Math.round((inLevel / POINTS_PER_LEVEL) * 100),
  };
}

function leagueFor(points) {
  let index = 0;
  for (let i = 0; i < LEAGUES.length; i++) if (points >= LEAGUES[i].from) index = i;
  const league = LEAGUES[index];
  const next = LEAGUES[index + 1] || null;
  return {
    id: league.id,
    name: league.name,
    next: next ? { name: next.name, from: next.from } : null,
  };
}

/** Intervalo de días [from, to] de un ranking por periodo; null si el ámbito no es por periodo. */
function rangeForScope(scope, today) {
  if (scope === 'semanal') return { from: weekStart(today), to: today };
  if (scope === 'mensual') return { from: monthStart(today), to: today };
  if (scope === 'global') return { from: addDays(today, -29), to: today };
  return null;
}

/** Últimos n días terminando hoy, del más antiguo al más reciente. */
function lastDays(today, n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(today, -i));
  return out;
}

function shuffle(items, random = Math.random) {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Selección anti-repetición: primero las no vistas (al azar), después las vistas
 * empezando por las que hace más tiempo que no salen. El orden final se baraja.
 * `seen` es un Map id -> instante en que se vio por última vez.
 */
function pickQuestions(ids, seen, size, random = Math.random) {
  const unseen = shuffle(ids.filter((id) => !seen.has(id)), random);
  const old = shuffle(ids.filter((id) => seen.has(id)), random)
    .sort((a, b) => seen.get(a) - seen.get(b));
  return shuffle(unseen.concat(old).slice(0, size), random);
}

module.exports = {
  TZ, EXAM_DAILY_LIMIT, SIZES, MODES, LEAGUES, POINTS_PER_LEVEL,
  madridDay, addDays, diffDays, weekStart, monthStart, computeStreak, inactiveDays,
  decayFactor, applyDecay, examPoints, levelFor, leagueFor, rangeForScope, lastDays,
  shuffle, pickQuestions,
};
