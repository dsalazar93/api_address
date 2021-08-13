const express = require('express')
const app = express()
//const cors = require('cors')

// PORT
require('dotenv').config()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(express.json())
//app.use(cors())

// Routes
const router = require('./routes/router.js')
app.use('/api', router)

// Server
app.listen(PORT, () => console.log(`Servidor corriendo en el puerto ${PORT}`));