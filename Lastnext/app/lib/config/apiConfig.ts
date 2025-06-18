import { mockApiClient } from '../mock/mockApiClient';
import { apiClient } from '../api-client';

// Determine if we should use mock API
const USE_MOCK_API = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';

// Export the appropriate API client
export const api = USE_MOCK_API ? mockApiClient : apiClient;

// Export a function to check if we're using mock API
export const isUsingMockApi = () => USE_MOCK_API; 