import cheerio from 'cheerio'

export default {
  tier: {
    url: 'https://sellercentral.amazon.com.mx/gp/help/external/201411300?language=en_MX',
    extractOriginalContent: (response: string) => {
      const $ = cheerio.load(response)
      const div = $('.help-content:eq(4)').find('div')
      return cheerio.html(div.children().splice(0, 9))
    },
    extractContent: (response: string) => {
      const $ = cheerio.load(response)
      const div = $('.help-content:eq(4)').find('div')
      return cheerio.html(div.children().splice(0, 9))
    },
  },
  weight: {
    url: 'https://sellercentral.amazon.com.mx/gp/help/external/201411300?language=en_MX',
    extractOriginalContent: (response: string) => {
      const $ = cheerio.load(response)
      const div = $('.help-content:eq(4)').find('div')
      return cheerio.html(div.find('p:last-child'))
    },
    extractContent: (response: string) => {
      const $ = cheerio.load(response)
      const div = $('.help-content:eq(4)').find('div')
      return cheerio.html(div.find('p:last-child'))
    },
  },
  fba: {
    url: 'https://sellercentral.amazon.com.mx/gp/help/external/201411300?language=en_MX',
    extractOriginalContent: (response: string) => {
      const $ = cheerio.load(response)
      return cheerio.html($('.help-content:eq(0)').find('table.help-table').attr('border', '1'))
    },
    extractContent: (response: string) => {
      const $ = cheerio.load(response)
      return cheerio.html($('.help-content:eq(0)').find('table.help-table'))
    },
  },
  referral: {
    url: 'https://sellercentral.amazon.com.mx/gp/help/external/200336920?language=en_MX',
    extractOriginalContent: (response: string) => {
      const $ = cheerio.load(response)
      const content = $('div.help-content:eq(4)')
      let $table = content.find('table.help-table')
      $table.attr('border', '1')
      return cheerio.html(content)
    },
    extractContent: (response: string) => {
      const $ = cheerio.load(response)
      const content = $('div.help-content:eq(4)').find('table.help-table')
      return cheerio.html(content)
    },
  },
}
