import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { jobSearchAPI } from '../client-configuration/job-API';
import { getSavedResumes } from '../client-configuration/resume-API';
import { requestJobSearchLimitExtension } from '../client-configuration/profile-API';
import { useTranslation } from '../locales';

interface JobSearchForm {
  role: string;
  experienceLevel: string;
  location: string;
  jobType: string;
  resumeId: string;
  company: string;
  platform: string;
}

interface Resume {
  id: string;
  resumeId: string;
  resumeName?: string;
  generatedDate?: string;
  templateName?: string;
  isDynamic?: boolean;
}

interface Job {
  id: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type?: string;
  experience?: string;
  salary?: string;
  description: string;
  source?: string;
  postedDate?: string;
  url?: string;
  applyLink?: string;
  applyQualityScore?: number;
  employmentType?: string;
  isRemote?: boolean;
  experienceRequired?: {
    min: number;
    max: number;
  };
  experienceMatch?: string;
  requiredSkills?: string[];
  requiredEducation?: {
    postgraduate_degree?: boolean;
    professional_certification?: boolean;
    high_school?: boolean;
  };
  publisher?: string;
  fetchedAt?: string;
  highlights?: {
    qualifications?: string[];
    responsibilities?: string[];
    benefits?: string[];
  };
  atsScore?: number;
  atsAnalysis?: {
    overall_match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    feedback: string;
    recommendations: string[];
    hard_filters?: {
      passed: boolean;
      location_match: boolean;
      work_authorization_match: boolean;
      experience_match: boolean;
      education_match: boolean;
      failure_reasons: string[];
    };
  };
}

interface ATSWeights {
  skills: number;
  experience: number;
  projects: number;
  keywords: number;
  summary: number;
  education: number;
}

const DEFAULT_WEIGHTS: ATSWeights = {
  skills: 0.35,
  experience: 0.30,
  projects: 0.15,
  keywords: 0.10,
  summary: 0.05,
  education: 0.05
};

