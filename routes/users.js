const router = require('express').Router()
const uuidv4 = require('uuid/v4')
const AWS = require('aws-sdk')
const cognito = new AWS.CognitoIdentityServiceProvider()

/*
    Purpose: This route is used to create
        a new user
*/
router.post('/', (req, res) => {
    let id = uuidv4()
    console.log(id)
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Password: req.body.password,
        Username: req.body.username,
        UserAttributes: [{
            Name: 'email',
            Value: req.body.email
        },
        {
            Name: 'custom: userid',
            Value: uuidv4()
        }]
    }

    cognito.signUp(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
    })
})

router.put('/:username/verification', (req, res) => {
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        ConfirmationCode: req.body.confirmation_code,
        Username: req.params.username
    }

    cognito.confirmSignUp(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
    })
})

/*
    Purpose: This route is used to update
        a user's username
*/
router.put('/:username/username', (req, res) => {})

/*
    Purpose: This route is used to update
        a user's password
*/
router.put('/:username/password', (req, res) => {})

module.exports = router