import cheerio from 'cheerio'
import { NotAvailable } from '@src/service/constants'
import { minify } from '@src/service/utils'
import { ICalculateUnit, IMeasureUnit, StringRecord, Nullable } from '@src/types'
import {
  ITier,
  IDimensionalWeightConstraint,
  IPackagingWeightItem,
  IPackagingWeight,
  IShippingWeight,
  IFulfillmentFixedUnitFee,
  IFulfillmentAdditionalUnitFee,
  IFbaItem,
  IReferralItem,
  IReferralRateFee,
  IClosing,
} from '@src/types/rules'

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
const standardTiersMap: Record<string, Array<string>> = {
  Envelope: ['Envelope'],
  Standard: ['Standard-Size'],
  Oversize: ['Oversize', 'Oversize Special'],
}
export function parseDimensionalWeight(content: string) {
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
    roundingUpArray.forEach((text) => {
      const item = parseExpression(text)
      if (item) {
        const tierName = item.tierName
        const standardTierNames = standardTiersMap[tierName]
        weightConstraints.push({ tierName, standardTierNames, roundingUpUnit: item.roundingUpUnit })
      }
    })
  }
  return {
    weightConstraints,
    divisor: divisorArray && divisorArray.length === 3 ? parseFloat(divisorArray[2].replaceAll(',', '')) : 1,
  }
}

const shippingWeightTiersMap: Record<string, Array<string>> = {
  envelope: ['Envelope'],
  standard: ['Standard-Size'],
  oversize: ['Oversize', 'Oversize Special'],
}
export function parsePackagingWeight(content: string) {
  const empty = { value: NaN, unit: NotAvailable }
  const parseExpression = (
    text: string
  ): { tierName: string; packagingWeightItem: IPackagingWeightItem } | undefined => {
    const values = text.split(' ')
    if (values.length < 6) return
    const value = parseFloat(values[0])
    const unit = values[1]
    return {
      tierName: values[5] as string,
      packagingWeightItem: { packagingWeight: { value, unit }, weightConstraint: empty, description: text },
    }
  }
  const parseUnit = (text: string): IMeasureUnit | undefined => {
    const values = text.split(' ')
    if (values.length < 2) return
    const value = parseFloat(values[0])
    const unit = values.length < 2 ? NotAvailable : values[1]
    return { value, unit }
  }
  const packagingItems: IPackagingWeight[] = []
  const paragraphs = content.substring(0, content.length - 1).split('.')
  // There sould be two centences. The first one is for envelope and oversize and the second one is for standard
  if (paragraphs.length === 2) {
    const first = paragraphs[0]
    const expressions = first.match(/\d+(,\d+)*(\.\d+)? (g|kg) is used for \S*/g)
    expressions?.forEach((expression) => {
      const item = parseExpression(expression)
      if (item) {
        const tierName = item.tierName
        const standardTierNames = shippingWeightTiersMap[tierName]
        packagingItems.push({ tierName, standardTierNames, items: [item.packagingWeightItem] })
      }
    })
    // `For standard shipments, a packaging weight of 40 g is used for items less than 250 g, 60 g for items between 250 and 500 g, and 125 g for packages over 500 g.`
    const second = paragraphs[1]
    const tierName = 'standard'
    const standardTierNames = shippingWeightTiersMap[tierName]
    const packagingWeightItems: IPackagingWeightItem[] = []
    second.split(',').forEach((text) => {
      const values = text.match(/\d+(,\d+)*(\.\d+)?( g|kg)?/g)
      let isIntervalValue = text.includes('over')
      // text `60 g for items between 250 and 500 g`, just use the first and the third
      if (values?.length === 3) {
        values.splice(1, 1)
      }
      if (values?.length === 2) {
        const packagingWeight = parseUnit(values[0])
        const weightConstraint = parseUnit(values[1])
        if (packagingWeight && weightConstraint)
          packagingWeightItems.push({
            packagingWeight,
            weightConstraint: { ...weightConstraint, operator: isIntervalValue ? '>' : '<=' },
            description: text,
          })
      }
    })
    packagingItems.push({ tierName, standardTierNames, items: packagingWeightItems })
  }
  return packagingItems
}

