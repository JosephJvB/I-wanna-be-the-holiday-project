<h1 align="center">ORTH</h1>

- revise authorization, hashing passwords and JWTs
- sidequest: using fileSystem as a database.

As a thought: I could do all these functions as synchronous operations. Non-non-blocking.
Not for any reason other than I can. (Not the express middleware, but all my 'database' operations)

But I am having fun passing callbacks actually. I've used promises for so long that using callbacks has a novelty. Would have been fun to promisify them & use try/catch + async/await.
For next time.