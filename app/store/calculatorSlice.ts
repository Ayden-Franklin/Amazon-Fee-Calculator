import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  calculateFbaFee,
  calculateReferralFee,
  calculateClosingFee,
  verifyApparelByCategory,
  standardizeDimensions,
  calculateProductSize,
  calculateWeight,
} from '@src/service/calculator'
import { StateStatus } from '@src/renderer/constants'
import { NotAvailable } from '@src/service/constants'
import { IMeasureUnit, Nullable } from '@src/types/'
import { IRuleCollection, ITier } from '@src/types/rules'
import { IProductInput, IProductFee } from '@src/types/fees'
import { IFeeUnit } from '@src/types'

interface CalculatorState {
  productInput?: IProductInput
  loading: boolean
  tier: Nullable<ITier>
  shippingWeight: IMeasureUnit
  productFee: IProductFee
  status: StateStatus
  error?: string
}
const initialFee = { value: 0, currency: '' }
const initialState: CalculatorState = {
  loading: false,
  tier: null,
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

function startToEstimate(state: CalculatorState, country: string, rules: IRuleCollection): Nullable<IProductFee> {
  if (
    !state.tier ||
    !state.productInput ||
    !state.shippingWeight ||
    !rules.fbaRules ||
    !rules.referralRules ||
    !rules.closingRules
  ) {
    return null
  }
  const productInput = JSON.parse(JSON.stringify(state.productInput))
  productInput.category = productInput.category || ''

  const fbaFee = calculateFbaFee({
    tierName: state.tier.name,
    shippingWeight: state.shippingWeight,
    isApparel: productInput.isApparel,
    isDangerous: productInput.isDangerous,
    rules: rules.fbaRules,
  })

  const referralFee = calculateReferralFee(productInput.category, productInput.price, country, rules.referralRules)
  const closingFee = calculateClosingFee(productInput, country, rules.closingRules)

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
function verifyApparelCategory(productInput: IProductInput, ruleCollection: IRuleCollection): boolean {
  if (!productInput) return false
  const product = productInput ? JSON.parse(JSON.stringify(productInput)) : {}
  product.category = product.category || ''

  return verifyApparelByCategory(product, ruleCollection.apparelRules)
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
    calculate: (state, action) => {
      const productInput = smoothFileds(JSON.parse(JSON.stringify(state.productInput)), [
        'width',
        'length',
        'height',
        'weight',
        'price',
        'cost',
      ])
      const { country, rules } = action.payload
      if (!rules) {
        // Because of the data injection. This might be undifined
        return
      }
      try {
        const productDimenions = standardizeDimensions(productInput)
        const tier = calculateProductSize(productDimenions, rules.tierRules)
        const weight = calculateWeight(productDimenions, tier, rules.dimensionalWeightRules, rules.shippingWeightRules)
        state.tier = tier
        state.shippingWeight = weight
        if (state.productInput) {
          state.productInput.isApparel = verifyApparelCategory(productInput, rules)
        }
        const fees = startToEstimate(state, country, rules)
        if (fees) {
          state.productFee = fees
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
