<h1 align="center">I WANNA BUILD THE APP</h1>

- I wanna queue the sql entries
  - save-temp to the file-system, then gradually save file-system entries to a SQL db via job-queue.
  - general idea:
  ```js
  client.post()
  .then(data => {
    data.temp = true
    fileSystem.write(data)
  })
  // ...meanwhile
  queue.poll(fileSystem.read, (data) => {
    if (data.rows.find(row => row.temp)) {
      const tempEntries = data.rows.filter(row => row.temp)
      console.log(tempEntries.length, 'save-temp jobs pushed to the queue')
      tempEntries.forEach(entry => queue.push('save-temp', entry))
    } else {
      console.log('no temp entries')
    }
  })
  // job
  {
    name: 'save-temp',
    perform: function(entry) {
      // check that entry is still temp
      fs.read(entry.id, (data) => {
        if (!data.temp) return
        // insert into db 
        knex('tablename')
          .insert(entry)
          .then(() => {
            // write back to file system with temp = false
            fs.read('all', (data) => {
              data.rows[entryIdx].temp = false
              fs.write(data)
            })
          })
      })
    }
  }
  ```
  - and then maybe I never read from the SQL db? I just read from the filesystem.
  - I can generate reports from the SQL db. I dunno.

- I wanna build the mail-client.
  - users can reset their passwords by mail.
  - maybe even look at 2fa stuff? Is it hard to send texts from the web?

- I wanna secure the server.
  - rate-limiting on requests(@express level)
  - cors, helmet

- I wanna cache the jwt: when we get to making a front end we are gonna use:
  - and might as well try out redux bundler since friends think that is the bees-knees
  ```js
  const getPersistMiddleware = require('redux-persist-middleware').default
  const { getConfiguredCache } = require('money-clip')
  ```
  .. err ah, what is the front end gonna do? I never think this far ahead. I just wanted to do auth-ish stuff.

Init readme notes
=================
- revise authorization, hashing passwords and JWTs
- sidequest: using fileSystem as a database.
- smart idea: have a queue running that will read the "filesystem-DB" and insert those entries into a real database. That means that it will be harder to break a SQL database with too many connections.
  - insert into FILE_DB with `{temp: true}`
  - queue reads FILE_DB
  - inserts all `{temp: true}` entries into SQL_DB & updates entries as `{temp: false}`

When commenting my queries, I like phrasing the comments as questions: "does the user exist?" cos it explains the question that the query is trying to answer 💁