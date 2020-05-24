// Set global process.env with values in .env file.
require('dotenv').config()

const request = require('request')
const express = require('express')
const app = express()

let state = 'a random string'

app.get('/login', function (req, res) {
  state = getRandomString()
  // Send user to go authorize our application's requested scopes.
  res.redirect(
    `${process.env.OAUTH2_SERVER_URL}/auth/code?`
    + 'response_type=code'
    + `&client_id=${process.env.CLIENT_ID}`
    + `&client_secret=${process.env.CLIENT_SECRET}`
    + `&redirect_uri=${process.env.APP_URL}/auth`
    + '&scope=photo+offline_access'
    + `&state=${state}`
  )
})

app.get('/auth', function (req, res) {
  // Check that returned state is same as before oauth flow began.
  if (state !== req.query.state) {
    res.status(400).send('Receieved state not equal to before OAuth2 flow.')
    return
  }

  // Exchange code for token.
  request.post(
    `${process.env.OAUTH2_SERVER_URL}/auth/token?`
    + 'grant_type=authorization_code'
    + `&client_id=${process.env.CLIENT_ID}`
    + `&client_secret=${process.env.CLIENT_SECRET}`
    + `&redirect_uri=${process.env.APP_URL}/auth`
    + `&code=${req.query.code}`,
    function (error, response, body) {
      if (error) {
        res.status(500).send(`Error: ${error}`)
        return
      }
      res.send('We got your token! We are keeping it safe server side!')

      // We would get the code here.
      const jsonResBody = JSON.parse(body)
      const token = jsonResBody.token

      /*
       * Depending on the oauth2 authorisation server, you may also get a
       * refresh token. You can securely store this token and eventually
       * use it to quickly retrieve a new token after the first token expires.
       */
      const refreshToken = jsonResBody.refreshToken
    }
  )
})
