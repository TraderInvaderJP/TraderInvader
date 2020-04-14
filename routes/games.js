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
        TableName: 'Experimental',
        KeyConditionExpression: 'username = :username and begins_with(identifier, :id)',
        ExpressionAttributeValues: {
            ':username': "user#" + req.params.userid,
            ':id': 'portfolio'
        },
        ProjectionExpression: 'identifier'
    }
    
    dynamoClient.query(params, function(err, data) {
        if (err) res.send(err);
        else {
            let gameList = data.Items;

            res.send({
                success: true,
                msg: '',
                data: gameList.map(item => item.identifier.split('#')[1])
            })
        }
    })
})

router.get('/:gameid/info', async (req, res) => {
    try {
        let params = {
            TableName: 'Experimental',
            IndexName: 'game-index',
            KeyConditionExpression: 'GSI_PK = :gameid AND GSI_SK = :sk',
            ExpressionAttributeValues: {
                ':gameid': req.params.gameid,
                ':sk': 'game#active'
            }
        }
    
        let resData = {}

        let data = await dynamoClient.query(params).promise()
    
        resData.game = data.Items[0]

        params = {
            TableName: 'Experimental',
            IndexName: 'game-index',
            KeyConditionExpression: 'GSI_PK = :gameid AND begins_with(GSI_SK, :sk)',
            ExpressionAttributeValues: {
                ':gameid': req.params.gameid,
                ':sk': 'portfolio#'
            }
        }

        data = await dynamoClient.query(params).promise()

        resData.portfolios = data.Items

        res.send({
            success: true,
            msg: 'Data Retrieved',
            data: resData
        })
    }
    catch (err) {
        res.send({
            success: false,
            msg: err.message,
            data: {}
        })
    }
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
router.get('/:gameid/portfolios/:userid', async (req, res) => {
    try {
        const params = {
            TableName: 'Experimental',
            Key: {
                'username': 'user#' + req.params.userid,
                'identifier': 'portfolio#' + req.params.gameid
            },
            ProjectionExpression: 'wallet, stocks'
        }

        const { Item } = await dynamoClient.get(params).promise()

        res.send({
            success: true,
            msg: 'Retrieved portfolio',
            data: Item
        })
    }
    catch(err) {
        res.send({
            success: false,
            msg: err.message,
            data: {}
        })
    }
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
        TableName: 'Experimental',
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
    Route: /games/:gameid
    Method: POST
    Purpose: This route is used to create a new
        game
    Query parameters:
        gameid - the value used to identify the game being added
    Request body:
        winCondition - A boolean saying what the win condition is
        wallet - A number saying how much money each player gets
            at the start of the game
        users - An array containing the users in the game (probably
            just the user that created it)
        endTime - A date respented as an EPOCH timestamp (number)
*/
router.post('/:gameid', (req, res) => {
    const params = {
        TableName: 'Experimental',
        Item: {
            username: "game#active",
            identifier: req.params.gameid,
            winCondition: req.body.winCondition,
            wallet: req.body.wallet,
            users: req.body.users,
            endTime: req.body.endTime,
            GSI_PK: req.params.gameid,
            GSI_SK: "game#active"
        },
        ConditionExpression: 'NOT contains(GameID, :GameID)',
        ExpressionAttributeValues: {
            ':GameID': req.params.gameid
        }
    }

    dynamoClient.put(params, function(err, data) {
        if (err) res.send({
            success: false,
            msg: err.message,
            data: {}
        });
        else res.send({
            success: true,
            msg: 'Created Game',
            data
        })
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
router.put('/:gameid/users/:userid', async (req, res) => {
    try{
        let params = {
            TableName: 'Experimental',
            Item: {
                username: "user#" + req.params.userid,
                identifier: "portfolio#" + req.params.gameid,
                wallet: req.body.initial_amount,
                stocks: {},
                GSI_PK: req.params.gameid,
                GSI_SK: "portfolio#" + req.params.gameid
            },
            ConditionExpression: 'NOT contains(username, :username) AND NOT contains(gameid, :gameid)',
            ExpressionAttributeValues: {
                ':username': "user#" + req.params.userid,
                ':gameid': req.params.gameid
            }
        }
    
        await dynamoClient.put(params).promise()
        
        params = {
            TableName: 'Experimental',
            Key: {
                username: 'game#active',
                identifier: req.params.gameid
            },
            UpdateExpression: 'SET users = list_append(users, :user)',
            ExpressionAttributeValues: {
                ':user': [req.params.userid]
            }
        }

        await dynamoClient.update(params).promise()

        res.send({
            success: true,
            msg: 'User added',
            data: {}
        })
    }
    catch (err) {
        res.send({
            success: false,
            msg: err.message,
            data: {}
        })
    }
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
        value - current stock price of the stock
*/
router.put('/:gameid/portfolios/:userid/buy', async (req, res) => {
    try {
        let params = {
            TableName: 'Experimental',
            Key: {
                username: 'user#' + req.params.userid,
                identifier: 'portfolio#' + req.params.gameid
            }
        }

        const { symbol, count, value } = req.body

        let { Item } = await dynamoClient.get(params).promise()

        if(Item.stocks[symbol])
            Item.stocks[symbol] += count
        else
            Item.stocks[symbol] = count

        if(Item.wallet - (count * value) < 0) {
            let err = { message: 'Insufficient funds' }

            throw err
        }
        else
            Item.wallet -= (count * value)

        params = {
            TableName: 'Experimental',
            Item: {
                ...Item
            }
        }

        data = await dynamoClient.put(params).promise()

        res.send({
            success: true,
            msg: 'Stock purchased',
            data
        })
    }
    catch (err)
    {
        res.send({
            success: false,
            msg: err.message,
            data: {}
        })
    }
})

/*
    Route: /games/:gameid/portfolios/:userid/sell
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
router.put('/:gameid/portfolios/:userid/sell', async (req, res) => {
    try {
        let params = {
            TableName: 'Experimental',
            Key: {
                username: 'user#' + req.params.userid,
                identifier: 'portfolio#' + req.params.gameid
            }
        }

        const { symbol, value, count } = req.body

        let { Item } = await dynamoClient.get(params).promise()

        if(Item.stocks[symbol]) {
            if(Item.stocks[symbol] - count < 0) {
                const err = { message: 'Not enough stock' }

                throw err
            }
            else 
                Item.stocks[symbol] -= count
        }
        else {
            const err = { message: 'Don\'t own this symbol' }

            throw err
        }

        Item.wallet += count * value

        params = {
            TableName: 'Experimental',
            Item: {
                ...Item
            }
        }

        data = await dynamoClient.put(params).promise()

        res.send({
            success: true,
            msg: 'Stock sold',
            data
        })
    }
    catch (err) {
        res.send({
            success: false,
            msg: err.message,
            data: {}
        })
    }
})

/*
    Route: /portfolios/:userid/active
    Method: GET
    Purpose: This route is used to get all
        active portfolios for a specific user
    Query Parameters:
        userid - user's username
*/
router.get('/portfolios/:userid/active', async (req, res) => {
    var portfolios = [];
    const params = {
        TableName: 'Experimental',
        KeyConditionExpression: 'username = :username and begins_with(identifier, :id)',
        ExpressionAttributeValues: {
            ':username': "user#" + req.params.userid,
            ':id': 'portfolio'
        },
    }
    
    var data = await dynamoClient.query(params, function(err, data) {
        if (err) res.send(err);
        else {
            return data;
        }
    }).promise()

    for (let userPortfolio of data.Items)
    {
        const params = {
            TableName: 'Experimental',
            Key: {
                'username': 'game#active',
                'identifier': userPortfolio.GSI_PK
            },
        }
    
        var result = await dynamoClient.get(params).promise()
        if (Object.keys(result).length)
        {
            portfolios.push(result);
        }
    }

    res.send(portfolios);
})

module.exports = router