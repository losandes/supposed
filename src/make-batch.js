module.exports = {
  name: 'make-batch',
  factory: () => {
    'use strict'

    const givenSynonyms = ['given', 'arrange']
    const whenSynonyms = ['when', 'act', 'topic']
    const config = ['timeout', 'assertionLibrary', 'reporter']
    const actions = givenSynonyms.concat(whenSynonyms, config)
    const tapSkipPattern = /^# SKIP /i
    const tapSkipOrTodoPattern = /(^# SKIP )|(^# TODO )/i

    function parseOne (behavior, node, given, when, skipped, timeout, assertionLib) {
      timeout = timeout || node.timeout
      assertionLib = assertionLib || node.assertionLibrary
      skipped = skipped || node.skipped
      const passes = []
      const parent = new Pass(behavior, node, given, when, skipped, timeout, assertionLib)

      if (Array.isArray(parent.assertions) && parent.assertions.length) {
        passes.push(parent)
      }

      Object.keys(node).filter(childKey => {
        return typeof node[childKey] === 'object'
      }).map(childKey => {
        const childBehavior = concatBehavior(behavior, childKey)

        return parseOne(
          childBehavior,
          node[childKey],
          parent.given,
          parent.when,
          // skipping favors the parent over the child
          parent.skipped || isSkipped(childKey),
          // timeout and assertion lib favor the child over the parent
          node[childKey].timeout || parent.timeout,
          node[childKey].assertionLibrary || parent.assertionLibrary
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
      if (behavior && (isCommentedOut(behavior) || isTapSkipped(behavior))) {
        return true
      }

      return false
    }

    function isCommentedOut (behavior) {
      return behavior.length >= 2 && behavior.trim().substring(0, 2) === '//'
    }

    function isTapSkipped (behavior) {
      return tapSkipOrTodoPattern.test(behavior)
    }

    function trimBehavior (behavior) {
      if (isCommentedOut(behavior)) {
        // remove the comments
        return behavior.substring(2).trim()
      } else if (tapSkipPattern.test(behavior)) {
        // remove the directive - it will be replaced in the TAP output
        return behavior.substring(7).trim()
      } else {
        return behavior.trim()
      }
    }

    function concatBehavior (behavior, key) {
      return `${trimBehavior(behavior)}, ${trimBehavior(key)}`
    }

    function Pass (behavior, node, given, when, skipped, timeout, assertionLib) {
      const skip = skipped || isSkipped(behavior)
      const assertions = getAssertions(behavior, node, skip, timeout)

      let arrange = getGiven(node) || given
      let act = getWhen(node) || when

      if (arrange && !act) {
        act = arrange
        arrange = null
      }

      return {
        behavior: behavior,
        given: arrange,
        when: act,
        assertions: assertions,
        skipped: skip,
        timeout: timeout,
        assertionLibrary: assertionLib
      }
    }

    function makeBatch (tests) {
      let parsed = []

      Object.keys(tests).forEach(key => {
        parsed = parsed.concat(parseOne(key, tests[key]))
      })

      return parsed
    }

    return { makeBatch }
  }
}
