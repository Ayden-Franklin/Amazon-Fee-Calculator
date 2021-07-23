import store from '@src/store'
import { sortDimensions, sortByUnit, compareWithUnit } from '@src/service/utils'
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
  // defult unit = 'inches'
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

function calcLengthGirth(longest: Iu, median: Iu, short: Iu): Nullable<Iu> {
  if (longest.unit === median.unit && median.unit === short.unit) {
    return {
      value: longest.value + (median.value + short.value) * 2,
      unit: longest.unit,
    }
  }
  return null
}
export function determineTierByUnit(product: IProduct, tiers: Array<ITier>): Nullable<ITier> {
  let cI = 0
  let total = tiers.length
  let targetTier: Nullable<ITier> = null
  // default tiers order ASCE
  // sort
  const [short, median, longest] = sortByUnit(product.length, product.width, product.height)
  const lengthGirth = calcLengthGirth(longest, median, short)
  // weight
  while (cI < total) {
    const tI = tiers[cI]
    if (
      compareWithUnit(product.weight, tI.weight) &&
      compareWithUnit(longest, tI.volumes[0]) &&
      compareWithUnit(median, tI.volumes[1]) &&
      compareWithUnit(short, tI.volumes[2]) &&
      lengthGirth &&
      tI.lengthGirth &&
      compareWithUnit(lengthGirth, tI.lengthGirth)
    ) {
      targetTier = tI
      break
    }
    cI++
    // The last tier grade  has a different logic: any matched condition should confirm this tier grad
    if (
      (cI === total && compareWithUnit(product.weight, tI.weight)) ||
      compareWithUnit(longest, tI.volumes[0]) ||
      compareWithUnit(median, tI.volumes[1]) ||
      compareWithUnit(short, tI.volumes[2]) ||
      (lengthGirth && tI.lengthGirth && compareWithUnit(lengthGirth, tI.lengthGirth))
    ) {
      targetTier = tI
    }
  }
  return targetTier
}

export function determineTier_old(
  tierData: TierData,
  weightRule: number[],
  volumeRule: number[][],
  lengthGirthRule: number[]
): number {
  const { length, width, height, weight } = tierData
  const ready = [length, width, height, weight, weightRule, volumeRule, lengthGirthRule].every(Boolean)
  if (ready) {
    const weightTier = weightRule.reduce(
      (pre, val, index) =>
        isNaN(val) || weight <= val ? (pre !== -1 || weightRule[index] === weightRule[index - 1] ? pre : index) : -1,
      -1
    )
    // console.log('According weight, result is: ', weightTier)
    const volumeTier = volumeRule.reduce((pre, val, index) => {
      const dimensions = sortDimensions(length, width, height)
      return (isNaN(val[0]) || val[0] >= dimensions[0]) &&
        (isNaN(val[1]) || val[1] >= dimensions[1]) &&
        (isNaN(val[2]) || val[2] >= dimensions[2])
        ? pre !== -1 ||
          (index > 0 &&
            volumeRule[index][0] === volumeRule[index - 1][0] &&
            volumeRule[index][1] === volumeRule[index - 1][1] &&
            volumeRule[index][2] === volumeRule[index - 1][2])
          ? pre
          : index
        : -1
    }, -1)
    // console.log('According volume, result is: ', volumeTier)
    const lengthGirthTier = lengthGirthRule.reduce((pre, val, index) => {
      const dimensions = sortDimensions(length, width, height)
      const lengthGirth = dimensions[0] + (dimensions[1] + dimensions[2]) * 2
      return isNaN(val) || lengthGirth <= val
        ? pre !== -1 || lengthGirthRule[index] === lengthGirthRule[index - 1]
          ? pre
          : index
        : -1
    }, -1)
    // console.log('According lengthGirth, result is: ', lengthGirthTier)
    return Math.max(weightTier, volumeTier, lengthGirthTier)
  } else {
    // console.log('not ready ', [length, width, height, weight])
    return NaN
  }
}

