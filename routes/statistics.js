const router = require('express').Router()
const dynamoClient = require('../dynamoClient')
const axios = require('axios') //temp for testing

/*
    Route: /statistics/users/:userid/games
    Method: PUT
    Purpose: This route is used to add a 
        game win to a players number of games won stat
    Query parameters:
        userid - the username of the user to have stats updated
    Request body:
        none
*/
router.put('/users/:userid/games', (req, res) => {
    const params = {
        TableName: 'PlayerStats',
        Key: {
            username: req.params.userid
        }
    }
    
    dynamoClient.get(params, (err, data) => {
        if (err) res.send(err)
        else {
            let oldData = data.Item.Statistics;
            let obj = JSON.parse(data.Item.Statistics);
            obj.numberOfWins = Number(obj.numberOfWins) + 1;
            obj.currentWinStreak = Number(obj.currentWinStreak) + 1;
            obj.currentLossStreak = 0;

            const params = {
                TableName: 'PlayerStats',
                Item: {
                    username: req.params.userid,
                    Statistics: obj
                },
                ConditionExpression: 'not(Statistics = :oldData)',
                ExpressionAttributeValues: {
                    ':oldData': oldData
                }
            }
        
            dynamoClient.put(params, function(err, data) {
                if (err) res.send(err);
                else res.send(data)
            })
        }
    })
})

/*
    Route: /users/:userid
    Method: PUT
    Purpose: This route is used to add a 
        game loss to a players number of games lost stats
    Query parameters:
        userid - the username of the user to have stats updated
    Request body:
        none
*/
router.put('/users/:userid', (req, res) => {
    const params = {
        TableName: 'PlayerStats',
        Key: {
            username: req.params.userid
        }
    }
    
    dynamoClient.get(params, (err, data) => {
        if (err) res.send(err)
        else {
            const oldData = (' ' + data.Item.Statistics).slice(1);
            const obj = JSON.parse(data.Item.Statistics)
            obj.numberOfLosses = Number(obj.numberOfLosses) + 1
            obj.currentLossStreak = Number(obj.currentLossStreak) + 1
            obj.currentWinStreak = 0;

            const params = {
                TableName: 'PlayerStats',
                Item: {
                    username: req.params.userid,
                    Statistics: obj
                },
                ConditionExpression: 'Statistics = :oldData',
                ExpressionAttributeValues: {
                    ':oldData': oldData
                }
            }
        
            dynamoClient.put(params, function(err, data) {
                if (err) res.send(err);
                else res.send(data)
            })
        }
    })
})

/*
    Route: /:userid
    Method: PUT
    Purpose: This route is used to add a 
        daily challenge game win to a user statistics
    Query parameters:
        userid - the username of the user to have stats updated
    Request body:
        none
*/
router.put('/:userid', (req, res) => {
    const params = {
        TableName: 'PlayerStats',
        Key: {
            username: req.params.userid
        }
    }
    
    dynamoClient.get(params, (err, data) => {
        if (err) res.send(err)
        else {
            const oldData = (' ' + data.Item.Statistics).slice(1);
            const obj = JSON.parse(data.Item.Statistics)
            obj.numberOfDailyChallengeWins = Number(obj.numberOfDailyChallengeWins) + 1

            const params = {
                TableName: 'PlayerStats',
                Item: {
                    username: req.params.userid,
                    Statistics: obj
                },
                ConditionExpression: 'Statistics = :oldData',
                ExpressionAttributeValues: {
                    ':oldData': oldData
                }
            }
        
            dynamoClient.put(params, function(err, data) {
                if (err) res.send(err);
                else res.send(data)
            })
        }
    })
})

/*
    Route: /:userid/users
    Method: PUT
    Purpose: This route is used to get a players
        statistics information from the table in the form of a JSON object
    Query parameters:
        userid - the username of the user having their sats returned
    Request body:
        none
*/
router.get('/:userid/users', (req, res) => {
    const params = {
        TableName: 'PlayerStats',
        Key: {
            username: req.params.userid
        }
    }
    
    dynamoClient.get(params, (err, data) => {
        if (err) res.send({
            success: false,
            msg: err.message,
            data: {}
        })
        else 
        res.send({
            success: true,
            msg: '',
            data: data.Item
        })
    })
})

/* TODO: Add achievement routes to backend: */

/*
    Route: /:userid/:achievment
    Method: PUT
    Purpose: This route is used to add an
        achievment to a users list of achievments which is stored as a JSON object
    Query parameters:
        userid - the username of the user to have achievments added to
    Request body:
        achievment - the name of the achievment the user has earned
*/
router.put('/:userid/achievements', (req, res) => {
    const params = {
        TableName: 'PlayerStats',
        Key: {
            username: req.params.userid,
        }
    }
    
    dynamoClient.get(params, (err, data) => {
        if (err) res.send(err)
        else {
            const oldData = (' ' + data.Item.Achievments).slice(1);
            const obj = JSON.parse(data.Item.Achievments);
            obj[req.body.achievmentName] = "Earned";

            const params2 = {
                TableName: 'PlayerStats',
                Item: {
                    username: req.params.userid,
                    Achievements: obj,
                    Statistics: data.Item.Statistics
                },
                ConditionExpression: 'Achievments = :oldData',
                ExpressionAttributeValues: {
                    ':oldData': oldData
                }
            }
        
            dynamoClient.put(params2, function(err, data) {
                if (err) res.send(err);
                else res.send(data)
            })
        }
    })
})

