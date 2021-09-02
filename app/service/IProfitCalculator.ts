import { Country, IFeeUnit, IMeasureUnit, Nullable } from '@src/types'
import { IProductCategory, IProductDimensionData, IProductFbaData } from '@src/types/fees'
import { IRuleContent, IRuleCollection, ITier } from '@src/types/rules'

export interface IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  ruleCollection: IRuleCollection | undefined
  fetchRuleContent: () => void // TODO: we can define an object to store all the rules content and rules
  parseRule: () => IRuleCollection
  determineTier: (productDimension: IProductDimensionData) => Nullable<ITier>
  verifyApparelCategory: (productCategories: IProductCategory) => boolean
  calculateWeight: (productDimension: IProductDimensionData, productTier: ITier) => IMeasureUnit
  calculateFbaFee: (productFbaData: IProductFbaData) => IFeeUnit
  calculateReferralFee: (productCategories: IProductCategory, price: number) => IFeeUnit
  calculateClosingFee: (productCategories: IProductCategory) => IFeeUnit
}
