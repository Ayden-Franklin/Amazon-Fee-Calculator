export interface IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  fetchRuleContent: () => void // TODO: we can define an object to store all the rules content and ruless
  parseRule: () => IRuleCollection
  calculateFbaFee: () => number | Error
  calculateReferralFee: () => number | Error
  calculateClosingFee: () => number | Error
}
