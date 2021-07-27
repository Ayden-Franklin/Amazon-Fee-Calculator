import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  TierData,
  determineTierByUnit,
  calculateDimensionalWeight,
  calculateShippingWeight,
  calculateFbaFee,
  calculateReferralFee,
  calculateClosingFee,
  toProductTier,
} from '@src/service/calculator'
import { StateStatus } from '@src/renderer/constants'
import { sortByUnit } from '@src/service/utils'

interface CalculatorState {
  productInput?: ProductInput
  loading: boolean
  tier: Nullable<ITier>
  shippingWeight: number
  productFees: ProductFees
  status: StateStatus
  error?: string
}
const initialState: CalculatorState = {
  loading: false,
  tier: null,
  shippingWeight: 0,
  status: StateStatus.Idle,
  productFees: {
    fbaFee: 0,
    referralFee: 0,
    closingFee: 0,
    totalFee: 0,
    net: 0,
  },
}

export const selectCalculator = (state) => state.calculator
export interface ProductInput {
  length: number
  width: number
  height: number
  weight: number
  price: number
  cost: number
  categoryCode?: string
  categoryName?: string
  isApparel: boolean
  isDangerous: boolean
}
export interface ProductFees {
  fbaFee: number
  referralFee: number
  closingFee: number
  totalFee: number
  net: number
}
/**
 * rules => {
 *   country
 *   dimensionalWeightRule
 *   tierRules
 * }
 */
function calculateProductSize(input: Undefinedable<ProductInput>, rules: any): Undefinedable<[ITier, number]> {
  if (!input) return
  const country = rules.country
  const tierData: TierData = { ...input, country }
  const tierRules: Array<ITier> = rules.tierRules

  const initialProductSize = toProductTier(tierData)
  let { length, width, height } = { ...initialProductSize }
  const [shortest, median, longest] = sortByUnit(length, width, height)
  const productSize = { ...initialProductSize, length: longest, width: median, height: shortest }
  const productTier = determineTierByUnit(productSize, tierRules)

  if (productTier) {
    const tierIndex = productTier.order
    const { standardTierNames, minimumMeasureUnit, divisor } = { ...rules.dimensionalWeightRules }
    const dimensionalWeight = calculateDimensionalWeight({
      product: productSize,
      tier: productTier,
      standardTierNames,
      minimumMeasureUnit,
      divisor,
    })
    const weight = calculateShippingWeight({
      tierName: productTier.name,
      weight: productSize.weight,
      dimensionalWeight: dimensionalWeight,
      shippingWeights: rules.shippingWeightRules,
    })
    return [productTier, weight]
  }
}
function startToEstimate(state, rules: any): Nullable<ProductFees> {
  if (!state.tier || !state.productInput || !state.productInput.categoryName || !state.shippingWeight) return null
  const fbaFee = calculateFbaFee(
    state.tier.order,
    state.tier.name,
    state.shippingWeight,
    state.productInput.isApparel,
    state.productInput.isDangerous,
    rules.fbaRules
  )
  const referralFee = calculateReferralFee(JSON.parse(JSON.stringify(state.productInput)), rules.referralRules)
  const closingFee = calculateClosingFee(state.productInput.categoryName, rules.closingRules)
  return {
    fbaFee: fbaFee.toFixed(2),
    referralFee: referralFee.toFixed(2),
    closingFee: closingFee.toFixed(2),
    totalFee: (fbaFee + referralFee + closingFee).toFixed(2),
    net: (state.productInput.price - (state.productInput.cost ?? 0) - fbaFee - referralFee - closingFee).toFixed(2),
  }
}

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    changeLoadStatus: (state, action: PayloadAction<{ status: boolean }>) => {
      state.loading = action.payload.status
    },
    changeProductInput: (state, action: PayloadAction<{ productInput: Partial<ProductInput> }>) => {
      state.productInput = { ...state.productInput, ...action.payload.productInput }
    },
    changeProductCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload
      state.productInput = { ...state.productInput, categoryCode: category, categoryName: category }
    },
    calculate: (state, action) => {
      const result = calculateProductSize(state.productInput, action.payload)
      if (result) {
        const [tier, weight] = result
        state.tier = tier
        state.shippingWeight = weight
      }
    },
    estimate: (state, action) => {
      const result = startToEstimate(state, action.payload)
      if (result) {
        state.productFees = result
      }
    },
  },
})
export const { changeLoadStatus, changeProductInput, changeProductCategory, calculate, estimate } =
  calculatorSlice.actions
export default calculatorSlice.reducer
