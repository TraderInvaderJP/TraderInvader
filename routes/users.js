const router = require('express').Router()
const uuidv4 = require('uuid/v4')
const AWS = require('aws-sdk')
const cognito = new AWS.CognitoIdentityServiceProvider()
const dynamoClient = require('../dynamoClient')

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
    let params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Password: req.body.password,
        Username: req.body.username,
        UserAttributes: [{
            Name: 'email',
            Value: req.body.email
        }]
    }
    
    let isErr = false;
    let response = {}

    cognito.signUp(params, (err, data) => {
        if (err) {
            isErr = true;
            res.send({
                success: false,
                message: err.message,
                data: {}
            })
        }
        else {
            response = {
                success: true,
                message: "User Created",
                data: {}
            }

            if(!isErr)
            {
                params = {
                    TableName: 'Experimental',
                    Item: {
                        username: 'user#' + req.body.username,
                        identifier: 'requests',
                        friends: []
                    }
                }
            
                dynamoClient.put(params, (err, data) => {
                    console.log(response)
                    if (err) res.send({
                        success: false,
                        message: err.message,
                        data: {}
                    })
                    else res.send(response)
                })
            }
        }
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
router.get('/', (req, res) => {
    const params = {
        AccessToken: req.query.access_token
    }

    cognito.getUser(params, (err, data) => {
        if (err) {
            res.send({
                success: false,
                message: err.message,
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
    Route: /users/:username/password/request
    Method: PUT
    Purpose:
    Query Parameters:
*/
router.put('/:username/password/request', (req, res) => {
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: req.params.username
    }

    cognito.forgotPassword(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
    })
})

/*
    Route: /users/:username/password/update
    Method: PUT
    Purpose:
    Query Parameters:
    Request Body:
*/
router.put('/:username/password/update', (req, res) => {
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        ConfirmationCode: req.params.confirmation_code,
        Username: req.params.username,
        Password: req.params.new_password
    }

    cognito.confirmForgotPassword(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
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
    Route: /users/:userid/friends/:friendid
    Method: PUT
    Purpose: This route is used to add a user
        to another user's friend list
    Query Parameters: 
        userid - id of the user to send the request 
            to
        friendid - the id of the user sending the 
            request
*/
router.put('/:userid/requests/:friendid', (req, res) => {
    const params = {
        TableName: 'Experimental',
        Key: {
            username: 'user#' + req.params.userid,
            identifier: 'friends'
        },
        UpdateExpression: 'SET friends = list_append(friends, :user)',
        ExpressionAttributeValues: {
            ':user': [{
                name: req.params.friendid,
                confirmed: false
            }]
        },
        ReturnValues: "ALL_NEW"
    }

    dynamoClient.update(params, (err, data) => {
        if (err) res.send(err)
        else res.send(data)
    })
})

/*
    Route: /users/:userid/friend
    Method: GET
    Purpose: This route is used to get all
        friends of a given user
    Query Parameters:
        userid - the user whose friends 
            you're retrieving
*/
router.get('/:userid/confirmed', (req, res) => {
    const params = {
        TableName: 'Experimental',
        KeyConditionExpression: 'username = :user AND identifier = :id',
        ExpressionAttributeValues: {
            ':user': 'user#' + req.params.userid,
            ':id': 'friends'
        }
    }
    
    dynamoClient.query(params, (err, data) => {
        if (err) res.send(err)
        else {
            const { Items } = data
            let name = Items[0].friends.filter(item => item.confirmed === true).map(item => item.name)
            res.send(name)
        }
    })
})

/*
    Route: /users/:userid/friends/requests
    Method: GET
    Purpose: This route is used to get all
        friends requests that a user has
    Query Parameters:
        userid - the user that you want to 
            retrieve requests for
*/
router.get('/:userid/requests', (req, res) => {
    const params = {
        TableName: 'Experimental',
        KeyConditionExpression: 'username = :user AND identifier = :id',
        ExpressionAttributeValues: {
            ':user': 'user#' + req.params.userid,
            ':id': 'friends'
        }
    }
    
    dynamoClient.query(params, (err, data) => {
        if (err) res.send(err)
        else {
            const { Items } = data
            let name = Items[0].friends.filter(item => item.confirmed === false).map(item => item.name)
            res.send(name)
        }
    })
})

/*
    Route: /users/:userid/friends/:friendid
    Method: PUT
    Purpose: This route is used to add a 
        user as a friend and remove the friend
        request from their list.
    Query Parameters:
        userid - the user who you're adding the
            friend to
        friendid - the user who you're adding
            as a friend
*/
router.put('/:userid/friends/:friendid', (req, res) => {
    let params = {
        TableName: 'Experimental',
        Key: {
            username: 'user#' + req.params.userid,
            identifier: 'friends'
        }
    }

    let isErr = false

    dynamoClient.get(params, (err, data) => {
        if(err) {
            isErr = true
            res.send(err)
        }
        else {
            if(!isErr) {
                const { Item } = data
            
                Item.friends = Item.friends.map(item => {
                    if(item.name === req.params.friendid)
                        item.confirmed = true;
                    
                    return item
                })

                params = {
                    TableName: 'Experimental',
                    Item: {
                        ...Item
                    }
                }

                dynamoClient.put(params, (err, data) => {
                    if (err) res.send()
                    else res.send(data)
                })
            }
        }
    })
})

module.exports = router