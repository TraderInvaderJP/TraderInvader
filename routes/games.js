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
        if (err) res.send({
            success: false,
            msg: err.message,
            data: {}
        })
        else res.send({
            success: true,
            msg: '',
            data: data.Item
        })
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
    Route: /games/:gameid
    Method: POST
    Purpose: This route is used to create a new
        game
    Query parameters:
        gameid - the value used to identify the game being added
    Request body:
        game_data - a JSON object containing all of the game information
        end_time - A date respented as an EPOCH timestamp (number)
*/
router.post('/:gameid', (req, res) => {
    const params = {
        TableName: 'Experimental',
        Item: {
            username: "game",
            identifier: req.params.gameid,
            ...req.body.game_data
        },
        ConditionExpression: 'NOT contains(GameID, :GameID)',
        ExpressionAttributeValues: {
            ':GameID': req.params.gameid
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
        TableName: 'Experimental',
        Item: {
            username: "user#" + req.params.userid,
            identifier: "portfolio#" + req.params.gameid,
            wallet: req.body.initial_amount,
            stocks: {},
            ongoing: false,
            result: false
        },
        ConditionExpression: 'NOT contains(username, :username) AND NOT contains(gameid, :gameid)',
        ExpressionAttributeValues: {
            ':username': "user#" + req.params.userid,
            ':gameid': req.params.gameid
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
            msg: '',
            data
        })
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
        value - current stock price of the stock
*/
router.put('/:gameid/portfolios/:userid/buy', (req, res) => {
    let params = {
        TableName: 'Experimental',
        Key: {
            username: "user#" + req.params.userid,
            identifier: "portfolio#" + req.params.gameid
        }
    }
    
    const { symbol, count, value } = req.body;

    let isChanged = false;
    let resData = {}

    dynamoClient.get(params, (err, data) => {
        if (err) {
            isChanged = true;
            
            resData = {
                success: false,
                msg: err.message,
                data: {}
            }
        }   
        else {
            let temp = data.Item;

            if(temp.stocks[symbol])
                temp.stocks[symbol] += count;
            else    
                temp.stocks[symbol] = count;

            if (temp.wallet - (count * value) < 0) {
                isChanged = true;

                resData = {
                    success: false,
                    msg: 'Not enough funds',
                    data: {}
                }
            }
            else
                temp.wallet -= count * value;

            if(!isChanged) {
                params = {
                    TableName: 'Experimental',
                    Item: temp
                }

                dynamoClient.put(params, (err, data) => {
                    if (err) {
                        resData = {
                            success: false,
                            msg: err.message,
                            data: {}
                        }
                    }
                    else {
                        resData = {
                            success: true,
                            msg: 'Bought Stock',
                            data
                        }
                    }

                    res.send(resData)
                })
            }
            else
                res.send(resData)
        }
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
    let params = {
        TableName: 'Portfolio',
        Key: {
            username: "user#" + req.params.userid,
            identifier: "portfolio#" + req.params.gameid
        }
    }
    
    const { symbol, count, value } = req.body;

    let isChanged = false;
    let resData = {}

    dynamoClient.get(params, (err, data) => {
        if (err) {
            isChanged = true;
            
            resData = {
                success: false,
                msg: err.message,
                data: {}
            }
        }   
        else {
            let temp = data.Item;

            if(temp.stocks[symbol]) {
                if(temp.stocks[symbol] - count < 0) {
                    isChanged = true;

                    resData = {
                        success: false,
                        msg: 'Don\'t have enough stocks',
                        data: {}
                    }
                }
                else
                    temp.stocks[symbol] -= count;
            }
            else {
                isChanged = true;

                resData = {
                    success: false,
                    msg: 'Don\'t own this stock',
                    data: {}
                }
            }
                
            if(!isChanged)
                temp.wallet += count * value;

            if(!isChanged) {
                params = {
                    TableName: 'Exerimental',
                    Item: temp
                }

                dynamoClient.put(params, (err, data) => {
                    if (err) {
                        resData = {
                            success: false,
                            msg: err.message,
                            data: {}
                        }
                    }
                    else {
                        resData = {
                            success: true,
                            msg: 'Sold stock',
                            data
                        }
                    }

                    res.send(resData)
                })
            }
            else
                res.send(resData)
        }
    })
})

module.exports = router