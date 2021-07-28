import ca from './ca'
import mx from './mx'
import us from './us'

interface CountryItemValue {
  url: string
  sub?: Record<string, CountryItemValue>
  extractOriginalContent: (response: string) => string | null
  extractContent: (response: string) => string | null
}

export type CountryItemKey = 'tier' | 'dimensionalWeight' | 'shipping' | 'packaging' | 'fba' | 'referral' | 'closing'

export type Country = Record<CountryItemKey, CountryItemValue>

const Constants: Record<string, Country> = {
  ca,
  mx,
  us,
}

export default Constants
