'use strict';
(() => {
  const main = document.getElementById('contenido');
  const nav = document.getElementById('nav');
  const avisos = document.getElementById('avisos');
  const LETRAS = ['A', 'B', 'C', 'D'];
  const MODOS = {
    estudio: 'Estudio', examen: 'Examen',
    'errores-estudio': 'Repaso de fallos', 'errores-examen': 'Repaso de fallos en formato examen',
  };
  let navegacion = 0; // descarta respuestas de vistas que ya no están en pantalla

  // ---------- utilidades ----------

  /** Crea un elemento. Los textos entran siempre como nodos de texto, nunca como HTML. */
  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
      if (value === null || value === undefined || value === false) continue;
      if (key === 'class') el.className = value;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
      else if (value === true) el.setAttribute(key, '');
      else el.setAttribute(key, value);
    }
    el.append(...children.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false));
    return el;
  }

  class ApiError extends Error {
    constructor(status, message) {
      super(message);
      this.status = status;
    }
  }

  async function api(method, path, body) {
    let res;
    try {
      res = await fetch(path, {
        method,
        credentials: 'same-origin',
        headers: body === undefined ? {} : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(0, 'No hay conexión con el servidor. Comprueba tu red e inténtalo de nuevo.');
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new ApiError(res.status, data.error || 'Ha ocurrido un error inesperado.');
    return data;
  }

  function avisar(texto) {
    const el = h('p', { class: 'aviso' }, texto);
    avisos.replaceChildren(el);
    setTimeout(() => el.remove(), 6000);
  }

  function ir(ruta) {
    if (location.hash === ruta) enrutar();
    else location.hash = ruta;
  }

  function pintar(titulo, ...nodes) {
    main.replaceChildren(...nodes.flat(Infinity).filter(Boolean));
    document.title = titulo ? `${titulo} | Expediente` : 'Expediente';
    window.scrollTo(0, 0);
    const h1 = main.querySelector('h1');
    if (h1) {
      h1.setAttribute('tabindex', '-1');
      h1.focus({ preventScroll: true });
    }
  }

  const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

  function fechaCorta(day) {
    const [y, m, d] = day.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  }

  /** Botón que se desactiva mientras dura su acción y avisa si falla. */
  function boton(texto, accion, attrs = {}) {
    const el = h('button', { type: 'button', class: 'boton', ...attrs }, texto);
    el.addEventListener('click', async () => {
      if (el.disabled) return;
      el.disabled = true;
      try {
        await accion(el);
      } catch (err) {
        if (err.status === 401) return ir('#/entrar');
        avisar(err.message);
      } finally {
        el.disabled = Boolean(attrs.disabled);
      }
    });
    return el;
  }

  // ---------- acceso ----------

  function campo(etiqueta, attrs, ayuda) {
    const id = `campo-${attrs.name}`;
    return h('div', { class: 'campo' },
      h('label', { for: id }, etiqueta),
      h('input', { id, ...attrs, 'aria-describedby': ayuda ? `${id}-ayuda` : null }),
      ayuda && h('p', { class: 'ayuda', id: `${id}-ayuda` }, ayuda));
  }

  /** Formulario con estado de envío y error anunciado. `enviar` recibe los valores. */
  function formulario(textoBoton, campos, enviar) {
    const error = h('p', { class: 'error', role: 'alert', hidden: true });
    const submit = h('button', { type: 'submit', class: 'boton primario' }, textoBoton);
    const form = h('form', { class: 'ficha', novalidate: true }, campos, error, submit);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (submit.disabled) return;
      error.hidden = true;
      submit.disabled = true;
      try {
        await enviar(Object.fromEntries(new FormData(form)));
      } catch (err) {
        error.textContent = err.message;
        error.hidden = false;
      } finally {
        submit.disabled = false;
      }
    });
    return form;
  }

  function pieAcceso(...enlaces) {
    return h('p', { class: 'pie-acceso' }, enlaces.map(([texto, ruta]) => h('a', { href: ruta }, texto)));
  }

  function vistaEntrar() {
    pintar('Entrar',
      h('section', { class: 'acceso' },
        h('h1', null, 'Entrar'),
        h('p', { class: 'entradilla' }, 'Abre tu expediente y sigue donde lo dejaste.'),
        formulario('Entrar', [
          campo('Email', { name: 'email', type: 'email', autocomplete: 'email', required: true }),
          campo('Contraseña', { name: 'password', type: 'password', autocomplete: 'current-password', required: true }),
        ], async (v) => {
          await api('POST', '/api/login', v);
          ir('#/');
        }),
        pieAcceso(['Crear una cuenta', '#/registro'], ['He olvidado mi contraseña', '#/recuperar'])));
  }

  async function vistaRegistro() {
    const turno = navegacion;
    const { oposiciones } = await api('GET', '/api/oposiciones');
    if (turno !== navegacion) return;
    const opciones = h('fieldset', { class: 'campo grupo' },
      h('legend', null, 'Oposición que preparas'),
      oposiciones.map((o, i) => h('label', { class: 'radio' },
        h('input', { type: 'radio', name: 'oposicion', value: o.id, required: true, checked: i === 0 }),
        h('span', null, o.nombre))),
      h('p', { class: 'ayuda' }, 'Decide tu temario, tus preguntas y tu clasificación.'));
    pintar('Crear cuenta',
      h('section', { class: 'acceso' },
        h('h1', null, 'Crear cuenta'),
        h('p', { class: 'entradilla' }, 'Una cuenta, una oposición. Estudia cada día y mídete con quien prepara tu misma plaza.'),
        formulario('Crear cuenta', [
          campo('Nombre', { name: 'name', type: 'text', autocomplete: 'nickname', required: true, maxlength: 40 },
            'Es público: aparece en la clasificación.'),
          campo('Email', { name: 'email', type: 'email', autocomplete: 'email', required: true }),
          campo('Contraseña', { name: 'password', type: 'password', autocomplete: 'new-password', required: true, minlength: 8 },
            'Ocho caracteres como mínimo.'),
          opciones,
        ], async (v) => {
          const res = await api('POST', '/api/register', v);
          pintar('Revisa tu correo',
            h('section', { class: 'acceso' },
              h('h1', null, 'Revisa tu correo'),
              h('p', { class: 'entradilla' }, res.message),
              h('p', null, 'El enlace caduca en 24 horas. Cuando lo abras podrás entrar con tu contraseña.'),
              pieAcceso(['Ir a entrar', '#/entrar'])));
        }),
        pieAcceso(['Ya tengo cuenta', '#/entrar'])));
  }

  function vistaRecuperar() {
    pintar('Recuperar contraseña',
      h('section', { class: 'acceso' },
        h('h1', null, 'Recuperar contraseña'),
        h('p', { class: 'entradilla' }, 'Escribe tu email y te enviaremos un enlace para elegir una contraseña nueva.'),
        formulario('Enviar enlace', [
          campo('Email', { name: 'email', type: 'email', autocomplete: 'email', required: true }),
        ], async (v) => {
          const res = await api('POST', '/api/password/forgot', v);
          pintar('Revisa tu correo',
            h('section', { class: 'acceso' },
              h('h1', null, 'Revisa tu correo'),
              h('p', { class: 'entradilla' }, res.message),
              h('p', null, 'El enlace caduca en una hora y solo sirve una vez.'),
              pieAcceso(['Volver a entrar', '#/entrar'])));
        }),
        pieAcceso(['Volver a entrar', '#/entrar'])));
  }

  /** Lee el token del enlace y lo quita de la barra de direcciones y del historial. */
  function tomarToken(query, ruta) {
    const token = query.get('token');
    if (token) history.replaceState(null, '', ruta);
    return token;
  }

  async function vistaVerificar(query) {
    const token = tomarToken(query, '#/verificar');
    const turno = navegacion;
    pintar('Confirmar email', h('section', { class: 'acceso' }, h('h1', null, 'Confirmando tu email')));
    let titulo = 'Email confirmado';
    let texto = 'Tu cuenta ya está activa. Entra con tu email y tu contraseña.';
    try {
      await api('POST', '/api/verify-email', { token });
    } catch (err) {
      titulo = 'No hemos podido confirmar tu email';
      texto = `${err.message} Si ya lo habías confirmado, entra sin más. Si no, al intentar entrar te enviaremos un enlace nuevo.`;
    }
    if (turno !== navegacion) return;
    pintar(titulo, h('section', { class: 'acceso' },
      h('h1', null, titulo), h('p', { class: 'entradilla' }, texto), pieAcceso(['Ir a entrar', '#/entrar'])));
  }

  function vistaRestablecer(query) {
    const token = tomarToken(query, '#/restablecer');
    pintar('Nueva contraseña',
      h('section', { class: 'acceso' },
        h('h1', null, 'Nueva contraseña'),
        formulario('Guardar contraseña', [
          campo('Contraseña nueva', { name: 'password', type: 'password', autocomplete: 'new-password', required: true, minlength: 8 },
            'Ocho caracteres como mínimo. Se cerrarán tus sesiones abiertas.'),
        ], async (v) => {
          await api('POST', '/api/password/reset', { token, password: v.password });
          pintar('Contraseña cambiada',
            h('section', { class: 'acceso' },
              h('h1', null, 'Contraseña cambiada'),
              h('p', { class: 'entradilla' }, 'Ya puedes entrar con tu contraseña nueva.'),
              pieAcceso(['Ir a entrar', '#/entrar'])));
        }),
        pieAcceso(['Pedir otro enlace', '#/recuperar'])));
  }

  // ---------- portada ----------

  async function empezar(mode) {
    const { id } = await api('POST', '/api/tests', { mode });
    ir(`#/test/${id}`);
  }

  function libro(activity) {
    const dias = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
    return h('ol', { class: 'libro', 'aria-label': 'Asistencia de los últimos 14 días' },
      activity.map((d, i) => {
        const [y, m, dd] = d.day.split('-').map(Number);
        const semana = dias[new Date(Date.UTC(y, m - 1, dd)).getUTCDay()];
        const hoy = i === activity.length - 1;
        return h('li', { class: `dia${d.active ? ' activo' : ''}${hoy ? ' hoy' : ''}` },
          h('span', { class: 'dia-sem', 'aria-hidden': 'true' }, semana),
          h('span', { class: 'dia-num', 'aria-hidden': 'true' }, String(dd)),
          h('span', { class: 'oculto' }, `${fechaCorta(d.day)}${hoy ? ' (hoy)' : ''}: ${d.active ? 'con actividad' : 'sin actividad'}`));
      }));
  }

  function casillas(exams) {
    return h('span', {
      class: 'casillas', role: 'img',
      'aria-label': `${exams.startedToday} de ${exams.limit} exámenes de hoy usados`,
    }, Array.from({ length: exams.limit }, (_, i) => h('span', { class: `casilla${i < exams.startedToday ? ' usada' : ''}` })));
  }

  function barra(pct, clase = '') {
    const relleno = h('span', { class: 'medida-relleno' });
    relleno.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    return h('span', { class: `medida ${clase}`, 'aria-hidden': 'true' }, relleno);
  }

  function modo(titulo, descripcion, ...acciones) {
    return h('li', { class: 'modo' },
      h('div', { class: 'modo-texto' }, h('h3', null, titulo), descripcion),
      h('div', { class: 'modo-acciones' }, acciones));
  }

  async function vistaPortada() {
    const turno = navegacion;
    const me = await api('GET', '/api/me');
    if (turno !== navegacion) return;
    const sinBanco = me.bankSize === 0;
    const sinExamenes = me.exams.remaining === 0;
    const sinFallos = me.errorBank === 0;

    const penalizacion = me.inactivity.factor < 1 && h('p', { class: 'nota' },
      `Llevas ${plural(me.inactivity.days, 'día', 'días')} sin actividad: tus puntos de la semana, del mes y de los 30 días ` +
      `cuentan ahora al ${Math.round(me.inactivity.factor * 100)} %. Responde una pregunta hoy para recuperarlos.`);

    const filas = [];
    if (me.openTest) {
      filas.push(modo('Tienes un test a medias',
        h('p', null, `${MODOS[me.openTest.mode]} sin cerrar. Puedes retomarlo donde lo dejaste.`),
        h('a', { class: 'boton primario', href: `#/test/${me.openTest.id}` }, 'Continuar')));
    }
    filas.push(
      modo('Estudio',
        h('p', null, sinBanco
          ? 'Todavía no hay preguntas cargadas para tu oposición.'
          : '25 preguntas. Tras cada respuesta, el dictamen: por qué la correcta lo es y por qué las otras tres no.'),
        boton('Empezar estudio', () => empezar('estudio'), { class: me.openTest ? 'boton' : 'boton primario', disabled: sinBanco })),
      modo('Examen',
        [
          h('p', null, '20 preguntas sin corrección hasta entregar. Suma puntos a la clasificación.'),
          h('p', { class: 'cupo' }, casillas(me.exams),
            h('span', null, sinExamenes
              ? 'Has usado los cinco de hoy. Mañana tendrás otros cinco.'
              : `Te ${me.exams.remaining === 1 ? 'queda' : 'quedan'} ${me.exams.remaining} de ${me.exams.limit} hoy. Cuenta al empezarlo, aunque lo abandones.`)),
        ],
        boton('Empezar examen', () => empezar('examen'), { disabled: sinBanco || sinExamenes })),
      modo('Repaso de fallos',
        h('p', null, sinFallos
          ? 'No tienes fallos pendientes. Las preguntas que falles aparecerán aquí.'
          : `${plural(me.errorBank, 'pregunta fallada', 'preguntas falladas')} por repasar. Cada una sale de la lista cuando la aciertas.`),
        boton('Repasar con dictamen', () => empezar('errores-estudio'), { disabled: sinFallos }),
        boton('Repasar como examen', () => empezar('errores-examen'), { disabled: sinFallos })),
      modo('Temario', h('p', null, 'Bloques y temas de tu oposición, con su importancia y el enlace al BOE.'),
        h('a', { class: 'boton', href: '#/temario' }, 'Ver temario')),
      modo('Clasificación', h('p', null, 'Semanal, mensual, 30 días, por oposición e histórica.'),
        h('a', { class: 'boton', href: '#/clasificacion' }, 'Ver clasificación')));

    pintar('Portada',
      h('section', { class: 'portada' },
        h('h1', { class: 'saludo' }, `Hola, ${me.user.name}`),
        h('p', { class: 'entradilla' }, `Preparas ${me.user.oposicionNombre}.`),
        h('div', { class: 'racha' },
          h('p', { class: 'racha-cifra' }, h('span', { class: 'cifra' }, String(me.streak)),
            h('span', { class: 'racha-texto' }, me.streak === 1 ? 'día seguido' : 'días seguidos')),
          h('p', { class: 'racha-nota' }, me.streak === 0
            ? 'Responde una pregunta hoy para empezar tu racha.'
            : me.activity.at(-1).active ? 'Hoy ya cuenta.' : 'Hoy todavía no has estudiado: la racha aguanta hasta medianoche.')),
        libro(me.activity),
        penalizacion,
        h('dl', { class: 'marcas' },
          h('div', null, h('dt', null, 'Nivel'), h('dd', null, h('span', { class: 'cifra' }, String(me.level.level)),
            barra(me.level.pct),
            h('span', { class: 'detalle' }, `${me.level.pointsInLevel} de ${me.level.pointsForNext} puntos para el nivel ${me.level.level + 1}`))),
          h('div', null, h('dt', null, 'Liga'), h('dd', null, h('span', { class: 'cifra' }, me.league.name),
            h('span', { class: 'detalle' }, me.league.next
              ? `${plural(me.league.next.from - me.points, 'punto', 'puntos')} para ${me.league.next.name}`
              : 'La liga más alta'))),
          h('div', null, h('dt', null, 'Puntos'), h('dd', null, h('span', { class: 'cifra' }, me.points.toLocaleString('es-ES')),
            h('span', { class: 'detalle' }, 'Acumulados en exámenes')))),
        h('h2', null, 'Qué quieres hacer'),
        h('ul', { class: 'modos' }, filas)));
  }

  // ---------- test ----------

  function sello(correcta) {
    return h('p', { class: `sello ${correcta ? 'ok' : 'ko'}` }, correcta ? 'Correcta' : 'Incorrecta');
  }

  /** Dictamen de una pregunta ya corregida: las cuatro opciones con su explicación y la fuente. */
  function dictamen(q, { conSello }) {
    return h('section', { class: 'dictamen', 'aria-label': 'Dictamen' },
      conSello && sello(q.correct),
      h('ol', { class: 'explicaciones' }, q.opciones.map((o, i) => {
        const elegida = q.selected === i;
        const marcas = [o.correcta && 'Correcta', elegida && 'Tu respuesta'].filter(Boolean);
        return h('li', { class: `explicacion${o.correcta ? ' es-correcta' : ''}${elegida && !o.correcta ? ' es-fallo' : ''}` },
          h('p', { class: 'explicacion-opcion' },
            h('span', { class: 'letra', 'aria-hidden': 'true' }, LETRAS[i]),
            h('span', null, o.texto),
            marcas.map((m) => h('span', { class: 'marca-opcion' }, m))),
          h('p', { class: 'explicacion-texto' }, o.explicacion));
      })),
      q.selected === null && h('p', { class: 'nota' }, 'Sin responder: cuenta como fallo.'),
      h('p', { class: 'fuente' }, 'Fuente: ',
        h('a', { href: q.fuente.url, target: '_blank', rel: 'noopener noreferrer' }, q.fuente.titulo),
        h('span', { class: 'oculto' }, ' (se abre en otra pestaña)')));
  }

  function cabeceraCaso(test, indice, palabra) {
    return h('header', { class: 'caso-cabecera' },
      h('p', { class: 'caso-modo' }, MODOS[test.mode]),
      h('p', { class: 'caso-cuenta' }, `${palabra} ${indice + 1} de ${test.total}`),
      barra(((indice + 1) / test.total) * 100, 'fina'));
  }

  async function cerrar(test) {
    const resultado = await api('POST', `/api/tests/${test.id}/finish`, {});
    vistaResultado(resultado);
  }

  function vistaEstudio(test, indice) {
    const q = test.questions[indice];
    const ultimo = indice === test.questions.length - 1;
    const pie = h('div', { class: 'caso-pie' });
    const zona = h('div');

    function corregido() {
      const siguiente = ultimo
        ? boton('Cerrar expediente', () => cerrar(test), { class: 'boton primario' })
        : boton('Siguiente caso', async () => vistaEstudio(test, indice + 1), { class: 'boton primario' });
      zona.replaceChildren(dictamen(q, { conSello: true }));
      pie.replaceChildren(siguiente);
      return siguiente;
    }

    function opciones() {
      const lista = h('ul', { class: 'opciones' }, q.opciones.map((o, i) => h('li', null,
        boton([h('span', { class: 'letra', 'aria-hidden': 'true' }, LETRAS[i]), h('span', null, o.texto)], async () => {
          for (const b of lista.querySelectorAll('button')) b.disabled = true;
          try {
            Object.assign(q, await api('POST', `/api/tests/${test.id}/answer`, { questionId: q.id, option: i }));
          } catch (err) {
            for (const b of lista.querySelectorAll('button')) b.disabled = false;
            throw err;
          }
          corregido().focus();
        }, { class: 'boton opcion' }))));
      zona.replaceChildren(lista);
      pie.replaceChildren(boton('Cerrar expediente ahora', () => cerrar(test), { class: 'enlace' }));
    }

    pintar(`Caso ${indice + 1}`,
      h('article', { class: 'caso' },
        cabeceraCaso(test, indice, 'Caso'),
        h('h1', { class: 'enunciado' }, q.enunciado),
        zona, pie));
    if (q.revealed) corregido();
    else opciones();
  }

  function vistaExamen(test, indice) {
    const q = test.questions[indice];
    const sinResponder = () => test.questions.filter((x) => x.selected === null).length;
    const estado = h('p', { class: 'guardado', role: 'status' });

    const lista = h('ul', { class: 'opciones' }, q.opciones.map((o, i) => h('li', null,
      boton([h('span', { class: 'letra', 'aria-hidden': 'true' }, LETRAS[i]), h('span', null, o.texto)], async () => {
        await api('POST', `/api/tests/${test.id}/answer`, { questionId: q.id, option: i });
        q.selected = i;
        lista.querySelectorAll('button').forEach((b, n) => b.setAttribute('aria-pressed', String(n === i)));
        indiceNav.children[indice].firstChild.classList.add('respondida');
        estado.textContent = 'Respuesta guardada. Puedes cambiarla hasta que entregues.';
      }, { class: 'boton opcion', 'aria-pressed': String(q.selected === i) }))));

    const indiceNav = h('ol', { class: 'indice', 'aria-label': 'Preguntas del examen' },
      test.questions.map((x, n) => h('li', null,
        h('button', {
          type: 'button',
          class: `indice-n${x.selected !== null ? ' respondida' : ''}`,
          'aria-current': n === indice ? 'true' : null,
          'aria-label': `Pregunta ${n + 1}${x.selected !== null ? ', respondida' : ', sin responder'}`,
          onclick: () => vistaExamen(test, n),
        }, String(n + 1)))));

    const entrega = h('div', { class: 'entrega' });
    function pedirEntrega() {
      const faltan = sinResponder();
      const confirmar = boton('Entregar', () => cerrar(test), { class: 'boton primario' });
      entrega.replaceChildren(
        h('p', { role: 'alert' }, faltan
          ? `Te ${faltan === 1 ? 'queda' : 'quedan'} ${plural(faltan, 'pregunta', 'preguntas')} sin responder y ${faltan === 1 ? 'contará' : 'contarán'} como fallo. ¿Entregas el examen?`
          : 'Has respondido todo. Al entregar ya no podrás cambiar nada. ¿Entregas el examen?'),
        confirmar,
        h('button', { type: 'button', class: 'boton', onclick: () => entrega.replaceChildren(botonEntregar()) }, 'Seguir con el examen'));
      confirmar.focus();
    }
    const botonEntregar = () => h('button', { type: 'button', class: 'boton', onclick: pedirEntrega }, 'Entregar examen');
    entrega.append(botonEntregar());

    pintar(`Pregunta ${indice + 1}`,
      h('article', { class: 'caso' },
        cabeceraCaso(test, indice, 'Pregunta'),
        h('h1', { class: 'enunciado' }, q.enunciado),
        lista, estado,
        h('div', { class: 'caso-pie' },
          h('button', { type: 'button', class: 'boton', disabled: indice === 0, onclick: () => vistaExamen(test, indice - 1) }, 'Anterior'),
          h('button', {
            type: 'button', class: 'boton primario', disabled: indice === test.questions.length - 1,
            onclick: () => vistaExamen(test, indice + 1),
          }, 'Siguiente')),
        indiceNav, entrega));
  }

  function vistaResultado(test) {
    const esExamen = test.points !== null;
    const revision = test.questions.map((q, i) => h('details', { class: 'revision', id: `caso-${i + 1}` },
      h('summary', null,
        h('span', { class: `tic ${q.correct ? 'ok' : 'ko'}`, 'aria-hidden': 'true' }),
        h('span', { class: 'revision-num' }, `${i + 1}.`),
        h('span', { class: 'revision-enunciado' }, q.enunciado),
        h('span', { class: 'oculto' }, q.correct ? ' Acertada.' : ' Fallada.')),
      dictamen(q, { conSello: false })));

    const tira = h('ol', { class: 'tira', 'aria-label': 'Resultado pregunta a pregunta' },
      test.questions.map((q, i) => h('li', null, h('button', {
        type: 'button',
        class: `tic ${q.correct ? 'ok' : 'ko'}`,
        'aria-label': `Caso ${i + 1}: ${q.correct ? 'acertado' : 'fallado'}. Ver dictamen`,
        onclick: () => {
          revision[i].open = true;
          revision[i].scrollIntoView({ block: 'start' });
          revision[i].querySelector('summary').focus({ preventScroll: true });
        },
      }))));

    pintar('Expediente cerrado',
      h('section', { class: 'resultado' },
        h('p', { class: 'caso-modo' }, MODOS[test.mode]),
        h('h1', null, 'Expediente cerrado'),
        h('p', { class: 'resultado-cifra' },
          h('span', { class: 'cifra' }, esExamen ? String(test.points) : `${test.correct} de ${test.total}`),
          h('span', { class: 'racha-texto' }, esExamen ? (test.points === 1 ? 'punto' : 'puntos') : (test.correct === 1 ? 'acierto' : 'aciertos'))),
        h('p', { class: 'entradilla' }, esExamen
          ? `${plural(test.correct, 'acierto', 'aciertos')} de ${test.total}. Los puntos ya están en tu clasificación.`
          : 'El estudio y los repasos no suman puntos: cuentan para tu racha y vacían tu lista de fallos.'),
        tira,
        h('div', { class: 'caso-pie' },
          h('a', { class: 'boton primario', href: '#/' }, 'Volver a la portada'),
          esExamen && h('a', { class: 'boton', href: '#/clasificacion' }, 'Ver clasificación')),
        h('h2', null, 'Dictámenes'),
        revision));
  }

  async function vistaTest(_query, id) {
    const turno = navegacion;
    let test;
    try {
      test = await api('GET', `/api/tests/${id}`);
    } catch (err) {
      if (err.status !== 404) throw err;
      if (turno !== navegacion) return;
      return pintar('Test no encontrado', h('section', { class: 'acceso' },
        h('h1', null, 'Test no encontrado'),
        h('p', { class: 'entradilla' }, 'Este expediente no existe o no es tuyo.'),
        pieAcceso(['Volver a la portada', '#/'])));
    }
    if (turno !== navegacion) return;
    if (test.finished) return vistaResultado(test);
    const pendiente = test.questions.findIndex((q) => q.selected === null);
    const indice = pendiente === -1 ? test.questions.length - 1 : pendiente;
    if (test.format === 'estudio') vistaEstudio(test, indice);
    else vistaExamen(test, indice);
  }

  // ---------- temario ----------

  function medidor(importancia) {
    const nivel = { alta: 3, media: 2, baja: 1 }[importancia] || 0;
    const texto = importancia ? `Importancia ${importancia}` : 'Importancia sin valorar';
    return h('span', { class: 'importancia' },
      h('span', { class: 'medidor', 'aria-hidden': 'true' },
        [1, 2, 3].map((n) => h('span', { class: `medidor-barra${n <= nivel ? ' llena' : ''}` }))),
      h('span', null, texto));
  }

  async function vistaTemario() {
    const turno = navegacion;
    const [temario, me] = await Promise.all([api('GET', '/api/temario'), api('GET', '/api/me')]);
    if (turno !== navegacion) return;
    pintar('Temario',
      h('section', { class: 'temario' },
        h('h1', null, 'Temario'),
        h('p', { class: 'entradilla' }, `${me.user.oposicionNombre}. Cada tema enlaza con su texto consolidado en el BOE.`),
        temario.bloques.map((b) => h('section', { class: 'bloque' },
          h('h2', null, b.titulo),
          h('ul', { class: 'temas' }, b.temas.map((t) => h('li', { class: 'tema' },
            h('h3', null, t.titulo),
            h('div', { class: 'tema-datos' },
              medidor(t.importancia),
              h('span', null, t.preguntas ? plural(t.preguntas, 'pregunta', 'preguntas') : 'Sin preguntas todavía'),
              h('a', { href: t.boe, target: '_blank', rel: 'noopener noreferrer' }, 'Ver en el BOE',
                h('span', { class: 'oculto' }, `: ${t.titulo} (se abre en otra pestaña)`)))))))),
        temario.pendiente && h('p', { class: 'nota' }, temario.pendiente)));
  }

  // ---------- clasificación ----------

  const AMBITOS = [
    ['semanal', 'Semanal'], ['mensual', 'Mensual'], ['global', '30 días'],
    ['oposicion', 'Mi oposición'], ['historico', 'Histórica'],
  ];

  function filaRanking(r, max) {
    const relleno = h('span', { class: 'fila-barra', 'aria-hidden': 'true' });
    relleno.style.width = `${max ? Math.max(2, (r.points / max) * 100) : 0}%`;
    return h('li', { class: `fila${r.me ? ' yo' : ''}`, 'aria-current': r.me ? 'true' : null },
      relleno,
      h('span', { class: 'fila-pos' }, h('span', { class: 'oculto' }, 'Posición '), String(r.position)),
      h('span', { class: 'fila-quien' },
        h('span', { class: 'fila-nombre' }, r.name, r.me && h('span', { class: 'marca-opcion' }, 'Tú')),
        h('span', { class: 'fila-detalle' }, `${r.oposicion}, liga ${r.league}`)),
      h('span', { class: 'fila-puntos' }, r.points.toLocaleString('es-ES'), h('span', { class: 'oculto' }, ' puntos')));
  }

  async function vistaClasificacion(query) {
    const turno = navegacion;
    const scope = AMBITOS.some(([id]) => id === query.get('ambito')) ? query.get('ambito') : 'semanal';
    const data = await api('GET', `/api/ranking?scope=${scope}`);
    if (turno !== navegacion) return;
    const max = data.rows.length ? data.rows[0].points : 0;
    const fuera = data.me && !data.rows.some((r) => r.me);
    pintar('Clasificación',
      h('section', { class: 'clasificacion' },
        h('h1', null, 'Clasificación'),
        h('nav', { class: 'ambitos', 'aria-label': 'Tipo de clasificación' },
          AMBITOS.map(([id, nombre]) => h('a', {
            href: `#/clasificacion?ambito=${id}`, 'aria-current': id === scope ? 'page' : null,
          }, nombre))),
        h('p', { class: 'entradilla' }, data.from
          ? `Del ${fechaCorta(data.from)} al ${fechaCorta(data.to)}. La inactividad penaliza: un día de gracia y, desde el segundo, un 10 % menos por día.`
          : scope === 'oposicion'
            ? 'Puntos acumulados entre quienes preparan tu misma oposición. No penaliza la inactividad.'
            : 'Puntos acumulados desde el primer examen. No penaliza la inactividad.'),
        data.rows.length
          ? h('ol', { class: 'tabla' }, data.rows.map((r) => filaRanking(r, max)))
          : h('p', { class: 'nota' }, 'Todavía no hay nadie con puntos aquí. Entrega un examen y estrena la tabla.'),
        fuera && [h('h2', null, 'Tu posición'), h('ol', { class: 'tabla' }, filaRanking(data.me, max))],
        !data.me && data.rows.length > 0 && h('p', { class: 'nota' }, 'Aún no tienes puntos en esta clasificación.')));
  }

  // ---------- enrutado ----------

  const rutas = [
    [/^\/$/, vistaPortada, 'portada'],
    [/^\/entrar$/, vistaEntrar],
    [/^\/registro$/, vistaRegistro],
    [/^\/recuperar$/, vistaRecuperar],
    [/^\/verificar$/, vistaVerificar],
    [/^\/restablecer$/, vistaRestablecer],
    [/^\/test\/([\w-]+)$/, vistaTest, 'test'],
    [/^\/temario$/, vistaTemario, 'temario'],
    [/^\/clasificacion$/, vistaClasificacion, 'clasificacion'],
  ];

  async function enrutar() {
    navegacion += 1;
    const [ruta, consulta = ''] = (location.hash.slice(1) || '/').split('?');
    const query = new URLSearchParams(consulta);
    const encontrada = rutas.find(([patron]) => patron.test(ruta));
    if (!encontrada) return ir('#/');
    const [patron, vista, seccion] = encontrada;
    nav.hidden = !seccion;
    for (const a of nav.querySelectorAll('[data-nav]')) {
      if (a.dataset.nav === seccion) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    }
    try {
      await vista(query, ...patron.exec(ruta).slice(1));
    } catch (err) {
      if (err.status === 401) return ir('#/entrar');
      pintar('Error', h('section', { class: 'acceso' },
        h('h1', null, 'Algo ha fallado'),
        h('p', { class: 'entradilla' }, err.message || 'Ha ocurrido un error inesperado.'),
        h('p', null, h('button', { type: 'button', class: 'boton', onclick: enrutar }, 'Reintentar'))));
    }
  }

  document.getElementById('salir').addEventListener('click', async () => {
    await api('POST', '/api/logout', {}).catch(() => {});
    ir('#/entrar');
  });
  window.addEventListener('hashchange', enrutar);
  enrutar();
})();
