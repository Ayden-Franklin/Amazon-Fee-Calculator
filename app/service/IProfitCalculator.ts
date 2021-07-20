interface ProfitCaluclator {
  content: string
  fetchRuleContent: () => Promise<string> // TODO: we can define an object to store all the rules content and rules
  parseRule: () => any
  calculateFbaFee: () => number | Error
  calculateReferralFee: () => number | Error
  calculateClosingFee: () => number | Error
}
