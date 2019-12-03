const AWS = require('aws-sdk')

AWS.config.update({ region: 'us-west-2' })

module.exports = new AWS.DynamoDB.DocumentClient()