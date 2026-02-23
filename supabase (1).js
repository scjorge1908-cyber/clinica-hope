// ============================================================
// CLÍNICA HOPE — Conexão com Supabase
// Este arquivo é importado por todas as páginas do sistema
// ============================================================

const SUPABASE_URL  = 'https://cobxcmsnypkngiszzxpp.supabase.co';
const SUPABASE_KEY  = 'sb_publishable_C2ZK1G5JV8INtTEFh-NH9A_d0o2jqXd';

// Cliente Supabase (usando a CDN — não precisa instalar nada)
// Adicione esta tag nos HTMLs: 
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return _supabase;
}

// ============================================================
// CLÍNICA ID ATIVA (salva após login)
// ============================================================
function getClinicaId() {
  const user = JSON.parse(localStorage.getItem('hope_user') || 'null');
  return user?.clinica_id || null;
}

function getPsiId() {
  const psi = JSON.parse(localStorage.getItem('hope_psi_logada') || 'null');
  return psi?.id || null;
}

// ============================================================
// SALAS
// ============================================================
async function dbGetSalas() {
  const db = getSupabase();
  const clinicaId = getClinicaId();
  const { data, error } = await db
    .from('salas')
    .select('*')
    .eq('clinica_id', clinicaId)
    .eq('ativa', true)
    .order('nome');
  if (error) { console.error('Erro salas:', error); return []; }
  return data || [];
}

async function dbSalvarSala(sala) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  if (sala.id) {
    const { error } = await db.from('salas').update({
      nome: sala.nome, endereco: sala.endereco,
      hora_inicio: sala.horaInicio, hora_fim: sala.horaFim,
      dias: sala.dias, valor_avulso: sala.valor
    }).eq('id', sala.id);
    return !error;
  } else {
    const { error } = await db.from('salas').insert({
      clinica_id: clinicaId, nome: sala.nome,
      endereco: sala.endereco, hora_inicio: sala.horaInicio,
      hora_fim: sala.horaFim, dias: sala.dias, valor_avulso: sala.valor
    });
    return !error;
  }
}

async function dbDeletarSala(id) {
  const db = getSupabase();
  const { error } = await db.from('salas').update({ ativa: false }).eq('id', id);
  return !error;
}

// ============================================================
// PSICÓLOGAS
// ============================================================
async function dbGetPsicologas() {
  const db = getSupabase();
  const clinicaId = getClinicaId();
  const { data, error } = await db
    .from('psicologas')
    .select('*')
    .eq('clinica_id', clinicaId)
    .eq('status', 'ativa')
    .order('nome');
  if (error) { console.error('Erro psicologas:', error); return []; }
  return data || [];
}

async function dbSalvarPsicologa(psi) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  if (psi.id) {
    const { error } = await db.from('psicologas').update({
      nome: psi.nome, crp: psi.crp, cpf: psi.cpf,
      email: psi.email, telefone: psi.tel, tipo_sub: psi.tipoSub
    }).eq('id', psi.id);
    return !error;
  } else {
    const { error } = await db.from('psicologas').insert({
      clinica_id: clinicaId, nome: psi.nome, crp: psi.crp,
      cpf: psi.cpf, email: psi.email, telefone: psi.tel,
      endereco: psi.end, tipo_sub: psi.tipoSub
    });
    return !error;
  }
}

async function dbDeletarPsicologa(id) {
  const db = getSupabase();
  const { error } = await db.from('psicologas').update({ status: 'inativa' }).eq('id', id);
  return !error;
}

// ============================================================
// AGENDAMENTOS
// ============================================================
async function dbGetAgendamentos(filtros = {}) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  let query = db.from('agendamentos')
    .select(`*, psicologas(nome), salas(nome)`)
    .eq('clinica_id', clinicaId)
    .order('data', { ascending: true });

  if (filtros.salaId)    query = query.eq('sala_id', filtros.salaId);
  if (filtros.psiId)     query = query.eq('psicologa_id', filtros.psiId);
  if (filtros.status)    query = query.eq('status', filtros.status);
  if (filtros.dataInicio) query = query.gte('data', filtros.dataInicio);
  if (filtros.dataFim)   query = query.lte('data', filtros.dataFim);

  const { data, error } = await query;
  if (error) { console.error('Erro agendamentos:', error); return []; }
  return data || [];
}

