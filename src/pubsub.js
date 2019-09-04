module.exports = {
  name: 'pubsub',
  factory: (dependencies) => {
    'use strict'

    const { allSettled, TestEvent } = dependencies

    const makeId = () => `S${(Math.random() * 0xFFFFFF << 0).toString(16).toUpperCase()}`

    function Pubsub () {
      const subscriptions = []

      const publish = async (input) => {
        const event = new TestEvent(input)

        await allSettled(subscriptions.map(
          async (subscription) => {
            await subscription.write(event)
          })
        )

        return event
      }

      const subscribe = (subscription) => {
        if (typeof subscription === 'function') {
          subscriptions.push({ name: makeId(), write: subscription })
        } else if (subscriptions && typeof subscription.write === 'function') {
          subscription.name = subscription.name || makeId()
          subscriptions.push(subscription)
        } else {
          throw new Error('Invalid subscription: expected either a function, or { name: string, write: function }')
        }
      }

      const subscriptionExists = (name) => {
        if (subscriptions.find((subscription) => subscription.name === name)) {
          return true
        }

        return false
      }

      return { publish, subscribe, subscriptionExists }
    }

    return { Pubsub }
  }
}
