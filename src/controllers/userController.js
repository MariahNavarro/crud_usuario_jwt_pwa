const bcrypt = require('bcryptjs')
const User = require('../models/User')

const ROLES = ['admin', 'medico', 'paciente']

const CAMPOS_EDITAVEIS = {
  admin: ['nome'],
  medico: ['nome', 'especialidade'],
  paciente: ['nome', 'telefone']
}

function tratarErro(res, erro) {
  if (erro.name === 'CastError') {
    return res.status(400).json({ mensagem: 'ID inválido' })
  }
  if (erro.code === 11000) {
    return res.status(409).json({ mensagem: 'E-mail já cadastrado' })
  }
  if (erro.name === 'ValidationError') {
    return res.status(400).json({ mensagem: erro.message })
  }
  res.status(500).json({ mensagem: 'Erro no servidor', detalhe: erro.message })
}

async function list(req, res) {
  try {
    const filtro = req.user.role === 'medico' ? { role: 'paciente' } : {}
    const users = await User.find(filtro).select('-senha')
    res.json(users)
  } catch (erro) {
    tratarErro(res, erro)
  }
}

async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-senha')
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' })
    }
    res.json(user)
  } catch (erro) {
    tratarErro(res, erro)
  }
}

async function updateMe(req, res) {
  try {
    const campos = CAMPOS_EDITAVEIS[req.user.role] || []
    const dados = {}

    campos.forEach((campo) => {
      if (req.body[campo] !== undefined) dados[campo] = req.body[campo]
    })

    if (req.body.senha) {
      dados.senha = await bcrypt.hash(req.body.senha, 10)
    }

    const user = await User.findByIdAndUpdate(req.user.id, dados, {
      new: true,
      runValidators: true
    }).select('-senha')

    res.json(user)
  } catch (erro) {
    tratarErro(res, erro)
  }
}

async function findById(req, res) {
  try {
    const { id } = req.params
    const { role, id: meuId } = req.user

    if (role === 'paciente' && id !== meuId) {
      return res.status(403).json({ mensagem: 'Acesso negado' })
    }

    const user = await User.findById(id).select('-senha')
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' })
    }

    if (role === 'medico' && user.role !== 'paciente') {
      return res.status(403).json({ mensagem: 'Acesso negado' })
    }

    res.json(user)
  } catch (erro) {
    tratarErro(res, erro)
  }
}

async function create(req, res) {
  try {
    const {
      nome, email, senha, role,
      crm, especialidade, cpf, dataNascimento, telefone
    } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: 'Nome, e-mail e senha são obrigatórios'
      })
    }

    const perfil = role || 'paciente'
    if (!ROLES.includes(perfil)) {
      return res.status(400).json({ mensagem: 'Perfil inválido' })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const user = await User.create({
      nome, email, senha: senhaHash, role: perfil,
      crm, especialidade, cpf, dataNascimento, telefone
    })

    res.status(201).json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      role: user.role
    })
  } catch (erro) {
    tratarErro(res, erro)
  }
}

async function update(req, res) {
  try {
    const {
      nome, email, role,
      crm, especialidade, cpf, dataNascimento, telefone
    } = req.body

    if (role && !ROLES.includes(role)) {
      return res.status(400).json({ mensagem: 'Perfil inválido' })
    }

    const dados = {
      nome, email, role,
      crm, especialidade, cpf, dataNascimento, telefone
    }

    if (req.body.senha) {
      dados.senha = await bcrypt.hash(req.body.senha, 10)
    }

    const user = await User.findByIdAndUpdate(req.params.id, dados, {
      new: true,
      runValidators: true
    }).select('-senha')

    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' })
    }

    res.json(user)
  } catch (erro) {
    tratarErro(res, erro)
  }
}

async function remove(req, res) {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        mensagem: 'Você não pode excluir a própria conta'
      })
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' })
    }

    res.json({ mensagem: 'Usuário removido' })
  } catch (erro) {
    tratarErro(res, erro)
  }
}

module.exports = {
  list,
  me,
  updateMe,
  findById,
  create,
  update,
  remove
}