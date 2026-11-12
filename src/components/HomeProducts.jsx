import ProductCard from './ProductCard';
import { useProducts } from '../context/useProducts';

export default function HomeProducts() {
  const { products } = useProducts();

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.slice(0, 4).map((product) => (
        <ProductCard key={product.id} p={product} />
      ))}
    </div>
  );
}