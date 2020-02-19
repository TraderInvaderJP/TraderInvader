const app = require('./index')
const AWS = require('aws-sdk')

const PORT = 8080

AWS.config.credentials = new AWS.SharedIniFileCredentials()

app.listen(PORT, () => console.log('Server Started on port ' + PORT))