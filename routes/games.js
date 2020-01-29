const router = require('express').Router()
const dynamoClient = require('../dynamoClient')
/*
    Purpose: This route is used to get all games
        for a specific user
    Returns: all gameIds matched with a specific
        username from the Portfolio table
*/
router.get('/users/:username/games', (req, res) => {
    var params = {
        TableName: 'Portfolio',
        ExpressionAttributeValues: {
            'username': req.params.userId,
        },
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
    }
    
    dynamoClient.query(params, function(err, data) {
        if (err) res.send(err);
        else res.send(data)
    })
})

/*
    Purpose: This route is used to get the portfolio
        for a specific user in a specific game
*/
router.get('/:gameid/portfolios/:userid', (req, res) => {
    const params = {
        TableName: 'Portfolio',
        Item: {
            username: req.params.userid,
            gameid: req.params.gameid,
            stocks: []
        }
    }
})

/*
    Purpose: This route is used to get the portfolio
        values for all players in a specific game
*/
router.get('/:gameid/portfolios/:userid/players', (req, res) => {})

/*
    Purpose: This route is used to create a new
        game
*/
router.post('/', (req, res) => {
    
})

/*
    Purpose: This route is used to add a user 
        to a game
*/
router.put('/:gameid/users/:userid', (req, res) => {
    const params = {
        TableName: 'Portfolio',
        Item: {
            username: req.params.userid,
            gameid: req.params.gameid,
            stocks: []
        }
    }

    dynamoClient.put(params, function(err, data) {
        if (err) res.send(err);
        else res.send(data)
    })
})

/*
    Purpose: This route is used to buy a stock for a 
        specific user's portfolio in a specific game
*/
router.put('/:gameid/portfolios/:userid/buy', (req, res) => {
    const params = {
        TableName: 'Portfolio',
        Key: {
            username: req.params.userid,
            gameid: req.params.gameid
        },
        UpdateExpression: "SET stocks = list_append(stocks, :i)",
        ExpressionAttributeValues: {
            ':i': [{
                symbol: req.body.symbol,
                amount: req.body.amount
            }]
        },
        ReturnValues: "UPDATED_NEW"
    }

    dynamoClient.update(params, (err, data) => {
        if(err) res.send(err)
        else res.send(data)
    })
})

/*
    Purpose: This route is used to sell a stock from 
        a specific user's portfolio in a specific game
*/
router.put('/:gameid/portfolios/:userid/sell', (req, res) => {})

module.exports = router