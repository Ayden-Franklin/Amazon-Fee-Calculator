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

  const [...names] = $('h4').map((_, e) => $(e).text())
  names.push($('p:last-child').find('strong').text())
  const envelopeText = $('p:eq(0)').text().replaceAll(/\s\s+/g, ' ')
  // Envelope size includes packaged units that weigh 500 g or less,
  // with dimensions of 38 cm or less on its longest side,
  // 27 cm or less on its median side, and 2 cm or less on   its shortest side.
  const envelopeArray = envelopeText.match(/\d+(,\d+)?(\.\d+)? (g|cm) or less/g)
  if (envelopeArray?.length === 4)
    tiers.push({
      name: names[0],
      volumes: envelopeArray.slice(1, 4).map((v) => parseExpression(v)),
      order: 0,
      weight: parseExpression(envelopeArray[0] || ''),
    })
  else {
    throw Error('Fail to parse tiers for Mexico. The page layout might have been changed.')
  }
  // TODO: If the page layout changed, we have to change this loop accordingly
  const name = names[1]
  const ul = $('ul')
  const [...list] = $(ul)
    .find('li')
    .map((_, e) => $(e).text().trim())
  const weight = list.shift()
  tiers.push({
    name,
    volumes: list.map((vt) => parseExpression(vt)),
    order: 1,
    weight: parseExpression(weight || ''),
  })

  //   Oversize Special Handling

  tiers.push({
    name: names[2],
    volumes: tiers[1].volumes.map((e) => {
      return { ...e, operator: '>' }
    }),
    order: 2,
    weight: { ...tiers[1].weight, operator: '>' },
  })

  return tiers
}

export function parseDimensionalWeight(content: string) {
  const divisorText = content.replaceAll(/\s\s+/g, ' ').match(/divided by \d+(,\d+)*(\.\d+)?/)
  const divisorArray = divisorText && divisorText.length > 0 && divisorText[0].split(' ')
  return {
    divisor: divisorArray && divisorArray.length === 3 ? parseFloat(divisorArray[2].replaceAll(',', '')) : 1,
  }
}

export function parsePackagingWeight(content: string) {
  const parseWeightExpression = (text: string): IMeasureUnit => {
    const values = text.split(' ')
    if (values.length < 2) throw Error(`Failt to parse weight expression ${text}. Expected format likes 25 g.`)
    const value = parseFloat(values[0])
    const unit = values[1]
    return { value, unit }
  }
  const parseCompareExpression = (text: string): ICalculateUnit => {
    const values = text.split(' ').map((s) => (s.includes(',') ? s.replaceAll(',', '') : s))
    const parseOperator = (s: string) => {
      switch (s.toLowerCase()) {
        case 'up to':
          return '<='
        case 'over':
          return '>'
        default:
          return s
      }
    }
    if (values.length === 2) {
      return { value: parseFloat(values[0]), unit: values[1], operator: '<=' }
    } else if (values.length === 3) {
      return { value: parseFloat(values[1]), unit: values[2], operator: parseOperator(values[0]) }
    } else if (values.length === 4) {
      return { value: parseFloat(values[2]), unit: values[3], operator: parseOperator(`${values[0]} ${values[1]}`) }
    } else {
      throw Error(
        `Fail to parse weight expression ${text}. Expected format likes '500 g' or 'up to 250 g' or 'over 1,000 g'`
      )
    }
  }
  const buildPackagingWeightItem = (
    packagingWeightText: string,
    weightConstraintText: string
  ): IPackagingWeightItem => {
    const packagingWeight = parseWeightExpression(packagingWeightText)
    const weightConstraint = parseCompareExpression(weightConstraintText)
    return { packagingWeight, weightConstraint, desc: weightConstraintText }
  }
  const packagingItems: IPackagingWeight[] = []
  const $ = cheerio.load(content)
  const text = $('p').text()
  const paragraphs = text
    .substring(0, text.length - 1)
    .split('.')
    .map((t) => t.trimLeft())
  // There sould be 3 centences. The first one is for envelope, the second one is for standard and the third one is for oversize
  paragraphs.forEach((paragraph) => {
    const expressions = paragraph.match(/(up to |over )?\d+(,\d+)*(\.\d+)? (g|kg)/g)
    let tierName: string
    if (paragraph.startsWith('For Envelope')) {
      tierName = 'Envelope'
      // For Envelope size units, a packaging weight of 25 g is used for units weighing up to 250 g, and 50 g for units between 250 g- 500 g
      if (expressions?.length === 5) {
        packagingItems.push({
          tierName,
          items: [
            buildPackagingWeightItem(expressions[0], expressions[1]),
            buildPackagingWeightItem(expressions[2], expressions[4]),
          ],
        })
      } else {
        throw Error(`Fail to parse packaging weight for Mexico. Excepted 4 elements array, but got [${expressions}]`)
      }
    } else if (paragraph.startsWith('For Standard')) {
      tierName = 'Standard'
      // For Standard size units, a packaging weight of 50 g is used for units weighing up to 250 g, 75 g for units between 250 g-500 g, and 125 g for units over 500 g
      if (expressions?.length === 7) {
        packagingItems.push({
          tierName,
          items: [
            buildPackagingWeightItem(expressions[0], expressions[1]),
            buildPackagingWeightItem(expressions[2], expressions[4]),
            buildPackagingWeightItem(expressions[5], expressions[6]),
          ],
        })
      } else {
        throw Error(`Fail to parse packaging weight for Mexico. Excepted 7 elements array, but got [${expressions}]`)
      }
    } else if (paragraph.startsWith('For Oversize')) {
      tierName = 'Oversize'
      // For Oversize units, a packaging weight of 300 g is used for units weighing up to 1,000 g, and 500 g for units over 1,000 g
      if (expressions?.length === 4) {
        packagingItems.push({
          tierName,
          items: [
            buildPackagingWeightItem(expressions[0], expressions[1]),
            buildPackagingWeightItem(expressions[2], expressions[3]),
          ],
        })
      } else {
        throw Error(`Fail to parse packaging weight for Mexico. Excepted 4 elements array, but got ${expressions}`)
      }
    }
  })
  return packagingItems
}

