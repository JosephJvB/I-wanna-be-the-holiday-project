// const stuff = require('bcrypt')
const express = require('express')
const router = express.Router() // is that how you do this?
const db = require('./db-util')

router.use(express.json())

router.post('/register', (req, res, next) => {
	return db.findUserByName(req.body.username, (err, data) => {
		// on-error
		if(err) {
			console.log('DB_READ_ERROR @ "/register":', err)
			return res.sendStatus(500)
		}
		if(data) { // user already exists
			return res.sendStatus(400)
		}

		// on-success
		const newUser = {
			username: req.body.username,
			// password: bcrypt.hash(req.body.password),
			created_at: Date()
		}
		db.createUser(newUser, (err) => {
			if(err) return console.log('DB_WRITE_ERROR @ "/register":', err)
			res.sendStatus(200)
		})
	})
})

router.post('/login', (req, res, next) => {
	return db.findUserByName(req.body.username, (err, data) => {
		// on-error
		if(err) {
			console.log('DB_READ_ERROR @ "/login":', err)
			return res.sendStatus(500)
		}
		// bcrypt stuff:
		// if(bcrypt.hash(req.body.password) !== data.password) { // incorrect details
		// 	return res.sendStatus(400)
		// }

		// on-success
		return db.updateUser({
			id: data.id,
			last_login_at: Date()
		}, (err) => {
			if(err) return console.log('DB_WRITE_ERROR @ "/login":', err)
			res.sendStatus(200)
		})
	})
})

module.exports = router