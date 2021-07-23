import { loadTierTable, loadWeightRule, loadFBATable, loadReferralTable, loadClosingFee } from '@src/service/amazon'
import { IProfitCalculator } from '@src/service/IProfitCalculator'
import { parseTier, parseWeight, parseFba, parseReferral, parseClosing } from '@src/service/parser-us'
export class UsProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: RuleContent
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for US',
      weight: 'Loading tier content for US',
      package: 'Loading package content for US',
      shipping: 'Loading shipping content for US',
      fba: 'Loading tier content for US',
      referral: 'Loading tier content for US',
      closing: 'Loading tier content for US',
    }
    this.currentCountry = country
  }
  async fetchRuleContent() {
    const tier = await loadTierTable(this.currentCountry.code)
    const weight = await loadWeightRule(this.currentCountry.code)

    const shipping = 'TODO'
    const fba = await loadFBATable(this.currentCountry.code)
    const referral = await loadReferralTable(this.currentCountry.code)
    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, weight, package: null, shipping, fba, referral, closing }
  }
  parseRule() {
    const tierRules = parseTier(this.content.tier)
    const dimensionalWeightRule = parseWeight(this.content.weight)
    const fbaRules = parseFba(this.content.fba)
    const referralRules = parseReferral(this.content.referral)
    const closingRules = parseClosing(this.content.closing)
    return { tierRules, dimensionalWeightRule, fbaRules, referralRules, closingRules }
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
