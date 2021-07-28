import cheerio from 'cheerio'

export default {
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
  dimensionalWeight: {
    url: 'https://sellercentral.amazon.com/gp/help/external/G53Z9EKF8VVZVH29',
    extractOriginalContent: (response: string) => {
      const $ = cheerio.load(response)
      let output = $('div.help-content:eq(2)').find('p:first-child').html()
      return output
    },
    extractContent: (response: string) => {
      const $ = cheerio.load(response)
      let output = $('div.help-content:eq(2)').find('p:first-child').html()
      return output
    },
  },
  shipping: {
    url: 'https://sellercentral.amazon.com/gp/help/external/GEVWP48HPBLEFJEY',
    extractOriginalContent: (response: string) => {
      const $ = cheerio.load(response)
      let content = $('div.help-content:eq(1)')
      let $table = content.find('table.help-table')
      $table.attr('border', '1')
      return cheerio.html($table)
    },
    extractContent: (response: string) => {
      const $ = cheerio.load(response)
      let output = $('div.help-content:eq(1)').find('table.help-table').html()
      return output
    },
  },
  fba: {
    url: 'https://sellercentral.amazon.com/gp/help/external/GPDC3KPYAGDTVDJP',
    sub: {
      apparel: {
        url: 'https://sellercentral.amazon.com/gp/help/external/G2FXDS3YCWLFY4TK',
        extractOriginalContent: (response: string) => {
          const $ = cheerio.load(response)
          let output = $('div.help-content').find('ul').html()
          return output
        },
      },
    },
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
    sub: {
      fullsizeappliances: {
        url: 'https://sellercentral.amazon.com/gp/help/external/GGH3QLLAE3N8PM83',
        extractOriginalContent: (response: string) => {
          const $ = cheerio.load(response)
          let result = ''
          $('table.help-table').each((_, element) => {
            $(element).attr('border', '1')
            result += cheerio.html(element)
          })
          return result
        },
      },
    },
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
}
