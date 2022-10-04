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
import { NorthAmerica } from '@src/service/countries/NorthAmerica'
import {
  parseTier,
  parseDimensionalWeight,
  parsePackagingWeight,
  parseShippingWeight,
  parseFba,
  parseReferral,
  parseClosing,
} from '@src/service/parser/parser-ca'
import { Country } from '@src/types'
import { IRuleCollection, IRuleContent } from '@src/types/rules'

export class CaProfitCalculator extends NorthAmerica implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  ruleCollection!: IRuleCollection
  constructor(country: Country) {
    super()
    this.content = {
      tier: 'Loading tier content for Canada',
      dimensionalWeight: 'Loading dimensional weight content for Canada',
      packagingWeight: 'Loading package content for Canada',
      shippingWeight: 'Loading shipping content for Canada',
      fba: 'Loading fba content for Canada',
      referral: 'Loading referral content for Canada',
      closing: 'Loading closing content for Canada',
    }
    this.currentCountry = country
  }
  async fetchRuleContent() {
    const tier = await loadTierTable(this.currentCountry.code)
    const dimensionalWeight = await loadDimensionalWeightRule(this.currentCountry.code)
    const shippingWeight = await loadShippingWeightRule(this.currentCountry.code)
    const packagingWeight = await loadPackagingRule(this.currentCountry.code)
    const fba = await loadFBATable(this.currentCountry.code)
    const referral = await loadReferralTable(this.currentCountry.code)
    const closing = await loadClosingFee(this.currentCountry.code)
    this.content = { tier, dimensionalWeight, packagingWeight, shippingWeight, fba, referral, closing }
  }
  parseRule() {
    const { referral } = this.content
    const tierRules = parseTier(this.content.tier)
    const dimensionalWeightRules = parseDimensionalWeight(this.content.dimensionalWeight)
    let packagingWeightRules
    if (this.content.packagingWeight) {
      packagingWeightRules = parsePackagingWeight(this.content.packagingWeight)
    }
    const shippingWeightRules = parseShippingWeight(this.content.shippingWeight)
    const fbaRules = parseFba(this.content.fba)
    const referralRules = parseReferral(referral)
    // closingFee
    const closingRules = parseClosing(this.content.closing)
    this.ruleCollection = {
      tierRules,
      dimensionalWeightRules,
      packagingWeightRules,
      shippingWeightRules,
      fbaRules,
      referralRules,
      closingRules,
    }
    return this.ruleCollection
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
