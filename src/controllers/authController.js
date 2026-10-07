const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const User = require('../models/User')

const ROLES_PUBLICAS = ['medico', 'paciente']

async function register(req, res) {
  try {
    const {
      nome, email, senha, role,
      crm, especialidade,
      cpf, dataNascimento, telefone
    } = req.body

    if (!nome || !email || !senha) {
      return res.status(400).json({
        mensagem: 'Nome, e-mail e senha são obrigatórios'
      })
    }

    if (!ROLES_PUBLICAS.includes(role)) {
      return res.status(400).json({
        mensagem: 'Perfil inválido. Escolha médico ou paciente'
      })
    }

    if (role === 'medico' && (!crm || !especialidade)) {
      return res.status(400).json({
        mensagem: 'Médico precisa informar CRM e especialidade'
      })
    }

    if (role === 'paciente' && (!cpf || !dataNascimento)) {
      return res.status(400).json({
        mensagem: 'Paciente precisa informar CPF e data de nascimento'
      })
    }

    const existe = await User.findOne({ email: email.toLowerCase() })
    if (existe) {
      return res.status(409).json({
        mensagem: 'E-mail já cadastrado'
      })
    }

    const senhaHash = await bcrypt.hash(senha, 10)

    const dados = { nome, email, senha: senhaHash, role }

    if (role === 'medico') {
      dados.crm = crm
      dados.especialidade = especialidade
    } else {
      dados.cpf = cpf
      dados.dataNascimento = dataNascimento
      dados.telefone = telefone
    }

    const user = await User.create(dados)

    res.status(201).json({
      id: user._id,
      nome: user.nome,
      email: user.email,
      role: user.role
    })
  } catch (erro) {
    res.status(500).json({
      mensagem: 'Erro ao cadastrar usuário',
      detalhe: erro.message
    })
  }
}

async function login(req, res) {
  const user = await User.findOne({
    email: req.body.email
  })

  if (!user) {
    return res.status(401).json({
      mensagem: 'E-mail ou senha inválidos'
    })
  }

  const senhaValida = await bcrypt.compare(
    req.body.senha,
    user.senha
  )

  if (!senhaValida) {
    return res.status(401).json({
      mensagem: 'E-mail ou senha inválidos'
    })
  }

  const token = jwt.sign(
    {
      id: user._id,
      nome: user.nome,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h'
    }
  )

  res.json({
    token,
    usuario: {
      id: user._id,
      nome: user.nome,
      email: user.email,
      role: user.role
    }
  })
}

module.exports = {
  register,
  login
}