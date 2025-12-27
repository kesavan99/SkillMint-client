import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { getProfile, updateProfile } from '../client-configuration/profile-API';
import { getSavedResumes, deleteResume } from '../client-configuration/resume-API';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  profilePicture: string;
  lastLogin: string;
  details: {
    designation: string;
    areaOfInterest: string;
    linkedinProfile?: string;
    githubProfile?: string;
    resumeWebsiteUrl?: string;
    blogUrl?: string;
  };
}

interface SavedResume {
  id: string;
  resumeId: string;
  resumeName: string;
  index: number;
  generatedDate: string;
  templateName: string;
  isDynamic?: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [savedResumes, setSavedResumes] = useState<SavedResume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    designation: '',
    areaOfInterest: '',
    linkedinProfile: '',
    githubProfile: '',
    resumeWebsiteUrl: '',
    blogUrl: ''
  });

  useEffect(() => {
    fetchProfile();
    fetchSavedResumes();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getProfile();
      
      if (response.success) {
        setProfileData(response.data);
        setFormData({
          name: response.data.name || '',
          phone: response.data.phone || '',
          designation: response.data.details.designation || 'N/A',
          areaOfInterest: response.data.details.areaOfInterest || 'N/A',
          linkedinProfile: response.data.details.linkedinProfile || '',
          githubProfile: response.data.details.githubProfile || '',
          resumeWebsiteUrl: response.data.details.resumeWebsiteUrl || '',
          blogUrl: response.data.details.blogUrl || ''
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);
      
      const response = await updateProfile(formData);
      
      if (response.success) {
        setProfileData(response.data);
        setSuccessMessage('Profile updated successfully!');
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const fetchSavedResumes = async () => {
    try {
      setIsLoadingResumes(true);
      const response = await getSavedResumes();
      
      if (response.success && response.data) {
        setSavedResumes(response.data);
      }
    } catch (err: any) {
    } finally {
      setIsLoadingResumes(false);
    }
  };

  const handlePreviewResume = (resumeId: string) => {
    // Check if this is a dynamic resume
    const resume = savedResumes.find(r => r.resumeId === resumeId);
    
    if (resume?.isDynamic) {
      // Open dynamic resume editor in new tab for dynamic resumes
      window.open(`/dynamic-resume-editor?resumeId=${resumeId}`, '_blank');
    } else {
      // Open regular resume view in new tab for normal resumes
      window.open(`/resume-view/${resumeId}`, '_blank');
    }
  };

  const handleEditResume = (resumeId: string) => {
    // Check if this is a dynamic resume
    const resume = savedResumes.find(r => r.resumeId === resumeId);
    
    if (resume?.isDynamic) {
      // Navigate to dynamic resume editor for dynamic resumes
      navigate(`/dynamic-resume-editor?resumeId=${resumeId}`);
    } else {
      // Navigate to regular resume builder for normal resumes
      navigate(`/resume-builder?resumeId=${resumeId}`);
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    setIsDeleting(true);
    try {
      const response = await deleteResume(resumeId);
      
      if (response.success) {
        // Remove from local state
        setSavedResumes(prev => prev.filter(r => r.resumeId !== resumeId));
        setSuccessMessage('Resume deleted successfully!');
        setDeleteConfirmId(null);
        
        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete resume');
      setTimeout(() => {
        setError(null);
      }, 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="flex items-center justify-center min-h-[80vh]">
          <div className="flex items-center gap-3 text-gray-600">
            <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading profile...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="px-5 py-8 mx-auto md:py-16 max-w-7xl">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 md:mb-8">
            <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-4xl">My Profile</h1>
            <p className="text-sm text-gray-600 md:text-base">Manage your account information and preferences</p>
          </div>

          {error && (
            <div className="p-4 mb-6 text-red-800 bg-red-100 border border-red-300 rounded-lg">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="p-4 mb-6 text-green-800 bg-green-100 border border-green-300 rounded-lg">
              {successMessage}
            </div>
          )}

          <div className="overflow-hidden bg-white border-0 shadow-2xl rounded-2xl">
            {/* Profile Header */}
            <div className="p-4 border-b-0 md:p-6 bg-gradient-to-r from-primary-500 via-purple-500 to-blue-500">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center justify-center text-2xl font-bold bg-white rounded-full shadow-lg w-14 h-14 md:w-20 md:h-20 md:text-3xl text-primary-600">
                  {profileData?.name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white md:text-2xl">{profileData?.name || 'User'}</h2>
                  <p className="text-sm text-blue-100 md:text-base">{profileData?.email}</p>
                  <p className="mt-1 text-xs text-blue-200 md:text-sm">
                    Last login: {formatDate(profileData?.lastLogin || '')}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={profileData?.email || ''}
                    disabled
                    className="w-full px-4 py-3 text-gray-600 border border-gray-300 rounded-lg cursor-not-allowed bg-gray-50"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Designation / Job Role
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="e.g., Full Stack Developer, UI/UX Designer"
                  />
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-700">
                    Area of Interest / Passion
                  </label>
                  <select
                    name="areaOfInterest"
                    value={formData.areaOfInterest}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="N/A">Select your area of interest</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="DevOps Engineer">DevOps Engineer</option>
                    <option value="Product Manager">Product Manager</option>
                    <option value="Business Analyst">Business Analyst</option>
                    <option value="Marketing Specialist">Marketing Specialist</option>
                    <option value="Content Creator">Content Creator</option>
                    <option value="Fitness Trainer">Fitness Trainer</option>
                    <option value="Barber / Stylist">Barber / Stylist</option>
                    <option value="Chef / Cook">Chef / Cook</option>
                    <option value="Teacher / Educator">Teacher / Educator</option>
                    <option value="Photographer">Photographer</option>
                    <option value="Musician">Musician</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800">Social Profiles (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        LinkedIn Profile
                      </label>
                      <input
                        type="url"
                        name="linkedinProfile"
                        value={formData.linkedinProfile}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://linkedin.com/in/yourprofile"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        GitHub Profile
                      </label>
                      <input
                        type="url"
                        name="githubProfile"
                        value={formData.githubProfile}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://github.com/yourusername"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Resume Website URL
                      </label>
                      <input
                        type="url"
                        name="resumeWebsiteUrl"
                        value={formData.resumeWebsiteUrl}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://yourwebsite.com"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-semibold text-gray-700">
                        Blog URL
                      </label>
                      <input
                        type="url"
                        name="blogUrl"
                        value={formData.blogUrl}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="https://yourblog.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-8">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Saved Resumes Section */}
          <div className="mt-6 overflow-hidden bg-white shadow-2xl md:mt-8 rounded-2xl">
            <div className="p-4 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold md:text-2xl bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">My Resumes</h2>
                <p className="mt-1 text-sm text-gray-600">View, edit, and manage your saved resumes</p>
              </div>
              
              {isLoadingResumes ? (
                <div className="py-8 text-center text-gray-600">
                  Loading resumes...
                </div>
              ) : savedResumes.length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                  No resumes found. Create your first resume to get started!
                </div>
              ) : (
                <div className="space-y-4">
                  {savedResumes.map((resume) => (
                    <div
                      key={resume.id}
                      className="flex flex-col gap-4 p-4 transition-all duration-300 border-2 border-transparent rounded-xl md:flex-row md:items-center md:justify-between md:p-6 hover:shadow-lg hover:border-primary-200 bg-gradient-to-br from-white to-blue-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-base font-semibold text-gray-900 md:text-lg">
                            {resume.resumeName || 'Untitled Resume'}
                          </h3>
                          {resume.isDynamic && (
                            <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                              Dynamic
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 md:text-sm">
                          Created on: {new Date(resume.generatedDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Template: {resume.templateName}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2 md:flex-row md:gap-3">
                        <button
                          onClick={() => handlePreviewResume(resume.resumeId)}
                          className="w-full px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg md:w-auto md:px-5 bg-primary-600 hover:bg-primary-700"
                        >
                          Preview
                        </button>
                        <button
                          onClick={() => handleEditResume(resume.resumeId)}
                          className="w-full px-4 py-2 text-sm font-medium transition-colors border rounded-lg md:w-auto md:px-5 text-primary-600 border-primary-600 hover:bg-primary-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(resume.resumeId)}
                          className="w-full px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg md:w-auto md:px-5 hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <div className="flex items-start mb-4">
              <svg className="w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Resume</h3>
                <p className="mt-2 text-sm text-gray-600">
                  Are you sure you want to delete this resume? This action cannot be undone.
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteResume(deleteConfirmId)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
