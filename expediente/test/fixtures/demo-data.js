'use strict';
// Datos de prueba. Las preguntas son ficticias y aritméticas a propósito:
// no son contenido jurídico y nunca deben copiarse a data/.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const OPOSICIONES = ['policia-nacional', 'guardia-civil', 'policia-local'];

const temario = {
  oposiciones: [
    { id: 'policia-nacional', nombre: 'Policía Nacional' },
    { id: 'guardia-civil', nombre: 'Guardia Civil' },
    { id: 'policia-local', nombre: 'Policía Local' },
  ],
  pendiente: 'Temario ficticio de pruebas.',
  bloques: [
    {
      id: 'bloque-comun', titulo: 'Bloque ficticio común', oposiciones: OPOSICIONES,
      temas: [
        { id: 'tema-sumas', titulo: 'Tema ficticio de sumas', importancia: 'alta', boe: 'https://example.org/sumas' },
        { id: 'tema-restas', titulo: 'Tema ficticio de restas', importancia: null, boe: 'https://example.org/restas' },
      ],
    },
    {
      id: 'bloque-gc', titulo: 'Bloque ficticio de Guardia Civil', oposiciones: ['guardia-civil'],
      temas: [
        { id: 'tema-dobles', titulo: 'Tema ficticio de dobles', importancia: 'baja', boe: 'https://example.org/dobles' },
      ],
    },
  ],
};

function question(id, tema, bloque, oposiciones, enunciado, right, wrong) {
  return {
    id, oposiciones, bloque, tema, tipo: 'literal', importancia: 'media', enunciado,
    fuente: { titulo: `Fuente ficticia de ${id}`, url: `https://example.org/${id}` },
    opciones: [
      { texto: String(right), correcta: true, explicacion: `Correcta en la prueba: el resultado es ${right}.` },
      ...wrong.map((w) => ({ texto: String(w), correcta: false, explicacion: `Incorrecta en la prueba: ${w} no es el resultado.` })),
    ],
  };
}

/** `common` preguntas para las tres oposiciones y `gcOnly` solo para Guardia Civil. */
function makeQuestions({ common = 30, gcOnly = 3 } = {}) {
  const list = [];
  for (let i = 1; i <= common; i++) {
    const suma = i % 2 === 1;
    const n = 100 + i;
    list.push(suma
      ? question(`ficticia-${i}`, 'tema-sumas', 'bloque-comun', OPOSICIONES,
        `Pregunta ficticia ${i}: ¿cuánto es ${n} + 100?`, n + 100, [n + 101, n + 102, n + 103])
      : question(`ficticia-${i}`, 'tema-restas', 'bloque-comun', OPOSICIONES,
        `Pregunta ficticia ${i}: ¿cuánto es ${n + 500} - 100?`, n + 400, [n + 401, n + 402, n + 403]));
  }
  for (let i = 1; i <= gcOnly; i++) {
    const n = 200 + i;
    list.push(question(`ficticia-gc-${i}`, 'tema-dobles', 'bloque-gc', ['guardia-civil'],
      `Pregunta ficticia GC ${i}: ¿cuál es el doble de ${n}?`, n * 2, [n * 2 + 1, n * 2 + 2, n * 2 + 3]));
  }
  return list;
}

/** Escribe una carpeta de datos temporal y devuelve su ruta. */
function writeDataDir(questions = makeQuestions(), customTemario = temario) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'expediente-data-'));
  fs.writeFileSync(path.join(dir, 'oposiciones.json'), JSON.stringify(customTemario, null, 2));
  fs.writeFileSync(path.join(dir, 'questions.json'), JSON.stringify(questions, null, 2));
  return dir;
}

module.exports = { temario, makeQuestions, writeDataDir, OPOSICIONES };

if (require.main === module) console.log(writeDataDir());
