/**
 * Tatuador de Elite · Tattoo Week
 * Recebe as aplicações da LP e grava cada uma como uma linha na aba "Aplicacoes".
 * Leads quentes, mornos e frios entram todos aqui; a coluna "temperatura" fica colorida.
 *
 * ─── INSTALAR (uma vez, uns 5 minutos) ───────────────────────────────
 * 1. Crie uma planilha nova no Google Planilhas (ex.: "Leads Tattoo Week").
 * 2. Extensões → Apps Script → apague o que estiver lá e cole este código → Salvar.
 * 3. Implantar → Nova implantação → engrenagem → "App da Web"
 *      Executar como: Eu  |  Quem tem acesso: Qualquer pessoa  → Implantar
 *    Autorize o acesso quando o Google pedir.
 * 4. Copie a URL que termina em /exec e cole em LP_CONFIG.endpoint no index.html.
 *
 * Mudou este código depois? Implantar → Gerenciar implantações → editar → Nova versão.
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
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, mensagem: 'Erro ao salvar aplicação.' });
  } finally {
    lock.releaseLock();
  }
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

function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
