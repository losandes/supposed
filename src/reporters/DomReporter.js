module.exports = {
  name: 'DomReporter',
  factory: (dependencies) => {
    'use strict'

    const { TestEvent, formatter } = dependencies
    const { format } = formatter
    const reportDivId = 'supposed_report'
    const reportPreId = 'supposed_report_results'
    let reportDiv
    let reportPre

    const initDom = () => {
      const _reportDiv = document.getElementById(reportDivId)
      if (_reportDiv) {
        reportDiv = _reportDiv
        reportPre = document.getElementById(reportPreId)
        return
      }

      reportDiv = document.createElement('div')
      reportDiv.setAttribute('id', reportDivId)
      document.body.appendChild(reportDiv)

      reportPre = document.createElement('pre')
      reportPre.setAttribute('id', reportPreId)
      reportDiv.appendChild(reportPre)
    }

    const scrollToBottom = () => {
      if (
        typeof window !== 'undefined' &&
        typeof window.scrollTo === 'function' &&
        typeof document !== 'undefined' &&
        document.body
      ) {
        window.scrollTo(0, document.body.scrollHeight)
      }
    }

    function DomReporter () {
      initDom()

      const write = (event) => {
        // write to the console
        if ([
          TestEvent.types.START,
          TestEvent.types.TEST,
          TestEvent.types.INFO,
          TestEvent.types.END
        ].indexOf(event.type) > -1) {
          const line = format(event)

          if (!line) {
            return
          }

          console.log(line)
          reportPre.append(`${line}\n`)
          scrollToBottom()
        }
      } // /write

      return { write }
    }

    return { DomReporter }
  }
}
