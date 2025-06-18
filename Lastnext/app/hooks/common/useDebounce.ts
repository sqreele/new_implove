'use client';

import { useState, useEffect } from 'react';

/**
 * A custom hook that debounces a value with a specified delay.
 * Useful for optimizing performance when handling frequent updates like search inputs or filter changes.
 * 
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns The debounced value
 * 
 * @example
 * ```tsx
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 300);
 * 
 * // Use debouncedSearchTerm in your API calls or effects
 * useEffect(() => {
 *   // This will only run after the user stops typing for 300ms
 *   fetchSearchResults(debouncedSearchTerm);
 * }, [debouncedSearchTerm]);
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if the value changes before the delay has passed
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * A custom hook that debounces a callback function.
 * Useful for optimizing performance when handling frequent events like scroll or resize.
 * 
 * @param callback - The callback function to debounce
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns A debounced version of the callback function
 * 
 * @example
 * ```tsx
 * const handleScroll = useDebouncedCallback((event) => {
 *   // This will only run after the user stops scrolling for 300ms
 *   console.log('Scroll position:', event.target.scrollTop);
 * }, 300);
 * 
 * return <div onScroll={handleScroll}>...</div>;
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return (...args: Parameters<T>) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    const newTimeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    setTimeoutId(newTimeoutId);
  };
}

/**
 * A custom hook that debounces both a value and a callback function.
 * Useful when you need both the debounced value and a debounced callback.
 * 
 * @param initialValue - The initial value
 * @param callback - The callback function to call with the debounced value
 * @param delay - The delay in milliseconds (default: 500ms)
 * @returns A tuple containing the current value, setter function, and debounced value
 * 
 * @example
 * ```tsx
 * const [value, setValue, debouncedValue] = useDebouncedState('', (value) => {
 *   // This will only run after the user stops typing for 300ms
 *   console.log('Debounced value:', value);
 * }, 300);
 * 
 * return (
 *   <input
 *     value={value}
 *     onChange={(e) => setValue(e.target.value)}
 *   />
 * );
 * ```
 */
export function useDebouncedState<T>(
  initialValue: T,
  callback: (value: T) => void,
  delay: number = 500
): [T, (value: T) => void, T] {
  const [value, setValue] = useState<T>(initialValue);
  const debouncedValue = useDebounce(value, delay);

  useEffect(() => {
    callback(debouncedValue);
  }, [debouncedValue, callback]);

  return [value, setValue, debouncedValue];
} 