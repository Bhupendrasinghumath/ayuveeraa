export const products = Array.from({ length: 42 }, (_, i) => {
  const baseList = [
    { name: "Ayuvya Lets Gain & i-Gain+ Combo", cat: "Weight Management", price: 1399, oldPrice: 1968, rating: 4.6, image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&h=500&fit=crop" },
    { name: "Ayuvya Diabo Plus Shots", cat: "Sugar Management", price: 999, oldPrice: 1199, rating: 4.6, image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=500&h=500&fit=crop" },
    { name: "Ayuvya Cholest Pro Juice", cat: "Heart Care", price: 749, oldPrice: 899, rating: 4.5, image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=500&fit=crop" },
    { name: "Ayuvya Blood Purifier Syrup", cat: "Blood Purifier", price: 699, oldPrice: 899, rating: 4.6, image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=500&h=500&fit=crop" },
    { name: "Ayuvya Herbal Hair Oil", cat: "Hair Care", price: 499, oldPrice: 699, rating: 4.7, image: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=500&h=500&fit=crop" },
    { name: "Ayuvya Glo Skin Mask", cat: "Skin Care", price: 499, oldPrice: 699, rating: 4.6, image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=500&h=500&fit=crop" },
    { name: "Ayuvya Stress Relief Capsule", cat: "Stress Management", price: 599, oldPrice: 799, rating: 4.7, image: "https://images.unsplash.com/photo-1608571423902-eed4a94d8108?w=500&h=500&fit=crop" },
    { name: "Ayuvya Digestion Support Tablet", cat: "Digestion Support", price: 549, oldPrice: 749, rating: 4.5, image: "https://images.unsplash.com/photo-1547887538-e3a2f32cb1cc?w=500&h=500&fit=crop" },
    { name: "Ayuvya Eye Care Drops", cat: "Eye Care", price: 299, oldPrice: 399, rating: 4.6, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop" },
    { name: "Ayuvya Migraine Relief Oil", cat: "Migraine Support", price: 449, oldPrice: 599, rating: 4.5, image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=500&h=500&fit=crop" },
    { name: "Ayuvya Herbal Immunity Shots", cat: "Herbal Shots", price: 999, oldPrice: 1299, rating: 4.8, image: "https://images.unsplash.com/photo-1608571423902-eed4a94d8108?w=500&h=500&fit=crop" },
    { name: "Ayuvya Plant Protein Powder", cat: "Plant Protein Supplement", price: 1299, oldPrice: 1799, rating: 4.7, image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop" },
  ];

  const base = baseList[i % baseList.length];

  return {
    id: i + 1,
    name: i < baseList.length ? base.name : `${base.name} - Pack ${i + 1}`,
    category: base.cat,
    slug: base.cat.toLowerCase().replace(/ /g, '-').replace(/&/g, '').replace(/--/g, '-'),
    price: base.price,
    oldPrice: base.oldPrice,
    save: base.oldPrice - base.price,
    rating: base.rating,
    reviews: "2.3K",
    image: base.image,
    images: [base.image, base.image, base.image, base.image],
    description: `${base.name} - 100% Ayurvedic, Clinically Tested, GMP Certified`,
    tag: "As Seen On Shark Tank"
  };
});

export const categories = [
  { name: "All Products", path: "/products" },
  { name: "Weight Management", path: "/products/weight-management" },
  { name: "Hair Care", path: "/products/hair-care" },
  { name: "Skin Care", path: "/products/skin-care" },
  { name: "Stress Management", path: "/products/stress-management" },
  { name: "Blood Purifier", path: "/products/blood-purifier" },
  { name: "Digestion Support", path: "/products/digestion-support" },
  { name: "Eye Care", path: "/products/eye-care" },
  { name: "Heart Care", path: "/products/heart-care" },
  { name: "Migraine Support", path: "/products/migraine-support" },
  { name: "Herbal Shots", path: "/products/herbal-shots" },
  { name: "Plant Protein Supplement", path: "/products/plant-protein-supplement" },
  { name: "Sugar Management", path: "/products/sugar-management" },
];

export default products;