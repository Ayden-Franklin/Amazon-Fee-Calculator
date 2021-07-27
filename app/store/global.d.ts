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
  weight: string
  packaging: Nullable<string>
  shipping: string
  fba: string
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
declare interface IPackagingWeightItem {
  packagingWeight: number
  minWeight: IMeasureUnit
  maxWeight: IMeasureUnit
  desc: string
}
declare interface IPackagingWeight {
  tierName: string
  standardTierNames: string[] // using this array to map to the standard tier names
  useGreater: IPackagingWeightItem[]
}

declare interface IShippingWeight {
  tierName: string
  standardTierNames: string[] // using this array to map to the standard tier names
  weight: ICalculateUnit
  useGreater: boolean // using the greater of the unit weight or the dimensional weight
  roundingUp: IMeasureUnit
}

declare interface IRule {
  tierRules?: ITier[]
  dimensionalWeightRules?: {
    tierName: string
    standardTierNames: string[] // using this array to map to the standard tier names
    minimumMeasureUnit: ICalculateUnit
    divisor: number
  }
  packageRules?: any
  shippingWeightRules?: IShippingWeight[]
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
