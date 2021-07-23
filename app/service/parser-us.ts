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

  const parseExpression = (text: string): Iu => {
    if (text === 'n/a') return { value: NaN, unit: 'n/a' }
    const parseOperator = (s: string) => {
      switch (s.toLowerCase()) {
        case 'over':
          return '>'
        default:
          return s
      }
    }

    const array = text.split(' ')
    const [unknownV1, unknownV2, unknownV3] = array
    const unknownValue = parseFloat(unknownV1)
    const value = isNaN(unknownValue) ? (unknownV1 === 'n/a' ? NaN : parseFloat(unknownV2)) : unknownValue
    const operator = parseOperator(isNaN(unknownValue) ? unknownV1 : '<=')
    const unit = unknownV3 || unknownV2
    return { value, operator, unit }
  }

  $('tbody tr').each((rowIndex, element) => {
    // Product size tier	Unit weight*	Longest side	Median side	Shortest side	Length + girth
    const [name, weight, ...volumesAndLengthGirth] = $(element)
      .find('td')
      .map((_, e) => $(e).text())
    const lengthGirth = volumesAndLengthGirth.pop()
    const volumes = volumesAndLengthGirth

    tiers.push({
      name: name.trim(),
      volumes: volumes.map((vt) => parseExpression(vt)),
      order: rowIndex,
      weight: parseExpression(weight),
      lengthGirth: parseExpression(lengthGirth || ''),
    })
  })

  return tiers
}

export function parseWeight(content: string) {
  const $ = cheerio.load(content)
  const minimumWeightText = $('.a-vertical:eq(0)').find('li:eq(0)').find('span').text()
  const divisorText = $('.help-content:eq(1)').find('div p:eq(0)').text()
  const minimumWeight = minimumWeightText.match(/\d+(\.\d*)?/)
  const divisor = divisorText.match(/(\d+)/)
  return {
    minimumWeight: minimumWeight ? parseFloat(minimumWeight[0]) : 0,
    divisor: divisor ? parseFloat(divisor[0]) : 1,
  }
}

