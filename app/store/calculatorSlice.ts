import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { TierData, determineTier, calculateShippingWeight } from '@src/service/calculator'
interface CalculatorState {
  productInput?: ProductInput
  tierIndex: number
  loadStatus: boolean
  fbaFee: number
  referralFee: number
  closingFee: number
  totalFee: number
  net: number
  status: string
  error?: string
}
const initialState: CalculatorState = {
  tierIndex: -1,
  loadStatus: false,
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
}
function startToCalculate(input: ProductInput | undefined, rules: any, setTierIndex: (index: number) => void) {
  // console.log(' ------------- calculate', input?.length)
  let weightRule: number[] = rules.tierRule.weightRule
  let volumeRule: number[][] = rules.tierRule.volumeRule
  let lengthGirthRule: number[] = rules.tierRule.lengthGirthRule
  const tierData: TierData = { ...input, country: 'us' }
  const tierIndex: number = determineTier({ ...tierData }, weightRule, volumeRule, lengthGirthRule)
  // console.log('get tier index is ', tierIndex)
  if (!isNaN(tierIndex)) {
    setTierIndex(tierIndex)
    // console.log('get tier name is ', rules.tierRule.tierNames[tierIndex])
    // console.log('tierData is ', tierData)
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
      state.loadStatus = action.payload.status
    },
    changeProductInput: (state, action: PayloadAction<{ productInput: ProductInput }>) => {
      state.productInput = action.payload.productInput
    },
    calculate: (state, action) => {
      // console.log(action.payload)
      startToCalculate(state.productInput, action.payload, (index) => {
        state.tierIndex = index
      })
    },
  },
})
export const { changeLoadStatus, changeProductInput, calculate } = calculatorSlice.actions
export default calculatorSlice.reducer
