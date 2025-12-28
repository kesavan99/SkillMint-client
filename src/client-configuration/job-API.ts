import { authenticatedFetch } from '../service/apiHelper';

/**
 * Job Search API Configuration
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_BASE = `${BASE_URL}/api/jobs`;

export const jobSearchAPI = {
  /**
   * Search for jobs
   */
  searchJobs: async (searchParams: {
    role?: string;
    designation?: string;
    experienceLevel?: string;
    location?: string;
    jobType?: string;
    resumeId?: string;
  }) => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/search`, {
        method: 'POST',
        body: JSON.stringify(searchParams)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search for jobs');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Job search API error:', error);
      throw error;
    }
  },

  /**
   * Poll job search progress
   */
  pollJobSearch: async (taskId: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/search/poll/${taskId}`, {
        method: 'GET'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to poll job search');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Job search poll API error:', error);
      throw error;
    }
  },

  /**
   * Get job details from URL
   */
  getJobDetails: async (url: string) => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/details`, {
        method: 'POST',
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get job details');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Get job details API error:', error);
      throw error;
    }
  },

  /**
   * Health check
   */
  healthCheck: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE}/health`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error('Job service unavailable');
      }

      return await response.json();
    } catch (error: any) {
      console.error('Job service health check error:', error);
      throw error;
    }
  }
};
