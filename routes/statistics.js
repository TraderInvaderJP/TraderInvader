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
    Route: /statistics/users/:userid/games
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
    Purpose: This route is used to add a 
        game win to a players win streak stat
*/
router.get('/:userid', (req, res) => {})

/*
    Purpose: This route is used to reset 
        a players win streak stat
*/
router.get('/:userid', (req, res) => {})

/*
    Purpose: This route is used to add a 
        game loss to a players loss streak stat
*/
router.get('/:userid', (req, res) => {})

/*
    Purpose: This route is used to reset 
        a players loss streak stat
*/
router.get('/:userid', (req, res) => {})

/*
    Purpose: This route is used to add a 
        win to a players daily challenge wins stat
*/
router.get('/:userid', (req, res) => {})

/* TODO: Add achievement routes to backend: */

module.exports = router