import { NotAvailable } from '@src/service/constants'
import { IMeasureUnit, ICalculateUnit } from '@src/types'
import Qty from 'js-quantities'

export function sortDimensions(length: number, width: number, height: number) {
  return [length, width, height].sort((a, b) => b - a)
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
    // eslint-disable-next-line no-new-func
    return Function(`"use strict";return (${operand.value} ${reference.operator} ${reference.value})`)()
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
export function convertLengthUnit(operand: IMeasureUnit, targetUnit = 'inches'): number {
  if (operand) {
    if (operand.unit === targetUnit) {
      return operand.value
    } else {
      return Qty(`${operand.value} ${operand.unit}`).to(targetUnit).scalar
    }
  }
  return NaN
}
export function convertWeightUnit(operand: IMeasureUnit, targetUnit = 'pounds'): number {
  if (operand) {
    if (operand.unit === targetUnit) {
      return operand.value
    } else {
      return Qty(`${operand.value} ${operand.unit}`).to(targetUnit).scalar
    }
  }
  return NaN
}

export function minify(s: string) {
  return typeof s === 'string' ? s.replace(/&|and|\s|,|\/|-/g, '').toLowerCase() : s
}
