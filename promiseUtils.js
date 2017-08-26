'use strict'

module.exports = {
  allSettled: allSettled,
  promiseTask: promiseTask
}

function allSettled (tasks, onError) {
  if (!Array.isArray(tasks)) {
    return Promise.reject(
      new Error(
        'allSettled expects an array of task functions as the first argument'
      )
    )
  }

  const results = []
  tasks = Object.assign([], tasks)

  function next () {
    var task = tasks.shift()

    if (!task) {
      // we're at the end
      return Promise.resolve(results)
    }

    return task.then(result => {
      if (Array.isArray(result)) {
        result.forEach(r => results.push(r))
      } else {
        results.push(result)
      }
    }).catch(err => {
      onError(err)

      if (Array.isArray(err)) {
        err.forEach(r => results.push(r))
      } else {
        results.push(err)
      }
    }).then(next)
  }

  return next()
}

function promiseTask (task) {
  if (typeof task !== 'function' || task.length < 2) {
    return payload => {
      let err = new Error('Tasks must be functions, and must at least accept the `payload` and `resolve` arguments')
      err.data = { task: task }
      return Promise.reject(err)
    }
  }

  return payload => {
    return new Promise((resolve, reject) => {
      task(payload, resolve, reject)
    })
  }
}
