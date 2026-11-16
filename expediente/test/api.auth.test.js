'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { startApp } = require('./helpers');

let ctx;
test.before(async () => { ctx = await startApp(); });
test.after(async () => { await ctx.close(); });
// Cada prueba empieza una hora después: así los límites por IP de una no afectan a la siguiente.
test.beforeEach(() => ctx.clock.advance(3600000));

const PASSWORD = 'contraseña-segura';
const reg = (c, email, extra = {}) => c.post('/api/register', {
  name: 'Ana Prueba', email, password: PASSWORD, oposicion: 'guardia-civil', ...extra });

test('GET /api/oposiciones es pública', async () => {
  const res = await ctx.client().get('/api/oposiciones');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body.oposiciones.map((o) => o.id), ['policia-nacional', 'guardia-civil', 'policia-local']);
});

test('GET /healthz comprueba la base de datos', async () => {
  const res = await ctx.client().get('/healthz');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, { ok: true });
});

test('el registro queda pendiente hasta confirmar el email', async () => {
  const c = ctx.client();
  const res = await reg(c, 'Pendiente@Example.com');
  assert.equal(res.status, 201);
  assert.equal(res.setCookie, null, 'registrarse no abre sesión');
  const mail = ctx.lastMailTo('pendiente@example.com');
  assert.ok(mail, 'el email se guarda en minúsculas y recibe el correo');
  assert.match(mail.text, /http:\/\/expediente\.test\/#\/verificar\?token=/);

  // Con la contraseña correcta pero sin confirmar no se entra, y se reenvía el enlace.
  const before = ctx.mailer.sent.length;
  const login = await c.post('/api/login', { email: 'pendiente@example.com', password: PASSWORD });
  assert.equal(login.status, 409);
  assert.equal(login.setCookie, null);
  assert.equal(ctx.mailer.sent.length, before + 1);
  assert.equal((await c.get('/api/me')).status, 401);

  // El enlace antiguo ya no vale: solo sirve el último.
  assert.equal((await c.post('/api/verify-email', { token: ctx.tokenFrom(mail) })).status, 400);
  const token = ctx.tokenFrom(ctx.lastMailTo('pendiente@example.com'));
  assert.equal((await c.post('/api/verify-email', { token })).status, 200);
  // Un solo uso.
  assert.equal((await c.post('/api/verify-email', { token })).status, 400);

  const ok = await c.post('/api/login', { email: 'PENDIENTE@example.com ', password: PASSWORD });
  assert.equal(ok.status, 200);
  const me = await c.get('/api/me');
  assert.equal(me.status, 200);
  assert.equal(me.body.user.name, 'Ana Prueba');
  assert.equal(me.body.user.oposicion, 'guardia-civil');
});

test('el token de verificación caduca a las 24 h', async () => {
  const c = ctx.client();
  await reg(c, 'caduca@example.com');
  const token = ctx.tokenFrom(ctx.lastMailTo('caduca@example.com'));
  ctx.clock.advance(24 * 3600000 + 1000);
  const res = await c.post('/api/verify-email', { token });
  assert.equal(res.status, 400);
  assert.match(res.body.error, /no es válido o ha caducado/);
  assert.equal((await c.post('/api/verify-email', { token: 'inventado' })).status, 400);
  assert.equal((await c.post('/api/verify-email', {})).status, 400);
});

test('validación del registro: 422 con mensaje en español', async () => {
  const c = ctx.client();
  for (const [extra, pattern] of [
    [{ name: 'A' }, /nombre/],
    [{ password: 'corta' }, /contraseña/],
    [{ oposicion: 'bomberos' }, /oposición/],
  ]) {
    const res = await reg(c, 'valida@example.com', extra);
    assert.equal(res.status, 422);
    assert.match(res.body.error, pattern);
  }
  const res = await reg(c, 'no-es-un-email');
  assert.equal(res.status, 422);
  assert.match(res.body.error, /email/);
});

test('registrar un email que ya existe responde igual y no cambia la cuenta', async () => {
  await ctx.signup('Titular', 'titular@example.com');
  const before = ctx.mailer.sent.length;
  const c = ctx.client();
  const res = await reg(c, 'titular@example.com', { password: 'otra-contraseña-distinta', name: 'Intruso' });
  const fresh = await reg(ctx.client(), 'nuevo-de-verdad@example.com');
  assert.equal(res.status, 201);
  assert.deepEqual(res.body, fresh.body, 'misma respuesta exista o no la cuenta');
  assert.equal(ctx.mailer.sent[before].to, 'titular@example.com');
  assert.match(ctx.mailer.sent[before].subject, /Ya tienes cuenta/);
  assert.doesNotMatch(ctx.mailer.sent[before].text, /token=/);
  assert.equal((await c.post('/api/login', { email: 'titular@example.com', password: 'otra-contraseña-distinta' })).status, 401);
  assert.equal((await c.post('/api/login', { email: 'titular@example.com', password: PASSWORD })).status, 200);
});

test('recuperación: no revela si el email existe', async () => {
  await ctx.signup('Existe', 'existe@example.com');
  const before = ctx.mailer.sent.length;
  const yes = await ctx.client().post('/api/password/forgot', { email: 'existe@example.com' });
  const no = await ctx.client().post('/api/password/forgot', { email: 'no-existe@example.com' });
  assert.equal(yes.status, 200);
  assert.equal(no.status, 200);
  assert.deepEqual(yes.body, no.body);
  assert.equal(ctx.mailer.sent.length, before + 1);
  assert.equal(ctx.mailer.sent[before].to, 'existe@example.com');
});

test('reset: token de un solo uso, cambia la contraseña y cierra las sesiones', async () => {
  const c = await ctx.signup('Olvido', 'olvido@example.com');
  assert.equal((await c.get('/api/me')).status, 200);
  await c.post('/api/password/forgot', { email: 'olvido@example.com' });
  const token = ctx.tokenFrom(ctx.lastMailTo('olvido@example.com'));
  assert.match(ctx.lastMailTo('olvido@example.com').text, /#\/restablecer\?token=/);

  const weak = await c.post('/api/password/reset', { token, password: 'corta' });
  assert.equal(weak.status, 422);
  const res = await c.post('/api/password/reset', { token, password: 'nueva-contraseña-1' });
  assert.equal(res.status, 200);
  assert.equal((await c.get('/api/me')).status, 401, 'las sesiones anteriores quedan cerradas');

  // Reutilizar el token falla y no vuelve a cambiar nada.
  const again = await c.post('/api/password/reset', { token, password: 'otra-contraseña-2' });
  assert.equal(again.status, 400);
  assert.equal((await c.post('/api/login', { email: 'olvido@example.com', password: PASSWORD })).status, 401);
  assert.equal((await c.post('/api/login', { email: 'olvido@example.com', password: 'otra-contraseña-2' })).status, 401);
  assert.equal((await c.post('/api/login', { email: 'olvido@example.com', password: 'nueva-contraseña-1' })).status, 200);
});

test('el token de reset caduca a la hora y no sirve para verificar', async () => {
  const c = await ctx.signup('Tarde', 'tarde@example.com');
  await c.post('/api/password/forgot', { email: 'tarde@example.com' });
  const token = ctx.tokenFrom(ctx.lastMailTo('tarde@example.com'));
  assert.equal((await c.post('/api/verify-email', { token })).status, 400, 'los tokens no se cruzan de propósito');
  ctx.clock.advance(3600000 + 1000);
  assert.equal((await c.post('/api/password/reset', { token, password: 'nueva-contraseña-1' })).status, 400);
  assert.equal((await c.post('/api/login', { email: 'tarde@example.com', password: PASSWORD })).status, 200);
});

test('los tokens y contraseñas solo se guardan como hash', async () => {
  const c = ctx.client();
  await reg(c, 'hash@example.com');
  const token = ctx.tokenFrom(ctx.lastMailTo('hash@example.com'));
  const tokens = await ctx.app.pool.query('select token_hash from email_tokens');
  assert.ok(tokens.rows.every((r) => r.token_hash !== token && /^[0-9a-f]{64}$/.test(r.token_hash)));
  const users = await ctx.app.pool.query("select password_hash, salt from users where email = 'hash@example.com'");
  assert.notEqual(users.rows[0].password_hash, PASSWORD);
  assert.match(users.rows[0].salt, /^[0-9a-f]{32}$/);
  const salts = await ctx.app.pool.query('select count(distinct salt)::int as d, count(*)::int as n from users');
  assert.equal(salts.rows[0].d, salts.rows[0].n, 'sal única por usuario');
});

test('cookie de sesión HttpOnly, Secure y SameSite=Lax; logout la invalida', async () => {
  const c = await ctx.signup('Galleta', 'galleta@example.com');
  const login = await c.post('/api/login', { email: 'galleta@example.com', password: PASSWORD });
  assert.match(login.setCookie, /^expediente_sid=[\w-]+; Path=\/; HttpOnly; SameSite=Lax; Max-Age=\d+; Secure$/);
  const value = c.cookie;
  const stored = await ctx.app.pool.query('select token_hash from sessions');
  assert.ok(stored.rows.every((r) => !value.includes(r.token_hash)), 'en la base de datos solo está el hash');

  assert.equal((await c.post('/api/logout')).status, 200);
  const stale = ctx.client();
  stale.setCookie(value);
  assert.equal((await stale.get('/api/me')).status, 401);
});

test('la sesión caduca a los 30 días', async () => {
  const c = await ctx.signup('Larga', 'larga@example.com');
  ctx.clock.advanceDays(29);
  assert.equal((await c.get('/api/me')).status, 200);
  ctx.clock.advanceDays(2);
  assert.equal((await c.get('/api/me')).status, 401);
});

test('límite de login: 5 fallos en 15 minutos por email', async () => {
  await ctx.signup('Limite', 'limite@example.com');
  for (let i = 0; i < 5; i++) {
    // Cada intento llega desde una IP distinta: el bloqueo es por email.
    const res = await ctx.client().post('/api/login', { email: 'limite@example.com', password: 'mala' },
      { 'x-forwarded-for': `10.0.0.${i}` });
    assert.equal(res.status, 401);
  }
  const blocked = await ctx.client().post('/api/login', { email: 'limite@example.com', password: PASSWORD });
  assert.equal(blocked.status, 429, 'ni con la contraseña correcta');
  assert.match(blocked.body.error, /Demasiados intentos/);
  ctx.clock.advance(15 * 60000 + 1000);
  assert.equal((await ctx.client().post('/api/login', { email: 'limite@example.com', password: PASSWORD })).status, 200);
});

test('límite de login: 5 fallos en 15 minutos por IP, con emails distintos', async () => {
  await ctx.signup('Vecino', 'vecino@example.com');
  for (let i = 0; i < 5; i++) {
    const res = await ctx.client().post('/api/login', { email: `nadie${i}@example.com`, password: 'mala' });
    assert.equal(res.status, 401);
    assert.equal(res.body.error, 'Email o contraseña incorrectos.');
  }
  const blocked = await ctx.client().post('/api/login', { email: 'vecino@example.com', password: PASSWORD });
  assert.equal(blocked.status, 429);
  ctx.clock.advance(15 * 60000 + 1000);
  assert.equal((await ctx.client().post('/api/login', { email: 'vecino@example.com', password: PASSWORD })).status, 200);
});

test('un login correcto pone a cero los fallos del email', async () => {
  await ctx.signup('Reinicio', 'reinicio@example.com');
  const attempt = (password, ip) => ctx.client().post('/api/login',
    { email: 'reinicio@example.com', password }, { 'x-forwarded-for': ip });
  for (let i = 0; i < 4; i++) assert.equal((await attempt('mala', `10.1.0.${i}`)).status, 401);
  assert.equal((await attempt(PASSWORD, '10.1.0.9')).status, 200);
  for (let i = 0; i < 4; i++) assert.equal((await attempt('mala', `10.1.1.${i}`)).status, 401);
  assert.equal((await attempt(PASSWORD, '10.1.1.9')).status, 200);
});

test('cabeceras de seguridad e ID de petición en API y estáticos', async () => {
  for (const path of ['/', '/api/oposiciones', '/styles.css', '/api/no-existe']) {
    const res = await ctx.client().get(path);
    const csp = res.headers.get('content-security-policy');
    assert.match(csp, /default-src 'self'/);
    assert.match(csp, /frame-ancestors 'none'/);
    assert.doesNotMatch(csp, /unsafe-inline|unsafe-eval/);
    assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(res.headers.get('referrer-policy'), 'no-referrer');
    assert.match(res.headers.get('x-request-id'), /^[0-9a-f-]{36}$/);
  }
  const a = await ctx.client().get('/api/oposiciones');
  const b = await ctx.client().get('/api/oposiciones');
  assert.notEqual(a.headers.get('x-request-id'), b.headers.get('x-request-id'));
});

test('errores en JSON y defensa CSRF en los POST', async () => {
  const c = ctx.client();
  const missing = await c.get('/api/no-existe');
  assert.equal(missing.status, 404);
  assert.equal(typeof missing.body.error, 'string');
  assert.equal((await c.get('/api/me')).status, 401);

  const form = await fetch(`${ctx.base}/api/login`, {
    method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: 'email=a&password=b' });
  assert.equal(form.status, 400);
  const foreign = await c.post('/api/login', { email: 'a@example.com', password: 'x' }, { origin: 'https://otra.example' });
  assert.equal(foreign.status, 400);
  const broken = await fetch(`${ctx.base}/api/login`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: '{mal' });
  assert.equal(broken.status, 400);
  assert.match((await broken.json()).error, /JSON/);
  const huge = await c.post('/api/login', { email: 'a@example.com', password: 'x'.repeat(20000) });
  assert.equal(huge.status, 400);
});

test('los estáticos no permiten salir de public/', async () => {
  const res = await fetch(`${ctx.base}/..%2f..%2fpackage.json`);
  assert.ok(res.status === 404 || !(await res.text()).includes('"dependencies"'));
  assert.equal((await fetch(`${ctx.base}/no-existe.js`)).status, 404);
});

test('ni emails, ni hashes, ni tokens en respuestas ni en logs', async () => {
  const email = 'secreto.total@example.com';
  const c = ctx.client();
  const responses = [await reg(c, email)];
  const verifyToken = ctx.tokenFrom(ctx.lastMailTo(email));
  responses.push(await c.post('/api/verify-email', { token: verifyToken }));
  responses.push(await c.post('/api/login', { email, password: 'mala' }));
  responses.push(await c.post('/api/login', { email, password: PASSWORD }));
  const session = c.cookie.split('=')[1];
  responses.push(await c.get('/api/me'));
  responses.push(await c.get('/api/ranking?scope=historico'));
  responses.push(await c.post('/api/password/forgot', { email }));
  const resetToken = ctx.tokenFrom(ctx.lastMailTo(email));
  responses.push(await c.post('/api/password/reset', { token: resetToken, password: 'nueva-contraseña-1' }));

  const { rows } = await ctx.app.pool.query('select password_hash, salt from users where email = $1', [email]);
  const secrets = [email, 'secreto.total', verifyToken, resetToken, session, rows[0].password_hash, rows[0].salt, PASSWORD];
  const haystack = responses.map((r) => r.text).join('\n') + '\n' + JSON.stringify(ctx.logs);
  for (const secret of secrets) assert.ok(!haystack.includes(secret), `no debe aparecer: ${secret.slice(0, 12)}…`);

  const entry = ctx.logs.find((l) => l.route === '/api/me' && l.status === 200);
  assert.ok(entry.reqId && entry.userId && typeof entry.ms === 'number');
});
