# Expediente: guía para agentes

Plataforma de preparación de oposiciones. Lee `README.md` para instalación, formato de datos y decisiones.

## Antes de dar algo por terminado

```bash
npm test            # necesita Postgres; ver TEST_DATABASE_URL en el README
npm run check-bank
```

Ambos deben quedar en verde en cada cambio.

## Reglas que no se negocian

- **No escribas contenido jurídico.** Ni preguntas, ni explicaciones, ni importancia de temas. `data/questions.json` está vacío a propósito hasta que una persona aporte preguntas revisadas. Las preguntas de `test/fixtures/` son aritmética ficticia y no se copian a `data/`.
- **Ningún email, hash de contraseña ni token** en respuestas de la API, logs o HTML. Hay una prueba que lo comprueba (`test/api.auth.test.js`); amplíala si añades rutas.
- **La corrección de un examen no sale del servidor antes de entregar.** Toda vista de pregunta pasa por `viewQuestion()` en `lib/app.js`.
- **Cada ruta de test comprueba la propiedad** con `loadTest()`: ajeno o inexistente responden el mismo 404.
- **Las reglas de negocio están fijadas** (puntos, límite de 5 exámenes iniciados por día de Madrid, penalización, rachas, niveles y ligas). Viven en `lib/logic.js` con sus pruebas. No las cambies sin preguntar.
- **Sin dependencias nuevas sin motivo.** Hoy la única es `pg`.
- **Diseño:** paleta y tipografías del README. Prohibido: sombras genéricas, etiquetas en mayúsculas, metadatos unidos con "·", flechas en botones, emojis, gradientes decorativos y animaciones más allá del libro y el sello. La CSP no admite estilos ni scripts en línea.
- Textos de interfaz y mensajes de error, en español.

## Dónde está cada cosa

- Lógica pura y constantes de negocio: `lib/logic.js`.
- Rutas y seguridad HTTP: `lib/app.js`. El reloj es `now()` inyectado: no uses `new Date()` ni `now()` de SQL para lógica de negocio.
- Esquema: `migrations/NNN_nombre.sql`. Una migración aplicada no se edita; se añade otra.
- Validación del banco: `lib/bank.js`.
- Interfaz: `public/app.js` construye el DOM con `h()`; nunca uses `innerHTML`.

## Pruebas

`test/helpers.js` arranca la aplicación en un esquema de Postgres propio, con reloj controlable (`ctx.clock`) y correo en memoria (`ctx.mailer.sent`). `playTest()` hace un test entero con un número dado de aciertos.

Los cambios de interfaz se comprueban en un navegador real, en móvil (390 px o menos) y escritorio.

## Fuera de alcance por ahora

Duelos en tiempo real, ELO, "Rey de la Academia", torneos y simulacro de 50 preguntas. Antes de abordarlos se redacta el protocolo en un documento.
