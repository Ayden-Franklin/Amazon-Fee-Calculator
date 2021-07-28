import got from 'got'
import Constants, { CountryItemKey } from './constants'

const cacheStore = (function () {
  return {
    get: (key: string) => {
      if (typeof global !== 'undefined') {
        const value = global.localStorage.getItem(key)
        if (value) return value
      }
    },
    set: (key: string, value: any) => {
      global.localStorage.setItem(key, value)
    },
  }
})()

function fetchWithCacheByCountryItemValue(rq: {
  url: string
  extractOriginalContent: (response: string) => string | null
}): Promise<string> {
  if (!rq) return Promise.reject(new Error(`fetchWithCacheByCountryItemValue rq null`))

  const rqUrl = rq.url
  const onRqBody = (body: string) => rq.extractOriginalContent(body) || 'Extract Unknown'
  // cache handle
  const cache = cacheStore.get(rqUrl)
  if (cache) return Promise.resolve(onRqBody(cache))
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

function loadContent(countryCode: string, name: CountryItemKey): Promise<string> {
  if (!countryCode || !Constants[countryCode]) {
    return Promise.reject(new Error(`This country[$country] is not supported!`))
  }

  const rq = Constants[countryCode][name]

  return fetchWithCacheByCountryItemValue(rq)
}
export function loadTierTable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'tier')
}

export function loadDimensionalWeightRule(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'dimensionalWeight')
}

export function loadShippingWeightRule(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'shipping')
}

export function loadPackagingRule(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'packaging')
}
export function loadFBATable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'fba')
}

export function loadReferralTable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'referral')
}

export function loadSubRule(countryCode: string, field: CountryItemKey): Promise<Nullable<Record<string, string>>> {
  if (!countryCode || !Constants[countryCode]) {
    return Promise.reject(new Error(`This country[$country] is not supported!`))
  }

  const rq = Constants[countryCode]?.[field]
  const sub = rq?.sub

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
