import got from 'got'
import cheerio from 'cheerio'

const pageUrls = {
  us: {
    tier: {
      url: 'https://sellercentral.amazon.com/gp/help/external/GG5KW835AHDJCH8W',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        const result = cheerio.html($('table.help-table:eq(1)').attr('border', '1')) + cheerio.html($('.note'))
        return result
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        const result = $('table.help-table:eq(1)').html()
        return result
      },
    },
    weight: {
      url: 'https://sellercentral.amazon.com/gp/help/external/G53Z9EKF8VVZVH29',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        let output = ''
        $('div.help-content').each((index, element) => {
          if (index === 1 || index === 2) {
            output += cheerio.html(element)
          }
        })
        return output
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        let output = ''
        $('div.help-content').each((index, element) => {
          if (index === 1 || index === 2) {
            output += cheerio.html(element)
          }
        })
        return output
      },
    },
    fba: {
      url: 'https://sellercentral.amazon.com/gp/help/external/GPDC3KPYAGDTVDJP',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        let result = ''
        $('table.help-table').each((index, element) => {
          if (index === 2 || index === 3) {
            $(element).attr('border', '1')
            result += cheerio.html(element)
          }
        })
        return result
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        let result = ''
        $('table.help-table').each((index, element) => {
          if (index === 2 || index === 3) {
            result += cheerio.html(element)
          }
        })
        return result
      },
    },
    referral: {
      url: 'https://sellercentral.amazon.com/gp/help/external/GTG4BAWSY39Z98Z3',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        const content = $('div.help-content:eq(3)')
        let $table = content.find('table.help-table')
        $table.attr('border', '1')
        // const result = cheerio.html($('table.help-table:eq(2)').attr('border', '1'))

        // $('table.help-table:eq(2)'
        return cheerio.html(content)
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        const content = $('div.help-content:eq(3)')
        return cheerio.html(content)
      },
    },
    closing: {
      url: 'https://sellercentral.amazon.com/gp/help/external/GKD9U5REK5DKB38Y',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        let output = cheerio.html($('h1.a-spacing-none'))
        $('div.help-content').each((index, element) => {
          if (index === 0 || index === 3) {
            output += cheerio.html(element)
          }
        })
        return output
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        let output = cheerio.html($('h1.a-spacing-none'))
        $('div.help-content').each((index, element) => {
          if (index === 0 || index === 3) {
            output += cheerio.html(element)
          }
        })
        return output
      },
    },
  },
  ca: {
    tier: {
      url: 'https://sellercentral.amazon.ca/gp/help/external/G201105770',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        const result = cheerio.html($('.help-content'))
        return result
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        const result = cheerio.html($('.help-content'))
        return result
      },
    },
    weight: {
      url: 'https://sellercentral.amazon.ca/gp/help/external/G201112650',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        let output = $('div.help-content div p').eq(28).html()
        return output && output === '' ? response : output
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        let output = $('div.help-content div p').eq(28).html()
        return output && output === '' ? response : output
      },
    },
    fba: {
      url: 'https://sellercentral.amazon.ca/gp/help/external/201112670',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        return cheerio.html($('table.help-table:eq(0)').attr('border', '1'))
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        return $('table.help-table').html()
      },
    },
    referral: {
      url: 'https://sellercentral.amazon.ca/gp/help/external/200336920',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        const content = $('div.help-content:eq(5)')
        let $table = content.find('table.help-table')
        $table.attr('border', '1')
        // const result = cheerio.html($('table.help-table:eq(2)').attr('border', '1'))

        // $('table.help-table:eq(2)'
        return cheerio.html(content)
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        const content = $('div.help-content:eq(3)')
        return cheerio.html(content)
      },
    },
    closing: {
      url: 'https://sellercentral.amazon.ca/gp/help/external/200336920',
      extractOriginalContent: (response: string) => {
        const $ = cheerio.load(response)
        let output = cheerio.html($('div.help-content:eq(6)'))
        return output
      },
      extractContent: (response: string) => {
        const $ = cheerio.load(response)
        let output = cheerio.html($('div.help-content:eq(6)'))
        return output
      },
    },
  },
  mx: {
    tier: 'https://sellercentral.amazon.com.mx/gp/help/external/200336920?language=en_MX',
  },
}
const cacheStore = (function () {
  return {
    get: (key: string) => {
      if (typeof global !== 'undefined') {
        const value = global.localStorage.getItem(key)
        if (value) return value
      }
    },
    set: (key: string, value: any, ttl?: number) => {
      global.localStorage.setItem(key, value)
    },
  }
})()

function loadContent(countryCode: string, name: string): Promise<string> {
  if (!countryCode || !pageUrls.hasOwnProperty(countryCode)) {
    return Promise.reject(new Error(`This country[$country] is not supported!`))
  }

  const rq = pageUrls[countryCode][name]

  const rqUrl = rq.url
  const onRqBody = (body: string) => rq.extractOriginalContent(body)
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
