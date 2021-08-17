import { Country } from '@src/types'
import { IRuleContent, IRuleCollection } from '@src/types/rules'

export interface IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  fetchRuleContent: () => void // TODO: we can define an object to store all the rules content and rules
  parseRule: () => IRuleCollection
  calculateFbaFee: () => number | Error
  calculateReferralFee: () => number | Error
  calculateClosingFee: () => number | Error
}
