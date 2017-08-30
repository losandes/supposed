'use strict'

const givenSynonyms = ['given', 'arrange']
const whenSynonyms = ['when', 'act']
const actions = givenSynonyms.concat(whenSynonyms)

module.exports = TestBatch

function TestBatch (tests) {
  var parsed = []

  Object.keys(tests).forEach(key => {
    parsed = parsed.concat(parseOne(key, tests[key]))
  })

  return parsed
}

function parseOne (behavior, node, given, when, skipped, timeout, assertionLib, count = 0) {
  var pass
  var passes = []
  timeout = timeout || node.timeout
  assertionLib = assertionLib || node.assertionLibrary
  pass = new Pass(behavior, node, given, when, skipped, timeout, assertionLib, count)

  if (Array.isArray(pass.assertions) && pass.assertions.length) {
    passes.push(pass)
  }

  Object.keys(node).filter(key => {
    return typeof node[key] === 'object'
  }).map(key => {
    return parseOne(
      concatBehavior(behavior, key),
      node[key],
      pass.given,
      pass.when,
      pass.skipped || isSkipped(key),
      node[key].timeout || node.timeout || pass.timeout,
      node[key].assertionLibrary || node.assertionLibrary || pass.assertionLibrary,
      (count += 1)
    )
  }).forEach(mappedPasses => {
    mappedPasses
      .filter(mappedPass => {
        return Array.isArray(mappedPass.assertions) && mappedPass.assertions.length
      })
      .forEach(mappedPass => {
        passes.push(mappedPass)
      })
  })

  return passes
}

function getGiven (node) {
  return node.given || node.arrange
}

function getWhen (node) {
  return node.when || node.act
}

function getAssertions (behavior, node, skipped) {
  return Object.keys(node)
    .filter(key => {
      return typeof node[key] === 'function' && actions.indexOf(key) === -1
    }).map(key => {
      return {
        behavior: concatBehavior(behavior, key),
        test: node[key],
        skipped: skipped || isSkipped(key)
      }
    })
}

function isSkipped (behavior) {
  return behavior && behavior.trim().substring(0, 2) === '//'
}

function trimBehavior (behavior) {
  if (behavior.substring(0, 2) === '//') {
    return behavior.substring(2).trim()
  } else {
    return behavior.trim()
  }
}

function concatBehavior (behavior, key) {
  return `${trimBehavior(behavior)}, ${trimBehavior(key)}`
}

function Pass (behavior, node, given, when, skipped, timeout, assertionLib, count) {
  const skip = skipped || isSkipped(behavior)
  var arrange = getGiven(node) || given
  var act = getWhen(node) || when

  if (arrange && !act) {
    act = arrange
    arrange = null
  }

  return {
    count: count,
    behavior: trimBehavior(behavior),
    given: arrange,
    when: act,
    assertions: getAssertions(behavior, node, skip, timeout),
    skipped: skip,
    timeout: timeout,
    assertionLibrary: assertionLib
  }
}
