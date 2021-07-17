import { sortDimensions } from '../../app/service/utils'
test('Sort dimensions from longest side to shortest side', () => {
  expect(sortDimensions(10, 20, 15)).toEqual([20, 15, 10])
})
