// ====== CONFIGURAÇÃO ======
// CONFIRMAR com o Vinny: número dele (61 99813-2804) ou do Portal (61 99619-3615)
const WHATS = "5561998132804";

const MSG = {
  flutuante: () => "Oi, Vinny! Vi seu site e queria conversar sobre uma tatuagem.",
  servicos: (r) => `Oi, Vinny! Vi seu site e quero fazer um fechamento de ${r}. Pode me explicar como funciona?`,
  portfolio: () => "Oi, Vinny! Vi seus trabalhos e gostei muito. Posso te mandar minhas referências?",
  cobertura: () => "Oi, Vinny! Tenho uma tatuagem antiga e queria avaliar uma cobertura. Posso te mandar a foto?",
  faq: () => "Oi, Vinny! Li o site e ainda tenho uma dúvida. Pode me ajudar?",
};
const wa = (t) => `https://wa.me/${WHATS}?text=${encodeURIComponent(t)}`;

const root = document.documentElement;
const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;
root.classList.add("js");

document.querySelectorAll("[data-wa]").forEach((el) => {
  const f = MSG[el.dataset.wa];
  if (!f) return;
  el.href = wa(f(el.dataset.region));
  el.target = "_blank";
  el.rel = "noopener";
});

// ====== HERO: a tinta se espalha a partir da cabeça do dragão (WebGL) ======
const hero = document.querySelector(".hero");
const h1 = hero.querySelector("h1");
const htx = hero.querySelector(".hero-tx");
let modo = ""; // "gl" | "img"
const fallback = () => { if (modo) return; modo = "img"; requestAnimationFrame(() => hero.classList.add("on")); };

const VS = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
const FS = `precision highp float;
uniform sampler2D T;uniform vec2 R,I,F;uniform float t,p,s,k;
float h(vec2 q){return fract(sin(dot(q,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 q){vec2 i=floor(q),f=fract(q);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+1.),f.x),f.y);}
float fb(vec2 q){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*n(q);q=q*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 fc=vec2(gl_FragCoord.x,R.y-gl_FragCoord.y);
 float ar=I.x/I.y;
 float sc=max(R.y/I.y,R.x/I.x*k)*(1.+.07*s)*(1.+.035*(1.-p));
 vec2 uv=(fc-R*.5)/(I*sc)+F;
 vec2 au=uv*vec2(ar,1.);
 float nz=fb(au*2.6+vec2(0.,t*.05));
 float f=length((uv-vec2(F.x+.04,.2))*vec2(ar,1.))*.8+nz*.45;
 float r=p*1.75;
 float m=1.-smoothstep(r-.09,r,f);
 float e=smoothstep(r-.05,r-.025,f)*(1.-smoothstep(r-.025,r-.004,f));
 vec2 w=vec2(fb(au*7.+t*.25),fb(au*7.-t*.25+4.))-.5;
 vec2 su=uv+w*.014*e;
 vec3 c=vec3(0.);
 if(su.x>0.&&su.x<1.&&su.y>0.&&su.y<1.)c=texture2D(T,su).rgb;
 float L=dot(c,vec3(.299,.587,.114));
 c=mix(vec3(L),c,smoothstep(.55,1.,p));
 c=pow(c,vec3(1.06))*m;
 float fade=1.-smoothstep(.72,1.,p);
 float pele=smoothstep(.05,.28,L);
 c+=vec3(.9,.42,.17)*e*fade*pele*(.45+1.1*smoothstep(.42,.78,fb(au*16.+t*.5)));
 float sm=smoothstep(.5,.95,fb(vec2(au.x*2.2,au.y*1.6)+vec2(t*.012,t*.035)));
 float dk=1.-smoothstep(.03,.16,L*m);
 c+=vec3(.6,.6,.63)*sm*.075*dk*smoothstep(.25,.9,p);
 c*=1.-.62*s;
 vec2 vv=fc/R-.5;c*=1.-.55*dot(vv,vv);
 c+=(h(fc+floor(t*24.)*13.)-.5)*.04;
 gl_FragColor=vec4(c,1.);
}`;

