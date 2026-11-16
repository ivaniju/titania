'use strict';
// Cargador del banco de preguntas y del temario: lee ficheros revisables,
// valida las reglas y solo entonces importa a la base de datos.
const fs = require('node:fs');
const path = require('node:path');

const TIPOS = ['literal', 'interpretativa', 'caso_practico', 'trampa'];
const IMPORTANCIAS = ['alta', 'media', 'baja'];
const MIN_EXPLICACION = 20;
const MAX_SESGO = 0.4;       // la correcta puede ser la opción más larga en el 40% como mucho
const MIN_PARA_SESGO = 5;    // con menos preguntas el porcentaje no significa nada

class BankError extends Error {
  constructor(errors) {
    super(`El banco no es válido:\n- ${errors.join('\n- ')}`);
    this.name = 'BankError';
    this.errors = errors;
  }
}

const isText = (v) => typeof v === 'string' && v.trim().length > 0;

function isHttpUrl(value) {
  try {
    return ['https:', 'http:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Forma canónica de un enunciado para detectar duplicados. */
function normalize(text) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').trim();
}

function readJson(file) {
  let raw;
  try {
    raw = fs.readFileSync(file, 'utf8');
  } catch {
    throw new BankError([`No se puede leer ${file}`]);
  }
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new BankError([`${path.basename(file)}: JSON mal formado (${err.message})`]);
  }
}

/** Valida data/oposiciones.json. Devuelve la lista de errores (vacía si es válido). */
function validateTemario(temario) {
  const errors = [];
  if (!temario || !Array.isArray(temario.oposiciones) || !Array.isArray(temario.bloques)) {
    return ['oposiciones.json: debe tener las listas "oposiciones" y "bloques"'];
  }
  const opoIds = new Set();
  for (const o of temario.oposiciones) {
    if (!isText(o.id) || !isText(o.nombre)) errors.push('oposiciones.json: cada oposición necesita "id" y "nombre"');
    else if (opoIds.has(o.id)) errors.push(`oposiciones.json: oposición duplicada "${o.id}"`);
    else opoIds.add(o.id);
  }
  const ids = new Set();
  for (const b of temario.bloques) {
    const where = `oposiciones.json, bloque "${b && b.id}"`;
    if (!isText(b.id) || !isText(b.titulo)) { errors.push(`${where}: necesita "id" y "titulo"`); continue; }
    if (ids.has(b.id)) errors.push(`${where}: id duplicado`);
    ids.add(b.id);
    if (!Array.isArray(b.oposiciones) || b.oposiciones.length === 0) errors.push(`${where}: "oposiciones" vacío`);
    else for (const o of b.oposiciones) if (!opoIds.has(o)) errors.push(`${where}: oposición desconocida "${o}"`);
    if (!Array.isArray(b.temas)) { errors.push(`${where}: falta la lista "temas"`); continue; }
    for (const t of b.temas) {
      const w = `${where}, tema "${t && t.id}"`;
      if (!isText(t.id) || !isText(t.titulo)) { errors.push(`${w}: necesita "id" y "titulo"`); continue; }
      if (ids.has(t.id)) errors.push(`${w}: id duplicado`);
      ids.add(t.id);
      if (t.importancia !== null && !IMPORTANCIAS.includes(t.importancia)) {
        errors.push(`${w}: "importancia" debe ser alta, media, baja o null (sin valorar)`);
      }
      if (!isHttpUrl(t.boe)) errors.push(`${w}: "boe" debe ser un enlace http(s) a la norma`);
    }
  }
  return errors;
}

/** Valida la lista de preguntas contra las reglas del banco y, si se da, contra el temario. */
function validateQuestions(questions, temario) {
  const errors = [];
  if (!Array.isArray(questions)) return ['El banco debe ser una lista de preguntas'];
  const opoIds = temario ? new Set(temario.oposiciones.map((o) => o.id)) : null;
  const bloques = temario ? new Map(temario.bloques.map((b) => [b.id, b])) : null;
  const seenIds = new Set();
  const seenEnunciados = new Map();
  let longestCorrect = 0;
  let measurable = 0;

  questions.forEach((q, index) => {
    const where = `Pregunta ${isText(q && q.id) ? `"${q.id}"` : `nº ${index + 1}`}${q && q.__file ? ` (${q.__file})` : ''}`;
    const fail = (msg) => errors.push(`${where}: ${msg}`);
    if (!q || typeof q !== 'object') return fail('no es un objeto');

    if (!isText(q.id)) fail('falta "id"');
    else if (seenIds.has(q.id)) fail('id duplicado');
    else seenIds.add(q.id);

    if (!Array.isArray(q.oposiciones) || q.oposiciones.length === 0) fail('"oposiciones" debe ser una lista no vacía');
    else if (opoIds) for (const o of q.oposiciones) if (!opoIds.has(o)) fail(`oposición desconocida "${o}"`);

    if (!isText(q.bloque)) fail('falta "bloque"');
    if (!isText(q.tema)) fail('falta "tema"');
    if (bloques && isText(q.bloque) && isText(q.tema)) {
      const bloque = bloques.get(q.bloque);
      if (!bloque) fail(`el bloque "${q.bloque}" no existe en el temario`);
      else {
        if (!bloque.temas.some((t) => t.id === q.tema)) fail(`el tema "${q.tema}" no existe en el bloque "${q.bloque}"`);
        if (Array.isArray(q.oposiciones)) {
          for (const o of q.oposiciones) {
            if (opoIds.has(o) && !bloque.oposiciones.includes(o)) fail(`el bloque "${q.bloque}" no pertenece al temario de "${o}"`);
          }
        }
      }
    }

    if (!TIPOS.includes(q.tipo)) fail(`"tipo" debe ser uno de: ${TIPOS.join(', ')}`);
    if (!IMPORTANCIAS.includes(q.importancia)) fail(`"importancia" debe ser una de: ${IMPORTANCIAS.join(', ')}`);

    if (!isText(q.enunciado)) fail('falta "enunciado"');
    else {
      const key = normalize(q.enunciado);
      if (seenEnunciados.has(key)) fail(`enunciado duplicado (ya está en "${seenEnunciados.get(key)}")`);
      else seenEnunciados.set(key, q.id);
    }

    if (!q.fuente || !isText(q.fuente.titulo) || !isHttpUrl(q.fuente.url)) {
      fail('sin fuente: "fuente" necesita "titulo" (artículo o norma) y "url" (enlace http(s))');
    }

    if (!Array.isArray(q.opciones) || q.opciones.length !== 4) {
      fail(`debe tener exactamente 4 opciones (tiene ${Array.isArray(q.opciones) ? q.opciones.length : 0})`);
      return;
    }
    let shape = true;
    const textos = new Set();
    q.opciones.forEach((o, i) => {
      const n = i + 1;
      if (!o || !isText(o.texto)) { fail(`la opción ${n} no tiene "texto"`); shape = false; return; }
      if (typeof o.correcta !== 'boolean') { fail(`la opción ${n} necesita "correcta" (true o false)`); shape = false; }
      if (typeof o.explicacion !== 'string' || o.explicacion.trim().length < MIN_EXPLICACION) {
        fail(`la opción ${n} no tiene explicación de al menos ${MIN_EXPLICACION} caracteres`);
      }
      const t = normalize(o.texto);
      if (textos.has(t)) fail(`la opción ${n} repite el texto de otra opción`);
      textos.add(t);
    });
    if (!shape) return;
    const correctas = q.opciones.filter((o) => o.correcta === true);
    if (correctas.length !== 1) { fail(`debe tener exactamente una opción correcta (tiene ${correctas.length})`); return; }

    measurable += 1;
    const len = (o) => o.texto.trim().length;
    const correcta = correctas[0];
    if (q.opciones.every((o) => o === correcta || len(o) < len(correcta))) longestCorrect += 1;
  });

  if (measurable >= MIN_PARA_SESGO && longestCorrect / measurable > MAX_SESGO) {
    const pct = Math.round((longestCorrect / measurable) * 100);
    errors.push(`Sesgo de longitud: la opción correcta es la más larga en el ${pct}% de las preguntas ` +
      `(${longestCorrect} de ${measurable}); el máximo es el ${MAX_SESGO * 100}%`);
  }
  return errors;
}

/** Ficheros del banco: data/questions.json y, opcionalmente, data/banco/*.json. */
function bankFiles(dataDir) {
  const files = [];
  const main = path.join(dataDir, 'questions.json');
  if (fs.existsSync(main)) files.push(main);
  const dir = path.join(dataDir, 'banco');
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) files.push(path.join(dir, f));
  }
  return files;
}

