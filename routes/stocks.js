const router = require('express').Router()
const axios = require('axios')
const dynamoClient = require('../dynamoClient')
const openMarket = require('https')

/* stock market hours request options */
const options = {
    hostname: 'financialmodelingprep.com',
    port: 443,
    path: '/api/is-the-market-open?datatype=json',
    method: 'GET'
  }

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
router.get('/', (req, res) => {
    const req = openMarket.request(options, (res) => {
        res.on('data', (d) => {
          process.stdout.write(d)
        })
      })
      
      req.on('error', (error) => {
        console.error(error)
      })
      
      req.end()
})


module.exports = router