const JobSearch: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<JobSearchForm>({
    role: '',
    experienceLevel: '',
    location: '',
    jobType: '',
    resumeId: '',
    company: '',
    platform: 'all',
  });

  const [searchMode, setSearchMode] = useState<'general' | 'company'>('general');
  const [searchLimit, setSearchLimit] = useState<number>(3);
  const [loadingQuota, setLoadingQuota] = useState(true);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noJobsMessage, setNoJobsMessage] = useState<any>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isRemoteSelected, setIsRemoteSelected] = useState(false);
  const [atsWeights, setAtsWeights] = useState<ATSWeights>(DEFAULT_WEIGHTS);
  const [extensionRequested, setExtensionRequested] = useState(false);
  const [extensionRequestStatus, setExtensionRequestStatus] = useState<string | null>(null);
  const [showExtensionSuccess, setShowExtensionSuccess] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);

  // Check if any single weight is 100%
  const hasMaxWeightWarning = Object.values(atsWeights).some(weight => weight >= 1.0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const cities = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Tirunelveli",
  "Thoothukudi",
  "Vellore",
  "Erode",
  "Tiruppur",
  "Thanjavur",
  "Dindigul",
  "Karur",
  "Namakkal",
  "Kanchipuram",
  "Tambaram",
  "Chengalpattu",
  "Hosur",
  "Krishnagiri",
  "Ranipet",
  "Bengaluru",
  "Mysuru",
  "Mangaluru",
  "Hubballi",
  "Dharwad",
  "Belagavi",
  "Kalaburagi",
  "Ballari",
  "Davangere",
  "Shivamogga",
  "Tumakuru",
  "Udupi",
  "Bidar",
  "Raichur",
  "Kolar",
  "Chikkaballapur",
  "Hassan",
  "Mandya",
  "Chitradurga",
  "Visakhapatnam",
  "Vijayawada",
  "Guntur",
  "Amaravati",
  "Tirupati",
  "Nellore",
  "Kakinada",
  "Rajahmundry",
  "Anantapur",
  "Kadapa",
  "Chittoor",
  "Eluru",
  "Ongole",
  "Srikakulam",
  "Vizianagaram",
   "Delhi",
  "Gurugram",
  "Noida",
  "Greater Noida",
  "Faridabad",
  "Ghaziabad",
  "Sonipat",
  "Meerut",
  "Rohtak",
  "Panipat",
   "Visakhapatnam",
  "Vijayawada",
  "Guntur",
  "Amaravati",
  "Tirupati",
  "Nellore",
  "Kakinada",
  "Rajahmundry",
  "Eluru",
  "Ongole",
  "Chittoor",
  "Anantapur",
  "Kadapa",
  "Srikakulam",
  "Vizianagaram",
  "Thiruvananthapuram",
  "Kochi",
  "Kozhikode",
  "Thrissur",
  "Kollam",
  "Alappuzha",
  "Palakkad",
  "Kannur",
  "Kottayam",
  "Malappuram",
   "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Switzerland",
  "Ireland",
  "Australia",
  "New Zealand",
  "India",
  "China",
  "Japan",
  "South Korea",
  "Singapore",
  "Malaysia",
  "Philippines",
  "Israel",
  "United Arab Emirates",
  "Saudi Arabia",
  "Brazil",
  "Mexico",
  "Russia",
  "Poland",
  "Ukraine",
  "Italy",
  "Spain",
  "Belgium",
  "Norway"
];

  // Fetch saved resumes on component mount
  useEffect(() => {
    const fetchResumes = async () => {
      setLoadingResumes(true);
      try {
        const response = await getSavedResumes();
        if (response.success) {
          setResumes(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching resumes:', error);
      } finally {
        setLoadingResumes(false);
      }
    };

    fetchResumes();
  }, []);

  // Fetch user's job search quota on mount
  useEffect(() => {
    const fetchQuota = async () => {
      setLoadingQuota(true);
      try {
        const response = await jobSearchAPI.getUserQuota();
        if (response.success) {
          setSearchLimit(response.searchLimit || 0);
          if (response.extensionRequest) {
            setExtensionRequested(response.extensionRequest.requested);
            setExtensionRequestStatus(response.extensionRequest.status);
          }
        }
      } catch (error) {
        console.error('Error fetching quota:', error);
        setSearchLimit(0);
      } finally {
        setLoadingQuota(false);
      }
    };

    fetchQuota();
  }, []);

  // Load ATS weights from localStorage
  useEffect(() => {
    const savedWeights = localStorage.getItem('atsWeights');
    if (savedWeights) {
      try {
        setAtsWeights(JSON.parse(savedWeights));
      } catch (e) {
        console.error('Failed to parse saved weights:', e);
      }
    }
  }, []);

  // Save ATS weights to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('atsWeights', JSON.stringify(atsWeights));
  }, [atsWeights]);

  const experienceLevels = Array.from({ length: 31 }, (_, i) => i);

  const jobTypes = [
    t('jobSearch.fullTime'),
    t('jobSearch.partTime'),
    t('jobSearch.contract'),
    t('jobSearch.internship'),
    t('jobSearch.freelance'),
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === 'location') {
      setIsRemoteSelected(false);
      setShowLocationDropdown(value.trim().length > 0);
    }
  };

  const handleWeightChange = (key: keyof ATSWeights, value: number) => {
    setAtsWeights(prev => {
      const remaining = 1 - value;
      const otherKeys = Object.keys(prev).filter(k => k !== key) as (keyof ATSWeights)[];
      const otherTotal = otherKeys.reduce((sum, k) => sum + prev[k], 0);
      
      // Distribute remaining weight proportionally among other keys
      const newWeights: ATSWeights = { ...prev, [key]: value };
      
      if (otherTotal > 0) {
        otherKeys.forEach(k => {
          newWeights[k] = (prev[k] / otherTotal) * remaining;
        });
      } else {
        // If all others are 0, distribute equally
        const equalShare = remaining / otherKeys.length;
        otherKeys.forEach(k => {
          newWeights[k] = equalShare;
        });
      }
      
      return newWeights;
    });
  };

  const resetWeightsToDefault = () => {
    setAtsWeights(DEFAULT_WEIGHTS);
  };

  const normalizeWeights = () => {
    const total = Object.values(atsWeights).reduce((sum, val) => sum + val, 0);
    if (Math.abs(total - 1.0) > 0.01) {
      const normalized: ATSWeights = {} as ATSWeights;
      Object.keys(atsWeights).forEach(key => {
        normalized[key as keyof ATSWeights] = atsWeights[key as keyof ATSWeights] / total;
      });
      setAtsWeights(normalized);
    }
  };

  const handleLocationSelect = (city: string) => {
    setFormData(prev => ({
      ...prev,
      location: city,
    }));
    setShowLocationDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !locationInputRef.current?.contains(event.target as Node)
      ) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.resumeId) {
      setError('Please select a resume for ATS analysis');
      return;
    }
    
    // Normalize weights before sending
    normalizeWeights();
    
    setIsSearching(true);
    setError(null);
    setSearchResults([]); // Clear previous results
    setNoJobsMessage(null); // Clear previous no jobs message
    setNoJobsMessage(null); // Clear previous no jobs message
    
    try {
      // Step 1: Start job search and get task ID
      const response = await jobSearchAPI.searchJobs({
        role: formData.role,
        designation: formData.role,
        experienceLevel: formData.experienceLevel,
        location: formData.location,
        jobType: formData.jobType,
        resumeId: formData.resumeId,
        company: searchMode === 'company' ? formData.company : undefined,
        platform: formData.platform,
        atsWeights: atsWeights
      });

      if (response.success && response.taskId) {
        // Update search limit from response
        if (response.searchLimit !== undefined) {
          setSearchLimit(response.searchLimit);
        }
        
        // Step 2: Start polling for results
        pollJobSearchResults(response.taskId);
      } else {
        setError(t('jobSearch.noJobsFound'));
        setSearchResults([]);
        setIsSearching(false);
      }
    } catch (err) {
      console.error('Error during job search:', err);
      if (err instanceof Error && err.message?.includes('limit exceeded')) {
        setError('Job search limit exceeded. You have used all 3 searches.');
      } else {
        setError('Failed to start job search');
      }
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const pollJobSearchResults = async (taskId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await jobSearchAPI.pollJobSearch(taskId);
        
        if (response.success) {
          // Update results incrementally
          setSearchResults(response.jobs || []);
          
          // Check if completed
          if (response.completed) {
            clearInterval(pollInterval);
            setIsSearching(false);
            
            if (response.status === 'failed') {
              setError(response.error || 'Job search failed');
            } else if (response.noJobsMessage) {
              // Handle 0 jobs with special message
              setError(null); // Clear any previous errors
              setNoJobsMessage(response.noJobsMessage);
            } else if (response.noJobsMessage) {
              // Handle 0 jobs with special message
              setError(null); // Clear any previous errors
            }
            
            console.log(`✅ Job search completed: ${response.processedJobs} jobs analyzed`);
          } else {
            console.log(`📊 Progress: ${response.processedJobs}/${response.totalJobs} jobs (${response.progress}%)`);
          }
        }
      } catch (err) {
        console.error('Error polling job search:', err);
        clearInterval(pollInterval);
        setIsSearching(false);
        setError('Failed to retrieve job search results');
      }
    }, 3000); // Poll every 3 seconds (reduced server load)

    // Timeout after 5 minutes (extended for Render.com cold starts)
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsSearching(false);
      setError('Job search timed out. Please try again.');
    }, 300000);
  };

  const handleReset = () => {
    setFormData({
      role: '',
      experienceLevel: '',
      location: '',
      jobType: '',
      resumeId: '',
      company: '',
      platform: 'all',
    });
    setSearchResults([]);
    setError(null);
    setNoJobsMessage(null);
    setIsRemoteSelected(false);
    setSearchMode('general');
  };

  const handleRequestExtension = async () => {
    try {
      const message = `User requesting job search limit extension. Current limit: ${searchLimit}/3`;
      const response = await requestJobSearchLimitExtension(message);
      
      if (response.success) {
        setExtensionRequested(true);
        setExtensionRequestStatus('pending');
        setShowExtensionSuccess(true);
        // Hide success banner after 5 seconds
        setTimeout(() => {
          setShowExtensionSuccess(false);
        }, 5000);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to submit request');
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />

      <main className="px-5 py-16 mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/job-portal-search.png" alt="Job Search" className="w-16 h-16" />
          </div>
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">{t('jobSearch.title')}</h1>
          <p className="text-lg text-white/90">{t('jobSearch.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row">
          {/* ATS Settings Panel - Left Side */}
          <div className="lg:w-80">
            <div className="sticky p-6 bg-white shadow-xl top-6 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <img src="/testing.png" alt="Settings" className="w-6 h-6" />
                <h3 className="text-lg font-bold text-gray-800">ATS Settings</h3>
              </div>
              
              <div className="space-y-4">
                  <p className="text-xs text-gray-600">Configure how resume scores are calculated. Total must equal 100%.</p>
                  
                  {hasMaxWeightWarning && (
                    <div className="p-3 border-l-4 border-orange-500 rounded-r-lg bg-orange-50">
                      <div className="flex items-start">
                        <span className="mr-2 text-orange-600">⚠️</span>
                        <p className="text-xs text-orange-800">
                          <strong>Warning:</strong> Setting only one weight to 100% may not provide balanced ATS scoring. Consider distributing weights across multiple factors.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {Object.keys(atsWeights).map((key) => {
                    const weightKey = key as keyof ATSWeights;
                    const percentage = Math.round(atsWeights[weightKey] * 100);
                    return (
                      <div key={key} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700 capitalize">
                            {key}
                          </label>
                          <span className="text-sm font-bold text-primary-600">{percentage}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={percentage}
                          onChange={(e) => handleWeightChange(weightKey, parseInt(e.target.value) / 100)}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(to right, #059669 0%, #059669 ${percentage}%, #e5e7eb ${percentage}%, #e5e7eb 100%)`
                          }}
                        />
                      </div>
                    );
                  })}
                  
                  <div className="pt-3 mt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700">Total:</span>
                      <span className={`text-sm font-bold ${
                        Math.abs(Object.values(atsWeights).reduce((sum, val) => sum + val, 0) - 1.0) < 0.01
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        {Math.round(Object.values(atsWeights).reduce((sum, val) => sum + val, 0) * 100)}%
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={normalizeWeights}
                        className="flex-1 px-3 py-2 text-xs font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                      >
                        Normalize
                      </button>
                      <button
                        onClick={resetWeightsToDefault}
                        className="flex-1 px-3 py-2 text-xs font-medium text-gray-700 transition-colors bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        Reset Default
                      </button>
                    </div>
                  </div>
                </div>
            </div>
          </div>

          {/* Main Content - Right Side */}
          <div className="flex-1">
            {/* Quota Display */}
            <div className="p-4 mb-6 bg-white border-2 border-blue-200 shadow-lg rounded-xl">
              {/* Extension Request Success Banner */}
              {showExtensionSuccess && (
                <div className="p-3 mb-4 border-2 border-green-300 rounded-lg bg-green-50 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✅</span>
                    <div>
                      <p className="text-sm font-semibold text-green-800">Request Sent Successfully!</p>
                      <p className="text-xs text-green-700">Admin will review your request soon.</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-600">Remaining Job Searches</h3>
                    {loadingQuota ? (
                      <p className="text-xl font-bold text-blue-600">Loading...</p>
                    ) : (
                      <p className={`text-2xl font-bold ${searchLimit === 0 ? 'text-red-600' : searchLimit === 1 ? 'text-amber-600' : 'text-blue-600'}`}>
                        {searchLimit} / 3
                      </p>
                    )}
                  </div>
                </div>
                {searchLimit <= 1 && searchLimit > 0 && (
                  <div className="px-4 py-2 text-sm font-medium rounded-lg text-amber-800 bg-amber-100">
                    ⚠️ Low quota
                  </div>
                )}
                {searchLimit === 0 && (
                  <div className="px-4 py-2 text-sm font-medium text-red-800 bg-red-100 rounded-lg">
                    ❌ No searches left
                  </div>
                )}
              </div>
              
              {/* Request Extension Button */}
              {searchLimit <= 1 && (
                <div>
                  {!extensionRequested ? (
                    <button
                      onClick={handleRequestExtension}
                      className="w-full px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      📨 Request to Extend Search Limit
                    </button>
                  ) : (
                    <div className={`w-full px-4 py-3 text-sm font-semibold rounded-lg text-center ${
                      extensionRequestStatus === 'pending' ? 'bg-amber-100 text-amber-800 border-2 border-amber-300' :
                      extensionRequestStatus === 'approved' ? 'bg-green-100 text-green-800 border-2 border-green-300' :
                      extensionRequestStatus === 'rejected' ? 'bg-red-100 text-red-800 border-2 border-red-300' :
                      'bg-gray-100 text-gray-800 border-2 border-gray-300'
                    }`}>
                      {extensionRequestStatus === 'pending' && '⏳ Request Sent - Pending Review'}
                      {extensionRequestStatus === 'approved' && '✅ Request Approved - Limit Extended'}
                      {extensionRequestStatus === 'rejected' && '❌ Request Rejected'}
                      {!extensionRequestStatus && '📨 Request Sent'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Search Mode Selector */}
            <div className="p-4 mb-6 bg-white shadow-lg rounded-xl">
              <label className="block mb-3 text-sm font-semibold text-gray-700">Search Mode</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSearchMode('general')}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    searchMode === 'general'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🌐</span>
                    <span>General Search</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('company')}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all ${
                    searchMode === 'company'
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xl">🏢</span>
                    <span>Company-Specific</span>
                  </div>
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {searchMode === 'general' 
                  ? 'Search across all companies' 
                  : 'Search for jobs at a specific company'}
              </p>
            </div>

            {/* Search Form */}
            <div className="p-6 mb-8 bg-white shadow-xl md:p-8 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="md:col-span-2">
                  <label htmlFor="resumeId" className="block mb-2 text-sm font-semibold text-gray-700">
                    Select Resume for ATS Analysis <span className="text-red-500">{t('jobSearch.required')}</span>
                  </label>
                  <select
                    id="resumeId"
                    name="resumeId"
                    value={formData.resumeId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                    disabled={loadingResumes}
                  >
                    <option value="">
                      {loadingResumes ? 'Loading resumes...' : 'Select a resume'}
                    </option>
                    {resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>
                        {resume.resumeName} 
                      </option>
                    ))}
                  </select>
                  {resumes.length === 0 && !loadingResumes && (
                    <p className="mt-2 text-sm text-amber-600">
                      ⚠️ No resumes found. Please create a resume first.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="role" className="block mb-2 text-sm font-semibold text-gray-700">
                    {t('jobSearch.roleLabel')} <span className="text-red-500">{t('jobSearch.required')}</span>
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder={t('jobSearch.rolePlaceholder')}
                    className="w-full px-4 py-3 text-black transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                {searchMode === 'company' && (
                  <div>
                    <label htmlFor="company" className="block mb-2 text-sm font-semibold text-gray-700">
                      Company Name <span className="text-red-500">{t('jobSearch.required')}</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g., Google, Microsoft, Amazon"
                      className="w-full px-4 py-3 text-black transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required={searchMode === 'company'}
                    />
                  </div>
                )}

                <div className="md:col-span-2">
                  <label className="block mb-3 text-sm font-semibold text-gray-700">
                    Job Platform
                  </label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {/* All Platforms */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, platform: 'all' }))}
                      className={`flex flex-col items-center gap-2 p-3 transition-all border-2 rounded-lg ${
                        formData.platform === 'all'
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-lg">
                        <span className="text-2xl">🌐</span>
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        formData.platform === 'all' ? 'text-primary-700' : 'text-gray-700'
                      }`}>
                        All Platforms
                      </span>
                    </button>

                    {/* LinkedIn */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, platform: 'linkedin' }))}
                      className={`flex flex-col items-center gap-2 p-3 transition-all border-2 rounded-lg ${
                        formData.platform === 'linkedin'
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white rounded-lg">
                        <img src="/linkedin.png" alt="LinkedIn" className="object-contain w-10 h-10" />
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        formData.platform === 'linkedin' ? 'text-primary-700' : 'text-gray-700'
                      }`}>
                        LinkedIn
                      </span>
                    </button>

                    {/* Indeed */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, platform: 'indeed' }))}
                      className={`flex flex-col items-center gap-2 p-3 transition-all border-2 rounded-lg ${
                        formData.platform === 'indeed'
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white rounded-lg">
                        <img src="/indeed.png" alt="Indeed" className="object-contain w-10 h-10" />
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        formData.platform === 'indeed' ? 'text-primary-700' : 'text-gray-700'
                      }`}>
                        Indeed
                      </span>
                    </button>

                    {/* Glassdoor */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, platform: 'glassdoor' }))}
                      className={`flex flex-col items-center gap-2 p-3 transition-all border-2 rounded-lg ${
                        formData.platform === 'glassdoor'
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white rounded-lg">
                        <img src="/glassdoor.png" alt="Glassdoor" className="object-contain w-10 h-10" />
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        formData.platform === 'glassdoor' ? 'text-primary-700' : 'text-gray-700'
                      }`}>
                        Glassdoor
                      </span>
                    </button>

                    {/* Naukri */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, platform: 'naukri' }))}
                      className={`flex flex-col items-center gap-2 p-3 transition-all border-2 rounded-lg ${
                        formData.platform === 'naukri'
                          ? 'border-primary-600 bg-primary-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-center w-12 h-12 overflow-hidden bg-white rounded-lg">
                        <img src="/naukari.png" alt="Naukri" className="object-contain w-10 h-10" />
                      </div>
                      <span className={`text-xs font-medium text-center ${
                        formData.platform === 'naukri' ? 'text-primary-700' : 'text-gray-700'
                      }`}>
                        Naukri
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="experienceLevel" className="block mb-2 text-sm font-semibold text-gray-700">
                    {t('jobSearch.experienceLevelLabel')} <span className="text-red-500">{t('jobSearch.required')}</span>
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">{t('jobSearch.selectExperience')}</option>
                    {experienceLevels.map((years) => (
                      <option key={years} value={years}>
                        {years} {years === 1 ? t('jobSearch.year') : t('jobSearch.years')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="jobType" className="block mb-2 text-sm font-semibold text-gray-700">
                    {t('jobSearch.jobTypeLabel')}
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">{t('jobSearch.selectJobType')}</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative md:col-span-2">
                  <label htmlFor="location" className="block mb-2 text-sm font-semibold text-gray-700">
                    {t('jobSearch.locationLabel')}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (isRemoteSelected) {
                          // Toggle off: clear remote selection
                          setFormData(prev => ({ ...prev, location: '' }));
                          setIsRemoteSelected(false);
                        } else {
                          // Toggle on: set remote
                          setFormData(prev => ({ ...prev, location: 'remote' }));
                          setShowLocationDropdown(false);
                          setIsRemoteSelected(true);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        isRemoteSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <img src="/remote-job.png" alt="Remote" className="w-8 h-8" />
                      {t('jobSearch.remoteButton')}
                    </button>
                  </div>
                  <input
                    ref={locationInputRef}
                    type="text"
                    id="location"
                    name="location"
                    value={isRemoteSelected ? '' : formData.location}
                    onChange={handleInputChange}
                    onFocus={() => {
                      if (!isRemoteSelected) {
                        setShowLocationDropdown(true);
                      }
                    }}
                    placeholder={isRemoteSelected ? t('jobSearch.remoteSelected') : t('jobSearch.typeCity')}
                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="off"
                    disabled={isRemoteSelected}
                  />
                  {showLocationDropdown && (() => {
                    const filtered = cities.filter(city => 
                      city.toLowerCase().includes(formData.location.toLowerCase())
                    );
                    return filtered.length > 0 && (
                      <div
                        ref={dropdownRef}
                        className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60"
                      >
                        {filtered.map((city, index) => (
                          <div
                            key={index}
                            onClick={() => handleLocationSelect(city)}
                            className="px-4 py-2 text-sm text-gray-900 cursor-pointer hover:bg-primary-50 hover:text-primary-700"
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 mt-0.5">📍</span>
                              <span>{city}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSearching || searchLimit === 0}
                  className="flex-1 px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={searchLimit === 0 ? 'No searches remaining' : ''}
                >
                  {isSearching ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('jobSearch.searching')}
                    </span>
                  ) : searchLimit === 0 ? (
                    '❌ No Searches Left'
                  ) : (
                    `🔍 ${t('jobSearch.searchJobs')} (${searchLimit} left)`
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  {t('jobSearch.reset')}
                </button>
              </div>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 mb-8 border-l-4 border-red-500 rounded-r-lg bg-red-50">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isSearching && (
            <div className="p-8 mb-8 text-center bg-white shadow-xl rounded-2xl">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 rounded-full border-primary-200"></div>
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent rounded-full border-t-primary-600 animate-spin"></div>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-gray-800">{t('jobSearch.retrievingJobs')}</h3>
                  <p className="text-sm text-gray-600">{t('jobSearch.pleaseWait')}</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm font-medium text-primary-700">{t('jobSearch.searchingStatus')}</span>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-6 bg-white shadow-xl md:p-8 rounded-2xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">{t('jobSearch.searchResults')}</h2>
              <div className="space-y-4">
                {searchResults.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 transition-all border border-gray-200 rounded-lg hover:shadow-lg hover:border-primary-200"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Header with ATS Score and Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* ATS Score Badge */}
                        {job.atsScore !== undefined && job.atsScore !== null && (
                          <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                            job.atsScore >= 80 ? 'bg-green-100 text-green-800' :
                            job.atsScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            🎯 ATS Match: {job.atsScore.toFixed(1)}%
                          </div>
                        )}
                        
                        {/* Experience Match Badge */}
                        {job.experienceMatch && (
                          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            job.experienceMatch === 'perfect' ? 'bg-green-100 text-green-700' :
                            job.experienceMatch === 'good' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {job.experienceMatch === 'perfect' ? '⭐ Perfect Match' : 
                             job.experienceMatch === 'good' ? '✓ Good Match' : 
                             job.experienceMatch}
                          </span>
                        )}

                        {/* Remote Badge */}
                        {job.isRemote && (
                          <span className="px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
                            🏠 Remote
                          </span>
                        )}

                        {/* Publisher Badge */}
                        {job.publisher && (
                          <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                            via {job.publisher}
                          </span>
                        )}
                      </div>

                      {/* Job Title and Company with Logo */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-1 gap-3">
                          {/* Company Logo */}
                          {job.companyLogo && (
                            <img 
                              src={job.companyLogo} 
                              alt={job.company}
                              className="object-contain w-12 h-12 p-1 rounded-lg bg-gray-50"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          )}
                          
                          <div className="flex-1">
                            <h3 className="mb-1 text-xl font-semibold text-gray-800">{job.title}</h3>
                            <p className="mb-2 text-lg font-medium text-gray-700">{job.company}</p>
                            
                            {/* Location and Employment Type */}
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              {job.location && (
                                <span className="flex items-center gap-1">
                                  📍 {job.location}
                                </span>
                              )}
                              {job.employmentType && (
                                <span className="flex items-center gap-1">
                                  💼 {job.employmentType}
                                </span>
                              )}
                              {job.experienceRequired && (
                                <span className="flex items-center gap-1">
                                  🎓 {job.experienceRequired.min}-{job.experienceRequired.max} years
                                </span>
                              )}
                            </div>

                            {/* Salary */}
                            {job.salary && (
                              <p className="mt-2 text-sm font-semibold text-green-600">
                                💰 {job.salary}
                              </p>
                            )}

                            {/* Posted Date */}
                            {job.postedDate && (
                              <p className="mt-1 text-xs text-gray-500">
                                Posted: {new Date(job.postedDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Apply Button */}
                        {job.applyLink && (
                          <a
                            href={job.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-primary-600 hover:bg-primary-700 whitespace-nowrap h-fit"
                          >
                            {t('jobSearch.applyNow')}
                          </a>
                        )}
                      </div>

                      {/* Job Description */}
                      {job.description && (
                        <div className="p-3 rounded-lg bg-gray-50">
                          <p className="text-sm text-gray-700 line-clamp-3">{job.description}</p>
                        </div>
                      )}

                      {/* Required Skills */}
                      {job.requiredSkills && job.requiredSkills.length > 0 && (
                        <div>
                          <p className="mb-2 text-sm font-semibold text-gray-700">🔧 Required Skills:</p>
                          <div className="flex flex-wrap gap-2">
                            {job.requiredSkills.map((skill, idx) => (
                              <span key={idx} className="px-3 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Highlights */}
                      {job.highlights && ((job.highlights.qualifications?.length ?? 0) > 0 || (job.highlights.responsibilities?.length ?? 0) > 0 || (job.highlights.benefits?.length ?? 0) > 0) && (
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                          {(job.highlights.qualifications?.length ?? 0) > 0 && (
                            <div className="p-3 rounded-lg bg-blue-50">
                              <p className="mb-2 text-xs font-semibold text-blue-800">✓ Qualifications</p>
                              <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                                {job.highlights.qualifications?.slice(0, 3).map((qual, idx) => (
                                  <li key={idx} className="line-clamp-2">{qual}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {(job.highlights.responsibilities?.length ?? 0) > 0 && (
                            <div className="p-3 rounded-lg bg-purple-50">
                              <p className="mb-2 text-xs font-semibold text-purple-800">📋 Responsibilities</p>
                              <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                                {job.highlights.responsibilities?.slice(0, 3).map((resp, idx) => (
                                  <li key={idx} className="line-clamp-2">{resp}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {(job.highlights.benefits?.length ?? 0) > 0 && (
                            <div className="p-3 rounded-lg bg-green-50">
                              <p className="mb-2 text-xs font-semibold text-green-800">🎁 Benefits</p>
                              <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                                {job.highlights.benefits?.slice(0, 3).map((benefit, idx) => (
                                  <li key={idx} className="line-clamp-2">{benefit}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}

                      {/* ATS Analysis Details */}
                      {job.atsAnalysis && (
                        <div className="mt-2 overflow-hidden border border-gray-200 rounded-xl">
                          <div className="flex flex-col gap-4 p-4 md:flex-row">
                            {/* Left side - Skills and Recommendations */}
                            <div className="flex-1 space-y-3">
                              <h4 className="font-semibold text-gray-800">📊 ATS Analysis</h4>
                              
                              {job.atsAnalysis.matched_skills.length > 0 && (
                                <div>
                                  <p className="mb-2 text-sm font-medium text-green-700">✅ Matched Skills:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {job.atsAnalysis.matched_skills.slice(0, 5).map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                        {skill}
                                      </span>
                                    ))}
                                    {job.atsAnalysis.matched_skills.length > 5 && (
                                      <span className="px-2 py-1 text-xs font-medium text-gray-600">
                                        +{job.atsAnalysis.matched_skills.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {job.atsAnalysis.missing_skills.length > 0 && (
                                <div>
                                  <p className="mb-2 text-sm font-medium text-amber-700">⚠️ Missing Skills:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {job.atsAnalysis.missing_skills.slice(0, 5).map((skill, idx) => (
                                      <span key={idx} className="px-2 py-1 text-xs font-medium rounded-full text-amber-800 bg-amber-100">
                                        {skill}
                                      </span>
                                    ))}
                                    {job.atsAnalysis.missing_skills.length > 5 && (
                                      <span className="px-2 py-1 text-xs font-medium text-gray-600">
                                        +{job.atsAnalysis.missing_skills.length - 5} more
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {job.atsAnalysis.recommendations && job.atsAnalysis.recommendations.length > 0 && (
                                <div>
                                  <p className="mb-2 text-sm font-medium text-blue-700">💡 Recommendations:</p>
                                  <ul className="space-y-1 text-xs text-gray-700 list-disc list-inside">
                                    {job.atsAnalysis.recommendations.slice(0, 2).map((rec, idx) => (
                                      <li key={idx}>{rec}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>

                            {/* Right side - Overall Match Score */}
                            <div className="flex items-center justify-center md:w-48">
                              <div className={`flex flex-col items-center justify-center w-40 h-40 rounded-full ${
                                job.atsAnalysis.overall_match_percentage >= 75 ? 'bg-gradient-to-br from-green-100 to-green-200 border-4 border-green-400' :
                                job.atsAnalysis.overall_match_percentage >= 50 ? 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-4 border-yellow-400' :
                                job.atsAnalysis.overall_match_percentage >= 35 ? 'bg-gradient-to-br from-orange-100 to-orange-200 border-4 border-orange-400' :
                                'bg-gradient-to-br from-red-100 to-red-200 border-4 border-red-400'
                              }`}>
                                <div className="text-center">
                                  <div className={`text-5xl font-bold ${
                                    job.atsAnalysis.overall_match_percentage >= 75 ? 'text-green-700' :
                                    job.atsAnalysis.overall_match_percentage >= 50 ? 'text-yellow-700' :
                                    job.atsAnalysis.overall_match_percentage >= 35 ? 'text-orange-700' :
                                    'text-red-700'
                                  }`}>
                                    {Math.round(job.atsAnalysis.overall_match_percentage)}
                                  </div>
                                  <div className={`text-xl font-semibold ${
                                    job.atsAnalysis.overall_match_percentage >= 75 ? 'text-green-600' :
                                    job.atsAnalysis.overall_match_percentage >= 50 ? 'text-yellow-600' :
                                    job.atsAnalysis.overall_match_percentage >= 35 ? 'text-orange-600' :
                                    'text-red-600'
                                  }`}>
                                    %
                                  </div>
                                  <div className={`text-xs font-medium mt-1 ${
                                    job.atsAnalysis.overall_match_percentage >= 75 ? 'text-green-700' :
                                    job.atsAnalysis.overall_match_percentage >= 50 ? 'text-yellow-700' :
                                    job.atsAnalysis.overall_match_percentage >= 35 ? 'text-orange-700' :
                                    'text-red-700'
                                  }`}>
                                    {job.atsAnalysis.overall_match_percentage === 100 ? 'Perfect Match!' :
                                     job.atsAnalysis.overall_match_percentage >= 75 ? 'Excellent' :
                                     job.atsAnalysis.overall_match_percentage >= 50 ? 'Good Match' :
                                     job.atsAnalysis.overall_match_percentage >= 35 ? 'Fair Match' :
                                     'Low Match'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-2 text-sm">
                        {job.location && (
                          <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full">
                            {job.location}
                          </span>
                        )}
                        {job.type && (
                          <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full">
                            💼 {job.type}
                          </span>
                        )}
                        {job.experience && (
                          <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full">
                            📊 {job.experience}
                          </span>
                        )}
                        {job.salary && (
                          <span className="px-3 py-1 text-green-700 bg-green-100 rounded-full">
                            💰 {job.salary}
                          </span>
                        )}
                        {job.source && (
                          <span className="flex items-center gap-1 px-3 py-1 text-blue-700 bg-blue-100 rounded-full">
                            <img src="/job-search.png" alt="Source" className="w-4 h-4" />
                            {job.source}
                          </span>
                        )}
                        {job.postedDate && (
                          <span className="px-3 py-1 text-purple-700 bg-purple-100 rounded-full">
                            🕒 {job.postedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  {t('jobSearch.showingJobs')} {searchResults.length} {searchResults.length !== 1 ? t('jobSearch.jobs') : t('jobSearch.job')}
                </p>
              </div>
            </div>
          )}

          {searchResults.length === 0 && !isSearching && !noJobsMessage && (
            <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
              <div className="flex justify-center mb-4">
                <img src="/job-icon.png" alt="Job Search" className="w-24 h-24" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">{t('jobSearch.readyToFind')}</h3>
              <p className="text-gray-600">{t('jobSearch.fillFormPrompt')}</p>
            </div>
          )}

          {/* No Jobs Found Message */}
          {noJobsMessage && (
            <div className="p-8 bg-white shadow-xl rounded-2xl">
              <div className="flex flex-col items-center">
                <div className="flex justify-center mb-6">
                  <div className="flex items-center justify-center w-24 h-24 rounded-full bg-amber-100">
                    <span className="text-5xl">😔</span>
                  </div>
                </div>
                
                <h3 className="mb-3 text-2xl font-bold text-center text-gray-800">
                  {noJobsMessage.title}
                </h3>
                
                <p className="max-w-2xl mb-6 text-base text-center text-gray-700">
                  {noJobsMessage.message}
                </p>

                {/* Suggestions Box */}
                <div className="w-full max-w-3xl p-6 mb-6 border-2 border-blue-200 bg-blue-50 rounded-xl">
                  <h4 className="flex items-center gap-2 mb-4 text-lg font-semibold text-blue-900">
                    <span className="text-2xl">💡</span>
                    Suggestions to Improve Your Search:
                  </h4>
                  <ul className="space-y-3">
                    {noJobsMessage.suggestions?.map((suggestion: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="flex-shrink-0 text-blue-600">{suggestion.substring(0, 2)}</span>
                        <span>{suggestion.substring(2).trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quota Warning */}
                <div className="p-4 mb-6 border-2 rounded-lg border-amber-200 bg-amber-50">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">⚠️</span>
                    <div>
                      <p className="font-semibold text-amber-900">Search Limit Reduced</p>
                      <p className="text-sm text-amber-800">You have {searchLimit} out of 3 searches remaining. Avoid unnecessary searches!</p>
                    </div>
                  </div>
                </div>

                {/* Wish Message */}
                <div className="p-5 mb-6 text-center border-2 border-green-200 bg-green-50 rounded-xl">
                  <p className="text-lg font-medium text-green-800">
                    🌟 {noJobsMessage.wishMessage}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={() => {
                      setNoJobsMessage(null);
                      setSearchMode('general');
                      setFormData(prev => ({ ...prev, company: '' }));
                    }}
                    className="px-6 py-3 font-semibold text-white transition-all rounded-lg bg-primary-600 hover:bg-primary-700"
                  >
                    🔄 Try General Search
                  </button>
                  <button
                    onClick={() => {
                      setNoJobsMessage(null);
                      setFormData({
                        role: '',
                        experienceLevel: '',
                        location: '',
                        jobType: '',
                        resumeId: formData.resumeId,
                        company: '',
                        platform: 'all',
                      });
                    }}
                    className="px-6 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    🔍 New Search
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
          {/* End Main Content Area */}
        </div>
        {/* End flex-row container */}
      </main>
    </div>
  );
};

export default JobSearch;
