const express = require('express')
const cors = require('cors')

const app = express()

//Import routes
const stockRoutes = require('./routes/stocks')
const userRoutes = require('./routes/users')
const statisticRoutes = require('./routes/statistics')
const gameRoutes = require('./routes/games')

app.use(cors())
app.use(express.json())

app.use('/stocks', stockRoutes)
app.use('/users', userRoutes)
app.use('/statistics', statisticRoutes)
app.use('/games', gameRoutes)

module.exports = app
