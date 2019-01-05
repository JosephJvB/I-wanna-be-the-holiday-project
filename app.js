// revisiting auth
// maybe add some helmet/cors stuff for security revision stuff?
const express = require('express')
const helmet = require('helmet')
const speedCap = require('express-slow-down')({
	// if more than 50req in 5 mins, delay next requests by 1000ms
	windowMs: 5 * 60 * 1000, // 5 minutes
	delayAfter: 50,
	delayMs: 1000
})
const path = require('path')
const authRouter = require('./auth-router')
const loadConfig = require('./bin/load-config')
// custom .env loader (is synchronous)
loadConfig({
	test: true
})
const app = express()

// packaged middleware
app.use(helmet())
// npm express-slow-down docs: "only if you're behind a reverse proxy (Heroku, Bluemix, AWS if you use an ELB, custom Nginx setup, etc)""
app.enable('trust proxy')
app.use('/api/', speedCap) // apply speedcap to all API routes
app.use(express.json())

// custom middleware
// dev debug route
app.get('/test', (req, res) => {
	if(process.env.TEST) {
		res.sendFile(path.join(__dirname, 'test.html'))
	}
	else res.send('Test mode is OFF')
})

// /login & /register
app.use('/api/v1/auth', authRouter)

app.listen(
	process.env.PORT,
	console.log('serving @', process.env.PORT)
)