const FIXP = (() => { const v = new URLSearchParams(location.search).get("p"); return v === null ? null : +v; })(); // conferência de quadros: ?p=0.4
function iniciaGL() {
  const cv = hero.querySelector("canvas.tinta");
  const img = hero.querySelector(".cor img");
  let gl = cv.getContext("webgl2", { antialias: false, alpha: false });
  const gl2 = !!gl;
  if (!gl) gl = cv.getContext("webgl", { antialias: false, alpha: false });
  if (!gl) return false;
  const sh = (tp, src) => { const o = gl.createShader(tp); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; };
  const v = sh(gl.VERTEX_SHADER, VS), f = sh(gl.FRAGMENT_SHADER, FS);
  if (!v || !f) return false;
  const pr = gl.createProgram(); gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return false;
  gl.useProgram(pr);
  const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const al = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ["T", "R", "I", "F", "t", "p", "s", "k"].forEach((nm) => (U[nm] = gl.getUniformLocation(pr, nm)));
  const tex = gl.createTexture();
  let pronto = false, t0 = 0, I = [1, 1], F = [0.5, 0.5], kx = 1, src = "";
  let sAlvo = 0, sAt = 0, visivel = true, raf = 0, ultimo = 0;

  function textura(im) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, im);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    if (gl2) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); }
    else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    I = [im.naturalWidth, im.naturalHeight];
    // paisagem: o recorte está no preto, então centraliza o fechamento (bbox 848–2055 de 2400); retrato: cobre a tela
    if (I[0] > I[1]) { F = [0.605, 0.5]; kx = 0; } else { F = [0.5, 0.5]; kx = 1; }
  }
  function carrega() {
    const u = img.currentSrc || img.src;
    if (!u || u === src || !img.complete || !img.naturalWidth) return;
    src = u;
    (img.decode ? img.decode() : Promise.resolve()).then(() => {
      textura(img);
      if (!pronto) {
        if (modo === "img") return;
        pronto = true; modo = "gl"; t0 = performance.now();
        if (reduz) t0 -= 99999;
        hero.classList.add("gl", "on");
      }
      pede();
    }).catch(fallback);
  }
  function tam() {
    const kp = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(hero.clientWidth * kp), hh = Math.round(hero.clientHeight * kp);
    if (cv.width !== w || cv.height !== hh) { cv.width = w; cv.height = hh; gl.viewport(0, 0, w, hh); }
  }
  function quadro(now) {
    raf = 0;
    if (!pronto || !visivel || document.hidden) return;
    const el = (now - t0) / 1000;
    const pr0 = Math.min(1, el / 1.8);
    let p = 0.5 - 0.5 * Math.cos(Math.PI * pr0);
    if (FIXP !== null) p = FIXP;
    sAt += (sAlvo - sAt) * 0.14;
    const mexendo = Math.abs(sAlvo - sAt) > 0.0005 || p < 1;
    if (!mexendo && now - ultimo < 33) { pede(); return; } // fumaça a ~30 fps depois da abertura
    ultimo = now;
    tam();
    gl.uniform1i(U.T, 0); gl.uniform2f(U.R, cv.width, cv.height); gl.uniform2f(U.I, I[0], I[1]);
    gl.uniform2f(U.F, F[0], F[1]); gl.uniform1f(U.k, kx);
    gl.uniform1f(U.t, reduz ? 0 : el); gl.uniform1f(U.p, p); gl.uniform1f(U.s, sAt);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    h1.style.transform = `translate3d(0,${(-sAt * 70).toFixed(1)}px,0)`;
    h1.style.opacity = String(Math.max(0, 1 - sAt * 1.4));
    htx.style.transform = `translate3d(0,${(-sAt * 120).toFixed(1)}px,0)`;
    htx.style.opacity = String(Math.max(0, 1 - sAt * 1.8));
    if (!reduz || mexendo) pede();
  }
  function pede() { if (!raf) raf = requestAnimationFrame(quadro); }
  addEventListener("scroll", () => { sAlvo = Math.min(1, Math.max(0, scrollY / hero.offsetHeight)); pede(); }, { passive: true });
  addEventListener("resize", pede);
  document.addEventListener("visibilitychange", pede);
  if ("IntersectionObserver" in window) new IntersectionObserver(([en]) => { visivel = en.isIntersecting; pede(); }).observe(hero);
  cv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); pronto = false; hero.classList.remove("gl"); modo = "img"; hero.classList.add("on"); });
  img.addEventListener("load", carrega);
  if (img.complete && img.naturalWidth) carrega();
  return true;
}
let okGL = false;
try { okGL = iniciaGL(); } catch (e) { okGL = false; }
if (!okGL) { const i0 = hero.querySelector(".mono img"); if (i0.complete) fallback(); else i0.addEventListener("load", fallback); }
setTimeout(fallback, okGL ? 3500 : 1600); // rede lenta: nunca deixa o hero vazio

