import { sortDimensions, compareWithUnit } from '@src/service/utils'
test('Sort dimensions from longest side to shortest side', () => {
  expect(sortDimensions(10, 20, 15)).toEqual([20, 15, 10])
})

test('Compare 18 oz should less than 20 oz', () => {
  expect(compareWithUnit({ value: 18, unit: 'oz' }, { value: 20, unit: 'oz', operator: '<=' })).toBeTruthy()
})

test('Compare 18 oz should NOT less than 15 oz', () => {
  expect(compareWithUnit({ value: 18, unit: 'oz' }, { value: 15, unit: 'oz', operator: '<=' })).toBeFalsy()
})

test('Compare 18 oz should less than 2 lb', () => {
  expect(compareWithUnit({ value: 18, unit: 'oz' }, { value: 2, unit: 'lb', operator: '<=' })).toBeTruthy()
})

test('Compare 18 oz should NOT great than 2 lb', () => {
  expect(compareWithUnit({ value: 18, unit: 'oz' }, { value: 2, unit: 'lb', operator: '>' })).toBeFalsy()
})
