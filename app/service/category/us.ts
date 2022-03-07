export default {
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
  electronicsaccessories: [
    { name: 'Accessories & Supplies', require: ['Electronics'], order: 1 },
    { name: 'Smartwatches', require: ['Electronics'], order: 2 },
    { name: 'Batteries', require: ['Cell Phones & Accessories'], order: 2 },
    { name: 'Cradles', require: ['Cell Phones & Accessories'], order: 1 },
    { name: 'Chargers & Power Adapters', require: ['Cell Phones & Accessories'], order: 1 },
  ],
  furniture: [{ name: 'Furniture', order: 0 }],
  homegarden: [{ name: 'Patio, Lawn & Garden', order: 1 }],
  kitchen: [{ name: 'Kitchen & Dining', order: 1 }],
  compactappliances: [
    { name: 'Small Appliances', order: 2 },
    { name: 'Compact Appliances', order: 1 },
    { name: 'Washers & Dryers', require: ['Laundry Appliances'], order: 1 },
    { name: 'Dishwashers', require: ['Appliances'], order: 1 },
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
    { name: 'Joysticks', require: ['Video Games', 'Accessories'], order: 3 },
  ],
  // "Toys & Games",
  toolshomeimprovement: [{ name: 'Tools & Home Improvement', order: 0 }],
  toysgames: [{ name: 'Toys & Games', order: 0 }],
  videodvd: [{ name: 'Movies & TV', order: 1 }],
  // Video Game -> Controllers
  videogameconsoles: [
    { name: 'Consoles', require: ['Video Games'], order: 2 },
    { name: 'Accessories', require: ['Video Games'], order: 2 },
  ],
  // Categories requiring approval TODO
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
  entertainmentcollectibles: [{ name: 'Entertainment', require: ['Collectibles & Fine Art'], order: 2 }],
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
    { name: 'Shoes', order: 1 },
  ],
  sportscollectibles: [{ name: 'Sports', require: ['Collectibles & Fine Art'], order: 2 }],
  // demo: B08J5LPB6G or B08FWKGKC2 ??
  watches: [{ name: 'Watches', order: 1 } /** , 'Smartwatches' */],
  // Full-Size Appliances -> laundryappliances & refrigerationappliances & dishwashers & cookingappliances
  refrigerationappliances: [{ name: 'Refrigerators', order: 2 }],
  cookingappliances: [{ name: 'Ranges, Ovens & Cooktops', order: 1 }],
}
