const fs = require('fs')
const path = require('path')

const USERS = path.join(__dirname, 'USERS_TABLE.json')

module.exports = {
	findUserByName: function (username, cb) {
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)
			const json = JSON.parse(data)
			const foundUser = json.rows.find(user => user.username === username)
			cb(null, foundUser)
		})
	},
	createUser: function (nextData, cb) {
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)
			const json = JSON.parse(data)
			json.rows.push(nextData)
			return fs.writeFile(USERS, JSON.stringify(json), (err) => {
				if(err) return cb(err)
				cb(null)
			})
		})
	},
	updateUser: function (nextData, cb) {
		if(!nextData.id) return cb('UPDATE NEEDS ID')
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)

			const json = JSON.parse(data)
			const foundUser = json.rows.find(user => user.id === nextData.id)
			if(!foundUser) return cb(`@UPDATE: NO USER, ID=${nextData.id} EXISTS`)
			// better would be to get indexOf foundUser and just update that!
		 	json.rows = json.rows.map(user => {
		 		if(user.id === foundUser.id) {
	 				return Object.assign(user, nextData)
		 		}
		 		return user
		 	})

		 	// i dunno if writeFile's cb gets called with data
			return fs.writeFile(USERS, json, (err) => {
				if(err) return cb(err)
				cb(null)
			})
		})
	}
}