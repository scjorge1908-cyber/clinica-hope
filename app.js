/* ═══════════════════════════════════════════
   CLÍNICA HOPE — APP.JS
   Motor do sistema de gestão de sublocação
   Dados: localStorage (demo) | Supabase (produção)
═══════════════════════════════════════════ */

// ═══ BANCO DE DADOS LOCAL (DEMO — substituir por Supabase) ═══
const DB = {
  get: (key) => JSON.parse(localStorage.getItem('hope_' + key) || '[]'),
  set: (key, val) => localStorage.setItem('hope_' + key, JSON.stringify(val)),
  getOne: (key) => JSON.parse(localStorage.getItem('hope_' + key) || 'null'),
  setOne: (key, val) => localStorage.setItem('hope_' + key, JSON.stringify(val)),
  id: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
};

// ═══ ESTADO DA SESSÃO ═══
let currentUser = null;

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('tab' + (tab === 'login' ? 'Login' : 'Register')).classList.add('active');
}

function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) { toast('Preencha e-mail e senha', 'warn'); return; }

  // Demo: aceita qualquer login; produção: validar via Supabase Auth
  const users = DB.get('users');
  const user  = users.find(u => u.email === email && u.pass === btoa(pass));

  if (!user) {
    // Criar conta demo automaticamente se não existir
    const newUser = {
      id: DB.id(), email, pass: btoa(pass),
      nome: email.split('@')[0],
      clinica: 'Clínica Hope',
      clinicaId: DB.id()
    };
    users.push(newUser);
    DB.set('users', users);
    seedDemoData(newUser.clinicaId);
    currentUser = newUser;
  } else {
    currentUser = user;
  }

  DB.setOne('session', currentUser);
  enterApp();
}

function doRegister() {
  const clinica = document.getElementById('regClinica').value.trim();
  const nome    = document.getElementById('regNome').value.trim();
  const email   = document.getElementById('regEmail').value.trim();
  const pass    = document.getElementById('regPass').value;

  if (!clinica || !nome || !email || !pass) { toast('Preencha todos os campos', 'warn'); return; }
  if (pass.length < 8) { toast('Senha deve ter ao menos 8 caracteres', 'warn'); return; }

  const users = DB.get('users');
  if (users.find(u => u.email === email)) { toast('Este e-mail já está cadastrado', 'error'); return; }

  const newUser = { id: DB.id(), email, pass: btoa(pass), nome, clinica, clinicaId: DB.id() };
  users.push(newUser);
  DB.set('users', users);
  seedDemoData(newUser.clinicaId);
  currentUser = newUser;
  DB.setOne('session', currentUser);
  enterApp();
}

function doLogout() {
  currentUser = null;
  DB.setOne('session', null);
  document.getElementById('appScreen').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
}

function forgotPass() { toast('Link de recuperação enviado para seu e-mail!', 'success'); }

function enterApp() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('appScreen').classList.remove('hidden');
  document.getElementById('sideClinicName').textContent = currentUser.clinica;
  goTo('painel');
}

// Verifica sessão ao carregar
window.addEventListener('DOMContentLoaded', () => {
  const sess = DB.getOne('session');
  if (sess && sess.id) { currentUser = sess; enterApp(); }
  populateYears();
});

// ═══════════════════════════════════════════
// NAVEGAÇÃO
// ═══════════════════════════════════════════
function goTo(page) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.classList.add('hidden'); });
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const target = document.getElementById('page' + cap(page));
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); }

  document.querySelectorAll('.nav-item').forEach(n => {
    if (n.getAttribute('onclick') && n.getAttribute('onclick').includes("'" + page + "'")) n.classList.add('active');
  });

  const renders = { painel: renderPainel, salas: renderSalas, psicologas: renderPsicologas, agendamentos: renderAgendamentos, financeiro: renderFinanceiro, config: renderConfig };
  if (renders[page]) renders[page]();
  return false;
}

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// ═══════════════════════════════════════════
// SEED — DADOS DE DEMONSTRAÇÃO
// ═══════════════════════════════════════════
function seedDemoData(clinicaId) {
  // Salas
  const salas = [
    { id: DB.id(), clinicaId, nome: 'Sala 01', endereco: '2º andar — porta azul', horaInicio: '08:00', horaFim: '21:00', dias: ['segunda','terca','quarta','quinta','sexta'], valor: 90 },
    { id: DB.id(), clinicaId, nome: 'Sala 02', endereco: '2º andar — porta branca', horaInicio: '08:00', horaFim: '21:00', dias: ['segunda','terca','quarta','quinta','sexta'], valor: 90 },
    { id: DB.id(), clinicaId, nome: 'Sala 03', endereco: '3º andar — ampla', horaInicio: '09:00', horaFim: '20:00', dias: ['segunda','quarta','sexta'], valor: 110 },
  ];

  // Psicólogas
  const psicologas = [
    { id: DB.id(), clinicaId, nome: 'Psi. Michelle', crp: '06/87654', email: 'michelle@email.com', tel: '(11) 98765-4321', tipoSub: 'semanal' },
    { id: DB.id(), clinicaId, nome: 'Psi. Lana Baeta', crp: '06/23456', email: 'lana@email.com', tel: '(11) 97654-3210', tipoSub: 'avulso' },
    { id: DB.id(), clinicaId, nome: 'Psi. Gabriella', crp: '06/34567', email: 'gabi@email.com', tel: '(11) 96543-2109', tipoSub: 'semanal' },
    { id: DB.id(), clinicaId, nome: 'Psi. Andressa', crp: '06/45678', email: 'andressa@email.com', tel: '(11) 95432-1098', tipoSub: 'quinzenal' },
    { id: DB.id(), clinicaId, nome: 'Psi. Graziela', crp: '06/56789', email: 'graz@email.com', tel: '(11) 94321-0987', tipoSub: 'semanal' },
  ];

  // Agendamentos
  const hoje = new Date();
  const agendamentos = [
    { id: DB.id(), clinicaId, psiId: psicologas[0].id, psiNome: psicologas[0].nome, salaId: salas[0].id, salaNome: salas[0].nome, paciente: 'Maria Silva', data: fmt(hoje, 0), horaI: '09:00', horaF: '10:00', valor: 90, freq: 'semanal', status: 'confirmado', obs: '' },
    { id: DB.id(), clinicaId, psiId: psicologas[0].id, psiNome: psicologas[0].nome, salaId: salas[0].id, salaNome: salas[0].nome, paciente: 'João Souza', data: fmt(hoje, 0), horaI: '10:00', horaF: '11:00', valor: 90, freq: 'semanal', status: 'confirmado', obs: '' },
    { id: DB.id(), clinicaId, psiId: psicologas[1].id, psiNome: psicologas[1].nome, salaId: salas[1].id, salaNome: salas[1].nome, paciente: 'Ana Lima', data: fmt(hoje, 0), horaI: '14:00', horaF: '15:00', valor: 90, freq: 'avulso', status: 'agendado', obs: '' },
    { id: DB.id(), clinicaId, psiId: psicologas[2].id, psiNome: psicologas[2].nome, salaId: salas[2].id, salaNome: salas[2].nome, paciente: 'Carlos Ramos', data: fmt(hoje, 1), horaI: '09:00', horaF: '10:00', valor: 110, freq: 'semanal', status: 'agendado', obs: '' },
    { id: DB.id(), clinicaId, psiId: psicologas[3].id, psiNome: psicologas[3].nome, salaId: salas[0].id, salaNome: salas[0].nome, paciente: 'Bia Costa', data: fmt(hoje, 2), horaI: '18:00', horaF: '19:00', valor: 90, freq: 'quinzenal', status: 'agendado', obs: '' },
    { id: DB.id(), clinicaId, psiId: psicologas[4].id, psiNome: psicologas[4].nome, salaId: salas[1].id, salaNome: salas[1].nome, paciente: 'Pedro Melo', data: fmt(hoje, 0), horaI: '19:00', horaF: '20:00', valor: 90, freq: 'semanal', status: 'confirmado', obs: '' },
  ];

  // Financeiro
  const cobranças = [
    { id: DB.id(), clinicaId, psiId: psicologas[0].id, psiNome: psicologas[0].nome, valor: 360, venc: fmt(hoje, 7), desc: 'Sublocação semanal — fev/2026', status: 'pendente', mpId: '' },
    { id: DB.id(), clinicaId, psiId: psicologas[2].id, psiNome: psicologas[2].nome, valor: 180, venc: fmt(hoje, 14), desc: 'Sublocação semanal — fev/2026', status: 'pago', mpId: 'MP-987654' },
    { id: DB.id(), clinicaId, psiId: psicologas[1].id, psiNome: psicologas[1].nome, valor: 90, venc: fmt(hoje, -3), desc: 'Sublocação avulso — jan/2026', status: 'vencido', mpId: '' },
  ];

  DB.set('salas_' + clinicaId, salas);
  DB.set('psicologas_' + clinicaId, psicologas);
  DB.set('agendamentos_' + clinicaId, agendamentos);
  DB.set('cobrancas_' + clinicaId, cobranças);
}

