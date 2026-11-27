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

// ====== HERO: cinza → cor ======
const hero = document.querySelector(".hero");
const ligar = () => requestAnimationFrame(() => hero.classList.add("on"));
const img0 = hero.querySelector(".mono img");
if (img0.complete) ligar(); else { img0.addEventListener("load", ligar); setTimeout(ligar, 1400); }

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
