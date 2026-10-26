import { products } from '../../data/product'
import ProductCard from '../../components/ProductCard'

const CategoryPage = () => {
  const filtered = products.filter(p => p.category === "Hair Care")
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Hair Care</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {filtered.map(product => (
          <ProductCard key={product.id} p={product} />
        ))}
      </div>
    </div>
  )
}
export default CategoryPage
