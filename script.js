// HackUni 2027 · Interacciones: menú móvil, acordeón y formulario
(function () {
  'use strict';

  /* ---------- Menú móvil ---------- */
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('menu-principal');
  const navLabel = navToggle.querySelector('.visually-hidden');

  function setMenu(open) {
    navToggle.setAttribute('aria-expanded', String(open));
    navList.classList.toggle('is-open', open);
    navLabel.textContent = open ? 'Cerrar menú' : 'Abrir menú';
  }

  navToggle.addEventListener('click', function () {
    setMenu(navToggle.getAttribute('aria-expanded') !== 'true');
  });

  // Cierra el menú al elegir un enlace
  navList.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenu(false);
  });

  // Cierra con Escape y regresa el foco al botón
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      navToggle.focus();
    }
  });

  /* ---------- Acordeón (FAQ) ---------- */
  const triggers = document.querySelectorAll('.accordion-trigger');

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const expanded = trigger.getAttribute('aria-expanded') === 'true';
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      trigger.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  });

  /* ---------- Contador regresivo ---------- */
  // 15 de marzo de 2027, 9:00 en CDMX (UTC-6, sin horario de verano desde 2022)
  const eventStart = new Date('2027-03-15T09:00:00-06:00').getTime();
  const countdown = document.getElementById('countdown');
  const countdownSr = document.getElementById('countdown-sr');
  const units = {};
  countdown.querySelectorAll('[data-unit]').forEach(function (el) {
    units[el.dataset.unit] = el;
  });
  let lastSrMinute = null;
  let timerId = null;

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function plural(n, uno, varios) {
    return n + ' ' + (n === 1 ? uno : varios);
  }

  function updateCountdown() {
    const diff = eventStart - Date.now();

    // Ya empezó: reemplaza los números por un aviso
    if (diff <= 0) {
      clearInterval(timerId);
      countdown.textContent = '';
      const done = document.createElement('p');
      done.className = 'countdown-done';
      done.textContent = '¡El hackeo ya comenzó!';
      countdown.append(done);
      return;
    }

    const totalMin = Math.floor(diff / 60000);
    const dias = Math.floor(totalMin / 1440);
    const horas = Math.floor((totalMin % 1440) / 60);
    const minutos = totalMin % 60;
    const segundos = Math.floor((diff % 60000) / 1000);

    units.dias.textContent = dias;
    units.horas.textContent = pad(horas);
    units.minutos.textContent = pad(minutos);
    units.segundos.textContent = pad(segundos);

    // Texto para lectores de pantalla: solo cambia cada minuto
    if (totalMin !== lastSrMinute) {
      lastSrMinute = totalMin;
      countdownSr.textContent = 'Faltan ' + plural(dias, 'día', 'días') + ', ' +
        plural(horas, 'hora', 'horas') + ' y ' + plural(minutos, 'minuto', 'minutos') +
        ' para el arranque del 15 de marzo de 2027 a las 9:00, hora de Ciudad de México.';
    }
  }

  countdown.hidden = false;
  updateCountdown();
  timerId = setInterval(updateCountdown, 1000);

  /* ---------- Formulario de registro ---------- */
  const form = document.getElementById('form-registro');
  const confirmation = document.getElementById('registro-confirmacion');
  const eduEmailPattern = /^[^\s@]+@[^\s@]+\.edu\.mx$/i;
  const matriculaPattern = /^\d{8}$/;

  // Reglas por campo: devuelven el mensaje de error o '' si es válido
  const rules = [
    {
      id: 'nombre',
      check: function (v) { return v ? '' : 'El nombre es obligatorio.'; }
    },
    {
      id: 'correo',
      check: function (v) {
        if (!v) return 'El correo es obligatorio.';
        if (!eduEmailPattern.test(v)) return 'Usa tu correo institucional que termine en .edu.mx, por ejemplo nombre@universidad.edu.mx.';
        return '';
      }
    },
    {
      id: 'matricula',
      check: function (v) {
        if (!v) return 'La matrícula es obligatoria.';
        if (!matriculaPattern.test(v)) return 'La matrícula debe tener exactamente 8 dígitos, solo números.';
        return '';
      }
    },
    {
      id: 'carrera',
      check: function (v) { return v ? '' : 'Escribe tu carrera.'; }
    },
    {
      id: 'semestre',
      check: function (v) { return v ? '' : 'Selecciona tu semestre.'; }
    },
    {
      id: 'equipo-tamano',
      check: function (v) { return v ? '' : 'Selecciona el tamaño de tu equipo.'; }
    }
  ];

  function showError(field, message) {
    const error = document.getElementById(field.id + '-error');
    error.textContent = message;
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
  }

  function validateField(rule) {
    const field = document.getElementById(rule.id);
    const message = rule.check(field.value.trim());
    showError(field, message);
    return !message;
  }

  function validateTeam() {
    const radios = form.querySelectorAll('input[name="tiene-equipo"]');
    const valid = Array.prototype.some.call(radios, function (r) { return r.checked; });
    document.getElementById('tiene-equipo-error').textContent = valid ? '' : 'Indica si ya tienes equipo.';
    radios.forEach(function (r) { r.setAttribute('aria-invalid', valid ? 'false' : 'true'); });
    return valid;
  }

  // Valida al salir del campo (si tiene texto) y revalida al escribir si ya tenía error
  rules.forEach(function (rule) {
    const field = document.getElementById(rule.id);
    field.addEventListener('blur', function () {
      if (field.value.trim() || field.getAttribute('aria-invalid') === 'true') validateField(rule);
    });
    field.addEventListener('input', function () {
      if (field.getAttribute('aria-invalid') === 'true') validateField(rule);
    });
  });

  form.addEventListener('change', function (event) {
    if (event.target.name === 'tiene-equipo') validateTeam();
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    let firstInvalid = null;
    rules.forEach(function (rule) {
      if (!validateField(rule) && !firstInvalid) firstInvalid = document.getElementById(rule.id);
    });
    if (!validateTeam() && !firstInvalid) firstInvalid = form.querySelector('input[name="tiene-equipo"]');

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // Sin servidor: solo mostramos la confirmación
    const nombre = document.getElementById('nombre').value.trim().split(/\s+/)[0];
    const correo = document.getElementById('correo').value.trim();
    showConfirmation(nombre, correo);
  });

  function showConfirmation(nombre, correo) {
    confirmation.textContent = '';

    const title = document.createElement('h3');
    title.textContent = '¡Listo, ' + nombre + '! Tu registro quedó guardado.';

    const text = document.createElement('p');
    text.textContent = 'Te enviaremos los detalles a ' + correo + '. Nos vemos el 15 de marzo de 2027 a las 9:00.';

    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'btn btn-secondary';
    again.textContent = 'Registrar a otra persona';
    again.addEventListener('click', function () {
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
      confirmation.hidden = true;
      form.hidden = false;
      document.getElementById('nombre').focus();
    });

    confirmation.append(title, text, again);
    form.hidden = true;
    confirmation.hidden = false;
    confirmation.focus();
  }
})();
