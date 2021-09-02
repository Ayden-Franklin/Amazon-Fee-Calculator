import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { standardizeDimensions } from '@src/service/calculator'
import { profitCalculator } from '@src/store/assetSlice'
import { StateStatus } from '@src/renderer/constants'
import { NotAvailable } from '@src/service/constants'
import { IMeasureUnit, Nullable } from '@src/types/'
import { ITier } from '@src/types/rules'
import { IProductInput, IProductFee } from '@src/types/fees'
import { IFeeUnit } from '@src/types'

interface CalculatorState {
  productInput?: IProductInput
  loading: boolean
  tier?: ITier
  shippingWeight: IMeasureUnit
  productFee: IProductFee
  status: StateStatus
  error?: string
}
const initialFee = { value: 0, currency: '' }
const initialState: CalculatorState = {
  loading: false,
  shippingWeight: { value: 0, unit: NotAvailable },
  status: StateStatus.Idle,
  productInput: {
    width: 0,
    height: 0,
    length: 0,
    dimensionUnit: 'inches',
    weight: 0,
    weightUnit: 'pounds',
    price: 0,
    cost: 0,
    isApparel: false,
    isDangerous: false,
  },
  productFee: {
    fbaFee: initialFee,
    referralFee: initialFee,
    closingFee: initialFee,
    totalFee: 0,
    net: 0,
  },
}

export const selectCalculator = (state) => state.calculator

export function startToEstimate(state: CalculatorState): Nullable<IProductFee> {
  if (!state.tier || !state.productInput || !state.shippingWeight) {
    return null
  }
  const productInput = JSON.parse(JSON.stringify(state.productInput))
  productInput.category = productInput.category || ''

  const fbaFee = profitCalculator.calculateFbaFee({
    tierName: state.tier.name,
    shippingWeight: state.shippingWeight,
    isApparel: productInput.isApparel,
    isDangerous: productInput.isDangerous,
  })

  const referralFee = profitCalculator.calculateReferralFee(productInput, productInput.price)
  const closingFee = profitCalculator.calculateClosingFee(productInput)

  const numberFix2 = (num: number) => parseFloat(num.toFixed(2))
  const formatValue = (o: IFeeUnit): IFeeUnit => ({ ...o, value: numberFix2(o.value) })

  return {
    fbaFee: formatValue(fbaFee),
    referralFee: formatValue(referralFee),
    closingFee: formatValue(closingFee),
    totalFee: numberFix2(fbaFee.value + referralFee.value + closingFee.value),
    net: numberFix2(
      state.productInput.price - (state.productInput.cost ?? 0) - fbaFee.value - referralFee.value - closingFee.value
    ),
  }
}

function smoothFileds(obj: any, fileds: string[]) {
  for (const key of fileds) {
    obj[key] = obj[key] || 0
  }
  return obj
}

const calculatorSlice = createSlice({
  name: 'calculator',
  initialState,
  reducers: {
    changeLoadStatus: (state, action: PayloadAction<{ status: boolean }>) => {
      state.loading = action.payload.status
    },
    resetFee: (state) => {
      state.productFee = {
        fbaFee: initialFee,
        referralFee: initialFee,
        closingFee: initialFee,
        totalFee: 0,
        net: 0,
      }
    },
    changeProductInput: (state, action: PayloadAction<{ productInput: Partial<IProductInput> }>) => {
      state.productInput = { ...state.productInput, ...action.payload.productInput }
    },
    changeProductCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload
      state.productInput = { ...state.productInput, category: category }
    },
    calculate: (state) => {
      const productInput = smoothFileds(JSON.parse(JSON.stringify(state.productInput)), [
        'width',
        'length',
        'height',
        'weight',
        'price',
        'cost',
      ])
      if (!profitCalculator) return
      try {
        const productDimenions = standardizeDimensions(productInput)
        const tier = profitCalculator.determineTier(productDimenions)
        if (tier !== null) {
          const weight = profitCalculator.calculateWeight(productDimenions, tier)
          state.tier = tier
          state.shippingWeight = weight
          if (state.productInput) {
            state.productInput.isApparel = profitCalculator.verifyApparelCategory(productInput)
          }
          const fees = startToEstimate(state)
          if (fees) {
            state.productFee = fees
          }
        }
      } catch (error) {
        console.log('Error occurs!', error)
        state.error = error.meeeage
      }
    },
  },
})
export const { changeLoadStatus, resetFee, changeProductInput, changeProductCategory, calculate } =
  calculatorSlice.actions
export default calculatorSlice.reducer
