const fs = require('fs')
const path = require('path')
const util = require('util')
const asyncReadFile = util.promisify(fs.readFile)
const asyncWriteFile = util.promisify(fs.writeFile)
const USERS = path.join(__dirname, 'tables/USERS_TABLE.json')

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

// module.exports = {
// 	find: function (params, cb) {
// 		const { query, target } = params
// 		return fs.readFile(USERS, (err, data) => {
// 			if(err) return cb(err)
// 			const json = JSON.parse(data)
// 			const user = json.rows.find(user => user[target] === query)
// 			cb(null, user)
// 		})
// 	},
// 	create: function (nextData, cb) {
// 		return fs.readFile(USERS, (err, data) => {
// 			if(err) return cb(err)
// 			const json = JSON.parse(data)
// 			// add id to user > add user to rows > iterate id
// 			nextData.id = json.next_user_id
// 			json.rows.push(nextData)
// 			json.next_user_id++

// 			return fs.writeFile(USERS, JSON.stringify(json, null, 2), (err) => {
// 				if(err) return cb(err)
// 				// return created user
// 				cb(null, nextData)
// 			})
// 		})
// 	},
// 	update: function (id, nextData, cb) {
// 		// make sure to protect: id & created_at fields. Never update these
// 		if(!id) return cb({message: 'UPDATE NEEDS ID'})
// 		return fs.readFile(USERS, (err, data) => {
// 			if(err) return cb(err)

// 			const json = JSON.parse(data)
// 			const foundUser = json.rows.find(user => user.id === id)
// 			if(!foundUser) return cb({message: `Could not find user id=${id}`})
// 			// update user @ rows[index]
// 			const idx = getIdx(json.rows, {query: id, target: 'id'})
// 		 	json.rows[idx] = Object.assign(foundUser, nextData)

// 			return fs.writeFile(USERS, JSON.stringify(json, null, 2), (err) => {
// 				if(err) return cb(err)
// 				cb(null, json.rows[idx])
// 			})
// 		})
// 	},
// 	delete: function (id, cb) {
// 		// SOFT DELETE
// 		return fs.readFile(USERS, (err, data) => {
// 			if(err) return cb(err)

// 			const json = JSON.parse(data)
// 			// add deleted @ rows[index]
// 			const idx = getIdx(json.rows, {query: id, target: 'id'})
// 			if(!idx) return cb({message: `Could not find user id=${id}`})
// 			const userToDelete = json.rows[idx]
// 			const deletedInfo = {
// 				deleted: true,
// 				deleted_at: date()
// 			}
// 			json.rows[idx] = Object.assign(userToDelete, deletedInfo)

// 			return fs.writeFile(USERS, JSON.stringify(json, null, 2), (err) => {
// 				if(err) return cb(err)
// 				cb(null, id)
// 			})
// 		})
// 	},
// 	getAll: function (cb) {
// 		return fs.readFile(USERS, (err, data) => {
// 			if(err) return cb(err)
// 			const json = JSON.parse(data)
// 			cb(null, json.rows)
// 		})
// 	},
// }

// get array index by match on object property
function getIdx (list, match) {
	const { query, target } = match
	for(let i = 0; i < list.length; i++) {
		if(list[i][target] === query) return i
	}
	return null
}

// full rewrite returning promises
// find(params) => rows.find(u => u[params.target] === params.query)
// create(user) => rows.push(user);next_id++
// update(id, nextInfo) => rows[getIdx(id)] = Object.assign(rows[getIdx(id)], nextInfo)
// delete(id) => rows[getIdx(id)].deleted = true & deleted_at = Date()
// getAll() => rows
module.exports = {
	async find(params) {
		const { query, target } = params
		const data = await asyncReadFile(USERS)
		const json = JSON.parse(data)
		const foundUser = json.rows.find(u => u[target] === query)
		return foundUser
	},
	async create(newUser) {
		// read data
		const data = await asyncReadFile(USERS)
		const json = JSON.parse(data)
		// add new data
		newUser.id = json.next_user_id
		json.rows.push(newUser)
		json.next_user_id++
		// write data
		await asyncWriteFile(USERS, JSON.stringify(json, null, 2))
		return newUser
	},
	async update(id, nextData) {
		// make sure to protect: id & created_at fields. Never update these
		if(!id) return new Error({message: 'UPDATE NEEDS ID'})
		const data = await asyncReadFile(USERS)
		const json = JSON.parse(data)
		const foundUser = json.rows.find(user => user.id === id)
		if(!foundUser) return new Error({message: `Could not find user id=${id}`})
		// update user @ rows[index]
		const idx = getIdx(json.rows, {query: id, target: 'id'})
		json.rows[idx] = Object.assign(foundUser, nextData)

		await asyncWriteFile(USERS, JSON.stringify(json, null, 2))
		return json.rows[idx]
	},
	async delete(id) {
		if(!id) return new Error({message: 'DELETE NEEDS ID'})
		// parse
		const data = await asyncReadFile(USERS)
		const json = JSON.parse(data)
		const idx = getIdx(json.rows, {query: id, target: 'id'})
		if(!idx) return new Error({message: `Could not find user id=${id}`})
		// mutate
		const userToDelete = json.rows[idx]
		const deletedInfo = {
			deleted: true,
			deleted_at: date()
		}
		json.rows[idx] = Object.assign(userToDelete, deletedInfo)
		// write
		await asyncWriteFile(USERS, JSON.stringify(json, null, 2))
		return id
	},
	async getAll() {
		const data = await asyncReadFile(USERS)
		const json = JSON.parse(data)
		return json.rows
	}
}