export function parseShippingWeight(content: string): IShippingWeight[] {
  const expressions = content.match(/\d+(,\d+)*(\.\d+)?( g|kg) for \S+/g)
  const items: IShippingWeight[] = []
  const parseExpression = (text: string): { tierName: string; roundingUp: IMeasureUnit } | undefined => {
    const values = text.split(' ')
    if (values.length < 4) return
    const value = parseFloat(values[0])
    const unit = values[1]
    const tierName = values[3]
    return { tierName, roundingUp: { value, unit } }
  }
  expressions?.forEach((expression) => {
    const item = parseExpression(expression)
    if (item) {
      const tierName = item.tierName
      const standardTierNames = shippingWeightTiersMap[tierName]
      items.push({ ...item, standardTierNames, useGreater: true })
    }
  })
  return items
}
export function parseFba(content: string) {
  const determineTier = (sizeTierName: string) => {
    const tierName = sizeTierName
    return {
      tierName,
      isApparel: false,
      isDangerous: false,
      standardTierNames: standardTiersMap[tierName],
    }
  }

  const parseShippingAndFeeCell = (
    shippingWeightContent: string,
    fulfillmentFeeContent: string
  ): [IFulfillmentFixedUnitFee | IFulfillmentAdditionalUnitFee, string] | undefined => {
    const fees = fulfillmentFeeContent.match(/CAD \$|\d+(,\d+)?(\.\d+)?/g)
    const fee =
      fees && fees.length === 2 ? { value: parseFloat(fees[1]), currency: fees[0] } : { value: NaN, currency: '' }
    const array = shippingWeightContent.match(/\d+(,\d+)?(\.\d+)?|(g|kg)/g)
    if (array && array?.length > 1) {
      const v1 = parseFloat(array[0].replace(',', ''))
      const unit = array.length === 2 ? array[1] : array[2]
      if (array.length === 2) {
        if (shippingWeightContent.includes('Each')) {
          return [
            {
              shippingWeight: { value: v1, unit },
              fee,
              shippingWeightText: shippingWeightContent,
            },
            'IFulfillmentAdditionalUnitFee',
          ]
        } else if (shippingWeightContent.includes('First')) {
          return [
            {
              minimumShippingWeight: { value: 0, unit, operator: '>' },
              maximumShippingWeight: { value: v1, unit, operator: '<=' },
              fee,
              shippingWeightText: shippingWeightContent,
            },
            'IFulfillmentFixedUnitFee',
          ]
        }
      } else if (array.length === 3) {
        const v2 = parseFloat(array[1].replace(',', ''))
        return [
          {
            minimumShippingWeight: { value: v1, unit, operator: '>' },
            maximumShippingWeight: { value: v2, unit, operator: '<=' },
            fee,
            shippingWeightText: shippingWeightContent,
          },
          'IFulfillmentFixedUnitFee',
        ]
      }
    }
  }
  const fbaRuleItems: IFbaItem[] = []
  const $ = cheerio.load(content)
  let fixedUnitFees: IFulfillmentFixedUnitFee[] = []
  let additionalUnitFee: IFulfillmentAdditionalUnitFee
  let currentProductTierKey: string
  const rows = $('.help-table tbody tr')
  rows.each((rowIndex, tr) => {
    if (rowIndex > 0) {
      const cells = $(tr)
        .find('td')
        .map((_, cell): string => $(cell).text().trim())
      const [column1, column2, column3] = cells
      if (column3 && currentProductTierKey) {
        const tierData = determineTier(currentProductTierKey)
        fbaRuleItems.push({
          ...tierData,
          additionalUnitFee,
          fixedUnitFees,
        })
        fixedUnitFees = []
      }

      let shippingWeightText = column1
      let fulfillmentFeeText = column2
      if (column3) {
        currentProductTierKey = column1.split(' ').shift() || 'unknown'
        shippingWeightText = column2
        fulfillmentFeeText = column3
        fixedUnitFees = []
      }
      const result = parseShippingAndFeeCell(shippingWeightText, fulfillmentFeeText)
      if (result && result[1] === 'IFulfillmentFixedUnitFee') {
        fixedUnitFees.push(result[0])
      } else if (result && result[1] === 'IFulfillmentAdditionalUnitFee') {
        additionalUnitFee = result[0]
      }
    }
    if (rowIndex === rows.length - 1) {
      // push the last one item
      const tierData = determineTier(currentProductTierKey)
      fbaRuleItems.push({
        ...tierData,
        additionalUnitFee,
        fixedUnitFees,
      })
    }
  })
  return fbaRuleItems
}

export function parseReferral(content: string, subContent?: StringRecord) {
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
    const [category, excludingCategories, includingCategories] = parseCategory(
      $($(nameEle).contents().get(0)).text().trim() || $(nameEle).text()
    )
    const [currency, feeValue] = $(miniFeeEle).text().split('$')
    referralRule.push({
      category,
      // TODO , need by country diff handle
      isOther: [minify('Everything else')].includes(minify(category)),
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

  const injectReferralNames = ['Sports Collectibles']
  const injectReferralRules = referralRule.filter((r) => injectReferralNames.includes(r.category))
  injectReferralRules.forEach((r) => {
    // https://sellercentral.amazon.ca/gp/help/external/200800780?language=en_CA&ref=efph_200800780_cont_200336920
    // For example, if the total sales price is $500, the referral fee is calculated as follows: $20 (for the first $100 of the total sales price) plus $40 (for the remaining $400 of the total sales price) for a total referral fee of $60.
    r.rateItems =
      {
        'Sports Collectibles': [
          {
            minimumPrice: 0,
            maximumPrice: 100,
            rate: 0.2,
            description: 'Category Requirements for referral fees',
          },
          {
            minimumPrice: 100,
            maximumPrice: Number.MAX_VALUE,
            rate: 0.4,
            description: 'Category Requirements for referral fees',
          },
        ],
      }[r.category] || []
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
      const description = $(element).find('span').text()
      const array = description.match(/(\d+(,\d+)*(\.\d*)?)/g)

      if (array && array?.length > 1) {
        let rate = parseInt(array[0], 10) / 100
        let priceV1 = parseFloat(array[1].replaceAll(',', ''))
        let priceV2 = parseFloat(array[2]?.replaceAll(',', ''))
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
export function parseClosing(content: Nullable<string>): IClosing[] {
  if (!content) return []
  const $ = cheerio.load(content)
  const text = $($($('.help-content:eq(0)')).find('div p')).text()
  const array = text.match(/CAD\s\$\d+(\.\d*)?/)
  const fee = array && array?.length > 0 ? array[0].split('$') : ['CAD', '0']

  // TODO Text parsing comes with great difficulties
  const coreStringKey = 'categories are'
  const begin = text.indexOf(coreStringKey) + coreStringKey.length
  const categoryNames = text.substring(begin) + 1
  const names = categoryNames.split(', ')
  if (names[names.length - 1].indexOf('and') > -1) {
    names[names.length - 1] = names[names.length - 1].substring(4)
  }
  return [
    {
      categories: names,
      fee: parseFloat(fee[1]),
      currency: fee[0].trim(),
    },
  ]
}
