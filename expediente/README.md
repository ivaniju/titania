# Expediente

Plataforma de preparación de oposiciones para Policía Nacional, Guardia Civil y Policía Local. Cada test es un expediente, cada pregunta un caso y la corrección un dictamen con sello.

Vive en la carpeta `expediente/` del repositorio; las carpetas `titan/` y `titania/` son otro proyecto y no se tocan.

## Estado

Hecho: API completa, PostgreSQL con migraciones, verificación de email y recuperación de contraseña, límites de acceso, cabeceras de seguridad, cargador del banco con validación, interfaz, Dockerfile, CI y logs estructurados.

Pendiente, y necesita a una persona:

- **El banco está vacío.** `data/questions.json` es `[]`. El MVP original con las 6 preguntas de ejemplo no estaba en el repositorio y aquí no se redacta contenido jurídico. Hasta que se carguen preguntas revisadas, la aplicación arranca y explica que no hay preguntas.
- **Enlaces al BOE sin comprobar.** Los tres enlaces de `data/oposiciones.json` siguen el formato del BOE consolidado, pero no se han podido abrir desde el entorno de desarrollo.
- **Temario incompleto.** Solo hay dos bloques comunes (Constitución: art. 17 y Título IV; LO 2/1986). La importancia de cada tema está en `null` (sin valorar).
- **Proveedor de correo.** El adaptador de Resend está escrito pero no probado contra el servicio real.
- **Despliegue en Railway** sin ejecutar: ver más abajo.
- Fuera de esta fase: duelos, ELO, torneos, simulacro de 50 preguntas.

## Puesta en marcha

Requisitos: Node 22 o superior y PostgreSQL 13 o superior.

```bash
cd expediente
npm ci
createdb expediente            # o cualquier base de datos vacía
cp .env.example .env           # rellena SESSION_SECRET
node --env-file=.env server.js # aplica migraciones y arranca en http://localhost:3000
```

En desarrollo los correos (verificación, recuperación) se escriben en la terminal: copia de ahí el enlace.

Para ver la interfaz con contenido mientras el banco real está vacío, hay un banco ficticio de aritmética que solo sirve para pruebas:

```bash
DATA_DIR=$(node test/fixtures/demo-data.js) node --env-file=.env server.js
```

### Variables

| Variable | Obligatoria | Descripción |
|---|---|---|
| `DATABASE_URL` | sí | Cadena de conexión a PostgreSQL. |
| `SESSION_SECRET` | sí | 16 caracteres o más. Clave con la que se hashean tokens de sesión y de correo. Cambiarla cierra todas las sesiones. |
| `PORT` | no | Puerto HTTP. Por defecto 3000. |
| `MAIL_PROVIDER` | no | `console` (por defecto, solo desarrollo) o `resend`. |
| `MAIL_FROM` | no | Remitente de los correos. |
| `RESEND_API_KEY` | con `resend` | Clave del proveedor. |
| `APP_URL` | recomendada | URL pública para los enlaces de los correos. En Railway se deduce de `RAILWAY_PUBLIC_DOMAIN`. |
| `NODE_ENV` | no | `production` activa la caché de estáticos y confía en `X-Forwarded-For`. |
| `TRUST_PROXY` | no | `1` o `0` para forzar si se confía en `X-Forwarded-For`. |
| `COOKIE_SECURE` | no | `false` quita `Secure` de la cookie. Solo para desarrollo sin HTTPS. |
| `ALLOW_CONSOLE_MAIL` | no | `1` permite `MAIL_PROVIDER=console` en producción. Escribe enlaces con token en los logs: solo para pruebas. |
| `DATA_DIR` | no | Carpeta alternativa con `oposiciones.json` y el banco. |
| `PGSSL` | no | `require` para conectar a Postgres con TLS. |

### Comandos

| Comando | Qué hace |
|---|---|
| `npm start` | Arranca el servidor (aplica migraciones pendientes e importa el banco). |
| `npm run migrate` | Solo aplica migraciones. |
| `npm test` | Pruebas de lógica, banco y API. Necesita Postgres. |
| `npm run check-bank [carpeta]` | Valida temario y banco sin tocar la base de datos. |

Las pruebas usan `TEST_DATABASE_URL` (o `DATABASE_URL`; por defecto `postgres://expediente:expediente@127.0.0.1:5432/expediente_test`). Cada fichero de pruebas crea su propio esquema y lo borra al terminar, así que no pisan datos.

