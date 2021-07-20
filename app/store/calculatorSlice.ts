import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  TierData,
  determineTier,
  determineTierByUnit,
  calculateShippingWeight,
  calculateFbaFee,
  calculateReferralFee,
  calculateClosingFee,
  toProductTier,
} from '@src/service/calculator'
import { retrieveCategoryByCode } from '@src/service/utils'

interface CalculatorState {
  productInput?: ProductInput
  loading: boolean
  tier: Nullable<ITier>
  shippingWeight: number
  productFees: ProductFees
  status: string
  error?: string
}
const initialState: CalculatorState = {
  loading: false,
  tier: null,
  shippingWeight: 0,
  status: 'idle',
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
function calculateProductSize(input: Undefinedable<ProductInput>, rules: any): Undefinedable<[ITier, number]> {
  const productSize = toProductTier(input as any) // TierData to ProductSize
  const productTier = determineTierByUnit(productSize, rules.tierRules)
  const tierData: TierData = { ...input, country: 'us' }
  if (productTier) {
    const tierIndex = productTier.order

    const weight = calculateShippingWeight({
      tierData: tierData,
      tierIndex: tierIndex,
      tierSize: rules.tierRule.tierNames.length,
      minimumWeight: rules.diemnsionalWeightRule.minimumWeight,
      divisor: rules.diemnsionalWeightRule.divisor,
    })
    return [productTier, weight]
  }
}
function startToEstimate(state, rules: any): ProductFees {
  const fbaFee = calculateFbaFee(
    state.tier.order,
    state.tier.type,
    state.shippingWeight,
    state.productInput.isApparel,
    state.productInput.isDangerous,
    rules.fbaRule
  )
  const referralFee = calculateReferralFee(
    state.productInput.categoryName,
    state.productInput.price,
    rules.referralRule
  )
  const closingFee = calculateClosingFee(state.productInput.categoryName, rules.closingRule)
  return {
    fbaFee: fbaFee.toFixed(2),
    referralFee: referralFee,
    closingFee: closingFee.toFixed(2),
    totalFee: fbaFee.toFixed(2),
    net: (state.productInput.price - state.productInput.cost - fbaFee - referralFee - closingFee).toFixed(2),
  }
}

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    changeLoadStatus: (state, action: PayloadAction<{ status: boolean }>) => {
      state.loading = action.payload.status
    },
    changeProductInput: (state, action: PayloadAction<{ productInput: ProductInput }>) => {
      state.productInput = { ...state.productInput, ...action.payload.productInput }
    },
    changeProductCategory: (state, action: PayloadAction<string>) => {
      // Retrieve the category name
      const categoryName = retrieveCategoryByCode(action.payload)
      state.productInput = { ...state.productInput, categoryCode: action.payload, categoryName: categoryName }
    },
    calculate: (state, action) => {
      const { productInput } = state
      const { payload } = action

      const result = calculateProductSize(productInput, payload)
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
