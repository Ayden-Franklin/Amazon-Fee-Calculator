import cheerio from 'cheerio'
import { NotAvailable } from '@src/service/constants'

export function parseTier(content: string) {
  const empty = { value: NaN, unit: NotAvailable }
  const $ = cheerio.load(content)
  const tiers: ITier[] = []

  const parseOperator = (s: string) => {
    switch (s.toLowerCase()) {
      case 'or less':
        return '<='
      case 'exceed':
        return '>'
      default:
        return s
    }
  }
  const parseExpression = (text: string): ICalculateUnit => {
    const values = text.split(' ')
    if (values.length < 4) return empty
    const value = parseFloat(values[0])
    const unit = values[1]
    const operator = parseOperator(`${values[2]} ${values[3]}`)
    return { value, operator, unit }
  }

  const parseOversizeSpecialExpression = (text: string): ICalculateUnit => {
    const values = text.split(' ')
    if (values.length < 3) return empty
    const value = parseFloat(values[1])
    const unit = values[2]
    const operator = parseOperator(values[0])
    return { value, operator, unit }
  }
  const [...names] = $('div')
    .find('p strong')
    .map((_, e) => $(e).text())
  names.push($('h2:eq(1)').text().replace(' Handling', ''))
  const lists = $('div').find('ul')
  // TODO: If the page layout changed, we have to change this loop accordingly
  for (let index = 0; index < names.length - 2; index++) {
    const name = names[index]
    const ul = lists[index]
    const [...list] = $(ul)
      .find('li')
      .map((_, e) => $(e).text().trim())
    const weight = list.shift()
    tiers.push({
      name,
      volumes: list.map((vt) => parseExpression(vt)),
      order: index,
      weight: parseExpression(weight || ''),
    })
  }

  //   Oversize Special Handling
  // An additional fee will be applied to large-screen televisions* and other products that meet these criteria:

  // exceed 270 cm on the longest side; or
  // Exceed 419 cm for the longest side + 2x height + 2x width; or
  // exceed an outbound shipping weight of 69 kg
  // *Large-screen televisions refer to TVs with screens 106.7 cm or larger. However, smaller televisions could qualify for the Special Handling surcharge based on other factors such as weight and how delicate the TV is.
  if (names.length === 4) {
    // According the third lists, calculate the third and forth tier
    const [...list] = $(lists[2])
      .find('li')
      .map((_, e) => $(e).text().trim())
    if (list.length === 3) {
      let weight: ICalculateUnit = { ...empty }
      // The first line is for longest side
      const longSide = parseOversizeSpecialExpression(list[0])
      // The second line is for length+Girth
      const lengthGirth = parseOversizeSpecialExpression(list[1])
      // The third line is for weight
      const weightAndUnit = list[2].match(/\d+(\.\d+)?|(kg|lb)/g)
      if (weightAndUnit?.length === 2) {
        weight.value = parseFloat(weightAndUnit[0])
        weight.unit = weightAndUnit[1]
        weight.operator = '>'
      }
      tiers.push(
        {
          name: names[2],
          volumes: [{ ...longSide, operator: '<=' }, empty, empty],
          order: 2,
          weight: { ...weight, operator: '<=' },
          lengthGirth: { ...lengthGirth, operator: '<=' },
        },
        {
          name: names[3],
          volumes: [longSide, empty, empty],
          order: 3,
          weight,
          lengthGirth,
        }
      )
    }
  } else {
    // TODO: Warning! Tha page layout is not fit this parser!
  }
  return tiers
}
const dimensionalWeightTiersMap: Record<string, Array<string>> = {
  Envelope: ['Envelope'],
  Standard: ['Standard-Size'],
}
export function parseDimensionalWeight(content: string) {
  const empty = { value: NaN, unit: NotAvailable }
  const parseExpression = (text: string): { tierName: string; roundingUpUnit: ICalculateUnit } | undefined => {
    const values = text.split(' ')
    if (values.length < 4) return
    const value = parseFloat(values[0])
    const unit = values[1]
    const operator = '>='
    return { tierName: values[3] as string, roundingUpUnit: { value, operator, unit } }
  }
  const weightConstraints: IDimensionalWeightConstraint[] = []
  const divisorText = content.match(/divided by \d+(,\d+)*(\.\d+)?/)
  const divisorArray = divisorText && divisorText.length > 0 && divisorText[0].split(' ')
  const roundingUpArray = content.match(/\d+(\.\d*)? (g|kg) for \S+/g)
  if (roundingUpArray && roundingUpArray.length > 0) {
    for (const text of roundingUpArray) {
      const item = parseExpression(text)
      if (item) {
        const tierName = item.tierName
        const standardTierNames = dimensionalWeightTiersMap[tierName]
        weightConstraints.push({ tierName, standardTierNames, roundingUpUnit: item.roundingUpUnit })
      }
    }
  }
  return {
    weightConstraints,
    divisor: divisorArray && divisorArray.length === 3 ? parseFloat(divisorArray[2].replaceAll(',', '')) : 1,
  }
}

export function parseFba() {}

export function parseReferral() {}
export function parseClosing() {}