function fmt(d, addDays = 0) {
  const nd = new Date(d); nd.setDate(nd.getDate() + addDays);
  return nd.toISOString().split('T')[0];
}

// ═══════════════════════════════════════════
// HELPERS de DADOS
// ═══════════════════════════════════════════
function getSalas()       { return DB.get('salas_' + currentUser.clinicaId); }
function getPsis()        { return DB.get('psicologas_' + currentUser.clinicaId); }
function getAgendamentos(){ return DB.get('agendamentos_' + currentUser.clinicaId); }
function getCobrancas()   { return DB.get('cobrancas_' + currentUser.clinicaId); }

// ═══════════════════════════════════════════
// PAINEL DE SALAS
// ═══════════════════════════════════════════
const HORAS = ['08','09','10','11','14','15','16','17','18','19','20'];
const DIAS_PT = { segunda:'Segunda', terca:'Terça', quarta:'Quarta', quinta:'Quinta', sexta:'Sexta' };

function renderPainel() {
  const salas  = getSalas();
  const agends = getAgendamentos();
  const filtroTurno = document.getElementById('painelFiltroTurno')?.value || '';
  const filtroDia   = document.getElementById('painelFiltroDia')?.value  || '';

  // Stats
  const totalSlots = salas.length * HORAS.length * 5;
  const totalOcup  = agends.filter(a => a.status !== 'cancelado').length;
  const taxa       = totalSlots > 0 ? Math.round(totalOcup / totalSlots * 100) : 0;
  const totalVal   = agends.reduce((s, a) => s + (a.valor || 0), 0);

  document.getElementById('statsRow').innerHTML = `
    <div class="stat-card stat-green"><div class="stat-label">Taxa de Ocupação</div><div class="stat-value">${taxa}%</div><div class="stat-sub">da capacidade total</div></div>
    <div class="stat-card"><div class="stat-label">Salas cadastradas</div><div class="stat-value">${salas.length}</div><div class="stat-sub">ativas</div></div>
    <div class="stat-card"><div class="stat-label">Agendamentos</div><div class="stat-value">${totalOcup}</div><div class="stat-sub">este período</div></div>
    <div class="stat-card stat-green"><div class="stat-label">Receita estimada</div><div class="stat-value">R$ ${totalVal.toLocaleString('pt-BR')}</div><div class="stat-sub">sublocações</div></div>
  `;

  // Filtros
  const horasFiltradas = filtroTurno === 'manha' ? ['08','09','10','11'] :
                         filtroTurno === 'tarde'  ? ['14','15','16','17'] :
                         filtroTurno === 'noite'  ? ['18','19','20'] : HORAS;

  const diasFiltrados = filtroDia ? [filtroDia] : Object.keys(DIAS_PT);

  if (!salas.length) {
    document.getElementById('painelWrap').innerHTML = `
      <div style="text-align:center;padding:40px;color:#6b7a94">
        <div style="font-size:32px;margin-bottom:12px">🏠</div>
        Nenhuma sala cadastrada. Vá em <strong>Salas</strong> para cadastrar.
      </div>`;
    return;
  }

  // ── Uma tabela por SALA ──
  // Colunas = Horário | Dia1 | Dia2 | ...
  let html = '';

  salas.forEach(sala => {
    // Filtrar só dias que a sala funciona
    const diasDaSala = diasFiltrados.filter(d => (sala.dias || []).includes(d));

    if (!diasDaSala.length) return; // sala não funciona nos dias filtrados

    let thead = '<tr><th style="width:72px">Horário</th>';
    diasDaSala.forEach(d => thead += `<th>${DIAS_PT[d]}</th>`);
    thead += '</tr>';

    let rows = '';
    horasFiltradas.forEach(hora => {
      // Verificar se este horário está dentro do range da sala
      const hNum = parseInt(hora);
      const hIni = parseInt((sala.horaInicio || '08:00').split(':')[0]);
      const hFim = parseInt((sala.horaFim    || '21:00').split(':')[0]);
      if (hNum < hIni || hNum >= hFim) return; // fora do horário da sala

      rows += `<tr><td style="font-weight:700;font-size:13px;color:#6b7a94">${hora}:00</td>`;

      diasDaSala.forEach(dia => {
        const ocupantes = agends.filter(a => {
          const diaSemana = getDiaSemana(a.data);
          return diaSemana === dia
            && a.salaId === sala.id
            && a.horaI && a.horaI.startsWith(hora)
            && a.status !== 'cancelado';
        });

        if (ocupantes.length === 0) {
          rows += `<td><span class="cell-livre">LIVRE</span></td>`;
        } else if (ocupantes.length >= 2) {
          rows += `<td><span class="cell-conflito">⚠ CONFLITO</span></td>`;
        } else {
          rows += `<td><span class="cell-ocupado">${ocupantes[0].psiNome}</span></td>`;
        }
      });

      rows += '</tr>';
    });

    if (!rows) return; // sem horários para mostrar

    html += `
      <div style="margin-bottom:28px">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
          <div style="width:10px;height:10px;border-radius:50%;background:#10b981"></div>
          <span style="font-family:'DM Serif Display',serif;font-size:17px;font-weight:700">${sala.nome}</span>
          <span style="font-size:12px;color:#6b7a94">${sala.endereco}</span>
          <span style="margin-left:auto;font-size:12px;font-weight:700;color:#0a7c5c">R$ ${(sala.valor||0).toFixed(2)}/sessão</span>
        </div>
        <div style="overflow-x:auto">
          <table class="painel-table">
            <thead>${thead}</thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
    `;
  });

  document.getElementById('painelWrap').innerHTML = html || `
    <div style="text-align:center;padding:40px;color:#6b7a94">
      Nenhuma sala disponível para os filtros selecionados.
    </div>`;
}

