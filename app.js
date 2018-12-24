// revisiting auth
// oh create your own .env thing
// maybe add some helmet/cors stuff for security revision stuff?
const fs = require('fs')
const path = require('path')
const express = require('express')
const authRouter = require('./auth-router')
loadConfig() // custom .env loader
const app = express()

app.use(express.json())

// app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'test.html')))

app.use('/api/v1/auth', authRouter)

app.listen(
	process.env.PORT,
	console.log('serving @', process.env.PORT)
)

// save secrets to process.env
// choose synchronous readfile so app cant start before config loads
function loadConfig () {
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
	return null
}