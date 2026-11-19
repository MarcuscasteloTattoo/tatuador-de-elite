# Tatuador de Elite — LP de aplicação (Tattoo Week)

Landing page de captura para **Marketing para Tatuadores**: resultados em 45 dias ou o dinheiro de volta.
O formulário é uma aplicação em 3 etapas que **qualifica** o lead antes de enviar.
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
| `endpoint` | URL que recebe as aplicações. Vazio = a página não envia e avisa que está indisponível. |
| `formato` | `"json"`, `"form"` ou `"json-texto"` (use `"json-texto"` com Google Apps Script). |
| `evento` | Texto do selo no topo (ex.: `"Tattoo Week"`). |
| `estande` | Ex.: `"Estande 42"`. Aparece na tela de aprovado. |
| `whatsappEquipe` | Número com DDI, só dígitos. Vira botão "Falar com a equipe agora" para leads quente/morno. |
| `prazoContato` | Prazo de retorno mostrado ao lead. |
| `prazoAplicacoes` | Data real de encerramento (ISO). Mostra contagem regressiva. Vazio = sem contagem. |
| `depoimentos` | Depoimentos reais e autorizados. Lista vazia = seção escondida. |

## Rastrear de onde veio o lead

Use links diferentes em cada QR code:

- Estande: `.../?origem=estande`
- Panfleto: `.../?origem=panfleto`
- Instagram/anúncios: parâmetros `utm_source`, `utm_medium`, `utm_campaign`...

O valor chega no campo `origem` (e nos `utm_*`) de cada aplicação.

## Qualificação

| Pergunta | Pontos |
|---|---|
| Perfil | estúdio próprio 3 · dono com equipe 3 · residente 2 · ainda não tatua = **desqualifica** |
| Tempo tatuando | <1 ano 0 · 1–3 1 · 3–5 2 · 5+ 3 |
| Faturamento | até 5 mil 0 · 5–10 1 · 10–20 2 · 20+ 3 |
| Verba para anúncios | não pode = **desqualifica** · até 1 mil 1 · 1–3 mil 2 · 3 mil+ 3 |
| Início | agora 3 · 30 dias 2 · pesquisando 0 |

`temperatura`: **quente** (≥ 11 pontos e não está "só pesquisando"), **morno** (≥ 7), **frio**, ou **desqualificado**.
Todos os leads são enviados com `pontuacao`, `temperatura`, `qualificado` e `motivos_desqualificacao`,
para a equipe priorizar a fila. O lead também precisa marcar que leu e aceita as regras da garantia.

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
3. Cole a URL `/exec` em `endpoint` e use `formato: "json-texto"`.
4. Opcional: propriedade `AVISAR_EMAIL` para receber e-mail a cada lead quente.
