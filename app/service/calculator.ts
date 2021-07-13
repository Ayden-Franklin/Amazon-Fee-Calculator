import store, { RootState } from '@src/store'
import { sortDimensions } from '@src/service/utils'
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
          (volumeRule[index][0] === volumeRule[index - 1][0] &&
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
  const { length, width, height, weight } = tierData
  let shippingWeight = 0
  // TODO: Shipping weight in the small standard and large standard size tiers means tier index less or equals to 1(We should get this from parsing)
  if ((weight < minimumWeight && tierIndex <= 1) || tierIndex === tierSize - 1) {
    shippingWeight = weight
  } else {
    shippingWeight = Math.max(weight, dimensionalWeight)
  }
  return shippingWeight
}
