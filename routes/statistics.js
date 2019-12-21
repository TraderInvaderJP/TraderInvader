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

module.exports = router