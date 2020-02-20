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
            const oldData = (' ' + data.Item.Statistics).slice(1);
            const obj = JSON.parse(data.Item.Statistics)
            obj.numberOfWins = Number(obj.numberOfWins) + 1
            obj.currentWinStreak = Number(obj.currentWinStreak) + 1
            obj.currentLossStreak = 0;

            const params = {
                TableName: 'PlayerStats',
                Item: {
                    username: req.params.userid,
                    Statistics: JSON.stringify(obj)
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
                    Statistics: JSON.stringify(obj)
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
                    Statistics: JSON.stringify(obj)
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
                    Achievments: JSON.stringify(obj),
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

var something;
router.put('/:GameID/Tester', (req, res) => {
    const params = {
        TableName: 'Games',
        Key: {
            GameID: req.params.GameID
        }
    }

    dynamoClient.get(params, async (err, data) => {
        if (err) res.send(err);
        else {
            var userArray = data.Item.data.users;
            console.log(userArray);
            var userPortfolioArray = [];
            var moneyMadeByEachUser = [];

            for (let user of userArray)
            {
                var someUser = await getUsersPortfolioValues(user, data.Item.GameID);
                userPortfolioArray.push(someUser);
            }

            //console.log(userPortfolioArray);

            for (let userPortfolio of userPortfolioArray)
            {
                var value = userPortfolio.Item.wallet;
                
                for (var stockSymbol in userPortfolio.Item.stocks) {
                    var stockValue = await getStockValue(stockSymbol);
                    value = value + stockValue;
                }
                moneyMadeByEachUser.push(value);
                console.log("EXECUTION");
            }

            for (var step = 0; step < moneyMadeByEachUser.length; step++)
            {
                if (moneyMadeByEachUser[step] < userPortfolioArray[step].Item.wallet)
                {
                    moneyMadeByEachUser[step] = moneyMadeByEachUser[step] + userPortfolioArray[step].Item.wallet;
                }
            }

            console.log(moneyMadeByEachUser);

            //console.log(moneyMadeForEachUserArray[0].Item.stocks)



            // const params2 = {
            //     TableName: 'Portfolio',
            //     IndexName: 'gameid-index',
            //     KeyConditionExpression: 'gameid = :gameid',
            //     ExpressionAttributeValues: {
            //         ':gameid': req.params.GameID
            //     },
            //     ProjectionExpression: 'stocks, username, wallet'
            // }

            // dynamoClient.query(params2, (err, data) => {
            //     if (err) console.log("ERROR259");
            //     else 
            //     {
            //         var userPortfolioValues = [];
            //         for (let step = 0; step < data.Count; step++)
            //         {
            //             var value = data.Items[step].wallet;

            //             for (var stockSymbol in data.Items[step].stocks)
            //             {
            //                 console.log(data.Items[step].stocks[stockSymbol]);
                                
            //                 var stockSymbolPrice;
            //                 var strArray = [];
                            
            //                 vaxios.get('https://financialmodelingprep.com/api/v3/stock/real-time-price/' + stockSymbol)
                            
                                

            //                 userPortfolioValues.push(200);
                            
            //             }

            //         }
            //         console.log(userPortfolioValues);
            //     }
            // })




            res.send(data)
        }
    })


})


/*
    Return the value of a users portfolio
*/
async function getUsersPortfolioValues(username, gameID) {
    const params = {
        TableName: 'Portfolio',
        Key: {
            username: username,
            gameid: gameID
        }
    }

    var data = await dynamoClient.get(params, async (err, data) => {
        const error = err;
        if (err) console.log("error");
        else {
            // var userValue = 0;
            // userValue = userValue + data.Item.wallet;

            // for (var stockSymbol in data.Item.stocks) {
            //     var stockValue = await getStockValue(stockSymbol);
            //     userValue = userValue + stockValue;
            // }
            
            return data;
        }
    }).promise()

    return data;
}

async function getStockValue(stock) {
    let value = await axios.get('https://financialmodelingprep.com/api/v3/stock/real-time-price/' + stock);
    return value.data.price;
}



module.exports = router