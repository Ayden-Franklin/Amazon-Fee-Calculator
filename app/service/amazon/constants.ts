import ca from './ca'
import mx from './mx'
import us from './us'

interface FeeRuleContentValue {
  url: string
  extra?: Record<string, FeeRuleContentValue>
  extractOriginalContent: (response: string) => string | null
  extractContent: (response: string) => string | null
}

export type FeeRuleContentKey =
  | 'tier'
  | 'dimensionalWeight'
  | 'shippingWeight'
  | 'packagingWeight'
  | 'fba'
  | 'referral'
  | 'closing'

export type FeeRuleContent = Record<FeeRuleContentKey, FeeRuleContentValue>

const Constants: Record<string, FeeRuleContent> = {
  ca,
  mx,
  us,
}

export default Constants