/**
 * Lee y valida temario y banco. Lanza BankError con todos los fallos encontrados.
 * Devuelve { temario, questions } listos para importar.
 */
function loadData(dataDir) {
  const temario = readJson(path.join(dataDir, 'oposiciones.json'));
  const temarioErrors = validateTemario(temario);
  if (temarioErrors.length) throw new BankError(temarioErrors);

  const tagged = [];
  for (const file of bankFiles(dataDir)) {
    const list = readJson(file);
    if (!Array.isArray(list)) throw new BankError([`${path.basename(file)}: debe contener una lista de preguntas`]);
    for (const q of list) {
      tagged.push(q && typeof q === 'object' ? { ...q, __file: path.basename(file) } : q);
    }
  }
  const errors = validateQuestions(tagged, temario);
  if (errors.length) throw new BankError(errors);
  const questions = tagged.map(({ __file, ...q }) => q);
  return { temario, questions };
}

/**
 * Importa preguntas ya validadas. Las que no vengan en la lista quedan inactivas.
 * Devuelve el banco completo (activas e inactivas) como Map id -> { data, active }.
 */
async function importQuestions(db, questions, now) {
  const ids = questions.map((q) => q.id);
  if (questions.length) {
    await db.query(
      `insert into questions (id, data, active, updated_at)
       select q->>'id', q, true, $2 from jsonb_array_elements($1::jsonb) q
       on conflict (id) do update set data = excluded.data, active = true, updated_at = excluded.updated_at
       where questions.data is distinct from excluded.data or not questions.active`,
      [JSON.stringify(questions), now]);
  }
  await db.query('update questions set active = false, updated_at = $2 where active and not (id = any($1))', [ids, now]);
  const { rows } = await db.query('select id, data, active from questions');
  return new Map(rows.map((r) => [r.id, { data: r.data, active: r.active }]));
}

module.exports = {
  BankError, TIPOS, IMPORTANCIAS, validateTemario, validateQuestions, loadData, importQuestions, bankFiles,
};
