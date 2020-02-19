const router = require('express').Router()
const dynamoClient = require('../dynamoClient')

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

module.exports = router