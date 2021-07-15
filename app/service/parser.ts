import cheerio from 'cheerio'
import { ProductTierItem, TierItem, FulfillmentItem } from '@src/types/fba'
import { ReferralRangeFeeItem, ReferralFeeItem } from '@src/types/referral'
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
    let productTypeMap = new Map()
    fbaRule[ruleName] = productTypeMap
    let productTierMap: Map<string, FulfillmentItem[]> = new Map()
    let currentProductTypeKey: string
    let currentProductTierKey: string
    $(e)
      .find('tr')
      .each((rowIndex, tr) => {
        let shippingWeight: string
        let fulfillmentFee: string
        let offset = 0
        if (rowIndex > 1) {
          $(tr)
            .find('td')
            .each((index, element) => {
              console.log('============== begin to parse fba cell, row: ', rowIndex, 'column', index)
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
                  console.log('Find Product Type: ', $(element).find('strong').text())
                  // names.push($(element).find('strong').text())
                  currentProductTypeKey = $(element).find('strong').text()
                }
              } else if (columnIndex === 1) {
                // console.log('check rowColumnSkipFlag ', 'row', rowIndex, ' column', columnIndex, 'it is for  sizeTiers', rowColumnSkipFlag[columnIndex] === 0)
                console.log('Find Size Tier: ', $(element).text())
                // sizeTiers.push($(element).text())
                currentProductTierKey = $(element).text()
              } else if (columnIndex === 2) {
                // console.log('get the text at ', 'row', rowIndex, ' column', columnIndex, '=============== value', $(element).text())
                // shippingWeight.push($(element).text())
                shippingWeight = $(element).text()
              } else if (columnIndex === 3) {
                // console.log('get the text at ', 'row', rowIndex, ' column', columnIndex, '=============== value', $(element).text())
                // fulfillmentFee.push($(element).text())
                fulfillmentFee = $(element).text()
                // volumeRule[rowIndex][index - 2] = parseFloat($(element).text())
              }
            })
          console.log(' Finished a row: ')
          console.log('                 currentProductTypeKey = ', currentProductTypeKey)
          console.log('                 currentProductTierKey = ', currentProductTierKey)
          console.log('                 shippingWeight = ', shippingWeight)
          console.log('                 fulfillmentFee = ', fulfillmentFee)
          const fulfillmentItem: FulfillmentItem = {
            shippingWeight: shippingWeight,
            fee: fulfillmentFee
          }
          if (!productTierMap.has(currentProductTierKey)) {
            const value: FulfillmentItem[] = []
            productTierMap.set(currentProductTierKey, value)
          }
          // console.log(' push an item', fulfillmentItem, ' to ', currentProductTierKey)
          productTierMap.get(currentProductTierKey)?.push(fulfillmentItem)

          if (!productTypeMap.has(currentProductTypeKey)) {
            // productTierMap = new Map()
            const value = []
            productTypeMap.set(currentProductTypeKey, value)
          }
          productTypeMap.get(currentProductTypeKey)?.push(productTierMap)
        }
      })
    // console.log(productTypeMap)
  })
  console.log(fbaRule)
  return {}
}
export function parseReferral(content: string) {
  const $ = cheerio.load(content)
  let referralRule: ReferralFeeItem[] = []
  $('tbody tr').each((rowIndex, tr) => {
    let categoryName: string
    let minimumFee: number
    let determinateRate = true
    let rate: number
    let rangeItems
    $(tr)
      .find('td')
      .each((index, element) => {
        if (index === 0) {
          categoryName = $(element).text()
        } else if (index === 1) {
          if (element.children.length === 1) {
            rate = parseFloat($(element).text())/100
          } else {
            determinateRate = false
            rangeItems = praseReferralSubItem(element)
          }
        } else if (index === 2) {
          minimumFee = parseFloat($(element).text().substring(1))
        }
      })
      referralRule.push({
        categoriy: categoryName,
        determinateRate: determinateRate,
        rate: rate,
        rangeItems: rangeItems,
        minimumFee: minimumFee,
      })
  })
  return referralRule
}
function praseReferralSubItem(content) {
  const $ = cheerio.load(content)
  let rangeItems: ReferralRangeFeeItem[] = []
  $(content).find('li').each((index, element) => {
    const text = $(element).find('span').text()
    const array = text.match(/(\d+(,\d+)?(\.\d*)?)/g)
    if (array?.length > 1) {
      rangeItems.push({
        price: parseFloat(array[1]),
        rate: parseInt(array[0])
      })
    }
  })
  return rangeItems
}
export function parseClosing(content: string) {
  const $ = cheerio.load(content)
  $('.help-content').each((index, element) => {
    if (index === 1) {
      const p = $(element).find('div p')
      const text = $(p).text()
      const array = text.match(/\$\d+(\.\d*)?/)
      const fee = array?.length > 0 ? array[0] : 0

      const begin = text.indexOf('in the ') + 7
      const end = text.lastIndexOf(' categories')
      const categoryNames = text.substring(begin, end)
      const names = categoryNames.split(', ')
      if (names[names.length - 1].indexOf('and') > -1) {
        names[names.length - 1] = names[names.length - 1].substring(4)
      }
      return {
        category: names,
        fee: parseFloat(fee)
      }
    }
  })
}