/*
   TEMPORARY FOR TESTING
*/
router.put('/:GameID/Tester', (req, res) => {
    const params = {
        TableName: 'Experimental',
        Key: {
            username: 'game#active',
            identifier: req.params.GameID
        }
    }

    dynamoClient.get(params, async (err, data) => {
        if (err) res.send(err);
        else {
            var userArray = await data.Item.users;
            var moneyMadeByEachUser = [];

            for (let user of userArray)
            {
                moneyMadeByEachUser.push(await getUsersPortfolioValues(user, data.Item.identifier));
            }

            let winnerTrueIndex = moneyMadeByEachUser.indexOf(Math.max(...moneyMadeByEachUser));
            let winnerFalseIndex = moneyMadeByEachUser.indexOf(Math.min(...moneyMadeByEachUser));

            if (data.Item.winCondition == true)
            {
                let index = 0;

                for (let user of userArray)
                {
                    if (index == winnerTrueIndex)
                    {
                        addWinToPlayerStats(user)
                    }
                    else
                    {
                        addLossToPlayerStats(user)
                    }
                    
                    index++;
                }
            }
            else
            {
                let index = 0;

                for (let user of userArray)
                {
                    if (index == winnerFalseIndex)
                    {
                        addWinToPlayerStats(user)
                    }
                    else
                    {
                        addLossToPlayerStats(user)
                    }
                    
                    index++;
                }
            }

            res.send(data)
        }
    })
})

/*
    Return the value of a users portfolio
*/
async function getUsersPortfolioValues(username, gameID) {
    const params = {
        TableName: 'Experimental',
        Key: {
            username: 'user#' + username,
            identifier: 'portfolio#' + gameID
        }
    }

    var data = await dynamoClient.get(params, async (err, data) => {
        if (err) console.log(err);
    }).promise()

    var userValue = await data.Item.wallet;

    userValue += await calculateStockValues(data.Item.stocks);
    
    return userValue;
}

//Add up the value of each stock 
async function calculateStockValues(stocks) {
    var userValue = 0;
    for (let stockSymbol in stocks) {
        userValue += await getStockValue(stockSymbol) * stocks[stockSymbol];
    }
    return userValue;
}

//Get the value for a specific stock
async function getStockValue(stock) {
    let value = await axios.get('https://financialmodelingprep.com/api/v3/stock/real-time-price/' + stock);
    return value.data.price;
}

/*
    Add a win to a players stats
*/
function addWinToPlayerStats(userid) {
    const params1 = {
        TableName: 'PlayerStats',
        Key: {
            username: userid
        }
    }
    
    dynamoClient.get(params1, (err, data) => {
        if (err) console.log("HERE2" + err);
        else {
            let oldData = data.Item.Statistics;
            let obj = data.Item.Statistics;
            obj.numberOfWins = Number(obj.numberOfWins) + 1;
            obj.currentWinStreak = Number(obj.currentWinStreak) + 1;
            obj.currentLossStreak = 0;

            const params2 = {
                TableName: 'PlayerStats',
                Item: {
                    username: userid,
                    Statistics: obj
                },
                ConditionExpression: 'not(Statistics = :oldData)',
                ExpressionAttributeValues: {
                    ':oldData': oldData
                }
            }
        
            dynamoClient.put(params2, function(err, data) {
                if (err) console.log(err);
            })
        }
    })
}

/*
    Add Loss to players stats
*/
function addLossToPlayerStats(userid)  {
    const params1 = {
        TableName: 'PlayerStats',
        Key: {
            username: userid
        }
    }
    
    dynamoClient.get(params1, (err, data) => {
        if (err) console.log("HERE1" + err);
        else {
            let oldData = data.Item.Statistics;
            let obj = data.Item.Statistics;
            obj.numberOfLosses = Number(obj.numberOfLosses) + 1;
            obj.currentLossStreak = Number(obj.currentLossStreak) + 1;
            obj.currentWinStreak = 0;

            const params2 = {
                TableName: 'PlayerStats',
                Item: {
                    username: userid,
                    Statistics: obj
                },
                ConditionExpression: 'not(Statistics = :oldData)',
                ExpressionAttributeValues: {
                    ':oldData': oldData
                }
            }
        
            dynamoClient.put(params2, function(err, data) {
                if (err) console.log(err);
            })
        }
    })
}

module.exports = router