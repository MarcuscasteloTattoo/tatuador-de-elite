/**
 * Conexão opcional: Google Planilhas + Apps Script
 *
 * Grava cada aplicação da LP como uma linha na aba "Aplicacoes".
 * As colunas são criadas sozinhas a partir dos campos enviados
 * (nome, whatsapp, email, instagram, perfil, faturamento, verba,
 *  pontuacao, temperatura, qualificado, origem, utm_*, etc.).
 *
 * 1. Crie uma planilha → Extensões → Apps Script → cole este código.
 * 2. Implantar → Nova implantação → App da Web
 *      Executar como: Eu  |  Quem tem acesso: Qualquer pessoa
 * 3. Copie a URL que termina em /exec para LP_CONFIG.endpoint no index.html
 *    e use  formato: "json-texto".
 * 4. (Opcional) Propriedades do script → AVISAR_EMAIL = seu e-mail
 *    para receber um aviso a cada lead "quente".
 */
var ABA = 'Aplicacoes';
var OBRIGATORIOS = ['nome', 'whatsapp', 'email', 'instagram'];

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    for (var i = 0; i < OBRIGATORIOS.length; i++) {
      if (!String(d[OBRIGATORIOS[i]] || '').trim()) return json({ ok: false, mensagem: 'Dados incompletos.' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.email))) return json({ ok: false, mensagem: 'E-mail inválido.' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
    var cab = sh.getLastRow() ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0] : ['recebido_em'];
    Object.keys(d).forEach(function (k) { if (cab.indexOf(k) < 0) cab.push(k); });
    sh.getRange(1, 1, 1, cab.length).setValues([cab]).setFontWeight('bold');
    sh.setFrozenRows(1);

    var linha = cab.map(function (k) {
      if (k === 'recebido_em') return new Date();
      var v = d[k];
      return v === undefined || v === null ? '' : (typeof v === 'object' ? JSON.stringify(v) : v);
    });
    sh.appendRow(linha);

    var aviso = PropertiesService.getScriptProperties().getProperty('AVISAR_EMAIL');
    if (aviso && d.temperatura === 'quente') {
      MailApp.sendEmail(aviso, 'Lead quente: ' + d.nome,
        d.nome + '\nWhatsApp: ' + d.whatsapp + '\nInstagram: @' + d.instagram +
        '\nFaturamento: ' + d.faturamento_mensal + '\nVerba: ' + d.verba_anuncios +
        '\nInício: ' + d.inicio + '\nOrigem: ' + d.origem);
    }
    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, mensagem: 'Erro ao salvar aplicação.' });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
