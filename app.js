import { db, firebaseListo } from "./firebase-config.js";
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

/* ============ Configuración editable ============ */
const WHATSAPP_VENDEDOR = "51999888777";          // código de país + número, sin + ni espacios
const MARCA = "Xiomara AI";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ============ Menú móvil ============ */
const menuBtn = $("#menu-btn"), menu = $("#menu-movil");
menuBtn.addEventListener("click", () => {
  const abierto = menu.classList.toggle("hidden") === false;
  menuBtn.setAttribute("aria-expanded", String(abierto));
});
$$("a", menu).forEach(a => a.addEventListener("click", () => { menu.classList.add("hidden"); menuBtn.setAttribute("aria-expanded", "false"); }));

/* ============ Formulario de leads (Firestore) ============ */
function normalizarTelefono(v) {
  let d = String(v).replace(/\D/g, "");
  if (d.length === 11 && d.startsWith("51")) d = d.slice(2);
  return /^9\d{8}$/.test(d) ? "51" + d : null;
}
const limpio = v => String(v || "").replace(/\s+/g, " ").trim();

async function guardarLead(lead) {
  if (!firebaseListo) throw new Error("Firebase sin configurar en firebase-config.js");
  const guardar = addDoc(collection(db, "leads"), { ...lead, creadoEn: serverTimestamp() });
  const limite = new Promise((_, rej) => setTimeout(() => rej(new Error("tiempo de espera agotado")), 8000));
  await Promise.race([guardar, limite]);
}

function montarFormulario(contenedor) {
  contenedor.appendChild($("#tpl-form").content.cloneNode(true));
  const form = $("form", contenedor), msg = $(".msg", form), btn = $("button[type=submit]", form);
  const aviso = (t, ok = false) => { msg.textContent = t; msg.className = "msg text-sm min-h-[1.25rem] " + (ok ? "text-emerald-600" : "text-red-600"); };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    const f = new FormData(form);
    if (f.get("website")) return;                                   // trampa anti-bots: si se llena, se ignora
    const lead = { nombre: limpio(f.get("nombre")), negocio: limpio(f.get("negocio")), rubro: limpio(f.get("rubro")), telefono: normalizarTelefono(f.get("telefono")) };
    if (lead.nombre.length < 2) return aviso("Escribe tu nombre.");
    if (lead.negocio.length < 2) return aviso("Escribe el nombre de tu negocio.");
    if (!lead.rubro) return aviso("Selecciona tu rubro.");
    if (!lead.telefono) return aviso("Ingresa un celular peruano válido de 9 dígitos (ej. 999 888 777).");
    try { if (Date.now() - Number(sessionStorage.getItem("lead_ts") || 0) < 30000) return aviso("Ya enviaste tus datos. Espera unos segundos."); } catch {}

    btn.disabled = true; btn.textContent = "Enviando…"; aviso("");
    let guardado = true;
    try { await guardarLead({ ...lead, origen: location.href.slice(0, 300) }); }
    catch (err) { guardado = false; console.error("No se guardó el lead:", err); }
    try { sessionStorage.setItem("lead_ts", String(Date.now())); } catch {}

    const texto = `Hola ${MARCA}, soy ${lead.nombre} de ${lead.negocio} (${lead.rubro}). Quiero probar 7 días sin riesgo el agente de ventas con IA. Mi WhatsApp: ${lead.telefono.slice(2)}`;
    aviso(guardado ? "¡Listo! Te llevamos a WhatsApp…" : "Te llevamos a WhatsApp para continuar…", guardado);
    setTimeout(() => { location.href = `https://wa.me/${WHATSAPP_VENDEDOR}?text=${encodeURIComponent(texto)}`; }, 900);
  });
}
montarFormulario($("#form-pagina"));
montarFormulario($("#form-modal"));

/* ============ Modal accesible ============ */
const modal = $("#modal"); let ultimoFoco = null;
const enfocables = () => $$("a[href],button:not([disabled]),input:not(.hidden),select,textarea", modal);
function abrirModal() {
  ultimoFoco = document.activeElement; modal.classList.remove("hidden"); document.body.style.overflow = "hidden";
  menu.classList.add("hidden"); ($("input[name=nombre]", modal) || $("#modal-cerrar")).focus();
}
function cerrarModal() { modal.classList.add("hidden"); document.body.style.overflow = ""; if (ultimoFoco) ultimoFoco.focus(); }
$$("[data-open-modal]").forEach(b => b.addEventListener("click", abrirModal));
$("#modal-cerrar").addEventListener("click", cerrarModal);
modal.addEventListener("mousedown", e => { if (e.target === modal) cerrarModal(); });
document.addEventListener("keydown", e => {
  if (modal.classList.contains("hidden")) return;
  if (e.key === "Escape") return cerrarModal();
  if (e.key === "Tab") {
    const l = enfocables(), a = l[0], z = l[l.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
});
