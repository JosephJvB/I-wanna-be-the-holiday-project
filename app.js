// revisiting auth
// oh create your own .env thing
// maybe add some helmet/cors stuff for security revision stuff?
const path = require('path')
const express = require('express')
const authRouter = require('./auth-router')
const loadConfig = require('./bin/load-config')
// custom .env loader (is synchronous)
loadConfig({
	test: true
})
const app = express()

app.use(express.json())

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