function getDiaSemana(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  return ['domingo','segunda','terca','quarta','quinta','sexta','sabado'][d.getDay()];
}

// ═══════════════════════════════════════════
// SALAS
// ═══════════════════════════════════════════
function renderSalas() {
  const salas = getSalas();
  const grid  = document.getElementById('salasGrid');
  if (!salas.length) { grid.innerHTML = '<p class="text-muted">Nenhuma sala cadastrada. Clique em "+ Nova Sala" para começar.</p>'; return; }

  grid.innerHTML = salas.map(sala => `
    <div class="item-card">
      <div class="item-card-head">
        <div>
          <div class="item-card-name">${sala.nome}</div>
          <div class="item-card-sub">${sala.endereco}</div>
        </div>
        <span class="badge badge-green">Ativa</span>
      </div>
      <div class="item-card-details">
        <div class="detail-row"><span>Horários</span><strong>${sala.horaInicio} – ${sala.horaFim}</strong></div>
        <div class="detail-row"><span>Dias</span><strong>${(sala.dias||[]).map(d => d.slice(0,3).toUpperCase()).join(' ')}</strong></div>
        <div class="detail-row"><span>Valor/sessão</span><strong class="text-green">R$ ${(sala.valor||0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</strong></div>
      </div>
      <div class="item-card-actions">
        <button class="btn-outline" style="flex:1" onclick="editSala('${sala.id}')">✎ Editar</button>
        <button class="btn-icon" onclick="deleteSala('${sala.id}')" title="Excluir">🗑</button>
      </div>
    </div>
  `).join('');
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id){ document.getElementById(id).classList.add('hidden'); }

function toggleDay(el) { el.classList.toggle('selected'); }

function salvarSala() {
  const id       = document.getElementById('salaId').value;
  const nome     = document.getElementById('salaNome').value.trim();
  const endereco = document.getElementById('salaEndereco').value.trim();
  const horaInicio = document.getElementById('salaHoraInicio').value;
  const horaFim    = document.getElementById('salaHoraFim').value;
  const valor      = parseFloat(document.getElementById('salaValor').value) || 0;
  const dias       = [...document.querySelectorAll('#daysPicker .day-btn.selected')].map(b => b.dataset.day);

  if (!nome) { toast('Informe o nome da sala', 'warn'); return; }

  const salas = getSalas();

  if (id) {
    const idx = salas.findIndex(s => s.id === id);
    if (idx > -1) salas[idx] = { ...salas[idx], nome, endereco, horaInicio, horaFim, valor, dias };
  } else {
    salas.push({ id: DB.id(), clinicaId: currentUser.clinicaId, nome, endereco, horaInicio, horaFim, valor, dias });
  }

  DB.set('salas_' + currentUser.clinicaId, salas);
  closeModal('modalSala');
  resetModalSala();
  renderSalas();
  renderPainel();
  toast('Sala salva com sucesso!', 'success');
}

function editSala(id) {
  const sala = getSalas().find(s => s.id === id);
  if (!sala) return;
  document.getElementById('salaId').value         = sala.id;
  document.getElementById('salaNome').value        = sala.nome;
  document.getElementById('salaEndereco').value    = sala.endereco;
  document.getElementById('salaHoraInicio').value  = sala.horaInicio;
  document.getElementById('salaHoraFim').value     = sala.horaFim;
  document.getElementById('salaValor').value       = sala.valor;
  document.getElementById('modalSalaTitle').textContent = 'Editar Sala';
  document.querySelectorAll('#daysPicker .day-btn').forEach(b => {
    b.classList.toggle('selected', (sala.dias || []).includes(b.dataset.day));
  });
  openModal('modalSala');
}

