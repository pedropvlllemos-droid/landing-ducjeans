const SPREADSHEET_ID = '1-o30LNWA3To_UdyD_jn4FnIHp49uK-0Txqny7lAtkgw';
const SHEET_NAME = 'Cadastros';
const TIMEZONE = 'America/Sao_Paulo';
const SOURCE = 'Atacado DUC';
const INITIAL_STATUS = 'Novo cadastro';

// Preencha quando você me passar as consultoras e as regras de distribuição.
// Exemplo de formato:
// { name: 'Nome', phone: '5562999999999', states: ['GO', 'DF'], minScore: 0, maxScore: 999 }
const CONSULTANTS = [];

function doGet() {
  return json_({ ok: true, service: 'DUC Atacado', status: 'online' });
}

function doPost(e) {
  try {
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : '{}';
    const data = JSON.parse(raw);

    // Honeypot: bots podem preencher este campo invisível.
    if (data.website) return json_({ ok: true });

    validateLead_(data);

    // O backend é a fonte de verdade: não confia em score/classificação recebidos do navegador.
    const score = calculateScore_(data);
    const classificacao = classify_(score);
    const consultant = chooseConsultant_(data, score);
    const consultoria = consultant ? consultant.name : 'Equipe comercial DUC';

    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Aba Cadastros não encontrada.');

    const timestamp = Utilities.formatDate(new Date(), TIMEZONE, 'dd/MM/yyyy HH:mm:ss');
    const row = [
      timestamp,
      safe_(data.nome),
      safe_(data.whatsapp),
      safe_(data.email),
      safe_(data.tipo),
      safe_(data.documento),
      safe_(data.empresa),
      safe_(data.instagram),
      safe_(data.cidade),
      safe_(data.estado),
      safe_(data.estrutura),
      safe_(data.faixa),
      safe_(data.prazo),
      safe_(data.frequencia),
      safe_(data.categorias),
      safe_(data.mensagem),
      data.marketing === 'Sim' ? 'Sim' : 'Não',
      score,
      classificacao,
      consultoria,
      SOURCE,
      INITIAL_STATUS,
      safe_(data.observacoes)
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow(row);
      SpreadsheetApp.flush();
    } finally {
      lock.releaseLock();
    }

    return json_({
      ok: true,
      score,
      classificacao,
      consultoria,
      consultantPhone: consultant ? consultant.phone : ''
    });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function validateLead_(data) {
  const required = ['nome', 'whatsapp', 'email', 'tipo', 'documento', 'cidade', 'estado', 'estrutura', 'faixa', 'prazo', 'frequencia'];
  required.forEach(function (key) {
    if (!String(data[key] || '').trim()) throw new Error('Campo obrigatório ausente: ' + key);
  });

  if (!String(data.email).includes('@')) throw new Error('E-mail inválido.');
  if (!['CPF', 'CNPJ'].includes(data.tipo)) throw new Error('Tipo de documento inválido.');
}

function calculateScore_(data) {
  let score = 0;

  if (data.tipo === 'CNPJ') score += 20;
  if (['Loja física', 'Loja online', 'Loja física e online'].includes(data.estrutura)) score += 15;
  if (String(data.instagram || '').trim()) score += 5;

  const faixaPts = {
    'Até R$ 1.500': 5,
    'R$ 1.500 a R$ 3.000': 15,
    'R$ 3.000 a R$ 5.000': 25,
    'R$ 5.000 a R$ 10.000': 35,
    'Acima de R$ 10.000': 45,
    'Ainda não sei': 0
  };

  const prazoPts = {
    'Imediatamente': 20,
    'Próximos 15 dias': 12,
    'Próximos 30 dias': 6,
    'Estou pesquisando': 0
  };

  const freqPts = {
    'Semanal': 10,
    'Quinzenal': 10,
    'Mensal': 6,
    'Por coleção': 3,
    'Ainda não sei': 0
  };

  score += faixaPts[data.faixa] || 0;
  score += prazoPts[data.prazo] || 0;
  score += freqPts[data.frequencia] || 0;

  return score;
}

function classify_(score) {
  if (score >= 85) return 'Atacadista Top';
  if (score >= 60) return 'Lojista qualificado';
  if (score >= 40) return 'Revendedor de alto potencial';
  return 'Revendedor em desenvolvimento';
}

function chooseConsultant_(data, score) {
  for (let i = 0; i < CONSULTANTS.length; i++) {
    const c = CONSULTANTS[i];
    const stateOk = !c.states || !c.states.length || c.states.includes(data.estado);
    const minOk = typeof c.minScore !== 'number' || score >= c.minScore;
    const maxOk = typeof c.maxScore !== 'number' || score <= c.maxScore;
    if (stateOk && minOk && maxOk) return c;
  }
  return null;
}

function safe_(value) {
  let text = value == null ? '' : String(value).trim();
  // Impede que entradas do formulário sejam interpretadas como fórmulas na planilha.
  if (/^[=+\-@]/.test(text)) text = "'" + text;
  return text;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