## Cómo añadir preguntas

1. Escribe las preguntas en `data/questions.json` o en ficheros sueltos dentro de `data/banco/` (por ejemplo `data/banco/ce-titulo-i.json`). Cada fichero es una lista JSON.
2. Formato de cada pregunta:

```json
{
  "id": "identificador-unico-y-estable",
  "oposiciones": ["policia-nacional", "guardia-civil", "policia-local"],
  "bloque": "id de un bloque de oposiciones.json",
  "tema": "id de un tema de ese bloque",
  "tipo": "literal | interpretativa | caso_practico | trampa",
  "importancia": "alta | media | baja",
  "enunciado": "…",
  "fuente": { "titulo": "Norma y artículo", "url": "https://www.boe.es/…" },
  "opciones": [
    { "texto": "…", "correcta": true,  "explicacion": "Por qué es correcta, citando el artículo." },
    { "texto": "…", "correcta": false, "explicacion": "Por qué no lo es." },
    { "texto": "…", "correcta": false, "explicacion": "…" },
    { "texto": "…", "correcta": false, "explicacion": "…" }
  ]
}
```

3. Ejecuta `npm run check-bank`. Rechaza, diciendo pregunta y fichero: un número de opciones distinto de 4, cero o varias correctas, explicaciones de menos de 20 caracteres, preguntas sin fuente, ids o enunciados duplicados, opciones repetidas, oposiciones, bloques o temas que no existen, y sesgo de longitud (la correcta es la opción más larga en más del 40 % de las preguntas; se mide a partir de 5 preguntas).
4. Al arrancar, el servidor vuelve a validar y, solo si todo es correcto, importa a la tabla `questions`. Con un banco inválido no arranca, y la imagen Docker no se construye.

Reglas de contenido: cada pregunta y cada explicación citan un artículo o norma real, revisada por una persona con el texto consolidado delante. No cambies el `id` de una pregunta publicada: los tests y las listas de fallos la referencian. Una pregunta que se quita de los ficheros queda inactiva (deja de salir), no se borra.

## Cómo añadir temario

`data/oposiciones.json`:

```json
{
  "oposiciones": [{ "id": "guardia-civil", "nombre": "Guardia Civil" }],
  "pendiente": "Texto opcional que se muestra bajo el temario.",
  "bloques": [
    {
      "id": "id-del-bloque",
      "titulo": "Título del bloque",
      "oposiciones": ["guardia-civil"],
      "temas": [
        { "id": "id-del-tema", "titulo": "Título del tema", "importancia": null, "boe": "https://www.boe.es/…" }
      ]
    }
  ]
}
```

`importancia` es `alta`, `media`, `baja` o `null` (sin valorar). No se inventa: se rellena cuando alguien la valore con las convocatorias delante. Los ids de bloques y temas son únicos en todo el fichero.

## Arquitectura

```
server.js            arranque: variables de entorno, mailer, señales
lib/app.js           createApp(): rutas, sesiones, seguridad, estáticos
lib/logic.js         lógica pura: días de Madrid, rachas, decaimiento, puntos, niveles, ligas
lib/bank.js          cargador y validador del banco y del temario
lib/db.js            pool de Postgres y migraciones
lib/auth.js          scrypt y tokens
lib/mailer.js        interfaz Mailer: console, memory (pruebas), resend
lib/log.js           logs JSON
migrations/          SQL numerado
public/              interfaz en HTML, CSS y JavaScript sin framework
test/                pruebas (node:test)
```

Decisiones técnicas:

- **`http` nativo, sin framework.** Son 15 rutas JSON y estáticos; el enrutado cabe en una tabla y así la única dependencia es `pg`.
- **Migraciones en SQL numerado** con un ejecutor propio de 40 líneas (`lib/db.js`), en vez de añadir otra dependencia.
- **`createApp({ databaseUrl, schema, dataDir, mailer, now })`** sustituye al `createApp({dbPath, dataDir})` del encargo. El reloj y el mailer se inyectan para probar fechas y correos.
- **Fuentes autoalojadas** (`public/fonts/`), para que la CSP sea `'self'` sin excepciones.

### API

Todas las rutas del encargo, sin prefijo de versión, más `GET /healthz`. Errores como `{ "error": "mensaje" }`. Los POST exigen `Content-Type: application/json`.

Notas sobre lo que devuelve:

