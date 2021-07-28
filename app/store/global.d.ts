declare type Nullable<T> = T | null

declare type Undefinedable<T> = T | undefined

declare type Nilable<T> = T | undefined | null

declare type StringRecord = Record<string, string>

declare type Or<T, K> = T | K

declare interface Country {
  code: string
  name: string
}
declare interface IRuleContent {
  tier: string
  dimensionalWeight: string
  packaging: Nullable<string>
  shipping: string
  fba: Or<string, StringRecord>
  referral: Or<string, StringRecord>
  closing: Nullable<string>
}

declare interface IMeasureUnit {
  value: number
  unit: string
}
declare interface ICalculateUnit extends IMeasureUnit {
  operator?: string
}

declare interface IProduct {
  length: IMeasureUnit
  width: IMeasureUnit
  height: IMeasureUnit
  weight: IMeasureUnit
  category: Undefinedable<string>
  country: string
}

declare interface ITier {
  name: string
  order: number
  weight: ICalculateUnit
  volumes: Array<ICalculateUnit>
  lengthGirth?: ICalculateUnit
}

declare interface IFulfillmentItem {
  minimumShippingWeight: ICalculateUnit
  maximumShippingWeight: ICalculateUnit
  firstWeightAmount: number
  firstWeightFee: number
  additionalUnitFee: number
  shippingWeightText: string
  fee: string
}
declare interface IFbaRuleItem {
  tierName: string
  isApparel: boolean | 'n/a'
  isDangerous: boolean | 'n/a'
  items: IFulfillmentItem[]
}

declare interface IReferralRateFeeItem {
  rate: number
  minPrice: number
  maxPrice: number
  desc: string
}
declare interface IReferralFee {
  category: string
  // TODO for other category use referralRule
  otherable: boolean
  excludingCategories: string[]
  includingCategories: string[]
  rateItems: IReferralRateFeeItem[]
  minimumFee: number
}
declare interface ITierStandardization {
  tierName: string
  standardTierNames: string[] // using this array to map to the standard tier names
}
declare interface IPackagingWeightItem {
  packagingWeight: IMeasureUnit
  minimumWeightUnit: ICalculateUnit
  desc: string
}
declare interface IPackagingWeight extends ITierStandardization {
  items: IPackagingWeightItem[]
}

declare interface IShippingWeight extends ITierStandardization {
  weight: ICalculateUnit
  useGreater: boolean // using the greater of the unit weight or the dimensional weight
  roundingUp: IMeasureUnit
}
declare interface IDimensionalWeightConstraint extends ITierStandardization {
  roundingUpUnit: ICalculateUnit
}
declare interface IDimensionalWeightRule {
  volumeConstraints?: IDimensionalWeightConstraint[]
  weightConstraints?: IDimensionalWeightConstraint[]
  divisor: number
}
declare interface IClosingRule {
  categories: string[]
  fee: number
  desc?: string
}

declare interface IApparelRule {
  requireParent: Array<string>
  matchCategory: string
}

declare interface IRuleCollection {
  tierRules?: ITier[]
  dimensionalWeightRules?: IDimensionalWeightRule
  packagingRules?: IPackagingWeight[]
  shippingWeightRules?: IShippingWeight[]
  fbaRules?: IFbaRuleItem[]
  referralRules?: IReferralFee[]
  closingRules?: IClosingRule[]
  apparelRules?: IApparelRule[]
}
