# Creativity Studio · Gestão de Clientes

Sistema simples de gestão de clientes (CRM) para a Creativity Studio, com briefing, projetos e histórico de contato.

Preencha o formulário atentamente!

## Funcionalidades

- **Painel**: total de clientes por status, projetos em andamento, valor em aberto, faturado e próximas entregas (com alerta de atraso).
- **Clientes**: cadastro, edição e exclusão; busca por nome, empresa, e-mail ou telefone; filtro por status (Lead, Em negociação, Ativo, Inativo) e ordenação.
- **Ficha do cliente**:
  - *Resumo* com dados de contato e atalhos para e-mail, WhatsApp, Instagram e site;
  - *Briefing* com 10 perguntas (empresa, público-alvo, objetivos, concorrentes, referências, identidade visual, prazo, orçamento…) e opção de imprimir/salvar em PDF;
  - *Projetos* com serviço, valor, pagamento, início, prazo e status (Briefing → Em produção → Em revisão → Entregue);
  - *Histórico* de interações (reuniões, ligações, propostas, feedbacks).
- **Projetos**: visão geral de todos os projetos, filtrada por status e ordenada por prazo.
- **Backup & Dados**: exportar/importar backup em JSON e exportar clientes para planilha (CSV, compatível com Excel).

## Como usar

Não precisa instalar nada: basta abrir o arquivo `index.html` no navegador.
Também pode ser publicado gratuitamente pelo **GitHub Pages** (Settings → Pages → branch principal, pasta raiz).

> Os dados ficam salvos no navegador (localStorage) do computador onde o sistema é usado.
> Use a página **Backup & Dados** para salvar uma cópia regularmente ou levar os dados para outro computador.

## Estrutura

```
index.html       # estrutura da página
css/styles.css   # visual (com modo escuro e layout para celular)
js/store.js      # dados e persistência
js/app.js        # telas, formulários e navegação
```
