const queue = require('queue')({
  concurrency: 1,
  autostart: true
})
const users = require('./users-fs-service')
const { DB_CONN } = process.env

queue.on('success', (result, job) => console.log('job success:', getJobName(job)))
queue.on('end', () => console.log('ALL DONE'))

const createJob = (jobName, data) => {
  switch(jobName) {
    case 'printUsername': 
      return function printUsername(cb) {
        console.log(data.username)
        setTimeout(cb, 1000)
      }
    default: return function NO_JOB_NAME (cb) {
      console.log('INVALID JOB NAME GIVEN', jobName)
      cb()
    }
  }
}

users.getAll((err, users) => {
  if(err) return console.log('ERROR AT GET ALL', err)
  users.forEach(user => {
    // can use currying to define the job outside of this function
    queue.push(createJob('printUsername', user))
    // or define job inside of queue.push
    // queue.push(function printUsername(cb) {
    //   console.log(user.username)
    //   setTimeout(cb, 1000)
    // })
  })
  // test out createJob default case
  queue.push(createJob('invalidJobName'))
})

function getJobName (job) {
  return job.toString().split('function')[1].split('(cb)')[0].trim()
}