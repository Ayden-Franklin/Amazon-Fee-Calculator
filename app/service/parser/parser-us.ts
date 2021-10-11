import cheerio from 'cheerio'
import { NotAvailable } from '@src/service/constants'
import { ICalculateUnit, IFeeUnit, IMeasureUnit, Nullable, StringRecord } from '@src/types'
import {
  IApparel,
  IClosing,
  IDimensionalWeight,
  IFbaItem,
  IFulfillmentAdditionalUnitFee,
  IFulfillmentFixedUnitFee,
  IReferralItem,
  IReferralRateFee,
  IShippingWeight,
  ITier,
} from '@src/types/rules'

function parseTier(content: string): ITier[] {
  const $ = cheerio.load(content)
  const tiers: ITier[] = []

  const parseExpression = (text: string): ICalculateUnit => {
    if (text === NotAvailable) return { value: NaN, unit: NotAvailable }
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
    const value = isNaN(unknownValue) ? (unknownV1 === NotAvailable ? NaN : parseFloat(unknownV2)) : unknownValue
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
const dimensionalTiersMap: Record<string, Array<string>> = {
  oversize: ['Small oversize', 'Medium oversize', 'Large oversize'],
}
function parseDimensionalWeight(content: string): IDimensionalWeight {
  const $ = cheerio.load(content)
  const divisorText = content.match(/divided by \d+(\.\d+)?/)
  const divisorArray = divisorText && divisorText.length > 0 && divisorText[0].split(' ')
  const minimumWeightText = content.match(/\d+(\.\d*)? (inches|cm)/)
  const minimumWeightArray = minimumWeightText && minimumWeightText.length > 0 && minimumWeightText[0].split(' ')
  const minimumWeightValue =
    minimumWeightArray && minimumWeightArray.length === 2 ? parseFloat(minimumWeightArray[0]) : 0
  const minimumWeightUnit = minimumWeightArray && minimumWeightArray.length === 2 ? minimumWeightArray[1] : 'inches'
  return {
    volumeConstraints: [
      {
        tierName: 'oversize', // TODO: parse this name
        standardTierNames: dimensionalTiersMap.oversize,
        roundingUpUnit: {
          value: minimumWeightValue,
          unit: minimumWeightUnit,
          operator: '>=',
        },
      },
    ],
    divisor: divisorArray && divisorArray.length === 3 ? parseFloat(divisorArray[2]) : 1,
  }
}
const shippingTiersMap: Record<string, Array<string>> = {
  'Standard size': ['Small standard-size', 'Large standard-size'],
  Oversize: ['Small oversize', 'Medium oversize', 'Large oversize'],
  'Special oversize': ['Special oversize'],
}
function parseShippingWeight(content: string): IShippingWeight[] {
  const empty = { value: NaN, unit: NotAvailable }
  const $ = cheerio.load(content)
  const items: IShippingWeight[] = []
  const parseOperator = (s: string) => {
    switch (s.toLowerCase()) {
      case 'or less':
        return '<='
      case 'more than':
        return '>'
      default:
        return s
    }
  }
  const parseTierAndWeight = (text: string): ICalculateUnit => {
    const values = text.split(' ')
    if (values.length < 4) return empty
    let operator = NotAvailable
    let value = parseFloat(values[0])
    let unit = 'lb' // TODO: Suppose the default unit is lb
    // match '0.75 lb or less'
    if (!isNaN(value)) {
      operator = parseOperator(`${values[2]} ${values[3]}`)
      unit = values[1]
    } else if (!isNaN(parseFloat(values[2]))) {
      value = parseFloat(values[2])
      operator = parseOperator(`${values[0]} ${values[1]}`)
      unit = values[3]
    }
    return { value, operator, unit }
  }

  const parseExpression = (
    text: string
  ): { tierName: string; standardTierNames: string[]; weightConstraint: ICalculateUnit } => {
    const leftIndex = text.indexOf('(')
    if (leftIndex > -1) {
      const tierName = text.substring(0, leftIndex).trim()
      const standardTierNames = shippingTiersMap[tierName]
      const weightExpression = text.substring(leftIndex + 1, text.length - 1)
      const weightConstraint = parseTierAndWeight(weightExpression)
      return {
        tierName,
        standardTierNames,
        weightConstraint,
      }
    } else {
      const tierName = text.trim()
      const standardTierNames = shippingTiersMap[tierName]
      return {
        tierName: tierName,
        standardTierNames,
        weightConstraint: {
          value: NaN,
          unit: NotAvailable,
        },
      }
    }
  }
  // TODO this should be an array
  let roundingUp = empty
  $('tbody tr').each((rowIndex, element) => {
    if (rowIndex === 0) {
      roundingUp = {
        unit: 'lb',
        value: 1,
      }
    } else {
      const [tierElement, shippingWeightElement] = $(element).find('td')
      const { tierName, standardTierNames, weightConstraint } = parseExpression($(tierElement).text())
      const shippingWeight = $($(shippingWeightElement).contents().get(0)).text()
      const useGreater = shippingWeight !== 'Unit weight'
      items.push({
        tierName,
        standardTierNames,
        weightConstraint,
        useGreater,
      })
    }
  })
  return items
}
const fbaProductTiersMap: Record<
  string,
  Record<string, { tierName: string; isApparel: boolean | typeof NotAvailable; isDangerous: boolean }>
> = {
  'Most products (non-dangerous goods, non-apparel)': {
    'Small standard': {
      tierName: 'Small standard-size',
      isApparel: false,
      isDangerous: false,
    },
    'Large standard': {
      tierName: 'Large standard-size',
      isApparel: false,
      isDangerous: false,
    },
  },
  Apparel: {
    'Small standard': {
      tierName: 'Small standard-size',
      isApparel: true,
      isDangerous: false,
    },
    'Large standard': {
      tierName: 'Large standard-size',
      isApparel: true,
      isDangerous: false,
    },
  },
  'Dangerous goods': {
    'Small standard': {
      tierName: 'Small standard-size',
      isApparel: false,
      isDangerous: true,
    },
    'Large standard': {
      tierName: 'Large standard-size',
      isApparel: false,
      isDangerous: true,
    },
  },
  'Non-dangerous goods (both apparel and non-apparel)': {
    'Small oversize': {
      tierName: 'Small oversize',
      isApparel: NotAvailable,
      isDangerous: false,
    },
    'Medium oversize': {
      tierName: 'Medium oversize',
      isApparel: NotAvailable,
      isDangerous: false,
    },
    'Large oversize': {
      tierName: 'Large oversize',
      isApparel: NotAvailable,
      isDangerous: false,
    },
    'Special oversize': {
      tierName: 'Special oversize',
      isApparel: NotAvailable,
      isDangerous: false,
    },
  },
  'Dangerous goods (both apparel and non-apparel)': {
    'Small oversize': {
      tierName: 'Small oversize',
      isApparel: NotAvailable,
      isDangerous: true,
    },
    'Medium oversize': {
      tierName: 'Medium oversize',
      isApparel: NotAvailable,
      isDangerous: true,
    },
    'Large oversize': {
      tierName: 'Large oversize',
      isApparel: NotAvailable,
      isDangerous: true,
    },
    'Special oversize': {
      tierName: 'Special oversize',
      isApparel: NotAvailable,
      isDangerous: true,
    },
  },
}
function parseFba(content: string) {
  const determineTier = (productType: string, sizeTierName: string) => {
    return fbaProductTiersMap[productType][sizeTierName]
  }

  const parseShippingCell = (content: string): ICalculateUnit[] => {
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
          operator: '>',
        },
        {
          unit: unit,
          value: num[1],
          operator: '<=',
        },
      ]
    } else {
      return []
    }
  }
  const parseAdditionalUnitFee = (text: string): [IMeasureUnit, IFeeUnit] | undefined => {
    const array = text.split('/')
    if (array.length === 2) {
      return [
        {
          value: 1,
          unit: array[1],
        },
        {
          value: parseFloat(array[0]),
          currency: '$',
        },
      ]
    }
  }
  const parseFulfillmentFeePerUnit = (
    content: string
  ): [IFeeUnit, IFulfillmentAdditionalUnitFee?, number?] | undefined => {
    const array = content.match(/\d+(\.\d+)?(\/lb)?/g)
    if (array && array.length > 0) {
      let fixedUnitFee = { value: parseFloat(array[0]), currency: '$' }
      let additionalUnitFee: IFulfillmentAdditionalUnitFee | undefined
      // There should be 1 or 2 or 3 numbers
      if (array.length === 1) {
        return [fixedUnitFee]
      } else {
        let firstWeightAmount = 1
        if (array.length === 3) {
          firstWeightAmount = parseFloat(array[2])
        }
        const additionalUnitFeeResult = parseAdditionalUnitFee(array[1])
        if (additionalUnitFeeResult && additionalUnitFeeResult.length === 2) {
          additionalUnitFee = {
            shippingWeight: additionalUnitFeeResult[0],
            fee: additionalUnitFeeResult[1],
            shippingWeightText: content,
          }
        }
        return [fixedUnitFee, additionalUnitFee, firstWeightAmount]
      }
    }
  }
  const fbaRuleItems: IFbaItem[] = []
  const $ = cheerio.load(content)
  let fixedUnitFees: IFulfillmentFixedUnitFee[] = []
  let additionalUnitFee: IFulfillmentAdditionalUnitFee
  let currentProductTypeKey: string
  let currentProductTierKey: string
  const rows = $('.help-table tbody tr')
  rows.each((rowIndex, tr) => {
    const cells = $(tr)
      .find('td')
      .map((_, cell): string => $(cell).text())
    const [column1, column2, column3, column4] = cells
    if (column1 !== 'Product type') {
      if (column3 && currentProductTypeKey && currentProductTierKey) {
        const tierData = determineTier(currentProductTypeKey, currentProductTierKey)
        fbaRuleItems.push({
          ...tierData,
          additionalUnitFee,
          fixedUnitFees,
        })
        fixedUnitFees = []
      }

      let shippingWeightText = column1
      let fulfillmentFee = column2
      if (column4) {
        currentProductTypeKey = column1
        currentProductTierKey = column2
        shippingWeightText = column3
        fulfillmentFee = column4
      } else if (column3) {
        currentProductTierKey = column1
        shippingWeightText = column2
        fulfillmentFee = column3
        fixedUnitFees = []
      }
      const shippingWeightResult = parseShippingCell(shippingWeightText)
      const minimumShippingWeight = shippingWeightResult[0]
      const maximumShippingWeight = shippingWeightResult[1]
      const fulfillmentFeeResult = parseFulfillmentFeePerUnit(fulfillmentFee)
      // [firstWeightAmount, firstWeightFee, additionalUnitFee] = parseFulfillmentFeePerUnit(fulfillmentFee)
      if (fulfillmentFeeResult && fulfillmentFeeResult.length === 1) {
        fixedUnitFees.push({
          minimumShippingWeight,
          maximumShippingWeight,
          fee: fulfillmentFeeResult[0],
          shippingWeightText,
        })
      } else if (fulfillmentFeeResult && fulfillmentFeeResult.length === 3) {
        additionalUnitFee = fulfillmentFeeResult[1] as IFulfillmentAdditionalUnitFee
        // if fixedUnitFees has not any item, it is described by only one line  like `$87.93 + $0.79/lb above first 90 lbs`
        if (fixedUnitFees.length === 0) {
          fixedUnitFees.push({
            minimumShippingWeight: { unit: additionalUnitFee.shippingWeight.unit, value: 0, operator: '>' },
            maximumShippingWeight: {
              unit: additionalUnitFee.shippingWeight.unit,
              value: fulfillmentFeeResult[2] as number,
              operator: '<=',
            },
            fee: fulfillmentFeeResult[0],
            shippingWeightText,
          })
        }
        additionalUnitFee = fulfillmentFeeResult[1] as IFulfillmentAdditionalUnitFee
      }
      // console.log(' Finished a row: ')
      // console.log('                 currentProductTypeKey = ', currentProductTypeKey)
      // console.log('                 currentProductTierKey = ', currentProductTierKey)
      // console.log('                 shippingWeight = ', shippingWeight)
      // console.log('                 fulfillmentFee = ', fulfillmentFee)
      // const fulfillmentItem: IFulfillmentItem = {
      //   shippingWeightText,
      //   fee: fulfillmentFee,
      //   minimumShippingWeight,
      //   maximumShippingWeight,
      //   firstWeightAmount,
      //   firstWeightFee,
      //   additionalUnitFee,
      // }
      // fulfillmentItems.push(fulfillmentItem)
    }
    if (rowIndex === rows.length - 1) {
      // push the last one item
      const tierData = determineTier(currentProductTypeKey, currentProductTierKey)
      fbaRuleItems.push({
        ...tierData,
        additionalUnitFee,
        fixedUnitFees,
      })
    }
  })
  return fbaRuleItems
}

