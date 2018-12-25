const fs = require('fs')
const path = require('path')

/*********
	SCHEMA:
**********
{
  meta: [
    {username: "string"},
    {password: "string"},
    {last_login_at: "date"},
		{created_at: "date"},
		{deleted: "boolean"},
    {deleted_at: "date"}
  ],
	// rows=user objects keyed by Id
  rows: {
		[id]"0": [userInfo]{
			"username",
			"password",
			"last_login_at",
			"last_login_at"
			"deleted"
			"deleted_at"
		}
	},
	// so there is a perminant count for userId even after users are deleted
	// ...even tho I dont have hard delete functionality
	next_user_id: 0
}
*********
METHODS
*********
find(id) => Object.keys(rows).find(id => rows[id])
create(user) => rows[nextId] = user
update(user) => rows[user.id] = Object.assign(rows[user.id], user)
delete(id) => rows[id].deleted = true
TO ADD
Do I want to have some functionality like feathers where if you pass array it does array stuff
*/

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
			// add user and iterate id
			json.rows[json.next_user_id] = nextData
			json.next_user_id = Number(json.next_user_id) + 1

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
			if(!foundUser) return cb(`@UPDATE: NO USER, ID=${nextData.id}`)
			// update Object
		 	json.rows[nextData.id] = Object.assign(foundUser, nextData)

			return fs.writeFile(USERS, json, (err) => {
				if(err) return cb(err)
				cb(null)
			})
		})
	},
	deleteUser: function (id, cb) {
		// SOFT DELETE
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)

			const json = JSON.parse(data)
			const userToDelete = json.rows[id]
			if(!userToDelete) return cb(`@DELETE: NO USER, ID=${id}`)
			const deleteInfo = {
				deleted: true,
				deleted_at: date()
			}

			json.rows[id] = Object.assign(userToDelete, deleteInfo)

			return fs.writeFile(USERS, json, (err) => {
				if(err) return cb(err)
				cb(null)
			})
		})
	}
}