export function parseFba(content: string) {
  const $ = cheerio.load(content)
  type FbaRule = {
    standard: ProductTierItem[]
    oversize: ProductTierItem[]
  }
  let fbaRule: FbaRule = {}
  let ruleName: string
  $('.help-table').each((tableIndex, e) => {
    let rowSpan: number[] = []
    let rowColumnSkipFlag: number[] = []
    // let names: string[] = []
    // let sizeTiers: string[] = []
    // let shippingWeight: string[] = []
    // let fulfillmentFee: string[] = []
    //let volumeRule: number[][] = []
    //let lengthGirthRule: number[] = []
    if (tableIndex === 0) {
      ruleName = 'standard'
    } else if (tableIndex === 1) {
      ruleName = 'oversize'
    }
    // let productTierMap: {
    //   [key: string]: ProductTierItem[]
    // }
    let productTypeMap: Record<string, Record<string, FulfillmentItem[]>> = {}
    fbaRule[ruleName] = productTypeMap
    let productTierMap: Record<string, FulfillmentItem[]> = {}
    let currentProductTypeKey: string
    let currentProductTierKey: string
    $(e)
      .find('tr')
      .each((rowIndex, tr) => {
        let offset = 0
        let shippingWeight: string
        let fulfillmentFee: string
        let minimumShippingWeight: Iu
        let maximumShippingWeight: Iu
        let firstWeightFee: number
        let firstWeightAmmount: number
        let additionalUnitFee: number
        if (rowIndex > 1) {
          $(tr)
            .find('td')
            .each((index, element) => {
              // console.log('============== begin to parse fba cell, row: ', rowIndex, 'column', index)
              let columnIndex = index
              if (index === 0) {
                for (let i = 0; i < rowSpan.length; i++) {
                  if (rowColumnSkipFlag[i] !== rowSpan[i] - 1) {
                    offset++
                    columnIndex++
                    // console.log('Adjust the offset and column index to ', columnIndex)
                  }
                }
              } else if (offset > 0) {
                for (let i = 0; i < offset; i++) {
                  columnIndex++
                  // console.log('Adjust the column index to ', columnIndex)
                }
              }
              // if (rowColumnSkipFlag[columnIndex] < rowSpan[columnIndex]) {
              //   columnIndex++
              //   console.log('Adjust the column index to ', columnIndex)
              // }
              if (element.attribs['rowspan']) {
                // console.log('Important ---------, original column ', index, ' rowColumnSkipFlag[columnIndex] < rowSpan[columnIndex]', rowColumnSkipFlag[columnIndex] < rowSpan[columnIndex])
                // console.log('rowColumnSkipFlag current:', rowColumnSkipFlag.toString())
                // console.log('rowSpan current:', rowSpan.toString())
                // console.log('row', rowIndex, ' column', columnIndex, ' Has row span', parseInt(element.attribs['rowspan'], 10))
                rowSpan[columnIndex] = parseInt(element.attribs['rowspan'], 10)
                // console.log(' set rowSpan for column ', columnIndex, ' as ', rowSpan[columnIndex])
                rowColumnSkipFlag[columnIndex] = 0
                // console.log(' set rowColumnSkipFlag for column ', columnIndex, ' as 0')
                // console.log('Now rowSpan :', rowSpan.toString())
                // console.log('Now rowColumnSkipFlag :', rowColumnSkipFlag.toString())
                if (columnIndex === 0) {
                  // console.log('One productTierMap finished. reset it')
                  productTierMap = {}
                }
              }
              // if (rowColumnSkipFlag.length >= index + 1) {
              if (index === 0) {
                for (let i = 0; i < columnIndex - index; i++) {
                  // console.log(' rowColumnSkipFlag for column ', columnIndex - index, ' increase. The result is', rowColumnSkipFlag.toString())
                  rowColumnSkipFlag[i]++
                  // console.log(' rowColumnSkipFlag for column ', i, ' increase. The result is', rowColumnSkipFlag.toString())
                }
                // console.log(' rowColumnSkipFlag for column ', index, ' increase as', rowColumnSkipFlag.toString())
              }
              if (columnIndex === 0) {
                // console.log('check rowColumnSkipFlag === 0 for row', rowIndex, ' column ', columnIndex, 'it is for  productType', rowColumnSkipFlag[columnIndex] === 0)
                if (rowColumnSkipFlag[columnIndex] === 0) {
                  // console.log('Find Product Type: ', $(element).find('strong').text())
                  // names.push($(element).find('strong').text())
                  currentProductTypeKey = $(element).find('strong').text()
                }
              } else if (columnIndex === 1) {
                // console.log('check rowColumnSkipFlag ', 'row', rowIndex, ' column', columnIndex, 'it is for  sizeTiers', rowColumnSkipFlag[columnIndex] === 0)
                // console.log('Find Size Tier: ', $(element).text())
                // sizeTiers.push($(element).text())
                currentProductTierKey = $(element).text()
              } else if (columnIndex === 2) {
                // console.log('get the text at ', 'row', rowIndex, ' column', columnIndex, '=============== value', $(element).text())
                // shippingWeight.push($(element).text())
                shippingWeight = $(element).text()
                const result = parseShippingWeight(shippingWeight)
                // [minimumShippingWeight, maximumShippingWeight] = result
                minimumShippingWeight = result[0]
                maximumShippingWeight = result[1]
              } else if (columnIndex === 3) {
                // console.log('get the text at ', 'row', rowIndex, ' column', columnIndex, '=============== value', $(element).text())
                // fulfillmentFee.push($(element).text())
                fulfillmentFee = $(element).text()
                const result = parseFulfillmentFeePerUnit(fulfillmentFee)
                // volumeRule[rowIndex][index - 2] = parseFloat($(element).text())
                // [firstWeightAmmount, firstWeightFee, additionalUnitFee] = parseFulfillmentFeePerUnit(fulfillmentFee)
                firstWeightAmmount = result[0]
                firstWeightFee = result[1]
                additionalUnitFee = result[2]
              }
            })
          // console.log(' Finished a row: ')
          // console.log('                 currentProductTypeKey = ', currentProductTypeKey)
          // console.log('                 currentProductTierKey = ', currentProductTierKey)
          // console.log('                 shippingWeight = ', shippingWeight)
          // console.log('                 fulfillmentFee = ', fulfillmentFee)
          const fulfillmentItem: FulfillmentItem = {
            shippingWeight: shippingWeight,
            fee: fulfillmentFee,
            minimumShippingWeight,
            maximumShippingWeight,
            firstWeightAmmount,
            firstWeightFee,
            additionalUnitFee,
          }
          if (!productTierMap[currentProductTierKey]) {
            const value: FulfillmentItem[] = []
            productTierMap[currentProductTierKey] = value
          }
          // console.log(' push an item', fulfillmentItem, ' to ', currentProductTierKey)
          productTierMap[currentProductTierKey].push(fulfillmentItem)

          if (!productTypeMap[currentProductTypeKey]) {
            // productTierMap = new Map()
            productTypeMap[currentProductTypeKey] = []
          }
          // console.log(' push a productTierMap', productTierMap, ' to ', currentProductTypeKey)
          productTypeMap[currentProductTypeKey] = productTierMap
        }
      })
    // console.log(productTypeMap)
  })
  // console.log(fbaRule)
  return {
    standard: fbaRule.standard,
    oversize: fbaRule.oversize,
  }
}
function parseShippingWeight(content: string): Iu[] {
  const array = content.match(/\d+|oz|lb/g)
  let unit = 'lb' // TODO: Suppose the default unit is lb
  let num: number[] = []
  if (array && array?.length > 0) {
    for (const element of array) {
      if (element === 'oz' || element === 'lb') {
        unit = element
      } else {
        let value = parseInt(element, 10)
        num.push(value)
      }
    }
  }
  // There should be 1 or 2 numbers
  if (num.length === 1) {
    if (content.indexOf('less') > -1) {
      num.unshift(0)
    } else if (content.indexOf('over')) {
      num.push(Number.MAX_SAFE_INTEGER)
    }
  }
  if (num.length === 2) {
    return [
      {
        unit: unit,
        value: num[0],
      },
      {
        unit: unit,
        value: num[1],
      },
    ]
  } else {
    return []
  }
}
function parseFulfillmentFeePerUnit(content: string): number[] {
  const array = content.match(/\d+(\.\d*)?/g)
  if (array && array.length > 0) {
    let firstWeightAmmount = 1
    let firstWeightFee = 0
    let additionalUnitFee = 0
    // There should be 1 or 2 or 3 numbers
    if (array.length > 0) {
      firstWeightFee = parseFloat(array[0])
    }
    if (array.length > 1) {
      additionalUnitFee = parseFloat(array[1])
    }
    if (array.length > 2) {
      firstWeightAmmount = parseInt(array[2], 10)
    }
    return [firstWeightAmmount, firstWeightFee, additionalUnitFee]
  } else {
    return [1, 0, 0]
  }
}
export function parseReferral(content: string) {
  const $ = cheerio.load(content)
  let referralRule: ReferralFee[] = []

  // for handle Baby Products (excluding Baby Apparel)
  const parseCategory = (fullCategory: string): [string, Array<string>, Array<string>] => {
    let excludingCategorys: Array<string> = []
    let includeingCategorys: Array<string> = []

    const categoryMatchs = fullCategory.match(/\(.+\)/)

    if (!categoryMatchs?.length) return [fullCategory, excludingCategorys, includeingCategorys]

    let splitCategoryIndex = categoryMatchs.index || -1
    let realCategory = fullCategory.substring(0, splitCategoryIndex).trim()

    for (const cI of categoryMatchs) {
      if (cI.includes('excluding')) {
        excludingCategorys.push(
          cI
            .substring(1, cI.length - 1)
            .replace('excluding', '')
            .trim()
        )
        continue
      }
      if (cI.includes('including')) {
        includeingCategorys.push(
          cI
            .substring(1, cI.length - 1)
            .replace('including', '')
            .trim()
        )
        continue
      }
    }
    return [realCategory, excludingCategorys, includeingCategorys]
  }

  $('tbody tr').each((_, tr) => {
    const [nameEle, rateEle, miniFeeEle] = $(tr).find('td')

    const [category, excludingCategorys, includeingCategorys] = parseCategory($($(nameEle).contents().get(0)).text())
    referralRule.push({
      category,
      excludingCategorys,
      includeingCategorys,
      // rangeItems: !rateOnlyOne ? parseReferralSubItem($(rateEle).toString()) : [],
      rateItems: parseReferralSubItem($(rateEle).toString()),
      minimumFee: parseFloat($(miniFeeEle).text().substring(1)) || 0,
    })
  })
  return referralRule
}

