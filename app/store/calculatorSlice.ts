import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TierData, determineTier, calculateShippingWeight, calculateFbaFee } from '@src/service/calculator'
interface CalculatorState {
  productInput?: ProductInput
  loading: boolean
  tier: Nullable<ITier>
  tierIndex: number
  shippingWeight: number
  productFees: ProductFees
  status: string
  error?: string
}
const initialState: CalculatorState = {
  loading: false,
  tier: null,
  tierIndex: -1,
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
function calculateTier(input: ProductInput | undefined, rules: any): number[] | undefined {
  let weightRule: number[] = rules.tierRule?.weightRule
  let volumeRule: number[][] = rules.tierRule?.volumeRule
  let lengthGirthRule: number[] = rules.tierRule?.lengthGirthRule
  const tierData: TierData = { ...input, country: 'us' }
  const tierIndex: number = determineTier({ ...tierData }, weightRule, volumeRule, lengthGirthRule)
  // console.log('get tier index is ', tierIndex)
  if (!isNaN(tierIndex)) {
    const weight = calculateShippingWeight({
      tierData: tierData,
      tierIndex: tierIndex,
      tierSize: rules.tierRule.tierNames.length,
      minimumWeight: rules.diemnsionalWeightRule.minimumWeight,
      divisor: rules.diemnsionalWeightRule.divisor,
    })
    return [tierIndex, weight]
  }
}
function startToEstimate(state, rules: any): ProductFees {
  const fbaFee = calculateFbaFee(
    state.tierIndex,
    rules.tierRule.tierNames[state.tierIndex], // TODO: Linker will refactor the structure of tier rules to include the tier name
    state.shippingWeight,
    state.productInput.isApparel,
    state.productInput.isDangerous,
    rules.fbaRule
  )
  return {
    fbaFee: fbaFee,
    referralFee: 0,
    closingFee: 0,
    totalFee: fbaFee,
    net: state.productInput.price - state.productInput.cost - fbaFee,
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
      state.productInput = { categoryCode: action.payload, ...state.productInput }
    },
    calculate: (state, action) => {
      const result = calculateTier(state.productInput, action.payload)
      if (result) {
        state.tierIndex = result[0]
        state.shippingWeight = result[1]
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
