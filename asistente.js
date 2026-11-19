(() => {
  const toggle = document.querySelector('#assistant-toggle');
  const panel = document.querySelector('#assistant-panel');
  const close = document.querySelector('#assistant-close');
  const form = document.querySelector('#assistant-form');
  const input = document.querySelector('#assistant-input');
  const messages = document.querySelector('#assistant-messages');
  const normalizar = texto => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const ignorar = new Set(['como','para','puedo','quiero','donde','cuando','cual','tengo','una','del','los','las','que','con','por','necesito','este','esta','desde','hacer']);
  function abrir(visible) {
    panel.hidden = !visible;
    toggle.setAttribute('aria-expanded', String(visible));
    if (visible) input.focus(); else toggle.focus();
  }
  function agregar(texto, clase) {
    const div = document.createElement('div');
    div.className = clase;
    div.textContent = texto;
    messages.append(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }
  function responder(pregunta) {
    const texto = pregunta.trim();
    if (!texto) return;
    agregar(texto, 'assistant-question');
    const palabras = normalizar(texto).match(/[a-z0-9]+/g)?.filter(p => p.length > 2 && !ignorar.has(p)) || [];
    const resultados = guides.map(guia => {
      const titulo = normalizar(guia.title), etiquetas = normalizar(guia.tags), cuerpo = normalizar(`${guia.intro} ${guia.steps.join(' ')}`);
      const puntos = palabras.reduce((total, palabra) => total + (titulo.includes(palabra) ? 4 : 0) + (etiquetas.includes(palabra) ? 3 : 0) + (cuerpo.includes(palabra) ? 1 : 0), 0);
      const consulta = normalizar(texto);
      const esIngreso = /ingres|entrar|rendir|postulante/.test(consulta);
      const esCreacion = /crear|nueva|configurar|generar/.test(consulta);
      const ajuste = guia.id === 'postulante' && esIngreso ? 8 : guia.id === 'crear-examen' && esCreacion ? 8 : 0;
      return { guia, puntos: puntos + (puntos ? ajuste : 0) };
    }).filter(r => r.puntos > 0).sort((a, b) => b.puntos - a.puntos);
    if (!resultados.length) { agregar('No encontré una guía para esa pregunta. Prueba con palabras como cámara, examen, sesión o reportes.', 'assistant-answer'); return; }
    const guia = resultados[0].guia;
    const respuesta = agregar(`${guia.title}: ${guia.intro}`, 'assistant-answer');
    const lista = document.createElement('ol');
    guia.steps.forEach(paso => { const li = document.createElement('li'); li.textContent = paso; lista.append(li); });
    respuesta.append(lista);
    if (guia.note) { const nota = document.createElement('p'); nota.textContent = guia.note; respuesta.append(nota); }
    const enlace = document.createElement('button');
    enlace.type = 'button'; enlace.className = 'assistant-guide-link'; enlace.textContent = 'Abrir guía completa';
    enlace.addEventListener('click', () => {
      role = 'todos'; search.value = ''; render();
      document.querySelector('#guias').open = true;
      const destino = document.getElementById(`guia-${guia.id}`);
      if (destino) { destino.open = true; destino.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      abrir(false);
    });
    respuesta.append(enlace);
    messages.scrollTop = messages.scrollHeight;
  }
  toggle.addEventListener('click', () => abrir(panel.hidden));
  close.addEventListener('click', () => abrir(false));
  form.addEventListener('submit', e => { e.preventDefault(); responder(input.value); input.value = ''; input.focus(); });
  document.querySelectorAll('[data-question]').forEach(boton => boton.addEventListener('click', () => responder(boton.dataset.question)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) abrir(false); });
})();
