import fs from 'fs'
import path from 'path'
import { JSDOM } from 'jsdom'

export function getLogCallback(cb: (getLog: () => string) => void) {
  const clg = console.log
  const logs = []
  console.log = (...args) => logs.push(args.map((val) => JSON.stringify(val)).join(','))
  if (typeof cb === 'function') {
    cb(() => logs.join('\n'))
  }
  console.log = clg
}

export function drawComparisonRadarChart<T extends { asin: string }>(objA: T, objB: T) {
  const jsdom = new JSDOM('<body><div id="container"></div></body>', { runScripts: 'dangerously' })
  const window = jsdom.window
  // require anychart and anychart export modules
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const anychart = require('anychart')(window)
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const anychartExport = require('anychart-nodejs')(anychart)

  const formateValue = (v: any) => (isNaN(parseFloat(v)) ? v : parseFloat(v))
  const getDataLine = (obj: T) =>
    Object.keys(objA)
      .filter((k) => !['calc-log', 'asin', 'dimensionUnit', 'weightUnit'].includes(k))
      .map((k) => ({ x: k, value: formateValue(obj[k]) }))

  const chart = anychart.radar()
  chart.title('Comparison Fees Chart').legend(true)

  const seriesA = chart.line(getDataLine(objA))
  const seriesB = chart.line(getDataLine(objB))

  seriesA.name('Official')
  seriesA.stroke({ color: '#64b5f6', thickness: 4 })
  seriesA.markers(true)
  // seriesA.labels().enabled(true).position('top')

  seriesB.name('MVP')
  seriesB.stroke({ color: '#000', thickness: 2 })
  seriesB.markers(true)
  // seriesB.labels().enabled(true).position('bottom')

  chart.bounds(0, 0, 800, 600)
  chart.container('container')
  chart.draw()

  // generate and save it to a file
  anychartExport.exportTo(chart, 'pdf').then(
    function (image) {
      fs.writeFile(path.join(__dirname, `radar-${objA.asin}-chart.pdf`), image, function (fsWriteError) {
        if (fsWriteError) {
          console.log(fsWriteError)
        } else {
          console.log('Complete')
        }
      })
    },
    function (generationError) {
      console.log(generationError)
    }
  )
}

export function writeJsonFile<T extends { asin: string }>(objA: T, objB: T) {
  if (objA.asin) fs.writeFileSync(path.join(__dirname, `official-${objA.asin}.json`), JSON.stringify(objA))
  if (objB.asin) fs.writeFileSync(path.join(__dirname, `mvp-${objB.asin}.json`), JSON.stringify(objB))
}
