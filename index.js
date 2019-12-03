const express = require('express')
const axios = require('axios')
const cors = require('cors')
const dynamoClient = require('./dynamoClient')

const app = express()

app.use(cors())
app.use(express.json())

app.get('/stock', (req, res) => {
    axios.get('https://financialmodelingprep.com/api/v3/stock/real-time-price')
        .then(result => res.json(result.data))
})

app.get('/stock/:symbol', (req, res) => {
    const params = {
        Key: {
            'symbol': req.params.symbol
        },
        TableName: 'Stock'
    }

    dynamoClient.get(params, (err, data) => {
        if (err) res.send(err)
        else res.json(data.Item)
    })
})

module.exports = app
