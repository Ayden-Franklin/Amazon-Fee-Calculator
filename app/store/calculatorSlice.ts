import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  TierData,
  determineTierByUnit,
  calculateDimensionalWeight,
  calculateShippingWeight,
  calculateFbaFee,
  calculateReferralFee,
  calculateClosingFee,
  calcApparelByCategory,
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
    fbaFee: { value: 0, currency: '' },
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
  fbaFee: IFeeUnit
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
    const dimensionalWeightRule = rules.dimensionalWeightRules
    const dimensionalWeight = calculateDimensionalWeight(productSize, productTier, dimensionalWeightRule)
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
    !state.shippingWeight ||
    !rules.fbaRules ||
    !rules.referralRules ||
    !rules.closingRules
  ) {
    return null
  }
  const productInput = JSON.parse(JSON.stringify(state.productInput))
  // temp full category/categoryName
  productInput.category = productInput.categoryName || productInput.category || ''

  const fbaFee = calculateFbaFee({
    tierName: state.tier.name,
    shippingWeight: state.shippingWeight,
    isApparel: productInput.isApparel,
    isDangerous: productInput.isDangerous,
    rules: rules.fbaRules,
  })

  const referralFee = calculateReferralFee(productInput, rules.referralRules)
  const closingFee = calculateClosingFee(productInput, rules.closingRules)

  const numberFix2 = (num: number) => parseFloat(num.toFixed(2))

  return {
    fbaFee: { ...fbaFee, value: numberFix2(fbaFee.value) },
    referralFee: numberFix2(referralFee),
    closingFee: numberFix2(closingFee),
    totalFee: numberFix2(fbaFee.value + referralFee + closingFee),
    net: numberFix2(
      state.productInput.price - (state.productInput.cost ?? 0) - fbaFee.value - referralFee - closingFee
    ),
  }
}
function calcApparelCategory(productInput: Undefinedable<ProductInput>, ruleCollection: IRuleCollection): boolean {
  if (!productInput) return false
  // temp full category/categoryName
  const product = productInput ? JSON.parse(JSON.stringify(productInput)) : {}
  product.category = product.categoryName || product.category || ''

  return calcApparelByCategory(product, ruleCollection.apparelRules)
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
      state.productFees = {
        fbaFee: { value: 0, currency: '' },
        referralFee: 0,
        closingFee: 0,
        totalFee: 0,
        net: 0,
      }
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
      const rules = action.payload
      const tierAndWeight = calculateProductSize(productInput, rules)
      if (tierAndWeight) {
        const [tier, weight] = tierAndWeight
        state.tier = tier
        state.shippingWeight = weight
      }
      if (state.productInput) {
        state.productInput.isApparel = calcApparelCategory(productInput, rules)
      }
      const fees = startToEstimate(state, rules)
      if (fees) {
        state.productFees = fees
      }
    },
  },
})
export const { changeLoadStatus, resetFee, changeProductInput, changeProductCategory, calculate } =
  calculatorSlice.actions
export default calculatorSlice.reducer
