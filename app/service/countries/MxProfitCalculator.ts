import { loadTierTable, loadWeightRule, loadFBATable, loadReferralTable, loadClosingFee } from '@src/service/amazon'
import { IProfitCaluclator } from '@src/service/IProfitCalculator'
import { parseTier, parseWeight, parseFba, parseReferral, parseClosing } from '@src/service/parser-mx'

export class MxProfitCalculator implements IProfitCaluclator {
  currentCountry: Country
  content: RuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for Mexico',
      weight: 'Loading weight content for Mexico',
      package: 'Loading package content for Mexico',
      shipping: 'Loading shipping content for Mexico',
      fba: 'Loading fba content for Mexico',
      referral: 'Loading referral content for Mexico',
      closing: 'Loading closing content for Mexico',
    }
    this.currentCountry = country
  }
  async fetchRuleContent() {
    const tier = await loadTierTable(this.currentCountry.code)
    const weight = await loadWeightRule(this.currentCountry.code)
    const shipping = 'TODO'
    const fba = await loadFBATable(this.currentCountry.code)
    const referral = await loadReferralTable(this.currentCountry.code)
    // const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, weight, package: null, shipping, fba, referral, closing: null }
  }
  parseRule() {
    const tierRules = parseTier(this.content.tier)
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
