import { loadTierTable } from '@src/service/amazon'
import { IProfitCaluclator } from '@src/service/IProfitCalculator'

export class CaProfitCalculator implements IProfitCaluclator {
  currentCountry: Country
  content: RuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for Canada',
      weight: 'Loading weight content for Canada',
      fba: 'Loading fba content for Canada',
      referral: 'Loading referral content for Canada',
      closing: 'Loading closing content for Canada',
    }
    this.currentCountry = country
  }
  fetchRuleContent() {
    // return loadTierTable('ca')
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
