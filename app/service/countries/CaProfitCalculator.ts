import { loadTierTable } from '@src/service/amazon'

export class CaProfitCalculator implements ProfitCaluclator {
  content: string
  constructor() {
    this.content = 'This is content for Canada'
  }
  fetchRuleContent() {
    return loadTierTable('ca')
  }
  parseRule() {
    return null
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
