'use strict';
const fs = require('node:fs');
const path = require('node:path');
const pg = require('pg');

// Las columnas `date` se manejan como texto 'YYYY-MM-DD': son días de calendario
// de Madrid, no instantes, y convertirlas a Date las desplazaría según la zona.
pg.types.setTypeParser(1082, (value) => value);

const MIGRATIONS_DIR = path.join(__dirname, '..', 'migrations');

function createPool({ databaseUrl, schema, max = 10 }) {
  if (!databaseUrl) throw new Error('Falta DATABASE_URL');
  if (schema && !/^[a-z_][a-z0-9_]*$/.test(schema)) throw new Error('Nombre de esquema no válido');
  const config = { connectionString: databaseUrl, max };
  if (schema) config.options = `-c search_path=${schema}`;
  if (process.env.PGSSL === 'require') config.ssl = { rejectUnauthorized: false };
  return new pg.Pool(config);
}

async function withTx(pool, fn) {
  const client = await pool.connect();
  try {
    await client.query('begin');
    const result = await fn(client);
    await client.query('commit');
    return result;
  } catch (err) {
    await client.query('rollback').catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Aplica en orden los ficheros SQL numerados de migrations/ que falten.
 * Cada migración va en su transacción y un bloqueo consultivo impide que
 * dos instancias migren a la vez.
 */
async function migrate(pool, { schema, dir = MIGRATIONS_DIR } = {}) {
  const client = await pool.connect();
  const applied = [];
  try {
    if (schema) await client.query(`create schema if not exists ${schema}`);
    await client.query('select pg_advisory_lock(727001)');
    await client.query(`create table if not exists schema_migrations (
      name text primary key, applied_at timestamptz not null default now())`);
    const done = new Set((await client.query('select name from schema_migrations')).rows.map((r) => r.name));
    const files = fs.readdirSync(dir).filter((f) => /^\d+_.+\.sql$/.test(f)).sort();
    for (const file of files) {
      if (done.has(file)) continue;
      const sql = fs.readFileSync(path.join(dir, file), 'utf8');
      try {
        await client.query('begin');
        await client.query(sql);
        await client.query('insert into schema_migrations (name) values ($1)', [file]);
        await client.query('commit');
      } catch (err) {
        await client.query('rollback').catch(() => {});
        throw new Error(`La migración ${file} ha fallado: ${err.message}`);
      }
      applied.push(file);
    }
  } finally {
    await client.query('select pg_advisory_unlock(727001)').catch(() => {});
    client.release();
  }
  return applied;
}

module.exports = { createPool, withTx, migrate };
