import {
  loadTierTable,
  loadDimensionalWeightRule,
  loadShippingWeightRule,
  loadPackagingRule,
  loadFBATable,
  loadReferralTable,
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
} from '@src/service/parser/parser-mx'
import { Country } from '@src/types'
import { IRuleCollection, IRuleContent } from '@src/types/rules'

export class MxProfitCalculator extends NorthAmerica implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  ruleCollection!: IRuleCollection
  constructor(country: Country) {
    super()
    this.content = {
      tier: 'Loading tier content for Mexico',
      dimensionalWeight: 'Loading dimensional weight content for Mexico',
      packagingWeight: 'Loading package content for Mexico',
      shippingWeight: 'Loading shipping content for Mexico',
      fba: 'Loading fba content for Mexico',
      referral: 'Loading referral content for Mexico',
      closing: 'Loading closing content for Mexico',
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
    this.content = { tier, dimensionalWeight, packagingWeight, shippingWeight, fba, referral, closing: null }
  }
  parseRule() {
    const { referral, closing, tier } = this.content
    const tierRules = parseTier(tier)
    const dimensionalWeightRules = parseDimensionalWeight(this.content.dimensionalWeight)
    let packagingWeightRules
    if (this.content.packagingWeight) {
      packagingWeightRules = parsePackagingWeight(this.content.packagingWeight)
    }
    const shippingWeightRules = parseShippingWeight(this.content.shippingWeight)
    const fbaRules = parseFba(this.content.fba)
    const referralRules = parseReferral(referral)

    const closingRules = parseClosing(closing)
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
