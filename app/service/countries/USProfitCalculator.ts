import {
  loadTierTable,
  loadDimensionalWeightRule,
  loadShippingWeightRule,
  loadFBATable,
  loadReferralTable,
  loadClosingFee,
  loadExtraRule,
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
} from '@src/service/parser/parser-us'
export class UsProfitCalculator implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  fbaExtra: Nullable<Record<string, string>>
  referralExtra: Nullable<Record<string, string>>
  constructor(country: Country) {
    this.content = {
      tier: 'Loading tier content for US',
      dimensionalWeight: 'Loading dimensional weight content for US',
      packagingWeight: 'Loading package content for US',
      shippingWeight: 'Loading shipping content for US',
      fba: 'Loading tier content for US',
      referral: 'Loading tier content for US',
      closing: 'Loading tier content for US',
    }
    this.currentCountry = country
    this.fbaExtra = null
    this.referralExtra = null
  }
  async fetchRuleContent() {
    const tier = await loadTierTable(this.currentCountry.code)
    const dimensionalWeight = await loadDimensionalWeightRule(this.currentCountry.code)
    console.log('try to load shipping')
    const shippingWeight = await loadShippingWeightRule(this.currentCountry.code)
    console.log('loaded shippingWeight successfully')
    const fba = await loadFBATable(this.currentCountry.code)
    console.log('loaded fba')
    this.fbaExtra = await loadExtraRule(this.currentCountry.code, 'fba')

    const referral = await loadReferralTable(this.currentCountry.code)
    this.referralExtra = await loadExtraRule(this.currentCountry.code, 'referral')

    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, dimensionalWeight, packagingWeight: null, shippingWeight, fba, referral, closing }
  }
  parseRule() {
    const tierRules = parseTier(this.content.tier)
    const dimensionalWeightRules = parseDimensionalWeight(this.content.dimensionalWeight)
    const shippingWeightRules = parseShippingWeight(this.content.shippingWeight)
    const fbaRules = parseFba(this.content.fba)
    const apparelRules = parseApparel(this.fbaExtra?.apparel)
    const referralRules = parseReferral(this.content.referral, this.referralExtra)
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
