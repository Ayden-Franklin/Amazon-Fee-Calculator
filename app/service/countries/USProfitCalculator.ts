import { loadTierTable } from '@src/service/amazon'

export class UsProfitCalculator implements ProfitCaluclator {
  content: string
  constructor() {
    this.content = 'This is for US'
  }
  fetchRuleContent() {
    return loadTierTable('us')
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
