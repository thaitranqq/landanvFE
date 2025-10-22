// Re-export the single source-of-truth `useProducts` from the ProductContext to
// avoid duplicate/fallback implementations that cause TypeScript unions with
// missing properties.
export { useProducts } from '../context/ProductContext';