export function parseShippingWeight(content: string): IShippingWeight[] {
  const items: IShippingWeight[] = []
  const parseWeightExpression = (text: string): IMeasureUnit => {
    const values = text.split(' ')
    if (values.length < 2)
      throw Error(`Failt to parse weight expression ${text}. Expected format likes "nearest 500 g".`)
    const value = parseFloat(values[1])
    const unit = values[2]
    return { value, unit }
  }
  const parseCompareExpression = (text: string): ICalculateUnit => {
    const values = text.split(' ')
    const parseOperator = (s: string) => {
      switch (s.toLowerCase()) {
        case 'below':
          return '<'
        case 'above':
          return '>'
        default:
          return s
      }
    }
    if (values.length === 2) {
      const result = values[1].match(/\d+|g|kg/g)
      if (result?.length === 2)
        return { value: parseFloat(result[0]), unit: result[1], operator: parseOperator(values[0]) }
    } else if (values.length === 3) {
      return { value: parseFloat(values[1]), unit: values[2], operator: parseOperator(values[0]) }
    }
    throw Error(`Fail to parse weight expression ${text}. Expected format likes 'above 500g' or 'below 500 g'`)
  }
  const buildPackagingWeightItem = (
    tierName: string,
    weightConstraintText: string,
    roundingUpText: string
  ): { tierName: string; weightConstraint: ICalculateUnit; roundingUp: IMeasureUnit } => {
    return {
      tierName,
      weightConstraint: parseCompareExpression(weightConstraintText),
      roundingUp: parseWeightExpression(roundingUpText),
    }
  }
  const $ = cheerio.load(content)
  const rows = $('p')
    .map((_, element) => $(element).text())
    .toArray()
    .map((text) => text.match(/(below |nearest |above )?\d+(,\d+)*(\.\d+)?( ?g|kg)/g))
  // There should be two rows
  if (rows.length === 2 && rows[0]?.length === 2 && rows[1]?.length === 2) {
    items.push({ ...buildPackagingWeightItem('Envelope', rows[0][0], rows[0][1]), useGreater: false })
    items.push({ ...buildPackagingWeightItem('Standard', rows[0][0], rows[0][1]), useGreater: false })
    items.push({ ...buildPackagingWeightItem('Standard', rows[1][0], rows[1][1]), useGreater: true })
  }
  return items
}

export function parseFba() {}

export function parseReferral(content: string, subContent?: StringRecord) {
  const $ = cheerio.load(content)
  let referralRule: IReferralFee[] = []

  // for handle Baby Products (excluding Baby Apparel)
  const parseCategory = (fullCategory: string): [string, Array<string>, Array<string>] => {
    let excludingCategories: Array<string> = []
    let includingCategories: Array<string> = []

    const categoryMatchs = fullCategory.match(/\((\n|.)+\)/)
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
      if (cI.includes('(') && cI.includes(')')) {
        // special including
        const str = cI.substring(cI.indexOf('(') + 1, cI.lastIndexOf(')'))
        const categories = str.split(',')
        categories.length > 0 && includingCategories.push(...categories)
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
            .replace(/MXN|\$/g, '')
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
  const onlyOneRate = !($('ul').length > 0 || content.includes('and'))

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

  const createRateItem = (desc: string) => {
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
    .each((_, element) => createRateItem($(element).find('span').text()))

  // special text ’and’
  if (rateItems.length === 0) {
    // may have better method
    $(content)
      .text()
      .split('and')
      .forEach((desc) => createRateItem(desc))
  }
  return rateItems
}
export function parseClosing(content: Nullable<string>): IClosingRule[] {
  return []
}
