import {
  loadTierTable,
  loadDimensionalWeightRule,
  loadShippingWeightRule,
  loadPackagingRule,
  loadFBATable,
  loadReferralTable,
  loadClosingFee,
} from '@src/service/amazon'
import { IProfitCalculator } from '@src/service/IProfitCalculator'
import { parseTier, parseWeight, parseFba, parseReferral, parseClosing } from '@src/service/parser-mx'

export class MxProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for Mexico',
      dimensionalWeight: 'Loading dimensional weight content for Mexico',
      packaging: 'Loading package content for Mexico',
      shipping: 'Loading shipping content for Mexico',
      fba: 'Loading fba content for Mexico',
      referral: 'Loading referral content for Mexico',
      closing: 'Loading closing content for Mexico',
    }
    this.currentCountry = country
  }
  async fetchRuleContent() {
    const tier = await loadTierTable(this.currentCountry.code)
    const dimensionalWeight = await loadDimensionalWeightRule(this.currentCountry.code)
    const shipping = await loadShippingWeightRule(this.currentCountry.code)
    const packaging = await loadPackagingRule(this.currentCountry.code)
    const fba = await loadFBATable(this.currentCountry.code)
    const referral = await loadReferralTable(this.currentCountry.code)
    this.content = { tier, dimensionalWeight, packaging, shipping, fba, referral, closing: null }
  }
  parseRule() {
    const { referral, closing, tier } = this.content
    const tierRules = parseTier(tier)

    const referralRules = parseReferral(referral)

    const closingRules = parseClosing(closing)
    return { referralRules, closingRules }
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
