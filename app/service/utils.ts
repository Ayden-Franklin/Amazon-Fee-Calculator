import { NotAvailable } from '@src/service/constants'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Qty = require('js-quantities')

export function sortDimensions(length: number, width: number, height: number) {
  const dimensions = [length, width, height].sort((a, b) => b - a)
  return dimensions
}

export function sortByUnit(a: IMeasureUnit, b: IMeasureUnit, c: IMeasureUnit) {
  if (a.unit === b.unit && b.unit === c.unit) {
    return [a, b, c].sort((_1, _2) => _1.value - _2.value)
  }
  // default sort
  return [a, b, c]
}

export function compareWithUnit(operand: IMeasureUnit, reference: ICalculateUnit): boolean {
  // TODO: check whether the unit is null or undefined to make sure we parsed rule successfully

  // if unit NaN or operator is not defined, will Ignore b.value, default less
  if (reference.unit === NotAvailable || typeof reference.operator === 'undefined') {
    return true
  }

  // if unit of operand is NotAvailable, will return false
  if (operand.unit === NotAvailable) return false

  if (operand.unit === reference.unit) {
    // eslint-disable-next-line no-eval
    return global.eval(`${operand.value}  ${reference?.operator} ${reference.value}`)
  }
  // diff unit Comparison
  const operandV = `${operand.value} ${operand.unit}`
  const referenceV = `${reference.value} ${reference.unit}`
  const r = Qty(operandV).compareTo(Qty(referenceV))
  return (
    (reference.operator.includes('=') && r === 0) ||
    (reference.operator.includes('>') && r > 0) ||
    (reference.operator.includes('<') && r < 0)
  )
}
export function convertWeightUnit(operand: IMeasureUnit, targetUnit = 'lb') {
  if (operand) {
    if (operand.unit === targetUnit) {
      return operand
    } else {
      return Qty(`${operand.value} ${operand.unit}`).to(targetUnit)
    }
  }
}

export function minify(s: string) {
  return typeof s === 'string' ? s.replace(/&|and|\s|,|\/|-/g, '').toLowerCase() : s
}
