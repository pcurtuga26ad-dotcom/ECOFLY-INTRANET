
const todayLabel = document.getElementById('todayLabel');

if (todayLabel) {
  todayLabel.textContent = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  }).format(new Date());
}

const navLinks = [...document.querySelectorAll('.nav-link')];
const currentPage = document.getElementById('currentPage');

const pageNames = {
  inicio: 'Inicio',
  empresa: 'Quiénes somos',
  documentacion: 'Documentación',
  equipo: 'Directorio del equipo',
  eventos: 'Calendario y eventos',
  noticias: 'Noticias y avisos',
  ayuda: 'Contacto y ayuda'
};

function setActive(id) {
  navLinks.forEach(a => {
    const active = a.getAttribute('href') === '#' + id;

    a.classList.toggle('active', active);

    if (active && currentPage) {
      currentPage.textContent = pageNames[id] || 'ECOFLY';
    }
  });
}

navLinks.forEach(a => {
  a.addEventListener('click', () => {
    setActive(a.hash.slice(1));

    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');

    if (sidebar) sidebar.classList.remove('open');

    if (menuToggle) {
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

const menuToggle = document.getElementById('menuToggle');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const sidebar = document.getElementById('sidebar');

    if (!sidebar) return;

    const opened = sidebar.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(opened));
  });
}

const docSearch = document.getElementById('docSearch');
const filterButtons = [...document.querySelectorAll('.filter-btn')];

let selectedFilter = 'all';

function filterDocs() {
  if (!docSearch) return;

  const term = (docSearch.value || '').toLocaleLowerCase('es');
  let visible = 0;

  document.querySelectorAll('.doc-card').forEach(card => {
    const matchesCategory =
      selectedFilter === 'all' ||
      card.dataset.category === selectedFilter;

    const matchesTerm = (
      (card.dataset.search || '') + ' ' + card.innerText
    ).toLocaleLowerCase('es').includes(term);

    const show = matchesCategory && matchesTerm;

    card.hidden = !show;

    if (show) visible++;
  });

  const emptyDocs = document.getElementById('emptyDocs');

  if (emptyDocs) {
    emptyDocs.hidden = visible !== 0;
  }
}

if (docSearch) {
  docSearch.addEventListener('input', filterDocs);
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    selectedFilter = btn.dataset.filter;

    filterButtons.forEach(b => {
      b.classList.toggle('selected', b === btn);
    });

    filterDocs();
  });
});

const dialog = document.getElementById('infoDialog');

const details = {
  'Protocolo empresarial':
    'La documentación del proyecto describe normas de respeto, puntualidad, responsabilidad, igualdad, comunicación profesional y comportamiento seguro. Para convertir esta tarjeta en un enlace, añade la URL del documento aprobado en Google Drive.',

  'Prevención de riesgos laborales':
    'Añade aquí el documento oficial de PRL y las instrucciones específicas para las tareas de campo, taller, baterías y equipos de protección. La tarjeta todavía no está conectada a un archivo.',

  'Acogida y formación':
    'El material del proyecto contempla una bienvenida, presentación del equipo y responsables, explicación de funciones, normas internas y formación inicial en drones, baterías y prevención de riesgos.',

  'Atención al cliente y comunicación':
    'El proyecto establece un trato respetuoso, información transparente, respuestas en un plazo razonable, gestión de reclamaciones y seguimiento posventa. Enlaza aquí el documento completo.',

  'Igualdad y responsabilidad social corporativa':
    'El contenido del proyecto recoge igualdad de oportunidades, no discriminación, bienestar laboral, formación continua, reducción de residuos y compromiso con clientes y entorno rural.',

  'Organización de eventos':
    'El proyecto contempla un evento interno, AgroTech Conecta, y la planificación de eventos externos. Añade los protocolos, presupuestos y calendarios aprobados cuando estén disponibles.',

  'Directorio de trabajadores':
    'Para conectar el directorio, prepara una vista de Google Sheets con solo los datos profesionales necesarios y permisos restringidos. El Excel adjunto contiene datos de personal y campos salariales, por lo que no se publica directamente en esta demo.',

  'Calendario de eventos':
    'Puedes insertar un Google Calendar y compartirlo únicamente con las personas de la organización. La fecha de AgroTech Conecta está pendiente de confirmar.'
};

function showDialog(title) {
  if (!dialog) return;

  const dialogTitle = document.getElementById('dialogTitle');
  const dialogText = document.getElementById('dialogText');

  if (dialogTitle) dialogTitle.textContent = title;

  if (dialogText) {
    dialogText.textContent =
      details[title] ||
      'Este espacio está preparado para añadir contenido o conectar un recurso corporativo. No hay todavía un archivo o servicio conectado.';
  }

  dialog.showModal();
}

document.querySelectorAll('[data-doc]').forEach(btn => {
  btn.addEventListener('click', () => {
    showDialog(btn.dataset.doc);
  });
});

const dialogClose = document.getElementById('dialogClose');
const dialogOk = document.getElementById('dialogOk');

