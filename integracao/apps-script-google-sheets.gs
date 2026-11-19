/**
 * Conexão opcional: Google Planilhas + Apps Script
 *
 * 1. Crie uma planilha, vá em Extensões > Apps Script e cole este código.
 * 2. Em Configurações do projeto > Propriedades do script, crie:
 *      CUPOM = <o código real definido pela Romba Tattoo>
 * 3. Implantar > Nova implantação > App da Web
 *      Executar como: Eu | Quem tem acesso: Qualquer pessoa
 * 4. Copie a URL /exec para CADASTRO_CONFIG.endpoint no index.html e use:
 *      formato: "json-texto", cupom.modo: "resposta", cupom.campoNaResposta: "cupom"
 *
 * O cupom só é devolvido depois que a linha foi gravada na planilha.
 */
var ABA = 'Cadastros';

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var nome = String(d.nome || '').trim();
    var tel = String(d.telefone || '').replace(/\D/g, '');
    var email = String(d.email || '').trim().toLowerCase();

    if (nome.length < 3 || tel.length < 10 || tel.length > 11 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return json({ ok: false, mensagem: 'Dados inválidos.' });
    }

    var cupom = PropertiesService.getScriptProperties().getProperty('CUPOM');
    if (!cupom) return json({ ok: false, mensagem: 'Cupom não configurado.' });

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(ABA) || ss.insertSheet(ABA);
    if (sh.getLastRow() === 0) sh.appendRow(['Data', 'Nome', 'Telefone', 'E-mail', 'Origem', 'Página']);
    sh.appendRow([new Date(), nome, tel, email, d.origem || '', d.pagina || '']);

    // Para enviar também por e-mail, descomente:
    // MailApp.sendEmail(email, 'Seu cupom de 10% · Romba Tattoo', 'Olá, ' + nome + '! Seu cupom: ' + cupom);

    return json({ ok: true, cupom: cupom });
  } catch (err) {
    return json({ ok: false, mensagem: 'Erro ao salvar cadastro.' });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
