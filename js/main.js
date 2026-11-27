(() => {
  const D = window.DADOS, $ = s => document.querySelector(s);
  const WA = '5561998132804';

  /* topo e gaveta */
  const topo = $('#topo'), burger = $('#burger'), gaveta = $('#gaveta');
  const sol = () => topo.classList.toggle('sol', scrollY > 40 || !gaveta.hidden);
  addEventListener('scroll', sol, { passive: true }); sol();
  const fechaG = () => { gaveta.hidden = true; burger.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; sol(); };
  burger.addEventListener('click', () => {
    const abre = gaveta.hidden; gaveta.hidden = !abre; burger.setAttribute('aria-expanded', String(abre));
    document.body.style.overflow = abre ? 'hidden' : ''; sol();
  });
  gaveta.querySelectorAll('a').forEach(a => a.addEventListener('click', fechaG));

  /* fechamentos: carrossel */
  const car = $('#car');
  D.fech.forEach((f, i) => {
    const el = document.createElement('figure'); el.className = 'slide' + (i === 0 ? ' at' : '');
    el.innerHTML = `<div class="fr"><img src="img/fech/${f.n}.webp" alt="Fechamento ${f.t.toLowerCase()}, ${f.l}, por Vinny Spades" width="1100" height="1467"></div><figcaption><b>${f.t}</b>${f.l}</figcaption>`;
    car.appendChild(el);
  });
  const slides = [...car.children], fN = $('#fN');
  let atual = 0;
  const marca = () => {
    const c = car.scrollLeft + car.clientWidth / 2; let best = 0, d = 1e9;
    slides.forEach((s, i) => { const m = s.offsetLeft + s.offsetWidth / 2, k = Math.abs(m - c); if (k < d) { d = k; best = i; } });
    atual = best; slides.forEach((s, i) => s.classList.toggle('at', i === best)); fN.textContent = `${best + 1} / ${slides.length}`;
  };
  const vai = i => { i = (i + slides.length) % slides.length; const s = slides[i]; car.scrollTo({ left: s.offsetLeft - (car.clientWidth - s.offsetWidth) / 2, behavior: 'smooth' }); };
  let rt; car.addEventListener('scroll', () => { cancelAnimationFrame(rt); rt = requestAnimationFrame(marca); }, { passive: true });
  $('#fPrev').addEventListener('click', () => vai(atual - 1));
  $('#fNext').addEventListener('click', () => vai(atual + 1));
  car.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); vai(atual + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); vai(atual - 1); } });
  slides.forEach((s, i) => s.addEventListener('click', () => { if (i !== atual) vai(i); }));
  addEventListener('resize', marca);

  /* trabalhos: grade + filtros + ver mais */
  const grade = $('#grade'), mais = $('#mais'); const LIM = 24;
  let filtro = 'todos', aberto = false, lista = [];
  const pinta = () => {
    lista = D.obras.filter(o => filtro === 'todos' || o.c === filtro);
    const vis = aberto ? lista : lista.slice(0, LIM);
    grade.innerHTML = vis.map((o, i) => `<button class="item" data-i="${i}" aria-label="Ampliar: ${o.t}"><img src="img/obra/${o.n}.webp" alt="${o.t}, tatuagem ${o.c === 'oriental' ? 'oriental' : 'blackwork'} de Vinny Spades" width="720" height="900"><span>${o.t}</span></button>`).join('');
    mais.hidden = aberto || lista.length <= LIM;
  };
  document.querySelectorAll('.filtros button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.filtros button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    filtro = b.dataset.f; aberto = false; pinta();
  }));
  mais.addEventListener('click', () => { aberto = true; pinta(); });
  pinta();

  /* spades */
  $('#spGrade').innerHTML = D.spades.map((s, i) => `<figure class="rev" data-s="${i}"><div class="fr"><img src="img/spades/${s.n}.webp" alt="Tatuagem da série Spades número ${s.num}, desenhada dentro do naipe de espadas" width="800" height="1000"></div><figcaption>Spades ${s.num}</figcaption></figure>`).join('');

  /* coberturas */
  $('#cob').innerHTML = D.cob.map(c => `<div class="par rev"><figure><div class="fr"><img src="img/cob/${c.a}.webp" alt="${c.t}: tatuagem antiga, antes da cobertura" width="800" height="1000"></div><figcaption>Antes</figcaption></figure><figure><div class="fr"><img src="img/cob/${c.b}.webp" alt="${c.t}: depois da cobertura feita pelo Vinny" width="800" height="1000"></div><figcaption>Depois</figcaption></figure><p class="par-t">${c.t}</p></div>`).join('');

  /* mundo */
  $('#mundoG').innerHTML = D.mundo.map(m => `<figure class="rev"><div class="fr"><img src="img/mundo/m${m.i}.webp" alt="Tatuagem do Vinny cicatrizada, em ${m.l}" width="800" height="1000"></div><figcaption><b>${m.l}</b>${m.o}</figcaption></figure>`).join('');

  /* lightbox */
  const lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  let fonte = [], pos = 0, ultimoFoco = null;
  const mostra = () => { const o = fonte[pos]; lbImg.src = o.src; lbImg.alt = o.alt; lbCap.textContent = o.t; };
  const abreLb = (arr, i) => { fonte = arr; pos = i; ultimoFoco = document.activeElement; mostra(); lb.hidden = false; document.body.style.overflow = 'hidden'; $('#lbX').focus(); };
  const fechaLb = () => { lb.hidden = true; document.body.style.overflow = ''; if (ultimoFoco) ultimoFoco.focus(); };
  grade.addEventListener('click', e => {
    const b = e.target.closest('.item'); if (!b) return;
    abreLb(lista.map(o => ({ src: `img/obra/${o.n}g.webp`, alt: o.t, t: o.t })), +b.dataset.i);
  });
  $('#spGrade').addEventListener('click', e => {
    const f = e.target.closest('figure'); if (!f) return;
    abreLb(D.spades.map(s => ({ src: `img/spades/${s.n}.webp`, alt: `Série Spades ${s.num}`, t: `Spades ${s.num}` })), +f.dataset.s);
  });
  $('#lbX').addEventListener('click', fechaLb);
  $('#lbP').addEventListener('click', () => { pos = (pos - 1 + fonte.length) % fonte.length; mostra(); });
  $('#lbN').addEventListener('click', () => { pos = (pos + 1) % fonte.length; mostra(); });
  lb.addEventListener('click', e => { if (e.target === lb) fechaLb(); });
  addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') fechaLb();
    if (e.key === 'ArrowRight') $('#lbN').click();
    if (e.key === 'ArrowLeft') $('#lbP').click();
  });
  let tx = 0;
  lb.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) (d < 0 ? $('#lbN') : $('#lbP')).click(); });

  /* formulário → WhatsApp */
  const form = $('#form'), ideia = form.ideia;
  $('#lbQuero').addEventListener('click', () => {
    const t = fonte[pos].t; fechaLb();
    ideia.value = `Quero algo no estilo da peça "${t}" do portfólio.` + (ideia.value ? '\n' + ideia.value : '');
    if (t.startsWith('Spades')) { const r = form.querySelector('input[value="Série Spades"]'); if (r) r.checked = true; }
    $('#marcar').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => form.nome.focus({ preventScroll: true }), 700);
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const nome = form.nome.value.trim(); const erro = $('#erroNome');
    if (!nome) { erro.hidden = false; form.nome.focus(); return; }
    erro.hidden = true;
    const v = n => (form.querySelector(`[name="${n}"]:checked`) || {}).value || '';
    const L = [`Olá, Vinny! Sou *${nome}* e quero um orçamento.`, ''];
    if (v('tema')) L.push(`*Tema:* ${v('tema')}`);
    L.push(`*Cobertura:* ${v('cob') || 'Não'}`);
    if (form.local.value.trim()) L.push(`*Local:* ${form.local.value.trim()}`);
    if (form.tam.value) L.push(`*Tamanho:* ${form.tam.value}`);
    if (form.disp.value) L.push(`*Disponibilidade:* ${form.disp.value}`);
    if (ideia.value.trim()) L.push(`*Ideia:* ${ideia.value.trim()}`);
    L.push('', '(pedido enviado pelo site)');
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent(L.join('\n'))}`, '_blank', 'noopener');
  });
  form.nome.addEventListener('input', () => { if (form.nome.value.trim()) $('#erroNome').hidden = true; });

  /* entrada ao rolar */
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('vis'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.rev').forEach(el => io.observe(el));
})();
