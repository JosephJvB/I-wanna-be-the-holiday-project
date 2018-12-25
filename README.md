<h1 align="center">ORTH</h1>

- revise authorization, hashing passwords and JWTs
- sidequest: using fileSystem as a database.
- smart idea: have a queue running that will read the "filesystem-DB" and insert those entries into a real database. That means that it will be harder to break a SQL database with too many connections.
  - insert into FILE_DB with `{temp: true}`
  - queue reads FILE_DB
  - inserts all `{temp: true}` entries into SQL_DB & updates entries as `{temp: false}`

