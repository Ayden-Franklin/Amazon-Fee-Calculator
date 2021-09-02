import { IProfitCalculator } from '@src/service/IProfitCalculator'
import { Country, IFeeUnit, IMeasureUnit, Nullable } from '@src/types'
import { IProductCategory, IProductDimensionData, IProductFbaData } from '@src/types/fees'
import { IRuleContent, IRuleCollection, ITier } from '@src/types/rules'
import {
  calculateClosingFee,
  calculateFbaFee,
  calculateReferralFee,
  calculateWeight,
  determineTier,
} from '../calculator'

export abstract class NorthAmerica implements IProfitCalculator {
  abstract currentCountry: Country
  abstract content: IRuleContent
  abstract ruleCollection: IRuleCollection
  determineTier(productDimension: IProductDimensionData): Nullable<ITier> {
    return determineTier(productDimension, this.ruleCollection.tierRules)
  }
  calculateWeight(productDimension: IProductDimensionData, productTier: ITier): IMeasureUnit {
    return calculateWeight(
      productDimension,
      productTier,
      this.ruleCollection.dimensionalWeightRules,
      this.ruleCollection.shippingWeightRules
    )
  }
  calculateFbaFee(productFbaData: IProductFbaData): IFeeUnit {
    return calculateFbaFee({ ...productFbaData, rules: this.ruleCollection.fbaRules })
  }
  calculateReferralFee(productCategories: IProductCategory, price: number): IFeeUnit {
    return calculateReferralFee(productCategories, price, this.currentCountry.code, this.ruleCollection.referralRules)
  }
  calculateClosingFee(productCategories: IProductCategory): IFeeUnit {
    return calculateClosingFee(productCategories, this.currentCountry.code, this.ruleCollection.closingRules)
  }
  verifyApparelCategory(productCategories: IProductCategory): boolean {
    return false
  }
  abstract fetchRuleContent(): void
  abstract parseRule(): IRuleCollection
}
