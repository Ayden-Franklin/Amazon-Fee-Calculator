import { IProfitCaluclator } from '@src/service/IProfitCalculator'

export class UndefinedProfitCalculator implements IProfitCaluclator {
  currentCountry: Country
  content: RuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'This is content for undefined country',
      weight: 'This is content for undefined country',
      fba: 'This is content for undefined country',
      referral: 'This is content for undefined country',
      closing: 'This is content for undefined country',
    }
    this.currentCountry = country
  }
  fetchRuleContent() {
    return Promise.reject(Error(`This country [${this.currentCountry.name}] is not supported.`))
  }
  parseRule() {
    return {}
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
