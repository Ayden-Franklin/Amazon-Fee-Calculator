import { categoryItems } from '@src/service/constants'
// eslint-disable-next-line @typescript-eslint/no-require-imports
const Qty = require('js-quantities')

export function sortDimensions(length: number, width: number, height: number) {
  const dimensions = [length, width, height].sort((a, b) => b - a)
  return dimensions
}

export function retrieveCategoryByCode(categoryCode: string) {
  for (let category of categoryItems) {
    if (category.code === categoryCode) {
      return category.name
    }
  }
}
export function sortByUnit(a: Iu, b: Iu, c: Iu) {
  if (a.unit === b.unit && b.unit === c.unit) {
    return [a, b, c].sort((_1, _2) => _1.value - _2.value)
  }
  // default sort
  return [a, b, c]
}

export function great(a: Iu, b: Iu): boolean {
  // TODO
  if (a.unit === b.unit) {
    return a.value > b.value
  }
  return false
}

export function less(a: Iu, b: Iu): boolean {
  // if unit NaN, will Ignore b.value, default less
  if (b.unit === 'NaN') {
    return true
  }
  if (a.unit === b.unit) {
    const temp = a.value < b.value
    if (temp) return true
    if (b?.operator === '>') {
      return a.value >= b.value
    }
  }
  // diff unit Comparison
  const aV = `${a.value} ${a.unit}`
  const bV = `${b.value} ${b.unit}`
  return Qty(aV).lt(Qty(bV))
}
