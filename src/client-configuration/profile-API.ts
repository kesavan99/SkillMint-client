import { authenticatedFetch } from '../service/apiHelper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface ProfileUpdateData {
  name?: string;
  phone?: string;
  designation?: string;
  areaOfInterest?: string;
}

export const getProfile = async () => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/skill-mint/user/profile`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch profile');
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch profile');
  }
};

export const updateProfile = async (data: ProfileUpdateData) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/skill-mint/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to update profile');
  }
};

export const requestJobSearchLimitExtension = async (message: string) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/skill-mint/user/request-job-search-extension`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to submit request');
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to submit request');
  }
};
