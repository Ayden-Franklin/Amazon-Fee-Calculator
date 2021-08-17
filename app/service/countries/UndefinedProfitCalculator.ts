import { IProfitCalculator } from '@src/service/IProfitCalculator'
import { Country } from '@src/types'
import { IRuleContent } from '@src/types/rules'

export class UndefinedProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'This is content for undefined country',
      dimensionalWeight: 'This is content for undefined country',
      packagingWeight: 'Loading packaging content for undefined country',
      shippingWeight: 'Loading shipping content for undefined country',
      fba: 'This is content for undefined country',
      referral: 'This is content for undefined country',
      closing: 'This is content for undefined country',
    }
    this.currentCountry = country
  }
  fetchRuleContent() {
    return Promise.reject(Error(`This country [${this.currentCountry.name}] is not supported yet.`))
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
