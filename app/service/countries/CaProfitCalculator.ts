import { loadTierTable, loadWeightRule, loadFBATable, loadReferralTable, loadClosingFee } from '@src/service/amazon'
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
  async fetchRuleContent() {
    const tier = await loadTierTable(this.currentCountry.code)
    const weight = await loadWeightRule(this.currentCountry.code)

    const fba = await loadFBATable(this.currentCountry.code)
    const referral = await loadReferralTable(this.currentCountry.code)
    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, weight, fba, referral, closing }
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