async function dbSalvarAgendamento(ag) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  if (ag.id) {
    const { error } = await db.from('agendamentos').update({
      psicologa_id: ag.psiId, sala_id: ag.salaId,
      paciente: ag.paciente, data: ag.data,
      hora_inicio: ag.horaI, hora_fim: ag.horaF,
      valor: ag.valor, tipo: ag.tipo, status: ag.status
    }).eq('id', ag.id);
    return !error;
  } else {
    const { error } = await db.from('agendamentos').insert({
      clinica_id: clinicaId, psicologa_id: ag.psiId,
      sala_id: ag.salaId, contrato_id: ag.contratoId || null,
      paciente: ag.paciente, data: ag.data,
      hora_inicio: ag.horaI, hora_fim: ag.horaF,
      valor: ag.valor, tipo: ag.tipo || 'avulso', status: 'agendado'
    });
    return !error;
  }
}

async function dbCancelarAgendamento(id, motivo) {
  const db = getSupabase();
  const { error } = await db.from('agendamentos')
    .update({ status: 'cancelado', motivo_cancelamento: motivo })
    .eq('id', id);
  return !error;
}

// ============================================================
// CONTRATOS
// ============================================================
async function dbGetContratos(psiId = null) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  let query = db.from('contratos')
    .select(`*, psicologas(nome, crp, email), salas(nome)`)
    .eq('clinica_id', clinicaId)
    .order('criado_em', { ascending: false });

  if (psiId) query = query.eq('psicologa_id', psiId);

  const { data, error } = await query;
  if (error) { console.error('Erro contratos:', error); return []; }
  return data || [];
}

async function dbSalvarContrato(contrato) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  const { data, error } = await db.from('contratos').insert({
    clinica_id: clinicaId,
    psicologa_id: contrato.psicolagaId,
    sala_id: contrato.salaId || null,
    tipo: contrato.tipo,
    valor: contrato.valor,
    bloco_qtd: contrato.blocoQtd || 1,
    bloco_desconto: contrato.blocoDesconto || 0,
    bloco_dias: contrato.blocoDias || [],
    bloco_horarios: contrato.blocoHorarios || [],
    data_inicio: contrato.dataInicio || new Date().toISOString().split('T')[0],
    data_validade: contrato.dataValidade,
    assinatura_psi: contrato.assinaturaPsi,
    assinatura_clinica: contrato.assinaturaClinica,
    assinado_em: new Date().toISOString(),
    ip_assinatura: contrato.ip || '',
    texto_contrato: contrato.texto,
    status: 'ativo'
  }).select().single();

  if (error) { console.error('Erro salvar contrato:', error); return null; }
  return data;
}

async function dbVerificarContratoAtivo(psicolagaId) {
  const db = getSupabase();
  const hoje = new Date().toISOString().split('T')[0];
  const { data, error } = await db.from('contratos')
    .select('*')
    .eq('psicologa_id', psicolagaId)
    .eq('status', 'ativo')
    .gte('data_validade', hoje)
    .limit(1);
  if (error) return null;
  return data?.[0] || null;
}

// ============================================================
// COBRANÇAS / FINANCEIRO
// ============================================================
async function dbGetCobrancas(psiId = null) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  let query = db.from('cobrancas')
    .select(`*, psicologas(nome)`)
    .eq('clinica_id', clinicaId)
    .order('vencimento', { ascending: false });

  if (psiId) query = query.eq('psicologa_id', psiId);

  const { data, error } = await query;
  if (error) { console.error('Erro cobranças:', error); return []; }
  return data || [];
}

async function dbSalvarCobranca(cob) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  const { data, error } = await db.from('cobrancas').insert({
    clinica_id: clinicaId,
    psicologa_id: cob.psiId,
    contrato_id: cob.contratoId || null,
    descricao: cob.descricao,
    valor: cob.valor,
    vencimento: cob.vencimento,
    status: 'pendente'
  }).select().single();

  if (error) { console.error('Erro salvar cobrança:', error); return null; }
  return data;
}

