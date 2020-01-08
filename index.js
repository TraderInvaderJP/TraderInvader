const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

const app = express()

dotenv.config()

let AWS = require("aws-sdk")
/*add your accessKey and secrectAccessKey, please don't go crazy adding stuff to dynamoDB, don't want to get charged*/
let awsConfig = {
    "region": "us-west-2",
    "endpoint": "http://dynamodb.us-west-2.amazonaws.com",
    "accessKeyId": process.env.AWS_ACCESS_KEY, "secretAccessKey": process.env.AWS_SECRET_ACCESS_KEY
}

/* this populates the dynamoDB table with user info */
AWS.config.update(awsConfig);
let docClient = new AWS.DynamoDB.DocumentClient();
let addUser = function () {
    //the real user info would go here
    let input = {
        "username": "usernametest", "password": "1234567898", "email": "testme@gmail.com", "firstname": "Bill", "lastname": "Nye"
    }
    let params = {
        TableName: "userInfo",
        Item:  input
    }
    docClient.put(params, function (err, data) {
        if (err) {
            console.log("users::addUser::error - " + JSON.stringify(err, null, 2));                      
        } else {
            console.log("users::addUser::success" );                      
        }
    })
}
//commented this out so I dont keep adding stuff to dynamoDB
//addUser();

//Import routes
const stockRoutes = require('./routes/stocks')
const userRoutes = require('./routes/users')
const statisticRoutes = require('./routes/statistics')
const gameRoutes = require('./routes/games')

app.use(cors())
app.use(express.json())

app.use('/stocks', stockRoutes)
app.use('/users', userRoutes)
app.use('/statistics', statisticRoutes)
app.use('/games', gameRoutes)

module.exports = app
