export class UndefinedProfitCalculator implements ProfitCaluclator {
  content: string
  countryName: string
  constructor(countryName: string) {
    this.content = 'This is content for undefined country'
    this.countryName = countryName
  }
  fetchRuleContent() {
    return Promise.resolve(`This country <span style="color: red">[${this.countryName}]</span> is not supported`)
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
