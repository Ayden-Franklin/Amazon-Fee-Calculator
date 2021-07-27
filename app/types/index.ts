import { StateStatus } from '@src/renderer/constants'

export interface StateSlice {
  content: IRuleContent
  status: StateStatus
  error?: string
  currentCountry: Country
}
