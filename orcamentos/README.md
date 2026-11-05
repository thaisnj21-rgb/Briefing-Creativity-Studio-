# Orçamentos Creativity — app

App independente (PWA) para criar, salvar e baixar os orçamentos da Creativity em PDF.
Funciona no navegador, pode ser instalado no celular ou no computador e abre mesmo sem internet.

## O que o app faz

- **Orçamento**: preencha cliente, pacote, extras (Naming, urgência), desconto e forma de pagamento,
  com prévia da folha A4 no padrão da marca.
- **Baixar PDF**: gera e baixa o PDF direto no aparelho. O orçamento é salvo automaticamente.
- **Compartilhar PDF** (celular): envia o PDF direto para o WhatsApp, e-mail etc.
- **Meus orçamentos**: lista de todos os orçamentos salvos, com busca, para abrir, editar, baixar de novo ou excluir.
- **Backup**: exporte um arquivo `.json` com todos os orçamentos e importe em outro aparelho.
- **Copiar mensagem do WhatsApp**: texto pronto com o valor total e a entrada de 50%.

Os orçamentos ficam guardados no próprio aparelho/navegador. Faça backup de vez em quando.

## Como publicar (uma vez só)

1. Junte esta branch na `main` (pull request).
2. No GitHub, abra **Settings → Pages** e, em **Build and deployment → Source**, escolha **GitHub Actions**.
3. A action **Publicar app de orçamentos** publica a pasta `orcamentos/` a cada alteração na `main`
   (ou rode manualmente em **Actions → Publicar app de orçamentos → Run workflow**).
4. O app fica em: `https://thaisnj21-rgb.github.io/Briefing-Creativity-Studio-/`

> GitHub Pages em repositório privado exige plano pago. Se o repositório for privado no plano grátis,
> deixe-o público ou publique a pasta `orcamentos/` em outro host estático (Netlify, Vercel, Cloudflare Pages).

## Como instalar

- **Android / Chrome / Edge**: abra o link e toque em **Instalar app** (ou no menu ⋮ → *Instalar app*).
- **iPhone / iPad (Safari)**: toque em **Compartilhar** → **Adicionar à Tela de Início**.
- **Computador**: no Chrome/Edge, clique no ícone de instalar na barra de endereço.

## Testar localmente

```bash
cd orcamentos
python3 -m http.server 8000
# abra http://localhost:8000
```

## Estrutura

- `index.html`, `app.css`, `app.js` — o app
- `manifest.webmanifest`, `sw.js` — instalação e funcionamento offline
- `assets/` — logo, símbolo, assinatura e ícones
- `vendor/` — html2canvas 1.4.1 e jsPDF 2.5.1 (cópia local, para funcionar offline)
- `fonts/` — Montserrat (cópia local)

Ao alterar o app, aumente a versão em `CACHE` no `sw.js` para os aparelhos receberem a atualização.
