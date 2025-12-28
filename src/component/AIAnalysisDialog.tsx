import React, { useState } from 'react';
import Select from 'react-select';

interface ResumeData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary: string;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
    gpa?: string;
  }>;
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string;
  }>;
  certifications: string[];
}

interface AIAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

interface AnalysisResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  missingSkills: string[];
  suggestions: Array<{
    category: string;
    recommendation: string;
    learningPath?: string;
  }>;
  advice: string;
  matchPercentage: number;
}

const AIAnalysisDialog: React.FC<AIAnalysisDialogProps> = ({ isOpen, onClose, resumeData }) => {
  const [jobRole, setJobRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const experienceLevelOptions = [
    { value: 'entry', label: 'Entry Level (0-2 years)' },
    { value: 'junior', label: 'Junior (2-4 years)' },
    { value: 'mid', label: 'Mid Level (4-7 years)' },
    { value: 'senior', label: 'Senior (7-10 years)' },
    { value: 'lead', label: 'Lead/Principal (10+ years)' },
  ];

  const handleAnalyze = async () => {
    if (!jobRole.trim() || !experienceLevel) {
      setError('Please fill in all fields');
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      const API_URL = import.meta.env.VITE_API_BASE_URL;
      
      const response = await fetch(`${API_URL}/api/resume/analyze`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeData,
          jobRole,
          experienceLevel,
        }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`);
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setJobRole('');
    setExperienceLevel('');
    setAnalysisResult(null);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-black bg-opacity-50 sm:items-center sm:p-4">
      <div className="relative w-full max-w-4xl max-h-[92vh] sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-xl shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Panel - Input Form */}
        <div className={`flex-shrink-0 w-full p-4 overflow-y-auto border-b border-gray-200 md:w-1/3 sm:p-6 md:border-b-0 md:border-r ${analysisResult ? 'hidden md:flex md:flex-col' : 'flex flex-col'}`}>
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg font-bold text-gray-800 sm:text-xl md:text-2xl">AI Analysis</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-3 sm:space-y-4 ai-analysis-form">
            <div>
              <label className="block mb-1.5 sm:mb-2 text-sm font-medium text-gray-700">
                Job role and description
              </label>
              <textarea
                rows={4}
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full px-3 py-2.5 sm:py-2 text-base sm:text-sm text-gray-900 border border-gray-300 rounded-lg sm:px-4 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                disabled={isAnalyzing || !!analysisResult}
              />
            </div>

            <div>
              <label className="block mb-1.5 sm:mb-2 text-sm font-medium text-gray-700">
                Experience Level *
              </label>
              <Select
                value={experienceLevelOptions.find(opt => opt.value === experienceLevel) || null}
                onChange={(option) => setExperienceLevel(option?.value || '')}
                options={experienceLevelOptions}
                isDisabled={isAnalyzing || !!analysisResult}
                placeholder="Select level"
                className="react-select-container"
                classNamePrefix="react-select"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: '48px',
                    fontSize: '15px',
                    borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                    borderRadius: '0.5rem',
                    boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
                    '&:hover': {
                      borderColor: state.isFocused ? '#3b82f6' : '#d1d5db',
                    },
                    '@media (min-width: 640px)': {
                      minHeight: '42px',
                      fontSize: '14px',
                    },
                  }),
                  option: (base, state) => ({
                    ...base,
                    fontSize: '15px',
                    padding: '10px 12px',
                    backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
                    color: state.isSelected ? 'white' : '#111827',
                    cursor: 'pointer',
                    '@media (min-width: 640px)': {
                      fontSize: '14px',
                      padding: '8px 12px',
                    },
                  }),
                  placeholder: (base) => ({
                    ...base,
                    fontSize: '15px',
                    color: '#9ca3af',
                    '@media (min-width: 640px)': {
                      fontSize: '14px',
                    },
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontSize: '15px',
                    color: '#111827',
                    '@media (min-width: 640px)': {
                      fontSize: '14px',
                    },
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            </div>

            {error && (
              <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-300 rounded-lg">
                {error}
              </div>
            )}

            {!analysisResult ? (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className={`w-full px-4 py-3 text-sm font-semibold text-white rounded-lg transition-colors ${
                  isAnalyzing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800'
                }`}
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            ) : (
              <button
                onClick={handleReset}
                className="w-full px-4 py-3 text-sm font-semibold text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 active:bg-primary-800"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 p-4 overflow-y-auto sm:p-6 bg-gray-50">
          {!analysisResult ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[250px] text-gray-400">
              <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="px-4 text-sm text-center sm:text-base">Enter job details to start analysis</p>
            </div>
          ) : (
            <div className="pb-4 space-y-4 sm:space-y-6">
              {/* Mobile Close Button - Only visible on mobile when results are shown */}
              <div className="flex items-center justify-between mb-2 md:hidden">
                <h2 className="text-lg font-bold text-gray-800">Analysis Results</h2>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-400 transition-colors rounded-lg hover:text-gray-600 hover:bg-gray-100"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Score Card */}
              <div className="p-4 border-2 rounded-lg sm:p-5 border-primary-200 bg-primary-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Overall Score</h3>
                  <div className="text-3xl font-bold sm:text-4xl text-primary-600">
                    {analysisResult.score}/100
                  </div>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full">
                  <div
                    className="h-3 transition-all duration-500 rounded-full bg-primary-600"
                    style={{ width: `${analysisResult.score}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Match Percentage: <span className="font-semibold">{analysisResult.matchPercentage}%</span>
                </p>
              </div>

              {/* Missing Skills - Top Priority */}
              {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 && (
                <div className="p-4 border-2 border-red-300 rounded-lg sm:p-5 bg-red-50">
                  <h3 className="flex items-center mb-3 text-base font-semibold text-red-800 sm:text-lg">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1.5 text-sm font-semibold text-red-800 bg-red-200 border border-red-400 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              <div>
                <h3 className="flex items-center mb-3 text-base font-semibold text-gray-800 sm:text-lg">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                      <span className="flex-shrink-0 w-6 h-6 mr-2 font-bold text-green-600">•</span>
                      <span className="text-sm text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="flex items-center mb-3 text-base font-semibold text-gray-800 sm:text-lg">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {analysisResult.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start p-3 bg-white rounded-lg shadow-sm">
                      <span className="flex-shrink-0 w-6 h-6 mr-2 font-bold text-orange-600">•</span>
                      <span className="text-sm text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="flex items-center mb-3 text-base font-semibold text-gray-800 sm:text-lg">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Suggestions
                </h3>
                <ul className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="p-3 bg-white rounded-lg shadow-sm">
                      <div className="mb-1 text-sm font-semibold text-blue-800">{suggestion.category}</div>
                      <div className="text-sm text-gray-700">{suggestion.recommendation}</div>
                      {suggestion.learningPath && (
                        <div className="mt-2 text-xs italic text-gray-600">{suggestion.learningPath}</div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAnalysisDialog;
