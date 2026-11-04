/* Creativity Studio — Gestão de Clientes */
(function () {
  'use strict';

  const S = window.Store;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------- utilidades ---------- */
  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  function fmtMoney(v) { return money.format(Number(v) || 0); }

  function fmtDate(iso) {
    if (!iso) return '—';
    const d = iso.length === 10 ? new Date(iso + 'T00:00:00') : new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleDateString('pt-BR');
  }

  function fmtDateTime(iso) {
    const d = new Date(iso);
    return isNaN(d) ? '—' : d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  function todayStr() {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 10);
  }

  function initials(name) {
    return (name || '?').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
  }

  function norm(s) {
    return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function safeUrl(url) {
    if (!url) return '';
    const u = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    try { return new URL(u).href; } catch (e) { return ''; }
  }

  function waLink(phone) {
    const digits = String(phone || '').replace(/\D/g, '');
    if (!digits) return '';
    return 'https://wa.me/' + (digits.length <= 11 ? '55' + digits : digits);
  }

  function formData(form) {
    const out = {};
    new FormData(form).forEach((v, k) => { out[k] = typeof v === 'string' ? v.trim() : v; });
    return out;
  }

  function badge(type, key) {
    const map = type === 'client' ? S.CLIENT_STATUS : S.PROJECT_STATUS;
    return `<span class="badge badge-${esc(key)}">${esc(map[key] || key)}</span>`;
  }

  function options(map, selected) {
    return Object.entries(map).map(([k, v]) =>
      `<option value="${esc(k)}"${k === selected ? ' selected' : ''}>${esc(v)}</option>`).join('');
  }

  function download(filename, content, type) {
    const blob = new Blob([content], { type });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  /* ---------- modal ---------- */
  const modal = $('#modal');
  function openModal(title, html, onMount) {
    $('#modalTitle').textContent = title;
    $('#modalBody').innerHTML = html;
    modal.hidden = false;
    document.body.classList.add('no-scroll');
    if (onMount) onMount($('#modalBody'));
    const first = $('input, select, textarea', $('#modalBody'));
    if (first) first.focus();
  }
  function closeModal() {
    modal.hidden = true;
    $('#modalBody').innerHTML = '';
    document.body.classList.remove('no-scroll');
  }
  modal.addEventListener('click', e => {
    if (e.target === modal || e.target.closest('[data-close]')) closeModal();
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !modal.hidden) closeModal(); });

  function confirmAction(message, onYes) {
    openModal('Confirmar', `
      <p>${esc(message)}</p>
      <div class="form-actions">
        <button class="btn" data-close>Cancelar</button>
        <button class="btn btn-danger" id="confirmYes">Excluir</button>
      </div>`, body => {
      $('#confirmYes', body).addEventListener('click', () => { closeModal(); onYes(); });
    });
  }

  /* ---------- formulários ---------- */
  function clientForm(c) {
    c = c || {};
    return `
    <form id="clientForm" class="form-grid">
      <label>Nome do contato *<input name="nome" required value="${esc(c.nome)}"></label>
      <label>Empresa / marca<input name="empresa" value="${esc(c.empresa)}"></label>
      <label>E-mail<input type="email" name="email" value="${esc(c.email)}"></label>
      <label>Telefone / WhatsApp<input name="telefone" value="${esc(c.telefone)}" placeholder="(11) 99999-9999"></label>
      <label>Instagram<input name="instagram" value="${esc(c.instagram)}" placeholder="@marca"></label>
      <label>Site<input name="site" value="${esc(c.site)}" placeholder="www.marca.com.br"></label>
      <label>CPF / CNPJ<input name="documento" value="${esc(c.documento)}"></label>
      <label>Cidade / UF<input name="cidade" value="${esc(c.cidade)}"></label>
      <label>Segmento<input name="segmento" value="${esc(c.segmento)}" placeholder="Moda, gastronomia, saúde..."></label>
      <label>Como nos conheceu<select name="origem">
        ${['', 'Instagram', 'Indicação', 'Google', 'Site', 'WhatsApp', 'Evento', 'Outro']
          .map(o => `<option value="${esc(o)}"${o === (c.origem || '') ? ' selected' : ''}>${o || 'Selecione'}</option>`).join('')}
      </select></label>
      <label>Status<select name="status">${options(S.CLIENT_STATUS, c.status || 'lead')}</select></label>
      <label class="span-2">Observações<textarea name="observacoes" rows="3">${esc(c.observacoes)}</textarea></label>
      <div class="form-actions span-2">
        <button type="button" class="btn" data-close>Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar cliente</button>
      </div>
    </form>`;
  }

  function openClientModal(client) {
    openModal(client ? 'Editar cliente' : 'Novo cliente', clientForm(client), body => {
      $('#clientForm', body).addEventListener('submit', e => {
        e.preventDefault();
        const data = formData(e.target);
        if (!data.nome) return;
        if (client) data.id = client.id;
        const saved = S.saveClient(data);
        closeModal();
        toast(client ? 'Cliente atualizado' : 'Cliente cadastrado');
        if (client) render(); else location.hash = '#/cliente/' + saved.id;
      });
    });
  }

  function projectForm(p, clientSelect) {
    p = p || {};
    const clientField = clientSelect ? `
      <label class="span-2">Cliente *<select name="clienteId" required>
        <option value="">Selecione</option>
        ${S.clients().sort((a, b) => a.nome.localeCompare(b.nome))
          .map(c => `<option value="${esc(c.id)}">${esc(c.nome)}${c.empresa ? ' — ' + esc(c.empresa) : ''}</option>`).join('')}
      </select></label>` : '';
    return `
    <form id="projectForm" class="form-grid">
      ${clientField}
      <label class="span-2">Nome do projeto *<input name="nome" required value="${esc(p.nome)}" placeholder="Ex.: Rebranding 2026"></label>
      <label>Serviço<select name="servico">
        ${S.SERVICES.map(s => `<option${s === p.servico ? ' selected' : ''}>${esc(s)}</option>`).join('')}
      </select></label>
      <label>Status<select name="status">${options(S.PROJECT_STATUS, p.status || 'briefing')}</select></label>
      <label>Valor (R$)<input type="number" name="valor" min="0" step="0.01" value="${esc(p.valor)}"></label>
      <label>Pagamento<select name="pagamento">
        ${['Pendente', 'Sinal pago', 'Pago'].map(o => `<option${o === p.pagamento ? ' selected' : ''}>${o}</option>`).join('')}
      </select></label>
      <label>Início<input type="date" name="inicio" value="${esc(p.inicio || todayStr())}"></label>
      <label>Prazo de entrega<input type="date" name="prazo" value="${esc(p.prazo)}"></label>
      <label class="span-2">Descrição / escopo<textarea name="descricao" rows="3">${esc(p.descricao)}</textarea></label>
      <div class="form-actions span-2">
        <button type="button" class="btn" data-close>Cancelar</button>
        <button type="submit" class="btn btn-primary">Salvar projeto</button>
      </div>
    </form>`;
  }

  function openProjectModal(clientId, project) {
    openModal(project ? 'Editar projeto' : 'Novo projeto', projectForm(project, !clientId), body => {
      $('#projectForm', body).addEventListener('submit', e => {
        e.preventDefault();
        const data = formData(e.target);
        const cid = clientId || data.clienteId;
        delete data.clienteId;
        if (!cid || !data.nome) return;
        data.valor = data.valor === '' ? '' : Number(data.valor);
        if (project) data.id = project.id;
        S.saveProject(cid, data);
        closeModal();
        toast(project ? 'Projeto atualizado' : 'Projeto criado');
        render();
      });
    });
  }

  /* ---------- views ---------- */
  function viewDashboard() {
    const clients = S.clients();
    const projects = S.allProjects();
    const count = st => clients.filter(c => c.status === st).length;
    const open = projects.filter(p => !['entregue', 'cancelado'].includes(p.status));
    const faturado = projects.filter(p => p.status === 'entregue').reduce((s, p) => s + (Number(p.valor) || 0), 0);
    const emAberto = open.reduce((s, p) => s + (Number(p.valor) || 0), 0);
    const today = todayStr();
    const upcoming = open.filter(p => p.prazo).sort((a, b) => a.prazo.localeCompare(b.prazo)).slice(0, 6);
    const recent = clients.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm)).slice(0, 6);

    if (!clients.length) {
      return `
      <div class="empty big">
        <h2>Boas-vindas ao seu CRM ✨</h2>
        <p>Cadastre o primeiro cliente para começar a organizar briefings, projetos e contatos.</p>
        <button class="btn btn-primary" data-action="new-client">+ Cadastrar primeiro cliente</button>
      </div>`;
    }

    return `
    <section class="stats">
      <div class="stat"><span>Clientes</span><strong>${clients.length}</strong></div>
      <div class="stat"><span>Leads</span><strong>${count('lead')}</strong></div>
      <div class="stat"><span>Em negociação</span><strong>${count('negociacao')}</strong></div>
      <div class="stat"><span>Ativos</span><strong>${count('ativo')}</strong></div>
      <div class="stat"><span>Projetos em andamento</span><strong>${open.length}</strong></div>
      <div class="stat"><span>Valor em aberto</span><strong>${fmtMoney(emAberto)}</strong></div>
      <div class="stat"><span>Faturado (entregues)</span><strong>${fmtMoney(faturado)}</strong></div>
    </section>

    <div class="grid-2">
      <section class="card">
        <h3>Próximas entregas</h3>
        ${upcoming.length ? `<ul class="list">${upcoming.map(p => `
          <li>
            <a href="#/cliente/${esc(p.cliente.id)}">
              <strong>${esc(p.nome)}</strong>
              <small>${esc(p.cliente.nome)} · ${esc(p.servico || '')}</small>
            </a>
            <span class="due ${p.prazo < today ? 'late' : ''}">${p.prazo < today ? 'Atrasado · ' : ''}${fmtDate(p.prazo)}</span>
          </li>`).join('')}</ul>` : '<p class="muted">Nenhuma entrega com prazo definido.</p>'}
      </section>
      <section class="card">
        <h3>Clientes atualizados recentemente</h3>
        <ul class="list">${recent.map(c => `
          <li>
            <a href="#/cliente/${esc(c.id)}" class="with-avatar">
              <span class="avatar">${esc(initials(c.nome))}</span>
              <span><strong>${esc(c.nome)}</strong><small>${esc(c.empresa || c.segmento || '')}</small></span>
            </a>
            ${badge('client', c.status)}
          </li>`).join('')}</ul>
      </section>
    </div>`;
  }

  const listState = { q: '', status: '', sort: 'recentes' };

  function filteredClients() {
    const q = norm(listState.q);
    let list = S.clients().filter(c => {
      if (listState.status && c.status !== listState.status) return false;
      if (!q) return true;
      return norm([c.nome, c.empresa, c.email, c.telefone, c.instagram, c.segmento, c.cidade].join(' ')).includes(q);
    });
    if (listState.sort === 'nome') list.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
    else if (listState.sort === 'antigos') list.sort((a, b) => a.criadoEm.localeCompare(b.criadoEm));
    else list.sort((a, b) => b.atualizadoEm.localeCompare(a.atualizadoEm));
    return list;
  }

  function clientRows() {
    const list = filteredClients();
    if (!list.length) return `<div class="empty"><p>Nenhum cliente encontrado.</p></div>`;
    return `
    <div class="table-wrap"><table class="table">
      <thead><tr><th>Cliente</th><th>Contato</th><th>Segmento</th><th>Projetos</th><th>Status</th></tr></thead>
      <tbody>${list.map(c => `
        <tr data-href="#/cliente/${esc(c.id)}" tabindex="0">
          <td><div class="with-avatar"><span class="avatar">${esc(initials(c.nome))}</span>
            <span><strong>${esc(c.nome)}</strong><small>${esc(c.empresa)}</small></span></div></td>
          <td><span>${esc(c.email || '—')}</span><small>${esc(c.telefone)}</small></td>
          <td>${esc(c.segmento || '—')}</td>
          <td>${c.projetos.length}</td>
          <td>${badge('client', c.status)}</td>
        </tr>`).join('')}</tbody>
    </table></div>`;
  }

  function viewClients() {
    const clients = S.clients();
    const chip = (k, label) => {
      const n = k ? clients.filter(c => c.status === k).length : clients.length;
      return `<button class="chip${listState.status === k ? ' active' : ''}" data-status="${esc(k)}">${esc(label)} <span>${n}</span></button>`;
    };
    return `
    <div class="toolbar">
      <input type="search" id="search" placeholder="Buscar por nome, empresa, e-mail, telefone..." value="${esc(listState.q)}">
      <select id="sort" aria-label="Ordenar">
        <option value="recentes"${listState.sort === 'recentes' ? ' selected' : ''}>Atualizados recentemente</option>
        <option value="nome"${listState.sort === 'nome' ? ' selected' : ''}>Nome (A–Z)</option>
        <option value="antigos"${listState.sort === 'antigos' ? ' selected' : ''}>Mais antigos</option>
      </select>
    </div>
    <div class="chips">
      ${chip('', 'Todos')}
      ${Object.entries(S.CLIENT_STATUS).map(([k, v]) => chip(k, v)).join('')}
    </div>
    <div id="clientRows">${clientRows()}</div>`;
  }

  function bindClients() {
    $('#search').addEventListener('input', e => { listState.q = e.target.value; $('#clientRows').innerHTML = clientRows(); });
    $('#sort').addEventListener('change', e => { listState.sort = e.target.value; $('#clientRows').innerHTML = clientRows(); });
    $$('.chip').forEach(b => b.addEventListener('click', () => { listState.status = b.dataset.status; render(); }));
  }

  let detailTab = 'resumo';

  function viewClient(id) {
    const c = S.getClient(id);
    if (!c) return `<div class="empty"><p>Cliente não encontrado.</p><a class="btn" href="#/clientes">Voltar</a></div>`;
    const total = c.projetos.reduce((s, p) => s + (Number(p.valor) || 0), 0);
    const filled = S.BRIEFING_FIELDS.filter(f => (c.briefing[f.key] || '').trim()).length;
    const tabs = [
      ['resumo', 'Resumo'],
      ['briefing', `Briefing (${filled}/${S.BRIEFING_FIELDS.length})`],
      ['projetos', `Projetos (${c.projetos.length})`],
      ['historico', `Histórico (${c.interacoes.length})`]
    ];
    const site = safeUrl(c.site);
    const wa = waLink(c.telefone);
    const ig = c.instagram ? 'https://instagram.com/' + encodeURIComponent(c.instagram.replace(/^@/, '').split('/').pop()) : '';

    return `
    <a href="#/clientes" class="back">← Clientes</a>
    <section class="client-head card">
      <div class="with-avatar">
        <span class="avatar lg">${esc(initials(c.nome))}</span>
        <div>
          <h2>${esc(c.nome)}</h2>
          <p class="muted">${esc([c.empresa, c.segmento, c.cidade].filter(Boolean).join(' · ') || 'Sem empresa informada')}</p>
          <div class="quick">
            ${c.email ? `<a href="mailto:${esc(c.email)}">✉ E-mail</a>` : ''}
            ${wa ? `<a href="${esc(wa)}" target="_blank" rel="noopener">WhatsApp</a>` : ''}
            ${ig ? `<a href="${esc(ig)}" target="_blank" rel="noopener">Instagram</a>` : ''}
            ${site ? `<a href="${esc(site)}" target="_blank" rel="noopener">Site</a>` : ''}
          </div>
        </div>
      </div>
      <div class="head-side">
        <label class="inline">Status
          <select id="statusSelect">${options(S.CLIENT_STATUS, c.status)}</select>
        </label>
        <div class="head-actions">
          <button class="btn" data-action="edit-client">Editar</button>
          <button class="btn btn-ghost-danger" data-action="delete-client">Excluir</button>
        </div>
      </div>
    </section>

    <nav class="tabs" role="tablist">
      ${tabs.map(([k, l]) => `<button role="tab" class="tab${detailTab === k ? ' active' : ''}" data-tab="${k}" aria-selected="${detailTab === k}">${esc(l)}</button>`).join('')}
    </nav>

    <section class="tab-panel">
      ${detailTab === 'resumo' ? tabResumo(c, total) : ''}
      ${detailTab === 'briefing' ? tabBriefing(c) : ''}
      ${detailTab === 'projetos' ? tabProjetos(c, total) : ''}
      ${detailTab === 'historico' ? tabHistorico(c) : ''}
    </section>`;
  }

  function tabResumo(c, total) {
    const row = (l, v) => `<div><dt>${esc(l)}</dt><dd>${esc(v || '—')}</dd></div>`;
    return `
    <div class="grid-2">
      <div class="card">
        <h3>Dados do cliente</h3>
        <dl class="dl">
          ${row('E-mail', c.email)}${row('Telefone', c.telefone)}${row('Instagram', c.instagram)}
          ${row('Site', c.site)}${row('CPF / CNPJ', c.documento)}${row('Cidade', c.cidade)}
          ${row('Segmento', c.segmento)}${row('Origem', c.origem)}
          ${row('Cliente desde', fmtDate(c.criadoEm))}${row('Última atualização', fmtDateTime(c.atualizadoEm))}
        </dl>
      </div>
      <div class="card">
        <h3>Visão geral</h3>
        <dl class="dl">
          ${row('Projetos', String(c.projetos.length))}
          ${row('Valor total em projetos', fmtMoney(total))}
          ${row('Última interação', c.interacoes[0] ? fmtDateTime(c.interacoes[0].data) + ' · ' + c.interacoes[0].tipo : '')}
        </dl>
        <h3 class="mt">Observações</h3>
        <p class="pre">${esc(c.observacoes || 'Nenhuma observação.')}</p>
      </div>
    </div>`;
  }

  function tabBriefing(c) {
    const b = c.briefing || {};
    return `
    <form id="briefingForm" class="card briefing">
      <div class="briefing-head">
        <div>
          <h3>Briefing</h3>
          <p class="muted">Preencha atentamente! ${b.atualizadoEm ? 'Última atualização: ' + fmtDateTime(b.atualizadoEm) : ''}</p>
        </div>
        <button type="button" class="btn" data-action="print-briefing">Imprimir / PDF</button>
      </div>
      ${S.BRIEFING_FIELDS.map(f => `
        <label>${esc(f.label)}
          <small>${esc(f.hint)}</small>
          <textarea name="${esc(f.key)}" rows="3">${esc(b[f.key])}</textarea>
        </label>`).join('')}
      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Salvar briefing</button>
      </div>
    </form>`;
  }

  function tabProjetos(c, total) {
    const today = todayStr();
    return `
    <div class="section-head">
      <p class="muted">Total: <strong>${fmtMoney(total)}</strong></p>
      <button class="btn btn-primary" data-action="new-project">+ Novo projeto</button>
    </div>
    ${c.projetos.length ? `<div class="projects">${c.projetos.map(p => `
      <article class="card project">
        <header>
          <div><h4>${esc(p.nome)}</h4><small class="muted">${esc(p.servico || '')}</small></div>
          ${badge('project', p.status)}
        </header>
        ${p.descricao ? `<p class="pre">${esc(p.descricao)}</p>` : ''}
        <dl class="dl compact">
          <div><dt>Valor</dt><dd>${p.valor !== '' && p.valor != null ? fmtMoney(p.valor) : '—'}</dd></div>
          <div><dt>Pagamento</dt><dd>${esc(p.pagamento || '—')}</dd></div>
          <div><dt>Início</dt><dd>${fmtDate(p.inicio)}</dd></div>
          <div><dt>Prazo</dt><dd class="${p.prazo && p.prazo < today && !['entregue', 'cancelado'].includes(p.status) ? 'late' : ''}">${fmtDate(p.prazo)}</dd></div>
        </dl>
        <footer>
          <button class="btn btn-sm" data-action="edit-project" data-id="${esc(p.id)}">Editar</button>
          <button class="btn btn-sm btn-ghost-danger" data-action="delete-project" data-id="${esc(p.id)}">Excluir</button>
        </footer>
      </article>`).join('')}</div>` : '<div class="empty"><p>Nenhum projeto cadastrado para este cliente.</p></div>'}`;
  }

  function tabHistorico(c) {
    return `
    <form id="interactionForm" class="card interaction-form">
      <h3>Registrar interação</h3>
      <div class="row">
        <select name="tipo" aria-label="Tipo">
          ${['Reunião', 'Ligação', 'WhatsApp', 'E-mail', 'Proposta enviada', 'Entrega', 'Feedback', 'Nota'].map(t => `<option>${t}</option>`).join('')}
        </select>
        <input name="texto" required placeholder="O que foi conversado / decidido?">
        <button class="btn btn-primary" type="submit">Adicionar</button>
      </div>
    </form>
    ${c.interacoes.length ? `<ol class="timeline">${c.interacoes.map(i => `
      <li>
        <div class="tl-head"><strong>${esc(i.tipo)}</strong><small>${fmtDateTime(i.data)}</small>
          <button class="icon-btn sm" data-action="delete-interaction" data-id="${esc(i.id)}" aria-label="Excluir interação">✕</button></div>
        <p class="pre">${esc(i.texto)}</p>
      </li>`).join('')}</ol>` : '<div class="empty"><p>Nenhuma interação registrada ainda.</p></div>'}`;
  }

  function bindClient(id) {
    const c = S.getClient(id);
    if (!c) return;
    $('#statusSelect').addEventListener('change', e => {
      S.saveClient({ id, status: e.target.value });
      toast('Status atualizado');
    });
    $$('.tab').forEach(t => t.addEventListener('click', () => { detailTab = t.dataset.tab; render(); }));
    const bf = $('#briefingForm');
    if (bf) bf.addEventListener('submit', e => {
      e.preventDefault();
      S.saveBriefing(id, formData(bf));
      toast('Briefing salvo');
      render();
    });
    const inf = $('#interactionForm');
    if (inf) inf.addEventListener('submit', e => {
      e.preventDefault();
      const d = formData(inf);
      if (!d.texto) return;
      S.addInteraction(id, d);
      render();
    });
  }

  const projState = { status: 'abertos' };

  function viewProjects() {
    const today = todayStr();
    let list = S.allProjects();
    if (projState.status === 'abertos') list = list.filter(p => !['entregue', 'cancelado'].includes(p.status));
    else if (projState.status) list = list.filter(p => p.status === projState.status);
    list.sort((a, b) => (a.prazo || '9999').localeCompare(b.prazo || '9999'));
    const chips = [['abertos', 'Em aberto'], ['', 'Todos']].concat(Object.entries(S.PROJECT_STATUS));
    return `
    <div class="section-head">
      <div class="chips">${chips.map(([k, v]) =>
        `<button class="chip${projState.status === k ? ' active' : ''}" data-pstatus="${esc(k)}">${esc(v)}</button>`).join('')}</div>
      <button class="btn btn-primary" data-action="new-project-global">+ Novo projeto</button>
    </div>
    ${list.length ? `<div class="table-wrap"><table class="table">
      <thead><tr><th>Projeto</th><th>Cliente</th><th>Valor</th><th>Prazo</th><th>Status</th></tr></thead>
      <tbody>${list.map(p => `
        <tr data-href="#/cliente/${esc(p.cliente.id)}" data-tab="projetos" tabindex="0">
          <td><strong>${esc(p.nome)}</strong><small>${esc(p.servico || '')}</small></td>
          <td>${esc(p.cliente.nome)}<small>${esc(p.cliente.empresa)}</small></td>
          <td>${p.valor !== '' && p.valor != null ? fmtMoney(p.valor) : '—'}<small>${esc(p.pagamento || '')}</small></td>
          <td class="${p.prazo && p.prazo < today && !['entregue', 'cancelado'].includes(p.status) ? 'late' : ''}">${fmtDate(p.prazo)}</td>
          <td>${badge('project', p.status)}</td>
        </tr>`).join('')}</tbody></table></div>`
      : '<div class="empty"><p>Nenhum projeto neste filtro.</p></div>'}`;
  }

  function bindProjects() {
    $$('[data-pstatus]').forEach(b => b.addEventListener('click', () => { projState.status = b.dataset.pstatus; render(); }));
  }

  function viewData() {
    const n = S.clients().length;
    return `
    <div class="grid-2">
      <section class="card">
        <h3>Exportar</h3>
        <p class="muted">Os dados ficam salvos apenas neste navegador. Faça backups regulares.</p>
        <div class="stack">
          <button class="btn btn-primary" data-action="export-json">Baixar backup (.json)</button>
          <button class="btn" data-action="export-csv">Exportar clientes para planilha (.csv)</button>
        </div>
      </section>
      <section class="card">
        <h3>Importar backup</h3>
        <p class="muted">Restaure um arquivo .json gerado por este sistema.</p>
        <div class="stack">
          <input type="file" id="importFile" accept="application/json,.json">
          <label class="inline"><input type="checkbox" id="importReplace"> Substituir todos os dados atuais</label>
          <button class="btn" data-action="import-json">Importar</button>
        </div>
      </section>
      <section class="card">
        <h3>Zona de perigo</h3>
        <p class="muted">${n} cliente(s) cadastrado(s).</p>
        <button class="btn btn-ghost-danger" data-action="clear-all">Apagar todos os dados</button>
      </section>
    </div>`;
  }

  function exportCsv() {
    const cols = [
      ['nome', 'Nome'], ['empresa', 'Empresa'], ['email', 'E-mail'], ['telefone', 'Telefone'],
      ['instagram', 'Instagram'], ['site', 'Site'], ['documento', 'CPF/CNPJ'], ['cidade', 'Cidade'],
      ['segmento', 'Segmento'], ['origem', 'Origem'], ['status', 'Status'], ['projetos', 'Projetos'],
      ['criadoEm', 'Cadastrado em']
    ];
    const cell = v => {
      let s = String(v == null ? '' : v);
      if (/^[=+\-@]/.test(s)) s = "'" + s; // evita injeção de fórmulas
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const lines = [cols.map(c => cell(c[1])).join(';')];
    S.clients().forEach(c => lines.push(cols.map(([k]) => {
      if (k === 'status') return cell(S.CLIENT_STATUS[c.status]);
      if (k === 'projetos') return cell(c.projetos.length);
      if (k === 'criadoEm') return cell(fmtDate(c.criadoEm));
      return cell(c[k]);
    }).join(';')));
    download('clientes-creativity-studio.csv', '﻿' + lines.join('\r\n'), 'text/csv;charset=utf-8');
  }

  function printBriefing(c) {
    const w = window.open('', '_blank');
    if (!w) { toast('Permita pop-ups para imprimir'); return; }
    w.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Briefing — ${esc(c.nome)}</title>
      <style>body{font-family:Inter,system-ui,sans-serif;max-width:760px;margin:40px auto;padding:0 20px;color:#1d1b26}
      h1{margin:0}h2{font-size:15px;margin:24px 0 6px;color:#6d28d9}p{white-space:pre-wrap;margin:0;line-height:1.5}
      .meta{color:#666;margin:6px 0 24px}</style></head><body>
      <h1>Briefing — ${esc(c.nome)}</h1>
      <p class="meta">${esc([c.empresa, c.email, c.telefone].filter(Boolean).join(' · '))}<br>Creativity Studio · ${fmtDate(new Date().toISOString())}</p>
      ${S.BRIEFING_FIELDS.map(f => `<h2>${esc(f.label)}</h2><p>${esc(c.briefing[f.key] || '—')}</p>`).join('')}
      <script>window.onload=function(){window.print()}<\/script></body></html>`);
    w.document.close();
  }

  /* ---------- ações globais (delegação) ---------- */
  document.addEventListener('click', e => {
    const row = e.target.closest('tr[data-href]');
    if (row) {
      if (row.dataset.tab) detailTab = row.dataset.tab;
      location.hash = row.dataset.href;
      return;
    }
    const el = e.target.closest('[data-action]');
    if (!el) return;
    const route = currentRoute();
    const clientId = route.name === 'cliente' ? route.id : null;
    const client = clientId && S.getClient(clientId);

    switch (el.dataset.action) {
      case 'new-client': openClientModal(); break;
      case 'edit-client': openClientModal(client); break;
      case 'delete-client':
        confirmAction(`Excluir o cliente "${client.nome}" e todos os seus projetos, briefing e histórico?`, () => {
          S.deleteClient(clientId); toast('Cliente excluído'); location.hash = '#/clientes';
        });
        break;
      case 'new-project': openProjectModal(clientId); break;
      case 'new-project-global':
        if (!S.clients().length) { toast('Cadastre um cliente primeiro'); break; }
        openProjectModal(null);
        break;
      case 'edit-project': openProjectModal(clientId, client.projetos.find(p => p.id === el.dataset.id)); break;
      case 'delete-project':
        confirmAction('Excluir este projeto?', () => { S.deleteProject(clientId, el.dataset.id); toast('Projeto excluído'); render(); });
        break;
      case 'delete-interaction':
        S.deleteInteraction(clientId, el.dataset.id); render();
        break;
      case 'print-briefing': printBriefing(client); break;
      case 'export-json':
        download('backup-creativity-studio-' + todayStr() + '.json', S.exportJson(), 'application/json');
        break;
      case 'export-csv': exportCsv(); break;
      case 'import-json': {
        const file = $('#importFile').files[0];
        if (!file) { toast('Selecione um arquivo'); break; }
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const n = S.importJson(reader.result, $('#importReplace').checked ? 'replace' : 'merge');
            toast(n + ' cliente(s) importado(s)');
            render();
          } catch (err) { toast('Erro ao importar: ' + err.message); }
        };
        reader.readAsText(file);
        break;
      }
      case 'clear-all':
        confirmAction('Apagar TODOS os clientes, projetos e briefings deste navegador? Esta ação não pode ser desfeita.', () => {
          S.clearAll(); toast('Dados apagados'); render();
        });
        break;
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter' && e.target.matches('tr[data-href]')) e.target.click();
  });

  $('#newClientBtn').addEventListener('click', () => openClientModal());
  $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));

  /* ---------- roteamento ---------- */
  function currentRoute() {
    const parts = location.hash.replace(/^#\/?/, '').split('/');
    return { name: parts[0] || 'dashboard', id: parts[1] ? decodeURIComponent(parts[1]) : null };
  }

  function render() {
    const r = currentRoute();
    const view = $('#view');
    let title = 'Painel', html, bind;
    switch (r.name) {
      case 'clientes': title = 'Clientes'; html = viewClients(); bind = bindClients; break;
      case 'cliente':
        title = 'Cliente'; html = viewClient(r.id); bind = () => bindClient(r.id); break;
      case 'projetos': title = 'Projetos'; html = viewProjects(); bind = bindProjects; break;
      case 'dados': title = 'Backup & Dados'; html = viewData(); break;
      default: html = viewDashboard();
    }
    $('#pageTitle').textContent = title;
    view.innerHTML = html;
    if (bind) bind();
    const active = r.name === 'cliente' ? 'clientes' : r.name;
    $$('.nav a').forEach(a => a.classList.toggle('active', a.dataset.route === active));
  }

  window.addEventListener('hashchange', () => {
    // fora da ficha do cliente, a próxima ficha aberta começa na aba Resumo
    if (currentRoute().name !== 'cliente') detailTab = 'resumo';
    $('#sidebar').classList.remove('open');
    render();
    window.scrollTo(0, 0);
  });

  render();
})();
