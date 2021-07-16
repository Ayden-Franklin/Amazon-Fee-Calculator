import { IWeightMeasure } from '@src/types'

export interface FulfillmentItem {
  minimumShippingWeight: IWeightMeasure
  maximumShippingWeight: IWeightMeasure
  firstWeightAmmount: number
  firstWeightFee: number
  additionalUnitFee: number
  shippingWeight: string
  fee: string
}
export interface TierItem {
  [key: string]: FulfillmentItem[]
}
export interface ProductTierItem {
  [key: string]: TierItem[]
}
