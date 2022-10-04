import { readFileSync } from 'fs'
import {
  standardizeDimensions,
  calculateProductSize,
  calculateShippingWeight,
  calculateDimensionalWeight,
  calculateWeight,
} from '../../app/service/calculator'
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

describe('Start to test dimensional weight', () => {
  test('calculateDimensionalWeight - this product weight should be 0.11649146762589928', () => {
    const productDimenions = standardizeDimensions(BASE_PRODUCT)
    const weight = calculateDimensionalWeight(
      productDimenions,
      { name: 'Large standard-size' },
      rules['us'].dimensionalWeightRules
    )
    expect(weight).toEqual(0.11649146762589928)
  })
  test('calculateDimensionalWeight - this product weight should be 2.037410071942446', () => {
    const productDimenions = standardizeDimensions({ ...BASE_PRODUCT, width: 40 })
    const weight = calculateDimensionalWeight(
      productDimenions,
      { name: 'Small oversize' },
      rules['us'].dimensionalWeightRules
    )
    expect(weight).toEqual(2.037410071942446)
  })
})

describe('Start to test calculateShippingWeight weight', () => {
  test('calculateShippingWeight - this product weight should be 11 ounces(unit weight)', () => {
    const weight = calculateShippingWeight({
      tierName: 'Small standard-size',
      weight: { value: 11, unit: 'ounces' },
      dimensionalWeight: 14.8,
      shippingWeightRules: rules['us'].shippingWeightRules,
    })
    expect(weight).toEqual({ value: 11, unit: 'ounces' })
  })
  test('calculateShippingWeight - this product weight should be 14.8 ounces(The greater of the unit weight or dimensional weight)', () => {
    const weight = calculateShippingWeight({
      tierName: 'Small standard-size',
      weight: { value: 13, unit: 'ounces' },
      dimensionalWeight: 14.8,
      shippingWeightRules: rules['us'].shippingWeightRules,
    })
    expect(weight).toEqual({ value: 14.8, unit: 'ounces' })
  })
  test('calculateShippingWeight - this product weight should be 3.5 lb(The greater of the unit weight or dimensional weight)', () => {
    const weight = calculateShippingWeight({
      tierName: 'Large standard-size',
      weight: { value: 3.5, unit: 'lb' },
      dimensionalWeight: 0.11649146762589928,
      shippingWeightRules: rules['us'].shippingWeightRules,
    })
    expect(weight).toEqual({ value: 3.5, unit: 'lb' })
  })
  test('calculateShippingWeight - this product weight should be 9.8 lb(The greater of the unit weight or dimensional weight)', () => {
    const weight = calculateShippingWeight({
      tierName: 'Large standard-size',
      weight: { value: 3.5, unit: 'lb' },
      dimensionalWeight: 9.8,
      shippingWeightRules: rules['us'].shippingWeightRules,
    })
    expect(weight).toEqual({ value: 9.8, unit: 'lb' })
  })
  test('calculateShippingWeight - this product weight should be 115 lb(The greater of the unit weight or dimensional weight)', () => {
    const weight = calculateShippingWeight({
      tierName: 'Large oversize',
      weight: { value: 115, unit: 'lb' },
      dimensionalWeight: 99.8,
      shippingWeightRules: rules['us'].shippingWeightRules,
    })
    expect(weight).toEqual({ value: 115, unit: 'lb' })
  })
  test('calculateShippingWeight - this product weight should be 99.8 lb(The greater of the unit weight or dimensional weight)', () => {
    const weight = calculateShippingWeight({
      tierName: 'Large oversize',
      weight: { value: 95, unit: 'lb' },
      dimensionalWeight: 99.8,
      shippingWeightRules: rules['us'].shippingWeightRules,
    })
    expect(weight).toEqual({ value: 99.8, unit: 'lb' })
  })
})
