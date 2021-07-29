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

export function parseReferral(content: string, subContent?: StringRecord) {
  const $ = cheerio.load(content)
  let referralRule: IReferralFee[] = []

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
    console.log(
      '$(miniFeeEle).text()',
      $(miniFeeEle).text(),
      $(miniFeeEle)
        .text()
        .replace(/(CAD)|$/g, '')
    )
    referralRule.push({
      category,
      // TODO , need by country diff handle
      otherable: ['Everything Else'].includes(category),
      excludingCategories,
      includingCategories,
      // rangeItems: !rateOnlyOne ? parseReferralSubItem($(rateEle).toString()) : [],
      rateItems: parseReferralSubItem($(rateEle).toString()),
      minimumFee:
        parseFloat(
          $(miniFeeEle)
            .text()
            .replace(/CAD|\$/g, '')
        ) || 0,
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
  const rateItems: IReferralRateFeeItem[] = []
  const onlyOneRate = $('ul').length === 0

  if (onlyOneRate) {
    const desc = $(content).text()
    console.log('desc', desc, parseFloat(desc) / 100)
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
      const array = desc.match(/(\d+(,\d+)*(\.\d*)?)/g)

      if (array && array?.length > 1) {
        let rate = parseInt(array[0], 10) / 100
        let priceV1 = parseFloat(array[1].replaceAll(',', ''))
        let priceV2 = parseFloat(array[2]?.replaceAll(',', ''))
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
export function parseClosing(content: Nullable<string>): IClosingRule[] {
  if (!content) return []

  const $ = cheerio.load(content)
  const table = $('.help-content:eq(0)')
  const p = $(table).find('div p')
  const text = $(p).text()
  const array = text.match(/\$\d+(\.\d*)?/)
  const fee = array && array?.length > 0 ? array[0] : '$0'

  // TODO
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
      fee: parseFloat(fee.substring(1)),
    },
  ]
}
