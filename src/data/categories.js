function categorySlug(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function hasProductsInCategory(products, categoryName) {
  const selectedCategory = categoryName.trim().toLowerCase();
  return products.some(
    (product) => typeof product.category === 'string'
      && product.category.trim().toLowerCase() === selectedCategory,
  );
}

export function getAvailableProductCategories(products) {
  const available = new Map();
  products.forEach((product) => {
    if (typeof product.category !== 'string' || product.category.trim() === '') return;
    const name = product.category.trim();
    const slug = typeof product.categorySlug === 'string' && product.categorySlug
      ? product.categorySlug
      : categorySlug(name);
    if (slug && !available.has(slug)) {
      available.set(slug, {
        name,
        slug,
        path: `/products?category=${encodeURIComponent(slug)}`,
      });
    }
  });

  return [
    { name: 'All Products', slug: '', path: '/products' },
    ...available.values(),
  ];
}
