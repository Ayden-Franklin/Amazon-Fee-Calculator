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
import { NotAvailable } from '@src/service/constants'
import { sortByUnit } from '@src/service/utils'

interface CalculatorState {
  productInput?: ProductInput
  loading: boolean
  tier: Nullable<ITier>
  shippingWeight: IMeasureUnit
  productFees: ProductFees
  status: StateStatus
  error?: string
}
const initialState: CalculatorState = {
  loading: false,
  tier: null,
  shippingWeight: { value: 0, unit: NotAvailable },
  status: StateStatus.Idle,
  productInput: {
    width: 0,
    height: 0,
    length: 0,
    weight: 0,
    price: 0,
    cost: 0,
    isApparel: false,
    isDangerous: false,
  },
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
function calculateProductSize(input: Undefinedable<ProductInput>, rules: any): Undefinedable<[ITier, IMeasureUnit]> {
  if (!input) return
  const country = rules.country
  const tierData: TierData = { ...input, country }
  const tierRules: Array<ITier> = rules.tierRules ?? []

  const initialProductSize = toProductTier(tierData)
  let { length, width, height } = { ...initialProductSize }
  const [shortest, median, longest] = sortByUnit(length, width, height)
  const productSize = { ...initialProductSize, length: longest, width: median, height: shortest }
  const productTier = determineTierByUnit(productSize, tierRules)

  if (productTier) {
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
function startToEstimate(state: CalculatorState, rules: IRuleCollection): Nullable<ProductFees> {
  if (
    !state.tier ||
    !state.productInput ||
    !state.productInput.categoryName ||
    !state.shippingWeight ||
    !rules.fbaRules ||
    !rules.referralRules ||
    !rules.closingRules
  ) {
    return null
  }
  const productInput = JSON.parse(JSON.stringify(state.productInput))

  const safeNumber = (v: number | Error) => {
    if (typeof v === 'number') {
      return v
    }
    console.warn('calc something get error', v)
    return NaN
  }

  const fbaFee = safeNumber(
    calculateFbaFee({
      tierName: state.tier.name,
      shippingWeight: state.shippingWeight,
      isApparel: productInput.isApparel,
      isDangerous: productInput.isDangerous,
      rules: rules.fbaRules,
    })
  )

  const referralFee = calculateReferralFee(productInput, rules.referralRules)
  const closingFee = calculateClosingFee(productInput, rules.closingRules)

  const numberFix2 = (num: number) => parseFloat(num.toFixed(2))

  return {
    fbaFee: numberFix2(fbaFee),
    referralFee: numberFix2(referralFee),
    closingFee: numberFix2(closingFee),
    totalFee: numberFix2(fbaFee + referralFee + closingFee),
    net: numberFix2(state.productInput.price - (state.productInput.cost ?? 0) - fbaFee - referralFee - closingFee),
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
    changeProductInput: (state, action: PayloadAction<{ productInput: Partial<ProductInput> }>) => {
      state.productInput = { ...state.productInput, ...action.payload.productInput }
    },
    changeProductCategory: (state, action: PayloadAction<string>) => {
      const category = action.payload
      state.productInput = { ...state.productInput, categoryCode: category, categoryName: category }
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
      const tierAndWeight = calculateProductSize(productInput, action.payload)
      if (tierAndWeight) {
        const [tier, weight] = tierAndWeight
        state.tier = tier
        state.shippingWeight = weight
      }
      const fees = startToEstimate(state, action.payload)
      if (fees) {
        state.productFees = fees
      }
    },
  },
})
export const { changeLoadStatus, changeProductInput, changeProductCategory, calculate } = calculatorSlice.actions
export default calculatorSlice.reducer
