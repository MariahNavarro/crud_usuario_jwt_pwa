require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const path = require('path')
const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./config/swagger')
const authRoutes = require('./routes/authRoutes')
const userRoutes = require('./routes/userRoutes')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.static(path.join(__dirname, '../frontend')))

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
mongoose.connect(process.env.MONGO_URI)

app.listen(process.env.PORT, () => {
  console.log(`Servidor em http://localhost:${process.env.PORT}`)
  console.log(`Swagger em http://localhost:${process.env.PORT}/api-docs`)
})
