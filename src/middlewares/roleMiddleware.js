module.exports = (...rolesPermitidos) => (req, res, next) => {
  if (!req.user || !rolesPermitidos.includes(req.user.role)) {
    return res.status(403).json({ mensagem: 'Acesso negado' })
  }
  next()
}