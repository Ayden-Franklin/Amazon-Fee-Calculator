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
import { NorthAmerica } from '@src/service/countries/NorthAmerica'
import Parser from '@src/service/parser/parser-us'
import { Country, Nullable } from '@src/types'
import { IRuleCollection, IRuleContent } from '@src/types/rules'
import { IProductCategory } from '@src/types/fees'
import { verifyApparelByCategory } from '../calculator'
export class UsProfitCalculator extends NorthAmerica implements IProfitCalculator {
  currentCountry: Country
  content: IRuleContent
  ruleCollection!: IRuleCollection
  fbaExtra: Nullable<Record<string, string>>
  referralExtra: Nullable<Record<string, string>>
  constructor(country: Country) {
    super()
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
  parseRule(): IRuleCollection {
    const tierRules = Parser.parseTier(this.content.tier)
    const dimensionalWeightRules = Parser.parseDimensionalWeight(this.content.dimensionalWeight)
    const shippingWeightRules = Parser.parseShippingWeight(this.content.shippingWeight)
    const fbaRules = Parser.parseFba(this.content.fba)
    const apparelRules = Parser.parseApparel(this.fbaExtra?.apparel || '')
    const referralRules = Parser.parseReferral(this.content.referral, this.referralExtra || {})
    // closingFee
    const closingRules = Parser.parseClosing(this.content.closing)
    this.ruleCollection = {
      tierRules,
      dimensionalWeightRules,
      shippingWeightRules,
      fbaRules,
      apparelRules,
      referralRules,
      closingRules,
    }
    return this.ruleCollection
  }
  verifyApparelCategory(productCategories: IProductCategory): boolean {
    if (!productCategories) return false
    const safeCategories = JSON.parse(JSON.stringify(productCategories))
    return verifyApparelByCategory(safeCategories, this.ruleCollection.apparelRules)
  }
}
