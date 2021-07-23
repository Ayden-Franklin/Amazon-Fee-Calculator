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
  fba: string
  referral: string
  closing: string
}
declare interface Iu {
  value: number
  unit: Nilable<string>
  operator?: string
}

declare interface IProduct {
  length: Iu
  width: Iu
  height: Iu
  weight: Iu
  category: Undefinedable<string>
  country: string
}

declare interface ITier {
  name: string
  order: number
  weight: Iu
  volumes: Array<Iu>
  lengthGirth?: Iu
}

declare interface FulfillmentItem {
  minimumShippingWeight: Iu
  maximumShippingWeight: Iu
  firstWeightAmmount: number
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

declare interface ReferralRateFeeItem {
  rate: number
  minPrice: number
  maxPrice: number
  desc: string
}
declare interface ReferralFee {
  category: string
  excludingCategorys: string[]
  includeingCategorys: string[]
  rateItems: ReferralRateFeeItem[]
  minimumFee: number
}

declare interface Rule {
  tierRules?: ITier[]
  diemnsionalWeightRule?: {
    minimumWeight: number
    divisor: number
  }
  fbaRule?: {
    standard: Record<string, Array<Record<string, Array<string>>>>
    oversize: Record<string, Array<Record<string, Array<string>>>>
  }
  referralRule?: ReferralFee[]
  closingRule?: {
    categories: string[]
    fee: number
  }
}
