import {
  loadTierTable,
  loadWeightRule,
  loadShippingRule,
  loadFBATable,
  loadReferralTable,
  loadClosingFee,
} from '@src/service/amazon'
import { IProfitCalculator } from '@src/service/IProfitCalculator'
import { parseTier, parseWeight, parseFba, parseReferral, parseClosing } from '@src/service/parser-us'
export class UsProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: RuleContent
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
    console.log('fetchRuleContent')
    const tier = await loadTierTable(this.currentCountry.code)
    const weight = await loadWeightRule(this.currentCountry.code)
    console.log('start to load shipping rules')
    const shipping = await loadShippingRule(this.currentCountry.code)
    console.log('get the rule for shipping, ', shipping)
    const fba = await loadFBATable(this.currentCountry.code)
    const referral = await loadReferralTable(this.currentCountry.code)
    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, weight, packaging: null, shipping, fba, referral, closing }
  }
  parseRule() {
    const tierRules = parseTier(this.content.tier)
    const dimensionalWeightRule = parseWeight(this.content.weight)
    const shippingWeightRule = parseWeight(this.content.shipping)
    const fbaRules = parseFba(this.content.fba)
    const referralRules = parseReferral(this.content.referral)
    const closingRules = this.content.closing && parseClosing(this.content.closing)
    return {
      tierRules,
      dimensionalWeightRule,
      packageRule: null,
      shippingWeightRule,
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
