const fs = require('fs')
const path = require('path')
// save secrets to process.env
// choose synchronous readfile so app cant start before config loads
module.exports = ({test}) => {
  // READ SECRETS
	const data = fs.readFileSync(path.join(__dirname, '../SECRETS.json'))
	// did you know that json.parse can turn a buffer into JSON? that is fancy
	const json = JSON.parse(data)

	// ADD KEYS FROM SECRETS
	// is this dumb?
	process.env = Object.assign({}, process.env, json)
	// is this better?
	// Object.keys(json).forEach(secret => process.env[secret] = json[secret])
	console.log('loaded config vars', Object.keys(json))
	// ADD PORT
	if(!process.env.PORT) {
		process.env.PORT = 3000
	}
	// ADD TEST
	if(test) process.env.TEST = true
	console.log('test:', test ? 'ON @ /test' : 'OFF')
	// ADD DB_CONN
	const environment = process.env.NODE_ENV || 'development'
	const config = require('../knexfile')[environment]
	process.env.DB_CONN = require('knex')(config)

	//FINISH
  // return object with keys that we added to env,
  // json from secrets & PORT & test & dbconn
	return Object.assign(json, {
		PORT: process.env.PORT,
    test,
    DB_CONN: process.env.DB_CONN
	})
}