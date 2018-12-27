const queue = require('queue')({
  concurrency: 1,
  autostart: true
})
const users = require('./users-fs-service')
const { DB_CONN } = process.env

queue.on('success', (result, job) => console.log('job success:', getJobName(job)))
queue.on('end', () => console.log('ALL DONE'))

function getJobName (job) {
  const name = job.toString().split('function')[1].split('(cb)')[0].trim()
  return (name || 'no job name')
}

module.exports = queue