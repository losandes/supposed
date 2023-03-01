module.exports = (test) => {
  const SKIP_SLOW_TESTS = process.env.SUPPOSED_INCLUDE_SLOW_TESTS === 'false'
  const COUNT = process.env.SUPPOSED_SLOW_TEST_COUNT
    ? parseInt(process.env.SUPPOSED_SLOW_TEST_COUNT)
    : 5
  const DELAY = process.env.SUPPOSED_SLOW_TEST_DELAY
    ? parseInt(process.env.SUPPOSED_SLOW_TEST_DELAY)
    : 10

  const slowTest = (idx) => async () => new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, DELAY * idx)
  })

  return (async () => {
    for (let i = 0; i < COUNT; i += 1) {
      const description = SKIP_SLOW_TESTS
        ? '// slow tests (export SUPPOSED_INCLUDE_SLOW_TESTS=true to turn these on)'
        : `slow test ${i}`

      const timeout = DELAY * (COUNT * 2)

      await test(description, {
        timeout: timeout > 2000 ? timeout : 2000,
        'it should be delayed': slowTest(i),
      })
    }
  })()
}