function deleteSala(id) {
  if (!confirm('Excluir esta sala? Agendamentos vinculados serão mantidos.')) return;
  const salas = getSalas().filter(s => s.id !== id);
  DB.set('salas_' + currentUser.clinicaId, salas);
  renderSalas();
  toast('Sala removida', 'warn');
}

function resetModalSala() {
  ['salaId','salaNome','salaEndereco','salaValor'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('salaHoraInicio').value = '08:00';
  document.getElementById('salaHoraFim').value = '21:00';
  document.getElementById('modalSalaTitle').textContent = 'Nova Sala';
  document.querySelectorAll('#daysPicker .day-btn').forEach(b => b.classList.remove('selected'));
}

// ═══════════════════════════════════════════
// PSICÓLOGAS
// ═══════════════════════════════════════════
const tipoSubLabel = { avulso: 'Avulso', semanal: 'Semanal', quinzenal: 'Quinzenal', mensal: 'Mensal fixo' };

function renderPsicologas() { renderPsis(); }

function renderPsis() {
  const psis = getPsis();
  const grid = document.getElementById('psiGrid');
  const empty = document.getElementById('psiEmpty');
  const search = (document.getElementById('psiSearch')?.value || '').toLowerCase();
  const filtroTipo = document.getElementById('psiFiltroTipo')?.value || '';

  let lista = psis.filter(p => {
    const matchSearch = !search || p.nome?.toLowerCase().includes(search) || p.email?.toLowerCase().includes(search);
    const matchTipo = !filtroTipo || p.tipoSub === filtroTipo;
    return matchSearch && matchTipo;
  });

  if (!lista.length) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  const badgeClass = { avulso:'psi-badge-avulso', semanal:'psi-badge-semanal', quinzenal:'psi-badge-quinzenal', mensal:'psi-badge-mensal' };
  const tipoLabel  = { avulso:'Avulso', semanal:'Semanal', quinzenal:'Quinzenal', mensal:'Mensal' };

  grid.innerHTML = lista.map(p => {
    const agends  = getAgendamentos().filter(a => a.psiId === p.id && a.status !== 'cancelado');
    const receita = agends.reduce((s, a) => s + (a.valor || 0), 0);
    const initials = (p.nome || '?').split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
    const conselho = p.conselho || 'CRP';
    const crp = p.crp || '—';
    const badge = badgeClass[p.tipoSub] || 'psi-badge-avulso';
    const label = tipoLabel[p.tipoSub] || p.tipoSub;

    return `
      <div class="psi-card">
        <span class="psi-badge ${badge}">${label}</span>
        <div class="psi-card-header">
          <div class="psi-avatar">${initials}</div>
          <div>
            <div class="psi-card-name">${p.nome}</div>
            <div class="psi-card-reg">${conselho} ${crp}</div>
            ${p.especialidade ? `<div style="font-size:11px;color:#0d9488;font-weight:600;margin-top:2px;">${p.especialidade}</div>` : ''}
          </div>
        </div>
        <div class="psi-card-body">
          ${p.email ? `<div class="psi-info-row">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,12 2,6"/></svg>
            <span>${p.email}</span>
          </div>` : ''}
          ${p.tel ? `<div class="psi-info-row">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.76a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/></svg>
            <span>${p.tel}</span>
          </div>` : ''}
        </div>
        <div class="psi-stats">
          <div class="psi-stat">
            <div class="psi-stat-val">${agends.length}</div>
            <div class="psi-stat-label">Agendamentos</div>
          </div>
          <div class="psi-stat">
            <div class="psi-stat-val">R$ ${receita.toLocaleString('pt-BR',{minimumFractionDigits:0})}</div>
            <div class="psi-stat-label">Receita gerada</div>
          </div>
        </div>
        <div class="psi-card-actions">
          <button class="psi-btn-edit" onclick="editPsi('${p.id}')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Editar
          </button>
          <button class="psi-btn-cobrar" onclick="gerarCobrancaPsi('${p.id}')">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Cobrar
          </button>
          <button class="psi-btn-del" onclick="deletePsi('${p.id}')" title="Remover">
            <svg width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function salvarPsi() {
  const id       = document.getElementById('psiEditId')?.value || document.getElementById('psiId')?.value || '';
  const nome     = document.getElementById('psiEditNome')?.value.trim() || '';
  const crp      = document.getElementById('psiEditCRP')?.value.trim() || '';
  const email    = document.getElementById('psiEditEmail')?.value.trim() || '';
  const tel      = document.getElementById('psiEditTel')?.value.trim() || '';
  const tipoSub  = document.getElementById('psiEditTipoSub')?.value || 'avulso';
  const conselho = document.getElementById('psiEditConselho')?.value || 'CRP';

  if (!nome) { toast('Informe o nome', 'warn'); return; }

  const psis = getPsis();
  if (id) {
    const idx = psis.findIndex(p => p.id === id);
    if (idx > -1) psis[idx] = { ...psis[idx], nome, crp, email, tel, tipoSub };
  } else {
    psis.push({ id: DB.id(), clinicaId: currentUser.clinicaId, nome, crp, email, tel, tipoSub });
  }

  DB.set('psicologas_' + currentUser.clinicaId, psis);
  closeModal('modalPsi');
  resetModalPsi();
  renderPsicologas();
  toast('Psicóloga salva com sucesso!', 'success');
}

function editPsi(id) {
  const p = getPsis().find(x => x.id === id);
  if (!p) return;
  document.getElementById('psiId').value       = p.id;
  document.getElementById('psiNome').value     = p.nome;
  document.getElementById('psiCRP').value      = p.crp;
  document.getElementById('psiEmail').value    = p.email;
  document.getElementById('psiTel').value      = p.tel;
  document.getElementById('psiTipoSub').value  = p.tipoSub;
  document.getElementById('modalPsiTitle').textContent = 'Editar Psicóloga';
  openModal('modalPsi');
}

function deletePsi(id) {
  if (!confirm('Excluir esta psicóloga?')) return;
  DB.set('psicologas_' + currentUser.clinicaId, getPsis().filter(p => p.id !== id));
  renderPsicologas();
  toast('Psicóloga removida', 'warn');
}

function resetModalPsi() {
  ['psiId','psiNome','psiCRP','psiEmail','psiTel'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('psiTipoSub').value = 'avulso';
  document.getElementById('modalPsiTitle').textContent = 'Nova Psicóloga';
}

// ═══════════════════════════════════════════
// AGENDAMENTOS
// ═══════════════════════════════════════════
function renderAgendamentos() {
  populateAgendSelects();
  const agends      = getAgendamentos();
  const filtroSala  = document.getElementById('agendFiltroSala')?.value  || '';
  const filtroPsi   = document.getElementById('agendFiltroPsi')?.value   || '';
  const filtroStat  = document.getElementById('agendFiltroStatus')?.value || '';

  const filtrados = agends.filter(a => {
    if (filtroSala && a.salaId !== filtroSala) return false;
    if (filtroPsi  && a.psiId  !== filtroPsi)  return false;
    if (filtroStat && a.status !== filtroStat) return false;
    return true;
  }).sort((a, b) => a.data.localeCompare(b.data));

  const tbody = document.getElementById('agendBody');
  if (!filtrados.length) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:32px;color:var(--muted)">Nenhum agendamento encontrado</td></tr>';
    return;
  }

  tbody.innerHTML = filtrados.map(a => {
    const dataFmt = new Date(a.data + 'T12:00:00').toLocaleDateString('pt-BR');
    const sBadge = { agendado: 'badge-warn', confirmado: 'badge-green', cancelado: 'badge-red' }[a.status] || 'badge-gray';
    return `
      <tr>
        <td><strong>${a.paciente}</strong></td>
        <td>${a.psiNome}</td>
        <td>${a.salaNome}</td>
        <td>${dataFmt}</td>
        <td>${a.horaI} – ${a.horaF}</td>
        <td class="text-green fw-700">R$ ${(a.valor||0).toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
        <td><span class="badge ${sBadge}">${a.status}</span></td>
        <td>
          <button class="btn-icon" onclick="editAgend('${a.id}')" title="Editar">✎</button>
          <button class="btn-icon" onclick="cancelarAgend('${a.id}')" title="Cancelar">✕</button>
        </td>
      </tr>
    `;
  }).join('');
}

function populateAgendSelects() {
  const salas = getSalas();
  const psis  = getPsis();

  const salaFilSel = document.getElementById('agendFiltroSala');
  const psiFilSel  = document.getElementById('agendFiltroPsi');
  const salaModal  = document.getElementById('agendSala');
  const psiModal   = document.getElementById('agendPsi');

  [salaFilSel, salaModal].forEach(sel => {
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = `<option value="">Todas as salas</option>` + salas.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
    sel.value = cur;
  });

  [psiFilSel, psiModal].forEach(sel => {
    if (!sel) return;
    const cur = sel.value;
    sel.innerHTML = `<option value="">Todas as psicólogas</option>` + psis.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    sel.value = cur;
  });
}

function salvarAgendamento() {
  const id       = document.getElementById('agendId').value;
  const psiId    = document.getElementById('agendPsi').value;
  const salaId   = document.getElementById('agendSala').value;
  const paciente = document.getElementById('agendPaciente').value.trim();
  const data     = document.getElementById('agendData').value;
  const horaI    = document.getElementById('agendHoraI').value;
  const horaF    = document.getElementById('agendHoraF').value;
  const valor    = parseFloat(document.getElementById('agendValor').value) || 0;
  const freq     = document.getElementById('agendFreq').value;
  const obs      = document.getElementById('agendObs').value;

  if (!psiId || !salaId || !paciente || !data) { toast('Preencha os campos obrigatórios', 'warn'); return; }

  const psi  = getPsis().find(p => p.id === psiId);
  const sala = getSalas().find(s => s.id === salaId);

  const agends = getAgendamentos();
  const registro = { id: id || DB.id(), clinicaId: currentUser.clinicaId, psiId, psiNome: psi?.nome || '', salaId, salaNome: sala?.nome || '', paciente, data, horaI, horaF, valor, freq, obs, status: 'agendado' };

  if (id) {
    const idx = agends.findIndex(a => a.id === id);
    if (idx > -1) agends[idx] = { ...agends[idx], ...registro };
  } else {
    agends.push(registro);
  }

  DB.set('agendamentos_' + currentUser.clinicaId, agends);
  closeModal('modalAgend');
  resetModalAgend();
  renderAgendamentos();
  toast('Agendamento salvo!', 'success');
}

function editAgend(id) {
  const a = getAgendamentos().find(x => x.id === id);
  if (!a) return;
  populateAgendSelects();
  document.getElementById('agendId').value       = a.id;
  document.getElementById('agendPsi').value      = a.psiId;
  document.getElementById('agendSala').value     = a.salaId;
  document.getElementById('agendPaciente').value = a.paciente;
  document.getElementById('agendData').value     = a.data;
  document.getElementById('agendHoraI').value    = a.horaI;
  document.getElementById('agendHoraF').value    = a.horaF;
  document.getElementById('agendValor').value    = a.valor;
  document.getElementById('agendFreq').value     = a.freq;
  document.getElementById('agendObs').value      = a.obs;
  document.getElementById('modalAgendTitle').textContent = 'Editar Agendamento';
  openModal('modalAgend');
}

function cancelarAgend(id) {
  if (!confirm('Cancelar este agendamento?')) return;
  const agends = getAgendamentos();
  const idx = agends.findIndex(a => a.id === id);
  if (idx > -1) agends[idx].status = 'cancelado';
  DB.set('agendamentos_' + currentUser.clinicaId, agends);
  renderAgendamentos();
  toast('Agendamento cancelado', 'warn');
}

function resetModalAgend() {
  ['agendId','agendPaciente','agendData','agendHoraI','agendHoraF','agendValor','agendObs'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('modalAgendTitle').textContent = 'Novo Agendamento';
}

// ═══════════════════════════════════════════
// FINANCEIRO + MERCADO PAGO
// ═══════════════════════════════════════════
function renderFinanceiro() {
  populateCobPsiSelect();
  const cobs = getCobrancas();
  const totalPend = cobs.filter(c => c.status === 'pendente').reduce((s, c) => s + c.valor, 0);
  const totalPago = cobs.filter(c => c.status === 'pago').reduce((s, c) => s + c.valor, 0);
  const totalVenc = cobs.filter(c => c.status === 'vencido').reduce((s, c) => s + c.valor, 0);

  document.getElementById('statsFinanceiro').innerHTML = `
    <div class="stat-card stat-green"><div class="stat-label">Total Recebido</div><div class="stat-value">R$ ${totalPago.toLocaleString('pt-BR')}</div></div>
    <div class="stat-card stat-warn"><div class="stat-label">A Receber</div><div class="stat-value">R$ ${totalPend.toLocaleString('pt-BR')}</div></div>
    <div class="stat-card"><div class="stat-label">Vencidos</div><div class="stat-value" style="color:var(--danger)">R$ ${totalVenc.toLocaleString('pt-BR')}</div></div>
    <div class="stat-card"><div class="stat-label">Total Cobranças</div><div class="stat-value">${cobs.length}</div></div>
  `;

  const tbody = document.getElementById('finBody');
  if (!cobs.length) { tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:32px;color:var(--muted)">Nenhuma cobrança gerada</td></tr>'; return; }

  tbody.innerHTML = cobs.map(c => {
    const statusMap = { pendente: 'badge-warn', pago: 'badge-green', vencido: 'badge-red' };
    const vencFmt = new Date(c.venc + 'T12:00:00').toLocaleDateString('pt-BR');
    return `
      <tr>
        <td><strong>${c.psiNome}</strong></td>
        <td>${c.desc}</td>
        <td class="fw-700 text-green">R$ ${c.valor.toLocaleString('pt-BR', {minimumFractionDigits:2})}</td>
        <td>${vencFmt}</td>
        <td><span class="badge ${statusMap[c.status]||'badge-gray'}">${c.status}</span></td>
        <td>
          ${c.status === 'pendente' ? `<button class="btn-outline" style="font-size:12px;padding:6px 12px" onclick="enviarLinkPagamento('${c.id}')">Enviar link</button>` : ''}
          ${c.status === 'pago'     ? `<button class="btn-icon" title="Ver recibo" onclick="verRecibo('${c.id}')">🧾</button>` : ''}
          <button class="btn-icon" onclick="deleteCob('${c.id}')">🗑</button>
        </td>
      </tr>
    `;
  }).join('');
}

function populateCobPsiSelect() {
  const sel = document.getElementById('cobPsi');
  if (!sel) return;
  sel.innerHTML = '<option value="">Selecione...</option>' + getPsis().map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
}

function gerarCobranca() {
  const psiId = document.getElementById('cobPsi').value;
  const valor = parseFloat(document.getElementById('cobValor').value);
  const venc  = document.getElementById('cobVenc').value;
  const desc  = document.getElementById('cobDesc').value.trim();

  if (!psiId || !valor || !venc || !desc) { toast('Preencha todos os campos', 'warn'); return; }

  const psi  = getPsis().find(p => p.id === psiId);
  const cobs = getCobrancas();
  cobs.push({ id: DB.id(), clinicaId: currentUser.clinicaId, psiId, psiNome: psi?.nome || '', valor, venc, desc, status: 'pendente', mpId: '' });
  DB.set('cobrancas_' + currentUser.clinicaId, cobs);

  closeModal('modalCobranca');
  renderFinanceiro();
  toast('Cobrança gerada! Clique em "Enviar link" para cobrar via Mercado Pago.', 'success');
}

function gerarCobrancaPsi(psiId) {
  populateCobPsiSelect();
  document.getElementById('cobPsi').value = psiId;
  document.getElementById('cobVenc').value = fmt(new Date(), 7);
  openModal('modalCobranca');
  goTo('financeiro');
}

function enviarLinkPagamento(id) {
  const mpToken = localStorage.getItem('hope_mp_token');
  if (!mpToken) {
    toast('Configure o Mercado Pago primeiro em Configurações', 'warn');
    goTo('config');
    return;
  }

  // Em produção: chamar API do Mercado Pago para criar preferência de pagamento
  // POST https://api.mercadopago.com/checkout/preferences
  toast('🔗 Link gerado! Em produção, será enviado por e-mail/WhatsApp para a psicóloga.', 'success');

  const cobs = getCobrancas();
  const idx  = cobs.findIndex(c => c.id === id);
  if (idx > -1) cobs[idx].mpId = 'MP-' + Date.now().toString(36).toUpperCase();
  DB.set('cobrancas_' + currentUser.clinicaId, cobs);
  renderFinanceiro();
}

function verRecibo(id) { toast('Recibo gerado! (PDF em produção)', 'success'); }
function deleteCob(id) {
  if (!confirm('Excluir esta cobrança?')) return;
  DB.set('cobrancas_' + currentUser.clinicaId, getCobrancas().filter(c => c.id !== id));
  renderFinanceiro();
  toast('Cobrança removida', 'warn');
}

// ═══════════════════════════════════════════
// RELATÓRIOS
// ═══════════════════════════════════════════
function gerarRelatorioOcupacao() {
  const salas  = getSalas();
  const agends = getAgendamentos();
  const output = document.getElementById('relatorioOutput');
  output.classList.remove('hidden');

  let rows = salas.map(sala => {
    const total = HORAS.length * 5;
    const ocup  = agends.filter(a => a.salaId === sala.id && a.status !== 'cancelado').length;
    const taxa  = total > 0 ? Math.round(ocup / total * 100) : 0;
    const barra = `<div style="background:var(--border);border-radius:4px;height:8px;width:100%;"><div style="background:var(--green-l);width:${taxa}%;height:8px;border-radius:4px;"></div></div>`;
    return `<tr><td><strong>${sala.nome}</strong></td><td>${sala.endereco}</td><td>${ocup}</td><td>${total}</td><td>${taxa}% ${barra}</td><td class="text-green fw-700">R$ ${(ocup * sala.valor).toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>`;
  }).join('');

  output.innerHTML = `
    <h3 style="margin-bottom:16px">Relatório de Ocupação de Salas</h3>
    <table class="data-table">
      <thead><tr><th>Sala</th><th>Local</th><th>Agendamentos</th><th>Capacidade</th><th>Taxa Ocupação</th><th>Receita</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function gerarRelatorioFinanceiro() {
  const psis  = getPsis();
  const cobs  = getCobrancas();
  const output = document.getElementById('relatorioOutput');
  output.classList.remove('hidden');

  const rows = psis.map(p => {
    const cobsPsi  = cobs.filter(c => c.psiId === p.id);
    const totalPago= cobsPsi.filter(c => c.status === 'pago').reduce((s,c)=>s+c.valor,0);
    const totalPend= cobsPsi.filter(c => c.status === 'pendente').reduce((s,c)=>s+c.valor,0);
    return `<tr><td><strong>${p.nome}</strong></td><td>${p.crp}</td><td>${tipoSubLabel[p.tipoSub]}</td><td class="text-green fw-700">R$ ${totalPago.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td><td class="fw-700" style="color:var(--warn)">R$ ${totalPend.toLocaleString('pt-BR',{minimumFractionDigits:2})}</td></tr>`;
  }).join('');

  output.innerHTML = `
    <h3 style="margin-bottom:16px">Relatório Financeiro por Psicóloga</h3>
    <table class="data-table">
      <thead><tr><th>Psicóloga</th><th>CRP</th><th>Tipo</th><th>Recebido</th><th>A Receber</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function gerarRelatorioDisponibilidade() {
  const salas  = getSalas();
  const agends = getAgendamentos();
  const output = document.getElementById('relatorioOutput');
  output.classList.remove('hidden');

  let html = '<h3 style="margin-bottom:16px">Disponibilidade de Salas</h3>';
  const dias = Object.keys(DIAS_PT);

  dias.forEach(dia => {
    html += `<h4 style="margin:16px 0 8px;color:var(--green)">${DIAS_PT[dia]}</h4>`;
    html += '<div style="display:flex;gap:8px;flex-wrap:wrap">';
    HORAS.forEach(hora => {
      salas.forEach(sala => {
        const ocu = agends.find(a => getDiaSemana(a.data) === dia && a.horaI.startsWith(hora) && a.salaId === sala.id && a.status !== 'cancelado');
        if (!ocu) {
          html += `<span style="background:var(--green-xl);color:var(--green);padding:4px 10px;border-radius:6px;font-size:12px;font-weight:600">${sala.nome} ${hora}:00</span>`;
        }
      });
    });
    html += '</div>';
  });

  output.innerHTML = html;
}

function gerarRelatorioAssiduidade() {
  const psis   = getPsis();
  const agends = getAgendamentos();
  const output = document.getElementById('relatorioOutput');
  output.classList.remove('hidden');

  const rows = psis.map(p => {
    const total      = agends.filter(a => a.psiId === p.id).length;
    const confirmado = agends.filter(a => a.psiId === p.id && a.status === 'confirmado').length;
    const cancelado  = agends.filter(a => a.psiId === p.id && a.status === 'cancelado').length;
    const taxa       = total > 0 ? Math.round(confirmado / total * 100) : 0;
    return `<tr><td><strong>${p.nome}</strong></td><td>${total}</td><td style="color:var(--green)">${confirmado}</td><td style="color:var(--danger)">${cancelado}</td><td>${taxa}%</td></tr>`;
  }).join('');

  output.innerHTML = `
    <h3 style="margin-bottom:16px">Relatório de Assiduidade</h3>
    <table class="data-table">
      <thead><tr><th>Psicóloga</th><th>Total</th><th>Confirmados</th><th>Cancelados</th><th>Assiduidade</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

// ═══════════════════════════════════════════
// CONFIGURAÇÕES
// ═══════════════════════════════════════════
function renderConfig() {
  if (currentUser) {
    document.getElementById('cfgNome').value = currentUser.clinica || '';
  }
  const mpToken = localStorage.getItem('hope_mp_token') || '';
  const mpPub   = localStorage.getItem('hope_mp_pub')   || '';
  if (mpToken) document.getElementById('cfgMPToken').value = mpToken;
  if (mpPub)   document.getElementById('cfgMPPubKey').value = mpPub;

  document.getElementById('mpBanner').style.display = mpToken ? 'none' : 'flex';
  document.getElementById('mpStatus').textContent = mpToken ? '✅ Mercado Pago conectado' : '';
  document.getElementById('mpStatus').style.color = 'var(--green)';
}

function salvarConfig() {
  const nome = document.getElementById('cfgNome').value.trim();
  if (!nome) { toast('Informe o nome da clínica', 'warn'); return; }
  currentUser.clinica = nome;
  DB.setOne('session', currentUser);
  document.getElementById('sideClinicName').textContent = nome;
  toast('Configurações salvas!', 'success');
}

function salvarMP() {
  const token  = document.getElementById('cfgMPToken').value.trim();
  const pubKey = document.getElementById('cfgMPPubKey').value.trim();
  if (!token) { toast('Informe o Access Token do Mercado Pago', 'warn'); return; }
  localStorage.setItem('hope_mp_token', token);
  localStorage.setItem('hope_mp_pub', pubKey);
  document.getElementById('mpBanner').style.display = 'none';
  document.getElementById('mpStatus').textContent = '✅ Mercado Pago conectado';
  document.getElementById('mpStatus').style.color = 'var(--green)';
  toast('Integração Mercado Pago salva!', 'success');
}

function gerenciarAssinatura() {
  // Em produção: redirecionar para portal de assinatura Mercado Pago
  toast('Redirecionando para o portal de assinatura...', 'success');
}

function exportPainelPDF() { toast('PDF de disponibilidade gerado! (em produção)', 'success'); }

// ═══════════════════════════════════════════
// UTILITÁRIOS
// ═══════════════════════════════════════════
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = { success: '✓ ', warn: '⚠ ', error: '✕ ' }[type] + msg;
  el.className = 'toast ' + type;
  el.classList.remove('hidden');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.add('hidden'), 4000);
}

function populateYears() {
  const sel = document.getElementById('yearFilter');
  if (!sel) return;
  const ano = new Date().getFullYear();
  for (let y = ano; y >= ano - 3; y--) {
    const opt = document.createElement('option');
    opt.value = y; opt.textContent = y;
    sel.appendChild(opt);
  }
}

// Seleção de método de pagamento na modal
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.mp-method').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.mp-method').forEach(m => m.classList.remove('active'));
      el.classList.add('active');
    });
  });
});


