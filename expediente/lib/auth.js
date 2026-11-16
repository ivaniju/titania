'use strict';
const crypto = require('node:crypto');
const { promisify } = require('node:util');

const scrypt = promisify(crypto.scrypt);
const SCRYPT = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;

async function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const key = await scrypt(password.normalize('NFKC'), Buffer.from(salt, 'hex'), KEY_LENGTH, SCRYPT);
  return { hash: key.toString('hex'), salt };
}

async function verifyPassword(password, salt, expectedHash) {
  const { hash } = await hashPassword(password, salt);
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(expectedHash, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function newToken() {
  return crypto.randomBytes(32).toString('base64url');
}

/** Los tokens (sesión, verificación, reset) solo se guardan como HMAC con el secreto del servidor. */
function hashToken(token, secret) {
  return crypto.createHmac('sha256', secret).update(String(token)).digest('hex');
}

/** Hash corto y estable para usar un dato personal como clave sin almacenarlo. */
function opaqueKey(value, secret) {
  return hashToken(value, secret).slice(0, 32);
}

module.exports = { hashPassword, verifyPassword, newToken, hashToken, opaqueKey };
