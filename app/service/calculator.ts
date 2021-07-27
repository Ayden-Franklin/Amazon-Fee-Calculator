import store from '@src/store'
import { sortByUnit, compareWithUnit, minify } from '@src/service/utils'
import { getCategoryMappingByCountryCode } from '@src/service/category'
import { NotAvailable } from '@src/renderer/constants'
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
export function determineTierByUnit(product: IProduct, tiers: Array<ITier>): Nullable<ITier> {
  let cI = 0
  let total = tiers.length
  let targetTier: Nullable<ITier> = null
  // default tiers order ASCE
  // sort --- Changed: sorting them before call calculation functions
  // const [short, median, longest] = sortByUnit(product.length, product.width, product.height)
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
  return targetTier
}

export function calculateDimensionalWeight({
  product,
  tier,
  standardTierNames,
  minimumMeasureUnit,
  divisor,
}: {
  product: IProduct
  tier: ITier
  standardTierNames: string[]
  minimumMeasureUnit: ICalculateUnit
  divisor: number
}) {
  let { length, width, height } = product
  let lengthValue = length.value
  let widthValue = width.value
  let heightValue = height.value
  // TODO: if the units are not matched, they should be converted.
  if (
    standardTierNames.includes(tier.name) &&
    width.unit === minimumMeasureUnit.unit &&
    height.unit === minimumMeasureUnit.unit
  ) {
    if (!compareWithUnit(product.width, minimumMeasureUnit)) {
      widthValue = 2
    }
    if (!compareWithUnit(product.height, minimumMeasureUnit)) {
      heightValue = 2
    }
  }
  let dimensionalWeight = (lengthValue * widthValue * heightValue) / divisor
  return dimensionalWeight
}
export function calculateShippingWeight({
  tierName,
  weight,
  dimensionalWeight,
  shippingWeights,
}: {
  tierName: string
  weight: ICalculateUnit
  dimensionalWeight: number
  shippingWeights: ShippingWeight[]
}) {
  // TODO: Shipping weight in the small standard and large standard size tiers means tier index less or equals to 1(We should get this from parsing)
  // if ((weight < minimumWeight && tierIndex <= 1) || tierIndex === tierSize - 1) {
  //   shippingWeight = weight
  // } else {
  //   shippingWeight = Math.max(weight, dimensionalWeight)
  // }
  // TODO need a function to convert the name
  let shippingWeightItem: ShippingWeight
  for (const shippingWeight of shippingWeights) {
    if (shippingWeight.standardTierNames.includes(tierName)) {
      if (shippingWeight.weight.unit === NotAvailable) {
        shippingWeightItem = shippingWeight
        break
      } else {
        if (compareWithUnit(shippingWeight.weight, weight)) {
          shippingWeightItem = shippingWeight
          break
        } else {
          shippingWeightItem = shippingWeight
          break
        }
      }
    }
  }
  // TODO need return unit
  return shippingWeightItem
    ? shippingWeightItem.useGreater
      ? Math.max(weight.value, dimensionalWeight)
      : weight.value
    : weight.value
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

// Temp interface , final use IProduct
interface IProductCategory {
  // ??? maybe only category
  categoryName?: string
  category: string
  rawCategory?: string
  breadcrumbTree?: Array<{ name: string }>
  price: number
}

function calcReferralCategory(
  product: IProductCategory,
  rule: IReferralFee
): Nullable<Array<{ order: number; by: string }>> {
  const minifyCategory = minify(rule.category)

  if (product?.category && minify(product?.category) === minifyCategory) {
    return [{ order: -1, by: 'category' }]
  }
  if (product?.rawCategory && minify(product?.rawCategory) === minifyCategory) {
    return [{ order: -1, by: 'rawCategory' }]
  }
  // get country map category
  // TODO
  const categoryMapping = getCategoryMappingByCountryCode('us')
  const mappingCategories = categoryMapping[minifyCategory]

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
        return fitByCategory.map((c) => ({ ...c, by: 'mapping -> category' }))
      }
    }

    if (product?.rawCategory) {
      const mifyCategory = minify(product?.rawCategory)
      const fitByCategory = compValues.filter((c) => c.name === mifyCategory)
      if (fitByCategory.length) {
        return fitByCategory.map((c) => ({ ...c, by: 'mapping -> rawCategory' }))
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
        return fitByCategory.map((c) => ({ ...c, by: 'mapping -> breadcrumbTree' }))
      }
    }
  }
  return null
}

export function calculateReferralFee(product: IProductCategory, rules: IReferralFee[]) {
  // temp handle category
  product.category = product.categoryName || product.category || ''

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
  console.log('calculateReferralFee calc rule -> ', refRules, filRule)

  if (filRule === null) {
    return NaN
  }

  let totalFee = 0
  let calculatedAmount = 0

  for (const rateItem of filRule.rateItems) {
    // part calc fee
    totalFee +=
      (price > rateItem.maxPrice ? rateItem.maxPrice - rateItem.minPrice : price - calculatedAmount) * rateItem.rate
    calculatedAmount += rateItem.maxPrice

    if (calculatedAmount >= price) {
      break
    }
  }

  return Math.max(filRule.minimumFee, totalFee)
}

export function calculateClosingFee(category: string, rules: any) {
  if (rules.categories.includes(category)) {
    return rules.fee
  } else {
    return 0
  }
}
