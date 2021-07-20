class USProfitCalculator implements ProfitCaluclator {
  content: string
  constructor() {
    this.content = ''
  }
  fetchRuleContent() {
    return 'test'
  }
  parseRule() {
    return null
  }
  calculateFbaFee(): number | Error {
    return 0
  }
  calculateReferralFee(): number | Error {
    return 0
  }
  calculateClosingFee(): number | Error {
    return 0
  }
}
