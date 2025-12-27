import React, { useState } from 'react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl flex">
        {/* Left Panel - Input Form */}
        <div className="w-1/3 p-6 border-r border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">AI Analysis</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="space-y-4 ai-analysis-form">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Job role and description
              </label>
              <textarea
                // type="text"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                placeholder="place job description here"
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isAnalyzing || !!analysisResult}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">
                Experience Level *
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-4 py-2 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                disabled={isAnalyzing || !!analysisResult}
              >
                <option value="">Select level</option>
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="junior">Junior (2-4 years)</option>
                <option value="mid">Mid Level (4-7 years)</option>
                <option value="senior">Senior (7-10 years)</option>
                <option value="lead">Lead/Principal (10+ years)</option>
              </select>
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
                className={`w-full px-4 py-3 text-white font-semibold rounded-lg transition-colors ${
                  isAnalyzing
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 hover:bg-primary-700'
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
                className="w-full px-4 py-3 font-semibold text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                New Analysis
              </button>
            )}
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 p-6 overflow-y-auto">
          {!analysisResult ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-lg">Enter job details to start analysis</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Card */}
              <div className="p-6 border-2 rounded-lg border-primary-200 bg-primary-50">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">Overall Score</h3>
                  <div className="text-4xl font-bold text-primary-600">
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
                <div className="p-5 border-2 border-red-300 rounded-lg bg-red-50">
                  <h3 className="flex items-center mb-3 text-lg font-semibold text-red-800">
                    <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {analysisResult.missingSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-2 text-sm font-semibold text-red-800 bg-red-200 border border-red-400 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Strengths */}
              <div>
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Strengths
                </h3>
                <ul className="space-y-2">
                  {analysisResult.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start p-3 rounded-lg bg-green-50">
                      <span className="flex-shrink-0 w-6 h-6 mr-2 font-bold text-green-600">•</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Areas for Improvement
                </h3>
                <ul className="space-y-2">
                  {analysisResult.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start p-3 rounded-lg bg-orange-50">
                      <span className="flex-shrink-0 w-6 h-6 mr-2 font-bold text-orange-600">•</span>
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Suggestions */}
              <div>
                <h3 className="flex items-center mb-3 text-lg font-semibold text-gray-800">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Suggestions
                </h3>
                <ul className="space-y-3">
                  {analysisResult.suggestions.map((suggestion, index) => (
                    <li key={index} className="p-3 rounded-lg bg-blue-50">
                      <div className="mb-1 font-semibold text-blue-800">{suggestion.category}</div>
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
