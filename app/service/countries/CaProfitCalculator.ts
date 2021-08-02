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
import {
  parseTier,
  parseDimensionalWeight,
  parsePackagingWeight,
  parseShippingWeight,
  parseFba,
  parseReferral,
  parseClosing,
} from '@src/service/parser-ca'

export class CaProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for Canada',
      dimensionalWeight: 'Loading dimensional weight content for Canada',
      packaging: 'Loading package content for Canada',
      shipping: 'Loading shipping content for Canada',
      fba: 'Loading fba content for Canada',
      referral: 'Loading referral content for Canada',
      closing: 'Loading closing content for Canada',
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
    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, dimensionalWeight, packaging, shipping, fba, referral, closing }
  }
  parseRule() {
    const { referral } = this.content
    const tierRules = parseTier(this.content.tier)
    const dimensionalWeightRules = parseDimensionalWeight(this.content.dimensionalWeight)
    let packaging = null
    if (this.content.packaging) {
      packaging = parsePackagingWeight(this.content.packaging)
    }
    const shippingWeightRules = parseShippingWeight(this.content.shipping)
    // referral maybe string or object
    const referralRuleContext = typeof referral === 'string' ? referral : referral.rule
    const referralRules = parseReferral(referralRuleContext)
    // closingFee
    const closingRules = parseClosing(this.content.closing)
    return { tierRules, dimensionalWeightRules, packaging, shippingWeightRules, referralRules, closingRules }
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