// ====== TOPO ======
const topo = document.querySelector(".topo");
const waFixo = document.querySelector(".wa-fixo");
const orc = document.getElementById("orcamento");
let tick = false;
function rolar() {
  const y = scrollY, h = innerHeight;
  topo.classList.toggle("transp", y < h * 0.6 && !menu.classList.contains("aberto"));
  topo.classList.toggle("fino", y > 80);
  const r = orc.getBoundingClientRect();
  waFixo.classList.toggle("vis", y > h * 0.8 && !(r.top < h && r.bottom > 0));
  tick = false;
}
addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(rolar); } }, { passive: true });

// ====== MENU em tela cheia ======
const btn = document.querySelector(".menuBtn");
const menu = document.getElementById("menu");
function abrir(on) {
  btn.setAttribute("aria-expanded", String(on));
  btn.setAttribute("aria-label", on ? "Fechar menu" : "Abrir menu");
  if (on) {
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add("aberto")));
    document.body.style.overflow = "hidden";
  } else {
    menu.classList.remove("aberto");
    document.body.style.overflow = "";
    setTimeout(() => { if (!menu.classList.contains("aberto")) menu.hidden = true; }, 450);
  }
  rolar();
}
btn.addEventListener("click", () => abrir(btn.getAttribute("aria-expanded") !== "true"));
menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => abrir(false)));
addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { abrir(false); btn.focus(); } });
rolar();

// ====== REVELAÇÃO ======
const alvos = [...document.querySelectorAll(".rv, .ln")];
if (reduz || !("IntersectionObserver" in window)) alvos.forEach((el) => el.classList.add("vis"));
else {
  const io = new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("vis"); io.unobserve(en.target); }
  }), { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
  alvos.forEach((el) => io.observe(el));
}

// ====== FAIXA DE FECHAMENTOS ======
const faixa = document.querySelector(".faixa");
const itens = [...faixa.children];
const cont = document.querySelector(".cont b");
const pad = (n) => String(n).padStart(2, "0");
document.querySelectorAll(".seta").forEach((s) => s.addEventListener("click", () => {
  const passo = itens[0].getBoundingClientRect().width + 16;
  faixa.scrollBy({ left: passo * Number(s.dataset.dir), behavior: reduz ? "auto" : "smooth" });
}));
faixa.addEventListener("scroll", () => {
  const passo = itens[0].getBoundingClientRect().width + 16;
  cont.textContent = pad(Math.min(itens.length, Math.round(faixa.scrollLeft / passo) + 1));
}, { passive: true });

// ====== ANTES × DEPOIS ======
document.querySelectorAll(".ad input").forEach((r) => {
  r.addEventListener("input", () => r.parentElement.style.setProperty("--p", r.value + "%"));
});

// ====== ABAS ======
const abas = [...document.querySelectorAll('[role="tab"]')];
function sel(t) {
  abas.forEach((a) => {
    const on = a === t;
    a.setAttribute("aria-selected", String(on));
    a.tabIndex = on ? 0 : -1;
    document.getElementById(a.getAttribute("aria-controls")).hidden = !on;
  });
  t.focus();
}
abas.forEach((t, i) => {
  t.addEventListener("click", () => sel(t));
  t.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") sel(abas[(i + 1) % abas.length]);
    if (e.key === "ArrowLeft") sel(abas[(i - 1 + abas.length) % abas.length]);
  });
});

// ====== FICHA → WHATSAPP ======
document.querySelectorAll("form.form").forEach((f) => f.addEventListener("submit", (e) => {
  e.preventDefault();
  const l = ["Oi, Vinny! Vim pelo site.", "", `*Orçamento: ${f.dataset.type}*`, ""];
  new FormData(f).forEach((v, k) => { v = String(v).trim(); if (v) l.push(`*${k}:* ${v}`); });
  window.open(wa(l.join("\n")), "_blank", "noopener");
  f.querySelector(".status").textContent = "Abrindo o WhatsApp com a sua mensagem pronta.";
}));