// ── NOVA RESERVA — Fluxo em 3 passos ──
let _rPasso = 1;

function openNovaReserva() {
  _rPasso = 1;
  reservaAtualizarUI();
  // Popular salas no select
  const salas = getSalas();
  const sel = document.getElementById('psiSala');
  if (sel) {
    sel.innerHTML = '<option value="">Selecione a sala...</option>' + salas.map(s => `<option value="${s.id}">${s.nome}</option>`).join('');
  }
  // Limpar campos
  ['psiId','psiNome','psiCRP','psiEmail','psiTel','psiEspecialidade','psiValor','psiCobDesc'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  openModal('modalReserva');
}

function reservaAtualizarUI() {
  ['rPasso1','rPasso2','rPasso3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.style.display = _rPasso === i + 1 ? 'block' : 'none';
  });
  ['rStep1dot','rStep2dot','rStep3dot'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.style.background = i < _rPasso ? '#0d9488' : '#e2e8f0';
  });
  const titles = ['Nova Reserva — Profissional', 'Nova Reserva — Detalhes', 'Nova Reserva — Cobrança'];
  const titleEl = document.getElementById('reservaTitle');
  if (titleEl) titleEl.textContent = titles[_rPasso - 1];
  const voltar = document.getElementById('rBtnVoltar');
  const cancelar = document.getElementById('rBtnCancelar');
  const avancar = document.getElementById('rBtnAvancar');
  if (voltar) voltar.style.display = _rPasso > 1 ? 'block' : 'none';
  if (cancelar) cancelar.style.display = _rPasso > 1 ? 'none' : 'block';
  if (avancar) avancar.textContent = _rPasso < 3 ? 'Continuar →' : 'Salvar Reserva';
}

