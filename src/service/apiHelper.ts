import axios from 'axios';

// Ensure axios sends cookies by default for cross-site requests
axios.defaults.withCredentials = true;

/**
 * Helper function to make authenticated API requests
 * Automatically includes credentials (cookies) and authorization header
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Merge headers
  const headers = {
    ...defaultHeaders,
    ...(options.headers as Record<string, string>),
  };
  
  // Make request with credentials to send/receive cookies
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Important: send cookies
    headers,
  });

  // Handle rate limiting
  if (response.status === 429) {
    const clonedResponse = response.clone();
    try {
      const data = await clonedResponse.json();
      throw new Error(data.message || 'Too many requests. This is a free service with rate limits. Please wait a moment and try again.');
    } catch (jsonError) {
      throw new Error('Too many requests. This is a free service with rate limits. Please wait a moment and try again.');
    }
  }

  return response;
};

/**
 * Example usage for protected routes:
 * 
 * const response = await authenticatedFetch('http://localhost:3000/skill-mint/protected-route', {
 *   method: 'GET'
 * });
 */