function parseReferralSubItem(content: string) {
  const $ = cheerio.load(content)
  const rateItems: ReferralRateFeeItem[] = []
  const onlyOneRate = $('ul').length === 0

  if (onlyOneRate) {
    const desc = $(content).text()

    rateItems.push({
      minPrice: 0,
      maxPrice: Number.MAX_VALUE,
      rate: parseFloat(desc) / 100,
      desc,
    })

    return rateItems
  }

  /** PARSE Referral
   * <td>
   *  <ul>
   *    <li>
   *    ...
   *    </li>
   *  </ul>
   * </td>
   */
  $(content)
    .find('li')
    .each((_, element) => {
      const desc = $(element).find('span').text()
      const array = desc.match(/(\d+(,\d+)?(\.\d*)?)/g)

      if (array && array?.length > 1) {
        let rate = parseInt(array[0], 10) / 100
        let priceV1 = parseFloat(array[1].replace(',', ''))
        let priceV2 = parseFloat(array[2]?.replace(',', ''))
        // console.log('array', array, priceV1, priceV2)

        const lastRate = rateItems.length && rateItems[rateItems.length - 1]
        const minPrice = lastRate ? lastRate?.maxPrice : 0
        const maxPrice = priceV2 || (minPrice === priceV1 || !priceV1 ? Number.MAX_VALUE : priceV1)

        rateItems.push({
          minPrice,
          maxPrice,
          rate,
          desc,
        })
      }
    })

  return rateItems
}
export function parseClosing(content: string) {
  const $ = cheerio.load(content)
  const table = $('.help-content:eq(1)')
  const p = $(table).find('div p')
  const text = $(p).text()
  const array = text.match(/\$\d+(\.\d*)?/)
  const fee = array && array?.length > 0 ? array[0] : '$0'

  const begin = text.indexOf('in the ') + 7
  const end = text.lastIndexOf(' categories')
  const categoryNames = text.substring(begin, end)
  const names = categoryNames.split(', ')
  if (names[names.length - 1].indexOf('and') > -1) {
    names[names.length - 1] = names[names.length - 1].substring(4)
  }
  return {
    categories: names,
    fee: parseFloat(fee.substring(1)),
  }
}
