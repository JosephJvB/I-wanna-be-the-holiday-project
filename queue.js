const queue = require('queue')({
  concurrency: 1,
  autostart: true
})

queue.on('success', (result, job) => console.log('[QUEUE]: complete job', getJobName(job)))
queue.on('end', () => console.log('[QUEUE]: queue empty'))

function getJobName (job) {
  const name = job.toString().split('function')[1].split('(cb)')[0].trim()
  return (name || 'no job name')
}

module.exports = queue