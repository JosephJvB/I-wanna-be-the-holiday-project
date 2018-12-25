const fs = require('fs')
const path = require('path')

/*********
	SCHEMA:
**********
{
  meta: [
    {username: "string"},
    {hash: "string"},
    {last_login_at: "date"},
		{created_at: "date"},
		{deleted: "boolean"},
    {deleted_at: "date"}
  ],
  rows: [
			{
				"id",
				"username",
				"hash",
				"last_login_at",
				"last_login_at"
				"deleted"
				"deleted_at"
			}
		]
	},
	// so there is a perminant count for userId even after users are deleted
	// ...even tho I dont have hard delete functionality
	next_user_id: 0
}
*********
 METHODS
*********
findByName(name) => rows[getIdx(name)]
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
			const user = json.rows.find(user => user.username === username)
			cb(null, user)
		})
	},
	createUser: function (nextData, cb) {
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)
			const json = JSON.parse(data)
			// add id to user > add user to rows > iterate id
			nextData.id = json.next_user_id
			json.rows.push(nextData)
			json.next_user_id++

			return fs.writeFile(USERS, JSON.stringify(json, null, 2), (err) => {
				if(err) return cb(err)
				// return created user
				cb(null, nextData)
			})
		})
	},
	updateUser: function (id, nextData, cb) {
		// make sure to protect: id & created_at fields. Never update these
		if(!id) return cb({message: 'UPDATE NEEDS ID'})
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)

			const json = JSON.parse(data)
			const foundUser = json.rows.find(user => user.id === id)
			if(!foundUser) return cb({message: `@UPDATE: NO USER, ID=${id}`})
			// update user @ rows[index]
			const idx = getIdx(json.rows, {input: id, target: 'id'})
		 	json.rows[idx] = Object.assign(foundUser, nextData)

			return fs.writeFile(USERS, JSON.stringify(json, null, 2), (err) => {
				if(err) return cb(err)
				cb(null, json.rows[idx])
			})
		})
	},
	deleteUser: function (id, cb) {
		// SOFT DELETE
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)

			const json = JSON.parse(data)
			// add deleted @ rows[index]
			const idx = getIdx(json.rows, {input: id, target: 'id'})
			const userToDelete = json.rows[idx]
			if(!userToDelete) return cb({message: `@DELETE: NO USER, ID=${id}`})
			const deleteInfo = {
				deleted: true,
				deleted_at: date()
			}
			json.rows[idx] = Object.assign(userToDelete, deleteInfo)

			return fs.writeFile(USERS, json, (err) => {
				if(err) return cb(err)
				cb(null, id)
			})
		})
	},
	getAllUsers: function (cb) {
		return fs.readFile(USERS, (err, users) => {
			if(err) return cb(err)
			cb(null, users)
		})
	}
}

function getIdx (list, match) {
	const { input, target } = match
	for(let i = 0; i < list.length; i++) {
		if(list[i][target] === input) return i
	}
	return null
}