const router = require('express').Router()
const axios = require('axios')
const dynamoClient = require('../dynamoClient')

router.get('/', (req, res) => {
    axios.get('https://financialmodelingprep.com/api/v3/stock/real-time-price')
        .then(result => res.json(result.data))
})

router.get('/:symbol', (req, res) => {
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

/* Returns data on whether the stock market is open */
router.get('/market/status', (req, res) => {
    axios.get('https://financialmodelingprep.com/api/is-the-market-open?datatype=json')
        .then(result => res.send(result.data))
})


module.exports = router