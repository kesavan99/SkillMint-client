import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import { getResumeById } from '../client-configuration/resume-API';
import { useTranslation } from '../locales';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  portfolio?: string;
}

interface Education {
  degree: string;
  institution: string;
  year: string;
  gpa?: string;
}

interface Experience {
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Project {
  name: string;
  description: string;
  technologies: string;
}

interface ResumeData {
  personalInfo: PersonalInfo;
  summary: string;
  education: Education[];
  experience: Experience[];
  skills: string[];
  projects: Project[];
  certifications: string[];
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

interface ResumeBuilderProps {
  isPreviewMode?: boolean;
}

const ResumeBuilder: React.FC<ResumeBuilderProps> = ({ isPreviewMode = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeIdFromUrl = searchParams.get('resumeId');
  const { t } = useTranslation();
  
  // Initialize resumeData from localStorage if available
  const getInitialResumeData = (): ResumeData => {
    const stored = localStorage.getItem('resumeData');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      personalInfo: {
        name: '',
        email: '',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: ''
      },
      summary: '',
      education: [{ degree: '', institution: '', year: '', gpa: '' }],
      experience: [{ title: '', company: '', duration: '', description: '' }],
      skills: [],
      projects: [{ name: '', description: '', technologies: '' }],
      certifications: []
    };
  };

  const getInitialTemplate = (): string => {
    return localStorage.getItem('selectedTemplate') || 'resume-template';
  };

  const [resumeData, setResumeData] = useState<ResumeData>(getInitialResumeData());
  const [editingResumeId, setEditingResumeId] = useState<string | null>(resumeIdFromUrl);
  const [editingResumeName, setEditingResumeName] = useState<string>('');
  const [isLoadingResume, setIsLoadingResume] = useState(false);
  const [skillInput, setSkillInput] = useState<string>('');
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [jobRole, setJobRole] = useState(() => localStorage.getItem('jobRole') || '');
  const [experienceLevel, setExperienceLevel] = useState(() => localStorage.getItem('experienceLevel') || '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(getInitialTemplate());

  const templates = [
    { id: 'resume-template', name: t('resumeBuilder.templateClassic'), description: t('resumeBuilder.templateClassicDesc'), recommended: true },
    { id: 'resume-template-minimalist', name: t('resumeBuilder.templateMinimalist'), description: t('resumeBuilder.templateMinimalistDesc') },
    { id: 'resume-template-two-column', name: t('resumeBuilder.templateTwoColumn'), description: t('resumeBuilder.templateTwoColumnDesc') },
    { id: 'resume-template-executive', name: t('resumeBuilder.templateExecutive'), description: t('resumeBuilder.templateExecutiveDesc') },
    { id: 'resume-template-skills-first', name: t('resumeBuilder.templateSkillsFirst'), description: t('resumeBuilder.templateSkillsFirstDesc') },
    { id: 'resume-template-creative', name: t('resumeBuilder.templateCreative'), description: t('resumeBuilder.templateCreativeDesc') },
  ];

  // Save to localStorage whenever resumeData or selectedTemplate changes
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
  }, [resumeData]);

  useEffect(() => {
    localStorage.setItem('selectedTemplate', selectedTemplate);
  }, [selectedTemplate]);

  // Save jobRole and experienceLevel to localStorage
  useEffect(() => {
    localStorage.setItem('jobRole', jobRole);
  }, [jobRole]);

