const fs = require('fs')
const path = require('path')

const USERS = path.join(__dirname, 'USERS_TABLE.json')

module.exports = {
	findUserByName: function (username, cb) {
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)
			const json = JSON.parse(data)
			const ids = Object.keys(json.rows)
			const foundUserId = ids.find(id => json.rows[id].username === username)
			// if username is found, return user, else false
			const result = foundUserId ? json.rows[foundUserId] : false
			cb(null, result)
		})
	},
	createUser: function (nextData, cb) {
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)
			const json = JSON.parse(data)
			const ids = Object.keys(json.rows)
			const nextId = (Number(ids[ids.length - 1]) + 1) || 0
			json.rows[nextId] = nextData
			return fs.writeFile(USERS, JSON.stringify(json, null, 2), (err) => {
				if(err) return cb(err)
				cb(null)
			})
		})
	},
	updateUser: function (nextData, cb) {
		// make sure to protect: id & created_at fields. Never update these
		if(!nextData.id) return cb('UPDATE NEEDS ID')
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)

			const json = JSON.parse(data)
			const foundUser = json.rows[nextData.id]
			if(!foundUser) return cb(`@UPDATE: NO USER, ID=${nextData.id} EXISTS`)
			// update Object
		 	json.rows[nextData.id] = Object.assign(foundUser, nextData)

			return fs.writeFile(USERS, json, (err) => {
				if(err) return cb(err)
				cb(null)
			})
		})
	}
}