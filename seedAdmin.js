const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/User');

const ADMIN_NOME = process.env.ADMIN_NOME || 'Administrador';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@admin.com';
const ADMIN_SENHA = process.env.ADMIN_SENHA || 'admin123';

async function seedAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI não definido no arquivo .env');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB conectado.');

    const senhaHash = await bcrypt.hash(ADMIN_SENHA, 10);
    const adminExistente = await User.findOne({ email: ADMIN_EMAIL });

    if (adminExistente) {
      adminExistente.nome = ADMIN_NOME;
      adminExistente.senha = senhaHash;
      adminExistente.role = 'admin';
      await adminExistente.save();

      console.log(`Usuário admin atualizado: ${ADMIN_EMAIL}`);
    } else {
      await User.create({
        nome: ADMIN_NOME,
        email: ADMIN_EMAIL,
        senha: senhaHash,
        role: 'admin'
      });

      console.log(`Usuário admin criado: ${ADMIN_EMAIL}`);
    }

    console.log('Seed concluído com sucesso.');
  } catch (error) {
    console.error('Erro ao executar seed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedAdmin();
