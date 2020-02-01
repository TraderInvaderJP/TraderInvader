const router = require('express').Router()
const dynamoClient = require('../dynamoClient')

/*
    Route: /games/:userid
    Method: GET
    Purpose: This route is used to get all games
        for a specific user
    Query Parameters:
        userid - user's username
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
    Route: /games/:gameid/portfolios/:userid
    Method: GET
    Purpose: This route is used to get the portfolio
        for a specific user in a specific game
    Query Parameters:
        gameid - the game id for the portfolio
        userid - the user's name
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
    Route: /games/:gameid/porfolios
    Method: GET
    Purpose: This route is used to get the portfolio
        values for all players in a specific game
    Query Parameters: 
        gameid - the game id for the game you're 
            retrieving portfolios for
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
    Route: /games
    Method: POST
    Purpose: This route is used to create a new
        game
*/
router.put('/:GameID', (req, res) => {
    const params = {
        TableName: 'Games',
        Item: {
            GameID: req.params.GameID,
            data: req.body.game_data
        },
        ConditionExpression: 'NOT contains(GameID, :GameID)',
        ExpressionAttributeValues: {
            ':GameID': req.params.GameID
        }
    }

    dynamoClient.put(params, function(err, data) {
        if (err) res.send(err);
        else res.send(data)
    })
})

/*
    Route: /games/:gameid/users/:userid
    Method: PUT
    Purpose: This route is used to add a user 
        to a game
    Query Parameters:
        gameid - the game to add the user to
        userid - the user to add to the game
    Request Body:
        initial_amount - the initial amount
            for players in the game
*/
router.put('/:gameid/users/:userid', (req, res) => {
    const params = {
        TableName: 'Portfolio',
        Item: {
            username: req.params.userid,
            gameid: req.params.gameid,
            wallet: req.body.initial_amount,
            stocks: {}
        },
        ConditionExpression: 'NOT contains(username, :username) AND NOT contains(gameid, :gameid)',
        ExpressionAttributeValues: {
            ':username': req.params.userid,
            ':gameid': req.params.gameid
        }
    }

    dynamoClient.put(params, function(err, data) {
        if (err) res.send(err);
        else res.send(data)
    })
})

/*
    Route: /:gameid/portfolios/:userid/buy
    Method: PUT
    Purpose: This route is used to buy a stock for a 
        specific user's portfolio in a specific game
    Query Parameters: 
        gameid - the game you're buying the stocks in
        userid - the user whose portfolio you're buying for
    Request Body:
        symbol - stock symbol you're buying 
        count - the number of stocks you're buying
        value - the value of the stock you're buying
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

/*
    Route: /:gameid/portfolios/:userid/sell
    Method: PUT
    Purpose: This route is used to buy a stock for a 
        specific user's portfolio in a specific game
    Query Parameters: 
        gameid - the game you're selling the stocks in
        userid - the user whose portfolio you're selling for
    Request Body:
        symbol - stock symbol you're selling 
        count - the number of stocks you're selling
        value - the value of the stock you're selling
*/
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