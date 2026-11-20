/**
 * Tatuador de Elite · Tattoo Week
 * Recebe as aplicações da LP, grava na planilha e avisa o comercial no WhatsApp.
 *
 * ─── INSTALAR (uma vez) ──────────────────────────────────────────────
 * 1. Crie uma planilha → Extensões → Apps Script → apague tudo e cole este código.
 * 2. Implantar → Nova implantação → tipo "App da Web"
 *      Executar como: Eu  |  Quem tem acesso: Qualquer pessoa  → Implantar
 *    Autorize o acesso quando o Google pedir.
 * 3. Copie a URL que termina em /exec e cole em LP_CONFIG.endpoint no index.html.
 *
 * ─── AVISO NO WHATSAPP DO COMERCIAL (opcional) ───────────────────────
 * Configurações do projeto (engrenagem) → Propriedades do script → adicionar:
 *
 *   Opção A — CallMeBot (grátis):
 *     AVISO_SERVICO   = callmebot
 *     CALLMEBOT       = 5511999999999:1234567
 *                       (número do comercial com DDI : apikey recebida do bot;
 *                        para mais de um número, separe por vírgula)
 *     Para pegar a apikey: no celular do comercial, salve o número do bot
 *     informado em callmebot.com e mande para ele no WhatsApp:
 *     "I allow callmebot to send me messages". O bot responde com a apikey.
 *
 *   Opção B — Z-API (pago):
 *     AVISO_SERVICO     = zapi
 *     ZAPI_INSTANCIA    = id da instância
 *     ZAPI_TOKEN        = token da instância
 *     ZAPI_CLIENT_TOKEN = token de segurança da conta (se estiver ativado)
 *     ZAPI_DESTINO      = 5511999999999   (vários: separe por vírgula)
 *
 * Depois de configurar, rode a função testarAviso (menu Executar) para
 * receber uma mensagem de teste no WhatsApp do comercial.
 * Mudou o código? Implantar → Gerenciar implantações → editar → Nova versão.
 */

var ABA = 'Aplicacoes';
var COLUNAS = ['recebido_em', 'temperatura', 'pontuacao', 'nome', 'whatsapp', 'instagram',
  'faturamento_mensal', 'verba_anuncios', 'destino', 'origem', 'status_comercial', 'observacoes'];
var CORES = { quente: '#F8C9C0', morno: '#FCE8B2', frio: '#CFE2F3' };

function doPost(e) {
  var d;
  try { d = JSON.parse((e && e.postData && e.postData.contents) || '{}'); }
  catch (err) { return json({ ok: false, mensagem: 'Dados inválidos.' }); }

  if (!String(d.nome || '').trim() || String(d.whatsapp || '').replace(/\D/g, '').length < 8 || !String(d.instagram || '').trim()) {
    return json({ ok: false, mensagem: 'Dados incompletos.' });
  }

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    gravar(d);
  } catch (err) {
    return json({ ok: false, mensagem: 'Erro ao salvar aplicação.' });
  } finally {
    lock.releaseLock();
  }

  // o aviso nunca impede o lead de ser confirmado
  try { avisarComercial(d); } catch (err) { console.error('Aviso WhatsApp falhou: ' + err); }

  return json({ ok: true });
}

function gravar(d) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
  var cab = sh.getLastRow() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : [];
  COLUNAS.concat(Object.keys(d)).forEach(function (k) { if (cab.indexOf(k) < 0) cab.push(k); });
  sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold');
  sh.setFrozenRows(1);

  var linha = cab.map(function (k) {
    if (k === 'recebido_em') return new Date();
    if (k === 'temperatura') return String(d.temperatura || '').toUpperCase();
    if (k === 'whatsapp') return "'" + String(d.whatsapp || '');   // mantém como texto
    if (k === 'instagram') return d.instagram ? '@' + d.instagram : '';
    var v = d[k];
    return v === undefined || v === null ? '' : (typeof v === 'object' ? JSON.stringify(v) : v);
  });
  sh.appendRow(linha);

  var cor = CORES[d.temperatura];
  if (cor) sh.getRange(sh.getLastRow(), cab.indexOf('temperatura') + 1).setBackground(cor).setFontWeight('bold');
}

