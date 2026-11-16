'use strict';
// Interfaz Mailer: { name, send({ to, subject, text }) -> Promise }.
// El adaptador se elige con MAIL_PROVIDER.

/** Desarrollo: escribe el correo en la salida estándar. Expone enlaces con token, no usar en producción. */
function consoleMailer({ from, stream = process.stdout } = {}) {
  return {
    name: 'console',
    async send({ to, subject, text }) {
      stream.write(`\n--- correo (adaptador de consola) ---\nDe: ${from}\nPara: ${to}\nAsunto: ${subject}\n\n${text}\n---\n`);
    },
  };
}

/** Pruebas: guarda los correos en memoria. */
function memoryMailer() {
  const sent = [];
  return {
    name: 'memory',
    sent,
    async send(message) { sent.push(message); },
  };
}

/** Resend (https://resend.com) por su API HTTP, sin SDK. Requiere RESEND_API_KEY. */
function resendMailer({ from, apiKey }) {
  if (!apiKey) throw new Error('MAIL_PROVIDER=resend necesita RESEND_API_KEY');
  return {
    name: 'resend',
    async send({ to, subject, text }) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        body: JSON.stringify({ from, to: [to], subject, text }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`El proveedor de correo respondió ${res.status}`);
    },
  };
}

function createMailer(env = process.env) {
  const provider = env.MAIL_PROVIDER || 'console';
  const from = env.MAIL_FROM || 'Expediente <no-reply@localhost>';
  if (provider === 'console') {
    if (env.NODE_ENV === 'production' && env.ALLOW_CONSOLE_MAIL !== '1') {
      throw new Error('MAIL_PROVIDER=console escribe enlaces con token en los logs. ' +
        'Configura un proveedor real o, solo para pruebas, ALLOW_CONSOLE_MAIL=1.');
    }
    return consoleMailer({ from });
  }
  if (provider === 'resend') return resendMailer({ from, apiKey: env.RESEND_API_KEY });
  throw new Error(`MAIL_PROVIDER desconocido: ${provider}`);
}

module.exports = { createMailer, consoleMailer, memoryMailer, resendMailer };