- `GET /api/tests/:id` y `POST /api/tests/:id/answer` identifican las opciones por su posición en pantalla (0 a 3), ya barajadas. En examen no viaja ningún campo de corrección hasta `finish`.
- `GET /api/me` añade `openTest` (último test sin cerrar de las últimas 24 h, para retomarlo), `inactivity` y `bankSize`. No devuelve el email.
- `GET /api/ranking` devuelve las 100 primeras filas y `me` con la fila propia aunque quede fuera.

### Reglas de negocio y cómo se han concretado

Las ocho reglas del encargo están implementadas y probadas. Donde el encargo dejaba margen se ha decidido así:

- **Actividad** de un día: responder al menos una pregunta, en cualquier modo. Abrir un test sin responder no cuenta.
- **Penalización:** los días sin actividad son días completos; hoy no cuenta hasta que termina. Con el último día activo el lunes, el miércoles no hay penalización (el martes es el día de gracia), el jueves se multiplica por 0,9, el viernes por 0,81.
- **Clasificaciones:** semanal (de lunes a hoy), mensual (mes natural), `global` (últimos 30 días) e histórica incluyen todas las oposiciones; `oposicion` es la histórica filtrada por la oposición del usuario. Un examen puntúa en el día en que se entrega.
- **Repaso en formato examen** (`errores-examen`): no da puntos ni gasta exámenes del día. Si puntuara, repetir preguntas ya conocidas inflaría la clasificación.
- **Estudio:** una respuesta corregida no se puede cambiar. En examen sí, hasta entregar.
- **Registro con un email que ya existe:** responde igual que uno nuevo y avisa por correo al titular. Si la cuenta estaba sin confirmar, valen los datos del último registro.
- **Entrar sin haber confirmado** (con la contraseña correcta) responde 409 y reenvía el enlace.
- **Restablecer la contraseña** cierra todas las sesiones y da el email por confirmado.
- Además del límite de login (5 fallos en 15 min por email y por IP) hay límites por IP en registro (10 por hora) y recuperación (5 en 15 min, 3 por hora por email).

### Seguridad

- Contraseñas con scrypt (N=2^15) y sal única. Tokens de sesión, verificación y reset guardados solo como HMAC-SHA256.
- Cookie `expediente_sid`: `HttpOnly`, `Secure`, `SameSite=Lax`, 30 días. Nada en `localStorage`.
- CSP estricta sin `unsafe-inline`, `X-Content-Type-Options`, `Referrer-Policy: no-referrer`, `frame-ancestors 'none'`, HSTS.
- Los enlaces de los correos llevan el token en el fragmento (`/#/verificar?token=…`): no llega al servidor ni a sus logs, y la interfaz lo quita de la barra de direcciones al leerlo.
- Logs: una línea JSON por petición con `reqId`, método, ruta como patrón, estado, milisegundos y `userId`. Sin emails, tokens ni cuerpos. Cada respuesta lleva `X-Request-Id`.

Comprobar cabeceras: `curl -I http://localhost:3000/`.

### Diseño y accesibilidad

Se mantiene la paleta del encargo. Tres de sus colores (muted, acierto, fallo) no llegan a contraste AA como texto pequeño sobre papel, así que se usan para trazos y texto grande (sello, tics, barras) y para texto pequeño hay un tono más oscuro de cada uno (`--muted-texto`, `--acierto-texto`, `--fallo-texto` en `styles.css`). Los fallos se distinguen también por forma (tic corto) y texto, no solo por color. Solo hay dos animaciones, el libro y el sello, y se desactivan con `prefers-reduced-motion`.

## Despliegue en Railway

1. Crea un proyecto con un servicio PostgreSQL y un servicio desde este repositorio con **Root Directory** `expediente`. `railway.json` indica el Dockerfile y el healthcheck en `/healthz`.
2. Variables del servicio: `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `SESSION_SECRET` (`openssl rand -base64 32`), `MAIL_PROVIDER=resend`, `MAIL_FROM`, `RESEND_API_KEY`. `PORT` lo pone Railway.
3. Genera un dominio público. El contenedor aplica las migraciones antes de arrancar.
4. Comprueba `GET https://<dominio>/api/oposiciones` y `GET /healthz`.

No hay secretos en el repositorio: `.env` está en `.gitignore`.

## CI

`.github/workflows/ci.yml`, en cada PR y en cada push a `main`: `npm run check-bank`, `npm test` contra un Postgres 16 de servicio y `docker build` de la imagen.