function parseReferral(content: string, subContent?: StringRecord) {
  const $ = cheerio.load(content)
  let referralRule: IReferralItem[] = []

  // for handle Baby Products (excluding Baby Apparel)
  const parseCategory = (fullCategory: string): [string, Array<string>, Array<string>] => {
    let excludingCategories: Array<string> = []
    let includingCategories: Array<string> = []

    const categoryMatchs = fullCategory.match(/\(.+\)/)

    if (!categoryMatchs?.length) return [fullCategory, excludingCategories, includingCategories]

    let splitCategoryIndex = categoryMatchs.index || -1
    let realCategory = fullCategory.substring(0, splitCategoryIndex).trim()

    for (const cI of categoryMatchs) {
      if (cI.includes('excluding')) {
        excludingCategories.push(
          cI
            .substring(1, cI.length - 1)
            .replace('excluding', '')
            .trim()
        )
        continue
      }
      if (cI.includes('including')) {
        includingCategories.push(
          cI
            .substring(1, cI.length - 1)
            .replace('including', '')
            .trim()
        )
        continue
      }
    }
    return [realCategory, excludingCategories, includingCategories]
  }

  $('tbody tr').each((_, tr) => {
    const [nameEle, rateEle, miniFeeEle] = $(tr).find('td')
    // eg: ["$", "8.00"]
    const [currency, feeValue] = $(miniFeeEle)
      .text()
      .split(/(\d+(.\d+)?)/)
    const [category, excludingCategories, includingCategories] = parseCategory($($(nameEle).contents().get(0)).text())
    referralRule.push({
      category,
      // TODO , need by country diff handle
      isOther: ['Everything Else'].includes(category),
      excludingCategories,
      includingCategories,
      // rangeItems: !rateOnlyOne ? parseReferralSubItem($(rateEle).toString()) : [],
      rateItems: parseReferralSubItem($(rateEle).toString()),
      minimumFee: parseFloat(feeValue) || 0,
      currency: currency?.trim().replace('--', '') || NotAvailable,
    })
  })

  const specialReferralNames = ['Full-Size Appliances']
  const specialReferralRules = referralRule.filter((r) => specialReferralNames.includes(r.category))

  specialReferralRules.forEach((r) => {
    // handle special referral
    const mifyKey = r.category.replace(/-|\s/g, '').toLowerCase()
    if (!mifyKey || !subContent || !subContent[mifyKey]) return
    const parseSubContent = subContent[mifyKey]
    // special TODO
    if (mifyKey === 'fullsizeappliances') {
      const $sub = cheerio.load(parseSubContent)
      const [inc, exc] = $sub('tbody').toArray()

      $sub(exc)
        .find('tr')
        .each((_1, tr) => {
          const [_2, productTypeEle] = $(tr).find('td')
          r.excludingCategories.push(
            ...$sub(productTypeEle)
              .text()
              .split(',')
              .map((ct) => ct?.trim())
          )
        })

      $sub(inc)
        .find('tr')
        .each((_1, tr) => {
          const [productTypeEle] = $(tr).find('td')
          r.includingCategories.push($sub(productTypeEle).text())
        })
    }
  })
  return referralRule
}

