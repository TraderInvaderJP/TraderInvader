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
router.post('/', async (req, res) => {
    try {
        let params = {
            ClientId: process.env.COGNITO_CLIENT_ID,
            Password: req.body.password,
            Username: req.body.username,
            UserAttributes: [{
                Name: 'email',
                Value: req.body.email
            }]
        }

        await cognito.signUp(params).promise()

        params = {
            TableName: 'Experimental',
            Item: {
                username: 'user#' + req.body.username,
                identifier: 'requests',
                friends: []
            }
        }

        await dynamoClient.put(params).promise()

        params = {
            TableName: 'Experimental',
            Item: {
                username: 'user#' + req.body.username,
                identifier: 'invites',
                games: []
            }
        }

        await dynamoClient.put(params).promise()

        params = {
            TableName: 'PlayerStats',
            Item: {
                username: req.body.username,
                Achievements: {},
                Statistics: {
                    numberOfWins: 0,
                    numberOfLosses: 0,
                    currentWinStreak: 0,
                    currentLossStreak: 0
                }
            }
        }

        await dynamoClient.put(params).promise()

        res.send({
            success: true,
            msg: 'User Created',
            data: {}
        })
    }
    catch (err) {
        res.send({
            success: false,
            msg: err.message,
            data: {}
        })
    }
})

