'use strict'

module.exports = {
  name: 'promiseUtils',
  factory: {
    allSettled: allSettled
  }
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
  const addResults = (result) => {
    if (Array.isArray(result)) {
      result.forEach(addOneResult)
    } else {
      addOneResult(result)
    }
  }
  const addOneResult = (result) => {
    if (result.type === 'BROKEN') {
      onError && onError(result)
    }

    results.push(result)
  }
  tasks = Object.assign([], tasks)

  function next () {
    var task = tasks.shift()

    if (!task) {
      // we're at the end
      return Promise.resolve(results)
    }

    return task()
      .then(addResults)
      .catch(addResults)
      .then(next)
  }

  return next()
}
