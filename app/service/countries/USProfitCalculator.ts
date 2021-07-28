import {
  loadTierTable,
  loadDimensionalWeightRule,
  loadShippingWeightRule,
  loadFBATable,
  loadReferralTable,
  loadClosingFee,
  loadReferralSubRule,
} from '@src/service/amazon'
import { IProfitCalculator } from '@src/service/IProfitCalculator'
import {
  parseTier,
  parseDimensionalWeight,
  parseShippingWeight,
  parseFba,
  parseReferral,
  parseClosing,
} from '@src/service/parser-us'
export class UsProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for US',
      weight: 'Loading tier content for US',
      packaging: 'Loading package content for US',
      shipping: 'Loading shipping content for US',
      fba: 'Loading tier content for US',
      referral: 'Loading tier content for US',
      closing: 'Loading tier content for US',
    }
    this.currentCountry = country
  }
  async fetchRuleContent() {
    const tier = await loadTierTable(this.currentCountry.code)
    const weight = await loadDimensionalWeightRule(this.currentCountry.code)
    const shipping = await loadShippingWeightRule(this.currentCountry.code)
    const fba = await loadFBATable(this.currentCountry.code)
    const referralRule = await loadReferralTable(this.currentCountry.code)
    const referralSub = await loadReferralSubRule(this.currentCountry.code)
    const referral = referralSub !== null ? { rule: referralRule, ...referralSub } : referralRule
    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, weight, packaging: null, shipping, fba, referral, closing }
  }
  parseRule() {
    const tierRules = parseTier(this.content.tier)
    const dimensionalWeightRules = parseDimensionalWeight(this.content.weight)
    const shippingWeightRules = parseShippingWeight(this.content.shipping)
    const fbaRules = parseFba(this.content.fba)
    // referral maybe string or object
    const { referral } = this.content
    const referralRuleContext = typeof referral === 'string' ? referral : referral.rule
    const referralSubRule = typeof referral === 'object' ? referral : {}
    const referralRules = parseReferral(referralRuleContext, referralSubRule)
    // closingFee
    const closingRules = parseClosing(this.content.closing)
    return {
      tierRules,
      dimensionalWeightRules,
      packageRules: null,
      shippingWeightRules,
      fbaRules,
      referralRules,
      closingRules,
    }
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
