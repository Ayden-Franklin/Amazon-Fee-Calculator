export interface ReferralRangeFeeItem {
  price: number
  rate: number
}
export interface ReferralFeeItem {
  category: string
  determinateRate: boolean
  rate: number
  rangeItems: ReferralRangeFeeItem[]
  minimumFee: number
}
