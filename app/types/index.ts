import { StateStatus } from '@src/service/constants'

export interface IWeightMeasure {
  unit: string
  value: number
}
export interface ILengthMeasure {
  unit: string
  value: number
}
export interface StateSlice {
  content: RuleContent
  status: StateStatus
  error?: string
  currentCountry: Country
}
