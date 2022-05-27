import store from '@src/store'
import { compareWithUnit, convertLengthUnit, convertWeightUnit, minify, sortDimensions } from '@src/service/utils'
import { getCategoryMappingByCountryCode } from '@src/service/category'
import { NotAvailable } from '@src/service/constants'
import { IProductCategory, IProductDimensionData, IProductFbaData, IProductInput } from '@src/types/fees'
import {
  IApparel,
  IClosing,
  IDimensionalWeight,
  IFbaItem,
  IFulfillmentFixedUnitFee,
  IReferralItem,
  IShippingWeight,
  ITier,
} from '@src/types/rules'
import { ICalculateUnit, IFeeUnit, IMeasureUnit, Nullable } from '@src/types'

export function standardizeDimensions(input: IProductInput): IProductDimensionData {
  const defaultLengthUnit = 'inches'
  const defaultWeighthUnit = 'pounds'
  let { length, width, height } = { ...input }
  // Sort the value because in our database there is only one field to store the unit of dimensions
  const [longest, median, shortest] = sortDimensions(length, width, height)
  const formatUnit = (value: number, unit: string) => ({ value, unit: unit || defaultLengthUnit })
  return {
    length: formatUnit(longest, input.dimensionUnit),
    width: formatUnit(median, input.dimensionUnit),
    height: formatUnit(shortest, input.dimensionUnit),
    weight: { value: input.weight, unit: input.weightUnit || defaultWeighthUnit },
  }
}

export function checkProductInputReady(): boolean {
  const productInput = store.getState().calculator.productInput
  return (
    !!productInput && [productInput.length, productInput.width, productInput.height, productInput.weight].every(Boolean)
  )
}

/**
 * rules => {
 *   country
 *   dimensionalWeightRule
 *   tierRules
 * }
 */
