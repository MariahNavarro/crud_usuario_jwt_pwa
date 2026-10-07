const api = '/api'
const token = localStorage.getItem('token')
const logado = JSON.parse(localStorage.getItem('usuario') || 'null')
let usuariosCache = []

if (!token || !logado) {
  logout()
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
  window.location.href = '/'
}

function esc(texto) {
  return String(texto ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]))
}

function mostrar(id, visivel) {
  document.getElementById(id).classList.toggle('hidden', !visivel)
}

function msg(id, texto, ok = true) {
  const el = document.getElementById(id)
  el.style.color = ok ? '#166534' : '#991b1b'
  el.innerText = texto
}

async function chamar(url, opcoes = {}) {
  const resposta = await fetch(`${api}${url}`, {
    ...opcoes,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(opcoes.headers || {})
    }
  })

  if (resposta.status === 401) {
    logout()
  }

  return resposta
}

const NOMES_PERFIL = { admin: 'Administrador', medico: 'Médico', paciente: 'Paciente' }

function iniciar() {
  const role = logado.role

  document.getElementById('topoPerfil').innerText = NOMES_PERFIL[role]
  document.getElementById('rotuloPerfil').innerText = NOMES_PERFIL[role]
  document.getElementById('boasVindas').innerText = `Olá, ${logado.nome}`

  if (role === 'admin') {
    document.getElementById('descricaoPerfil').innerText =
      'Você pode gerenciar todos os usuários do sistema.'
    mostrar('cardCriar', true)
    mostrar('cardLista', true)
    document.getElementById('tituloLista').innerText = 'Todos os usuários'
    document.getElementById('subtituloLista').innerText = 'Criar, editar e excluir'
    listarUsuarios()
  } else if (role === 'medico') {
    document.getElementById('descricaoPerfil').innerText =
      'Consulte a lista de pacientes cadastrados.'
    mostrar('cardLista', true)
    mostrar('grupoEspecialidade', true)
    document.getElementById('tituloLista').innerText = 'Pacientes'
    document.getElementById('subtituloLista').innerText = 'Somente leitura'
    listarUsuarios()
  } else {
    document.getElementById('descricaoPerfil').innerText =
      'Aqui você vê e atualiza os seus dados.'
    mostrar('grupoTelefone', true)
    document.getElementById('gridPrincipal').style.gridTemplateColumns =
      'minmax(0, 520px)'
  }

  carregarPerfil()
}

async function carregarPerfil() {
  const resposta = await chamar('/users/me')
  if (!resposta.ok) return

  const u = await resposta.json()
  document.getElementById('nomePerfil').value = u.nome || ''
  document.getElementById('telefonePerfil').value = u.telefone || ''
  document.getElementById('especialidadePerfil').value = u.especialidade || ''

  let info = u.email
  if (u.role === 'medico') info += ` · CRM ${u.crm || '-'}`
  if (u.role === 'paciente') info += ` · CPF ${u.cpf || '-'}`
  document.getElementById('infoFixa').innerText = info
}

async function salvarPerfil() {
  const role = logado.role
  const body = { nome: document.getElementById('nomePerfil').value }

  if (role === 'paciente') {
    body.telefone = document.getElementById('telefonePerfil').value
  }
  if (role === 'medico') {
    body.especialidade = document.getElementById('especialidadePerfil').value
  }

  const senha = document.getElementById('senhaPerfil').value
  if (senha) body.senha = senha

  const resposta = await chamar('/users/me', {
    method: 'PUT',
    body: JSON.stringify(body)
  })

  if (!resposta.ok) {
    msg('statusPerfil', 'Não foi possível salvar', false)
    return
  }

  const atualizado = await resposta.json()
  logado.nome = atualizado.nome
  localStorage.setItem('usuario', JSON.stringify(logado))
  document.getElementById('boasVindas').innerText = `Olá, ${logado.nome}`
  document.getElementById('senhaPerfil').value = ''
  msg('statusPerfil', 'Dados atualizados com sucesso')
}

