import cheerio from 'cheerio'
export function parseTiers_old(content: string) {
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
          names.push($(element).find('strong').text().trim())
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

export function parseTier(content: string) {
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
  const parseExpression = (text: string): Iu => {
    const values = text.split(' ')
    if (values.length < 4) return { value: 0, unit: null }
    const value = parseFloat(values[0])
    const unit = values[1]
    const operator = parseOperator(`${values[2]} ${values[3]}`)
    return { value, operator, unit }
  }

  const parseOversizeSpecialExpression = (text: string): Iu => {
    const values = text.split(' ')
    if (values.length < 3) return { value: 0, unit: null }
    const value = parseFloat(values[1])
    const unit = values[2]
    const operator = parseOperator(values[0])
    return { value, operator, unit }
  }
  const [...names] = $('div')
    .find('p strong')
    .map((_, e) => $(e).text())
  names.push($('h2:eq(1)').text().replace(' Handling',''))
  console.log('found names: = ', names)
  const lists = $('div').find('ul')
  console.log('found lists: = ', lists)
  // TODO: If the page layout changed, we have to change this loop accordingly
  for (let index = 0; index < names.length - 2; index++) {
    const name = names[index]
    const ul = lists[index]
    console.log('parse for ', name, ' li is ', ul)
    const [...list] = $(ul)
      .find('li')
      .map((_, e) => $(e).text().trim())
    console.log('get li for ', name, ' they are ', list)
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
      let weight: Iu = { value: 0, unit: null }
      // The first line is for longest side
      const longSide = parseOversizeSpecialExpression(list[0])
      // The second line is for length+Girth
      const lengthGirth = parseOversizeSpecialExpression(list[1])
      // The third line is for weight
      console.log('weight for oversize special = ', list[2])
      const weightAndUnit = list[2].match(/\d+(\.\d+)?|(kg|lb)/g)
      console.log('matched weight ', weightAndUnit)
      if (weightAndUnit?.length === 2) {
        weight.value = parseFloat(weightAndUnit[0])
        weight.unit = weightAndUnit[1]
        weight.operator = '>'
      }
      tiers.push(
        {
          name: names[2],
          volumes: [{ ...longSide, operator: '<=' }],
          order: 2,
          weight: { ...weight, operator: '<=' },
          lengthGirth: { ...lengthGirth, operator: '<=' },
        },
        {
          name: names[3],
          volumes: [longSide],
          order: 3,
          weight,
          lengthGirth,
        }
      )
    }
  } else {
    // TODO: Warning! Tha page layout is not fit this parser!
  }
  console.log('finished to pase. tuers = ', tiers)
  // names.forEach((name, index) => {
  //   console.log('parse for ', name)
  //   const ul = lists[index]
  //   console.log('parse for ', name, ' li is ', ul)
  //   const [...list] = $(ul)
  //     .find('li')
  //     .map((_, e) => $(e).text().trim())
  //   console.log('get li for ', name, ' they are ', list)
  //   const weight = list.shift()
  //   tiers.push({
  //     name,
  //     volumes: list.map((vt) => parseExpression(vt)),
  //     order: index,
  //     weight: parseExpression(weight || ''),
  //   })
  // })
  $('div')
    .children()
    .each((index, element) => {
      console.log('element ', index, ' = ', element)
      if (index === 4) {
        console.log('name = ', $(element).find('strong').text())
      }
      // Product size tier	Unit weight*	Longest side	Median side	Shortest side	Length + girth
      // const [name, weight, ...volumesAndLengthGirth] = $(element)
      //   .find('td')
      //   .map((_, e) => $(e).text())
      // const lengthGirth = volumesAndLengthGirth.pop()
      // const volumes = volumesAndLengthGirth

      // tiers.push({
      //   name: name.trim(),
      //   volumes: volumes.map((vt) => parseFragment(vt)),
      //   order: rowIndex,
      //   weight: parseFragment(weight),
      //   lengthGirth: parseFragment(lengthGirth || ''),
      // })
    })
  return tiers
}

export function parseWeight() {}

export function parseFba() {}

export function parseReferral() {}
export function parseClosing() {}
