const router = require('express').Router()
const dynamoClient = require('../dynamoClient')
/*
    Purpose: This route is used to get all games
        for a specific user
*/
router.get('/:userid', (req, res) => {
    const params = {
        TableName: 'Portfolio',
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': req.params.userid
        },
        ProjectionExpression: 'gameid'
    }
    
    dynamoClient.query(params, function(err, data) {
        if (err) res.send(err);
        else {
            let gameList = data.Items.map(item => item.gameid)

            res.send({
                success: true,
                msg: '',
                data: gameList
            })
        }
    })
})

/*
    Purpose: This route is used to get the portfolio
        for a specific user in a specific game
*/
router.get('/:gameid/portfolios/:userid', (req, res) => {
    const params = {
        TableName: 'Portfolio',
        Key: {
            username: req.params.userid,
            gameid: req.params.gameid,
        }
    }

    dynamoClient.get(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
    })
})

/*
    Purpose: This route is used to get the portfolio
        values for all players in a specific game
*/
router.get('/:gameid/portfolios/', (req, res) => {
    const params = {
        TableName: 'Portfolio',
        IndexName: 'gameid-index',
        KeyConditionExpression: 'gameid = :gameid',
        ExpressionAttributeValues: {
            ':gameid': req.params.gameid
        },
        ProjectionExpression: 'stocks, username, wallet'
    }

    dynamoClient.query(params, (err, data) => {
        if (err) res.send(err)
        else res.send({
            success: true,
            msg: '',
            data: data.Items
        })
    })
})

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
            wallet: req.body.initial_amount,
            stocks: {}
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
        UpdateExpression: 'SET stocks.#symbol = :i, wallet = wallet - :i * :j',
        ExpressionAttributeNames: {
            "#symbol": req.body.symbol
        },
        ExpressionAttributeValues: {
            ':i': req.body.count,
            ':j': req.body.value
        },
        ReturnValues: 'ALL_NEW'
    }

    dynamoClient.update(params, (err, data) => {
        if(err) res.send(err)
        else res.send(data)
    })
})

router.put('/:gameid/portfolios/:userid/sell', (req, res) => {
    const params = {
        TableName: 'Portfolio',
        Key: {
            username: req.params.userid,
            gameid: req.params.gameid
        },
        UpdateExpression: "SET stocks.#symbol = :i, wallet = wallet + :i * :j",
        ExpressionAttributeNames: {
            "#symbol": req.body.symbol
        },
        ExpressionAttributeValues: {
            ':i': req.body.count,
            ':j': req.body.value
        },
        ReturnValues: "UPDATED_NEW"
    }

    dynamoClient.update(params, (err, data) => {
        if(err) res.send(err)
        else res.send(data)
    })
})

module.exports = router