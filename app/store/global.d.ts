declare type Nullable<T> = T | null

declare type Undefinedable<T> = T | undefined

declare type Nilable<T> = T | undefined | null

declare interface Country {
  code: string
  name: string
}
declare interface RuleContent {
  tier: string
  weight: string
  packaging: Nullable<string>
  shipping: string
  fba: string
  referral: string
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
  length: ICalculateUnit
  width: ICalculateUnit
  height: ICalculateUnit
  weight: ICalculateUnit
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

declare interface FulfillmentItem {
  minimumShippingWeight: ICalculateUnit
  maximumShippingWeight: ICalculateUnit
  firstWeightAmount: number
  firstWeightFee: number
  additionalUnitFee: number
  shippingWeight: string
  fee: string
}
declare interface TierItem {
  [key: string]: FulfillmentItem[]
}

declare interface ProductTierItem {
  [key: string]: TierItem[]
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
declare interface PackagingWeightItem {
  packagingWeight: number
  minWeight: IMeasureUnit
  maxWeight: IMeasureUnit
  desc: string
}
declare interface PackagingWeight {
  tierName: string
  useGreater: PackagingWeightItem[]
}

declare interface ShippingWeight {
  tierName: string
  weight: IMeasureUnit
  useGreater: boolean // using the greater of the unit weight or the dimensional weight
  roundingUp: IMeasureUnit
}

declare interface Rule {
  tierRules?: ITier[]
  dimensionalWeightRule?: {
    tierName: string
    minimumWeight: IMeasureUnit
    divisor: number
  }
  packageRule?: any
  shippingWeightRule?: ShippingWeight[]
  fbaRule?: {
    standard: Record<string, Array<Record<string, Array<string>>>>
    oversize: Record<string, Array<Record<string, Array<string>>>>
  }
  referralRule?: IReferralFee[]
  closingRule?: {
    categories: string[]
    fee: number
  }
}
