import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { saveResume } from '../client-configuration/resume-API';
import Navbar from './Navbar';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const TEMPLATES = [
  { id: 'resume-template', name: 'Classic Professional', description: 'Traditional format with clean layout', recommended: true },
  { id: 'resume-template-minimalist', name: 'Minimalist Modern', description: 'Clean design with whitespace focus' },
  { id: 'resume-template-two-column', name: 'Two-Column Accent', description: 'Sidebar layout with blue accent' },
  { id: 'resume-template-executive', name: 'Executive Traditional', description: 'Conservative style for senior roles' },
  { id: 'resume-template-skills-first', name: 'Skills-First Hybrid', description: 'Emphasizes technical competencies' },
  { id: 'resume-template-creative', name: 'Creative Infographic', description: 'Visual elements with gradient design' }
];

const ResumePreview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [showNameDialog, setShowNameDialog] = useState<boolean>(false);
  const [resumeName, setResumeName] = useState<string>('');
  const [editingResumeId, setEditingResumeId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Get resume data from location state or localStorage
  const getResumeData = () => {
    if (location.state?.resumeData) {
      // Save to localStorage for persistence
      localStorage.setItem('resumeData', JSON.stringify(location.state.resumeData));
      
      // Check if we're editing an existing resume
      if (location.state?.editingResumeId) {
        setEditingResumeId(location.state.editingResumeId);
        setResumeName(location.state.editingResumeName || '');
      }
      
      return location.state.resumeData;
    }
    const stored = localStorage.getItem('resumeData');
    return stored ? JSON.parse(stored) : null;
  };

  const getSelectedTemplate = () => {
    if (location.state?.selectedTemplate) {
      localStorage.setItem('selectedTemplate', location.state.selectedTemplate);
      return location.state.selectedTemplate;
    }
    return localStorage.getItem('selectedTemplate') || 'resume-template';
  };

  const [resumeData] = useState(getResumeData());
  const [selectedTemplate, setSelectedTemplate] = useState<string>(getSelectedTemplate());

  const generatePreview = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/resume/preview`,
        { ...resumeData, template: selectedTemplate },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );
      setPreviewHTML(response.data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to generate preview: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!resumeData) {
      navigate('/');
      return;
    }

    // Generate preview on mount or when template changes
    generatePreview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    localStorage.setItem('selectedTemplate', templateId);
  };

  const handleDownloadPDF = async () => {
    if (!previewRef.current) return;

    setLoading(true);
    try {
      const element = previewRef.current;
      
      const opt = {
        margin: 0,
        filename: `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`,
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

  const handleSaveResume = async () => {
    if (!resumeName.trim()) {
      alert('Please enter a resume name');
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    try {
      const saveData: any = { 
        resumeName: resumeName.trim(),
        ...resumeData, 
        template: selectedTemplate 
      };
      
      // If editing, include resumeId for update
      if (editingResumeId) {
        saveData.resumeId = editingResumeId;
      }
      
      const response = await saveResume(saveData);
      
      if (response.success) {
        setSaveSuccess(true);
        setShowNameDialog(false);
        
        // Update editingResumeId if this was a new save
        if (!editingResumeId && response.data?.resumeId) {
          setEditingResumeId(response.data.resumeId);
        }
        
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      alert('Failed to save resume: ' + errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenSaveDialog = () => {
    // Use existing name if editing, otherwise auto-generate default name
    if (!editingResumeId || !resumeName) {
      const defaultName = `${resumeData.personalInfo.name}'s Resume - ${new Date().toLocaleDateString()}`;
      setResumeName(defaultName);
    }
    setShowNameDialog(true);
  };

  if (!resumeData) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      {/* Header with Actions */}
      <div className="sticky top-0 z-50 shadow-md bg-gradient-to-r from-primary-600 to-purple-600">
        <div className="container px-4 py-4 mx-auto">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-white">Resume Preview</h1>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8 mx-auto">
        {/* Template Selection */}
        <div className="p-6 mb-6 bg-white shadow-xl rounded-2xl">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-800">Choose Resume Template</h2>
            <p className="text-sm text-gray-600">Select a professional template that matches your style</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {TEMPLATES.map((template) => (
              <div
                key={template.id}
                onClick={() => handleTemplateChange(template.id)}
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedTemplate === template.id
                    ? 'border-primary-600 bg-gradient-to-br from-primary-50 to-purple-50 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-primary-300 hover:shadow-md bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex flex-col">
                    <h3 className="font-semibold text-gray-800">{template.name}</h3>
                    {template.recommended && (
                      <span className="mt-1 text-xs font-semibold text-green-600">✨ Recommended</span>
                    )}
                  </div>
                  {selectedTemplate === template.id && (
                    <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Content */}
        <div className="py-8">
          <div className="flex justify-center">
            {loading && !previewHTML ? (
              <div className="p-12 text-center bg-white rounded-lg shadow-lg">
                <div className="w-16 h-16 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
                <p className="text-lg text-gray-600">Generating preview...</p>
              </div>
            ) : (
              <div ref={previewRef} className="shadow-2xl" style={{ maxWidth: 'fit-content' }}>
                <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 bg-white border-t">
        <div className="container px-4 py-6 mx-auto">
          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
            <button
              onClick={handleOpenSaveDialog}
              className="w-full px-4 py-2 text-base font-semibold text-white transition-colors rounded-lg md:w-auto md:px-8 md:py-3 md:text-lg bg-primary-600 hover:bg-primary-700"
            >
              💾 Save Resume
            </button>
            
            {saveSuccess && (
              <div className="flex items-center gap-2 px-4 py-2 text-sm text-green-800 bg-green-100 border border-green-300 rounded-lg md:text-base">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Resume saved successfully!
              </div>
            )}
            
            <button
              onClick={handleDownloadPDF}
              disabled={loading}
              className="w-full px-4 py-2 text-base font-semibold text-white transition-colors bg-green-600 rounded-lg md:w-auto md:px-8 md:py-3 md:text-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Generating...' : '📥 Download PDF'}
            </button>
          </div>
        </div>
      </div>

      {/* Save Resume Name Dialog */}
      {showNameDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">
              {editingResumeId ? 'Update Resume' : 'Save Resume'}
            </h3>
            <p className="mb-4 text-sm text-gray-600">Give your resume a name to easily identify it later.</p>
            
            <input
              type="text"
              value={resumeName}
              onChange={(e) => setResumeName(e.target.value)}
              placeholder="e.g., Software Engineer Resume"
              className="w-full px-4 py-3 mb-6 text-black bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              autoFocus
            />
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowNameDialog(false);
                }}
                className="flex-1 px-4 py-2 font-medium text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveResume}
                disabled={saving || !resumeName.trim()}
                className="flex-1 px-4 py-2 font-medium text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : editingResumeId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumePreview;
