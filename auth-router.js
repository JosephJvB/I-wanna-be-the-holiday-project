const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const users = require('./users-db-service')

// TODO: full async/await refactor to avoid callback-hell and sync-city
// . users-service to use util.promisify() fs methods
// . use async for bcrypt and jwt

router.use(express.json())

router.post('/register', (req, res, next) => {
	const params = {query: req.body.username, target: 'username'}
	return users.find(params, (err, user) => {
		// on-error
		if(err) {
			console.log('DB_READ_ERROR @ "/register":', err)
			return res.status(500).json({message: err.message})
		}
		if(!!user) {
			return res.status(400).json({message: 'User already exists'})
		}

		// hash password > create token > save to DB
		const newUser = {
			username: req.body.username,
			hash: getHash(req.body.password),
			created_at: Date()
		}
		
		return users.create(newUser, (err, createdUser) => {
			if(err) return res.status(500).json({message: err.message})
			// give web access
			const token = getToken(createdUser)
			return res.status(200).json({token})
		})
	})
})

router.post('/login', (req, res, next) => {
	// does user exist
	const params = {query: req.body.username, target: 'username'}
	return users.find(params, (err, user) => {
		if(err) {
			console.log('DB_READ_ERROR @ "/login":', err)
			return res.status(500).json({message: err.message})
		}
		if(!user) {
			return res.status(400).json({message: 'User does not exist'})
		}
		// did user enter correct password
		const passwordMatch = getMatch(req.body.password, user.hash)
		if(!passwordMatch) {
			return res.status(400).send({message: 'Incorrect password'})
		}
		
		// update user last_login date
		users.update(user.id, {last_login_at: Date()}, (err, updatedUser) => {
			if(err) return console.log('DB_WRITE_ERROR @ "/login":', err)
			// give user web access
			const token = getToken(updatedUser)
			res.status(200).json({token})
		})
	})
})

// TOOL-BOX
// . bcrypt(hash&match)
function getHash (password) {
	const SALT_ROUNDS = 1
	return bcrypt.hashSync(password, SALT_ROUNDS)
}
function getMatch (password, hash) {
	return bcrypt.compareSync(password, hash)
}
// . jsonwebtoken(sign)
function getToken (user) {
	const payload = {
		id: user.id,
		username: user.username
	}
	const opts = { expiresIn: '1d' }
	return jwt.sign(payload, process.env.AUTH_SECRET, opts)
}




module.exports = router