const fs = require('fs')
const path = require('path')
const PATH = path.join(__dirname, 'tables/ACTIVE_USERS_TABLE.json')

/********
 METHODS
*********
getAll() => rows
find(params) => rows.find(u => u[params.target] === params.query)
handleLogin({id, token}) => rows.push({id, token})
handleLogout({id, token}) => rows = rows.filter(u => u.id !== id && u.token !== token)
*/

module.exports = {
  getAll: function (cb) {
    return fs.readFile(PATH, (err, data) => {
      if(err) return cb(err)
      const json = JSON.parse(data)
      return cb(null, json.rows)
    })   
  },
  find: function (params, cb) {
    const { query, target } = params
    return fs.readFile(PATH, (err, data) => {
      if(err) return cb(err)
      const json = JSON.parse(data)
      const activeUser = json.rows.find(user => user[target] === query)
      return cb(null, activeUser)
    })
  },
  handleLogin: function (user, cb) {
    const { id, token } = user
    return fs.readFile(PATH, (err, data) => {
      if(err) return cb(err)
      const json = JSON.parse(data)
      json.rows.push({id, token})
      return fs.writeFile(PATH, JSON.stringify(json, null, 2), (err) => {
        if(err) return cb(err)
        return cb(null, user)
      })
    })
  },
  handleLogout: function (user, cb) {
    const { id, token } = user
    return fs.readFile(PATH, (err, data) => {
      if(err) return cb(err)
      const json = JSON.parse(data)
      const before = json.rows // NOT SURE IF THIS WORKS TBH
      json.rows = json.rows.filter(user => {
        return (user.id !== id && user.token !== token)
      })
      const after = json.rows // NOT SURE IF THIS WORKS TBH
      console.log('user after logout', afterLogout)
      return fs.writeFile(PATH, JSON.stringify(json, null, 2), (err) => {
        if(err) return cb(err)
        return cb(null, {before, after})
      })
    })
  }
}