'use strict';
// Valida temario y banco sin tocar la base de datos: npm run check-bank [carpeta]
const path = require('node:path');
const { loadData, bankFiles } = require('../lib/bank');

const dataDir = path.resolve(process.argv[2] || process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
try {
  const { temario, questions } = loadData(dataDir);
  const temas = temario.bloques.reduce((n, b) => n + b.temas.length, 0);
  console.log(`Banco válido: ${questions.length} preguntas en ${bankFiles(dataDir).length} fichero(s); ` +
    `temario con ${temario.bloques.length} bloques y ${temas} temas.`);
  if (!questions.length) console.log('Aviso: el banco está vacío. Consulta el README para añadir preguntas revisadas.');
} catch (err) {
  console.error(err.name === 'BankError' ? err.message : err);
  process.exit(1);
}
