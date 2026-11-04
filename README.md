# Calculadora Creativity Studio

Ferramenta web para montar orçamentos de serviços de design: cadastra o cliente, escolhe o serviço, informa o preço e calcula automaticamente a **entrada de 50%**, o **saldo restante de 50%** e o **valor total**, gerando um resumo pronto para enviar.

## Funcionalidades

- Cadastro do nome do cliente
- Seleção do serviço de design (com opção "Outro serviço…" para descrever livremente)
- Campo de preço com formatação automática em reais (R$)
- Cálculo em tempo real de entrada (50%), saldo (50%) e total
- Resumo do orçamento com número e data
- Botões para **copiar o resumo**, **enviar pelo WhatsApp** e **imprimir / salvar em PDF**
- Layout responsivo, pensado para celular
- Paleta em creme, bege e marrom

> Em valores ímpares em centavos, a entrada é arredondada para cima e o saldo fica com o restante, para que a soma feche exatamente o total.

## Estrutura

```
index.html   → estrutura da página
styles.css   → visual (cores, tipografia, responsividade, impressão)
app.js       → cálculos, validação e geração do resumo
```

Não há dependências nem etapa de build: é HTML, CSS e JavaScript puros.

## Como visualizar

**Opção 1 — abrir direto no navegador**
Baixe o projeto (botão *Code → Download ZIP* no GitHub), extraia e dê dois cliques em `index.html`.

**Opção 2 — servidor local** (recomendado para testar a cópia para a área de transferência)
```bash
python3 -m http.server 8000
```
Depois acesse `http://localhost:8000`.
Para testar no celular, conecte-o à mesma rede Wi-Fi e acesse `http://IP-DO-COMPUTADOR:8000`.

**Opção 3 — publicar online com GitHub Pages**
1. No repositório, vá em *Settings → Pages*.
2. Em *Source*, escolha *Deploy from a branch*, selecione a branch (ex.: `main`) e a pasta `/ (root)`.
3. Salve. Em alguns minutos o app estará em `https://<seu-usuario>.github.io/<nome-do-repositorio>/`, acessível de qualquer celular.
