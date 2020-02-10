const router = require('express').Router()
const uuidv4 = require('uuid/v4')
const AWS = require('aws-sdk')
const cognito = new AWS.CognitoIdentityServiceProvider()

/*
    Route: /users
    Method: POST
    Purpose: This route is used to create
        a new user
    Request Body: 
        password - user's password
        username - user's username
        email - user's email
*/
router.post('/', (req, res) => {
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Password: req.body.password,
        Username: req.body.username,
        UserAttributes: [{
            Name: 'email',
            Value: req.body.email
        }]
    }
    
    cognito.signUp(params, (err, data) => {
        if (err) {
            res.send({
                success: false,
                message: err.message,
                data: {}
            })
        }
        else res.send({
            success: true,
            message: "User Created",
            data: {}
        })
    })
})

/*
    Route: /users/:username/verification
    Method: PUT
    Purpose: This route is used to verify a new
        user's email.
    Query Parameters: 
        username - String
    Request Body: 
        confirmation_code - the confirmation code
            sent to the user's email address
*/
router.put('/:username/verification', (req, res) => {
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        ConfirmationCode: req.body.confirmation_code,
        Username: req.params.username
    }

    cognito.confirmSignUp(params, (err, data) => {
        if (err) {
            res.send({
                success: false,
                message: '',
                data: {}
            })
        }
        else res.send({
            success: true,
            message: "User Verified",
            data: {}
        })
    })
})

/*
    Route: /users/token
    Method: POST
    Purpose: This route is used to log in the
        user and retrieve a new access token.
    Request Body: 
        username - user's username
        password - user's password
    Response: 
        access_token - token for getting user information
        refresh_token - token for updating the access token
*/
router.post('/token', (req, res) => {
    const params = {
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
            'USERNAME': req.body.username,
            'PASSWORD': req.body.password
        }
    }

    cognito.initiateAuth(params, (err, data) => {
        if (err) {
            res.send({
                success: false,
                message: err.message,
                data: {}
            })
        }
        else {
            const { AuthenticationResult } = data
            res.send({
                success: true,
                message: "Access Token Generated",
                data: {
                    access_token: AuthenticationResult.AccessToken, 
                    refresh_token: AuthenticationResult.RefreshToken
                }
            })
        }
    })
})

/*
    Route: /users/token
    Method: PUT
    Purpose: This route is used to update your
        access token
    Request Body: 
        refresh_token - refresh token returned 
            from auth flow
    Response: 
        access_token - new access token for getting
            user information
*/
router.put('/token', (req, res) => {
    const params = {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: process.env.COGNITO_CLIENT_ID,
        AuthParameters: {
            'REFRESH_TOKEN': req.body.refresh_token
        }
    }
    
    cognito.initiateAuth(params, (err, data) => {
        const { AuthenticationResult } = data
        if (err) {
            res.send({
                success: false,
                message: data.message,
                data: {}
            })
        }
        else res.send({
            success: true,
            message: 'Access Token Updated',
            data: { access_token: AuthenticationResult.AccessToken }
        })
    })
})

/*
    Route: /users/:username
    Method: GET
    Purpose: This route is used to get the 
        information about the user.
    Query Parameters:
        username - user's username
    Request Body: 
        token - access token returned from 
            auth flow
    Response: 
        "Username" - user's username
        "UserAttributes" - attributes like the email
            and email verification status
*/
router.get('/:username', (req, res) => {
    const params = {
        AccessToken: req.body.access_token
    }

    cognito.getUser(params, (err, data) => {
        if (err) {
            res.send({
                success: false,
                message: data.message,
                data: {}
            })
        }
        else res.send({
            success: true,
            message: 'User Info Retrieved',
            data: data
        })
    })
})

/*
    Route: /users/:username/password
    Method: PUT
    Purpose: This route is used to update
        a user's password
    Query Parameters:
        username - user's username
    Request Body: 
        access_token - the access token returned 
            from the auth flow
        previous password - user's previous password
        proposed password - user's new password
*/
router.put('/:username/password', (req, res) => {
    const params = {
        AccessToken: req.body.access_token,
        PreviousPassword: req.body.previous_password,
        ProposedPassword: req.body.proposed_password
    }

    cognito.changePassword(params, (err, data) => {
        if (err) res.send({
            success: false,
            message: data.message,
            data: {}
        })
        else res.send({
            success: true,
            message: 'Password Updated',
            data
        })
    })
})

/*
    Purpose: This route is used to add a user
        to another user's friend list
*/
router.put('/:userid/friends/:friendid', (req, res) => {
    const params = {
        TableName: 'Requests',
        Item: {
            username: req.params.userid,
            friendname: req.params.friendid
        },
        ReturnValues: "ALL_NEW"
    }

    dynamoClient.put(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
    })
})

router.get('/:userid/friends/', (req, res) => {
    const params = {
        TableName: 'Friends',
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': req.params.userid
        },
        ProjectionExpression: 'friendname'
    }

    dynamoClient.query(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
    })
})

router.get('/:userid/friends/requests', (req, res) => {
    const params = {
        TableName: 'Requests',
        IndexName: 'username-index',
        KeyConditionExpression: 'username = :username',
        ExpressionAttributeValues: {
            ':username': req.params.userid
        },
        ProjectionExpression: 'friendname'
    }

    dynamoClient.query(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
    })
})

router.put('/:userid/friends/:friendid', (req, res) => {
    const requestsParams = {
        TableName: 'Requests',
    }

    dynamoClient.delete(requestsParams, (err, data) => {

    })

    const friendsParams = {
        TableName: 'Friends',
    }

    dynamoClient.put(friendsParams, (err, data) => {

    })
})

module.exports = router