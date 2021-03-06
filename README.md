<h1 align="center">I WANNA BUILD THE APP</h1>

- I wanna refactor the callbacks into async/await
  - MID REFACTOR, todo:
    - test login async
    - refactor logout
    - refactor active-users-service to async

- I wanna queue the sql entries
  - [x] save-temp to the file-system, save fs-entries to a SQL db via job-queue.
  - When do I trigger the queue? Options(best to worst):
    - queue autostart when it has items in it
    - queue trigger by cron-job
    - track number of active users: if it is below a threshold: trigger queue(but then I need a function to poll on active users & queue-length. How do that?)
    - queue trigger when an endpoint is hit(could be on logout?)
    - queue trigger when it has n number of jobs in it
  - and then maybe I never read from the SQL db? I just read from the filesystem.
  - I can generate reports from the SQL db. I dunno.

- I wanna build the login/register screen (with sweet-alerts)

- I wanna build the mail-client.
  - users can reset their passwords by mail.
  - maybe even look at 2fa stuff? Is it hard to send texts from the web?

- I wanna secure the server.
  - rate-limiting on requests(@express level)
  - cors, helmet

- I wanna cache the jwt: when we get to making a front end we are gonna use:
  - use Vue, try out some state management with VueX
  - (want to try out redux bundler with react but we're in Vuetown now.)

Not todos just notes
====================
- one thing that sucks about this filesystem DB is that you have to parse a whole 'table' too often.
  - to get a single point of data
  - to do any write you must parse the table, update the data, then re-write the whole table.
- maybe that could be improved by using a readstream?
- another cool fs method I havent used is fs.watch

Init readme notes
=================
- revise authorization, hashing passwords and JWTs
- sidequest: using fileSystem as a database.
- smart idea: have a queue running that will read the "filesystem-DB" and insert those entries into a real database. That means that it will be harder to break a SQL database with too many connections.
  - insert into FILE_DB with `{temp: true}`
  - queue reads FILE_DB
  - inserts all `{temp: true}` entries into SQL_DB & updates entries as `{temp: false}`

When commenting my queries, I like phrasing the comments as questions: "does the user exist?" cos it explains the question that the query is trying to answer 💁