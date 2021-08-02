import {
  loadTierTable,
  loadDimensionalWeightRule,
  loadShippingWeightRule,
  loadFBATable,
  loadReferralTable,
  loadClosingFee,
  loadSubRule,
} from '@src/service/amazon'
import { IProfitCalculator } from '@src/service/IProfitCalculator'
import {
  parseTier,
  parseDimensionalWeight,
  parseShippingWeight,
  parseFba,
  parseReferral,
  parseClosing,
  parseApparel,
} from '@src/service/parser-us'
export class UsProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for US',
      dimensionalWeight: 'Loading dimensional weight content for US',
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
    const dimensionalWeight = await loadDimensionalWeightRule(this.currentCountry.code)
    const shipping = await loadShippingWeightRule(this.currentCountry.code)
    const fbaRule = await loadFBATable(this.currentCountry.code)
    const fbaSub = await await loadSubRule(this.currentCountry.code, 'fba')
    const fba = fbaSub !== null ? { rule: fbaRule, ...fbaSub } : fbaRule

    const referralRule = await loadReferralTable(this.currentCountry.code)
    const referralSub = await loadSubRule(this.currentCountry.code, 'referral')
    const referral = referralSub !== null ? { rule: referralRule, ...referralSub } : referralRule

    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, dimensionalWeight, packaging: null, shipping, fba, referral, closing }
  }
  parseRule() {
    const tierRules = parseTier(this.content.tier)
    const dimensionalWeightRules = parseDimensionalWeight(this.content.dimensionalWeight)
    const shippingWeightRules = parseShippingWeight(this.content.shipping)

    const { referral, fba } = this.content
    // fba maybe string or object
    const fbaRuleContext = typeof fba === 'string' ? fba : fba.rule
    const fbaSubRule = typeof fba === 'object' ? fba : {}
    const fbaRules = parseFba(fbaRuleContext)
    const apparelRules = parseApparel(fbaSubRule?.apparel)
    // referral maybe string or object
    const referralRuleContext = typeof referral === 'string' ? referral : referral.rule
    const referralSubRule = typeof referral === 'object' ? referral : {}
    const referralRules = parseReferral(referralRuleContext, referralSubRule)
    // closingFee
    const closingRules = parseClosing(this.content.closing)
    return {
      tierRules,
      dimensionalWeightRules,
      shippingWeightRules,
      fbaRules,
      apparelRules,
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
