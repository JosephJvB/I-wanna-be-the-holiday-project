const fs = require('fs')
const util = require('util')
const asyncReadFile = util.promisify(fs.readFile)
const asyncWriteFile = util.promisify(fs.writeFile)
const path = require('path')
const PATH = path.join(__dirname, 'tables/ACTIVE_USERS_TABLE.json')

/********
 METHODS
*********
getAll() => rows
find(params) => rows.find(u => u[params.target] === params.query)
handleLogin(user) => rows.push(user)
handleLogout({id, token}) => rows = rows.filter(u => u.id !== id && u.token !== token)
*/

module.exports = {
  async getAll () {
    const data = await asyncReadFile(PATH)
    const json = JSON.parse(data)
    return json.rows
  },
  async find (params) {
    const { query, target } = params
    const data = await asyncReadFile(PATH)
    const json = JSON.parse(data)
    const activeUser = json.rows.find(user => user[target] === query)
    return activeUser
  },
  async handleLogin (user) {
    const { id, token, username } = user
    const data = await asyncReadFile(PATH)
    const json = JSON.parse(data)
    json.rows.push({id, token, username})
    await asyncWriteFile(PATH, JSON.stringify(json, null, 2))
    return user
  },
  async handleLogout (user) {
    const { id, token } = user
    const data = await asyncReadFile(PATH)
    const json = JSON.parse(data)
    json.rows = json.rows.filter(user => {
      return (user.id !== id && user.token !== token)
    })
    await asyncWriteFile(PATH, JSON.stringify(json, null, 2))
    return
  }
}