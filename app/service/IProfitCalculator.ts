export interface IProfitCalculator {
  currentCountry: Country
  content: RuleContent
  fetchRuleContent: () => void // TODO: we can define an object to store all the rules content and ruless
  parseRule: () => Rule
  calculateFbaFee: () => number | Error
  calculateReferralFee: () => number | Error
  calculateClosingFee: () => number | Error
}
