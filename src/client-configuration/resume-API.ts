import { authenticatedFetch } from '../service/apiHelper';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const saveResume = async (resumeData: any) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/skill-mint/resume/save`, {
      method: 'POST',
      body: JSON.stringify(resumeData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save resume');
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to save resume');
  }
};

export const getSavedResumes = async () => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/skill-mint/resume/saved`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch saved resumes');
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch saved resumes');
  }
};

export const getResumeById = async (id: string) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/skill-mint/resume/saved/${id}`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch resume');
    }
    
    return await response.json(); // Returns JSON resume data
  } catch (error: any) {
    throw new Error(error.message || 'Failed to fetch resume');
  }
};

export const deleteResume = async (id: string) => {
  try {
    const response = await authenticatedFetch(`${BASE_URL}/skill-mint/resume/saved/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete resume');
    }
    
    return await response.json();
  } catch (error: any) {
    throw new Error(error.message || 'Failed to delete resume');
  }
};
