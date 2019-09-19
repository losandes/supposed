const supposed = require('supposed')
const { time } = supposed

const durations = {}

module.exports = supposed.Suite({
  reporter: 'noop'
}).subscribe((event) => {
  if (event.type === 'START_TEST') {
    durations[`t${event.testId}`] = {
      behavior: event.behavior,
      start: {
        us: event.time,
        us2: time.clock('us'),
        ms: time.clock('ms')
      }
    }
  } else if (event.type === 'END_TEST') {
    const dur = durations[`t${event.testId}`]

    dur.end = {
      us: event.time,
      us2: time.clock('us')
    }
    dur.duration = {
      us: (event.time - dur.start.us),
      us2: dur.end.us2 - dur.start.us2,
      ms: (time.clock('ms') - dur.start.ms)
    }
  } else if (event.type === 'END') {
    console.log(durations)
    // console.log(Object.keys(durations).map((key) => {
    //   return {
    //     test: durations[key].behavior,
    //     duration: durations[key].duration
    //   }
    // }))
  }
})
  .runner({ cwd: __dirname })
  .run()
