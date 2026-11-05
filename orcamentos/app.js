"use strict";
const $ = id => document.getElementById(id);

/* ===== Pacotes ===== */
const BASE = ["Logotipo principal","Logotipo secundário","Logotipo alternativo","Submarca","Símbolo","Estampa (Pattern)","Paleta de cores","Tipografia"];
const ARQ = "Arquivos em PNG, JPG, PDF, AI e EPS", BON = ["5 capas para Destaques do Instagram","Marca d'água"];
const PK = {
 essencial:{n:"Pacote Essencial",p:250,ds:"Ideal para quem deseja iniciar sua marca com uma identidade profissional.",i:[...BASE,"Cartão de visita","Mockups profissionais",ARQ],b:BON},
 profissional:{n:"Pacote Profissional",p:400,ds:"Para marcas que desejam uma apresentação mais completa e estratégica.",i:[...BASE,"3 artes para papelaria","Mockups profissionais",ARQ],b:BON},
 premium:{n:"Pacote Premium",p:550,ds:"A solução completa para construir uma marca forte, profissional e memorável.",i:[...BASE,"Papelaria completa","Mockups profissionais",ARQ],b:BON},
 personalizado:{n:"Pacote Personalizado",p:300,ds:"Uma solução feita sob medida para as necessidades do seu negócio.",i:["Logotipo principal","Marca d'água","Paleta de cores","Tipografia"],b:[]},
 naming:{n:"Naming",p:100,ds:"Criação do nome da sua marca, com estudo de opções alinhadas ao seu negócio.",i:["Até 10 opções de nomes","Apresentação das opções com justificativa","Verificação inicial de disponibilidade nas redes sociais"],b:[]}
};
const ORD = [["essencial","Essencial"],["profissional","Profissional"],["premium","Premium"],["personalizado","Personalizado"],["naming","Somente Naming"]];
let sel = "essencial";

