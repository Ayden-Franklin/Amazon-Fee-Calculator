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
import Parser from '@src/service/parser/parser-us'
import { Country, Nullable } from '@src/types'
import { IRuleContent } from '@src/types/rules'
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
    const shippingWeight = await loadShippingWeightRule(this.currentCountry.code)
    const fba = await loadFBATable(this.currentCountry.code)
    this.fbaExtra = await loadExtraRule(this.currentCountry.code, 'fba')

    const referral = await loadReferralTable(this.currentCountry.code)
    this.referralExtra = await loadExtraRule(this.currentCountry.code, 'referral')

    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, dimensionalWeight, packagingWeight: null, shippingWeight, fba, referral, closing }
  }
  parseRule() {
    const tierRules = Parser.parseTier(this.content.tier)
    const dimensionalWeightRules = Parser.parseDimensionalWeight(this.content.dimensionalWeight)
    const shippingWeightRules = Parser.parseShippingWeight(this.content.shippingWeight)
    const fbaRules = Parser.parseFba(this.content.fba)
    const apparelRules = Parser.parseApparel(this.fbaExtra?.apparel || '')
    const referralRules = Parser.parseReferral(this.content.referral, this.referralExtra || {})
    // closingFee
    const closingRules = Parser.parseClosing(this.content.closing)
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
