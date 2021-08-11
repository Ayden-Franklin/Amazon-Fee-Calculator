import store from '@src/store'
import { compareWithUnit, convertWeightUnit, minify } from '@src/service/utils'
import { getCategoryMappingByCountryCode } from '@src/service/category'
import { NotAvailable } from '@src/service/constants'
export interface TierData {
  length: number
  width: number
  height: number
  weight: number
  category?: string
  country: string
}
type TierKey = keyof TierData
export function toProductTier(
  td: TierData,
  unit: any = { weight: 'lb', width: 'inches', length: 'inches', height: 'inches' }
): IProduct {
  // default unit = 'inches'
  const defaultUnit = typeof unit === 'object' ? unit : typeof unit === 'string' ? unit : 'inches'
  const getIn = (iN: TierKey) => ({ value: td[iN] as number, unit: defaultUnit?.[iN] || defaultUnit })
  return {
    ...td,
    length: getIn('length'),
    width: getIn('width'),
    height: getIn('height'),
    weight: getIn('weight'),
    category: td.category,
    country: td.country,
  }
}

export function checkProductInputReady(): boolean {
  // console.log('checkProductInputReady', store.getState().calculator)
  const productInput = store.getState().calculator.productInput
  // console.log('checkProductInputReady', productInput)
  return productInput
    ? [productInput.length, productInput.width, productInput.height, productInput.weight].every(Boolean)
    : false
}

function calcLengthGirth(
  longest: ICalculateUnit,
  median: ICalculateUnit,
  short: ICalculateUnit
): Nullable<ICalculateUnit> {
  if (longest.unit === median.unit && median.unit === short.unit) {
    return {
      value: longest.value + (median.value + short.value) * 2,
      unit: longest.unit,
    }
  }
  return null
}
export function determineTier(product: IProduct, tiers: Array<ITier>): Nullable<ITier> {
  let cI = 0
  let total = tiers.length
  let targetTier: Nullable<ITier> = null
  const lengthGirth = calcLengthGirth(product.length, product.width, product.height)
  // weight
  while (cI < total) {
    const tI = tiers[cI]
    if (
      compareWithUnit(product.weight, tI.weight) &&
      compareWithUnit(product.length, tI.volumes[0]) &&
      compareWithUnit(product.width, tI.volumes[1]) &&
      compareWithUnit(product.height, tI.volumes[2]) &&
      (typeof tI.lengthGirth === 'undefined' || (lengthGirth && compareWithUnit(lengthGirth, tI.lengthGirth)))
    ) {
      targetTier = tI
      break
    }
    cI++
    // The last tier grade  has a different logic: any matched condition should confirm this tier grad
    if (
      cI === total &&
      (compareWithUnit(product.weight, tI.weight) ||
        compareWithUnit(product.length, tI.volumes[0]) ||
        compareWithUnit(product.width, tI.volumes[1]) ||
        compareWithUnit(product.height, tI.volumes[2]) ||
        typeof tI.lengthGirth === 'undefined' ||
        (lengthGirth && compareWithUnit(lengthGirth, tI.lengthGirth)))
    ) {
      targetTier = tI
    }
  }
  console.log('determineTier. rule -> ', targetTier)
  return targetTier
}

export function calculateDimensionalWeight(product: IProduct, tier: ITier, dimensionalWeightRule: IDimensionalWeight) {
  let { length, width, height, weight } = product
  let lengthValue = length.value
  let widthValue = width.value
  let heightValue = height.value
  let weightValue = weight.value
  const { volumeConstraints, weightConstraints, divisor } = dimensionalWeightRule
  if (volumeConstraints)
    for (const item of volumeConstraints) {
      if (item.standardTierNames?.includes(tier.name) || item.tierName === tier.name) {
        if (!compareWithUnit(product.width, item.roundingUpUnit)) {
          // TODO: if the units are not matched, they should be converted.
          widthValue = item.roundingUpUnit.value
          console.log(
            'calculateDimensionalWeight. rule -> adjust width to ',
            item.roundingUpUnit.value,
            ' ',
            item.roundingUpUnit.unit
          )
        }
        if (!compareWithUnit(product.height, item.roundingUpUnit)) {
          // TODO: if the units are not matched, they should be converted.
          heightValue = item.roundingUpUnit.value
          console.log(
            'calculateDimensionalWeight. rule -> adjust height to ',
            item.roundingUpUnit.value,
            ' ',
            item.roundingUpUnit.unit
          )
        }
        // It should be matched with only one rule item
        break
      }
    }
  if (weightConstraints)
    for (const item of weightConstraints) {
      if (item.standardTierNames?.includes(tier.name) || item.tierName === tier.name) {
        if (!compareWithUnit(product.weight, item.roundingUpUnit)) {
          // TODO: if the units are not matched, they should be converted.
          weightValue = item.roundingUpUnit.value
          console.log(
            'calculateDimensionalWeight. rule -> adjust weight to ',
            item.roundingUpUnit.value,
            ' ',
            item.roundingUpUnit.unit
          )
        }
        // It should be matched with only one rule item
        break
      }
    }
  let dimensionalWeight = (lengthValue * widthValue * heightValue) / divisor
  console.log('calculateDimensionalWeight. rule -> divided by ', divisor)
  return dimensionalWeight
}
export function calculateShippingWeight({
  tierName,
  weight,
  dimensionalWeight,
  shippingWeights,
}: {
  tierName: string
  weight: IMeasureUnit
  dimensionalWeight: number
  shippingWeights: IShippingWeight[]
}) {
  const shippingWeightItem = shippingWeights.find(
    (shippingWeight) =>
      (shippingWeight.standardTierNames?.includes(tierName) || shippingWeight.tierName === tierName) &&
      (!shippingWeight.weightConstraint ||
        shippingWeight.weightConstraint?.unit === NotAvailable ||
        compareWithUnit(weight, shippingWeight.weightConstraint))
  )
  const v = shippingWeightItem
    ? shippingWeightItem.useGreater
      ? Math.max(weight.value, dimensionalWeight)
      : weight.value
    : weight.value
  console.log('calculateShippingWeight. rule -> ', shippingWeightItem, ' result = ', v)
  return {
    value: v,
    unit: weight.unit,
  }
}

