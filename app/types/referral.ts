export interface ReferralRangeFeeItem {
  price: number
  rate: number
}
export interface ReferralFeeItem {
  categoriy: string
  determinateRate: boolean
  rate: number
  rangeItems: ReferralRangeFeeItem[]
  minimumFee: number
}
