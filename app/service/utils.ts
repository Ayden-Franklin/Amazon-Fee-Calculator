// eslint-disable-next-line @typescript-eslint/no-require-imports
const Qty = require('js-quantities')

export function sortDimensions(length: number, width: number, height: number) {
  const dimensions = [length, width, height].sort((a, b) => b - a)
  return dimensions
}

export function sortByUnit(a: ICalculateUnit, b: ICalculateUnit, c: ICalculateUnit) {
  if (a.unit === b.unit && b.unit === c.unit) {
    return [a, b, c].sort((_1, _2) => _1.value - _2.value)
  }
  // default sort
  return [a, b, c]
}

export function compareWithUnit(a: ICalculateUnit, b: ICalculateUnit): boolean {
  // TODO: check whether the unit is null or undefined to make sure we parsed rule successfully

  // if unit NaN or operator is not defined, will Ignore b.value, default less
  if (b.unit === 'n/a' || !b.operator) {
    return true
  }

  // if unit of a is n/a, will return false
  if (a.unit === 'n/a') return false

  if (a.unit === b.unit) {
    // eslint-disable-next-line no-eval
    return global.eval(`${a.value}  ${b?.operator} ${b.value}`)
  }
  // diff unit Comparison
  const aV = `${a.value} ${a.unit}`
  const bV = `${b.value} ${b.unit}`
  const r = Qty(aV).compareTo(Qty(bV))
  return (
    (b.operator.includes('=') && r === 0) || (b.operator.includes('>') && r > 0) || (b.operator.includes('<') && r < 0)
  )
}

export function minify(s: string) {
  return typeof s === 'string' ? s.replace(/&|and|\s|,|\/|-/g, '').toLowerCase() : s
}
