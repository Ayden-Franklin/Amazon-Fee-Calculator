import { Nullable } from '@src/types'
import got from 'got'
import Constants, { FeeRuleContentKey } from './constants'

const cacheStore = (function () {
  return {
    get: (key: string) => {
      if (typeof global !== 'undefined' && typeof global.localStorage !== 'undefined') {
        const value = global.localStorage.getItem(key)
        if (value) return value
      }
    },
    set: (key: string, value: any) => {
      if (typeof global !== 'undefined' && typeof global.localStorage !== 'undefined') {
        global.localStorage.setItem(key, value)
      }
    },
  }
})()

function fetchWithCacheByCountryItemValue(rq: {
  url: string
  extractOriginalContent: (response: string) => string | null
}): Promise<string> {
  const rqUrl = rq.url
  const onRqBody = (body: string) => rq.extractOriginalContent(body) || 'Extract Unknown'
  // cache handle
  const cache = cacheStore.get(rqUrl)
  if (cache) return Promise.resolve(onRqBody(cache))
  if (typeof global === 'undefined' || typeof global.localStorage === 'undefined') {
    // `got` not support nodeVersion 14
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('node-fetch')(rqUrl)
      .then((res: any) => res.text())
      .then((text: string) => onRqBody(text))
  }
  // request
  return got(rqUrl)
    .then((response) => {
      cacheStore.set(rqUrl, response.body)
      return onRqBody(response.body)
    })
    .catch((err) => {
      console.log(err)
      return err
    })
}

function loadContent(countryCode: string, name: FeeRuleContentKey): Promise<string> {
  if (!countryCode || !Constants[countryCode]) {
    return Promise.reject(new Error(`This country[$country] is not supported!`))
  }
  const rq = Constants[countryCode][name]
  if (!rq)
    return Promise.reject(
      new Error(`${countryCode}.${name} probably not be defined in /service/amazon/${countryCode}.ts file`)
    )
  return fetchWithCacheByCountryItemValue(rq)
}
export function loadTierTable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'tier')
}

export function loadDimensionalWeightRule(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'dimensionalWeight')
}

export function loadShippingWeightRule(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'shippingWeight')
}

export function loadPackagingRule(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'packagingWeight')
}
export function loadFBATable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'fba')
}

export function loadReferralTable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'referral')
}

export function loadExtraRule(
  countryCode: string,
  field: FeeRuleContentKey
): Promise<Nullable<Record<string, string>>> {
  if (!countryCode || !Constants[countryCode]) {
    return Promise.reject(new Error(`This country[$country] is not supported!`))
  }

  const rq = Constants[countryCode]?.[field]
  const sub = rq?.extra

  if (!sub) return Promise.resolve(null)

  const subKeys = Object.keys(sub)
  const result: Record<string, string> = {}

  return Promise.all(subKeys.map((key) => fetchWithCacheByCountryItemValue(sub[key]))).then((res) => {
    return subKeys.reduce((prev, key, index) => {
      prev[key] = res[index]
      return prev
    }, result)
  })
}

export function loadClosingFee(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'closing')
}