if (dialogClose && dialog) {
  dialogClose.addEventListener('click', () => dialog.close());
}

if (dialogOk && dialog) {
  dialogOk.addEventListener('click', () => dialog.close());
}

if (dialog) {
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
}

/* ==================================================
   FORMULARIO ECOFLY
   AVISO ANIMADO AL ENVIAR UNA CONSULTA
   ================================================== */

const ecoflyForm = document.getElementById('ecoflyGoogleForm');

const googleFormsFrame = document.querySelector(
  'iframe[name="googleFormsFrame"]'
);

const formHint = document.getElementById('formHint');

if (ecoflyForm && googleFormsFrame) {
  let envioIniciado = false;
  let toastTimer = null;

  // Crear estilos para el aviso animado.
  const toastStyles = document.createElement('style');

  toastStyles.textContent = `
    #ecoflyToast {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -40%) scale(0.9);
      z-index: 99999;

      display: flex;
      align-items: center;
      gap: 16px;

      width: max-content;
      max-width: calc(100vw - 32px);
      box-sizing: border-box;
      padding: 22px 28px;

      background: #ffffff;
      color: #2B2D42;
      border: 1px solid #e4eadf;
      border-radius: 18px;
      box-shadow: 0 18px 60px rgba(43, 45, 66, 0.22);

      opacity: 0;
      visibility: hidden;
      pointer-events: none;

      transition:
        opacity 0.3s ease,
        transform 0.3s ease,
        visibility 0.3s ease;

      font-family: inherit;
    }

    #ecoflyToast.ecofly-toast-visible {
      opacity: 1;
      visibility: visible;
      transform: translate(-50%, -50%) scale(1);
    }

    #ecoflyToast .ecofly-toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      width: 52px;
      height: 52px;
      border-radius: 50%;

      background: #e8f8df;
      color: #278a00;

      font-size: 30px;
      font-weight: bold;

      animation: ecoflyPop 0.45s ease both;
    }

    #ecoflyToast .ecofly-toast-title {
      margin: 0 0 5px;
      font-size: 18px;
      font-weight: 750;
    }

    #ecoflyToast .ecofly-toast-text {
      margin: 0;
      color: #697080;
      font-size: 14px;
      line-height: 1.5;
    }

    @keyframes ecoflyPop {
      0% {
        transform: scale(0.4);
      }

      70% {
        transform: scale(1.15);
      }

      100% {
        transform: scale(1);
      }
    }

    @media (max-width: 480px) {
      #ecoflyToast {
        gap: 12px;
        padding: 18px;
      }

      #ecoflyToast .ecofly-toast-icon {
        width: 44px;
        height: 44px;
        font-size: 25px;
      }

      #ecoflyToast .ecofly-toast-title {
        font-size: 16px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      #ecoflyToast,
      #ecoflyToast .ecofly-toast-icon {
        animation: none;
        transition: none;
      }
    }
  `;

  document.head.appendChild(toastStyles);

  // Crear el mensaje centrado.
  const toast = document.createElement('div');

  toast.id = 'ecoflyToast';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');

  toast.innerHTML = `
    <div class="ecofly-toast-icon" aria-hidden="true">✓</div>
    <div>
      <p class="ecofly-toast-title">
        ¡Consulta enviada correctamente!
      </p>
      <p class="ecofly-toast-text">
        Tu mensaje se ha enviado al equipo de ECOFLY.
      </p>
    </div>
  `;

  document.body.appendChild(toast);

  // Mostrar el aviso durante tres segundos.
  function mostrarAviso() {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }

    toast.classList.remove('ecofly-toast-visible');

    // Reiniciar la animación si se envían consultas seguidas.
    void toast.offsetWidth;

    toast.classList.add('ecofly-toast-visible');

    toastTimer = setTimeout(() => {
      toast.classList.remove('ecofly-toast-visible');
    }, 3000);
  }

  // Detectar el envío del formulario.
  ecoflyForm.addEventListener('submit', function () {
    envioIniciado = true;

    if (formHint) {
      formHint.textContent = 'Enviando consulta...';
      formHint.style.color = '#2B2D42';
    }
  });

  // Mostrar el aviso cuando responde el iframe de Google Forms.
  googleFormsFrame.addEventListener('load', function () {
    if (!envioIniciado) return;

    envioIniciado = false;

    mostrarAviso();

    ecoflyForm.reset();

    if (formHint) {
      formHint.textContent =
        'Completa los campos y pulsa «Enviar consulta».';

      formHint.style.color = '#278a00';
    }
  });
}

/* ==================================================
   NAVEGACIÓN AUTOMÁTICA ENTRE SECCIONES
   ================================================== */

const sections = [...document.querySelectorAll('main section[id]')];

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) {
      setActive(visible.target.id);
    }
  }, {
    rootMargin: '-20% 0px -65% 0px',
    threshold: [0, 0.2, 0.5]
  });

  sections.forEach(s => observer.observe(s));
}
