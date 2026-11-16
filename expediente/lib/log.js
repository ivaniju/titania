'use strict';
// Logs estructurados: una línea JSON por evento. Quien llama decide los campos,
// y aquí nunca deben llegar emails, contraseñas, tokens ni cuerpos de petición.

function createLogger({ stream = process.stdout, silent = false } = {}) {
  function write(level, msg, fields) {
    if (silent) return;
    stream.write(JSON.stringify({ ts: new Date().toISOString(), level, msg, ...fields }) + '\n');
  }
  return {
    info: (msg, fields) => write('info', msg, fields),
    warn: (msg, fields) => write('warn', msg, fields),
    error: (msg, fields) => write('error', msg, fields),
  };
}

/** Reduce un error a campos seguros (los `detail` de Postgres pueden contener datos). */
function errorFields(err) {
  return { error: err && err.message, code: err && err.code, stack: err && err.stack };
}

module.exports = { createLogger, errorFields };