const brl = v => "R$ " + v.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2});
const lines = s => s.split("\n").map(x => x.trim()).filter(Boolean);
const slug = s => (s||"").normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^A-Za-z0-9]+/g,"-").replace(/^-|-$/g,"") || "Cliente";
const norm = s => (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
const say = (t, el = "msg") => { $(el).textContent = t; };

/* ===== Armazenamento local (fica no aparelho) ===== */
const KEY = "creativity.orcamentos.v1";
function loadAll(){ try { const a = JSON.parse(localStorage.getItem(KEY) || "[]"); return Array.isArray(a) ? a : []; } catch { return []; } }
function saveAll(a){ try { localStorage.setItem(KEY, JSON.stringify(a)); return true; } catch { return false; } }

/* ===== Formulário ===== */
function setPkUI(k){
 sel = k;
 $("naming").parentElement.hidden = k == "naming";
 $("urg").parentElement.hidden = k == "naming";
 if (k == "naming") { $("naming").checked = false; $("urg").checked = false; }
 document.querySelectorAll("#pk button").forEach(b => b.setAttribute("aria-pressed", b.dataset.k == k));
}
function loadPk(k){
 const p = PK[k];
 $("preco").value = p.p; $("itens").value = p.i.join("\n"); $("bonus").value = p.b.join("\n");
 $("naming").checked = false;
 setPkUI(k); draw();
}
ORD.forEach(([k,l]) => {
 const b = document.createElement("button");
 b.type = "button"; b.dataset.k = k; b.innerHTML = `${l}<small>${brl(PK[k].p)}</small>`;
 b.onclick = () => loadPk(k);
 $("pk").appendChild(b);
});

function novoNumero(){
 const h = new Date();
 return String(h.getFullYear()).slice(2) + String(h.getMonth()+1).padStart(2,"0") + String(h.getDate()).padStart(2,"0") + "-" + String(Math.floor(Math.random()*90)+10);
}
function hojeISO(){ const h = new Date(); return new Date(h.getTime() - h.getTimezoneOffset()*60000).toISOString().slice(0,10); }

function fill(id, arr){ const u = $(id); u.innerHTML = ""; arr.forEach(t => { const li = document.createElement("li"); li.textContent = t; u.appendChild(li); }); }
function calc(){
 const pr = Math.max(0, +$("preco").value || 0), nm = $("naming").checked && sel != "naming" ? 100 : 0, ug = $("urg").checked ? 50 : 0, ds = Math.max(0, +$("desc").value || 0);
 return {pr, nm, ug, ds, tot: Math.max(0, pr + nm + ug - ds)};
}
function fmtData(iso){ const d = iso ? new Date(iso + "T12:00") : new Date(); return d.toLocaleDateString("pt-BR",{day:"2-digit",month:"long",year:"numeric"}); }

function draw(){
 const p = PK[sel], c = calc(), it = lines($("itens").value), bo = lines($("bonus").value);
 $("p_cli").textContent = $("cli").value.trim() || "Nome da cliente";
 const mar = $("mar").value.trim(); $("p_marw").hidden = !mar; $("p_mar").textContent = mar;
 $("p_num").textContent = "Nº " + ($("num").value.trim() || "—");
 $("p_dt").textContent = fmtData($("dt").value);
 $("p_sub").textContent = sel == "naming" ? "Naming" : c.nm ? "Identidade Visual + Naming" : "Identidade Visual";
 $("p_pk").textContent = p.n.toUpperCase(); $("p_ds").textContent = p.ds;
 const half = Math.ceil(it.length/2); fill("p_i1", it.slice(0,half)); fill("p_i2", it.slice(half));
 fill("p_b", bo); $("p_bw").hidden = !bo.length;
 const v = $("p_vals"); v.innerHTML = "";
 const row = (a,b,neg) => { const r = document.createElement("div"); r.className = "l" + (neg ? " neg" : ""); r.innerHTML = "<span></span><span></span>"; r.children[0].textContent = a; r.children[1].textContent = b; v.appendChild(r); };
 row(p.n, brl(c.pr)); if (c.nm) row("Naming (até 10 opções de nomes)", brl(c.nm)); if (c.ug) row("Taxa de urgência", brl(c.ug)); if (c.ds) row("Desconto", "− " + brl(c.ds), true);
 const t = document.createElement("div"); t.className = "tot"; t.innerHTML = "<span>Total</span><strong></strong>"; t.querySelector("strong").textContent = brl(c.tot); v.appendChild(t);
 const e = Math.round(c.tot*50)/100, r2 = Math.round((c.tot-e)*100)/100, pg = $("pag").value;
 const forma = pg == "pix" ? "Pagamento via <b>PIX</b>." : pg == "cartao" ? "Pagamento no <b>cartão de crédito</b> (valor sujeito a acréscimo da operadora)." : "Pagamento via <b>PIX</b> ou <b>cartão de crédito</b> (no cartão, valor sujeito a acréscimo da operadora).";
 $("p_pag").innerHTML = `<b>50% (${brl(e)})</b> antes de começar o projeto.<br><b>50% (${brl(r2)})</b> após a arte aprovada.<br>${forma}`;
 $("p_prazo").innerHTML = (c.ug ? "<b>7 a 10 dias úteis</b> (urgência)" : "<b>7 a 20 dias úteis</b>") + ", contados a partir do início do projeto na agenda, podendo variar conforme o tempo de aprovação e retorno da cliente.<br>" + (sel == "naming" ? "Ajustes nas opções de nomes conforme o briefing." : "<b>3 rodadas de ajustes</b> inclusas.");
 const ob = $("obs").value.trim(); $("p_obs").textContent = ob; $("p_obs").hidden = !ob;
 $("p_et").hidden = sel == "naming";
 $("litens").firstChild.textContent = sel == "naming" ? "O que está incluso (um por linha)" : "Itens inclusos (um por linha)";
}
document.querySelectorAll("#f input,#f select,#f textarea").forEach(e => e.addEventListener("input", draw));

function fit(){ const w = $("stage").clientWidth; if (!w) return; const s = w/794; $("scaler").style.transform = `scale(${s})`; $("stage").style.height = 1123*s + "px"; }
window.addEventListener("resize", fit);

/* ===== Estado do orçamento ===== */
const CAMPOS = ["cli","mar","dt","num","preco","itens","bonus","desc","pag","obs"];
function getState(){
 const s = {pk: sel, naming: $("naming").checked, urg: $("urg").checked};
 CAMPOS.forEach(k => s[k] = $(k).value);
 s.total = calc().tot;
 return s;
}
function setState(s){
 CAMPOS.forEach(k => { if (s[k] != null) $(k).value = s[k]; });
 setPkUI(PK[s.pk] ? s.pk : "essencial");
 $("naming").checked = !!s.naming && sel != "naming";
 $("urg").checked = !!s.urg && sel != "naming";
 draw();
}
function novo(){
 setState({cli:"", mar:"", dt: hojeISO(), num: novoNumero(), desc: 0, pag: "pix", obs: "", pk: "essencial", naming: false, urg: false});
 loadPk("essencial");
}

/* Salva (ou atualiza, pelo nº) o orçamento atual */
function salvar(silencioso){
 const s = getState();
 if (!s.num.trim()) { s.num = novoNumero(); $("num").value = s.num; draw(); }
 s.atualizado = new Date().toISOString();
 const all = loadAll(), i = all.findIndex(o => o.num == s.num);
 if (i >= 0) { s.criado = all[i].criado || s.atualizado; all[i] = s; } else { s.criado = s.atualizado; all.unshift(s); }
 all.sort((a,b) => (b.atualizado||"").localeCompare(a.atualizado||""));
 const ok = saveAll(all);
 renderLista();
 if (!silencioso) say(ok ? "Orçamento salvo em “Meus orçamentos”." : "Não consegui salvar neste aparelho (armazenamento indisponível).");
 return ok;
}

/* ===== PDF ===== */
async function gerarPDF(){
 if (!window.html2canvas || !window.jspdf) throw new Error("libs");
 const host = document.createElement("div");
 host.style.cssText = "position:fixed;left:-12000px;top:0;width:794px";
 const cl = $("page").cloneNode(true); cl.removeAttribute("id"); host.appendChild(cl); document.body.appendChild(host);
 try {
  await document.fonts.ready;
  await Promise.all([...cl.querySelectorAll("img")].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
  const cv = await html2canvas(cl, {scale:2, backgroundColor:"#EDE6D0", useCORS:true, logging:false});
  const doc = new window.jspdf.jsPDF({unit:"mm", format:"a4", orientation:"portrait"});
  doc.addImage(cv.toDataURL("image/jpeg", .93), "JPEG", 0, 0, 210, 297);
  doc.setProperties({title: "Orçamento Creativity – " + ($("cli").value || ""), author: "Thaís Nascimento · Creativity"});
  const nome = "Orcamento-Creativity-" + slug($("cli").value) + ($("num").value.trim() ? "-" + slug($("num").value) : "") + ".pdf";
  return {blob: doc.output("blob"), nome};
 } finally { host.remove(); }
}
function baixarBlob(blob, nome){
 const url = URL.createObjectURL(blob), a = document.createElement("a");
 a.href = url; a.download = nome; a.rel = "noopener";
 document.body.appendChild(a); a.click(); a.remove();
 setTimeout(() => URL.revokeObjectURL(url), 30000);
}
async function acaoPDF(modo, btn, msgEl = "msg", salvarAntes = true){
 btn.disabled = true; say(modo == "share" ? "Preparando o PDF para compartilhar…" : "Gerando o PDF…", msgEl);
 try {
  if (salvarAntes) salvar(true);
  const {blob, nome} = await gerarPDF();
  if (modo == "share") {
   const file = new File([blob], nome, {type: "application/pdf"});
   await navigator.share({files: [file], title: "Orçamento Creativity"});
   say("PDF compartilhado" + (salvarAntes ? " e orçamento salvo." : "."), msgEl);
  } else {
   baixarBlob(blob, nome);
   say("PDF baixado (" + nome + ")" + (salvarAntes ? " e orçamento salvo." : "."), msgEl);
  }
 } catch (e) {
  if (e && e.name == "AbortError") say("Compartilhamento cancelado.", msgEl);
  else if (e && e.message == "libs") say("O app ainda está carregando. Tente de novo em alguns segundos.", msgEl);
  else { console.error(e); say("Não consegui gerar o PDF agora. Tente de novo.", msgEl); }
 } finally { btn.disabled = false; }
}
$("pdf").onclick = () => acaoPDF("download", $("pdf"));
const podeCompartilhar = (() => { try { return !!navigator.canShare && navigator.canShare({files: [new File([""], "t.pdf", {type: "application/pdf"})]}); } catch { return false; } })();
$("share").hidden = !podeCompartilhar;
$("share").onclick = () => acaoPDF("share", $("share"));
$("salvar").onclick = () => salvar(false);
$("novo").onclick = () => { novo(); say("Novo orçamento em branco."); $("cli").focus(); };

$("wpp").onclick = async () => {
 const c = calc(), p = PK[sel], nome = ($("cli").value.trim().split(" ")[0]) || "";
 const t = `Oi${nome ? ", " + nome : ""}! Tudo bem? 😊\nSegue o seu orçamento da Creativity: ${p.n}${c.nm ? " + Naming" : ""}, no valor total de ${brl(c.tot)}.\nPara reservar a sua vaga na agenda, a entrada é de 50% (${brl(Math.round(c.tot*50)/100)}) e o restante após a arte aprovada.\nQualquer dúvida estou por aqui! ✨`;
 try { await navigator.clipboard.writeText(t); say("Mensagem copiada. É só colar no WhatsApp."); } catch { say(t); }
};

/* ===== Abas ===== */
function aba(qual){
 const lista = qual == "lista";
 $("tab-novo").setAttribute("aria-selected", !lista); $("tab-lista").setAttribute("aria-selected", lista);
 $("view-novo").hidden = lista; $("view-lista").hidden = !lista;
 if (!lista) requestAnimationFrame(fit); else renderLista();
 try { history.replaceState(null, "", lista ? "#meus" : "#"); } catch {}
}
$("tab-novo").onclick = () => aba("novo");
$("tab-lista").onclick = () => aba("lista");

/* ===== Meus orçamentos ===== */
function renderLista(){
 const all = loadAll(), q = norm($("busca").value).trim();
 $("cnt").textContent = all.length;
 const fil = q ? all.filter(o => norm([o.cli, o.mar, PK[o.pk]?.n, o.num].join(" ")).includes(q)) : all;
 const ul = $("lst"); ul.innerHTML = "";
 $("vazio").hidden = all.length > 0;
 fil.forEach(o => {
  const li = document.createElement("li"); li.className = "card";
  li.innerHTML = `<div class="top"><div><h3></h3><p class="sub"></p></div><div class="val"></div></div><div class="meta"></div>
   <div class="act"><button type="button" class="btn sm p" data-a="pdf">Baixar PDF</button><button type="button" class="btn sm" data-a="abrir">Abrir e editar</button><button type="button" class="btn sm danger" data-a="del">Excluir</button></div>`;
  li.querySelector("h3").textContent = o.cli || "Sem nome";
  li.querySelector(".sub").textContent = [PK[o.pk]?.n || "Pacote", o.naming ? "+ Naming" : "", o.mar ? "· " + o.mar : ""].filter(Boolean).join(" ");
  li.querySelector(".val").textContent = brl(+o.total || 0);
  li.querySelector(".meta").textContent = "Nº " + (o.num || "—") + " · " + fmtData(o.dt);
  li.querySelector('[data-a="abrir"]').onclick = () => { setState(o); aba("novo"); say("Orçamento Nº " + o.num + " aberto. As alterações são salvas ao tocar em Salvar ou Baixar PDF."); window.scrollTo({top:0}); };
  li.querySelector('[data-a="pdf"]').onclick = async e => {
   const atual = getState(); setState(o);
   await acaoPDF("download", e.currentTarget, "msg2", false);
   setState(atual);
  };
  li.querySelector('[data-a="del"]').onclick = () => {
   if (!confirm("Excluir o orçamento de " + (o.cli || "Sem nome") + " (Nº " + o.num + ")?")) return;
   saveAll(loadAll().filter(x => x.num != o.num)); renderLista(); say("Orçamento excluído.", "msg2");
  };
  ul.appendChild(li);
 });
 if (all.length && !fil.length) say("Nenhum orçamento encontrado para essa busca.", "msg2");
}
$("busca").addEventListener("input", () => { say("", "msg2"); renderLista(); });

$("exportar").onclick = () => {
 const all = loadAll();
 if (!all.length) { say("Não há orçamentos para exportar.", "msg2"); return; }
 baixarBlob(new Blob([JSON.stringify({app: "orcamentos-creativity", versao: 1, exportado: new Date().toISOString(), orcamentos: all}, null, 2)], {type: "application/json"}), "backup-orcamentos-creativity-" + hojeISO() + ".json");
 say("Backup exportado com " + all.length + " orçamento(s).", "msg2");
};
$("importar").onchange = async e => {
 const f = e.target.files[0]; e.target.value = ""; if (!f) return;
 try {
  const d = JSON.parse(await f.text()), lst = Array.isArray(d) ? d : d.orcamentos;
  if (!Array.isArray(lst)) throw 0;
  const all = loadAll(); let n = 0;
  lst.filter(o => o && typeof o == "object" && o.num).forEach(o => {
   const i = all.findIndex(x => x.num == o.num);
   if (i < 0) { all.push(o); n++; } else if ((o.atualizado||"") > (all[i].atualizado||"")) { all[i] = o; n++; }
  });
  all.sort((a,b) => (b.atualizado||"").localeCompare(a.atualizado||""));
  saveAll(all); renderLista(); say(n + " orçamento(s) importado(s).", "msg2");
 } catch { say("Arquivo de backup inválido.", "msg2"); }
};

/* ===== Instalação (PWA) ===== */
let promptInstalar = null;
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); promptInstalar = e; $("instalar").hidden = false; });
$("instalar").onclick = async () => { if (!promptInstalar) return; promptInstalar.prompt(); await promptInstalar.userChoice.catch(() => {}); promptInstalar = null; $("instalar").hidden = true; };
window.addEventListener("appinstalled", () => { $("instalar").hidden = true; });
const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform == "MacIntel" && navigator.maxTouchPoints > 1);
let dispensouIOS = false; try { dispensouIOS = localStorage.getItem("creativity.ios-dica") == "1"; } catch {}
if (ios && !standalone && !dispensouIOS) { $("ios").hidden = false; $("ios").onclick = () => { $("ios").hidden = true; try { localStorage.setItem("creativity.ios-dica","1"); } catch {} }; }
if ("serviceWorker" in navigator && location.protocol != "file:") navigator.serviceWorker.register("sw.js").catch(() => {});

/* ===== Início ===== */
novo();
renderLista();
if (location.hash == "#meus") aba("lista"); else fit();
document.fonts && document.fonts.ready.then(fit);
