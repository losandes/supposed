module.exports = (test) => {
  test('when a test file exports a function, the runner should give it an instance of supposed', t => {
    t.equal(1, 1)
  })

  // test('spec 1!', expect => {
  //   expect(42 / 0).to.equal(Infinity)
  // })
}
