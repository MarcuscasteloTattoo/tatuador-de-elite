# Tatuador de Elite × Romba Tattoo — cupom de 10%

Landing page de cadastro para o cupom de 10% de desconto da parceria.
Página estática (HTML, CSS e JS em um único `index.html`), pensada primeiro para o celular.

## Estrutura

```
index.html                              página completa
assets/logo-tatuador-de-elite.png       logo Tatuador de Elite
assets/logo-arromba.png                 logo Arromba Tattoo Shop
integracao/apps-script-google-sheets.gs conexão opcional com Google Planilhas
```

## Publicar no GitHub Pages

1. No repositório: **Settings → Pages**.
2. Em **Source**, escolha **Deploy from a branch**.
3. Branch **main**, pasta **/ (root)** → **Save**.
4. Em 1–2 minutos o site fica em `https://marcuscastelotattoo.github.io/tatuador-de-elite/`.

## Configurar o cadastro e o cupom

Tudo fica no bloco `window.CADASTRO_CONFIG`, no início do `index.html`.

| Campo | O que faz |
|---|---|
| `endpoint` | URL que recebe o cadastro (webhook, CRM, Formspree ou Google Apps Script). Vazio = a página não envia e avisa "Cadastro temporariamente indisponível". |
| `formato` | `"json"`, `"form"` ou `"json-texto"` (use `"json-texto"` com Google Apps Script). |
| `cupom.modo` | `"resposta"`: a ferramenta devolve o código · `"fixo"`: usa `codigoFixo` · `"email"`: a ferramenta envia por e-mail. |
| `cupom.campoNaResposta` | Nome do campo com o código na resposta JSON (padrão `cupom`). |
| `cupom.codigoFixo` | Código mostrado no modo `"fixo"`. |

O cupom só aparece **depois** que a ferramenta confirma o envio (resposta HTTP 2xx, sem `ok: false`).
Nenhum código de desconto está gravado no projeto.

### Opção pronta: Google Planilhas

1. Crie uma planilha → **Extensões → Apps Script** → cole `integracao/apps-script-google-sheets.gs`.
2. **Configurações do projeto → Propriedades do script**: crie `CUPOM` com o código real.
3. **Implantar → Nova implantação → App da Web** (Executar como: Eu · Acesso: Qualquer pessoa).
4. Cole a URL `/exec` em `endpoint` e use `formato: "json-texto"`, `cupom.modo: "resposta"`.

Cada cadastro vira uma linha na aba **Cadastros** (data, nome, telefone, e-mail, origem, página).

## Validação

- **Nome:** nome e sobrenome.
- **Telefone:** DDD + número (10 ou 11 dígitos), com máscara automática; celular com 11 dígitos precisa começar com 9.
- **E-mail:** formato `nome@dominio.com`.
- Campo anti-robô oculto (honeypot).