async function listarUsuarios() {
  const resposta = await chamar('/users')

  if (!resposta.ok) {
    document.getElementById('usuarios').innerHTML =
      '<p class="muted">Você não tem permissão para ver esta lista.</p>'
    return
  }

  usuariosCache = await resposta.json()
  const ehAdmin = logado.role === 'admin'
  const div = document.getElementById('usuarios')

  if (usuariosCache.length === 0) {
    div.innerHTML = '<p class="muted">Nenhum usuário encontrado.</p>'
    return
  }

  div.innerHTML = usuariosCache.map((u) => {
    let detalhe = ''
    if (u.role === 'medico') {
      detalhe = `CRM ${esc(u.crm || '-')} · ${esc(u.especialidade || '-')}`
    }
    if (u.role === 'paciente') {
      detalhe = `CPF ${esc(u.cpf || '-')} · Tel ${esc(u.telefone || '-')}`
    }

    const botoes = ehAdmin ? `
      <div class="actions">
        <button class="secondary small" data-acao="editar" data-id="${esc(u._id)}">Editar</button>
        ${u._id === logado.id ? '' : `<button class="danger small" data-acao="excluir" data-id="${esc(u._id)}">Excluir</button>`}
      </div>` : ''

    return `
      <article class="user-item">
        <div class="user-info">
          <div class="avatar">${esc(u.nome.charAt(0).toUpperCase())}</div>
          <div>
            <strong>${esc(u.nome)}</strong>
            <span>${esc(u.email)}</span>
            <span>${detalhe}</span>
            <small>${esc(u.role)}</small>
          </div>
        </div>
        ${botoes}
      </article>`
  }).join('')
}

document.getElementById('usuarios').addEventListener('click', (e) => {
  const botao = e.target.closest('button[data-acao]')
  if (!botao) return

  if (botao.dataset.acao === 'editar') editarUsuario(botao.dataset.id)
  if (botao.dataset.acao === 'excluir') removerUsuario(botao.dataset.id)
})

function mostrarCamposNovo() {
  const role = document.getElementById('roleNovo').value
  mostrar('novoMedico', role === 'medico')
  mostrar('novoPaciente', role === 'paciente')
}

async function criarUsuario() {
  const role = document.getElementById('roleNovo').value

  const body = {
    nome: document.getElementById('nomeNovo').value,
    email: document.getElementById('emailNovo').value,
    senha: document.getElementById('senhaNovo').value,
    role
  }

  if (role === 'medico') {
    body.crm = document.getElementById('crmNovo').value
    body.especialidade = document.getElementById('especialidadeNovo').value
  }
  if (role === 'paciente') {
    body.cpf = document.getElementById('cpfNovo').value
    body.dataNascimento = document.getElementById('nascimentoNovo').value || undefined
    body.telefone = document.getElementById('telefoneNovo').value
  }

  const resposta = await chamar('/users', {
    method: 'POST',
    body: JSON.stringify(body)
  })

  const dados = await resposta.json()

  if (!resposta.ok) {
    msg('statusCrud', dados.mensagem || 'Erro ao criar usuário', false)
    return
  }

  ;['nomeNovo', 'emailNovo', 'senhaNovo', 'crmNovo', 'especialidadeNovo',
    'cpfNovo', 'nascimentoNovo', 'telefoneNovo'
  ].forEach((id) => { document.getElementById(id).value = '' })

  msg('statusCrud', 'Usuário criado com sucesso')
  listarUsuarios()
}


let idEditando = null
let idExcluindo = null

function fecharModais() {
  idEditando = null
  idExcluindo = null
  mostrar('modalEditar', false)
  mostrar('modalExcluir', false)
  document.getElementById('statusEditar').innerText = ''
}

function editarUsuario(id) {
  const atual = usuariosCache.find((u) => u._id === id)
  if (!atual) return

  idEditando = id
  document.getElementById('nomeEditar').value = atual.nome
  document.getElementById('emailEditar').value = atual.email
  document.getElementById('roleEditar').value = atual.role
  mostrar('modalEditar', true)
}

async function salvarEdicao() {
  const body = {
    nome: document.getElementById('nomeEditar').value,
    email: document.getElementById('emailEditar').value,
    role: document.getElementById('roleEditar').value
  }

  const resposta = await chamar(`/users/${idEditando}`, {
    method: 'PUT',
    body: JSON.stringify(body)
  })

  if (!resposta.ok) {
    const dados = await resposta.json()
    msg('statusEditar', dados.mensagem || 'Erro ao editar', false)
    return
  }

  fecharModais()
  msg('statusCrud', 'Usuário atualizado')
  listarUsuarios()
}

function removerUsuario(id) {
  const atual = usuariosCache.find((u) => u._id === id)
  if (!atual) return

  idExcluindo = id
  document.getElementById('textoExcluir').innerText =
    `Tem certeza que deseja excluir ${atual.nome}? Esta ação não pode ser desfeita.`
  mostrar('modalExcluir', true)
}

async function confirmarExclusao() {
  const id = idExcluindo
  fecharModais()

  const resposta = await chamar(`/users/${id}`, { method: 'DELETE' })

  if (!resposta.ok) {
    const dados = await resposta.json()
    msg('statusCrud', dados.mensagem || 'Erro ao excluir', false)
    return
  }

  msg('statusCrud', 'Usuário removido')
  listarUsuarios()
}

iniciar()

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}