'use strict'

const givenSynonyms = ['given', 'arrange']
const whenSynonyms = ['when', 'act', 'topic']
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
  var parent
  var passes = []
  timeout = timeout || node.timeout
  assertionLib = assertionLib || node.assertionLibrary
  skipped = skipped || node.skipped
  parent = new Pass(behavior, node, given, when, skipped, timeout, assertionLib, count)

  if (Array.isArray(parent.assertions) && parent.assertions.length) {
    passes.push(parent)
  }

  Object.keys(node).filter(childKey => {
    return typeof node[childKey] === 'object'
  }).map(childKey => {
    let childBehavior = concatBehavior(behavior, childKey)

    return parseOne(
      childBehavior,
      node[childKey],
      parent.given,
      parent.when,
      // skipping favors the parent over the child
      parent.skipped || isSkipped(childKey),
      // timeout and assertion lib favor the child over the parent
      node[childKey].timeout || parent.timeout,
      node[childKey].assertionLibrary || parent.assertionLibrary,
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
  return node.when || node.act || node.topic
}

function getAssertions (behavior, node, skipped) {
  if (isAssertion(node, behavior)) {
    return [{
      behavior: behavior,
      test: node,
      skipped: skipped
    }]
  }

  return Object.keys(node)
    .filter(key => isAssertion(node[key], key))
    .map(key => {
      return {
        behavior: concatBehavior(behavior, key),
        test: node[key],
        skipped: skipped || isSkipped(key)
      }
    })
}

function isAssertion (node, key) {
  return typeof node === 'function' && actions.indexOf(key) === -1
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
    behavior: behavior,
    given: arrange,
    when: act,
    assertions: getAssertions(behavior, node, skip, timeout),
    skipped: skip,
    timeout: timeout,
    assertionLibrary: assertionLib
  }
}
