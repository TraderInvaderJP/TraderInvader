const app = require('./index')
const AWS = require('aws-sdk')

AWS.config.credentials = new AWS.SharedIniFileCredentials()

app.listen(8080, () => console.log('Server Started'))