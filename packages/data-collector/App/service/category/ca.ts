export default {
  // categoryCode by amazon-devices
  // amazondeviceaccessories:[]
  baby: [
    { name: 'Baby', order: 0 },
    { name: 'Bébé et Puériculture', order: 0 },
  ],
  books: [
    { name: 'Livres', order: 0 },
    { name: 'Books', order: 0 },
  ],
  cameraphoto: [
    { name: 'Camera, Photo & Video', order: 0 },
    { name: 'Photo, vidéo et optique', order: 0 },
  ],
  cellphones: [
    { name: 'Cell Phones & Accessories', order: 1 },
    { name: 'Téléphones cellulaires et accessoires', order: 1 },
  ],
  consumerelectronics: [
    { name: 'Electronics', order: 0 },
    { name: 'Électronique', order: 0 },
  ],
  dvds: [{ name: 'Movies & TV', order: 0 }],
  electronicsaccessories: [
    { name: 'Accessories', require: ['Electronics'], order: 2 },
    { name: 'Câbles et accessoires', require: ['Électronique'], order: 2 },
  ],
  // outdoorfurniture
  furniture: [
    { name: 'Furniture', order: 1 },
    { name: 'Mobilier', order: 1 },
  ],
  homegarden: [
    { name: 'Patio, Lawn & Garden', order: 1 },
    { name: 'Terrasse et Jardin', order: 1 },
  ],
  petsupplies: [
    { name: 'Pet Supplies', order: 0 },
    { name: 'Animalerie', order: 0 },
  ],
  industrialscientific: [
    { name: 'Industrial & Scientific', order: 0 },
    { name: 'Commerce, Industrie et Science', order: 0 },
  ],
  music: [{ name: 'Music', order: 0 }],
  musicalinstruments: [
    { name: 'Musical Instruments, Stage & Studio', order: 0 },
    { name: 'Instruments de musique, scène et studio', order: 0 },
  ],
  officeproducts: [
    { name: 'Office Products', order: 0 },
    { name: 'Fournitures pour le bureau', order: 0 },
  ],
  personalcomputers: [
    { name: 'Computers & Accessories', order: 1 },
    { name: 'Ordinateurs et accessoires', order: 1 },
  ],
  // by categoryCode
  softwarecomputergames: [
    { name: 'Games', require: ['PC'], order: 3 },
    { name: 'Jeux', require: ['PC'], order: 3 },
    { name: 'Software', order: 0 },
    { name: 'Logiciels', order: 0 },
  ],
  sportsoutdoors: [
    { name: 'Sports & Outdoors', order: 0 },
    { name: 'Sports et Plein air', order: 0 },
  ],
  toolshomeimprovement: [
    { name: 'Tools & Home Improvement', order: 0 },
    { name: 'Outils et Bricolage', order: 0 },
  ],
  toysgames: [
    { name: 'Toys & Games', order: 0 },
    { name: 'Jeux et Jouets', order: 0 },
  ],
  videogameconsoles: [
    { name: 'Consoles', require: ['Video Games'], order: 3 },
    { name: 'Consoles', require: ['Jeux vidéo'], order: 3 },
  ],
  videogames: [
    { name: 'Video Games', order: 0 },
    { name: 'Jeux vidéo', order: 0 },
  ],
  videos: [{ name: 'Movies & TV', order: 0 }],
  // everythingelse
  // categoriesrequiringapproval
  automotivepowersports: [
    { name: 'Automotive', order: 0 },
    { name: 'Auto', order: 0 },
  ],
  beauty: [
    { name: 'Beauty & Personal Care', order: 0 },
    { name: 'Beauté', order: 0 },
  ],
  clothingaccessories: [
    { name: 'Clothing, Shoes & Accessories', order: 0 },
    { name: 'Mode', order: 0 },
  ],
  grocerygourmetfood: [
    { name: 'Grocery & Gourmet Food', order: 0 },
    { name: 'Épicerie et Cuisine gastronomique', order: 0 },
  ],
  // Personal Care Appliances
  healthpersonalcare: [
    { name: 'Health & Personal Care', order: 0 },
    { name: 'Santé et Soins personnels', order: 0 },
  ],
  jewellery: [
    { name: 'Jewelry', order: 3 },
    { name: 'Bijoux', order: 3 },
  ],
  luggagebags: [
    { name: 'Luggage & Travel Gear', order: 2 },
    { name: 'Luggage', order: 3 },
    { name: 'Bagages et équipement de voyage', order: 2 },
    { name: 'Valises et sacs de voyage', order: 3 },
  ],
  majorappliances: [
    { name: 'Large Appliances', order: 0 },
    { name: 'Gros électroménagers', order: 0 },
  ],
  shoeshbags: [
    { name: 'Handbags & Shoulder Bags', order: 3 },
    { name: 'Shoes', order: 3 },
    { name: 'Sacs à main et sacs à bandoulière', order: 3 },
    { name: 'Chaussures', order: 3 },
  ],
  sportscollectibles: [
    { name: 'Sports Collectibles', require: ['Sports & Outdoors'], order: 2 },
    { name: 'Articles de sport à collectionner', require: ['Sports et Plein air'], order: 2 },
  ],
  watches: [
    { name: 'Watches', order: 3 },
    { name: 'Montres', order: 0 },
  ],
  // Food Service
  foodservicejanitorialsanitation: [
    { name: 'Janitorial & Sanitation Supplies', order: 2 },
    { name: 'Fournitures de nettoyage et d’entretien', order: 2 },
  ],
  sunglasses: [
    { name: 'Sunglasses', require: ['Clothing, Shoes & Accessories'], order: 4 },
    { name: 'Lunettes de soleil', require: ['Mode'], order: 4 },
  ],
}
