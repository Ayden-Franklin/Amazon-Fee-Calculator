import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TierData, determineTier, calculateShippingWeight } from '@src/service/calculator'
interface CalculatorState {
  productInput?: ProductInput
  loading: boolean
  tierIndex: number
  fbaFee: number
  referralFee: number
  closingFee: number
  totalFee: number
  net: number
  status: string
  error?: string
}
const initialState: CalculatorState = {
  loading: false,
  tierIndex: -1,
  status: 'idle',
  fbaFee: 0,
  referralFee: 0,
  closingFee: 0,
  totalFee: 0,
  net: 0,
}

export const selectCalculator = (state) => state.calculator
export interface ProductInput {
  length: number
  width: number
  height: number
  weight: number
  price: number
  cost: number
  categoryCode: string
  isApparel: boolean
  isDangerous: boolean
}
function startToCalculate(input: ProductInput | undefined, rules: any, setTierIndex: (index: number) => void) {
  let weightRule: number[] = rules.tierRule?.weightRule
  let volumeRule: number[][] = rules.tierRule?.volumeRule
  let lengthGirthRule: number[] = rules.tierRule?.lengthGirthRule
  const tierData: TierData = { ...input, country: 'us' }
  const tierIndex: number = determineTier({ ...tierData }, weightRule, volumeRule, lengthGirthRule)
  // console.log('get tier index is ', tierIndex)
  if (!isNaN(tierIndex)) {
    setTierIndex(tierIndex)
    const weight = calculateShippingWeight({
      tierData: tierData,
      tierIndex: tierIndex,
      tierSize: rules.tierRule.tierNames.length,
      minimumWeight: rules.diemnsionalWeightRule.minimumWeight,
      divisor: rules.diemnsionalWeightRule.divisor,
    })
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
      startToCalculate(state.productInput, action.payload, (index) => {
        state.tierIndex = index
      })
    },
  },
})
export const { changeLoadStatus, changeProductInput, changeProductCategory, calculate } = calculatorSlice.actions
export default calculatorSlice.reducer
