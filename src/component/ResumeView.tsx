import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import { getResumeById } from '../client-configuration/resume-API';
import Navbar from './Navbar';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const ResumeView: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const [previewHTML, setPreviewHTML] = useState<string>('');
  const [resumeName, setResumeName] = useState<string>('');
  const [templateName, setTemplateName] = useState<string>('');
  const [isDynamic, setIsDynamic] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState<boolean>(false);

  useEffect(() => {
    loadResumePreview();
  }, [resumeId]);

  const loadResumePreview = async () => {
    if (!resumeId) {
      navigate('/profile');
      return;
    }

    try {
      setLoading(true);
      const response = await getResumeById(resumeId);
      
      if (response.success && response.data) {
        setResumeName(response.data.resumeName);
        setTemplateName(response.data.templateName);
        setIsDynamic(response.data.isDynamic || false);
        
        // Generate HTML preview from resume data
        const htmlResponse = await axios.post(
          `${API_URL}/api/resume/preview`,
          { ...response.data.resumeData, template: response.data.templateName },
          { withCredentials: true }
        );
        
        setPreviewHTML(htmlResponse.data);
      }
    } catch (error) {
      alert('Failed to load resume. Redirecting to profile...');
      navigate('/profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!previewHTML) return;

    setDownloading(true);
    try {
      const element = document.getElementById('resume-preview-content');
      if (!element) return;

      const opt = {
        margin: 0,
        filename: `${resumeName.replace(/\s+/g, '_')}.pdf`,
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
      alert('Failed to generate PDF');
    } finally {
      setDownloading(false);
    }
  };

  const handleEdit = () => {
    // Navigate to the appropriate editor based on resume type
    if (isDynamic) {
      navigate(`/dynamic-resume-editor?resumeId=${resumeId}`);
    } else {
      navigate(`/resume-builder?resumeId=${resumeId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="p-12 text-center bg-white rounded-lg shadow-lg">
            <div className="w-16 h-16 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary-600"></div>
            <p className="text-lg text-gray-600">Loading resume...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <div className="container px-4 py-8 mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 text-xl font-bold text-gray-900 md:text-3xl">{resumeName}</h1>
          <p className="text-sm text-gray-600 md:text-base">Template: {templateName}</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8 md:flex-row md:gap-4">
          <button
            onClick={handleEdit}
            className="w-full px-4 py-2 text-base font-semibold text-white transition-colors rounded-lg md:w-auto md:px-6 md:py-3 bg-primary-600 hover:bg-primary-700"
          >
            ✏️ Edit Resume
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="w-full px-4 py-2 text-base font-semibold text-white transition-colors bg-green-600 rounded-lg md:w-auto md:px-6 md:py-3 hover:bg-green-700 disabled:bg-gray-400"
          >
            {downloading ? 'Generating...' : '📥 Download PDF'}
          </button>
        </div>

        {/* Preview */}
        <div className="flex justify-center py-8">
          <div id="resume-preview-content" className="shadow-2xl" style={{ maxWidth: 'fit-content' }}>
            <div dangerouslySetInnerHTML={{ __html: previewHTML }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeView;
