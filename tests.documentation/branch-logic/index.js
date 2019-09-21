const branches = require('supposed').Suite({ reporter: 'noop' })

const tree = (link) => branches({
  'given a link': {
    given: () => { return { link } },
    'when the link is https': {
      when: (given) => given.link.substring(0, 5) === 'https'
    },
    'when the link is not https': {
      when: (given) => given.link.substring(0, 5) !== 'https'
    }
  }
})

tree('https://google.com')