interface FbaParameter {
  tierName: string
  shippingWeight: IMeasureUnit
  isApparel: boolean
  isDangerous: boolean
  rules: IFbaItem[]
}
export function calculateFbaFee({ tierName, shippingWeight, isApparel, isDangerous, rules }: FbaParameter): IFeeUnit {
  for (const ruleItem of rules) {
    if (
      (ruleItem.standardTierNames?.includes(tierName) || ruleItem.tierName === tierName) &&
      (ruleItem.isApparel === NotAvailable || isApparel === ruleItem.isApparel) &&
      isDangerous === ruleItem.isDangerous
    ) {
      const { fixedUnitFees, additionalUnitFee } = ruleItem
      let lastFixedFeeItem: IFulfillmentFixedUnitFee
      for (const fixedUnitFee of fixedUnitFees) {
        lastFixedFeeItem = fixedUnitFee
        let target = fixedUnitFee.maximumShippingWeight
        if (!compareWithUnit(shippingWeight, target)) {
          continue
        } else {
          console.log('calculateFbaFee. rule -> ', fixedUnitFee)
          return fixedUnitFee.fee
        }
      }
      if (additionalUnitFee) {
        console.log(
          'calculateFbaFee. rule -> fixedUnitFee =',
          lastFixedFeeItem,
          ' additionalUnitFee = ',
          additionalUnitFee
        )
        // calculate fee by weight
        // first, convert the unit of weight to calculate
        let shippingWeightValue = shippingWeight.value
        if (shippingWeight.unit !== additionalUnitFee.shippingWeight.unit) {
          shippingWeightValue = convertWeightUnit(shippingWeight, additionalUnitFee.shippingWeight.unit)
        }
        let fbaFee = 0
        if (lastFixedFeeItem) {
          fbaFee =
            ((shippingWeightValue - lastFixedFeeItem.maximumShippingWeight.value) /
              additionalUnitFee.shippingWeight.value) *
              additionalUnitFee.fee.value +
            lastFixedFeeItem.fee.value
        } else {
          fbaFee = (shippingWeightValue / additionalUnitFee.shippingWeight.value) * additionalUnitFee.fee.value
        }
        return {
          value: fbaFee,
          currency: additionalUnitFee.fee.currency,
        }
      }
    }
  }
  // Not match any rule?
  return { value: NaN, currency: '' }
}

// Temp interface , final use IProduct
interface IProductCategory {
  // ??? maybe only category
  categoryName?: string
  category: string
  rawCategory?: string
  breadcrumbTree?: Array<{ name: string }>
  price: number
}

interface ICalcCategoryResult {
  order: number
  by: string
}

/**
 * for product === matchCategory ?
 * by product.category or rowCategory or breadcrumbTree
 * by matchCategory or matchCategoryMapping
 */
