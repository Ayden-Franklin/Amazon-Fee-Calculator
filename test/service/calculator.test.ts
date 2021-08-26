import { readFileSync } from 'fs'
import { standardizeDimensions, calculateProductSize } from '../../app/service/calculator'
const BASE_PRODUCT = {
  length: 0.79,
  width: 5.79,
  height: 3.54,
  dimensionUnit: 'inches',
  weight: 2,
  weightUnit: 'ounces',
  price: 10.95,
  cost: 3,
  category: 'Cell Phone Basic Cases',
  isApparel: false,
  isDangerous: false,
}
const rules = {}
function initializeRules() {
  const content = readFileSync('./test/data/us-rules.json', 'utf8')
  const usRules = JSON.parse(content)
  rules['us'] = usRules
}
beforeAll(() => {
  initializeRules()
})
describe('Start to test tier', () => {
  test('standardizeDimensions - product dimensions should be standardized', () => {
    const dimensions = standardizeDimensions(BASE_PRODUCT)
    expect(dimensions).toEqual({
      length: { value: 5.79, unit: 'inches' },
      width: { value: 3.54, unit: 'inches' },
      height: { value: 0.79, unit: 'inches' },
      weight: { value: 2, unit: 'ounces' },
    })
  })

  test('calculateProductSize - this product tier should be Large standard-size', () => {
    const productDimenions = standardizeDimensions(BASE_PRODUCT)
    const tier = calculateProductSize(productDimenions, rules['us'].tierRules)
    expect(tier.name).toEqual('Large standard-size')
  })

  test('calculateProductSize - this product tier should be Small oversize', () => {
    const productDimenions = standardizeDimensions({ ...BASE_PRODUCT, height: 56 })
    const tier = calculateProductSize(productDimenions, rules['us'].tierRules)
    expect(tier.name).toEqual('Small oversize')
  })

  test('calculateProductSize - this product tier should be Medium oversize', () => {
    const productDimenions = standardizeDimensions({ ...BASE_PRODUCT, weight: 100, weightUnit: 'lb' })
    const tier = calculateProductSize(productDimenions, rules['us'].tierRules)
    expect(tier.name).toEqual('Medium oversize')
  })

  test('calculateProductSize - this product tier should be Large oversize', () => {
    const productDimenions = standardizeDimensions({ ...BASE_PRODUCT, width: 90, length: 9, height: 13 })
    const tier = calculateProductSize(productDimenions, rules['us'].tierRules)
    expect(tier.name).toEqual('Large oversize')
  })

  test('calculateProductSize - this product tier should be Special oversize', () => {
    const productDimenions = standardizeDimensions({ ...BASE_PRODUCT, width: 100, length: 14, height: 22 })
    const tier = calculateProductSize(productDimenions, rules['us'].tierRules)
    expect(tier.name).toEqual('Special oversize')
  })

  test('calculateProductSize - this product tier should be Special oversize', () => {
    const productDimenions = standardizeDimensions({ ...BASE_PRODUCT, width: 110 })
    const tier = calculateProductSize(productDimenions, rules['us'].tierRules)
    expect(tier.name).toEqual('Special oversize')
  })

  test('calculateProductSize - this product tier should be Special oversize', () => {
    const productDimenions = standardizeDimensions({ ...BASE_PRODUCT, weight: 160, weightUnit: 'lb' })
    const tier = calculateProductSize(productDimenions, rules['us'].tierRules)
    expect(tier.name).toEqual('Special oversize')
  })
})