/* ─── Aviso no WhatsApp ─────────────────────────────────────────────── */

function mensagemAviso(d) {
  var temp = String(d.temperatura || '').toUpperCase();
  var tel = String(d.whatsapp || '').replace(/\D/g, '');
  var proximo = d.destino === 'whatsapp-comercial'
    ? 'Foi levado direto para o WhatsApp do comercial. Fique de olho na conversa.'
    : 'Está na planilha para o comercial avaliar e chamar.';
  return '*NOVO LEAD · ' + temp + '*' + (d.campanha ? ' (' + d.campanha + ')' : '') + '\n\n' +
    '*Nome:* ' + d.nome + '\n' +
    '*WhatsApp:* ' + formataTelefone(tel) + '\n' +
    'https://wa.me/' + tel + '\n' +
    '*Instagram:* @' + d.instagram + '\n' +
    'https://instagram.com/' + d.instagram + '\n' +
    '*Faturamento mensal:* ' + (d.faturamento_mensal || '-') + '\n' +
    '*Investimento em anúncios:* ' + (d.verba_anuncios || '-') + '\n' +
    '*Pontuação:* ' + (d.pontuacao || '-') + ' de 6\n' +
    '*Origem:* ' + (d.origem || 'direto') + '\n\n' +
    proximo;
}

function avisarComercial(d) {
  var P = PropertiesService.getScriptProperties();
  var servico = String(P.getProperty('AVISO_SERVICO') || '').toLowerCase().trim();
  if (!servico) return;
  var texto = mensagemAviso(d);

  if (servico === 'callmebot') {
    lista(P.getProperty('CALLMEBOT')).forEach(function (par) {
      var i = par.lastIndexOf(':');
      if (i < 0) return;
      var fone = par.slice(0, i).replace(/\D/g, ''), chave = par.slice(i + 1).trim();
      var url = 'https://api.callmebot.com/whatsapp.php?phone=%2B' + fone +
        '&text=' + encodeURIComponent(texto) + '&apikey=' + encodeURIComponent(chave);
      var r = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
      if (r.getResponseCode() >= 300) console.error('CallMeBot ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 300));
    });
    return;
  }

  if (servico === 'zapi') {
    var inst = P.getProperty('ZAPI_INSTANCIA'), tok = P.getProperty('ZAPI_TOKEN'), cli = P.getProperty('ZAPI_CLIENT_TOKEN');
    if (!inst || !tok) throw new Error('ZAPI_INSTANCIA e ZAPI_TOKEN são obrigatórios.');
    var headers = cli ? { 'Client-Token': cli } : {};
    lista(P.getProperty('ZAPI_DESTINO')).forEach(function (fone) {
      var r = UrlFetchApp.fetch('https://api.z-api.io/instances/' + inst + '/token/' + tok + '/send-text', {
        method: 'post', contentType: 'application/json', headers: headers, muteHttpExceptions: true,
        payload: JSON.stringify({ phone: fone.replace(/\D/g, ''), message: texto })
      });
      if (r.getResponseCode() >= 300) console.error('Z-API ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 300));
    });
    return;
  }

  throw new Error('AVISO_SERVICO deve ser "callmebot" ou "zapi".');
}

/** Rode pelo editor (Executar → testarAviso) para conferir o aviso no WhatsApp. */
function testarAviso() {
  avisarComercial({
    campanha: 'teste', nome: 'Lead de Teste', whatsapp: '5511999999999', instagram: 'teste.tattoo',
    faturamento_mensal: 'R$ 10 a 20 mil', verba_anuncios: '+ de R$ 3 mil', pontuacao: 5,
    temperatura: 'quente', destino: 'whatsapp-comercial', origem: 'teste'
  });
}

/* ─── utilitários ───────────────────────────────────────────────────── */

function formataTelefone(t) {
  if (/^55\d{10,11}$/.test(t)) {
    var ddd = t.slice(2, 4), n = t.slice(4);
    return '+55 (' + ddd + ') ' + n.slice(0, n.length - 4) + '-' + n.slice(-4);
  }
  return '+' + t;
}
function lista(v) { return String(v || '').split(',').map(function (x) { return x.trim(); }).filter(String); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
