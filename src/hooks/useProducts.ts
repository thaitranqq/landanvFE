import { useContext } from 'react';
import { ProductContext } from '../context/ProductContext';

export const useProducts = () => {
  const context = useContext(ProductContext);

  // If the context is not yet available, return a default, safe state.
  if (context === undefined) {
    return {
      products: [],
      loading: true,
      loadingMore: false,
      error: null,
      page: 0,
      totalPages: 0,
      loadMoreProducts: () => {},
      searchQuery: '', // Ensure searchQuery is always a string to prevent controlled/uncontrolled error
      setSearchQuery: () => {},
      filters: { concerns: [], skinType: null },
      setFilters: () => {},
      fetchProductDetails: async () => undefined,
      searchByBarcode: async () => null,
      retryFetch: async () => {},
      isOffline: false,
      resetError: () => {},
    };
  }

  return context;
};
