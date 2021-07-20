import got from 'got'
import cheerio from 'cheerio'
export function loadTierTable(country: string): Promise<string> {
  switch (country) {
    case 'ca':
      return loadTierTableCanada()
    default:
      return loadTierTableUS()
  }
}
function loadTierTableUS(): Promise<string> {
  const url = 'https://sellercentral.amazon.com/gp/help/external/GG5KW835AHDJCH8W?language=en_US'
  return got(url)
    .then((response) => {
      const $ = cheerio.load(response.body)
      const result = cheerio.html($('table.help-table:eq(1)').attr('border', '1')) + cheerio.html($('.note'))
      return result
    })
    .catch((err) => {
      console.log(err)
      return err
    })
}
function loadTierTableCanada(): Promise<string> {
  const url = 'https://sellercentral.amazon.ca/gp/help/external/G201105770'
  return got(url)
    .then((response) => {
      const $ = cheerio.load(response.body)
      const result = cheerio.html($('.help-content'))
      return result
    })
    .catch((err) => {
      console.log(err)
      return err
    })
}

export function loadWeightRule(country: string): Promise<string> {
  const url = 'https://sellercentral.amazon.com/gp/help/external/G53Z9EKF8VVZVH29?language=en_US'

  return got(url)
    .then((response) => {
      const $ = cheerio.load(response.body)
      // const result = cheerio.html($('table.help-content:eq(1) div ui.a-vertial').attr('border', '1'))
      // const result = cheerio.html($('div.help-content:eq(1)')) // .attr('border', '1'))
      // console.log(result)
      // let output = []
      // $( ".author-article" ).each( (i, elem ) => {
      //     let $a = $(elem).find( 'a' )
      //     let datum = {
      //         title: $a.text(),
      //         url: $a.attr( 'href' )
      //     }
      //     output.push(datum)
      // })
      // return output
      let output = ''
      $('div.help-content').each((index, element) => {
        if (index === 1 || index === 2) {
          output += cheerio.html(element)
        }
      })
      return output
    })
    .catch((err) => {
      console.log(err)
      return err
    })
}

export function loadFBATable(country: string): Promise<string> {
  const url = 'https://sellercentral.amazon.com/gp/help/external/GPDC3KPYAGDTVDJP?language=en_US'

  return got(url)
    .then((response) => {
      const $ = cheerio.load(response.body)
      // const result = cheerio.html($('table.help-table:eq(2)').attr('border', '1'))
      let result = ''
      $('table.help-table').each((index, element) => {
        if (index === 2 || index === 3) {
          $(element).attr('border', '1')
          result += cheerio.html(element)
        }
      })
      return result
    })
    .catch((err) => {
      console.log(err)
      return err
    })
}

export function loadReferralTable(country: string): Promise<string> {
  const url =
    'https://sellercentral.amazon.com/gp/help/external/GTG4BAWSY39Z98Z3?language=en_US&ref=efph_GTG4BAWSY39Z98Z3_cont_6F7CN3EQS7MEGCN'
  return got(url)
    .then((response) => {
      const $ = cheerio.load(response.body)
      const content = $('div.help-content:eq(3)')
      let $table = content.find('table.help-table')
      $table.attr('border', '1')
      // const result = cheerio.html($('table.help-table:eq(2)').attr('border', '1'))

      // $('table.help-table:eq(2)'
      return cheerio.html(content)
    })
    .catch((err) => {
      console.log(err)
      return err
    })
}

export function loadClosingFee(country: string): Promise<string> {
  const url =
    'https://sellercentral.amazon.com/gp/help/external/GKD9U5REK5DKB38Y?language=en_US&ref=efph_GKD9U5REK5DKB38Y_cont_6F7CN3EQS7MEGCN'
  return got(url)
    .then((response) => {
      const $ = cheerio.load(response.body)
      let output = cheerio.html($('h1.a-spacing-none'))
      $('div.help-content').each((index, element) => {
        if (index === 0 || index === 3) {
          output += cheerio.html(element)
        }
      })
      return output
    })
    .catch((err) => {
      console.log(err)
      return err
    })
}
