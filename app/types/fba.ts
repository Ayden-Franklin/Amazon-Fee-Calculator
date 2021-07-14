export interface FulfillmentItem {
  // minimumShippingWeight: number
  // maximumShippingWeight: number
  // fee: number
  shippingWeight: string
  fee: string
}
export interface TierItem {
  [key: string]: FulfillmentItem[]
}
export interface ProductTierItem {
  [key: string]: TierItem[]
}
