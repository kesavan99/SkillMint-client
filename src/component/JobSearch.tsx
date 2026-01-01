import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { jobSearchAPI } from '../client-configuration/job-API';
import { getSavedResumes } from '../client-configuration/resume-API';
import { useTranslation } from '../locales';

interface JobSearchForm {
  role: string;
  experienceLevel: string;
  location: string;
  jobType: string;
  resumeId: string;
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
  location: string;
  type?: string;
  experience?: string;
  salary?: string;
  description: string;
  source?: string;
  postedDate?: string;
  url?: string;
  atsScore?: number;
  atsAnalysis?: {
    overall_match_percentage: number;
    matched_skills: string[];
    missing_skills: string[];
    feedback: string[];
    recommendations: string[];
  };
}

const JobSearch: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<JobSearchForm>({
    role: '',
    experienceLevel: '',
    location: '',
    jobType: '',
    resumeId: '',
  });

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isRemoteSelected, setIsRemoteSelected] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
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
    
    setIsSearching(true);
    setError(null);
    setSearchResults([]); // Clear previous results
    
    try {
      // Step 1: Start job search and get task ID
      const response = await jobSearchAPI.searchJobs({
        role: formData.role,
        designation: formData.role,
        experienceLevel: formData.experienceLevel,
        location: formData.location,
        jobType: formData.jobType,
        resumeId: formData.resumeId,
      });

      if (response.success && response.taskId) {
        // Step 2: Start polling for results
        pollJobSearchResults(response.taskId);
      } else {
        setError(t('jobSearch.noJobsFound'));
        setSearchResults([]);
        setIsSearching(false);
      }
    } catch (err) {
      console.error('Error during job search:', err);
      setError('Failed to start job search');
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
    }, 2000); // Poll every 2 seconds

    // Timeout after 2 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsSearching(false);
    }, 120000);
  };

  const handleReset = () => {
    setFormData({
      role: '',
      experienceLevel: '',
      location: '',
      jobType: '',
      resumeId: '',
    });
    setSearchResults([]);
    setError(null);
    setIsRemoteSelected(false);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />

      <main className="px-5 py-16 mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">{t('jobSearch.title')}</h1>
          <p className="text-lg text-white/90">{t('jobSearch.subtitle')}</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full">
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
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        isRemoteSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
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
                  disabled={isSearching}
                  className="flex-1 px-6 py-3 font-semibold text-white transition-all rounded-lg bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('jobSearch.searching')}
                    </span>
                  ) : (
                    t('jobSearch.searchJobs')
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
                      {/* ATS Score Badge */}
                      {job.atsScore !== undefined && job.atsScore !== null && (
                        <div className="flex items-center gap-2">
                          <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                            job.atsScore >= 80 ? 'bg-green-100 text-green-800' :
                            job.atsScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            🎯 ATS Match: {job.atsScore.toFixed(1)}%
                          </div>
                          {job.atsScore >= 75 && (
                            <span className="text-xs font-semibold text-green-600">⭐ Strong Match</span>
                          )}
                        </div>
                      )}

                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="mb-2 text-xl font-semibold text-gray-800">{job.title}</h3>
                          <p className="mb-1 text-lg font-medium text-gray-700">{job.company}</p>
                          {job.description && (
                            <p className="mt-2 text-sm text-gray-600 line-clamp-2">{job.description}</p>
                          )}
                        </div>
                        {job.url && (
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-primary-600 hover:bg-primary-700 whitespace-nowrap"
                          >
                            {t('jobSearch.applyNow')}
                          </a>
                        )}
                      </div>

                      {/* ATS Analysis Details */}
                      {job.atsAnalysis && (
                        <div className="p-4 mt-2 space-y-3 border-t border-gray-200 bg-gray-50 rounded-xl">
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
                          <span className="px-3 py-1 text-blue-700 bg-blue-100 rounded-full">
                            🔍 {job.source}
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

          {searchResults.length === 0 && !isSearching && (
            <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
              <div className="mb-4 text-6xl">💼</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">{t('jobSearch.readyToFind')}</h3>
              <p className="text-gray-600">{t('jobSearch.fillFormPrompt')}</p>
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
