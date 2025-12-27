import React, { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import { jobSearchAPI } from '../client-configuration/job-API';

interface JobSearchForm {
  role: string;
  experienceLevel: string;
  location: string;
  jobType: string;
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
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
}

const JobSearch: React.FC = () => {
  const [formData, setFormData] = useState<JobSearchForm>({
    role: '',
    experienceLevel: '',
    location: '',
    jobType: '',
  });

  const [searchResults, setSearchResults] = useState<Job[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationSuggestions, setLocationSuggestions] = useState<LocationSuggestion[]>([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isRemoteSelected, setIsRemoteSelected] = useState(false);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const experienceLevels = Array.from({ length: 31 }, (_, i) => i);

  const jobTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Internship',
    'Freelance',
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Fetch location suggestions from OpenStreetMap
    if (name === 'location' && value.trim().length > 2) {
      setIsRemoteSelected(false);
      fetchLocationSuggestions(value);
    } else if (name === 'location') {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }
  };

  const fetchLocationSuggestions = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`,
        {
          headers: {
            'User-Agent': 'SkillMint Job Search App'
          }
        }
      );
      const data = await response.json();
      setLocationSuggestions(data);
      setShowLocationDropdown(data.length > 0);
    } catch (error) {
      console.error('Error fetching location suggestions:', error);
    }
  };

  const handleLocationSelect = (location: LocationSuggestion) => {
    // Extract city name (first part before comma)
    const cityName = location.display_name.split(',')[0].trim();
    setFormData(prev => ({
      ...prev,
      location: cityName,
    }));
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
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
    setIsSearching(true);
    setError(null);
    setSearchResults([]); // Clear previous results
    
    try {
      const response = await jobSearchAPI.searchJobs({
        role: formData.role,
        designation: formData.role,
        experienceLevel: formData.experienceLevel,
        location: formData.location,
        jobType: formData.jobType,
      });

      if (response.success) {
        setSearchResults(response.data || []);
      } else {
        setError('No jobs found. Please try different search criteria.');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Error during job search:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setFormData({
      role: '',
      experienceLevel: '',
      location: '',
      jobType: '',
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
          <h1 className="mb-3 text-3xl font-bold text-white md:text-4xl">🔍 Job Search</h1>
          <p className="text-lg text-white/90">Find your dream job by entering your preferences</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="w-full">
            {/* Search Form */}
            <div className="p-6 mb-8 bg-white shadow-xl md:p-8 rounded-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="role" className="block mb-2 text-sm font-semibold text-gray-700">
                    Role / Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="e.g., Software Engineer, Java Developer"
                    className="w-full px-4 py-3 text-black transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="experienceLevel" className="block mb-2 text-sm font-semibold text-gray-700">
                    Experience Level (Years) <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="experienceLevel"
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select years of experience</option>
                    {experienceLevels.map((years) => (
                      <option key={years} value={years}>
                        {years} {years === 1 ? 'year' : 'years'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="jobType" className="block mb-2 text-sm font-semibold text-gray-700">
                    Job Type
                  </label>
                  <select
                    id="jobType"
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select job type</option>
                    {jobTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="relative md:col-span-2">
                  <label htmlFor="location" className="block mb-2 text-sm font-semibold text-gray-700">
                    Location
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
                          setLocationSuggestions([]);
                          setIsRemoteSelected(true);
                        }
                      }}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                        isRemoteSelected
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      🏠 Remote
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
                      if (locationSuggestions.length > 0) {
                        setShowLocationDropdown(true);
                      }
                    }}
                    placeholder={isRemoteSelected ? 'Remote selected' : 'Or type a city name...'}
                    className="w-full px-4 py-3 text-gray-900 transition-all bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    autoComplete="off"
                    disabled={isRemoteSelected}
                  />
                  {showLocationDropdown && locationSuggestions.length > 0 && (
                    <div
                      ref={dropdownRef}
                      className="absolute z-10 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-lg shadow-lg max-h-60"
                    >
                      {(() => {
                        const uniqueCities = new Map<string, LocationSuggestion>();
                        locationSuggestions.forEach((suggestion) => {
                          const cityName = suggestion.display_name.split(',')[0].trim();
                          if (!uniqueCities.has(cityName)) {
                            uniqueCities.set(cityName, suggestion);
                          }
                        });
                        return Array.from(uniqueCities.entries()).map(([cityName, suggestion], index) => (
                          <div
                            key={index}
                            onClick={() => handleLocationSelect(suggestion)}
                            className="px-4 py-2 text-sm text-gray-900 cursor-pointer hover:bg-primary-50 hover:text-primary-700"
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 mt-0.5">📍</span>
                              <span>{cityName}</span>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  )}
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
                      Searching...
                    </span>
                  ) : (
                    'Search Jobs'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-6 py-3 font-semibold text-gray-700 transition-all bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Reset
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
                  <h3 className="text-xl font-semibold text-gray-800">Retrieving the top 40+ jobs...</h3>
                  <p className="text-sm text-gray-600">Please wait while we search across multiple pages</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-primary-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm font-medium text-primary-700">Searching...</span>
                </div>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="p-6 bg-white shadow-xl md:p-8 rounded-2xl">
              <h2 className="mb-6 text-2xl font-bold text-gray-800">Search Results</h2>
              <div className="space-y-4">
                {searchResults.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 transition-all border border-gray-200 rounded-lg hover:shadow-lg hover:border-primary-200"
                  >
                    <div className="flex flex-col gap-4">
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
                            Apply Now
                          </a>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm">
                        {job.location && (
                          <span className="px-3 py-1 text-gray-700 bg-gray-100 rounded-full">
                            📍 {job.location}
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
                  Showing {searchResults.length} job{searchResults.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          {searchResults.length === 0 && !isSearching && (
            <div className="p-8 text-center bg-white shadow-xl rounded-2xl">
              <div className="mb-4 text-6xl">💼</div>
              <h3 className="mb-2 text-xl font-semibold text-gray-800">Ready to find your next opportunity?</h3>
              <p className="text-gray-600">Fill in the form above and click "Search Jobs" to get started</p>
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
