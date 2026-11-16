'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const bank = require('../lib/bank');
const { temario, makeQuestions, writeDataDir } = require('./fixtures/demo-data');

const clone = (v) => JSON.parse(JSON.stringify(v));
const one = () => clone(makeQuestions({ common: 1, gcOnly: 0 }))[0];
const errorsOf = (questions) => bank.validateQuestions(questions, temario);

test('un banco correcto no da errores', () => {
  assert.deepEqual(errorsOf(makeQuestions()), []);
  assert.deepEqual(errorsOf([]), []);
});

test('rechaza menos o más de 4 opciones', () => {
  const few = one(); few.opciones.pop();
  assert.match(errorsOf([few])[0], /exactamente 4 opciones \(tiene 3\)/);
  const many = one(); many.opciones.push({ ...many.opciones[1], texto: 'otra' });
  assert.match(errorsOf([many])[0], /exactamente 4 opciones \(tiene 5\)/);
});

test('rechaza cero o varias correctas', () => {
  const none = one(); none.opciones[0].correcta = false;
  assert.match(errorsOf([none])[0], /exactamente una opción correcta \(tiene 0\)/);
  const two = one(); two.opciones[1].correcta = true;
  assert.match(errorsOf([two])[0], /exactamente una opción correcta \(tiene 2\)/);
});

test('rechaza explicaciones cortas o ausentes, indicando la opción', () => {
  const short = one(); short.opciones[2].explicacion = 'Porque no.';
  assert.match(errorsOf([short])[0], /"ficticia-1".*la opción 3 no tiene explicación de al menos 20 caracteres/);
  const missing = one(); delete missing.opciones[3].explicacion;
  assert.match(errorsOf([missing])[0], /la opción 4 no tiene explicación/);
});

test('rechaza preguntas sin fuente', () => {
  const noSource = one(); delete noSource.fuente;
  assert.match(errorsOf([noSource])[0], /"ficticia-1".*sin fuente/);
  const noUrl = one(); noUrl.fuente.url = 'art. 17';
  assert.match(errorsOf([noUrl])[0], /sin fuente/);
});

test('rechaza enunciados duplicados aunque cambien mayúsculas, tildes o espacios', () => {
  const [a, b] = clone(makeQuestions({ common: 2, gcOnly: 0 }));
  b.enunciado = '  PREGUNTA FICTICIA 1: ¿cuanto es   101 + 100? ';
  assert.match(errorsOf([a, b])[0], /"ficticia-2".*enunciado duplicado.*"ficticia-1"/);
});

test('rechaza ids duplicados, tipos, importancias, oposiciones y temas desconocidos', () => {
  const [a, b] = clone(makeQuestions({ common: 2, gcOnly: 0 }));
  b.id = a.id;
  assert.match(errorsOf([a, b]).join('\n'), /id duplicado/);
  const q = one();
  q.tipo = 'test'; q.importancia = 'altísima'; q.oposiciones = ['bomberos']; q.tema = 'tema-inexistente';
  const text = errorsOf([q]).join('\n');
  assert.match(text, /"tipo" debe ser uno de/);
  assert.match(text, /"importancia" debe ser una de/);
  assert.match(text, /oposición desconocida "bomberos"/);
  assert.match(text, /el tema "tema-inexistente" no existe/);
});

test('rechaza una pregunta de un bloque ajeno a su oposición', () => {
  const q = clone(makeQuestions({ common: 0, gcOnly: 1 }))[0];
  q.oposiciones = ['policia-local'];
  assert.match(errorsOf([q])[0], /no pertenece al temario de "policia-local"/);
});

test('sesgo de longitud: falla si la correcta es la más larga en más del 40%', () => {
  const questions = clone(makeQuestions({ common: 10, gcOnly: 0 }));
  for (const q of questions.slice(0, 4)) q.opciones[0].texto += ' exactamente';
  assert.deepEqual(errorsOf(questions), []); // 40% justo: permitido
  questions[4].opciones[0].texto += ' exactamente';
  assert.match(errorsOf(questions)[0], /Sesgo de longitud.*50%.*5 de 10/);
});

test('el temario exige importancia válida o null y enlace al BOE', () => {
  assert.deepEqual(bank.validateTemario(temario), []);
  const bad = clone(temario);
  bad.bloques[0].temas[0].importancia = 'muy alta';
  delete bad.bloques[0].temas[1].boe;
  const text = bank.validateTemario(bad).join('\n');
  assert.match(text, /"importancia" debe ser alta, media, baja o null/);
  assert.match(text, /"boe" debe ser un enlace/);
});

test('loadData lee questions.json y banco/*.json, y junta todos los fallos con su fichero', () => {
  const dir = writeDataDir(makeQuestions({ common: 6, gcOnly: 0 }));
  fs.mkdirSync(path.join(dir, 'banco'));
  const extra = clone(makeQuestions({ common: 8, gcOnly: 0 })).slice(6);
  fs.writeFileSync(path.join(dir, 'banco', 'lote-1.json'), JSON.stringify(extra));
  assert.equal(bank.loadData(dir).questions.length, 8);

  delete extra[0].fuente;
  extra[1].opciones[3].explicacion = '';
  fs.writeFileSync(path.join(dir, 'banco', 'lote-1.json'), JSON.stringify(extra));
  assert.throws(() => bank.loadData(dir), (err) => {
    assert.equal(err.name, 'BankError');
    assert.equal(err.errors.length, 2);
    assert.match(err.errors[0], /"ficticia-7" \(lote-1\.json\): sin fuente/);
    assert.match(err.errors[1], /"ficticia-8" \(lote-1\.json\): la opción 4 no tiene explicación/);
    return true;
  });
});

test('npm run check-bank: sale con error y mensaje claro ante un fichero inválido', () => {
  const script = path.join(__dirname, '..', 'scripts', 'check-bank.js');
  const good = spawnSync(process.execPath, [script, writeDataDir()], { encoding: 'utf8' });
  assert.equal(good.status, 0);
  assert.match(good.stdout, /Banco válido: 33 preguntas/);

  const questions = clone(makeQuestions({ common: 3, gcOnly: 0 }));
  delete questions[0].fuente;                 // sin fuente
  delete questions[1].opciones[2].explicacion; // tres explicaciones
  const bad = spawnSync(process.execPath, [script, writeDataDir(questions)], { encoding: 'utf8' });
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /Pregunta "ficticia-1" \(questions\.json\): sin fuente/);
  assert.match(bad.stderr, /Pregunta "ficticia-2" \(questions\.json\): la opción 3 no tiene explicación/);
});

test('el banco y el temario del repositorio son válidos', () => {
  const { temario: real } = bank.loadData(path.join(__dirname, '..', 'data'));
  // La importancia no se inventa: mientras nadie la valore, queda en null.
  for (const b of real.bloques) for (const t of b.temas) assert.equal(t.importancia, null);
});
