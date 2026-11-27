(() => {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const D = window.DADOS || {}, WA = '5561998132804';
  const seta = d => `<svg viewBox="0 0 18 12" aria-hidden="true"><path d="${d ? 'M0 6h17M12 1l5 5-5 5' : 'M18 6H1M6 1L1 6l5 5'}" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>`;

  /* topo + menu */
  const topo = $('.topo'), btn = $('.menuBtn'), menu = $('.menu');
  const rola = () => topo.classList.toggle('ativo', scrollY > 40 || menu.classList.contains('on'));
  addEventListener('scroll', rola, { passive: true }); rola();
  const abre = v => {
    menu.classList.toggle('on', v); btn.classList.toggle('aberto', v);
    btn.setAttribute('aria-expanded', String(v)); btn.setAttribute('aria-label', v ? 'Fechar menu' : 'Abrir menu');
    document.body.style.overflow = v ? 'hidden' : ''; rola();
  };
  btn.addEventListener('click', () => abre(!menu.classList.contains('on')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && menu.classList.contains('on')) abre(false); });

  /* abertura */
  const hero = $('.hero');
  if (hero) requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add('on')));

  /* entrada ao rolar */
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('vis'); io.unobserve(x.target); } }), { rootMargin: '0px 0px -12% 0px' });
  $$('.obs').forEach(el => io.observe(el));

  /* 01 carrossel de fechamentos (troca em fade, como a referência) */
  const car = $('.car');
  if (car && D.fech) {
    const F = D.fech, N = F.length; let i = 0;
    const sl = { l: car.querySelector('.l'), c: car.querySelector('.c'), r: car.querySelector('.r') };
    const leg = $('.s1 .leg'), pag = $('.pag');
    pag.innerHTML = F.map(() => '<i></i>').join('');
    const url = k => `img/t/${F[(k + N) % N].n}g.webp`;
    const troca = (el, src, alt) => {
      const velha = el.querySelector('img');
      const nova = new Image(); nova.src = src; nova.alt = alt; nova.style.opacity = 0; nova.decoding = 'async';
      el.appendChild(nova);
      const vai = () => requestAnimationFrame(() => { nova.style.opacity = 1; if (velha) { velha.style.opacity = 0; setTimeout(() => velha.remove(), 750); } });
      nova.complete ? vai() : nova.onload = vai;
    };
    const mostra = (k, primeira) => {
      i = (k + N) % N; const f = F[i];
      const alt = (x) => `Fechamento ${F[(x + N) % N].t.toLowerCase()}, tatuagem de Vinny Spades`;
      if (primeira) {
        sl.l.innerHTML = `<img src="${url(i - 1)}" alt="">`; sl.c.innerHTML = `<img src="${url(i)}" alt="${alt(i)}">`; sl.r.innerHTML = `<img src="${url(i + 1)}" alt="">`;
      } else { troca(sl.l, url(i - 1), ''); troca(sl.c, url(i), alt(i)); troca(sl.r, url(i + 1), ''); }
      leg.innerHTML = `${f.t}<span>${f.a}</span>`;
      [...pag.children].forEach((p, x) => p.classList.toggle('on', x === i));
    };
    mostra(0, true);
    F.forEach((_, k) => { const im = new Image(); im.src = url(k); });
    $('.s1 .ant').addEventListener('click', () => mostra(i - 1));
    $('.s1 .prox').addEventListener('click', () => mostra(i + 1));
    sl.l.addEventListener('click', () => mostra(i - 1)); sl.r.addEventListener('click', () => mostra(i + 1));
    let x0 = null;
    car.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    car.addEventListener('touchend', e => { if (x0 === null) return; const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 40) mostra(i + (d < 0 ? 1 : -1)); x0 = null; });
  }

  /* grades (tatuagens, desenhos, coberturas) */
  const lista = [];
  const item = (o, pasta, rot) => {
    const k = lista.length; lista.push({ src: `img/${pasta}/${o.n}g.webp`, t: o.t, s: rot });
    return `<button class="it" data-k="${k}" aria-label="Ampliar: ${o.t}"><img src="img/${pasta}/${o.n}.webp" alt="${o.t}, ${pasta === 'd' ? 'desenho' : 'tatuagem'} de Vinny Spades" width="760" height="1140"><span class="i"><small>${rot}</small><b>${o.t}</b></span></button>`;
  };
  const grupos = $('#grupos');
  if (grupos && grupos.dataset.tipo === 'tat') {
    const G = [
      ['fechamentos', 'Fechamentos', D.fech],
      ['oriental', 'Oriental', D.obras.filter(o => o.c === 'oriental')],
      ['blackwork', 'Blackwork', D.obras.filter(o => o.c === 'blackwork')],
      ['spades', 'Spades', D.spades]
    ];
    grupos.innerHTML = G.map(([id, nome, arr]) => `<div class="grade" data-g="${id}"><div class="rot"><span>${nome}</span></div>${arr.map(o => item(o, 't', o.a)).join('')}</div>`).join('');
  }
  if (grupos && grupos.dataset.tipo === 'des') {
    grupos.innerHTML = `<div class="grade" data-g="caderno"><div class="rot"><span>Caderno</span></div>${D.des.map(o => item(o, 'd', 'Caderno de estudos')).join('')}</div>`;
  }
  if (grupos && grupos.dataset.tipo === 'cob') {
    const C = [['cob01', 'cob03', 'Caveira e serpente'], ['cob08', 'cob09', 'Carneiro'], ['cob10', 'cob11', 'Besouro']];
    grupos.innerHTML = C.map(([a, b, t]) => `<div class="grade"><div class="rot"><span>${t.split(" ")[0]}</span></div>${item({ n: a, t: 'Antes' }, 'cob', t)}${item({ n: b, t: 'Depois' }, 'cob', t)}</div>`).join('');
    lista.forEach(o => { o.src = o.src.replace('g.webp', '.webp'); o.t = o.s + ': ' + o.t.toLowerCase(); });
  }
  $$('.filtros button').forEach(b => b.addEventListener('click', () => {
    $$('.filtros button').forEach(x => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    $$('#grupos .grade').forEach(g => g.hidden = b.dataset.f !== 'todos' && g.dataset.g !== b.dataset.f);
  }));

  /* lightbox */
  const lb = $('.lb');
  if (lb) {
    const img = lb.querySelector('img'), cap = lb.querySelector('.cap'), quero = lb.querySelector('.quero');
    let p = 0, foco = null;
    const vis = () => lista.map((o, k) => k).filter(k => !document.querySelector(`.it[data-k="${k}"]`).closest('.grade').hidden);
    const mostra = () => { const o = lista[p]; img.src = o.src; img.alt = o.t; cap.textContent = o.t; quero.href = `orcamento.html?ideia=${encodeURIComponent('Quero algo no estilo da peça "' + o.t + '" do portfólio.')}`; };
    const passo = d => { const v = vis(); const k = v.indexOf(p); p = v[(k + d + v.length) % v.length]; mostra(); };
    document.addEventListener('click', e => {
      const b = e.target.closest('.it'); if (!b) return;
      p = +b.dataset.k; foco = b; mostra(); lb.hidden = false; document.body.style.overflow = 'hidden'; lb.querySelector('.x').focus();
    });
    const fecha = () => { lb.hidden = true; document.body.style.overflow = ''; if (foco) foco.focus(); };
    lb.querySelector('.x').addEventListener('click', fecha);
    lb.querySelector('.ant').innerHTML = seta(0); lb.querySelector('.prox').innerHTML = seta(1);
    lb.querySelector('.ant').addEventListener('click', () => passo(-1));
    lb.querySelector('.prox').addEventListener('click', () => passo(1));
    lb.addEventListener('click', e => { if (e.target === lb) fecha(); });
    addEventListener('keydown', e => { if (lb.hidden) return; if (e.key === 'Escape') fecha(); if (e.key === 'ArrowRight') passo(1); if (e.key === 'ArrowLeft') passo(-1); });
    let x0 = 0;
    lb.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', e => { const d = e.changedTouches[0].clientX - x0; if (Math.abs(d) > 50) passo(d < 0 ? 1 : -1); });
  }

  /* formulário → WhatsApp */
  const form = $('#form');
  if (form) {
    const q = new URLSearchParams(location.search).get('ideia');
    if (q) { form.ideia.value = q; if (/Spades/.test(q)) { const r = form.querySelector('input[value="Série Spades"]'); if (r) r.checked = true; } }
    const erro = $('#erroNome');
    form.nome.addEventListener('input', () => { if (form.nome.value.trim()) erro.hidden = true; });
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nome = form.nome.value.trim();
      if (!nome) { erro.hidden = false; form.nome.focus(); return; }
      const v = n => (form.querySelector(`[name="${n}"]:checked`) || {}).value || '';
      const L = [`Olá, Vinny! Sou *${nome}* e quero um orçamento.`, ''];
      if (v('tema')) L.push(`*Tema:* ${v('tema')}`);
      L.push(`*Cobertura:* ${v('cob') || 'Não'}`);
      if (form.local.value.trim()) L.push(`*Local:* ${form.local.value.trim()}`);
      if (form.tam.value) L.push(`*Tamanho:* ${form.tam.value}`);
      if (form.disp.value) L.push(`*Disponibilidade:* ${form.disp.value}`);
      if (form.ideia.value.trim()) L.push(`*Ideia:* ${form.ideia.value.trim()}`);
      L.push('', '(pedido enviado pelo site)');
      window.open(`https://wa.me/${WA}?text=${encodeURIComponent(L.join('\n'))}`, '_blank', 'noopener');
    });
  }
})();
