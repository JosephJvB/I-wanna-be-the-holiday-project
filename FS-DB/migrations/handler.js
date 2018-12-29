const fs = require('fs')

module.exports = (cmd, {NAME, PATH, SCHEMA}) => {
  switch(cmd.toLowerCase()) {
    case 'up': {
      if(fs.existsSync(PATH)) console.log(`❌ ${NAME} table already exists, migrate "down" to drop table.`)
      else return fs.writeFile(PATH, SCHEMA, (err) => {
        if(err) console.log(`❌ ERROR @ MIGRATE_UP: ${NAME}`)
        else console.log(`✅  ${NAME} up`)
        return
      })
    }
    break;
    case 'down': {
      if(!fs.existsSync(PATH)) console.log(`❌ cannot drop table ${NAME}: table does not exist`)
      // fs.unlink will remove a file
      else return fs.unlink(PATH, (err) => {
        if(err) console.log(`❌ ERROR @ MIGRATE_DOWN: ${NAME}`)
        else console.log(`✅  ${NAME} down`)
        return
      })
    }
    break;
    default: console.log(`❌ no command recognised, choose "up" or "down"`)
  }
}