const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'medico', 'paciente'],
    default: 'paciente'
  },

  crm: { type: String, trim: true },
  especialidade: { type: String, trim: true },

  cpf: { type: String, trim: true },
  dataNascimento: { type: Date },
  telefone: { type: String, trim: true }
}, {
  timestamps: true
})

module.exports = mongoose.model('User', userSchema)