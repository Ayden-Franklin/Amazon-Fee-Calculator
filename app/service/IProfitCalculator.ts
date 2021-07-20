interface ProfitCaluclator {
  content: string
  fetchRuleContent: () => string
  parseRule: () => any
  calculateFbaFee: () => number | Error
  calculateReferralFee: () => number | Error
  calculateClosingFee: () => number | Error
}