export function calculateProductSize(input: IProductDimensionData, tierRules: ITier[]): ITier {
  if (!input) throw Error('Parameter is not provided to calculate!')
  const productTier = determineTier(input, tierRules)
  if (productTier) {
    return productTier
  }
  throw Error(`Fail to calculate tier with parameters ${input}`)
}
export function calculateWeight(
  input: IProductDimensionData,
  productTier: ITier,
  dimensionalWeightRule: IDimensionalWeight,
  shippingWeightRules: IShippingWeight[]
): IMeasureUnit {
  if (!input) throw Error('Parameter is not provided to calculate!')
  const dimensionalWeight = calculateDimensionalWeight(input, productTier, dimensionalWeightRule)
  const weight = calculateShippingWeight({
    tierName: productTier.name,
    weight: input.weight,
    dimensionalWeight,
    shippingWeightRules,
  })
  return weight
}
function calculateLengthGirth(
  longest: IMeasureUnit,
  median: IMeasureUnit,
  short: IMeasureUnit
): Nullable<ICalculateUnit> {
  if (longest.unit === median.unit && median.unit === short.unit) {
    return {
      value: longest.value + (median.value + short.value) * 2,
      unit: longest.unit,
    }
  } else {
    return {
      value: longest.value + (convertLengthUnit(median, longest.unit) + convertLengthUnit(short, longest.unit)) * 2,
      unit: longest.unit,
    }
  }
}
export function determineTier(productDimension: IProductDimensionData, tiers: ITier[]): Nullable<ITier> {
  let cI = 0
  let total = tiers.length
  let targetTier: Nullable<ITier> = null
  const lengthGirth = calculateLengthGirth(productDimension.length, productDimension.width, productDimension.height)
  // weight
  while (cI < total) {
    const tI = tiers[cI]
    if (
      compareWithUnit(productDimension.weight, tI.weight) &&
      compareWithUnit(productDimension.length, tI.volumes[0]) &&
      compareWithUnit(productDimension.width, tI.volumes[1]) &&
      compareWithUnit(productDimension.height, tI.volumes[2]) &&
      (typeof tI.lengthGirth === 'undefined' || (lengthGirth && compareWithUnit(lengthGirth, tI.lengthGirth)))
    ) {
      targetTier = tI
      break
    }
    cI++
    // The last tier grade  has a different logic: any matched condition should confirm this tier grad
    if (
      cI === total &&
      (compareWithUnit(productDimension.weight, tI.weight) ||
        compareWithUnit(productDimension.length, tI.volumes[0]) ||
        compareWithUnit(productDimension.width, tI.volumes[1]) ||
        compareWithUnit(productDimension.height, tI.volumes[2]) ||
        typeof tI.lengthGirth === 'undefined' ||
        (lengthGirth && compareWithUnit(lengthGirth, tI.lengthGirth)))
    ) {
      targetTier = tI
    }
  }
  console.log('determineTier. rule -> ', targetTier)
  return targetTier
}
// Export it for unit test
export function calculateDimensionalWeight(
  product: IProductDimensionData,
  tier: ITier,
  dimensionalWeightRule: IDimensionalWeight
) {
  let { length, width, height } = product
  let lengthValue = length.value
  let widthValue = width.value
  let heightValue = height.value
  // let weightValue = weight.value
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
          // weightValue = item.roundingUpUnit.value
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
  console.log('calculateDimensionalWeight. rule -> divided by ', divisor, ' = ', dimensionalWeight)
  return dimensionalWeight
}
export function calculateShippingWeight({
  tierName,
  weight,
  dimensionalWeight,
  shippingWeightRules,
}: {
  tierName: string
  weight: IMeasureUnit
  dimensionalWeight: number
  shippingWeightRules: IShippingWeight[]
}): IMeasureUnit {
  const shippingWeightItem = shippingWeightRules.find(
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
interface FbaParameter extends IProductFbaData {
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
      let lastFixedFeeItem: IFulfillmentFixedUnitFee | undefined
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
        shippingWeightValue = parseFloat(shippingWeightValue.toFixed(2))
        let fbaFee = 0
        if (additionalUnitFee.fixedShippingWeight && additionalUnitFee.fixedFee) {
          fbaFee =
            Math.ceil(
              (shippingWeightValue - additionalUnitFee.fixedShippingWeight.value) /
                additionalUnitFee.shippingWeight.value
            ) *
              additionalUnitFee.fee.value +
            additionalUnitFee.fixedFee.value
        } else if (lastFixedFeeItem) {
          fbaFee =
            Math.ceil(
              (shippingWeightValue - lastFixedFeeItem.maximumShippingWeight.value) /
                additionalUnitFee.shippingWeight.value
            ) *
              additionalUnitFee.fee.value +
            lastFixedFeeItem.fee.value
        } else {
          fbaFee = Math.ceil(shippingWeightValue / additionalUnitFee.shippingWeight.value) * additionalUnitFee.fee.value
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

interface ICalcCategoryResult {
  order: number
  by: string
}

/**
 * for product === matchCategory ?
 * by product.category or rowCategory or breadcrumbTree
 * by matchCategory or matchCategoryMapping
 */
const matchCategory = (product: IProductCategory, targetCategory: string, country: string): ICalcCategoryResult[] => {
  const minifyCategory = minify(targetCategory)
  const result: ICalcCategoryResult[] = []
  if (product.category && minify(product.category) === minifyCategory) {
    result.push({ order: -1, by: 'category' })
  }
  if (product.rawCategory && minify(product.rawCategory) === minifyCategory) {
    result.push({ order: -1, by: 'rawCategory' })
  }
  // get country map category  // TODO
  const categoryMapping = getCategoryMappingByCountryCode(country)
  const mappingCategories = categoryMapping[minifyCategory] || [{ name: minifyCategory, order: -1 }]

  if (mappingCategories) {
    const compValues = mappingCategories.map((c) => ({
      order: c.order,
      name: minify(c.name),
      require: c.require?.map((rc) => minify(rc)),
    }))

    if (product.category) {
      const mifyCategory = minify(product.category)
      const fitByCategory = compValues.filter((c) => c.name === mifyCategory)
      if (fitByCategory.length) {
        result.push(...fitByCategory.map((c) => ({ ...c, by: 'mapping -> category' })))
      }
    }

    if (product.rawCategory) {
      const mifyCategory = minify(product?.rawCategory)
      const fitByCategory = compValues.filter((c) => c.name === mifyCategory)
      if (fitByCategory.length) {
        result.push(...fitByCategory.map((c) => ({ ...c, by: 'mapping -> rawCategory' })))
      }
    }

    if (product.breadcrumbTree) {
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
/**
 * Match the referral rules with a categories tree.
 * @param category The product category tree. For production environment, this might an array and two strings
 * @param rule The rules for referral
 * @returns An array  if the categories of this product maches with the including categores
 */
function matchReferralCategory(
  productCategories: IProductCategory,
  country: string,
  rule: IReferralItem
): Array<ICalcCategoryResult> {
  let results: ICalcCategoryResult[] = []
  let excludingCategories = [...rule.excludingCategories]
  // Check if the category should be excluded
  excludingCategories.forEach((c) => {
    const res = matchCategory(productCategories, c, country)
    if (res) {
      results.push(...res)
    }
  })
  if (results.length > 0) return []
  // Check if the category should be included
  let matchCategories = [rule.category, ...rule.includingCategories]
  matchCategories.forEach((c) => {
    const res = matchCategory(productCategories, c, country)
    if (res) {
      results.push(...res)
    }
  })
  return results
}

export function calculateReferralFee(
  productCategories: IProductCategory,
  price: number,
  country: string,
  rules: IReferralItem[]
): IFeeUnit {
  interface MatchedRulesType extends IReferralItem {
    _calc: ICalcCategoryResult[]
    _maxCalcOrder: number
  }
  let winnerRule: IReferralItem | undefined
  let matchedRules: MatchedRulesType[] = []
  let otherRule: IReferralItem | undefined
  for (const rule of rules) {
    if (!otherRule && rule.isOther) {
      otherRule = rule
    }
    const matchedCategories = matchReferralCategory(productCategories, country, rule)
    if (matchedCategories.length > 0) {
      matchedRules.push({
        _calc: matchedCategories,
        _maxCalcOrder: Math.max(...matchedCategories.map((c) => c.order)),
        ...rule,
      })
    }
  }

  // How to determine which rule will be applied finally? For now choose the maximum order!
  if (matchedRules.length > 0) {
    winnerRule = matchedRules.reduce((pre, cur) => (pre._maxCalcOrder < cur._maxCalcOrder ? cur : pre))
  } else {
    winnerRule = otherRule
  }
  console.log('ReferralFee -> ', matchedRules, winnerRule)

  if (!winnerRule) {
    return { value: NaN, currency: NotAvailable }
  }
  let referralFee = 0
  if (winnerRule.isSteppedPrice) {
    let calculatedAmount = 0

    for (const rateItem of winnerRule.rateItems) {
      referralFee +=
        (price > rateItem.maximumPrice ? rateItem.maximumPrice - rateItem.minimumPrice : price - calculatedAmount) *
        rateItem.rate
      calculatedAmount += rateItem.maximumPrice

      if (calculatedAmount >= price) {
        break
      }
    }
  } else {
    const rateItem = winnerRule.rateItems.find((item) => price > item.minimumPrice && price <= item.maximumPrice)
    if (rateItem) {
      referralFee = price * rateItem.rate
    }
  }
  return { value: Math.max(winnerRule.minimumFee, referralFee), currency: winnerRule.currency }
}

export function calculateClosingFee(
  productCategories: IProductCategory,
  country: string,
  rules?: IClosing[]
): IFeeUnit {
  const emptyFee = { value: 0, currency: NotAvailable }
  if (!rules) return emptyFee
  const closing2Fee = (r: IClosing): IFeeUnit => ({ value: r.fee, currency: r.currency })
  for (const r of rules) {
    const result = r.categories
      ?.map((c) => matchCategory(productCategories, c, country))
      .filter((res) => res !== null && res?.length > 0)
    if (result?.length > 0) {
      console.log('ClosingFee -> ', r, result)
      return closing2Fee(r)
    }
  }
  return emptyFee
}

export function verifyApparelByCategory(productCategories: IProductCategory, rules?: IApparel[]): boolean {
  if (!rules || !productCategories) return false
  if (productCategories?.breadcrumbTree) {
    const compValues = rules.map((c) => ({
      name: minify(c.matchCategory),
      require: c.requireParent?.map((rc) => minify(rc)),
    }))
    const mifyCategories = productCategories?.breadcrumbTree?.map((bc) => minify(bc.name))
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
