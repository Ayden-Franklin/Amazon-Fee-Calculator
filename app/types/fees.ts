import { IFeeUnit, IMeasureUnit } from '.'

export interface IProductInput {
  length: number
  width: number
  height: number
  dimensionUnit: string
  weight: number
  weightUnit: string
  price: number
  cost: number
  category?: string
  isApparel: boolean
  isDangerous: boolean
}
export interface IProductDimensionData {
  length: IMeasureUnit
  width: IMeasureUnit
  height: IMeasureUnit
  weight: IMeasureUnit
}
export interface IProductCategory {
  category: string
  rawCategory?: string
  breadcrumbTree?: Array<{ name: string }>
}

export interface IProductFbaData {
  tierName: string
  shippingWeight: IMeasureUnit
  isApparel: boolean
  isDangerous: boolean
}
export interface IProductFee {
  fbaFee: IFeeUnit
  referralFee: IFeeUnit
  closingFee: IFeeUnit
  totalFee: number
  net: number
}
