import { StateStatus } from '@src/renderer/constants'

export interface StateSlice {
  content: RuleContent
  status: StateStatus
  error?: string
  currentCountry: Country
}
