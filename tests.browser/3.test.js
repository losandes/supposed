module.exports = (test) => {
  const DESCRIPTION = 'slow tests '
  const DELAY = 10
  const makeDescription = (count) => DESCRIPTION + ', #' + count

  const slowTest = async () => new Promise((resolve) => {
    setTimeout(() => { resolve() }, DELAY)
  })

  return test(makeDescription(1), slowTest)
    .then(() => test(makeDescription(2), slowTest))
    .then(() => test(makeDescription(3), slowTest))
    .then(() => test(makeDescription(4), slowTest))
    .then(() => test(makeDescription(5), slowTest))
}
