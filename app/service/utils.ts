import { categoryItems } from '@src/service/constants'
export function sortDimensions(length: number, width: number, height: number) {
  const dimensions = [length, width, height].sort((a, b) => b - a)
  return dimensions
}

export function retrieveCategoryByCode(categoryCode: string) {
  for(let category of categoryItems) {
    if (category.code === categoryCode) {
      return category.name
    }
  }
}
