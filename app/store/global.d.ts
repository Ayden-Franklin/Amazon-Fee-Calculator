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
  fbaRule?: FbaRuleItem[]
  referralRule?: IReferralFee[]
  closingRule?: {
    categories: string[]
    fee: number
  }
}
