const api = '/api'

function mostrarCampos() {
  const role = document.getElementById('roleCadastro').value
  document.getElementById('camposMedico').classList.toggle('hidden', role !== 'medico')
  document.getElementById('camposPaciente').classList.toggle('hidden', role !== 'paciente')
}

async function cadastrar() {
  const status = document.getElementById('statusCadastro')
  const role = document.getElementById('roleCadastro').value

  const body = {
    nome: document.getElementById('nomeCadastro').value,
    email: document.getElementById('emailCadastro').value,
    senha: document.getElementById('senhaCadastro').value,
    role
  }

  if (role === 'medico') {
    body.crm = document.getElementById('crmCadastro').value
    body.especialidade = document.getElementById('especialidadeCadastro').value
  } else {
    body.cpf = document.getElementById('cpfCadastro').value
    body.dataNascimento = document.getElementById('nascimentoCadastro').value
    body.telefone = document.getElementById('telefoneCadastro').value
  }

  try {
    const resposta = await fetch(`${api}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      status.style.color = '#991b1b'
      status.innerText = dados.mensagem || 'Erro ao cadastrar'
      return
    }

    status.style.color = '#166534'
    status.innerText = `${dados.nome} cadastrado(a) com sucesso! Agora é só entrar.`
  } catch (erro) {
    status.style.color = '#991b1b'
    status.innerText = 'Não foi possível conectar ao servidor'
  }
}

async function login() {
  const email = document.getElementById('emailLogin').value
  const senha = document.getElementById('senhaLogin').value
  const status = document.getElementById('statusLogin')

  try {
    const resposta = await fetch(`${api}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })

    const dados = await resposta.json()

    if (!resposta.ok) {
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
      status.style.color = '#991b1b'
      status.innerText = dados.mensagem
      return
    }

    localStorage.setItem('token', dados.token)
    localStorage.setItem('usuario', JSON.stringify(dados.usuario))

    window.location.href = '/usuarios.html'
  } catch (erro) {
    status.style.color = '#991b1b'
    status.innerText = 'Não foi possível conectar ao servidor'
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
}