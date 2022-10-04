import { IProfitCalculator } from '@src/service/IProfitCalculator'

import { Country } from '@src/types'
import { IRuleContent } from '@src/types/rules'

export class UkProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for United Kingdom',
      dimensionalWeight: 'Loading dimensional weight content for United Kingdom',
      packagingWeight: 'Loading package content for United Kingdom',
      shippingWeight: 'Loading shipping content for United Kingdom',
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
