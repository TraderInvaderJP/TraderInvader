const router = require('express').Router()

/*
    Purpose: This route is used to view a 
        user's statistics
*/
router.get('/:userid', (req, res) => {})

/*
    Purpose: This route is used to view a 
        user's friend's statistics
*/
router.get('/:userid/friends', (req, res) => {})

/*
    Purpose: This route is used to add a 
        game win to a players number of games won stat
*/
router.get('/:userid', (req, res) => {})

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