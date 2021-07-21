import { StateStatus } from '@src/service/constants'

export interface StateSlice {
  content: RuleContent
  status: StateStatus
  error?: string
  currentCountry: Country
}
