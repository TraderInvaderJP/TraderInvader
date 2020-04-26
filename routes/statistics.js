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
router.get('/:userid/statistics', async (req, res) => {
    try {
        const params = {
            TableName: 'PlayerStats',
            Key: {
                username: req.params.userid
            }
        }

        const { Item } = await dynamoClient.get(params).promise()

        res.send({
            success: true,
            message: 'Statistics retrieved',
            data: Item.Statistics
        })
    }
    catch(err) {
        res.send({
            success: false,
            message: err.message,
            data: {}
        })
    }
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
router.get('/:userid/achievements', async (req, res) => {
    try {
        const params = {
            TableName: 'PlayerStats',
            Key: {
                username: req.params.userid
            }
        }

        const { Item } = await dynamoClient.get(params).promise()

        res.send({
            success: true,
            message: 'Achievements retrieved',
            data: Item.Achievements
        })
    }
    catch(err) {
        res.send({
            success: false,
            message: err.message,
            data: {}
        })
    }
})

module.exports = router