const calcCategory = (product: IProductCategory, matchCategory: string): Array<ICalcCategoryResult> => {
  const minifyCategory = minify(matchCategory)
  const result = []
  if (product?.category && minify(product?.category) === minifyCategory) {
    result.push({ order: -1, by: 'category' })
  }
  if (product?.rawCategory && minify(product?.rawCategory) === minifyCategory) {
    result.push({ order: -1, by: 'rawCategory' })
  }
  // get country map category  // TODO
  const categoryMapping = getCategoryMappingByCountryCode(product?.country || 'us')
  const mappingCategories = categoryMapping[minifyCategory] || [{ name: matchCategory, order: -1 }]

  if (mappingCategories) {
    const compValues = mappingCategories.map((c) => ({
      order: c.order,
      name: minify(c.name),
      require: c.require?.map((rc) => minify(rc)),
    }))

    if (product?.category) {
      const mifyCategory = minify(product?.category)
      const fitByCategory = compValues.filter((c) => c.name === mifyCategory)
      if (fitByCategory.length) {
        result.push(...fitByCategory.map((c) => ({ ...c, by: 'mapping -> category' })))
      }
    }

    if (product?.rawCategory) {
      const mifyCategory = minify(product?.rawCategory)
      const fitByCategory = compValues.filter((c) => c.name === mifyCategory)
      if (fitByCategory.length) {
        result.push(...fitByCategory.map((c) => ({ ...c, by: 'mapping -> rawCategory' })))
      }
    }

    if (product?.breadcrumbTree) {
      const mifyCategories = product?.breadcrumbTree?.map((bc) => minify(bc.name))
      const fitByCategory = compValues.filter((c) => {
        if (c.require) {
          return c.require.every((rc) => mifyCategories.includes(rc)) && mifyCategories.includes(c.name)
        }
        return mifyCategories.includes(c.name)
      })
      if (fitByCategory.length) {
        result.push(...fitByCategory.map((c) => ({ ...c, by: 'mapping -> breadcrumbTree' })))
      }
    }
  }

  return result
}

function calcReferralCategory(p: IProductCategory, rule: IReferralItem): Nullable<Array<ICalcCategoryResult>> {
  let results: ICalcCategoryResult[] = []
  let excludingCategories = [...rule.excludingCategories]
  excludingCategories.forEach((c) => {
    const res = calcCategory(p, c)
    if (res) {
      results.push(...res)
    }
  })

  if (results.length > 0) return null

  let matchCategories = [rule.category, ...rule.includingCategories]
  matchCategories.forEach((c) => {
    const res = calcCategory(p, c)
    if (res) {
      results.push(...res)
    }
  })
  return results.length <= 0 ? null : results
}

export function calculateReferralFee(product: IProductCategory, rules: IReferralItem[]): IFeeUnit {
  const { price } = product
  let filRule = null
  let refRules = []
  let otherRule = null
  for (const rule of rules) {
    if (otherRule === null && rule.otherable) {
      otherRule = rule
    }
    const calcRes = calcReferralCategory(product, rule)
    if (calcRes?.length) {
      refRules.push({
        _calc: calcRes,
        _maxCalcOrder: Math.max(...calcRes.map((c) => c.order)),
        ...rule,
      })
    }
  }

  // how to calc filRule by refRules? eg: get order max!
  let maxOrderRule = null
  for (const rRule of refRules) {
    if (!maxOrderRule || maxOrderRule?._maxCalcOrder < rRule._maxCalcOrder) {
      maxOrderRule = rRule
    }
  }
  filRule = refRules?.length ? maxOrderRule : otherRule
  console.log('ReferralFee -> ', refRules, filRule)

  if (filRule === null) {
    return { value: NaN, currency: NotAvailable }
  }

  let totalFee = 0
  let calculatedAmount = 0

  for (const rateItem of filRule.rateItems) {
    // part calc fee
    totalFee +=
      (price > rateItem.maximumPrice ? rateItem.maximumPrice - rateItem.minimumPrice : price - calculatedAmount) *
      rateItem.rate
    calculatedAmount += rateItem.maximumPrice

    if (calculatedAmount >= price) {
      break
    }
  }

  return { value: Math.max(filRule.minimumFee, totalFee), currency: filRule.currency }
}

export function calculateClosingFee(product: IProductCategory, rules?: IClosing[]): IFeeUnit {
  const emptyFee = { value: 0, currency: NotAvailable }
  if (!rules) return emptyFee
  const closing2Fee = (r: IClosing): IFeeUnit => ({ value: r.fee, currency: r.currency })
  for (const r of rules) {
    const calcRes = r.categories?.map((c) => calcCategory(product, c)).filter((res) => res !== null && res?.length > 0)
    if (calcRes?.length > 0) {
      console.log('ClosingFee -> ', r, calcRes)
      return closing2Fee(r)
    }
  }
  return emptyFee
}

export function calcApparelByCategory(product: IProductCategory, rules?: IApparel[]): boolean {
  if (!rules || !product) return false
  if (product?.breadcrumbTree) {
    const compValues = rules.map((c) => ({
      name: minify(c.matchCategory),
      require: c.requireParent?.map((rc) => minify(rc)),
    }))
    const mifyCategories = product?.breadcrumbTree?.map((bc) => minify(bc.name))
    const fitByCategory = compValues.filter((c) => {
      if (c.require) {
        return c.require.every((rc) => mifyCategories.includes(rc)) && mifyCategories.includes(c.name)
      }
      return mifyCategories.includes(c.name)
    })
    if (fitByCategory.length) {
      console.log('ApparelByCategory -> ', fitByCategory)
      return true
    }
  }
  return false
}
