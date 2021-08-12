declare type Nullable<T> = T | null

declare type StringRecord = Record<string, string>

declare interface Country {
  code: string
  name: string
}
declare interface ICurrency {
  currency: string
}
declare interface IFeeUnit extends ICurrency {
  value: number
}
declare interface ICalculateUnit extends IMeasureUnit {
  operator?: string
}
declare interface IMeasureUnit {
  value: number
  unit: string
}
declare interface IProduct {
  length: IMeasureUnit
  width: IMeasureUnit
  height: IMeasureUnit
  weight: IMeasureUnit
  category?: string
  country: string
}

declare interface ITier {
  name: string
  order: number
  weight: ICalculateUnit
  volumes: Array<ICalculateUnit>
  lengthGirth?: ICalculateUnit
}

declare interface ITierStandardization {
  tierName: string
  standardTierNames?: string[] // using this array to map to the standard tier names
}

declare interface IPackagingWeightItem {
  packagingWeight: IMeasureUnit
  weightConstraint: ICalculateUnit
  description: string
}
declare interface IPackagingWeight extends ITierStandardization {
  items: IPackagingWeightItem[]
}

declare interface IShippingWeight extends ITierStandardization {
  weightConstraint?: ICalculateUnit
  useGreater: boolean // using the greater of the unit weight or the dimensional weight
  roundingUp?: IMeasureUnit
}
declare interface IDimensionalWeightConstraint extends ITierStandardization {
  roundingUpUnit: ICalculateUnit
}
declare interface IDimensionalWeight {
  volumeConstraints?: IDimensionalWeightConstraint[]
  weightConstraints?: IDimensionalWeightConstraint[]
  divisor: number
}

declare interface IFulfillmentFixedUnitFee {
  minimumShippingWeight: ICalculateUnit
  maximumShippingWeight: ICalculateUnit
  fee: IFeeUnit
  shippingWeightText: string
}
declare interface IFulfillmentAdditionalUnitFee {
  shippingWeight: IMeasureUnit
  fee: IFeeUnit
  shippingWeightText: string
}

declare interface IFbaItem extends ITierStandardization {
  isApparel: boolean | 'n/a'
  isDangerous: boolean | 'n/a'
  fixedUnitFees: IFulfillmentFixedUnitFee[]
  additionalUnitFee: IFulfillmentAdditionalUnitFee
}

declare interface IReferralItem extends ICurrency {
  category: string
  // TODO for other category use referralRule
  otherable: boolean
  excludingCategories: string[]
  includingCategories: string[]
  rateItems: IReferralRateFee[]
  minimumFee: number
}

declare interface IReferralRateFee {
  rate: number
  minimumPrice: number
  maximumPrice: number
  description: string
}

declare interface IClosing extends ICurrency {
  categories: string[]
  fee: number
  description?: string
}

declare interface IApparel {
  requireParent: Array<string>
  matchCategory: string
}

declare interface IRuleContent {
  tier: string
  dimensionalWeight: string
  packagingWeight: Nullable<string>
  shippingWeight: string
  fba: string
  referral: string
  closing: Nullable<string>
}

declare interface IRuleCollection {
  tierRules?: ITier[]
  dimensionalWeightRules?: IDimensionalWeight
  packagingRules?: IPackagingWeight[]
  shippingWeightRules?: IShippingWeight[]
  fbaRules?: IFbaItem[]
  referralRules?: IReferralItem[]
  closingRules?: IClosing[]
  apparelRules?: IApparel[]
}