function reservaAvancar() {
  if (_rPasso === 1) {
    const nome = document.getElementById('psiNome')?.value.trim();
    if (!nome) { toast('Informe o nome do profissional', 'warn'); return; }
    _rPasso = 2;
  } else if (_rPasso === 2) {
    const sala = document.getElementById('psiSala')?.value;
    const dataI = document.getElementById('psiDataInicio')?.value;
    if (!sala || !dataI) { toast('Informe a sala e data de início', 'warn'); return; }
    _rPasso = 3;
    // Sugerir descrição automática
    const salaNome = document.getElementById('psiSala')?.selectedOptions[0]?.text || 'sala';
    const mes = new Date(dataI).toLocaleString('pt-BR', {month:'long', year:'numeric'});
    const descEl = document.getElementById('psiCobDesc');
    if (descEl && !descEl.value) descEl.value = `Sublocação ${salaNome} — ${mes}`;
  } else if (_rPasso === 3) {
    salvarNovaReserva();
    return;
  }
  reservaAtualizarUI();
}

function reservaVoltar() {
  if (_rPasso > 1) { _rPasso--; reservaAtualizarUI(); }
}

function salvarNovaReserva() {
  const nome = document.getElementById('psiNome')?.value.trim();
  const crp = document.getElementById('psiCRP')?.value.trim();
  const conselho = document.getElementById('psiConselho')?.value || 'CRP';
  const email = document.getElementById('psiEmail')?.value.trim();
  const tel = document.getElementById('psiTel')?.value.trim();
  const especialidade = document.getElementById('psiEspecialidade')?.value.trim();
  const tipoSub = document.getElementById('psiTipoSub')?.value;
  const salaId = document.getElementById('psiSala')?.value;
  const dataInicio = document.getElementById('psiDataInicio')?.value;
  const horaI = document.getElementById('psiHoraI')?.value;
  const horaF = document.getElementById('psiHoraF')?.value;
  const valor = parseFloat(document.getElementById('psiValor')?.value) || 0;
  const venc = document.getElementById('psiVenc')?.value;
  const desc = document.getElementById('psiCobDesc')?.value.trim();

  // Salvar profissional
  const psis = getPsis();
  const novaPsi = { id: DB.id(), clinicaId: currentUser.clinicaId, nome, crp, conselho, email, tel, especialidade, tipoSub };
  psis.push(novaPsi);
  DB.set('psicologas_' + currentUser.clinicaId, psis);

  // Salvar agendamento
  if (salaId && dataInicio) {
    const agends = getAgendamentos();
    agends.push({ id: DB.id(), clinicaId: currentUser.clinicaId, psiId: novaPsi.id, salaId, data: dataInicio, horaI, horaF, valor, tipo: tipoSub, status: 'agendado', paciente: '' });
    DB.set('agendamentos_' + currentUser.clinicaId, agends);
  }

  // Salvar cobrança
  if (valor > 0 && venc) {
    const cobs = getCobrancas();
    cobs.push({ id: DB.id(), clinicaId: currentUser.clinicaId, psiId: novaPsi.id, descricao: desc, valor, vencimento: venc, status: 'pendente' });
    DB.set('cobrancas_' + currentUser.clinicaId, cobs);
  }

  closeModal('modalReserva');
  renderPsis();
  toast('Reserva criada com sucesso!', 'success');
}

function selectPagto(el, tipo) {
  document.querySelectorAll('.mp-method').forEach(e => e.classList.remove('active'));
  el.classList.add('active');
  const hidden = document.getElementById('psiPagtoTipo');
  if (hidden) hidden.value = tipo;
}

function editPsi(id) {
  const p = getPsis().find(x => x.id === id);
  if (!p) return;
  document.getElementById('psiEditId').value = p.id;
  document.getElementById('psiEditNome').value = p.nome || '';
  document.getElementById('psiEditCRP').value = p.crp || '';
  document.getElementById('psiEditEmail').value = p.email || '';
  document.getElementById('psiEditTel').value = p.tel || '';
  document.getElementById('psiEditTipoSub').value = p.tipoSub || 'avulso';
  if (document.getElementById('psiEditConselho')) document.getElementById('psiEditConselho').value = p.conselho || 'CRP';
  document.getElementById('modalPsiTitle').textContent = 'Editar Profissional';
  openModal('modalPsi');
}
