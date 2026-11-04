/* Camada de dados — persistência em localStorage */
(function () {
  'use strict';

  const KEY = 'creativity-studio-crm-v1';

  const CLIENT_STATUS = {
    lead: 'Lead',
    negociacao: 'Em negociação',
    ativo: 'Ativo',
    inativo: 'Inativo'
  };

  const PROJECT_STATUS = {
    briefing: 'Briefing',
    producao: 'Em produção',
    revisao: 'Em revisão',
    entregue: 'Entregue',
    cancelado: 'Cancelado'
  };

  const SERVICES = [
    'Identidade visual',
    'Social media',
    'Site / Landing page',
    'Design gráfico',
    'Fotografia',
    'Vídeo',
    'Tráfego pago',
    'Consultoria',
    'Outro'
  ];

  const BRIEFING_FIELDS = [
    { key: 'sobre', label: 'Sobre a empresa', hint: 'História, missão, produtos/serviços oferecidos.' },
    { key: 'publico', label: 'Público-alvo', hint: 'Quem é o cliente ideal? Idade, região, interesses.' },
    { key: 'objetivos', label: 'Objetivos do projeto', hint: 'O que se espera alcançar com o trabalho?' },
    { key: 'diferenciais', label: 'Diferenciais', hint: 'O que torna a marca única frente à concorrência?' },
    { key: 'concorrentes', label: 'Concorrentes', hint: 'Principais concorrentes e o que acha deles.' },
    { key: 'referencias', label: 'Referências', hint: 'Links, marcas ou estilos que admira (e os que não gosta).' },
    { key: 'identidade', label: 'Identidade visual / tom de voz', hint: 'Cores, fontes, logo existente, personalidade da marca.' },
    { key: 'prazo', label: 'Prazo desejado', hint: 'Datas importantes, lançamentos.' },
    { key: 'orcamento', label: 'Orçamento disponível', hint: 'Faixa de investimento prevista.' },
    { key: 'extras', label: 'Informações adicionais', hint: 'Qualquer outra informação relevante.' }
  ];

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function emptyDb() {
    return { version: 1, clients: [] };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return emptyDb();
      const data = JSON.parse(raw);
      if (!data || !Array.isArray(data.clients)) return emptyDb();
      return data;
    } catch (e) {
      console.warn('Falha ao ler dados salvos', e);
      return emptyDb();
    }
  }

  let db = load();

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
      return true;
    } catch (e) {
      console.error('Falha ao salvar', e);
      return false;
    }
  }

  function normalizeClient(c) {
    return {
      id: c.id || uid(),
      nome: c.nome || '',
      empresa: c.empresa || '',
      email: c.email || '',
      telefone: c.telefone || '',
      instagram: c.instagram || '',
      site: c.site || '',
      documento: c.documento || '',
      cidade: c.cidade || '',
      segmento: c.segmento || '',
      origem: c.origem || '',
      status: CLIENT_STATUS[c.status] ? c.status : 'lead',
      observacoes: c.observacoes || '',
      criadoEm: c.criadoEm || new Date().toISOString(),
      atualizadoEm: c.atualizadoEm || new Date().toISOString(),
      briefing: Object.assign({}, c.briefing || {}),
      projetos: Array.isArray(c.projetos) ? c.projetos : [],
      interacoes: Array.isArray(c.interacoes) ? c.interacoes : []
    };
  }

  const Store = {
    CLIENT_STATUS,
    PROJECT_STATUS,
    SERVICES,
    BRIEFING_FIELDS,

    clients() {
      return db.clients.slice();
    },

    getClient(id) {
      return db.clients.find(c => c.id === id) || null;
    },

    saveClient(data) {
      const now = new Date().toISOString();
      const existing = data.id && this.getClient(data.id);
      if (existing) {
        Object.assign(existing, data, { atualizadoEm: now });
      } else {
        db.clients.push(normalizeClient(Object.assign({}, data, { id: uid(), criadoEm: now, atualizadoEm: now })));
      }
      save();
      return existing || db.clients[db.clients.length - 1];
    },

    deleteClient(id) {
      db.clients = db.clients.filter(c => c.id !== id);
      save();
    },

    saveBriefing(clientId, briefing) {
      const c = this.getClient(clientId);
      if (!c) return;
      c.briefing = Object.assign({}, briefing, { atualizadoEm: new Date().toISOString() });
      c.atualizadoEm = new Date().toISOString();
      save();
    },

    saveProject(clientId, project) {
      const c = this.getClient(clientId);
      if (!c) return;
      if (project.id) {
        const p = c.projetos.find(x => x.id === project.id);
        if (p) Object.assign(p, project);
      } else {
        c.projetos.push(Object.assign({ id: uid(), criadoEm: new Date().toISOString() }, project));
      }
      c.atualizadoEm = new Date().toISOString();
      save();
    },

    deleteProject(clientId, projectId) {
      const c = this.getClient(clientId);
      if (!c) return;
      c.projetos = c.projetos.filter(p => p.id !== projectId);
      save();
    },

    addInteraction(clientId, interaction) {
      const c = this.getClient(clientId);
      if (!c) return;
      c.interacoes.unshift(Object.assign({ id: uid(), data: new Date().toISOString() }, interaction));
      c.atualizadoEm = new Date().toISOString();
      save();
    },

    deleteInteraction(clientId, interactionId) {
      const c = this.getClient(clientId);
      if (!c) return;
      c.interacoes = c.interacoes.filter(i => i.id !== interactionId);
      save();
    },

    allProjects() {
      const list = [];
      db.clients.forEach(c => c.projetos.forEach(p => list.push(Object.assign({ cliente: c }, p))));
      return list;
    },

    exportJson() {
      return JSON.stringify(db, null, 2);
    },

    importJson(text, mode) {
      const data = JSON.parse(text);
      if (!data || !Array.isArray(data.clients)) throw new Error('Arquivo inválido: lista de clientes não encontrada.');
      const incoming = data.clients.map(normalizeClient);
      if (mode === 'replace') {
        db = { version: 1, clients: incoming };
      } else {
        const byId = new Map(db.clients.map(c => [c.id, c]));
        incoming.forEach(c => byId.set(c.id, c));
        db = { version: 1, clients: Array.from(byId.values()) };
      }
      save();
      return incoming.length;
    },

    clearAll() {
      db = emptyDb();
      save();
    }
  };

  window.Store = Store;
})();
