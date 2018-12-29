const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const users = require('./users-fs-service')
const queue = require('./queue')

// TODO: full async/await refactor to avoid callback-hell and sync-city
// . users-service to use util.promisify() fs methods
// . use async for bcrypt and jwt
// by the way what the heck do I even do with tokens lol

router.use(express.json())

// move this asap.
router.get('/refresh-test', (req, res, next) => {
	users.getAll((err, allUsers) => {
		if(err) return console.log('ERROR AT GET ALL', err)
		allUsers.forEach(user => {
			// remove temp key from user before save to DB
			const dbUser = Object.keys(user).reduce((acc, key) => {
				if(key !== 'temp') acc[key] = user[key]
				return acc
			}, {})
			// define job inside of queue.push, make sure it's named for logging
			queue.push(function updateUserAsTemp(cb) {
				// save each user to DB & update them as !temp
				process.env.DB_CONN('users')
				.insert(dbUser)
				// wrap this users.update in a transaction to keen DB/FS in sync
				.then(() => users.update(user.id, {temp: false}, (err) => {
					if(err) return console.log('error at write!', err)
					res.status(200).json({message: 'all users refreshed'})
					setTimeout(cb, 1000)
				}))
			})

		}) // end forEach
	})
})

router.post('/register', (req, res, next) => {
	// does user already exist?
	const params = {query: req.body.username, target: 'username'}
	return users.find(params, (err, user) => {
		if(err) {
			console.log('DB_READ_ERROR @ "/register":', err)
			return res.status(500).json({message: err.message, error: true})
		}
		if(!!user) {
			const err = {message: 'User already exists', error: true}
			return res.status(400).json(err)
		}

		// hash password > create token > save to DB
		const newUser = {
			username: req.body.username,
			hash: getHash(req.body.password),
			created_at: Date(),
			deleted: false,
			deleted_at: null,
			temp: true
		}
		
		return users.create(newUser, (err, createdUser) => {
			if(err) return res.status(500).json({message: err.message, error: true})
			// give web access
			const token = getToken(createdUser)
			return res.status(200).json({token})
		})
	})
})

router.post('/login', (req, res, next) => {
	// does user exist?
	const params = {query: req.body.username, target: 'username'}
	return users.find(params, (err, user) => {
		if(err) {
			console.log('DB_READ_ERROR @ "/login":', err)
			return res.status(500).json({message: err.message, error: true})
		}
		if(!user) {
			const err = { message: 'User does not exist', error: true }
			return res.status(400).json(err)
		}
		// did user enter correct password?
		const passwordMatch = getMatch(req.body.password, user.hash)
		if(!passwordMatch) {
			const err = { message: 'Incorrect password', error: true }
			return res.status(400).json(err)
		}
		
		// update user last_login date&temp
		const nextData = {
			last_login_at: Date(),
			temp: true
		}
		users.update(user.id, nextData, (err, updatedUser) => {
			if(err) return console.log('DB_WRITE_ERROR @ "/login":', err)
			// give user web access
			const token = getToken(updatedUser)
			res.status(200).json({token})
		})
	})
})

// TOOL-BOX
// . bcrypt(hash&match)
function getHash (password) { // used in `/register`
	const SALT_ROUNDS = 1
	return bcrypt.hashSync(password, SALT_ROUNDS)
}
function getMatch (password, hash) { // used in `/login`
	return bcrypt.compareSync(password, hash)
}
// . jsonwebtoken(sign)
function getToken (user) { // used in `/login` & `/register`
	const payload = {
		id: user.id,
		username: user.username
	}
	const opts = { expiresIn: '1d' }
	return jwt.sign(payload, process.env.AUTH_SECRET, opts)
}




module.exports = router