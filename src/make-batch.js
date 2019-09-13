module.exports = {
  name: 'makeBatch',
  factory: () => {
    'use strict'

    function BatchComposer (options) {
      const givenSynonyms = options.givenSynonyms // ['given', 'arrange']
      const whenSynonyms = options.whenSynonyms // ['when', 'act', 'topic']
      const config = ['timeout', 'assertionLibrary', 'reporter']
      const actions = givenSynonyms.concat(whenSynonyms, config)
      const tapSkipPattern = /^# SKIP /i
      const tapSkipOrTodoPattern = /(^# SKIP )|(^# TODO )/i

      const getBySynonyms = (synonyms) => (node) => {
        const key = Object.keys(node).find((key) => synonyms.indexOf(key) > -1)
        return key ? node[key] : undefined
      }

      const getGiven = getBySynonyms(givenSynonyms)
      const getWhen = getBySynonyms(whenSynonyms)

      const isAssertion = (node, key) => {
        return typeof node === 'function' && actions.indexOf(key) === -1
      }

      const getAssertions = (behavior, node, skipped) => {
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

      const isCommentedOut = (behavior) => {
        return behavior.length >= 2 && behavior.trim().substring(0, 2) === '//'
      }

      const isTapSkipped = (behavior) => {
        return tapSkipOrTodoPattern.test(behavior)
      }

      const isSkipped = (behavior) => {
        if (behavior && (isCommentedOut(behavior) || isTapSkipped(behavior))) {
          return true
        }

        return false
      }

      const trimBehavior = (behavior) => {
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

      const concatBehavior = (behavior, key) => {
        if (typeof key === 'string' && key.trim().length) {
          return `${trimBehavior(behavior)}, ${trimBehavior(key)}`
        }

        return trimBehavior(behavior)
      }

      function Layer (input) {
        const { behavior, node, given, when, skipped, timeout, assertionLib } = input
        const skip = skipped || isSkipped(behavior)
        const assertions = getAssertions(behavior, node, skip, timeout)

        const _arrange = getGiven(node)
        const arrange = _arrange || given
        const _act = getWhen(node)
        let act = _act || when

        // IMPORTANT - if there's an immediate given, but not an immediate when,
        // then inheritance starts over
        if (_arrange && !_act) {
          // the when/act is what feeds the assertion
          // but leave the given/arrange there because another nest might need it
          act = arrange
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

      function FlattenedTests (input) {
        const { behavior, node, given, when, skipped, timeout, assertionLib } = input
        const layers = []
        const parent = new Layer({
          behavior,
          node,
          given,
          when,
          skipped: skipped || node.skipped,
          timeout: timeout || node.timeout,
          assertionLib: assertionLib || node.assertionLibrary
        })

        if (Array.isArray(parent.assertions) && parent.assertions.length) {
          layers.push(parent)
        }

        Object.keys(node).filter(childKey => {
          return typeof node[childKey] === 'object'
        }).map(childKey => {
          const childBehavior = concatBehavior(behavior, childKey)

          return FlattenedTests({
            behavior: childBehavior,
            node: node[childKey],
            given: parent.given,
            when: parent.when,
            // skipping favors the parent over the child
            skipped: parent.skipped || isSkipped(childKey),
            // timeout and assertion lib favor the child over the parent
            timeout: node[childKey].timeout || parent.timeout,
            assertionLib: node[childKey].assertionLibrary || parent.assertionLibrary
          })
        }).forEach(mappedLayers => {
          mappedLayers
            .filter(mappedLayer => {
              return Array.isArray(mappedLayer.assertions) && mappedLayer.assertions.length
            })
            .forEach(mappedLayer => {
              layers.push(mappedLayer)
            })
        })

        return layers
      }

      const makeBatch = (tests) => Object.keys(tests).reduce((batch, key) => {
        return batch.concat(new FlattenedTests({ behavior: key, node: tests[key] }))
      }, [])

      return { makeBatch }
    } // /BatchComposer

    return { BatchComposer }
  } // /factory
} // /exports
