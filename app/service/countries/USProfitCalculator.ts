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
    const fba = await loadFBATable(this.currentCountry.code)
    this.fbaSub = await await loadSubRule(this.currentCountry.code, 'fba')

    const referral = await loadReferralTable(this.currentCountry.code)
    this.referralSub = await loadSubRule(this.currentCountry.code, 'referral')

    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, dimensionalWeight, packaging: null, shipping, fba, referral, closing }
  }
  parseRule() {
    const tierRules = parseTier(this.content.tier)
    const dimensionalWeightRules = parseDimensionalWeight(this.content.dimensionalWeight)
    const shippingWeightRules = parseShippingWeight(this.content.shipping)
    const fbaRules = parseFba(this.content.fba)
    const apparelRules = parseApparel(this.fbaSub?.apparel)
    const referralRules = parseReferral(this.content.referral, this.referralSub)
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
