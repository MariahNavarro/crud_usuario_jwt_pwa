const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const header = req.headers.authorization

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ mensagem: 'Token não informado' })
  }

  const token = header.split(' ')[1]

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch (erro) {
    return res.status(401).json({ mensagem: 'Token inválido ou expirado' })
  }
}

module.exports = authMiddleware