  useEffect(() => {
    localStorage.setItem('experienceLevel', experienceLevel);
  }, [experienceLevel]);
  // Load existing resume if editing
  useEffect(() => {
    // Skip API calls in preview mode
    if (isPreviewMode) return;
    
    const loadExistingResume = async () => {
      if (editingResumeId) {
        setIsLoadingResume(true);
        try {
          const response = await getResumeById(editingResumeId);
          if (response.success && response.data) {
            setResumeData(response.data.resumeData);
            setEditingResumeName(response.data.resumeName);
            setSelectedTemplate(response.data.templateName || 'resume-template');
            
            // Update localStorage with loaded data
            localStorage.setItem('resumeData', JSON.stringify(response.data.resumeData));
            localStorage.setItem('selectedTemplate', response.data.templateName || 'resume-template');
          }
        } catch (error) {
          alert(t('resumeBuilder.failedToLoadResume'));
          setEditingResumeId(null);
        } finally {
          setIsLoadingResume(false);
        }
      }
    };

    loadExistingResume();
  }, [editingResumeId, isPreviewMode]);
  // Handle PDF upload
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isPreviewMode) return;
    
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: t('resumeBuilder.pdfUploadError') });
      return;
    }

    setUploadStatus({ type: 'loading', message: t('resumeBuilder.processingPDF') });
    
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post(`${API_URL}/api/resume/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      // Update form with parsed data
      setResumeData(response.data.data);
      setUploadStatus({ type: 'success', message: t('resumeBuilder.pdfProcessSuccess') });
      
      // Show review modal
      setShowReviewModal(true);
      
      // Clear success message after 5 seconds
      setTimeout(() => setUploadStatus(null), 5000);
    } catch (error) {
      setUploadStatus({ 
        type: 'error', 
        message: t('resumeBuilder.pdfProcessFailed') 
      });
    }
  };

  // Handle personal info changes
  const handlePersonalInfoChange = (field: keyof PersonalInfo, value: string) => {
    setResumeData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  // Handle array field changes
  const handleArrayFieldChange = <T extends keyof ResumeData>(
    section: T,
    index: number,
    field: string,
    value: string
  ) => {
    setResumeData(prev => {
      const updated = [...(prev[section] as any)] as any[];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [section]: updated };
    });
  };

  // Add new item to array sections
  const addArrayItem = (section: 'education' | 'experience' | 'projects') => {
    const newItems = {
      education: { degree: '', institution: '', year: '', gpa: '' },
      experience: { title: '', company: '', duration: '', description: '' },
      projects: { name: '', description: '', technologies: '' }
    };

    setResumeData(prev => ({
      ...prev,
      [section]: [...prev[section], newItems[section]]
    }));
  };

  // Remove item from array sections
  const removeArrayItem = (section: 'education' | 'experience' | 'projects', index: number) => {
    setResumeData(prev => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_: any, i: number) => i !== index)
    }));
  };

  // Handle skills
  const addSkill = () => {
    if (skillInput.trim()) {
      setResumeData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    }));
  };

  // Preview resume
  const handlePreview = () => {
    navigate('/preview', { 
      state: { 
        resumeData, 
        selectedTemplate,
        editingResumeId,
        editingResumeName
      } 
    });
  };

  // Preview template with blank data
  const handleTemplatePreview = async () => {
    const blankData = {
      personalInfo: {
        name: 'John Doe',
        email: 'johndoe@email.com',
        phone: '(123) 456-7890',
        location: 'City, State',
        linkedin: 'linkedin.com/in/johndoe',
        portfolio: 'johndoe.com'
      },
      summary: 'Experienced professional with expertise in various domains. Skilled in problem-solving, team collaboration, and delivering high-quality results.',
      education: [
        { degree: 'Bachelor of Science in Computer Science', institution: 'University Name', year: '2018-2022', gpa: '3.8' }
      ],
      experience: [
        { title: 'Software Engineer', company: 'Tech Company Inc.', duration: 'Jan 2022 - Present', description: 'Developed and maintained web applications using modern technologies.' }
      ],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
      projects: [
        { name: 'Project Name', description: 'Built a full-stack application with real-time features', technologies: 'React, Node.js, MongoDB' }
      ],
      certifications: ['AWS Certified Developer', 'Google Cloud Professional']
    };
    
    navigate('/preview', { state: { resumeData: blankData, selectedTemplate, isPreview: true } });
  };

  // Load demo data into form
  const handleLoadDemoData = () => {
    const demoData = {
      personalInfo: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1 (555) 123-4567',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/sarahjohnson',
        portfolio: 'sarahjohnson.dev'
      },
      summary: 'Results-driven Full Stack Developer with 5+ years of experience building scalable web applications. Passionate about clean code, user experience, and staying current with emerging technologies. Proven track record of delivering high-quality solutions in fast-paced environments.',
      education: [
        { 
          degree: 'Bachelor of Science in Computer Science', 
          institution: 'Stanford University', 
          year: '2016-2020', 
          gpa: '3.9' 
        },
        { 
          degree: 'Master of Science in Software Engineering', 
          institution: 'MIT', 
          year: '2020-2022', 
          gpa: '4.0' 
        }
      ],
      experience: [
        { 
          title: 'Senior Full Stack Developer', 
          company: 'TechCorp Solutions', 
          duration: 'Jan 2023 - Present', 
          description: 'Lead development of microservices architecture serving 1M+ users. Implemented CI/CD pipelines reducing deployment time by 60%. Mentored junior developers and conducted code reviews.' 
        },
        { 
          title: 'Full Stack Developer', 
          company: 'StartupXYZ', 
          duration: 'Jun 2020 - Dec 2022', 
          description: 'Developed RESTful APIs and responsive web interfaces using React and Node.js. Optimized database queries improving application performance by 40%. Collaborated with cross-functional teams in Agile environment.' 
        }
      ],
      skills: [
        'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 
        'Python', 'Django', 'PostgreSQL', 'MongoDB', 'AWS', 
        'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Agile/Scrum'
      ],
      projects: [
        { 
          name: 'E-Commerce Platform', 
          description: 'Built a full-featured e-commerce platform with payment integration, inventory management, and real-time analytics dashboard', 
          technologies: 'React, Node.js, PostgreSQL, Stripe API, Redis' 
        },
        { 
          name: 'Task Management App', 
          description: 'Developed a collaborative task management application with real-time updates and team collaboration features', 
          technologies: 'React, Firebase, Material-UI, WebSockets' 
        }
      ],
      certifications: ['AWS Certified Solutions Architect', 'Google Cloud Professional Developer', 'MongoDB Certified Developer']
    };
    
    setResumeData(demoData);
    setUploadStatus({ type: 'success', message: t('resumeBuilder.demoDataLoaded') });
    setTimeout(() => setUploadStatus(null), 3000);
  };

  // Handle AI Analysis
  const handleAnalyze = async () => {
    if (isPreviewMode) return;
    
    if (!jobRole.trim() || !experienceLevel) {
      setAnalysisError(t('resumeBuilder.fillAllFields'));
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
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
      setAnalysisError(err instanceof Error ? err.message : t('resumeBuilder.analysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetAnalysis = () => {
    setJobRole('');
    setExperienceLevel('');
    setAnalysisResult(null);
    setAnalysisError(null);
    localStorage.removeItem('jobRole');
    localStorage.removeItem('experienceLevel');
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      {/* Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white">
        <Navbar />
      </div>

      {/* Loading Indicator for Editing Mode */}
      {isLoadingResume && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-8 bg-white rounded-lg shadow-xl">
            <div className="w-16 h-16 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="text-lg font-medium text-gray-900">{t('resumeBuilder.loadingResumeData')}</p>
          </div>
        </div>
      )}

      {/* Main Content with top padding to account for fixed navbar */}
      <div className={`py-8 pt-24 transition-all duration-300 ${showAIAnalysis ? 'w-[70%]' : 'w-full'}`}>
        <div className={`px-4 mx-auto ${showAIAnalysis ? '' : 'container'}`}>
          <div className={showAIAnalysis ? '' : 'max-w-4xl mx-auto'}>
          {/* Header */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
            <h1 className="mb-2 text-3xl font-bold text-primary-600">
              {editingResumeId ? `${t('resumeBuilder.editResumeTitle')}${editingResumeName}` : t('resumeBuilder.title')}
            </h1>
            <p className="text-gray-600">
              {editingResumeId ? t('resumeBuilder.updateResumeSubtitle') : t('resumeBuilder.createResumeSubtitle')}
            </p>
          </div>

          {/* PDF Upload Section */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col gap-4 mb-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-800">{t('resumeBuilder.quickStart')}</h2>
                <p className="text-sm text-gray-600">{t('resumeBuilder.uploadPDFPrompt')}</p>
              </div>
              <label className="flex items-center justify-center w-full px-4 py-2 text-sm text-white transition-colors rounded-lg cursor-pointer md:w-auto md:px-6 md:py-3 md:text-base bg-primary-600 hover:bg-primary-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {t('resumeBuilder.uploadPDF')}
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>
            
            {/* Upload Status */}
            {uploadStatus && (
              <div className={`p-4 rounded-lg border-2 ${
                uploadStatus.type === 'success' ? 'bg-green-50 text-green-900 border-green-400' :
                uploadStatus.type === 'error' ? 'bg-red-50 text-red-900 border-red-400' :
                'bg-blue-50 text-blue-900 border-blue-400'
              }`}>
                <div className="flex items-start">
                  {uploadStatus.type === 'loading' && (
                    <svg className="flex-shrink-0 w-6 h-6 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  {uploadStatus.type === 'success' && (
                    <svg className="flex-shrink-0 w-6 h-6 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {uploadStatus.type === 'error' && (
                    <svg className="flex-shrink-0 w-6 h-6 mr-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  <div className="flex-1">
                    <span className="text-base font-semibold">{uploadStatus.message}</span>
                    {uploadStatus.type === 'success' && (
                      <p className="mt-1 text-sm text-green-700">{t('resumeBuilder.reviewExtracted')}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Template Selection Section */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
            <div className="mb-4">
              <h2 className="text-xl font-bold text-gray-800">{t('resumeBuilder.chooseTemplate')}</h2>
              <p className="text-sm text-gray-600">{t('resumeBuilder.chooseTemplateSubtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 gap-3 md:gap-4 md:grid-cols-2">
              {templates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
                    selectedTemplate === template.id
                      ? 'border-primary-600 bg-primary-50 shadow-lg'
                      : 'border-gray-200 hover:border-primary-300 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="mb-1 text-base font-bold text-gray-900 md:text-lg">{template.name}</h3>
                      {template.recommended && (
                        <span className="inline-block px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">{t('resumeBuilder.recommended')}</span>
                      )}
                    </div>
                    {selectedTemplate === template.id && (
                      <svg className="flex-shrink-0 w-6 h-6 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-gray-600">{template.description}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 mt-4 md:flex-row md:justify-end">
              <button
                onClick={handleLoadDemoData}
                className="w-full px-4 py-2 text-sm font-semibold text-white transition-colors bg-green-600 rounded-lg md:w-auto hover:bg-green-700"
              >
                {t('resumeBuilder.loadDemoData')}
              </button>
              <button
                onClick={handleTemplatePreview}
                className="w-full px-4 py-2 text-sm font-semibold transition-colors border-2 rounded-lg md:w-auto text-primary-600 border-primary-600 hover:bg-primary-50"
              >
                {t('resumeBuilder.previewTemplate')}
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
            {/* Personal Information */}
            <section className="mb-8">
              <h2 className="pb-2 mb-4 text-2xl font-bold text-gray-800 border-b-2 border-primary-600">
                {t('resumeBuilder.personalInfo')}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <input
                  type="text"
                  placeholder={t('resumeBuilder.fullNameRequired')}
                  value={resumeData.personalInfo.name}
                  onChange={(e) => handlePersonalInfoChange('name', e.target.value)}
                  className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <input
                  type="email"
                  placeholder={t('resumeBuilder.emailRequired')}
                  value={resumeData.personalInfo.email}
                  onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                  className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <input
                  type="tel"
                  placeholder={t('resumeBuilder.phoneRequired')}
                  value={resumeData.personalInfo.phone}
                  onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                  className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <input
                  type="text"
                  placeholder={t('resumeBuilder.locationRequired')}
                  value={resumeData.personalInfo.location}
                  onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
                  className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
                <input
                  type="url"
                  placeholder={t('resumeBuilder.linkedinUrl')}
                  value={resumeData.personalInfo.linkedin}
                  onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
                  className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="url"
                  placeholder={t('resumeBuilder.portfolioUrl')}
                  value={resumeData.personalInfo.portfolio}
                  onChange={(e) => handlePersonalInfoChange('portfolio', e.target.value)}
                  className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </section>

            {/* Summary */}
            <section className="mb-8">
              <h2 className="pb-2 mb-4 text-2xl font-bold text-gray-800 border-b-2 border-primary-600">
                {t('resumeBuilder.professionalSummary')}
              </h2>
              <textarea
                placeholder={t('resumeBuilder.summaryPlaceholder')}
                value={resumeData.summary}
                onChange={(e) => setResumeData(prev => ({ ...prev, summary: e.target.value }))}
                className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows={4}
              />
            </section>

            {/* Education */}
            <section className="mb-8">
              <h2 className="pb-2 mb-4 text-2xl font-bold text-gray-800 border-b-2 border-primary-600">
                {t('resumeBuilder.education')}
              </h2>
              {resumeData.education.map((edu, index) => (
                <div key={index} className="p-4 mb-4 border border-gray-200 rounded-lg">
                  <div className="grid gap-4 mb-2 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder={t('resumeBuilder.degree')}
                      value={edu.degree}
                      onChange={(e) => handleArrayFieldChange('education', index, 'degree', e.target.value)}
                      className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder={t('resumeBuilder.institution')}
                      value={edu.institution}
                      onChange={(e) => handleArrayFieldChange('education', index, 'institution', e.target.value)}
                      className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder={t('resumeBuilder.yearPlaceholder')}
                      value={edu.year}
                      onChange={(e) => handleArrayFieldChange('education', index, 'year', e.target.value)}
                      className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder={t('resumeBuilder.gpaOptional')}
                      value={edu.gpa}
                      onChange={(e) => handleArrayFieldChange('education', index, 'gpa', e.target.value)}
                      className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  {resumeData.education.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('education', index)}
                      className="text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      {t('resumeBuilder.remove')}
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem('education')}
                className="px-4 py-2 font-semibold text-white rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                {t('resumeBuilder.addEducation')}
              </button>
            </section>

            {/* Experience */}
            <section className="mb-8">
              <h2 className="pb-2 mb-4 text-2xl font-bold text-gray-800 border-b-2 border-primary-600">
                {t('resumeBuilder.professionalExperience')}
              </h2>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className="p-4 mb-4 border border-gray-200 rounded-lg">
                  <div className="grid gap-4 mb-2 md:grid-cols-2">
                    <input
                      type="text"
                      placeholder={t('resumeBuilder.jobTitle')}
                      value={exp.title}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'title', e.target.value)}
                      className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder={t('resumeBuilder.company')}
                      value={exp.company}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'company', e.target.value)}
                      className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder={t('resumeBuilder.durationPlaceholder')}
                      value={exp.duration}
                      onChange={(e) => handleArrayFieldChange('experience', index, 'duration', e.target.value)}
                      className="px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 md:col-span-2"
                    />
                  </div>
                  <textarea
                    placeholder={t('resumeBuilder.jobDescription')}
                    value={exp.description}
                    onChange={(e) => handleArrayFieldChange('experience', index, 'description', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={3}
                  />
                  {resumeData.experience.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('experience', index)}
                      className="text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      {t('resumeBuilder.remove')}
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem('experience')}
                className="px-4 py-2 font-semibold text-white rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                {t('resumeBuilder.addExperience')}
              </button>
            </section>

            {/* Skills */}
            <section className="mb-8">
              <h2 className="pb-2 mb-4 text-2xl font-bold text-gray-800 border-b-2 border-primary-600">
                {t('resumeBuilder.skills')}
              </h2>
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  placeholder={t('resumeBuilder.addSkillPlaceholder')}
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
                <button
                  onClick={addSkill}
                  className="px-6 py-2 font-semibold text-white rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  {t('resumeBuilder.add')}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(index)}
                      className="font-bold text-primary-800 hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </section>

            {/* Projects */}
            <section className="mb-8">
              <h2 className="pb-2 mb-4 text-2xl font-bold text-gray-800 border-b-2 border-primary-600">
                {t('resumeBuilder.projects')}
              </h2>
              {resumeData.projects.map((proj, index) => (
                <div key={index} className="p-4 mb-4 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    placeholder={t('resumeBuilder.projectName')}
                    value={proj.name}
                    onChange={(e) => handleArrayFieldChange('projects', index, 'name', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <textarea
                    placeholder={t('resumeBuilder.projectDescription')}
                    value={proj.description}
                    onChange={(e) => handleArrayFieldChange('projects', index, 'description', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    rows={2}
                  />
                  <input
                    type="text"
                    placeholder={t('resumeBuilder.technologiesUsed')}
                    value={proj.technologies}
                    onChange={(e) => handleArrayFieldChange('projects', index, 'technologies', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  {resumeData.projects.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('projects', index)}
                      className="text-sm font-semibold text-red-600 hover:text-red-800"
                    >
                      {t('resumeBuilder.remove')}
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem('projects')}
                className="px-4 py-2 font-semibold text-white rounded-lg bg-primary-600 hover:bg-primary-700"
              >
                {t('resumeBuilder.addProject')}
              </button>
            </section>
          </div>

          {/* Action Buttons */}
          <div className="p-6 mb-6 bg-white rounded-lg shadow-md">
            <div className="flex flex-col gap-3 md:flex-row md:justify-center md:gap-4">
              <button
                onClick={() => setShowAIAnalysis(!showAIAnalysis)}
                disabled={!resumeData.personalInfo.name}
                className="w-full px-4 py-2 text-base font-semibold transition-colors transform border-2 rounded-lg shadow-lg md:w-auto md:px-8 md:py-3 md:text-lg text-primary-600 border-primary-600 hover:bg-primary-50 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <img src="/statistcs.png" alt="AI Analysis" className="w-8 h-8" />
                {showAIAnalysis ? t('resumeBuilder.hideAIAnalysis') : t('resumeBuilder.showAIAnalysis')}
              </button>
              <button
                onClick={handlePreview}
                disabled={!resumeData.personalInfo.name}
                className="flex items-center justify-center w-full gap-2 px-4 py-2 text-base font-semibold text-white transition-colors rounded-lg md:w-auto md:px-8 md:py-3 md:text-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400"
              >
                <img src="/preview.png" alt="Preview" className="w-8 h-8" />
                {t('resumeBuilder.previewResume')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

      {/* Right Sidebar - AI Analysis */}
      {showAIAnalysis && (
        <div className="fixed top-0 right-0 z-40 w-[30%] h-screen overflow-y-auto bg-white border-l border-gray-200 shadow-2xl">
          {/* Sidebar Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">{t('resumeBuilder.aiAnalysisTitle')}</h2>
            <button
              onClick={() => setShowAIAnalysis(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Input Form */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="space-y-3 ai-analysis-form">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('resumeBuilder.jobRoleLabel')}
                </label>
                <textarea
                  // type="text"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  placeholder={t('resumeBuilder.jobRolePlaceholder')}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isAnalyzing}
                />
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  {t('resumeBuilder.experienceLevelLabel')}
                </label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={isAnalyzing}
                >
                  <option value="">{t('resumeBuilder.selectLevel')}</option>
                  <option value="entry">{t('resumeBuilder.entryLevel')}</option>
                  <option value="junior">{t('resumeBuilder.juniorLevel')}</option>
                  <option value="mid">{t('resumeBuilder.midLevel')}</option>
                  <option value="senior">{t('resumeBuilder.seniorLevel')}</option>
                  <option value="lead">{t('resumeBuilder.leadLevel')}</option>
                </select>
              </div>

              {analysisError && (
                <div className="p-2 text-xs text-red-800 bg-red-100 border border-red-300 rounded-lg">
                  {analysisError}
                </div>
              )}

              {!analysisResult ? (
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className={`w-full px-4 py-2 text-sm text-white font-semibold rounded-lg transition-colors ${
                    isAnalyzing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {isAnalyzing ? (
                    <span className="flex items-center justify-center">
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {t('resumeBuilder.analyzing')}
                    </span>
                  ) : (
                    t('resumeBuilder.analyzeResume')
                  )}
                </button>
              ) : (
                <button
                  onClick={handleResetAnalysis}
                  className="w-full px-4 py-2 text-sm font-semibold text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  {t('resumeBuilder.newAnalysis')}
                </button>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="p-4">
            {!analysisResult ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm text-center">{t('resumeBuilder.enterJobDetails')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score Card */}
                <div className="p-4 border-2 rounded-lg border-primary-200 bg-primary-50">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">{t('resumeBuilder.overallScore')}</h3>
                    <div className="text-2xl font-bold text-primary-600">
                      {analysisResult.score}/100
                    </div>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 transition-all duration-500 rounded-full bg-primary-600"
                      style={{ width: `${analysisResult.score}%` }}
                    ></div>
                  </div>
                  <p className="mt-2 text-xs text-gray-600">
                    {t('resumeBuilder.match')} <span className="font-semibold">{analysisResult.matchPercentage}%</span>
                  </p>
                </div>

                {/* Missing Skills - Top Priority */}
                {analysisResult.missingSkills && analysisResult.missingSkills.length > 0 && (
                  <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
                    <h3 className="flex items-center mb-3 text-sm font-semibold text-red-800">
                      <svg className="w-4 h-4 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {t('resumeBuilder.missingSkills')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analysisResult.missingSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 text-xs font-semibold text-red-800 bg-red-200 border border-red-400 rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Strengths */}
                <div>
                  <h3 className="flex items-center mb-2 text-sm font-semibold text-gray-800">
                    <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t('resumeBuilder.strengths')}
                  </h3>
                  <ul className="space-y-1">
                    {analysisResult.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start p-2 text-xs rounded-lg bg-green-50">
                        <span className="flex-shrink-0 mr-2 font-bold text-green-600">•</span>
                        <span className="text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <h3 className="flex items-center mb-2 text-sm font-semibold text-gray-800">
                    <svg className="w-4 h-4 mr-1 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    {t('resumeBuilder.areasForImprovement')}
                  </h3>
                  <ul className="space-y-1">
                    {analysisResult.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start p-2 text-xs rounded-lg bg-orange-50">
                        <span className="flex-shrink-0 mr-2 font-bold text-orange-600">•</span>
                        <span className="text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div>
                  <h3 className="flex items-center mb-2 text-sm font-semibold text-gray-800">
                    <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {t('resumeBuilder.suggestions')}
                  </h3>
                  <ul className="space-y-2">
                    {analysisResult.suggestions.map((suggestion, index) => (
                      <li key={index} className="p-3 text-xs rounded-lg bg-blue-50">
                        <div className="mb-1 font-semibold text-blue-800">{suggestion.category}</div>
                        <div className="text-gray-700">{suggestion.recommendation}</div>
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
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-xl">
            <div className="sticky top-0 z-10 p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <svg className="w-8 h-8 mr-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{t('resumeBuilder.resumeDataExtracted')}</h2>
                    <p className="mt-1 text-sm text-gray-600">{t('resumeBuilder.reviewModalSubtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-400 transition-colors hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="p-4 mb-6 border-l-4 border-yellow-500 rounded bg-yellow-50">
                <div className="flex items-start">
                  <svg className="w-5 h-5 mt-0.5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="mb-1 font-semibold text-yellow-900">{t('resumeBuilder.importantReviewRequired')}</h3>
                    <p className="text-sm text-yellow-800">
                      {t('resumeBuilder.reviewWarningText')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-gray-50">
                  <h3 className="mb-3 text-lg font-semibold text-gray-900">{t('resumeBuilder.extractedInformation')}</h3>
                  
                  <div className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium text-gray-700">{t('resumeBuilder.nameLabel')}</span>
                        <p className="text-gray-900">{resumeData.personalInfo.name || t('resumeBuilder.notFound')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{t('resumeBuilder.emailLabel')}</span>
                        <p className="text-gray-900">{resumeData.personalInfo.email || t('resumeBuilder.notFound')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{t('resumeBuilder.phoneLabel')}</span>
                        <p className="text-gray-900">{resumeData.personalInfo.phone || t('resumeBuilder.notFound')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">{t('resumeBuilder.locationLabel')}</span>
                        <p className="text-gray-900">{resumeData.personalInfo.location || t('resumeBuilder.notFound')}</p>
                      </div>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">{t('resumeBuilder.educationEntries')}</span>
                      <p className="text-gray-900">{resumeData.education.length}{t('resumeBuilder.foundCount')}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">{t('resumeBuilder.experienceEntries')}</span>
                      <p className="text-gray-900">{resumeData.experience.length}{t('resumeBuilder.foundCount')}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">{t('resumeBuilder.skillsFound')}</span>
                      <p className="text-gray-900">{resumeData.skills.length}{t('resumeBuilder.foundCount')}</p>
                    </div>

                    <div>
                      <span className="font-medium text-gray-700">{t('resumeBuilder.projectsFound')}</span>
                      <p className="text-gray-900">{resumeData.projects.length}{t('resumeBuilder.foundCount')}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-4 rounded-lg bg-blue-50">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-900">
                    {t('resumeBuilder.reviewNote')}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    // Scroll to top of form
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 px-6 py-3 font-semibold text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
                >
                  {t('resumeBuilder.reviewEditForm')}
                </button>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 px-6 py-3 font-semibold text-gray-700 transition-colors bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  {t('resumeBuilder.continue')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeBuilder;
