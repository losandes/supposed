const supposed = require('supposed')
// It's important that this is a function that creates a Suite
// If the same suite is used a second time, it won't report
// correctly because the Suite is already in the process of running
const branches = () => supposed.Suite({ reporter: 'noop' })

class ConditionalError extends Error {
  constructor (name, actual) {
    super(`Condition Not Met: ${name}`)

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ConditionalError)
    }

    this.name = name
    this.actual = actual
    this.conditionIsMet = false
  }
}

const condition = (name, check) => async (given) => {
  if (await check(given)) {
    return given
  }

  throw new ConditionalError(name, given)
}

const conditionIsMet = (continuation) => async (err, actual) => {
  if (err && err.conditionIsMet === false) {
    // do nothing
    return
  } else if (err) {
    throw err
  }

  const result = await continuation(actual)
  return result
}

const conditionIsNotMet = (continuation) => async (err, actual) => {
  if (err && err.conditionIsMet === false) {
    const result = await continuation({ condition: err.name, actual: err.actual })
    return result
  } else if (err) {
    throw err
  }

  // do nothing
}

const next = {
  iff: (isMet) => {
    if (isMet) {
      return {
        then: conditionIsMet
      }
    } else {
      return {
        then: conditionIsNotMet
      }
    }
  }
}

const tree = async (link) => {
  const outputs = []
  const complete = (result) => {
    outputs.push(result)
  }

  return branches()({
    'given a link': {
      given: () => { return { link } },
      'when the link is https': {
        when: condition('link is https', async (given) => given.link.substring(0, 5) === 'https'),
        'and the link is for a google domain': () => next.iff(true).then(async (given) => branches()({
          when: condition('link is for google', async () => given.link.includes('google')),
          'do something specific to google': () => next.iff(true).then((given) => {
            complete({ ...given, ...{ cancelled: false, isHttpsAndGoogle: true } })
          })
        })
        ),
        'and the link is *not* for a google domain': () => next.iff(true).then((given) => branches()({
          when: condition('link is for google', async () => !given.link.includes('google')),
          'do something else': () => next.iff(true).then((given) => {
            complete({ ...given, ...{ cancelled: false, isHttpsAndGoogle: false } })
          })
        })),
        'stop the flow': () => next.iff(false).then((context) => {
          complete({ ...context, ...{ cancelled: true } })
        })
      }
    }
  }) // /tree
    .then(() => outputs)
}

const t1 = tree('http://google.com')
const t2 = tree('https://google.com')

Promise.all([t1, t2])
  .then((results) => { console.log(results) })
  .catch((err) => console.log(err))
