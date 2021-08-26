import puppeteer from 'puppeteer'
import dotenv from 'dotenv'
import path from 'path'

// env inject
;(() => {
  const envConfig = dotenv.config({ path: path.join(__dirname, '.env') }).parsed

  if (!envConfig) {
    console.log('env file ??')
    process.exit(1)
  }
})()

import { ProfitCalculatorByCountry } from './mvp'
import { getLogCallback, drawComparisonRadarChart, writeJsonFile } from './utils'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fetch = require('node-fetch')

type OR<T, K> = T | K
// result type
interface IProduce {
  fbaFee: OR<string, number>
  referralFee: OR<string, number>
  closingFee: OR<string, number>
  price: OR<string, number>
  asin: string
  length?: string
  width?: string
  height?: string
  weight?: string
  dimensionUnit?: string
  weightUnit?: string
  // ??? maybe not focus
  //   totalFee: number
  //   net: number
}
// select test product asin
const TEST_COUNTRY = process.env.PRODUCT_COUNTRY
const TEST_PRODUCT_ASIN = process.env.PRODUCT_ASIN
const TEST_EXECUTABLE_PATH = process.env.PUPPETEER_EXECUTABLE_PATH
const TEST_PIPELINES_API = process.env.PIPELINES_API
// goto Official calc page -> get prodcut-info[Official] -> calc fee result
async function calcByOfficial(country: string, productAsins: Array<string>): Promise<Record<string, IProduce>> {
  const countryByOfficialCalcURL: Record<string, string> = {
    us: 'https://sellercentral.amazon.com/hz/fba/profitabilitycalculator/index?lang=en_US',
  }
  const result: Record<string, IProduce> = {}
  const browser = await puppeteer.launch({
    headless: process.env.PUPPETEER_HEADLESS === 'true',
    executablePath: TEST_EXECUTABLE_PATH,
  })
  // goto calc page
  const calcUrl = countryByOfficialCalcURL[country]
  const caclPage = await browser.newPage()
  await caclPage.goto(calcUrl)
  // click continue button
  await caclPage.waitForSelector('#link_continue')
  await caclPage.click('#link_continue')
  await caclPage.waitForTimeout(1000 * 1)
  // for products calc => ......
  const asin = productAsins[0]
  const product: IProduce = { asin, price: 0, fbaFee: 0, referralFee: 0, closingFee: 0 }
  // input asin
  await caclPage.focus('#search-product input[id=search-string]')
  caclPage.keyboard.type(asin)
  await caclPage.waitForTimeout(1000 * 1)
  // click search
  await caclPage.click('#a-autoid-1-announce')
  // wait result
  await caclPage.waitForSelector('#product-info')
  await caclPage.waitForFunction('document.getElementById("product-info-length").innerHTML != "L"')
  // parse product-info
  const infoArgs = await caclPage.evaluate(() => ({
    length: document.getElementById('product-info-length')?.innerHTML,
    width: document.getElementById('product-info-width')?.innerHTML,
    height: document.getElementById('product-info-height')?.innerHTML,
    dimensionUnit: document.getElementById('product-info-dimunit')?.innerHTML,
    weight: document.getElementById('product-info-weight')?.innerHTML,
    weightUnit: document.getElementById('product-info-weightunit')?.innerHTML,
  }))
  if (Object.values(infoArgs).every((v) => !v)) {
    throw Error(`product${asin} not support from Official`)
  }
  Object.assign(product, infoArgs)
  // goto product page -> for get product price
  const productUrl = await caclPage.evaluate(
    (asin) =>
      document.querySelector('#product-info-link > a')?.getAttribute('href') ||
      `https://www.amazon.com/gp/product/${asin}`,
    asin
  )
  const productPage = await browser.newPage()
  await productPage.goto(productUrl)
  await productPage.waitForSelector('#priceblock_ourprice')
  product.price = parseNumber(
    await productPage.evaluate(() => document.getElementById('priceblock_ourprice')?.innerHTML || '')
  )
  await productPage.close()
  // input product price
  await caclPage.focus('#iframe-calculator input[id=mfn-pricing]')
  caclPage.keyboard.type(product.price)
  await caclPage.waitForTimeout(1000 * 0.5)
  await caclPage.focus('#iframe-calculator input[id=afn-pricing]')
  caclPage.keyboard.type(product.price)
  await caclPage.waitForTimeout(1000 * 0.5)
  // click calc button
  await caclPage.click('#update-fees-link-announce')
  // wait calc success
  await caclPage.waitForFunction('document.getElementById("afn-net-profit").value != ""')
  // parse fee...
  const feeArgs = await caclPage.evaluate(() => ({
    fbaFee: document.getElementById('afn-amazon-fulfillment-fees')?.innerHTML,
    referralFee: (document.getElementById('afn-referral-fee') as HTMLInputElement)?.value,
    closingFee: (document.getElementById('afn-closing-fee') as HTMLInputElement)?.value,
  }))
  Object.assign(product, feeArgs)
  result[asin] = product
  // close all
  await caclPage.close()
  await browser.close()
  return result
}
// get product-info[pipelines] -> calc fee result by MVP
async function calcByMvp(country: string, productAsins: Array<string>): Promise<Record<string, IProduce>> {
  const oCalculator = ProfitCalculatorByCountry(country)
  await oCalculator.init()
  const getProductInfo = async (asin: string) => {
    const response = await fetch(`${TEST_PIPELINES_API}/products/${country}/${asin}/extension`)
    return (await response.json())?.data?.product || {}
  }
  const result: Record<string, IProduce> = {}
  // for products calc => ......
  const asin = productAsins[0]
  const productByDB = await getProductInfo(asin)
  const infoArgs = [
    'length',
    'width',
    'height',
    'weight',
    'dimensionUnit',
    'weightUnit',
    'price',
    'breadcrumbTree',
    'category',
    'rawCategory',
  ].reduce((info, key) => Object.assign(info, { [key]: productByDB[key] }), {})
  if (Object.values(infoArgs).every((v) => !v)) {
    throw Error(`calcByMvp request product get some error ${asin}`)
  }
  const product: IProduce = { asin, price: 0, fbaFee: 0, referralFee: 0, closingFee: 0 }
  Object.assign(product, infoArgs)
  // calc core func
  getLogCallback((getCalcLog) => {
    const feeArgs = oCalculator.calc(product as any)
    // parse fees, throw unit ???
    Object.assign(product, {
      fbaFee: feeArgs.fbaFee?.value,
      referralFee: feeArgs.referralFee?.value,
      closingFee: feeArgs.closingFee?.value,
      'calc-log': getCalcLog(),
    })
    result[asin] = product
  })
  return result
}
// $47.5 => 47.5
function parseNumber(priceWithUnit: string) {
  return priceWithUnit?.match(/[\d|,|.|e|E|\\+]+/g)?.[0] || '0'
}
// comparison result
async function comparison(officialResult: Record<string, IProduce>, mvpResult: Record<string, IProduce>) {
  const asins = Object.keys(officialResult)
  for (const key of asins) {
    // generate chat img
    await writeJsonFile(officialResult[key], mvpResult[key])
    await drawComparisonRadarChart(officialResult[key], mvpResult[key])
  }
}
// main run
async function main() {
  // get test product asin ... TODO
  const country = TEST_COUNTRY
  const productAsins = [TEST_PRODUCT_ASIN]
  console.log('start calc official', country, productAsins)
  const officialResult = await calcByOfficial(country, productAsins)
  console.log('start calc mvp', country, productAsins)
  const mvpResult = await calcByMvp(country, productAsins)
  // comparison
  console.log('generate  comparison files')
  comparison(officialResult, mvpResult)
}

main()
