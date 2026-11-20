# Tatuador de Elite — LP de aplicação (Tattoo Week, 20 a 22/11)

Landing page de captura para **Marketing para Tatuadores**: resultados em 45 dias ou o dinheiro de volta.
O formulário é uma aplicação em 2 etapas que **qualifica** o lead antes de enviar.
Página estática em um único `index.html`, pensada primeiro para o celular.

## Estrutura

```
index.html                              página completa (HTML, CSS e JS)
assets/equipe.jpg                       foto da equipe (da arte do estande)
assets/og.jpg                           imagem de compartilhamento no WhatsApp
assets/logo-tatuador-de-elite.png       logo
integracao/apps-script-google-sheets.gs conexão opcional com Google Planilhas
```

## Publicar

**GitHub Pages:** Settings → Pages → Deploy from a branch → `main` / `(root)` → Save.
Fica em `https://marcuscastelotattoo.github.io/tatuador-de-elite/`.

**Domínio do panfleto:** o QR code impresso aponta para `https://tatuadordeelite.com.br/`.
Para cair nesta LP, configure esse domínio em Settings → Pages → Custom domain e aponte o DNS
(registros A para 185.199.108.153, .109.153, .110.153, .111.153 e CNAME `www` → `marcuscastelotattoo.github.io`),
ou faça o site atual desse domínio redirecionar para o endereço do GitHub Pages.

## Configuração (`window.LP_CONFIG`, no início do `index.html`)

| Campo | O que faz |
|---|---|
| `endpoint` | URL que recebe as aplicações. Vazio = a página não envia e pede para falar no estande. |
| `formato` | `"json"`, `"form"` ou `"json-texto"` (use `"json-texto"` com Google Apps Script). |
| `vsl.url` | Link da VSL: YouTube (inclusive Shorts), Vimeo ou arquivo `.mp4`. Vazio = mostra a foto da equipe. |
| `vsl.formato` | `"vertical"` (9:16) ou `"horizontal"` (16:9). O player se ajusta à tela. |
| `vsl.capa` | Imagem de capa opcional. Sem capa, a vertical usa uma capa preta e dourada com "Assista antes de aplicar". |
| `vsl.duracao` | Ex.: `"2 min"`, aparece embaixo do botão de play. |
| `evento` / `fimDoEvento` | Nome do evento e data/hora de término (contagem regressiva). Hoje: 22/11/2026 23:59. |
| `encerrarAposPrazo` | `true` = depois do prazo o formulário some e aparece "Aplicações encerradas". |
| `estande` | Ex.: `"Estande 42"`. Aparece na tela de aprovado. |
| `whatsappComercial` | WhatsApp do comercial, só dígitos com DDI. Lead **quente** é levado direto para ele com os dados na mensagem. |

O vídeo só carrega quando a pessoa toca no play (a página abre rápido no 4G da feira).

## Rastrear de onde veio o lead

- QR do estande: `.../?origem=estande`
- QR do panfleto: `.../?origem=panfleto`
- Anúncios: `utm_source`, `utm_medium`, `utm_campaign`...

## Qualificação e caminhos do lead

Etapa 1: nome, WhatsApp e Instagram. Etapa 2: faturamento mensal, verba para anúncios e aceite das regras da garantia.

| Pergunta | Pontos |
|---|---|
| Faturamento | R$ 5–10 mil 1 · R$ 10–20 mil 2 · + de R$ 20 mil 3 |
| Verba para anúncios | até R$ 1.500 1 · R$ 1.500–3 mil 2 · + de R$ 3 mil 3 |

Todos os leads vão para a planilha (aba **Aplicacoes**, temperatura colorida, coluna `status_comercial` para a equipe).

| Temperatura | Pontos | Tela depois de enviar |
|---|---|---|
| **Quente** | 5–6 | "Perfil com prioridade" + botão para o WhatsApp do comercial (abre sozinho em ~2 s), com nome, @, faturamento e investimento já na mensagem. Se a internet falhar, vai para o WhatsApp mesmo assim. |
| **Morno / frio** | 2–4 | "Nosso comercial vai avaliar seu perfil e chamar você no WhatsApp em até 24 horas úteis." |

## Antes de divulgar, confirme com o contrato

Os trechos marcados com `<!-- CONFIRMAR -->` no `index.html`:

- As 5 obrigações da garantia.
- Que a devolução é do valor pago pelo serviço (não da verba de anúncios).
- Que a verba de anúncios é paga à parte, direto às plataformas.
- Que o preço só é apresentado depois da aplicação.

Pelo Código de Defesa do Consumidor, o que a página promete passa a valer como oferta,
então o texto precisa bater com o contrato.

### Google Planilhas

1. Planilha → **Extensões → Apps Script** → cole `integracao/apps-script-google-sheets.gs`.
2. **Implantar → Nova implantação → App da Web** (Executar como: Eu · Acesso: Qualquer pessoa).
3. Cole a URL `/exec` em `endpoint` (o `formato` já vem como `"json-texto"`).
