const router = require('express').Router()
const dynamoClient = require('../dynamoClient')

// /*
//     Purpose: This route is used to view a 
//         user's statistics
// */
// router.get('/:userid', (req, res) => {})

// /*
//     Purpose: This route is used to view a 
//         user's friend's statistics
// */
// router.get('/:userid/friends', (req, res) => {})

/*
    Purpose: This route is used to add a 
        game win to a players number of games won stat
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
            //res.send(data)
            const obj = JSON.parse(data.Item.Statistics)
            console.log(obj.numberOfWins)
            const count = Number(obj.numberOfWins)
            console.log(count)
            const params2 = {
                TableName: 'PlayerStats',
                Key: {
                    username: req.params.userid
                },
                UpdateExpression: 'SET Statistics.numberOfWins = :numberOfWins + 1',
                ExpressionAttributeNames: {
                    ":numberOfWins":count + 1
                },
                ExpressionAttributeValues: {
                    
                },
                ReturnValues: 'ALL_NEW'
            }
        
            dynamoClient.update(params2, (err, data) => {
                if(err) res.send(err)
                else res.send(data)
            })
        }
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
// router.put('/:gameid/portfolios/:userid/buy', (req, res) => {
//     const params = {
//         TableName: 'Portfolio',
//         Key: {
//             username: req.params.userid,
//             gameid: req.params.gameid
//         },
//         UpdateExpression: 'SET stocks.#symbol = :i, wallet = wallet - :i * :j',
//         ExpressionAttributeNames: {
//             "#symbol": req.body.symbol
//         },
//         ExpressionAttributeValues: {
//             ':i': req.body.count,
//             ':j': req.body.value
//         },
//         ReturnValues: 'ALL_NEW'
//     }

//     dynamoClient.update(params, (err, data) => {
//         if(err) res.send(err)
//         else res.send(data)
//     })
// })

/*
    Purpose: This route is used to add a 
        game loss to a players number of games lost stats
*/
router.get('/:userid', (req, res) => {})

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