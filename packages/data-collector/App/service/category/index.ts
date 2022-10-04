import ca from './ca'
import mx from './mx'
import us from './us'
interface ICategoryType {
  name: string
  // breadcrumbTree eg: Electronics > xxx > 'Accessories & Supplies'
  require?: Array<string>
  // for category  classification hierarchy
  // It is not necessarily an exact number, as long as it is larger than its parent number
  order: number
}
/**
 * TODO
 * "Amazon Explore"
 * "Categories requiring approval"
 * "Full-Size Appliances"
 */
const CountryCategoryMapping: Record<string, Record<string, Array<ICategoryType>>> = {
  us,
  mx,
  ca,
}

export const getCategoryMappingByCountryCode = (countryCode: string) => {
  return CountryCategoryMapping[countryCode] || {}
}
