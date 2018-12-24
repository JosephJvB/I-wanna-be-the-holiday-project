// revisiting auth
// oh create your own .env thing
// maybe add some helmet/cors stuff for security revision stuff?
const fs = require('fs')
const path = require('path')
const express = require('express')
const authRouter = require('./auth-router')
loadConfig({
	test: true
}) // custom .env loader (is synchronous)
const app = express()

app.use(express.json())

// dev debug route
app.get('/test', (req, res) => {
	if(process.env.TEST) {
		res.sendFile(path.join(__dirname, 'test.html'))
	}
	else res.send('Test mode is OFF')
})

// all auth routing
app.use('/api/v1/auth', authRouter)

app.listen(
	process.env.PORT,
	console.log('serving @', process.env.PORT)
)

// save secrets to process.env
// choose synchronous readfile so app cant start before config loads
function loadConfig ({test}) {
	const data = fs.readFileSync(path.join(__dirname, 'SECRETS.json'))
	// did you know that json.parse can turn a buffer into JSON? that is fancy
	const json = JSON.parse(data)
	// is this dumb?
	process.env = Object.assign({}, process.env, json)
	// is this better?
	// Object.keys(json).forEach(secret => process.env[secret] = json[secret])
	console.log('loaded config vars', Object.keys(json))
	if(!process.env.PORT) {
		process.env.PORT = 3000
	}
	if(test) process.env.TEST = true
	console.log('test:', test ? 'ON @ /test' : 'OFF')
	// return object with keys that we added to env, json from secrets & PORT & test
	return Object.assign(json, {
		PORT: process.env.PORT,
		test,
	})
}