async function dbMarcarPago(id) {
  const db = getSupabase();
  const { error } = await db.from('cobrancas')
    .update({ status: 'pago', pago_em: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

// ============================================================
// CONFIGURAÇÕES DA CLÍNICA
// ============================================================
async function dbGetConfig() {
  const db = getSupabase();
  const clinicaId = getClinicaId();
  const { data, error } = await db.from('config_clinica')
    .select('*')
    .eq('clinica_id', clinicaId)
    .single();
  if (error) return null;
  return data;
}

async function dbSalvarConfig(cfg) {
  const db = getSupabase();
  const clinicaId = getClinicaId();

  // Upsert: atualiza se existe, cria se não existe
  const { error } = await db.from('config_clinica').upsert({
    clinica_id: clinicaId,
    ...cfg,
    atualizado_em: new Date().toISOString()
  }, { onConflict: 'clinica_id' });

  return !error;
}

// ============================================================
// AUTENTICAÇÃO SIMPLES (sem Supabase Auth por ora)
// ============================================================
async function dbLogin(email, senha) {
  const db = getSupabase();
  const senhaHash = btoa(senha); // Em produção: usar bcrypt

  const { data, error } = await db.from('usuarios')
    .select(`*, clinicas(*)`)
    .eq('email', email)
    .eq('senha_hash', senhaHash)
    .single();

  if (error || !data) return null;

  const user = {
    id: data.id,
    nome: data.nome,
    email: data.email,
    role: data.role,
    clinica_id: data.clinica_id,
    clinica_nome: data.clinicas?.nome || ''
  };

  localStorage.setItem('hope_user', JSON.stringify(user));
  return user;
}

async function dbRegistrar(dados) {
  const db = getSupabase();

  // 1. Criar clínica
  const { data: clinica, error: errClinica } = await db.from('clinicas').insert({
    nome: dados.clinica, proprietaria: dados.nome,
    email: dados.email, plano: 'profissional', status: 'trial'
  }).select().single();

  if (errClinica) return { erro: 'E-mail já cadastrado ou erro ao criar clínica.' };

  // 2. Criar config padrão
  await db.from('config_clinica').insert({ clinica_id: clinica.id });

  // 3. Criar usuário admin
  const { error: errUser } = await db.from('usuarios').insert({
    clinica_id: clinica.id, nome: dados.nome,
    email: dados.email, senha_hash: btoa(dados.senha), role: 'admin'
  });

  if (errUser) return { erro: 'Erro ao criar usuário.' };

  return { sucesso: true, clinica_id: clinica.id };
}

async function dbLogout() {
  localStorage.removeItem('hope_user');
  localStorage.removeItem('hope_psi_logada');
}

// ============================================================
// PSICÓLOGA — CADASTRO PELO PORTAL PÚBLICO
// ============================================================
async function dbCadastrarPsiPortal(dadosPsi, clinicaId) {
  const db = getSupabase();

  // Verifica se já existe pelo email
  const { data: existe } = await db.from('psicologas')
    .select('id').eq('email', dadosPsi.email).eq('clinica_id', clinicaId).single();

  if (existe) return { id: existe.id, jaExistia: true };

  const { data, error } = await db.from('psicologas').insert({
    clinica_id: clinicaId,
    nome: dadosPsi.nome, crp: dadosPsi.crp,
    cpf: dadosPsi.cpf, email: dadosPsi.email,
    telefone: dadosPsi.tel, endereco: dadosPsi.end,
    tipo_sub: 'avulso'
  }).select().single();

  if (error) return null;
  return data;
}

// ============================================================
// PAINEL DA PSICÓLOGA — busca seus próprios dados
// ============================================================
async function dbGetDadosPsicologa(psiId, clinicaId) {
  const db = getSupabase();

  const [agendamentos, contratos, cobrancas] = await Promise.all([
    db.from('agendamentos').select(`*, salas(nome)`).eq('psicologa_id', psiId).eq('clinica_id', clinicaId).order('data'),
    db.from('contratos').select(`*, salas(nome)`).eq('psicologa_id', psiId).eq('status', 'ativo'),
    db.from('cobrancas').select('*').eq('psicologa_id', psiId).eq('clinica_id', clinicaId).order('vencimento', {ascending: false})
  ]);

  return {
    agendamentos: agendamentos.data || [],
    contratos: contratos.data || [],
    cobrancas: cobrancas.data || []
  };
}

console.log('✅ Supabase conectado:', SUPABASE_URL);
