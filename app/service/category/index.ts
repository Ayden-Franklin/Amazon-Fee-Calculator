interface CategoryType {
  name: string
  // breadcrumbTree eg: Electronics > xxx > 'Accessories & Supplies'
  require?: Array<string>
  // for category  classification hierarchy
  // It is not necessarily an exact number, as long as it is larger than its parent number
  order: number
}
/**
 * TODO
 * "Amazon Explore"
 * "Categories requiring approval"
 * "Full-Size Appliances"
 */
const CountryCategoryMapping: Record<string, Record<string, Array<CategoryType>>> = {
  us: {
    amazondeviceaccessories: [{ name: 'Amazon Devices & Accessories', order: 1 }],
    babyproducts: [
      { name: 'Baby', order: 1 },
      { name: 'Baby Products', order: 0 },
    ],
    // Books and Collectible Books =
    books: [
      { name: 'Books', order: 0 },
      { name: 'Collectible Books', order: 1 },
    ],
    cameraphoto: [{ name: 'Camera and Photo', order: 1 }],
    cellphonedevices: [
      { name: 'Cell Phones', order: 1 },
      { name: 'Cell Phones & Accessories', order: 0 },
    ],
    consumerelectronics: [{ name: 'Electronics', order: 0 }],
    electronicsaccessories: [{ name: 'Accessories & Supplies', require: ['Electronics'], order: 1 }],
    furniture: [{ name: 'Furniture', order: 0 }],
    homegarden: [{ name: 'Patio, Lawn & Garden', order: 1 }],
    kitchen: [{ name: 'Kitchen & Dining', order: 1 }],
    compactappliances: [
      { name: 'Small Appliances', order: 1 },
      { name: 'Compact Appliances', order: 1 },
    ],
    mattresses: [{ name: 'Mattresses', order: 2 }],
    music: [{ name: 'music', order: 0 }],
    musicalinstruments: [{ name: 'Musical Instruments"', order: 0 }],
    officeproducts: [{ name: 'office Products"', order: 0 }],
    // Outdoors and Sports =
    sports: [{ name: 'Sports & Outdoors', order: 0 }],
    personalcomputers: [{ name: 'Computers & Accessories', order: 1 }],
    petsupplies: [{ name: 'Pet Supplies', order: 0 }],
    softwarecomputervideogames: [
      { name: 'Video Games', order: 1 },
      { name: 'Software', order: 1 },
    ],
    // "Toys & Games",
    toolshomeimprovement: [{ name: 'Tools & Home Improvement', order: 0 }],
    toysgames: [{ name: 'Toys & Games', order: 0 }],
    videodvd: [{ name: 'Movies & TV', order: 1 }],
    // Video Game -> Controllers
    videogameconsoles: [{ name: 'Controllers', require: ['Video Games'], order: 2 }],
    // Categories requiring approval TODO
    // Full-Size Appliances TODO
    '3dprintedproducts': [
      { name: 'Additive Manufacturing Products', order: 1 },
      { name: '3D Printers', order: 2 },
    ],
    automotivepowersports: [{ name: 'Automotive', order: 1 }],
    beauty: [{ name: 'Beauty & Personal Care', order: 1 }],
    // Clothing by breadcrumbTree
    clothingaccessories: [
      { name: 'Clothing, Shoes & Jewelry', order: 0 },
      { name: 'Clothing', order: 2 },
    ],
    collectiblecoins: [{ name: 'Collectible Currencies', order: 2 }],
    entertainmentcollectibles: [{ name: 'Entertainment Collectibles', order: 2 }],
    fineart: [{ name: 'Fine Art', order: 1 }],
    // Gift Cards by breadcrumbTree
    giftcards: [{ name: 'Gift Cards', order: 0 }],
    grocerygourmetfood: [{ name: 'Grocery & Gourmet Food', order: 0 }],
    healthpersonalcare: [{ name: 'Health & Household', order: 0 }],
    industrialscientific: [{ name: 'Industrial & Scientific', order: 0 }],
    jewelry: [{ name: 'jewelry', order: 2 }],
    luggagetravelaccessories: [{ name: 'Luggage & Travel Gear', order: 2 }],
    shoeshbagssunglasses: [
      { name: 'Sunglasses & Eyewear Accessories', order: 2 },
      { name: 'Sunglasses', order: 2 },
      { name: 'Handbags & Wallets', order: 2 },
      { name: 'Shoes & Wallets', order: 2 },
    ],
    // Sports Collectibles = by rawCategory
    sportscollectibles: [{ name: 'Sports Collectibles', order: 2 }],
    // demo: B08J5LPB6G or B08FWKGKC2 ??
    watches: [{ name: 'Watches', order: 1 } /** , 'Smartwatches' */],
  },
}

export const getCategoryMappingByCountryCode = (countryCode: string) => {
  return CountryCategoryMapping[countryCode] || {}
}