function calculateDimensionalWeight({
  tierData,
  tierIndex,
  tierSize,
  minimumWeight,
  divisor,
}: DimensionalWeightParameter) {
  const { length, width, height, weight } = tierData
  let dimensionalWeight = 0
  if (weight < minimumWeight || tierIndex === tierSize - 1) {
    dimensionalWeight = weight
  } else {
    dimensionalWeight = (length * width * height) / divisor
  }
  return dimensionalWeight
}
interface DimensionalWeightParameter {
  tierData: TierData
  tierIndex: number
  tierSize: number
  minimumWeight: number
  divisor: number
}
export function calculateShippingWeight({
  tierData,
  tierIndex,
  tierSize,
  minimumWeight,
  divisor,
}: DimensionalWeightParameter) {
  const dimensionalWeight = calculateDimensionalWeight({ tierData, tierIndex, tierSize, minimumWeight, divisor })
  const { weight } = tierData
  let shippingWeight = 0
  // TODO: Shipping weight in the small standard and large standard size tiers means tier index less or equals to 1(We should get this from parsing)
  if ((weight < minimumWeight && tierIndex <= 1) || tierIndex === tierSize - 1) {
    shippingWeight = weight
  } else {
    shippingWeight = Math.max(weight, dimensionalWeight)
  }
  return shippingWeight
}

interface FbaParameter {
  tierData: TierData
  tierIndex: number
  tierSize: number
  weightRule: number[]
}
export function calculateFbaFee(
  tierIndex: number,
  tierName: string,
  shippingWeight: number,
  isApparel: boolean,
  isDangerous: boolean,
  rules: any
): number | Error {
  // let tierItems: ProductTierItem[]
  // let productTierItems: TierItem[]
  // let tierItems: Record<string, Array<Record<string, Array<string>>>>
  let productTierItems: Array<Record<string, Array<string>>>
  let productTypekey: string
  // TODO: Don't use index to determine the tier type
  if (tierIndex <= 1) {
    productTypekey = convertProductTypeKey('standard', isApparel, isDangerous)
    productTierItems = rules.standard[productTypekey]
  } else {
    productTypekey = convertProductTypeKey('oversize', isApparel, isDangerous)
    productTierItems = rules.oversize[productTypekey]
  }

  const cutIndex = tierName.indexOf('-size')
  if (cutIndex > -1) {
    tierName = tierName.substring(0, cutIndex)
  }
  const items = productTierItems[tierName]
  let item
  for (const element of items) {
    let target = element.maximumShippingWeight.value
    // TODO: handle unit conversion
    if (element.maximumShippingWeight.unit === 'oz') {
      target /= 16
    }
    if (shippingWeight > target) {
      continue
    } else {
      item = element
      break
    }
  }
  return item.firstWeightFee + (shippingWeight - 1) * item.additionalUnitFee
}

function convertProductTypeKey(size: string, isApparel: boolean, isDangerous: boolean) {
  if (size === 'standard') {
    if (isApparel) {
      return 'Apparel'
    } else if (isDangerous) {
      return 'Dangerous goods'
    } else {
      return 'Most products (non-dangerous goods, non-apparel)'
    }
  } else if (size === 'oversize') {
    if (isApparel || isDangerous) {
      return 'Dangerous goods (both apparel and non-apparel)'
    } else {
      return 'Non-dangerous goods (both apparel and non-apparel)'
    }
  } else {
    return 'unknown'
  }
}

function calcReferralCategory(category: string, rule: ReferralFee) {
  console.log('calcReferralCategory', category, rule.category)
  // console.log('rule.category', rule.category)
  return category.includes(rule.category)
}

export function calculateReferralFee(category: string, price: number, rules: ReferralFee[]) {
  let refRule = null

  for (const rule of rules) {
    if (calcReferralCategory(category, rule)) {
      refRule = rule
      break
    }
  }

  if (refRule === null) {
    return NaN
  }

  let totalFee = 0
  let calculatedAmount = 0

  for (const rateItem of refRule.rateItems) {
    // part calc fee
    totalFee +=
      (price > rateItem.maxPrice ? rateItem.maxPrice - rateItem.minPrice : price - calculatedAmount) * rateItem.rate
    calculatedAmount += rateItem.maxPrice

    if (calculatedAmount >= price) {
      break
    }
  }

  return Math.max(refRule.minimumFee, totalFee)
}

export function calculateClosingFee(category: string, rules: any) {
  if (rules.categories.includes(category)) {
    return rules.fee
  } else {
    return 0
  }
}
