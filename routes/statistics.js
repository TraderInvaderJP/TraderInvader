const router = require('express').Router();
const dynamoClient = require('../dynamoClient');

/*
    Route: users/:userid/statistics
    Method: GET
    Purpose: This route is used to get a players
        statistics information from the table in the form of a JSON object
    Query parameters:
        userid - the username of the user having their stats returned
    Request body:
        none
*/
router.get('/users/:userid/statistics', (req, res) => {
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
            data: data.Item.Statistics
        })
    })
})

/*
    Route: users/:userid/achievements
    Method: GET
    Purpose: This route is used to get a players
        achievements information from the table in the form of a JSON object
    Query parameters:
        userid - the username of the user having their achievements returned
    Request body:
        none
*/
router.get('/users/:userid/achievements', (req, res) => {
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
            data: data.Item.Achievements
        })
    })
})

module.exports = router