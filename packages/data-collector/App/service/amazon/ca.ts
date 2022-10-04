import cheerio from 'cheerio'

export default {
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
  dimensionalWeight: {
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
  packagingWeight: {
    url: 'https://sellercentral.amazon.ca/gp/help/external/G201112670',
    extractOriginalContent: (response: string) => {
      const $ = cheerio.load(response)
      let output = $('div.help-content div').find('p:eq(6)').text()
      if (output !== '') {
        const index = output.indexOf('A packaging weight')
        if (index > -1) {
          return output.substring(index)
        }
      }
      throw Error('Fail to extract effective paragraph for packaing!')
    },
    extractContent: (response: string) => {
      const $ = cheerio.load(response)
      let output = $('div.help-content div').find('p:eq(6)').text()
      if (output !== '') {
        const index = output.indexOf('A packaging weight')
        if (index > -1) {
          return output.substring(index)
        }
      }
      throw Error('Fail to extract effective paragraph for packaing!')
    },
  },
  shippingWeight: {
    url: 'https://sellercentral.amazon.ca/gp/help/external/G201112670',
    extractOriginalContent: (response: string) => {
      const $ = cheerio.load(response)
      let output = cheerio.html($('div.help-content div').find('p:eq(6)'))
      if (output !== '') {
        const index = output.indexOf('A packaging weight')
        if (index > -1) {
          return output.substring(0, index - 1)
        }
      }
      throw Error('Fail to extract effective paragraph for shipping!')
    },
    extractContent: (response: string) => {
      const $ = cheerio.load(response)
      let output = cheerio.html($('div.help-content div').find('p:eq(6)'))
      if (output !== '') {
        const index = output.indexOf('A packaging weight')
        if (index > -1) {
          return output.substring(0, index - 1)
        }
      }
      throw Error('Fail to extract effective paragraph for shipping!')
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
}
