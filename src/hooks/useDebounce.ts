import { useState, useEffect } from 'react';

/**
 * Hook tùy chỉnh để debounce một giá trị.
 * @param value Giá trị cần debounce.
 * @param delay Thời gian chờ (ms) trước khi cập nhật giá trị đã debounce.
 * @returns Giá trị đã được debounce.
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}