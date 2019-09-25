module.exports = {
  name: 'makeBatch',
  factory: (dependencies) => {
    'use strict'

    const { hash } = dependencies

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

      const makeBatchId = (behavior) => typeof behavior === 'string' && behavior.trim().length
        ? `B${hash(behavior.trim())}`
        : `B${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`
      const makeTestId = (behavior) => typeof behavior === 'string' && behavior.trim().length
        ? `T${hash(behavior.trim())}`
        : `T${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`

      const makeOneAssertion = (behavior, behaviors, node, skipped) => {
        const _behaviors = behavior && behavior.trim().length ? behaviors.concat([behavior]) : behaviors
        const _behavior = _behaviors.map(trimBehavior).join(', ')

        return {
          id: makeTestId(_behavior),
          behaviors: _behaviors,
          behavior: _behavior,
          test: node,
          skipped: skipped
        }
      }

      const getAssertions = (behavior, behaviors, node, skipped) => {
        if (isAssertion(node, behavior)) {
          // empty behavior because the behavior should already be in `behaviors`
          return [makeOneAssertion('', behaviors, node, skipped /* isSkipped(behavior) was called just before this */)]
        }

        return Object.keys(node)
          .filter((key) => isAssertion(node[key], key))
          .map((key) =>
            makeOneAssertion(key, behaviors, node[key], skipped || isSkipped(key))
          )
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

      function Layer (input) {
        const { id, behavior, behaviors, node, timeout, assertionLibrary } = input
        const parentSkipped = input.skipped
        const parentGiven = input.given
        const parentWhen = input.when
        const parentWhenIsInheritedGiven = input.whenIsInheritedGiven

        const skipped = parentSkipped || isSkipped(behavior)
        const assertions = getAssertions(behavior, behaviors, node, skipped, timeout)
        const given = getGiven(node) || parentGiven
        let when = getWhen(node)
        let whenIsInheritedGiven = parentWhenIsInheritedGiven || false // false is the default

        if (when) {
          // an immediate when is present, so this overrides the parent
          whenIsInheritedGiven = false
        } if (!when && parentWhen && !whenIsInheritedGiven) {
          // an immediate when is NOT present, there is a parent `when`, and
          // it's not the result if `if (!when && given)` - this when
          // should be inherited
          /*
          'when nested assertions have givens (make-batch inline-comments)': {
            given: () => 42,
            when: (given) => given * 2,
            'it should equal 84': (t) => (err, actual) => {
              t.ifError(err)
              t.strictEqual(actual, 84)
            },
            'and they stem from a parent with a when': {
              given: () => 1,
              'it should equal 2': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, 2)
              }
            }
          }
          */
          when = parentWhen
        } else if (!when && given) {
          // There are neither an immediate when, nor a parent when because the parent
          // when was actually a given (the result of this block)
          /*
          'when nested assertions have givens (make-batch if (!when && given))': {
            given: () => 42,
            'it should equal 42': (t) => (err, actual) => {
              t.ifError(err)
              t.strictEqual(actual, 42)
            },
            'and they stem from a parent with a when': {
              given: () => 1,
              'it should equal 1': (t) => (err, actual) => {
                t.ifError(err)
                t.strictEqual(actual, 1)
              }
            }
          }
          */
          whenIsInheritedGiven = true
          when = given
        }

        return {
          id: id || makeTestId(behavior),
          behaviors,
          behavior,
          given,
          when,
          assertions,
          skipped,
          timeout,
          assertionLibrary,
          whenIsInheritedGiven
        }
      }

      function FlattenedTests (input) {
        const { behavior, behaviors, node, given, when, whenIsInheritedGiven, skipped, timeout, assertionLibrary } = input
        const layers = []
        const props = Object.keys(node)
        const parent = new Layer({
          id: makeBatchId(behavior),
          behaviors: Array.isArray(behaviors) ? behaviors : [behavior],
          behavior,
          node,
          given,
          when,
          whenIsInheritedGiven,
          skipped: skipped || node.skipped,
          timeout: timeout || node.timeout,
          assertionLibrary: assertionLibrary || node.assertionLibrary
        })

        if (Array.isArray(parent.assertions) && parent.assertions.length) {
          layers.push(parent)
        }

        props
          .filter((childKey) => typeof node[childKey] === 'object')
          .map((childKey) => {
            return FlattenedTests({
              behaviors: parent.behaviors.concat([childKey]),
              behavior: childKey,
              node: node[childKey],
              given: parent.given,
              when: parent.when,
              whenIsInheritedGiven: parent.whenIsInheritedGiven,
              // skipping favors the parent over the child
              skipped: parent.skipped || isSkipped(childKey),
              // timeout and assertion lib favor the child over the parent
              timeout: node[childKey].timeout || parent.timeout,
              assertionLibrary: node[childKey].assertionLibrary || parent.assertionLibrary
            })
          }).forEach((mappedLayers) =>
            mappedLayers
              .filter((mappedLayer) => Array.isArray(mappedLayer.assertions) && mappedLayer.assertions.length)
              .forEach((mappedLayer) => layers.push(mappedLayer))
          )

        return layers
      }

      const makeBatch = (tests) => Object.keys(tests)
        .reduce((batch, key) => {
          return batch.concat(new FlattenedTests({ behavior: key, node: tests[key] }))
        }, []).map((theory) => {
          // // example theory
          // { id: 'B787763104',
          //   behaviors: [ 'given first-module, when... it...' ],
          //   behavior: 'given first-module, when... it...',
          //   given: undefined,
          //   when: undefined,
          //   assertions:
          //    [ { id: 'T787763104',
          //        behaviors: [Array],
          //        behavior: 'given first-module, when... it...',
          //        test: [Function],
          //        skipped: false } ],
          //   skipped: false,
          //   timeout: undefined,
          //   assertionLibrary: undefined,
          //   whenIsInheritedGiven: false }
          return {
            id: theory.id,
            given: theory.given,
            when: theory.when,
            assertions: theory.assertions,
            skipped: theory.skipped,
            timeout: theory.timeout,
            assertionLibrary: theory.assertionLibrary
          }
        })

      return { makeBatch, makeBatchId, makeTestId }
    } // /BatchComposer

    return { BatchComposer }
  } // /factory
} // /exports
