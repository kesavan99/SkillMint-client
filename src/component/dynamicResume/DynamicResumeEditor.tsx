import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../Navbar';
import AIAnalysisDialog from '../AIAnalysisDialog';
import { saveResume, getResumeById } from '../../client-configuration/resume-API';
import html2pdf from 'html2pdf.js';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  year: string;
}

interface Experience {
  id: string;
  title: string;
  company: string;
  duration: string;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string;
}

interface Section {
  id: string;
  name: string;
  type: 'profile' | 'skills' | 'education' | 'experience' | 'projects' | 'certifications' | 'custom';
  enabled: boolean;
  customType?: 'paragraph' | 'tags' | 'list';
}

interface CustomSection {
  id: string;
  heading: string;
  type: 'paragraph' | 'tags' | 'list';
  content: string | string[] | Array<{ id: string; text: string }>;
}

const DynamicResumeEditor: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState('content');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);

  // Resume Data
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    linkedin: ''
  });

  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);

  // UI States
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [resumeName, setResumeName] = useState('');
  const [saving, setSaving] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showCustomSectionDialog, setShowCustomSectionDialog] = useState(false);
  const [newCustomSection, setNewCustomSection] = useState({ heading: '', type: 'paragraph' as 'paragraph' | 'tags' | 'list' });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Section ordering
  const [sections, setSections] = useState<Section[]>([
    { id: '1', name: 'Profile', type: 'profile', enabled: true },
    { id: '2', name: 'Skills', type: 'skills', enabled: true },
    { id: '3', name: 'Education', type: 'education', enabled: true },
    { id: '4', name: 'Experience', type: 'experience', enabled: true },
    { id: '5', name: 'Projects', type: 'projects', enabled: true },
    { id: '6', name: 'Certifications', type: 'certifications', enabled: true },
  ]);

  // Load existing resume if resumeId is present
  useEffect(() => {
    const resumeId = searchParams.get('resumeId');
    if (resumeId) {
      loadResumeForEditing(resumeId);
    }
  }, [searchParams]);

  const loadResumeForEditing = async (resumeId: string) => {
    try {
      setLoading(true);
      const response = await getResumeById(resumeId);
      
      if (response.success && response.data) {
        const resumeData = response.data.resumeData;
        
        // Load basic info
        if (resumeData.personalInfo) setPersonalInfo(resumeData.personalInfo);
        if (resumeData.summary) setSummary(resumeData.summary);
        if (resumeData.skills) setSkills(resumeData.skills);
        if (resumeData.education) setEducation(resumeData.education);
        if (resumeData.experience) setExperience(resumeData.experience);
        if (resumeData.projects) setProjects(resumeData.projects);
        if (resumeData.certifications) setCertifications(resumeData.certifications);
        if (resumeData.customSections) setCustomSections(resumeData.customSections);
        
        // Load section order if available
        if (resumeData.sectionOrder) {
          setSections(resumeData.sectionOrder);
        }
        
        setIsEditMode(true);
        setEditingResumeId(resumeId);
        setResumeName(response.data.resumeName || '');
        
        setUploadStatus({ 
          type: 'success', 
          message: 'Resume loaded successfully! You can now edit it.' 
        });
        setTimeout(() => setUploadStatus(null), 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load resume';
      setUploadStatus({ 
        type: 'error', 
        message: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    const newSections = [...sections];
    [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
    setSections(newSections);
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    const newSections = [...sections];
    [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
    setSections(newSections);
  };

  const toggleSection = (id: string) => {
    setSections(sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, {
      id: Date.now().toString(),
      institution: '',
      degree: '',
      year: ''
    }]);
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setEducation(education.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter(e => e.id !== id));
  };

  const addExperience = () => {
    setExperience([...experience, {
      id: Date.now().toString(),
      title: '',
      company: '',
      duration: '',
      description: ''
    }]);
  };

  const updateExperience = (id: string, field: keyof Experience, value: string) => {
    setExperience(experience.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter(e => e.id !== id));
  };

  const addProject = () => {
    setProjects([...projects, {
      id: Date.now().toString(),
      name: '',
      description: '',
      technologies: ''
    }]);
  };

  const updateProject = (id: string, field: keyof Project, value: string) => {
    setProjects(projects.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // Custom Section Handlers
  const addCustomSection = () => {
    if (!newCustomSection.heading.trim()) {
      setErrorMessage('Please enter a heading for the custom section');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const customId = Date.now().toString();
    const newSection: CustomSection = {
      id: customId,
      heading: newCustomSection.heading.trim(),
      type: newCustomSection.type,
      content: newCustomSection.type === 'paragraph' ? '' : newCustomSection.type === 'tags' ? [] : []
    };

    setCustomSections([...customSections, newSection]);
    
    // Add to sections for ordering
    setSections([...sections, {
      id: customId,
      name: newCustomSection.heading.trim(),
      type: 'custom',
      enabled: true,
      customType: newCustomSection.type
    }]);

    setNewCustomSection({ heading: '', type: 'paragraph' });
    setShowCustomSectionDialog(false);
  };

  const updateCustomSection = (id: string, content: string | string[] | Array<{ id: string; text: string }>) => {
    setCustomSections(customSections.map(cs => cs.id === id ? { ...cs, content } : cs));
  };

  const removeCustomSection = (id: string) => {
    setCustomSections(customSections.filter(cs => cs.id !== id));
    setSections(sections.filter(s => s.id !== id));
  };

  const addCustomListItem = (sectionId: string) => {
    const section = customSections.find(cs => cs.id === sectionId);
    if (!section || section.type !== 'list') return;
    
    const newItem = { id: Date.now().toString(), text: '' };
    updateCustomSection(sectionId, [...(section.content as Array<{ id: string; text: string }>), newItem]);
  };

  const updateCustomListItem = (sectionId: string, itemId: string, text: string) => {
    const section = customSections.find(cs => cs.id === sectionId);
    if (!section || section.type !== 'list') return;
    
    const updatedList = (section.content as Array<{ id: string; text: string }>).map(item =>
      item.id === itemId ? { ...item, text } : item
    );
    updateCustomSection(sectionId, updatedList);
  };

  const removeCustomListItem = (sectionId: string, itemId: string) => {
    const section = customSections.find(cs => cs.id === sectionId);
    if (!section || section.type !== 'list') return;
    
    const updatedList = (section.content as Array<{ id: string; text: string }>).filter(item => item.id !== itemId);
    updateCustomSection(sectionId, updatedList);
  };

  const addCustomTag = (sectionId: string, tag: string) => {
    const section = customSections.find(cs => cs.id === sectionId);
    if (!section || section.type !== 'tags' || !tag.trim()) return;
    
    updateCustomSection(sectionId, [...(section.content as string[]), tag.trim()]);
  };

  const removeCustomTag = (sectionId: string, index: number) => {
    const section = customSections.find(cs => cs.id === sectionId);
    if (!section || section.type !== 'tags') return;
    
    updateCustomSection(sectionId, (section.content as string[]).filter((_, i) => i !== index));
  };

  // PDF Upload Handler
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setUploadStatus({ type: 'error', message: 'Please upload a PDF file' });
      return;
    }

    setUploadStatus({ type: 'loading', message: 'Processing PDF...' });
    
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await axios.post(`${API_URL}/api/resume/upload-dynamic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      const data = response.data.data;
      
      // Update state with parsed data
      if (data.personalInfo) setPersonalInfo(data.personalInfo);
      if (data.summary) setSummary(data.summary);
      if (data.skills) setSkills(data.skills);
      if (data.education) setEducation(data.education.map((edu: Omit<Education, 'id'>, idx: number) => ({ ...edu, id: `${Date.now()}-${idx}` })));
      if (data.experience) setExperience(data.experience.map((exp: Omit<Experience, 'id'>, idx: number) => ({ ...exp, id: `${Date.now()}-${idx}` })));
      if (data.projects) setProjects(data.projects.map((proj: Omit<Project, 'id'>, idx: number) => ({ ...proj, id: `${Date.now()}-${idx}` })));
      if (data.certifications) setCertifications(data.certifications);
      
      setUploadStatus({ type: 'success', message: 'Resume data extracted successfully! Please review and correct any errors.' });
      
      setTimeout(() => setUploadStatus(null), 5000);
    } catch {
      setUploadStatus({ 
        type: 'error', 
        message: 'Failed to process PDF. Please try again or fill the form manually.' 
      });
    }
  };

  // Download PDF Handler
  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    setLoading(true);
    try {
      const element = previewRef.current;
      
      const opt = {
        margin: 0,
        filename: `${personalInfo.name.replace(/\s+/g, '_') || 'Resume'}_Dynamic.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm' as const, 
          format: 'a4' as const, 
          orientation: 'portrait' as const
        }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage('Failed to generate PDF: ' + errMsg);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Save Resume Handler
  const handleSaveResume = async () => {
    if (!resumeName.trim()) {
      setErrorMessage('Please enter a resume name');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setSaving(true);
    try {
      const resumeData = {
        resumeName: resumeName.trim(),
        personalInfo,
        summary,
        education: education.filter(e => e.institution || e.degree),
        experience: experience.filter(e => e.title || e.company),
        skills,
        projects: projects.filter(p => p.name || p.description),
        certifications,
        customSections,
        template: 'resume-template', // Using default template for now
        sectionOrder: sections,
        isDynamic: true, // Mark this resume as created from Dynamic Resume Builder
        resumeFormat: 'classic' // Classic format for DynamicResumeEditor
      };

      // Include resumeId if editing
      const saveData = isEditMode && editingResumeId 
        ? { ...resumeData, resumeId: editingResumeId }
        : resumeData;
      
      const response = await saveResume(saveData);
      
      if (response.success) {
        setSuccessMessage(isEditMode ? 'Resume updated successfully!' : 'Resume saved successfully!');
        setShowSaveDialog(false);
        setTimeout(() => {
          navigate('/profile');
        }, 1500);
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      setErrorMessage('Failed to save resume: ' + errMsg);
      setTimeout(() => setErrorMessage(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSaveDialog = () => {
    // Use existing resume name if editing, otherwise create default name
    if (!isEditMode) {
      const defaultName = `${personalInfo.name || 'My'}'s Dynamic Resume - ${new Date().toLocaleDateString()}`;
      setResumeName(defaultName);
    }
    setShowSaveDialog(true);
  };

  // Prepare resume data for AI analysis
  const getResumeDataForAnalysis = () => {
    return {
      personalInfo: {
        ...personalInfo,
        location: '', // Not in dynamic builder
        linkedin: personalInfo.linkedin || '',
        portfolio: ''
      },
      summary,
      education: education.map(edu => ({
        degree: edu.degree,
        institution: edu.institution,
        year: edu.year,
        gpa: ''
      })),
      experience: experience.map(exp => ({
        title: exp.title,
        company: exp.company,
        duration: exp.duration,
        description: exp.description
      })),
      skills,
      projects: projects.map(proj => ({
        name: proj.name,
        description: proj.description,
        technologies: proj.technologies
      })),
      certifications
    };
  };

  const renderSection = (section: Section) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'profile':
        return summary ? (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-bold">Profile</h2>
            <div className="mb-2 border-b border-black"></div>
            <p className="text-xs leading-tight text-justify">{summary}</p>
          </div>
        ) : null;

      case 'skills':
        return skills.length > 0 ? (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-bold">Skills</h2>
            <div className="mb-2 border-b border-black"></div>
            <div className="text-xs">
              <span className="font-bold">Technical Skills: </span>
              <span>{skills.join(', ')}</span>
            </div>
          </div>
        ) : null;

      case 'education':
        return education.length > 0 ? (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-bold">Education</h2>
            <div className="mb-2 border-b border-black"></div>
            {education.map(edu => (
              <div key={edu.id} className="mb-3">
                <div className="flex justify-between text-xs">
                  <span className="font-bold">{edu.institution}</span>
                  <span className="font-bold">{edu.year}</span>
                </div>
                <div className="text-xs italic">{edu.degree}</div>
              </div>
            ))}
          </div>
        ) : null;

      case 'experience':
        return experience.length > 0 ? (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-bold">Professional Experience</h2>
            <div className="mb-2 border-b border-black"></div>
            {experience.map(exp => (
              <div key={exp.id} className="mb-3">
                <div className="flex justify-between text-xs">
                  <span className="font-bold">{exp.title}</span>
                  <span className="italic font-bold">{exp.duration}</span>
                </div>
                <div className="mb-1 text-xs italic">{exp.company}</div>
                <ul className="ml-5 text-xs">
                  <li>{exp.description}</li>
                </ul>
              </div>
            ))}
          </div>
        ) : null;

      case 'projects':
        return projects.length > 0 ? (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-bold">Projects</h2>
            <div className="mb-2 border-b border-black"></div>
            {projects.map(proj => (
              <div key={proj.id} className="mb-3">
                <div className="mb-1 text-xs font-bold">{proj.name}</div>
                <ul className="ml-5 text-xs">
                  <li>{proj.description}</li>
                  {proj.technologies && <li>{proj.technologies}</li>}
                </ul>
              </div>
            ))}
          </div>
        ) : null;

      case 'certifications':
        return certifications.length > 0 ? (
          <div className="mb-5">
            <h2 className="mb-2 text-sm font-bold">Certifications</h2>
            <div className="mb-2 border-b border-black"></div>
            <ul className="ml-5 text-xs">
              {certifications.map((cert, i) => (
                <li key={i}>{cert}</li>
              ))}
            </ul>
          </div>
        ) : null;

      case 'custom': {
        const customSection = customSections.find(cs => cs.id === section.id);
        if (!customSection) return null;

        // Render based on custom section type
        if (customSection.type === 'paragraph') {
          return customSection.content ? (
            <div className="mb-5">
              <h2 className="mb-2 text-sm font-bold">{customSection.heading}</h2>
              <div className="mb-2 border-b border-black"></div>
              <p className="text-xs leading-tight text-justify">{customSection.content as string}</p>
            </div>
          ) : null;
        } else if (customSection.type === 'tags') {
          const tags = customSection.content as string[];
          return tags.length > 0 ? (
            <div className="mb-5">
              <h2 className="mb-2 text-sm font-bold">{customSection.heading}</h2>
              <div className="mb-2 border-b border-black"></div>
              <div className="text-xs">{tags.join(', ')}</div>
            </div>
          ) : null;
        } else if (customSection.type === 'list') {
          const items = customSection.content as Array<{ id: string; text: string }>;
          return items.length > 0 && items.some(item => item.text.trim()) ? (
            <div className="mb-5">
              <h2 className="mb-2 text-sm font-bold">{customSection.heading}</h2>
              <div className="mb-2 border-b border-black"></div>
              <ul className="ml-5 text-xs">
                {items.filter(item => item.text.trim()).map((item) => (
                  <li key={item.id}>{item.text}</li>
                ))}
              </ul>
            </div>
          ) : null;
        }
        return null;
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Success Message Banner */}
      {successMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="p-4 bg-green-100 border border-green-400 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-800 font-medium">{successMessage}</p>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="p-4 bg-red-100 border border-red-400 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-800 font-medium">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 mx-auto max-w-7xl sm:px-6">
          <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Tabs */}
            <div className="flex gap-4 overflow-x-auto sm:gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-1 pb-4 border-b-2 transition-colors whitespace-nowrap sm:gap-2 ${
                  activeTab === 'overview'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-lg sm:text-xl">☰</span>
                <span className="text-sm font-medium sm:text-base">Overview</span>
              </button>
              
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center gap-1 pb-4 border-b-2 transition-colors whitespace-nowrap sm:gap-2 ${
                  activeTab === 'content'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-lg sm:text-xl">📄</span>
                <span className="text-sm font-medium sm:text-base">Content</span>
              </button>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                  onClick={() => navigate('/dynamic-resume-builder')}
                  className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg sm:px-4 hover:bg-gray-50"
              >
                <span className="hidden sm:inline">Back</span>
                <span className="sm:hidden">←</span>
              </button>
              
              <button 
                onClick={() => setShowAIAnalysis(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-white bg-purple-500 rounded-lg sm:gap-2 sm:px-4 hover:bg-purple-600"
              >
                <span className="hidden sm:inline">🤖 AI Analysis</span>
                <span className="sm:hidden">🤖</span>
              </button>

              <button 
                onClick={handleOpenSaveDialog}
                className="flex items-center gap-1 px-3 py-2 text-sm text-white bg-blue-500 rounded-lg sm:gap-2 sm:px-4 hover:bg-blue-600"
              >
                <span className="hidden sm:inline">💾 Save</span>
                <span className="sm:hidden">💾</span>
              </button>
              
              <button 
                onClick={handleDownloadPDF}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-500 rounded-lg sm:gap-2 sm:px-6 sm:text-base hover:bg-green-600 disabled:opacity-50"
              >
                <span className="hidden sm:inline">{loading ? 'Generating...' : 'Download'}</span>
                <span className="sm:hidden">⬇</span>
                <span className="hidden sm:inline">⬇</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 mx-auto sm:px-6 sm:py-8 max-w-7xl">
        {/* Edit Mode Indicator */}
        {isEditMode && (
          <div className="p-3 mb-6 border-l-4 border-blue-500 rounded-r-lg bg-blue-50">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-sm font-medium text-blue-800">
                Editing Mode: You are updating an existing resume
              </span>
            </div>
          </div>
        )}

        {/* PDF Upload Section */}
        <div className="p-4 mb-6 bg-white shadow-sm sm:p-6 rounded-xl">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 sm:text-xl">Quick Start</h2>
              <p className="text-xs text-gray-600 sm:text-sm">Upload your existing resume PDF to auto-fill the form</p>
            </div>
            <label className="flex items-center justify-center w-full px-4 py-2 text-sm text-white transition-colors bg-green-500 rounded-lg cursor-pointer sm:w-auto sm:px-6 sm:py-3 hover:bg-green-600">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload PDF
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
                  <span className="text-sm font-semibold sm:text-base">{uploadStatus.message}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-2">
          {/* Left Panel - Content Editor */}
          <div className="space-y-4 sm:space-y-6">
            {activeTab === 'content' && (
              <>
                {/* Personal Info */}
                <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                  <h3 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">Personal Information</h3>
                  <div className="space-y-4">
                    <input
                      id="fullName"
                      type="text"
                      placeholder="Full Name"
                      value={personalInfo.name}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      id="phone"
                      type="tel"
                      placeholder="Phone"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      id="linkedin"
                      type="url"
                      placeholder="LinkedIn URL"
                      value={personalInfo.linkedin}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                      className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Profile/Summary */}
                <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                  <h3 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">Profile Summary</h3>
                  <textarea
                    id="profileSummary"
                    placeholder="Write a brief professional summary..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                {/* Skills */}
                <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                  <h3 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">Skills</h3>
                  <div className="flex gap-2 mb-3">
                    <input
                      id="skillInput"
                      type="text"
                      placeholder="Add a skill"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                      className="flex-1 px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={addSkill}
                      className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-black bg-green-500 rounded-full">
                        {skill}
                        <button onClick={() => removeSkill(i)} className="text-black hover:text-gray-800">×</button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                  <div className="flex flex-col items-start gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between sm:mb-4">
                    <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Education</h3>
                    <button
                      onClick={addEducation}
                      className="px-3 py-1.5 text-xs sm:text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 sm:px-4 sm:py-2"
                    >
                      + Add Education
                    </button>
                  </div>
                  <div className="space-y-4">
                    {education.map(edu => (
                      <div key={edu.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-3">
                          <input
                            id={`education-institution-${edu.id}`}
                            type="text"
                            placeholder="Institution Name"
                            value={edu.institution}
                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            id={`education-degree-${edu.id}`}
                            type="text"
                            placeholder="Degree"
                            value={edu.degree}
                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            id={`education-year-${edu.id}`}
                            type="text"
                            placeholder="Year (e.g., 2020-2024)"
                            value={edu.year}
                            onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            onClick={() => removeEducation(edu.id)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                  <div className="flex flex-col items-start gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between sm:mb-4">
                    <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Experience</h3>
                    <button
                      onClick={addExperience}
                      className="px-3 py-1.5 text-xs sm:text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 sm:px-4 sm:py-2"
                    >
                      + Add Experience
                    </button>
                  </div>
                  <div className="space-y-4">
                    {experience.map(exp => (
                      <div key={exp.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-3">
                          <input
                            id={`experience-title-${exp.id}`}
                            type="text"
                            placeholder="Job Title"
                            value={exp.title}
                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            id={`experience-company-${exp.id}`}
                            type="text"
                            placeholder="Company"
                            value={exp.company}
                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            id={`experience-duration-${exp.id}`}
                            type="text"
                            placeholder="Duration (e.g., Jan 2020 - Dec 2021)"
                            value={exp.duration}
                            onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <textarea
                            id={`experience-description-${exp.id}`}
                            placeholder="Description"
                            value={exp.description}
                            onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            onClick={() => removeExperience(exp.id)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Projects */}
                <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                  <div className="flex flex-col items-start gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between sm:mb-4">
                    <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Projects</h3>
                    <button
                      onClick={addProject}
                      className="px-3 py-1.5 text-xs sm:text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 sm:px-4 sm:py-2"
                    >
                      + Add Project
                    </button>
                  </div>
                  <div className="space-y-4">
                    {projects.map(proj => (
                      <div key={proj.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="space-y-3">
                          <input
                            id={`project-name-${proj.id}`}
                            type="text"
                            placeholder="Project Name"
                            value={proj.name}
                            onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <textarea
                            id={`project-description-${proj.id}`}
                            placeholder="Description"
                            value={proj.description}
                            onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <input
                            id={`project-technologies-${proj.id}`}
                            type="text"
                            placeholder="Technologies Used"
                            value={proj.technologies}
                            onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                            className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                          <button
                            onClick={() => removeProject(proj.id)}
                            className="text-sm text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Sections */}
                <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                  <div className="flex flex-col items-start gap-3 mb-3 sm:flex-row sm:items-center sm:justify-between sm:mb-4">
                    <h3 className="text-base font-semibold text-gray-800 sm:text-lg">Custom Sections</h3>
                    <button
                      onClick={() => setShowCustomSectionDialog(true)}
                      className="px-3 py-1.5 text-xs sm:text-sm text-white bg-green-500 rounded-lg hover:bg-green-600 sm:px-4 sm:py-2"
                    >
                      + Add Custom Section
                    </button>
                  </div>
                  
                  {customSections.length === 0 ? (
                    <p className="text-sm text-gray-500">No custom sections yet. Add one to create your own personalized section!</p>
                  ) : (
                    <div className="space-y-4">
                      {customSections.map(customSection => (
                        <div key={customSection.id} className="p-4 border-2 border-green-200 rounded-lg bg-green-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-gray-800">{customSection.heading}</h4>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-1 text-xs text-green-700 bg-green-100 rounded">
                                {customSection.type === 'paragraph' ? '📝 Paragraph' : 
                                 customSection.type === 'tags' ? '🏷️ Tags' : '📋 List'}
                              </span>
                              <button
                                onClick={() => removeCustomSection(customSection.id)}
                                className="text-sm text-red-500 hover:text-red-700"
                              >
                                Remove Section
                              </button>
                            </div>
                          </div>

                          {/* Paragraph Type */}
                          {customSection.type === 'paragraph' && (
                            <textarea
                              id={`custom-paragraph-${customSection.id}`}
                              placeholder={`Enter content for ${customSection.heading}...`}
                              value={customSection.content as string}
                              onChange={(e) => updateCustomSection(customSection.id, e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                            />
                          )}

                          {/* Tags Type */}
                          {customSection.type === 'tags' && (
                            <>
                              <div className="flex gap-2 mb-3">
                                <input
                                  id={`custom-tag-input-${customSection.id}`}
                                  type="text"
                                  placeholder="Add a tag"
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      addCustomTag(customSection.id, e.currentTarget.value);
                                      e.currentTarget.value = '';
                                    }
                                  }}
                                  className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                />
                                <button
                                  onClick={() => {
                                    const input = document.getElementById(`custom-tag-input-${customSection.id}`) as HTMLInputElement;
                                    if (input?.value) {
                                      addCustomTag(customSection.id, input.value);
                                      input.value = '';
                                    }
                                  }}
                                  className="px-4 py-2 text-sm text-white bg-green-500 rounded hover:bg-green-600"
                                >
                                  Add
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {(customSection.content as string[]).map((tag, i) => (
                                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-white bg-green-500 rounded-full">
                                    {tag}
                                    <button 
                                      onClick={() => removeCustomTag(customSection.id, i)} 
                                      className="text-white hover:text-gray-200"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </>
                          )}

                          {/* List Type */}
                          {customSection.type === 'list' && (
                            <>
                              <div className="mb-3">
                                <button
                                  onClick={() => addCustomListItem(customSection.id)}
                                  className="px-3 py-1.5 text-xs text-white bg-green-500 rounded hover:bg-green-600"
                                >
                                  + Add Item
                                </button>
                              </div>
                              <div className="space-y-2">
                                {(customSection.content as Array<{ id: string; text: string }>).map((item) => (
                                  <div key={item.id} className="flex gap-2">
                                    <input
                                      id={`custom-list-item-${item.id}`}
                                      type="text"
                                      placeholder="Enter item..."
                                      value={item.text}
                                      onChange={(e) => updateCustomListItem(customSection.id, item.id, e.target.value)}
                                      className="flex-1 px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                    <button
                                      onClick={() => removeCustomListItem(customSection.id, item.id)}
                                      className="px-3 py-2 text-sm text-red-500 hover:text-red-700"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'overview' && (
              <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                <h3 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">Customize Section Order</h3>
                <p className="mb-3 text-xs text-gray-600 sm:mb-4 sm:text-sm">Drag sections to reorder them on your resume</p>
                <div className="space-y-3">
                  {sections.map((section, index) => (
                    <div key={section.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                      <input
                        type="checkbox"
                        checked={section.enabled}
                        onChange={() => toggleSection(section.id)}
                        className="w-4 h-4 text-green-500 focus:ring-green-500"
                      />
                      <span className="flex-1 font-medium text-gray-700">{section.name}</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => moveSectionUp(index)}
                          disabled={index === 0}
                          className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveSectionDown(index)}
                          disabled={index === sections.length - 1}
                          className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
          </div>

          {/* Right Panel - Live Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div ref={previewRef} className="p-4 bg-white border border-gray-200 shadow-lg sm:p-6 md:p-8 rounded-xl">
              <div style={{ 
                fontFamily: "'Times New Roman', Times, serif",
                fontSize: '11px',
                lineHeight: '1.4',
                color: '#000'
              }}>
                {/* Header */}
                <div className="mb-4 text-center">
                  <h1 className="mb-1 text-2xl font-bold">
                    {personalInfo.name || 'Your Name'}
                  </h1>
                  <div className="text-xs">
                    {personalInfo.phone || 'Phone'} | {personalInfo.email || 'Email'}
                    {personalInfo.linkedin && (
                      <> | <a href={personalInfo.linkedin} >LinkedIn</a></>
                    )}
                  </div>
                </div>

                {/* Dynamic Sections based on order */}
                {sections.map(section => renderSection(section))}

                {/* No content message */}
                {!personalInfo.name && !summary && skills.length === 0 && 
                 education.length === 0 && experience.length === 0 && projects.length === 0 && (
                  <div className="py-12 text-center text-gray-400">
                    <div className="mb-4 text-6xl">📄</div>
                    <p className="text-lg">Start filling in your information</p>
                    <p className="mt-2 text-sm">Your resume preview will appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Resume Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-800">
              {isEditMode ? 'Update Resume' : 'Save Resume'}
            </h3>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="Enter resume name"
              className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="flex gap-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResume}
                disabled={saving}
                className="flex-1 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                {saving ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update' : 'Save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis Dialog */}
      <AIAnalysisDialog
        isOpen={showAIAnalysis}
        onClose={() => setShowAIAnalysis(false)}
        resumeData={getResumeDataForAnalysis()}
      />

      {/* Custom Section Creation Dialog */}
      {showCustomSectionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-800">Add Custom Section</h3>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Section Heading</label>
              <input
                type="text"
                value={newCustomSection.heading}
                onChange={(e) => setNewCustomSection({ ...newCustomSection, heading: e.target.value })}
                placeholder="e.g., Certifications, Awards, Languages"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-6">
              <label className="block mb-2 text-sm font-medium text-gray-700">Content Type</label>
              <div className="space-y-3">
                <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="customType"
                    value="paragraph"
                    checked={newCustomSection.type === 'paragraph'}
                    onChange={(e) => setNewCustomSection({ ...newCustomSection, type: e.target.value as 'paragraph' | 'tags' | 'list' })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-800">📝 Paragraph</div>
                    <div className="text-xs text-gray-600">For continuous text (like a summary or objective)</div>
                  </div>
                </label>

                <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="customType"
                    value="tags"
                    checked={newCustomSection.type === 'tags'}
                    onChange={(e) => setNewCustomSection({ ...newCustomSection, type: e.target.value as 'paragraph' | 'tags' | 'list' })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-800">🏷️ Tags</div>
                    <div className="text-xs text-gray-600">For comma-separated items (like skills or languages)</div>
                  </div>
                </label>

                <label className="flex items-start p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="customType"
                    value="list"
                    checked={newCustomSection.type === 'list'}
                    onChange={(e) => setNewCustomSection({ ...newCustomSection, type: e.target.value as 'paragraph' | 'tags' | 'list' })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <div className="font-medium text-gray-800">📋 List</div>
                    <div className="text-xs text-gray-600">For bullet points (like certifications or awards)</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCustomSectionDialog(false);
                  setNewCustomSection({ heading: '', type: 'paragraph' });
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addCustomSection}
                className="flex-1 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600"
              >
                Add Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicResumeEditor;
