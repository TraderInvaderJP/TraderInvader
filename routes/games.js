const router = require('express').Router()

/*
    Purpose: This route is used to get all games
        for a specific user
*/
router.get('/:userid', (req, res) => {})

/*
    Purpose: This route is used to get the portfolio
        for a specifiic user in a specific game
*/
router.get('/:gameid/portfolios/:userid', (req, res) => {})

/*
    Purpose: This route is used to get the portfolio
        values for all players in a specific game
*/
router.get('/:gameid/portfolios/:userid/players', (req, res) => {})

/*
    Purpose: This route is used to create a new
        game
*/
router.post('/', (req, res) => {})

/*
    Purpose: This route is used to add a user 
        to a game
*/
router.put('/:gameid/users/:userid', (req, res) => {})

/*
    Purpose: This route is used to buy a stock for a 
        specific user's portfolio in a specific game
*/
router.put('/:gameid/portfolios/:userid/buy', (req, res) => {})

/*
    Purpose: This route is used to sell a stock from 
        a specific user's portfolio in a specific game
*/
router.put('/:gameid/portfolios/:userid/sell', (req, res) => {})

module.exports = router