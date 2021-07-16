import store, { RootState } from '@src/store'
import { sortDimensions } from '@src/service/utils'
import { FulfillmentItem, TierItem, ProductTierItem } from '@src/types/fba'
export interface TierData {
  length: number
  width: number
  height: number
  weight: number
  category?: string
  country: string
}
export function checkPrerequisite(): boolean {
  return checkStatus(store.getState())
}
export function checkProductInputReady(): boolean {
  // console.log('checkProductInputReady', store.getState().calculator)
  const productInput = store.getState().calculator.productInput
  // console.log('checkProductInputReady', productInput)
  return productInput
    ? [productInput.length, productInput.width, productInput.height, productInput.weight].every(Boolean)
    : false
}
function checkStatus(state: RootState): boolean {
  return ['tier', 'dimensionalWeight', 'fba', 'referral', 'closing'].every((v) => state[v]['status'] === 'succeeded')
}

export function determineTier(
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
export function calculateFbaFee(tierIndex: number, tierName: string, shippingWeight: number, isApparel: boolean, isDangerous: boolean, rules: any): number | Error {
  // let tierItems: ProductTierItem[]
  // let productTierItems: TierItem[]
  // let tierItems: Record<string, Array<Record<string, Array<string>>>>
  let productTierItems: Array<Record<string, Array<string>>>
  // console.log(rules)
  let productTypekey: string
  // TODO: Don't use index to determine the tier type
  if (tierIndex <= 1) {
    productTypekey = convertProductTypeKey('standard', isApparel, isDangerous)
    productTierItems = rules.standard[productTypekey]
  } else {
    productTypekey = convertProductTypeKey('oversize', isApparel, isDangerous)
    productTierItems = rules.oversize[productTypekey]
  }
  // const item: TierItem = productTierItems[tierIndex]
  // item.fulfillments.forEach((item) => {
  //   console.log('check whether the weight ', shippingWeight, ' target weight', item.minimumShippingWeight)
  // })
  const cutIndex = tierName.indexOf('-size')
  if (cutIndex > -1) {
    tierName = tierName.substring(0, cutIndex)
  }
  const items = productTierItems[tierName]
  let item
  for (let index = 0; index < items.length; index++) {
    const element = items[index]
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
  let fee = item.firstWeightFee + (shippingWeight - 1) * item.additionalUnitFee
  return fee
}

function convertProductTypeKey(size: string, isApparel: boolean, isDangerous: boolean){
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
