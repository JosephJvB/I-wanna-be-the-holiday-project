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
		next()
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
		next()
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
		next()
	} catch(err) {
		res.status(500).json({message: err.message, error: true})
	}
})

// connect last so cleanup runs after other requests (like an after-hook)
router.all('*', async (req, res, next) => {
	try {
		// console.log(req.url)
		const allUsers = await users.getAll()
		const tempUsers = allUsers.filter(user => user.temp)
		if(tempUsers.length > 0) {
			tempUsers.forEach((user, i) => {
				queue.push(async function refreshTempUser(cb) {
					// TODO: wrap this in knex transaction
					// eg: if users.update fails, db rolls back also.
					const userFromDB = await process.env.DB_CONN('users').where({id: user.id}).first()
					if(!!userFromDB) {
						// only pass keys:values to update that need updating
						const updateUser = Object.keys(userFromDB).reduce((u, key) => {
							if(userFromDB[key] !== user[key]) u[key] = user[key]
							return u
						}, {})
						await process.env.DB_CONN('users').update(updateUser)
					} else {
						// dont insert temp property to DB
						const insertUser = Object.keys(user).reduce((u, key) => {
							if(key !== 'temp') u[key] = user[key]
							return u
						}, {})
						await process.env.DB_CONN('users').insert(insertUser)
					}
					await users.update(user.id, {temp: false})
					cb()
				})
			})
		}
	} catch (err) {
		return res.status(500).json({message: err.message, error: true})
	}
})

// TOOL-BOX
// used in `/register`
function getHash (password) {
	const SALT_ROUNDS = 1
	return bcrypt.hash(password, SALT_ROUNDS)
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
