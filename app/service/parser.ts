import cheerio from 'cheerio'

export function parseTiers(content: string) {
  const $ = cheerio.load(content)
  let names: string[] = []
  let weightRule: number[] = []
  let volumeRule: number[][] = []
  let lengthGirthRule: number[] = []
  $('tbody tr').each((rowIndex, element) => {
    volumeRule.push([])
    $(element)
      .find('td')
      .each((index, element) => {
        if (index === 0) {
          names.push($(element).find('strong').text())
        } else if (index === 1) {
          weightRule.push(parseFloat($(element).text()))
        } else if (index === 5) {
          lengthGirthRule.push(parseFloat($(element).text()))
        } else {
          volumeRule[rowIndex][index - 2] = parseFloat($(element).text())
        }
      })
  })
  return {
    tierNames: names,
    weightRule: weightRule,
    volumeRule: volumeRule,
    lengthGirthRule: lengthGirthRule,
    dimensionUnit: 'cm',
    weightUnit: 'lb',
  }
}

export function parseWeight(content: string) {
  const $ = cheerio.load(content)
  const minimumWeightText = $('.a-vertical:eq(0)').find('li:eq(0)').find('span').text()
  const divisorText = $('.help-content:eq(1)').find('div p:eq(0)').text()
  const divisor = divisorText.match(/(\d+)/)
  return {
    minimumWeight: parseFloat(minimumWeightText),
    divisor: divisor ? parseFloat(divisor[0]) : 1,
  }
}

export function parseFba(content: string) {
  return {}
}
export function parseReferral(content: string) {
  const newLocal = 35
  return [
    {
      categoriy: 'aaa',
      fee: newLocal,
      minimumFee: 0.4,
    },
  ]
}
export function parseClosing(content: string) {
  return {}
}
