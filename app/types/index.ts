export type Nullable<T> = T | null

export type StringRecord = Record<string, string>
export interface Country {
  code: string
  name: string
}
export interface ICurrency {
  currency: string
}
export interface IFeeUnit extends ICurrency {
  value: number
}
export interface ICalculateUnit extends IMeasureUnit {
  operator?: string
}
export interface IMeasureUnit {
  value: number
  unit: string
}
