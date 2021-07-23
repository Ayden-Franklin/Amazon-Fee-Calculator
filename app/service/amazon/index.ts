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

function loadContent(countryCode: string, name: CountryItemKey): Promise<string> {
  if (!countryCode || !Constants[countryCode]) {
    return Promise.reject(new Error(`This country[$country] is not supported!`))
  }

  const rq = Constants[countryCode][name]

  if (!rq) return Promise.reject(new Error(countryCode + name + ' null'))

  const rqUrl = rq.url
  const onRqBody = (body: string) => rq.extractOriginalContent(body) || 'Extract Unkown'
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
export function loadTierTable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'tier')
}

export function loadWeightRule(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'weight')
}

export function loadFBATable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'fba')
}

export function loadReferralTable(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'referral')
}

export function loadClosingFee(countryCode: string): Promise<string> {
  return loadContent(countryCode, 'closing')
}
