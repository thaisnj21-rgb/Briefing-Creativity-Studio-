/* ==========================================================
   Calculadora Creativity Studio — lógica
   ========================================================== */
(function () {
  "use strict";

  const $ = (sel) => document.querySelector(sel);

  const form = $("#form-orcamento");
  const inCliente = $("#cliente");
  const inServico = $("#servico");
  const inOutro = $("#servico-outro");
  const campoOutro = $("#campo-outro");
  const inPreco = $("#preco");

  const outTotal = $("#valor-total");
  const outEntrada = $("#valor-entrada");
  const outSaldo = $("#valor-saldo");

  const resumo = $("#resumo");
  const toast = $("#toast");

  const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const fmt = (centavos) => brl.format(centavos / 100);

  $("#ano").textContent = new Date().getFullYear();

  /* ---------- Preço: máscara de moeda (trabalha em centavos) ---------- */
  function lerCentavos() {
    const digitos = inPreco.value.replace(/\D/g, "");
    return digitos ? parseInt(digitos, 10) : 0;
  }

  function aplicarMascara() {
    const digitos = inPreco.value.replace(/\D/g, "").replace(/^0+/, "").slice(0, 11);
    if (!digitos) {
      inPreco.value = "";
      return;
    }
    const centavos = parseInt(digitos, 10);
    inPreco.value = (centavos / 100).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  /* ---------- Cálculo ---------- */
  // Entrada = metade arredondada para cima; saldo = o restante.
  // Assim entrada + saldo sempre fecham exatamente o total.
  function calcular(totalCentavos) {
    const entrada = Math.ceil(totalCentavos / 2);
    const saldo = totalCentavos - entrada;
    return { total: totalCentavos, entrada, saldo };
  }

  function atualizarValores() {
    const v = calcular(lerCentavos());
    outTotal.textContent = fmt(v.total);
    outEntrada.textContent = fmt(v.entrada);
    outSaldo.textContent = fmt(v.saldo);
    return v;
  }

  /* ---------- Serviço ---------- */
  function nomeServico() {
    return inServico.value === "__outro" ? inOutro.value.trim() : inServico.value;
  }

  inServico.addEventListener("change", () => {
    const outro = inServico.value === "__outro";
    campoOutro.classList.toggle("oculto", !outro);
    if (outro) inOutro.focus();
    limparErro("servico");
  });

  /* ---------- Validação ---------- */
  function definirErro(campo, msg) {
    const el = document.querySelector(`[data-erro="${campo}"]`);
    if (el) {
      el.textContent = msg;
      el.closest(".campo").classList.add("invalido");
    }
  }

  function limparErro(campo) {
    const el = document.querySelector(`[data-erro="${campo}"]`);
    if (el) {
      el.textContent = "";
      el.closest(".campo").classList.remove("invalido");
    }
  }

  function validar() {
    let primeiroInvalido = null;
    const marcar = (campo, el, msg) => {
      definirErro(campo, msg);
      if (!primeiroInvalido) primeiroInvalido = el;
    };

    ["cliente", "servico", "servico-outro", "preco"].forEach(limparErro);

    if (!inCliente.value.trim()) marcar("cliente", inCliente, "Informe o nome do cliente.");
    if (!inServico.value) marcar("servico", inServico, "Selecione um serviço.");
    else if (inServico.value === "__outro" && !inOutro.value.trim())
      marcar("servico-outro", inOutro, "Descreva o serviço.");
    if (lerCentavos() <= 0) marcar("preco", inPreco, "Informe um preço maior que zero.");

    if (primeiroInvalido) primeiroInvalido.focus();
    return !primeiroInvalido;
  }

  inCliente.addEventListener("input", () => limparErro("cliente"));
  inOutro.addEventListener("input", () => limparErro("servico-outro"));
  inPreco.addEventListener("input", () => {
    aplicarMascara();
    atualizarValores();
    limparErro("preco");
  });

  /* ---------- Resumo ---------- */
  let ultimoOrcamento = null;

  function gerarNumero() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    return `ORC-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  }

  function textoResumo(o) {
    return [
      "*Creativity Studio — Orçamento*",
      `Nº ${o.numero} · ${o.data}`,
      "",
      `Cliente: ${o.cliente}`,
      `Serviço: ${o.servico}`,
      "",
      `Valor total: ${fmt(o.total)}`,
      `Entrada (50%): ${fmt(o.entrada)} — na aprovação`,
      `Saldo restante (50%): ${fmt(o.saldo)} — na entrega`,
      "",
      "Orçamento válido por 15 dias.",
    ].join("\n");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validar()) return;

    const v = atualizarValores();
    ultimoOrcamento = {
      numero: gerarNumero(),
      data: new Date().toLocaleDateString("pt-BR"),
      cliente: inCliente.value.trim(),
      servico: nomeServico(),
      ...v,
    };

    $("#resumo-numero").textContent = ultimoOrcamento.numero;
    $("#resumo-data").textContent = ultimoOrcamento.data;
    $("#resumo-cliente").textContent = ultimoOrcamento.cliente;
    $("#resumo-servico").textContent = ultimoOrcamento.servico;
    $("#resumo-entrada").textContent = fmt(v.entrada);
    $("#resumo-saldo").textContent = fmt(v.saldo);
    $("#resumo-total").textContent = fmt(v.total);

    resumo.classList.remove("oculto");
    resumo.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  form.addEventListener("reset", () => {
    // aguarda o navegador limpar os campos
    setTimeout(() => {
      campoOutro.classList.add("oculto");
      ["cliente", "servico", "servico-outro", "preco"].forEach(limparErro);
      atualizarValores();
      resumo.classList.add("oculto");
      ultimoOrcamento = null;
      inCliente.focus();
    }, 0);
  });

  /* ---------- Ações do resumo ---------- */
  function mostrarToast(msg) {
    toast.textContent = msg;
    toast.classList.add("visivel");
    clearTimeout(mostrarToast.t);
    mostrarToast.t = setTimeout(() => toast.classList.remove("visivel"), 2200);
  }

  async function copiar(texto) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // alternativa para navegadores sem Clipboard API (ex.: arquivo local)
      const ta = document.createElement("textarea");
      ta.value = texto;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    }
  }

  $("#btn-copiar").addEventListener("click", async () => {
    if (!ultimoOrcamento) return;
    const ok = await copiar(textoResumo(ultimoOrcamento));
    mostrarToast(ok ? "Resumo copiado ✓" : "Não foi possível copiar");
  });

  $("#btn-whatsapp").addEventListener("click", () => {
    if (!ultimoOrcamento) return;
    const url = "https://wa.me/?text=" + encodeURIComponent(textoResumo(ultimoOrcamento));
    window.open(url, "_blank", "noopener");
  });

  $("#btn-imprimir").addEventListener("click", () => window.print());

  atualizarValores();
})();