/*
    Route: /users/list
    Method: GET
    Purpose: This route returns a list
        of usernames that begin with the given
        username segment
    Query Parameters:
        segment - the beginning of a username
        limit - the number of users to retrieve
*/
router.get('/list', async (req, res) => {
    try {
        let segment = req.query.segment || ''
        let limit = req.query.limit

        const params = {
            UserPoolId: process.env.COGNITO_POOL_ID,
            Limit: limit || 10,
            Filter: `username ^= \"${segment}\"`
        }

        let { Users } = await cognito.listUsers(params).promise()

        Users = Users.filter(user => user.UserStatus === 'CONFIRMED').map(user => user.Username)

        res.send({
            success: true,
            message: 'Usernames retrieved',
            data: Users
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
router.put('/token', async (req, res) => {
    try {
        const params = {
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                'REFRESH_TOKEN': req.body.refresh_token
            }
        }
        
        const { AuthenticationResult } = await cognito.initiateAuth(params).promise()

        res.send({
            success: true,
            message: 'Access Token Updated',
            data: { access_token: AuthenticationResult.AccessToken }
        })
    }
    catch (err) {
        res.send({
            success: false,
            msg: err.message,
            data: {}
        })
    }
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
    Purpose: This route takes the username of
        the user that is updating their password
        and sends an email to their registered email
        containing a verification code that allows
        them to set a new password.
    Query Parameters:
        username - username of the user updating
            the password
*/
router.put('/:username/password/request', (req, res) => {
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: req.params.username
    }

    cognito.forgotPassword(params, (err, data) => {
        if (err) res.send({
            success: false,
            msg: err.message,
            data: {}
        })
        else res.send({
            success: true,
            msg: 'Sent Password Request',
            data
        })
    })
})

/*
    Route: /users/:username/password/update
    Method: PUT
    Purpose: This route is used to update
        a users password given their 
        confirmation code.
    Query Parameters:
        username - username of the user
            updating their password
    Request Body:
        confirmation_code - code sent in the
            email to the user
        new_password - the new password that user
            user is setting
*/
router.put('/:username/password/update', (req, res) => {
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        ConfirmationCode: req.body.confirmation_code,
        Username: req.params.username,
        Password: req.body.new_password
    }

    cognito.confirmForgotPassword(params, (err, data) => {
        if (err) res.send({
            success: false,
            msg: err.message,
            data: {}
        })
        else res.send({
            success: true,
            msg: 'Password Updated',
            data
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
            identifier: 'requests'
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
    Route: /users/:userid/confirmed
    Method: GET
    Purpose: This route is used to get all
        confirmed friends of a given user
    Query Parameters:
        userid - the user whose friends 
            you're retrieving
*/
router.get('/:userid/confirmed', async (req, res) => {
    try {
        const params = {
            TableName: 'Experimental',
            KeyConditionExpression: 'username = :user AND identifier = :id',
            ExpressionAttributeValues: {
                ':user': 'user#' + req.params.userid,
                ':id': 'requests'
            }
        }

        const { Items } = await dynamoClient.query(params).promise()

        let names = Items[0].friends.filter(item => item.confirmed === true).map(item => item.name)

        res.send({
            success: true,
            message: 'Retrieved friends',
            data: names
        })
    }
    catch (err)
    {
        res.send({
            success: false,
            message: 'Failed to retrieve friends',
            data: err
        })
    }
})

/*
    Route: /users/:userid/requests
    Method: GET
    Purpose: This route is used to get all
        friends requests that a user has
    Query Parameters:
        userid - the user that you want to 
            retrieve requests for
*/
router.get('/:userid/requests', async (req, res) => {
    try {
        const params = {
            TableName: 'Experimental',
            KeyConditionExpression: 'username = :user AND identifier = :id',
            ExpressionAttributeValues: {
                ':user': 'user#' + req.params.userid,
                ':id': 'requests'
            }
        }

        const { Items } = await dynamoClient.query(params).promise()

        let names = Items[0].friends.filter(item => item.confirmed === false).map(item => item.name)
        res.send({
            success: true,
            message: 'Retrieved requests',
            data: names
        })
    } 
    catch(err) {
        res.send({
            success: false,
            message: 'Failed to retrieve requests',
            data: err
        })
    }
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
router.put('/:userid/friends/:friendid', async (req, res) => {
    try {
        let params = {
            TableName: 'Experimental',
            Key: {
                username: 'user#' + req.params.userid,
                identifier: 'requests'
            }
        }

        let data = await dynamoClient.get(params).promise()

        data = data.Item

        data.friends = data.friends.map(item => {
            if (item.name == req.params.friendid)
                item.confirmed = true
            
            return item
        })

        params = {
            TableName: 'Experimental',
            Item: {
                ...data
            }
        }

        data = await dynamoClient.put(params).promise()

        res.send({
            success: true,
            message: 'Friend confirmed',
            data
        })
    }
    catch(err)
    {
        res.send({
            success: false,
            message: 'Error confirming user',
            data: {}
        })
    }
})

/*
    Route: /users/:userid/invites/:gameid
    Method: POST
    Purpose: This route is used to invite a 
        user to a given game
    Request Parameters: 
        userid - userid of the user you're 
            sending the invite to
        gameid - the game you're sending the 
            invite for
*/
router.post('/:userid/invites/:gameid', async (req, res) => {
    try {
        
    }
    catch (err) {
        res.send({
            success: false,
            message: err.message,
            data: {}
        })
    }
})

/*
    Route: /users/:userid/requests/:friendid
    Method: DELETE
    Purpose: This route is used to remove a 
        friend requests from a user's friend
        request list
    Request Parameters: 
        userid - userid of the user you're 
            removing a request for
        friendid - the name of the request
            to be removed
*/
router.delete('/:userid/requests/:friendid', async (req, res) => {
    try {
        let params = {
            TableName: 'Experimental',
            Key: {
                username: 'user#' + req.params.userid,
                identifier: 'requests'
            }
        }

        const { Item } = await dynamoClient.get(params).promise()

        Item.friends = Item.friends.filter(item => item.name != req.params.friendid)

        params = {
            TableName: 'Experimental',
            Item
        }

        await dynamoClient.put(params).promise()

        res.send({
            success: true,
            message: 'Friend request deleted',
            data: Item
        })
    }
    catch (err) {
        res.send({
            success: false,
            message: err.message,
            data: {}
        })
    }
})

module.exports = router