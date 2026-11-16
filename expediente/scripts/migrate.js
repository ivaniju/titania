'use strict';
// Aplica las migraciones pendientes: npm run migrate
const { createPool, migrate } = require('../lib/db');

(async () => {
  const pool = createPool({ databaseUrl: process.env.DATABASE_URL, max: 1 });
  try {
    const applied = await migrate(pool);
    console.log(applied.length ? `Migraciones aplicadas: ${applied.join(', ')}` : 'No hay migraciones pendientes.');
  } finally {
    await pool.end();
  }
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
