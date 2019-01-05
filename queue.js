const queue = require('queue')({
  concurrency: 1,
  autostart: true
})

queue.on('success', (result, job) => console.log('[QUEUE]: complete job', getJobName(job)))
queue.on('end', () => console.log('[QUEUE]: queue empty'))

function getJobName (job) {
  let name = 'NOT NAMED'
  try {
    name = job.toString().split('function')[1].split('(cb)')[0].trim()
  } catch (e) {/* swallow error in-case string parsing fails */}
  return name
}

module.exports = queue