/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import type { Product, ProductDTO, PageProductDTO } from '../types/api';
import { useDebounce } from '../hooks/useDebounce';
import { productService } from '../services/api/ProductService';

interface Filters {
  concerns: string[];
  skinType: string | null;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  loadMoreProducts: () => void;
  goToPage: (pageNumber: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  fetchProductDetails: (productId: number) => Promise<Product | undefined>;
  searchByBarcode: (barcode: string) => Promise<Product | null>;
  retryFetch: () => Promise<void>;
  isOffline: boolean;
  resetError: () => void;
  comparisonList: Product[];
  toggleCompare: (product: Product) => void;
  clearCompare: () => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

const MAX_RETRIES = 3;

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  // Store the enriched Product objects in state (not raw DTO)
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  const [filters, setFiltersState] = useState<Filters>({ concerns: [], skinType: null });

  const [comparisonList, setComparisonList] = useState<Product[]>([]);

  const resetError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  // Helper to map ProductDTO -> Product with safe defaults for UI
  const mapDtoToProduct = (dto: ProductDTO): Product => ({
    ...dto,
    skinTypeScore: {},
    ingredients: [],
    purchaseLinks: [],
    reviews: [],
    regulatoryLabels: [],
  });

  const fetchProducts = useCallback(async (
    pageToFetch: number,
    query: string,
    currentFilters: Filters,
    isLoadMore = false,
    isRetry = false,
    shouldReplace = false
  ) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      setError(null);
      setIsOffline(false);

      const result = await productService.searchProducts({
         query,
         page: pageToFetch,
         size: 21,
         skinType: currentFilters.skinType || undefined,
         concerns: currentFilters.concerns.length > 0 ? currentFilters.concerns : undefined
       });

      const pageResult = result as PageProductDTO;
      if (!pageResult || typeof pageResult !== 'object' || !Array.isArray(pageResult.content)) {
        throw new Error('Invalid response format from product API');
      }

      // Map DTOs to full Product objects with defaults expected by UI components
      const mappedContent: Product[] = pageResult.content.map(mapDtoToProduct);

      setProducts(prev => {
        if (shouldReplace) {
          return mappedContent;
        } else if (isLoadMore) {
          return [...prev, ...mappedContent];
        } else {
          return mappedContent;
        }
      });
      setTotalPages(pageResult.totalPages);
      setPage(pageResult.number);
      setRetryCount(0);

    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      console.error("Failed to fetch products:", errorMessage);

      const apiErr = e as unknown as { retryable?: boolean } | undefined;
      const isNonRetryable = !!(apiErr && apiErr.retryable === false);

      const isInputConversionError = /Failed to convert value of type/i.test(errorMessage) || /convert value of type 'java.lang.String' to required type 'java.lang.Long'/i.test(errorMessage);

      if (isNonRetryable || isInputConversionError) {
        console.warn('Non-retryable error from API detected; aborting retries.', apiErr || errorMessage);
        setError('Yêu cầu không hợp lệ đến máy chủ (tham số sai). Vui lòng kiểm tra bộ lọc/từ khóa tìm kiếm của bạn và thử lại. Nếu lỗi tiếp diễn, báo cho bộ phận hỗ trợ.');
        setRetryCount(MAX_RETRIES);
        if (!isLoadMore) {
          setProducts([]);
        }
      } else {
        if (!navigator.onLine || errorMessage.includes('Network error')) {
          setIsOffline(true);
          setError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.');
        } else if (errorMessage.includes('Server Error')) {
          setError('Máy chủ đang gặp sự cố. Chúng tôi đang cố gắng khắc phục. Vui lòng thử lại sau.');
        } else if (errorMessage.includes('Invalid response format')) {
          setError('Phản hồi từ máy chủ không hợp lệ. Vui lòng thử lại.');
        } else {
          setError('Có lỗi xảy ra khi tải sản phẩm. Vui lòng thử lại.');
        }

        if (retryCount < MAX_RETRIES && !isRetry) {
          console.warn(`Đang thử kết nối lại... Lần ${retryCount + 1}/${MAX_RETRIES}`);
          setTimeout(() => fetchProducts(pageToFetch, query, currentFilters, isLoadMore, true, shouldReplace),
            Math.min(1000 * Math.pow(2, retryCount), 10000));
          setRetryCount(prev => prev + 1);
        } else {
          if (!isLoadMore) {
            setProducts([]);
          }
          setError(prev => prev || 'Không thể tải sản phẩm sau nhiều lần thử. Vui lòng thử lại sau.');
        }
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [retryCount]);

  useEffect(() => {
    setError(null);
    setProducts([]);
    fetchProducts(0, debouncedSearchQuery, filters, false, false, true);
  }, [debouncedSearchQuery, filters, fetchProducts]);

  const retryFetch = useCallback(async () => {
    resetError();
    await fetchProducts(page, debouncedSearchQuery, filters, false, false, true);
  }, [page, debouncedSearchQuery, filters, fetchProducts, resetError]);

  useEffect(() => {
    const handleOnline = () => {
      if (isOffline) {
        setIsOffline(false);
        retryFetch();
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isOffline, retryFetch]);

  const loadMoreProducts = () => {
    if (!loadingMore && page < totalPages - 1) {
      fetchProducts(page + 1, debouncedSearchQuery, filters, true);
    }
  };

  const goToPage = useCallback((pageNumber: number) => {
    if (pageNumber >= 0 && pageNumber < totalPages && pageNumber !== page) {
      fetchProducts(pageNumber, debouncedSearchQuery, filters, false, false, true);
    }
  }, [page, totalPages, debouncedSearchQuery, filters, fetchProducts]);

  const toggleCompare = useCallback((product: Product) => {
    setComparisonList(prev => {
      if (prev.some(p => p.id === product.id)) {
        return prev.filter(p => p.id !== product.id);
      } else if (prev.length < 2) {
        return [...prev, product];
      } else {
        alert('Bạn chỉ có thể so sánh tối đa 2 sản phẩm.');
        return prev;
      }
    });
  }, []);

  const clearCompare = useCallback(() => {
    setComparisonList([]);
  }, []);

  const setFilters = (newFilters: Partial<Filters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }));
    setSearchQuery('');
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setFiltersState({ concerns: [], skinType: null });
  };

  const fetchProductDetails = useCallback(async (productId: number): Promise<Product | undefined> => {
    try {
      return await productService.getProductById(productId);
    } catch (e) {
      console.error(`Failed to fetch details for product ${productId}:`, e);
      setError(`Không thể tải chi tiết sản phẩm. Mã lỗi: ${productId}`);
      return undefined;
    }
  }, []);

  const searchByBarcode = useCallback(async (barcode: string): Promise<Product | null> => {
    try {
      const product = await productService.getProductByBarcode(barcode);
      return product;
    } catch (e) {
      console.error(`Failed to find product with barcode ${barcode}:`, e);
      throw e;
    }
  }, []);

  return (
    <ProductContext.Provider value={{
      products,
      loading,
      loadingMore,
      error,
      page,
      totalPages,
      loadMoreProducts,
      goToPage,
      searchQuery,
      setSearchQuery: handleSearchChange,
      filters,
      setFilters,
      fetchProductDetails,
      searchByBarcode,
      retryFetch,
      isOffline,
      resetError,
      comparisonList,
      toggleCompare,
      clearCompare
    }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);

  if (context === undefined) {
    return {
      products: [],
      loading: true,
      loadingMore: false,
      error: null,
      page: 0,
      totalPages: 0,
      loadMoreProducts: () => {},
      goToPage: () => {},
      searchQuery: '',
      setSearchQuery: () => {},
      filters: { concerns: [], skinType: null },
      setFilters: () => {},
      fetchProductDetails: async () => undefined,
      searchByBarcode: async () => null,
      retryFetch: async () => {},
      isOffline: false,
      resetError: () => {},
      comparisonList: [],
      toggleCompare: () => {},
      clearCompare: () => {},
    } as ProductContextType; // Explicitly cast to ProductContextType
  }

  return context;
};