function parseReferralSubItem(content: string) {
  const $ = cheerio.load(content)
  const rateItems: IReferralRateFee[] = []
  const onlyOneRate = $('ul').length === 0

  if (onlyOneRate) {
    const description = $(content).text()

    rateItems.push({
      minimumPrice: 0,
      maximumPrice: Number.MAX_VALUE,
      rate: parseFloat(description) / 100,
      description,
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
      const description = $(element).find('span')?.text()?.replace?.(/\n\s+/g, ' ')
      const array = description?.match(/(\d+(,\d+)*(\.\d*)?)/g)

      if (array && array?.length > 1) {
        let rate = parseInt(array[0], 10) / 100
        let priceV1 = parseFloat(array[1].replace(/,/g, ''))
        let priceV2 = parseFloat(array[2]?.replace(/,/g, ''))
        // console.log('array', array, priceV1, priceV2)

        const lastRate = rateItems.length && rateItems[rateItems.length - 1]
        const minimumPrice = lastRate ? lastRate?.maximumPrice : 0
        const maximumPrice = priceV2 || (minimumPrice === priceV1 || !priceV1 ? Number.MAX_VALUE : priceV1)

        rateItems.push({
          minimumPrice,
          maximumPrice,
          rate,
          description,
        })
      }
    })

  return rateItems
}
function parseClosing(content: Nullable<string>): IClosing[] {
  if (!content) return []

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
  return [
    {
      categories: names,
      fee: parseFloat(fee.substring(1)),
      currency: fee.substring(0, 1),
    },
  ]
}

function parseApparel(content: Nullable<string>): IApparel[] {
  if (!content) return []
  /**
   * TODO
    <li>
      <span class="a-list-item">Wearable clothing items and accessories such as belts, ties, socks, hats, scarfs, ear muffs, and gloves </span>
    </li>
    <li>
      <span class="a-list-item">Adult and children’s costumes and accessories such as masks and ear coverings </span>
    </li>
    <li>
      <span class="a-list-item">Baby apparel </span>
    </li>
    <li>
      <span class="a-list-item">Sports activewear such as running socks, yoga pants, and sports uniforms</span>
    </li>
   * 
   */
  return [
    { matchCategory: 'Clothing', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Clothing', requireParent: ['Sports & Outdoors'] },
    { matchCategory: 'Belts', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Neckties', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Bow Ties', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Cravats', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Cummerbunds', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Tie Sets', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Hats & Caps', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Scarves & Wraps', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Lab, Safety & Work Gloves', requireParent: ['Hand & Arm Protection'] },
    { matchCategory: 'Costumes', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Costumes', requireParent: ['Dress Up & Pretend Play'] },
    { matchCategory: 'Footwear', requireParent: ['Clothing, Shoes & Jewelry'] },
    { matchCategory: 'Masks', requireParent: ['Clothing, Shoes & Jewelry'] },
  ]
}

export default {
  parseTier,
  parseDimensionalWeight,
  parseShippingWeight,
  parseFba,
  parseReferral,
  parseClosing,
  parseApparel,
}
