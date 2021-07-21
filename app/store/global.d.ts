import { StateStatus } from '@src/service/constants'

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
  unit: string
  symbol?: string
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
  type: string
  order: number
  weight: Iu
  volumes: Array<Iu>
  lengthGirth: Iu
}

declare interface ReferralRangeFeeItem {
  price: number
  rate: number
}
declare interface ReferralFeeItem {
  category: string
  determinateRate: boolean
  rate: number
  rangeItems: ReferralRangeFeeItem[]
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
  referralRule?: ReferralFeeItem[]
  closingRule?: {
    categories: string[]
    fee: number
  }
}
