const fs = require('fs')
const path = require('path')
const USERS = path.join(__dirname, 'FS-DB/tables/USERS_TABLE.json')

/********
 METHODS
*********
findByName(name) => rows.find(u => u.name === name)
create(user) => rows.push(user);next_id++
update(id, nextInfo) => rows[getIdx(id)] = Object.assign(rows[getIdx(id)], nextInfo)
delete(id) => rows[getIdx(id)].deleted = true & deleted_at = Date()
getAll() => rows
TO ADD
Do I want to have some functionality like feathers where if you pass array it does array stuff
*/

module.exports = {
	find: function (params, cb) {
		const { query, target } = params
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)
			const json = JSON.parse(data)
			const user = json.rows.find(user => user[target] === query)
			cb(null, user)
		})
	},
	create: function (nextData, cb) {
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
	update: function (id, nextData, cb) {
		// make sure to protect: id & created_at fields. Never update these
		if(!id) return cb({message: 'UPDATE NEEDS ID'})
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)

			const json = JSON.parse(data)
			const foundUser = json.rows.find(user => user.id === id)
			if(!foundUser) return cb({message: `@UPDATE: NO USER, ID=${id}`})
			// update user @ rows[index]
			const idx = getIdx(json.rows, {query: id, target: 'id'})
		 	json.rows[idx] = Object.assign(foundUser, nextData)

			return fs.writeFile(USERS, JSON.stringify(json, null, 2), (err) => {
				if(err) return cb(err)
				cb(null, json.rows[idx])
			})
		})
	},
	delete: function (id, cb) {
		// SOFT DELETE
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)

			const json = JSON.parse(data)
			// add deleted @ rows[index]
			const idx = getIdx(json.rows, {query: id, target: 'id'})
			const userToDelete = json.rows[idx]
			if(!userToDelete) return cb({message: `@DELETE: NO USER, ID=${id}`})
			const deletedInfo = {
				deleted: true,
				deleted_at: date()
			}
			json.rows[idx] = Object.assign(userToDelete, deletedInfo)

			return fs.writeFile(USERS, json, (err) => {
				if(err) return cb(err)
				cb(null, id)
			})
		})
	},
	getAll: function (cb) {
		return fs.readFile(USERS, (err, data) => {
			if(err) return cb(err)
			const json = JSON.parse(data)
			cb(null, json.rows)
		})
	},
}

// get array index by match on object property
function getIdx (list, match) {
	const { query, target } = match
	for(let i = 0; i < list.length; i++) {
		if(list[i][target] === query) return i
	}
	return null
}