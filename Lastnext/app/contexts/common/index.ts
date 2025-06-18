// app/contexts/common/index.ts
import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

/**
 * Common context state interface
 */
interface CommonContextState {
  isLoading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

/**
 * Common context provider props
 */
interface CommonContextProviderProps {
  children: ReactNode;
}

/**
 * Create common context
 */
const CommonContext = createContext<CommonContextState | undefined>(undefined);

/**
 * Common context provider component
 */
export function CommonContextProvider({ children }: CommonContextProviderProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setErrorState] = useState<string | null>(null);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  const setError = useCallback((errorMessage: string | null) => {
    setErrorState(errorMessage);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  const contextValue: CommonContextState = {
    isLoading,
    error,
    setLoading,
    setError,
    clearError,
  };

  return React.createElement(
    CommonContext.Provider,
    { value: contextValue },
    children
  );
}

/**
 * Hook to use common context
 */
export function useCommon(): CommonContextState {
  const context = useContext(CommonContext);
  if (context === undefined) {
    throw new Error('useCommon must be used within a CommonContextProvider');
  }
  return context;
}

/**
 * Hook for loading state management
 */
export function useLoading() {
  const { isLoading, setLoading } = useCommon();
  return { isLoading, setLoading };
}

/**
 * Hook for error state management
 */
export function useError() {
  const { error, setError, clearError } = useCommon();
  return { error, setError, clearError };
}

export { CommonContext };