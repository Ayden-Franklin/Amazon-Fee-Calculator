import { IProfitCalculator } from '@src/service/IProfitCalculator'

export class UkProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for United Kingdom',
      weight: 'Loading weight content for United Kingdom',
      packaging: 'Loading package content for United Kingdom',
      shipping: 'Loading shipping content for United Kingdom',
      fba: 'Loading fba content for United Kingdom',
      referral: 'Loading referral content for United Kingdom',
      closing: 'Loading closing content for United Kingdom',
    }
    this.currentCountry = country
  }
  fetchRuleContent() {
    // return loadTierTable('uk')
    throw new Error('Not support at this time.')
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
