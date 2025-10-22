/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, ReactNode, useCallback, useEffect } from 'react';
import type { Product, ProductDTO, PageProductDTO } from '../types/api';
import { useDebounce } from '../hooks/useDebounce';
import { productService } from '../services/api/ProductService';

interface Filters {
  concerns: string[];
  skinType: string | null;
}

interface ProductContextType {
  products: ProductDTO[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  loadMoreProducts: () => void;
  goToPage: (pageNumber: number) => void; // New function for direct page navigation
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: Filters;
  setFilters: (filters: Partial<Filters>) => void;
  fetchProductDetails: (productId: number) => Promise<Product | undefined>;
  searchByBarcode: (barcode: string) => Promise<Product | null>;
  retryFetch: () => Promise<void>;
  isOffline: boolean;
  resetError: () => void;
}

export const ProductContext = createContext<ProductContextType | undefined>(undefined);

const MAX_RETRIES = 3;

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<ProductDTO[]>([]);
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

  const resetError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  const fetchProducts = useCallback(async (
    pageToFetch: number,
    query: string,
    currentFilters: Filters,
    isLoadMore = false,
    isRetry = false,
    shouldReplace = false // New parameter to indicate if products should be replaced (for direct page navigation)
  ) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
      setError(null);
      setIsOffline(false);

      const result = await productService.searchProducts({
         query,
         page: pageToFetch,
         size: 21, // Changed page size to 21
         skinType: currentFilters.skinType || undefined,
         concerns: currentFilters.concerns.length > 0 ? currentFilters.concerns : undefined
       });

      const pageResult = result as PageProductDTO;
      if (!pageResult || typeof pageResult !== 'object' || !Array.isArray(pageResult.content)) {
        throw new Error('Invalid response format from product API');
      }

      setProducts(prev => {
        if (shouldReplace) {
          return pageResult.content; // Replace products entirely for direct page navigation
        } else if (isLoadMore) {
          return [...prev, ...pageResult.content]; // Append for load more
        } else {
          return pageResult.content; // Initial fetch or new search/filter
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
    fetchProducts(0, debouncedSearchQuery, filters, false, false, true); // Initial fetch should replace products
  }, [debouncedSearchQuery, filters, fetchProducts]);

  const retryFetch = useCallback(async () => {
    resetError();
    await fetchProducts(page, debouncedSearchQuery, filters, false, false, true); // Retry current page
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
      resetError
    }}>
      {children}
    </ProductContext.Provider>
  );
};
