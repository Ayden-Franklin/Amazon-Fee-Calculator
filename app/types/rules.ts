import { IMeasureUnit, ICalculateUnit, IFeeUnit, ICurrency, Nullable } from '.'

export interface IProductFeeData {
  length: IMeasureUnit
  width: IMeasureUnit
  height: IMeasureUnit
  weight: IMeasureUnit
  category?: string
  country: string
}
export interface ITier {
  name: string
  order: number
  weight: ICalculateUnit
  volumes: Array<ICalculateUnit>
  lengthGirth?: ICalculateUnit
}
export interface ITierStandardization {
  tierName: string
  standardTierNames?: string[] // using this array to map to the standard tier names
}

export interface IPackagingWeightItem {
  packagingWeight: IMeasureUnit
  weightConstraint: ICalculateUnit
  description: string
}
export interface IPackagingWeight extends ITierStandardization {
  items: IPackagingWeightItem[]
}

export interface IShippingWeight extends ITierStandardization {
  weightConstraint?: ICalculateUnit
  useGreater: boolean // using the greater of the unit weight or the dimensional weight
  roundingUp?: IMeasureUnit
}
export interface IDimensionalWeightConstraint extends ITierStandardization {
  roundingUpUnit: ICalculateUnit
}
export interface IDimensionalWeight {
  volumeConstraints?: IDimensionalWeightConstraint[]
  weightConstraints?: IDimensionalWeightConstraint[]
  divisor: number
}

export interface IFulfillmentFixedUnitFee {
  minimumShippingWeight: ICalculateUnit
  maximumShippingWeight: ICalculateUnit
  fee: IFeeUnit
  shippingWeightText: string
}
export interface IFulfillmentAdditionalUnitFee {
  shippingWeight: IMeasureUnit
  fee: IFeeUnit
  shippingWeightText: string
}

export interface IFbaItem extends ITierStandardization {
  isApparel: boolean | 'n/a'
  isDangerous: boolean | 'n/a'
  fixedUnitFees: IFulfillmentFixedUnitFee[]
  additionalUnitFee: IFulfillmentAdditionalUnitFee
}

export interface IReferralItem extends ICurrency {
  category: string
  isOther: boolean
  excludingCategories: string[]
  includingCategories: string[]
  rateItems: IReferralRateFee[]
  minimumFee: number
}

export interface IReferralRateFee {
  rate: number
  minimumPrice: number
  maximumPrice: number
  description: string
}

export interface IClosing extends ICurrency {
  categories: string[]
  fee: number
  description?: string
}

export interface IApparel {
  requireParent: Array<string>
  matchCategory: string
}

export interface IRuleContent {
  tier: string
  dimensionalWeight: string
  packagingWeight: Nullable<string>
  shippingWeight: string
  fba: string
  referral: string
  closing: Nullable<string>
}

export interface IRuleCollection {
  tierRules: ITier[]
  dimensionalWeightRules: IDimensionalWeight
  packagingWeightRules?: IPackagingWeight[]
  shippingWeightRules: IShippingWeight[]
  fbaRules: IFbaItem[]
  referralRules: IReferralItem[]
  closingRules: IClosing[] // Store as an array in order to fit more than one items as the price might not be same
  apparelRules?: IApparel[]
}
