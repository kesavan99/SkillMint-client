import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from '../Navbar';
import html2pdf from 'html2pdf.js';
import axios from 'axios';
import { saveResume, getResumeById } from '../../client-configuration/resume-API';
import ColorCustomize from './ColorCustomize';
import AIAnalysisDialog from '../AIAnalysisDialog';
import { useTranslation } from '../../locales';

const API_URL = import.meta.env.VITE_API_BASE_URL;

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  linkedin: string;
  photo: string;
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

interface CustomSection {
  id: string;
  heading: string;
  type: 'paragraph' | 'tags' | 'list';
  content: string | string[] | Array<{ id: string; text: string }>;
}

interface Section {
  id: string;
  name: string;
  type: 'profile' | 'skills' | 'education' | 'experience' | 'projects' | 'certifications' | 'custom';
  enabled: boolean;
  customType?: 'paragraph' | 'tags' | 'list';
}

const TwoSideResume: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const previewRef = useRef<HTMLDivElement>(null);
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    name: '',
    email: '',
    phone: '',
    linkedin: '',
    photo: ''
  });

  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');
  const [education, setEducation] = useState<Education[]>([]);
  const [experience, setExperience] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [certInput, setCertInput] = useState('');
  const [customSections, setCustomSections] = useState<CustomSection[]>([]);
  const [showCustomSectionDialog, setShowCustomSectionDialog] = useState(false);
  const [newSectionHeading, setNewSectionHeading] = useState('');
  const [newSectionType, setNewSectionType] = useState<'paragraph' | 'tags' | 'list'>('paragraph');
  const [activeTab, setActiveTab] = useState<'overview' | 'content' | 'customize'>('content');
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [resumeName, setResumeName] = useState('');

  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | 'loading'; message: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [leftSideColor, setLeftSideColor] = useState("#2C5F7C");

  const leftSidePanelcolors = ['#79C9C5','#85409D','#4D2B8C','#F16D34','#BDE8F5','#FFA240','#D73535']
  
  // Section ordering
  const [sections, setSections] = useState<Section[]>([
    { id: '1', name: 'Profile Summary', type: 'profile', enabled: true },
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
        
        // Load all resume data
        if (resumeData.personalInfo) setPersonalInfo(resumeData.personalInfo);
        if (resumeData.summary) setSummary(resumeData.summary);
        if (resumeData.skills) setSkills(resumeData.skills);
        if (resumeData.education) setEducation(resumeData.education);
        if (resumeData.experience) setExperience(resumeData.experience);
        if (resumeData.projects) setProjects(resumeData.projects);
        if (resumeData.certifications) setCertifications(resumeData.certifications);
        if (resumeData.customSections) setCustomSections(resumeData.customSections);
        if (resumeData.sectionOrder) setSections(resumeData.sectionOrder);
        
        setResumeName(response.data.resumeName || '');
        setIsEditMode(true);
        setEditingResumeId(resumeId);
        
        setUploadStatus({ 
          type: 'success', 
          message: 'Resume loaded successfully. You can now edit it.' 
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

  // Photo Upload Handler with compression
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage('Please upload a valid image file (JPG, PNG, or WebP)');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrorMessage('Image size should be less than 5MB');
      setTimeout(() => setErrorMessage(null), 4000);
      return;
    }

    setUploadingPhoto(true);
    try {
      // Create an image element to compress
      const img = new Image();
      const reader = new FileReader();
      
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      
      img.onload = () => {
        // Create canvas for compression
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Calculate new dimensions (max 400x400 while maintaining aspect ratio)
        // Smaller size for resume photos - still looks great
        let width = img.width;
        let height = img.height;
        const maxDimension = 400;
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width;
          width = maxDimension;
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height;
          height = maxDimension;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to base64 with higher compression (0.6 quality for JPEG)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        
        // Check final size (base64 size in bytes)
        const sizeInBytes = (compressedBase64.length * 3) / 4;
        const sizeInKB = sizeInBytes / 1024;
        
        console.log(`Compressed image size: ${sizeInKB.toFixed(2)} KB`);
        
        if (sizeInKB > 500) {
          setErrorMessage('Compressed image is still too large. Please use a smaller image.');
          setTimeout(() => setErrorMessage(null), 4000);
          setUploadingPhoto(false);
          return;
        }
        
        setPersonalInfo({ ...personalInfo, photo: compressedBase64 });
        setUploadingPhoto(false);
      };
      
      img.onerror = () => {
        setErrorMessage('Failed to load image');
        setTimeout(() => setErrorMessage(null), 4000);
        setUploadingPhoto(false);
      };
      
      reader.onerror = () => {
        setErrorMessage('Failed to upload photo');
        setTimeout(() => setErrorMessage(null), 4000);
        setUploadingPhoto(false);
      };
      
      reader.readAsDataURL(file);
    } catch {
      setErrorMessage('Failed to upload photo');
      setTimeout(() => setErrorMessage(null), 4000);
      setUploadingPhoto(false);
    }
  };

  const removePhoto = () => {
    setPersonalInfo({ ...personalInfo, photo: '' });
  };

  // Section ordering functions
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

  const addCertification = () => {
    if (certInput.trim()) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
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

  const addCustomSection = () => {
    if (!newSectionHeading.trim()) return;
    
    const newSection: CustomSection = {
      id: Date.now().toString(),
      heading: newSectionHeading,
      type: newSectionType,
      content: newSectionType === 'paragraph' ? '' : newSectionType === 'tags' ? [] : []
    };
    
    setCustomSections([...customSections, newSection]);
    
    // Add to sections for ordering
    setSections([...sections, {
      id: newSection.id,
      name: newSectionHeading,
      type: 'custom',
      enabled: true,
      customType: newSectionType
    }]);
    
    setNewSectionHeading('');
    setNewSectionType('paragraph');
    setShowCustomSectionDialog(false);
  };

  const removeCustomSection = (id: string) => {
    setCustomSections(customSections.filter(cs => cs.id !== id));
    setSections(sections.filter(s => s.id !== id));
  };

  const updateCustomSection = (id: string, content: string) => {
    setCustomSections(customSections.map(cs => 
      cs.id === id ? { ...cs, content } : cs
    ));
  };

  const addCustomTag = (sectionId: string, tag: string) => {
    if (!tag.trim()) return;
    setCustomSections(customSections.map(cs => {
      if (cs.id === sectionId && cs.type === 'tags') {
        return { ...cs, content: [...(cs.content as string[]), tag] };
      }
      return cs;
    }));
  };

  const removeCustomTag = (sectionId: string, index: number) => {
    setCustomSections(customSections.map(cs => {
      if (cs.id === sectionId && cs.type === 'tags') {
        const tags = cs.content as string[];
        return { ...cs, content: tags.filter((_, i) => i !== index) };
      }
      return cs;
    }));
  };

  const addCustomListItem = (sectionId: string) => {
    setCustomSections(customSections.map(cs => {
      if (cs.id === sectionId && cs.type === 'list') {
        const items = cs.content as Array<{ id: string; text: string }>;
        return { ...cs, content: [...items, { id: Date.now().toString(), text: '' }] };
      }
      return cs;
    }));
  };

  const updateCustomListItem = (sectionId: string, itemId: string, text: string) => {
    setCustomSections(customSections.map(cs => {
      if (cs.id === sectionId && cs.type === 'list') {
        const items = cs.content as Array<{ id: string; text: string }>;
        return { ...cs, content: items.map(item => item.id === itemId ? { ...item, text } : item) };
      }
      return cs;
    }));
  };

  const removeCustomListItem = (sectionId: string, itemId: string) => {
    setCustomSections(customSections.map(cs => {
      if (cs.id === sectionId && cs.type === 'list') {
        const items = cs.content as Array<{ id: string; text: string }>;
        return { ...cs, content: items.filter(item => item.id !== itemId) };
      }
      return cs;
    }));
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
      if (data.personalInfo) {
        setPersonalInfo({
          ...personalInfo,
          name: data.personalInfo.name || '',
          email: data.personalInfo.email || '',
          phone: data.personalInfo.phone || '',
          linkedin: data.personalInfo.linkedin || ''
        });
      }
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

  // Prepare resume data for AI analysis
  const getResumeDataForAnalysis = () => {
    return {
      personalInfo: {
        ...personalInfo,
        location: '', // Not in TwoSide builder
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

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    setLoading(true);
    try {
      const element = previewRef.current;
      
      const opt = {
        margin: 0,
        filename: `${personalInfo.name.replace(/\s+/g, '_') || 'Resume'}_TwoSide.pdf`,
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to generate PDF: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Render section based on type for dynamic ordering
  const renderSection = (section: Section) => {
    if (!section.enabled) return null;

    switch (section.type) {
      case 'profile':
        return summary ? (
          <div key={section.id} style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: '700', marginBottom: '12px', color: '#2c5f7c', borderBottom: '2px solid #2c5f7c', paddingBottom: '5px' }}>
              PROFESSIONAL SUMMARY
            </h2>
            <p style={{ fontSize: '10pt', lineHeight: '1.6', textAlign: 'justify' }}>
              {summary}
            </p>
          </div>
        ) : null;

      case 'skills':
        // Skills are rendered in sidebar, skip here
        return null;

      case 'education':
        return education.length > 0 ? (
          <div key={section.id} style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: '700', marginBottom: '12px', color: '#2c5f7c', borderBottom: '2px solid #2c5f7c', paddingBottom: '5px' }}>
              EDUCATION
            </h2>
            {education.map((edu) => (
              <div key={edu.id} style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong style={{ fontSize: '11pt' }}>{edu.degree}</strong>
                  <span style={{ fontSize: '10pt', fontStyle: 'italic', color: '#666' }}>{edu.year}</span>
                </div>
                <div style={{ fontSize: '10pt', fontStyle: 'italic', color: '#555' }}>
                  {edu.institution}
                </div>
              </div>
            ))}
          </div>
        ) : null;

      case 'experience':
        return experience.length > 0 ? (
          <div key={section.id} style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: '700', marginBottom: '12px', color: '#2c5f7c', borderBottom: '2px solid #2c5f7c', paddingBottom: '5px' }}>
              EXPERIENCE
            </h2>
            {experience.map((exp) => (
              <div key={exp.id} style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <strong style={{ fontSize: '11pt' }}>{exp.title}</strong>
                  <span style={{ fontSize: '9.5pt', fontStyle: 'italic', color: '#666' }}>{exp.duration}</span>
                </div>
                <div style={{ fontSize: '10pt', fontStyle: 'italic', marginBottom: '8px', color: '#555' }}>
                  {exp.company}
                </div>
                <div style={{ fontSize: '10pt', lineHeight: '1.6', paddingLeft: '15px' }}>
                  {exp.description.split('\n').filter(line => line.trim()).map((line, i) => (
                    <div key={i} style={{ marginBottom: '5px', position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '-15px' }}>•</span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null;

      case 'projects':
        return projects.length > 0 ? (
          <div key={section.id} style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: '700', marginBottom: '12px', color: '#2c5f7c', borderBottom: '2px solid #2c5f7c', paddingBottom: '5px' }}>
              PROJECTS
            </h2>
            {projects.map((proj) => (
              <div key={proj.id} style={{ marginBottom: '15px' }}>
                <strong style={{ fontSize: '11pt' }}>{proj.name}</strong>
                <p style={{ fontSize: '10pt', marginTop: '5px', lineHeight: '1.6' }}>
                  {proj.description}
                </p>
                {proj.technologies && (
                  <div style={{ fontSize: '9.5pt', marginTop: '5px', fontStyle: 'italic', color: '#666' }}>
                    <strong>Technologies:</strong> {proj.technologies}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null;

      case 'certifications':
        return certifications.length > 0 ? (
          <div key={section.id} style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: '700', marginBottom: '12px', color: '#2c5f7c', borderBottom: '2px solid #2c5f7c', paddingBottom: '5px' }}>
              CERTIFICATIONS
            </h2>
            <div style={{ paddingLeft: '15px' }}>
              {certifications.map((cert, i) => (
                <div key={i} style={{ fontSize: '10pt', marginBottom: '8px', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '-15px' }}>•</span>
                  {cert}
                </div>
              ))}
            </div>
          </div>
        ) : null;

      case 'custom': {
        const customSection = customSections.find(cs => cs.id === section.id);
        if (!customSection) return null;

        return (
          <div key={section.id} style={{ marginBottom: '30px' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: '700', marginBottom: '12px', color: '#2c5f7c', borderBottom: '2px solid #2c5f7c', paddingBottom: '5px' }}>
              {customSection.heading.toUpperCase()}
            </h2>
            {customSection.type === 'paragraph' && customSection.content && (
              <div style={{ fontSize: '10pt', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {customSection.content as string}
              </div>
            )}
            {customSection.type === 'tags' && (customSection.content as string[]).length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {(customSection.content as string[]).map((tag, i) => (
                  <span key={i} style={{ padding: '4px 12px', fontSize: '9pt', background: '#2c5f7c', color: '#fff', borderRadius: '12px' }}>
                    {tag}
                  </span>
                ))}
              </div>
            )}
            {customSection.type === 'list' && (customSection.content as Array<{ id: string; text: string }>).length > 0 && (
              <div style={{ paddingLeft: '15px' }}>
                {(customSection.content as Array<{ id: string; text: string }>).filter(item => item.text.trim()).map((item) => (
                  <div key={item.id} style={{ fontSize: '10pt', marginBottom: '8px', position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '-15px' }}>•</span>
                    {item.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      {/* Success Message Banner */}
      {successMessage && (
        <div className="fixed z-50 w-full max-w-md mx-4 transform -translate-x-1/2 top-4 left-1/2">
          <div className="p-4 bg-green-100 border border-green-400 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="flex-shrink-0 w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-green-800">{successMessage}</p>
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
        <div className="fixed z-50 w-full max-w-md mx-4 transform -translate-x-1/2 top-4 left-1/2">
          <div className="p-4 bg-red-100 border border-red-400 rounded-lg shadow-lg">
            <div className="flex items-center gap-3">
              <svg className="flex-shrink-0 w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-red-800">{errorMessage}</p>
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
              
              <button
                onClick={() => setActiveTab('customize')}
                className={`flex items-center gap-1 pb-4 border-b-2 transition-colors whitespace-nowrap sm:gap-2 ${
                  activeTab === 'customize'
                    ? 'border-green-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="text-lg sm:text-xl">🎨</span>
                <span className="text-sm font-medium sm:text-base">Customize</span>
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
                <img src="/statistcs.png" alt="AI" className="w-8 h-8" />
                <span className="hidden sm:inline">AI Analysis</span>
              </button>

              <button 
                onClick={() => setShowSaveDialog(true)}
                className="flex items-center gap-1 px-3 py-2 text-sm text-white bg-blue-500 rounded-lg sm:gap-2 sm:px-4 hover:bg-blue-600"
              >
                <img src="/save.png" alt="Save" className="w-8 h-8" />
                <span className="hidden sm:inline">Save</span>
              </button>
              
              <button 
                onClick={handleDownloadPDF}
                disabled={loading}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-green-500 rounded-lg sm:gap-2 sm:px-6 sm:text-base hover:bg-green-600 disabled:opacity-50"
              >
                <img src="/download.png" alt="Download" className="w-8 h-8" />
                <span className="hidden sm:inline">{loading ? 'Generating...' : 'Download'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6">
        {/* PDF Upload Section */}
        <div className="p-4 mb-6 bg-white shadow-sm sm:p-6 rounded-xl">
          <div className="flex flex-col gap-4 mb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 sm:text-xl">{t('dynamicBuilder.quickStart')}</h2>
              <p className="text-xs text-gray-600 sm:text-sm">{t('dynamicBuilder.uploadPrompt')}</p>
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

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Panel - Form */}
          <div className="space-y-6">
            {activeTab === 'content' && (
              <>
                {/* Personal Info with Photo */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Personal Information</h3>
              
              {/* Photo Upload */}
              <div className="flex flex-col items-center gap-4 p-4 mb-4 border-2 border-gray-200 border-dashed rounded-lg sm:flex-row">
                {personalInfo.photo ? (
                  <div className="relative">
                    <img
                      src={personalInfo.photo}
                      alt="Profile"
                      className="object-cover w-24 h-24 border-2 border-gray-300 rounded-full"
                    />
                    <button
                      onClick={removePhoto}
                      className="absolute top-0 right-0 p-1 text-white bg-red-500 rounded-full hover:bg-red-600"
                      title="Remove photo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-24 h-24 border-2 border-gray-300 border-dashed rounded-full bg-gray-50">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 text-center sm:text-left">
                  <label className="inline-block px-4 py-2 text-sm text-white transition-colors bg-blue-500 rounded-lg cursor-pointer hover:bg-blue-600">
                    {uploadingPhoto ? 'Uploading...' : personalInfo.photo ? 'Change Photo' : 'Upload Photo'}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handlePhotoUpload}
                      disabled={uploadingPhoto}
                      className="hidden"
                    />
                  </label>
                  <p className="mt-2 text-xs text-gray-500">JPG, PNG or WebP (max 5MB)</p>
                  <p className="text-xs text-gray-500">Recommended: Square image, 300x300px</p>
                </div>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Name"
                  value={personalInfo.name}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                  className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="email"
                  placeholder="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="tel"
                  placeholder="Phone no"
                  value={personalInfo.phone}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                  className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <input
                  type="url"
                  placeholder="LinkedIn URL"
                  value={personalInfo.linkedin}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                  className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            </div>

            {/* Professional Summary */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Professional Summary</h3>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Skills */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Skills</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  className="flex-1 px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button onClick={addSkill} className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
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

            {/* Experience */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
                <button onClick={addExperience} className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
                  + Add
                </button>
              </div>
              {experience.map((exp) => (
                <div key={exp.id} className="p-4 mb-4 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={exp.company}
                    onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={exp.duration}
                    onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button onClick={() => removeExperience(exp.id)} className="text-sm text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Education */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                <button onClick={addEducation} className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
                  + Add
                </button>
              </div>
              {education.map((edu) => (
                <div key={edu.id} className="p-4 mb-4 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={edu.degree}
                    onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={edu.institution}
                    onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={edu.year}
                    onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button onClick={() => removeEducation(edu.id)} className="text-sm text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Projects */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
                <button onClick={addProject} className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
                  + Add
                </button>
              </div>
              {projects.map((proj) => (
                <div key={proj.id} className="p-4 mb-4 border border-gray-200 rounded-lg">
                  <input
                    type="text"
                    value={proj.name}
                    onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <textarea
                    value={proj.description}
                    onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <input
                    type="text"
                    value={proj.technologies}
                    onChange={(e) => updateProject(proj.id, 'technologies', e.target.value)}
                    className="w-full px-4 py-2 mb-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button onClick={() => removeProject(proj.id)} className="text-sm text-red-600 hover:text-red-800">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="p-6 bg-white shadow-sm rounded-xl">
              <h3 className="mb-4 text-lg font-semibold text-gray-800">Certifications</h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addCertification()}
                  className="flex-1 px-4 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button onClick={addCertification} className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600">
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-3 py-1 text-sm text-black bg-green-500 rounded-full">
                    {cert}
                    <button onClick={() => removeCertification(i)} className="text-black hover:text-gray-800">×</button>
                  </span>
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

            {activeTab === 'customize' && (
              <div className="p-4 bg-white shadow-sm sm:p-6 rounded-xl">
                <h3 className="mb-3 text-base font-semibold text-gray-800 sm:mb-4 sm:text-lg">Customize Your Resume</h3>
                <p className="mb-4 text-xs text-gray-600 sm:text-sm">Choose a color for the left side panel</p>

                <ColorCustomize
                  leftSidePanelcolors={leftSidePanelcolors}
                  leftSideColor={leftSideColor}
                  setLeftSideColor={setLeftSideColor}
                />
              </div>
            )}
          </div>

          {/* Right Panel - Live Preview */}
          <div className="lg:sticky lg:top-8 lg:h-fit">
            <div ref={previewRef} className="overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl">
              <div style={{ 
                fontFamily: "'Arial', sans-serif",
                fontSize: '10.5pt',
                lineHeight: '1.5',
                color: '#333',
                display: 'flex',
                minHeight: '1050px'
              }}>
                {/* Left Sidebar */}
                <div style={{
                  minWidth: '35%',
                  background: leftSideColor,
                  color: '#fff',
                  padding: '40px 30px'
                }}>
                  {/* Profile Photo */}
                  {personalInfo.photo && (
                    <div style={{ marginBottom: '25px', textAlign: 'center' }}>
                      <img
                        src={personalInfo.photo}
                        alt="Profile"
                        style={{
                          width: '150px',
                          height: '150px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '4px solid #fff',
                          margin: '0 auto'
                        }}
                      />
                    </div>
                  )}

                  {/* Name */}
                  <div style={{ marginBottom: '35px' }}>
                    <h1 style={{ fontSize: '22pt', marginBottom: '5px', fontWeight: '600', lineHeight: '1.2' }}>
                      {personalInfo.name }
                    </h1>
                    <div style={{ fontSize: '11pt', marginTop: '8px', opacity: '0.9' }}>
                      PROFESSIONAL
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '12pt', fontWeight: '700', marginBottom: '15px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>
                      CONTACT
                    </h2>
                    <div style={{ fontSize: '9.5pt', lineHeight: '1.6' }}>
                      {personalInfo.phone && (
                        <div style={{ marginBottom: '12px', wordBreak: 'break-word' }}>
                          <div style={{ opacity: '0.8', marginBottom: '3px' }}>Phone:</div>
                          <div>{personalInfo.phone}</div>
                        </div>
                      )}
                      {personalInfo.email && (
                        <div style={{ marginBottom: '12px', wordBreak: 'break-all' }}>
                          <div style={{ opacity: '0.8', marginBottom: '3px' }}>Email:</div>
                          <div>{personalInfo.email}</div>
                        </div>
                      )}
                      {personalInfo.linkedin && (
                        <div style={{ marginBottom: '12px', wordBreak: 'break-all' }}>
                          <div style={{ opacity: '0.8', marginBottom: '3px' }}>LinkedIn:</div>
                          <a href={personalInfo.linkedin} style={{ color: '#fff' }}>
                            Profile
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Skills */}
                  {skills.length > 0 && (
                    <div>
                      <h2 style={{ fontSize: '12pt', fontWeight: '700', marginBottom: '15px', borderBottom: '2px solid rgba(255,255,255,0.3)', paddingBottom: '8px' }}>
                        SKILLS
                      </h2>
                      <div style={{ fontSize: '9.5pt', lineHeight: '1.8' }}>
                        {skills.map((skill, i) => (
                          <div key={i} style={{ marginBottom: '8px', paddingLeft: '12px', position: 'relative' }}>
                            <span style={{ position: 'absolute', left: '0' }}>•</span>
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Content */}
                <div style={{ flex: 1, padding: '40px 35px' }}>
                  {/* Dynamic Sections based on order */}
                  {sections.map(section => renderSection(section))}

                  {/* Empty State */}
                  {!personalInfo.name && !summary && skills.length === 0 && 
                   education.length === 0 && experience.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: '#999' }}>
                      <div style={{ fontSize: '48pt', marginBottom: '20px' }}>📄</div>
                      <p style={{ fontSize: '14pt' }}>Start filling in your information</p>
                      <p style={{ fontSize: '10pt', marginTop: '10px' }}>Your modern two-side resume will appear here</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Resume Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Save Resume</h3>
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="Enter resume name"
              className="w-full px-4 py-2 mb-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{ color: '#000', backgroundColor: '#fff' }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setResumeName('');
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!resumeName.trim()) return;
                  
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
                      template: 'resume-template-two-side',
                      sectionOrder: sections,
                      isDynamic: true,
                      resumeFormat: 'two-side'
                    };
                    
                    // Check payload size
                    const payloadSize = new Blob([JSON.stringify(resumeData)]).size;
                    const payloadSizeMB = payloadSize / (1024 * 1024);
                    console.log(`Payload size: ${payloadSizeMB.toFixed(2)} MB`);
                    
                    if (payloadSizeMB > 45) {
                      setErrorMessage('Resume data is too large. Please use a smaller photo or reduce content.');
                      setTimeout(() => setErrorMessage(null), 5000);
                      setSaving(false);
                      return;
                    }
                    
                    // Include resumeId if editing
                    const saveData = isEditMode && editingResumeId 
                      ? { ...resumeData, resumeId: editingResumeId }
                      : resumeData;
                    
                    const response = await saveResume(saveData);
                    
                    if (response.success) {
                      setSuccessMessage('Resume saved successfully!');
                      setShowSaveDialog(false);
                      setResumeName('');
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
                }}
                disabled={!resumeName.trim() || saving}
                className="flex-1 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save'}
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

      {/* Custom Section Dialog */}
      {showCustomSectionDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Add Custom Section</h3>
            
            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Section Name</label>
              <input
                type="text"
                value={newSectionHeading}
                onChange={(e) => setNewSectionHeading(e.target.value)}
                placeholder="e.g., Languages, Volunteer Work, Awards"
                className="w-full px-3 py-2 text-black bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-sm font-medium text-gray-700">Section Type</label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="paragraph"
                    checked={newSectionType === 'paragraph'}
                    onChange={() => setNewSectionType('paragraph')}
                    className="mr-2"
                  />
                  <span className="text-sm text-black">📝 Paragraph - For longer text content</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="tags"
                    checked={newSectionType === 'tags'}
                    onChange={() => setNewSectionType('tags')}
                    className="mr-2"
                  />
                  <span className="text-sm text-black">🏷️ Tags - For skills, languages, or keywords</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="list"
                    checked={newSectionType === 'list'}
                    onChange={() => setNewSectionType('list')}
                    className="mr-2"
                  />
                  <span className="text-sm text-black">📋 List - For bullet points</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCustomSectionDialog(false);
                  setNewSectionHeading('');
                  setNewSectionType('paragraph');
                }}
                className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={addCustomSection}
                disabled={!newSectionHeading.trim()}
                className="flex-1 px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
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

export default TwoSideResume;
