import { readFileSync } from 'fs'
import { calculateShippingWeight, standardizeDimensions, calculateWeight } from '../../app/service/calculator'

const rules = {}
function initializeRules() {
  const content = readFileSync('./test/data/us-rules.json', 'utf8')
  const usRules = JSON.parse(content)
  rules['us'] = usRules
}
beforeAll(() => {
  initializeRules()
})

test('calculateWeight - this product weight should be 99.8 lb(The greater of the unit weight or dimensional weight)', () => {
  const weight = calculateShippingWeight({
    tierName: 'Large oversize',
    weight: { value: 95, unit: 'lb' },
    dimensionalWeight: 99.8,
    shippingWeightRules: rules['us'].shippingWeightRules,
  })
  expect(weight).toEqual({ value: 99.8, unit: 'lb' })
})
test('calculateWeight - this product weight should be 99.8 lb(The greater of the unit weight or dimensional weight)', () => {
  const productDimenions = standardizeDimensions({
    length: 0.79,
    width: 5.79,
    height: 3.54,
    dimensionUnit: 'inches',
    weight: 2,
    weightUnit: 'ounces',
  })
  const weight = calculateWeight(
    productDimenions,
    'Small standard-size',
    rules['us'].dimensionalWeightRules,
    rules['us'].shippingWeightRules
  )

  // const weight = calculateShippingWeight({
  //   tierName: 'Large oversize',
  //   weight: { value: 95, unit: 'lb' },
  //   dimensionalWeight: 99.8,
  //   shippingWeightRules: rules['us'].shippingWeightRules,
  // })
  expect(weight).toEqual({ value: 2, unit: 'ounces' })
})
