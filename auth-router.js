const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const queue = require('./queue')
const users = require('./FS-DB/users-service')
const activeUsers = require('./FS-DB/active-users-service')

router.use(express.json())

router.post('/register', async (req, res, next) => {
	try {
		// does user already exist?
		const params = {query: req.body.username, target: 'username'}
		const user = await users.find(params)
		if(!!user) {
			const err = {message: 'User already exists', error: true}
			return res.status(400).json(err)
		}
	// hash password > create token > save to DB
		const newUser = {
			username: req.body.username,
			hash: await getHash(req.body.password),
			created_at: Date(),
			deleted: false,
			deleted_at: null,
			temp: true
		}
		const createdUser = await users.create(newUser)
		createdUser.token = createToken(createdUser)
		await activeUsers.handleLogin(createdUser)
		res.status(200).json(createdUser)
	} catch(err) {
		res.status(500).json({message: err.message, error: true})
	}
})

// defos need async await here, callback hell is upon us
router.post('/login', async (req, res, next) => {
	try {
		// does user exist?
		const params = {query: req.body.username, target: 'username'}
		const user = await users.find(params)
		if(!user) {
			const err = { message: 'User does not exist', error: true }
			return res.status(400).json(err)
		}
		// is the user already logged in?
		const activeUser = await activeUsers.find({query: user.id, target: 'id'})
		if(!!activeUser) {
			return res.status(400).json({message: 'User is already logged in', error: true})
		}
		// did user enter correct password?
		const passwordMatch = await getMatch(req.body.password, user.hash)
		if(!passwordMatch) {
			const err = { message: 'Incorrect password', error: true }
			return res.status(400).json(err)
		}
		
		// update user last_login date&temp
		const nextData = {
			last_login_at: Date(),
			temp: true
		}
		const updatedUser = await users.update(user.id, nextData)
		updatedUser.token = createToken(updatedUser)
		await activeUsers.handleLogin(updatedUser)
		res.status(200).json(updatedUser)
	} catch(err) {
		return res.status(500).json({message: err.message, error: true})
	}
})

router.post('/logout', async (req, res, next) => {
	try {
		if(!req.body.token) return res.status(400).json({message: 'No user token on request body', error: true})
		const token = verifyToken(req.body.token)
		const params = {query: token.id, target: 'id'}
		const user = await activeUsers.find(params)
		if(!user) return res.status(400).json({message: 'User is not logged in', error: true})
		await activeUsers.handleLogout(user)
		res.status(200).json({message: 'logout success'})
	} catch(err) {
		res.status(500).json({message: err.message, error: true})
	}
})

// TOOL-BOX
// used in `/register`
function getHash (password) {
	const SALT_ROUNDS = 1
	return bcrypt.hash(password, SALT_ROUNDS) // should return a promise
}
// used in `/login`
function getMatch (password, hash) {
	return bcrypt.compare(password, hash)
}
// used in `/login` & `/register`
function createToken (user) {
	const payload = {
		id: user.id,
		username: user.username
	}
	const opts = { expiresIn: '1d' }
	return jwt.sign(payload, process.env.AUTH_SECRET, opts)
}
// user in `/logout`
function verifyToken (token) {
	const opts  = { maxAge: '1d' }
	return jwt.verify(token, process.env.AUTH_SECRET, opts)
}

module.exports = router

/* GRAVEYARD

// sql queue
router.get('/refresh-test', (req, res, next) => {
	console.log('hi')
	users.getAll((err, allUsers) => {
		if(err) return console.log('ERROR AT GET ALL', err)
		allUsers.forEach((user, i) => {
			// remove temp key from user before save to DB
			const dbUser = Object.keys(user).reduce((acc, key) => {
				if(key !== 'temp') acc[key] = user[key]
				return acc
			}, {})
			// define job inside of queue.push, make sure it's named for logging
			queue.push(function updateUserAsTemp(cb) {
				// save each user to DB & update them as !temp
				process.env.DB_CONN.transaction(trx => {
					return process.env.DB_CONN('users')
					.insert(dbUser)
					.transacting(trx)
					// wrap this users.update in a transaction to keen DB/FS in sync
					.then(() => users.update(user.id, {temp: false}, (err) => {
						if(err) return trx.rollback(err)
						setTimeout(cb, 1000)
						const isLastUser = (i + 1 === allUsers.length)
						if(isLastUser) {
							res.status(200).json({message: 'all users refreshed'})
						}
					}))
					.then(trx.commit)
					.catch(trx.rollback)
				})
			})

		}) // end forEach
	})
})

*/