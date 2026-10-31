import { useContext } from 'react';
import { ProductContext } from './productContext.js';

export function useProducts() {
  return useContext(ProductContext);
}
