'use strict';
const { createApp } = require('./lib/app');
const { createLogger, errorFields } = require('./lib/log');
const { createMailer } = require('./lib/mailer');

const logger = createLogger();

async function main() {
  const env = process.env;
  const port = Number(env.PORT) || 3000;
  const production = env.NODE_ENV === 'production';
  const publicDomain = env.RAILWAY_PUBLIC_DOMAIN ? `https://${env.RAILWAY_PUBLIC_DOMAIN}` : null;
  const app = await createApp({
    databaseUrl: env.DATABASE_URL,
    dataDir: env.DATA_DIR || undefined,
    sessionSecret: env.SESSION_SECRET,
    appUrl: (env.APP_URL || publicDomain || `http://localhost:${port}`).replace(/\/$/, ''),
    // Secure siempre, salvo que se desactive a propósito para desarrollar sin HTTPS.
    cookieSecure: env.COOKIE_SECURE !== 'false',
    trustProxy: env.TRUST_PROXY ? env.TRUST_PROXY === '1' : production,
    mailer: createMailer(env),
    logger,
  });
  app.server.listen(port, '0.0.0.0', () => {
    logger.info('listening', { port, questions: app.questionCount });
  });

  let closing = false;
  const shutdown = (signal) => {
    if (closing) return;
    closing = true;
    logger.info('shutdown', { signal });
    app.close().then(() => process.exit(0), () => process.exit(1));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

main().catch((err) => {
  // Los errores de arranque (banco inválido, falta de variables) se explican enteros.
  logger.error('startup_failed', err.name === 'BankError' ? { error: err.message } : errorFields(err));
  process.exit(1);
});
