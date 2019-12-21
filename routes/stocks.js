const router = require('express').Router()
const axios = require('axios')
const dynamoClient = require('./dynamoClient')

app.get('/', (req, res) => {
    axios.get('https://financialmodelingprep.com/api/v3/stock/real-time-price')
        .then(result => res.json(result.data))
})

app.get('/:symbol', (req, res) => {
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

module.exports = router