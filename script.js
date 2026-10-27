

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
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('menuToggle').setAttribute('aria-expanded', 'false');
  });
});

const menuToggle = document.getElementById('menuToggle');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const opened = document.getElementById('sidebar').classList.toggle('open');
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
  if (emptyDocs) emptyDocs.hidden = visible !== 0;
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

  document.getElementById('dialogTitle').textContent = title;
  document.getElementById('dialogText').textContent =
    details[title] ||
    'Este espacio está preparado para añadir contenido o conectar un recurso corporativo. No hay todavía un archivo o servicio conectado.';

  dialog.showModal();
}

document.querySelectorAll('[data-doc]').forEach(btn => {
  btn.addEventListener('click', () => showDialog(btn.dataset.doc));
});

const dialogClose = document.getElementById('dialogClose');
const dialogOk = document.getElementById('dialogOk');

if (dialogClose) dialogClose.addEventListener('click', () => dialog.close());
if (dialogOk) dialogOk.addEventListener('click', () => dialog.close());

if (dialog) {
  dialog.addEventListener('click', e => {
    if (e.target === dialog) dialog.close();
  });
}

/* FORMULARIO DE CONSULTAS ECOFLY CON GOOGLE FORMS */

const ecoflyForm = document.getElementById('ecoflyGoogleForm');
const googleFormsFrame = document.querySelector(
  'iframe[name="googleFormsFrame"]'
);
const formHint = document.getElementById('formHint');

if (ecoflyForm && googleFormsFrame) {
  let envioIniciado = false;

  ecoflyForm.addEventListener('submit', function () {
    // El navegador valida los campos obligatorios antes de llegar aquí.
    envioIniciado = true;

    if (formHint) {
      formHint.textContent = 'Enviando consulta...';
      formHint.style.color = '#2B2D42';
    }
  });

  googleFormsFrame.addEventListener('load', function () {
    if (!envioIniciado) return;

    envioIniciado = false;

    alert('Consulta enviada');

    ecoflyForm.reset();

    if (formHint) {
      formHint.textContent =
        'Completa los campos y pulsa «Enviar consulta».';
      formHint.style.color = '#278a00';
    }
  });
}

/* NAVEGACIÓN AUTOMÁTICA ENTRE SECCIONES */

const sections = [...document.querySelectorAll('main section[id]')];

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (visible) setActive(visible.target.id);
  }, {
    rootMargin: '-20% 0px -65% 0px',
    threshold: [0, 0.2, 0.5]
  });

  sections.forEach(s => observer.observe(s));
}
