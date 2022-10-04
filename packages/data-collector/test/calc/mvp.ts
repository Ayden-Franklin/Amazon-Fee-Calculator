import { UsProfitCalculator } from '../../app/service/countries/USProfitCalculator'
import { standardizeDimensions, calculateProductSize, calculateWeight } from '../../app/service/calculator'
import { verifyApparelCategory, startToEstimate } from '../../app/store/calculatorSlice'

const CountryMap: Record<string, any> = { us: UsProfitCalculator }

interface IProduct {
  price: number
  length: number
  width: number
  height: number
  weight: number
  dimensionUnit: string
  weightUnit: string
}

export function ProfitCalculatorByCountry(country: string) {
  const ProfitCalculator = CountryMap[country]
  const calculator = new ProfitCalculator({ code: country })
  return {
    async init() {
      await calculator.fetchRuleContent()
    },
    calc(product: IProduct) {
      const rules = calculator.parseRule()
      const productInput: any = { ...product }
      const productDimenions = standardizeDimensions(productInput)
      const tier = calculateProductSize(productDimenions, rules.tierRules)
      const shippingWeight = calculateWeight(
        productDimenions,
        tier,
        rules.dimensionalWeightRules,
        rules.shippingWeightRules
      )
      const isApparel = verifyApparelCategory(productInput, rules)
      // TODO isDangerous !!!
      Object.assign(productInput, { isApparel, isDangerous: false })
      const fees = startToEstimate({ productInput, loading: false, tier, shippingWeight } as any, country, rules)
      return fees
    },
  }
}
