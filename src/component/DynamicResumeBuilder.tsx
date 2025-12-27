import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Navbar from './Navbar';
import OptimizedImage from './OptimizedImage';

const DynamicResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // If format and resumeId are in URL, redirect to appropriate editor
  useEffect(() => {
    const format = searchParams.get('format');
    const resumeId = searchParams.get('resumeId');
    
    if (format && resumeId) {
      if (format === 'two-side') {
        navigate(`/two-side-resume?resumeId=${resumeId}`, { replace: true });
      } else if (format === 'classic') {
        navigate(`/dynamic-resume-editor?resumeId=${resumeId}`, { replace: true });
      }
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="px-5 py-16 mx-auto max-w-7xl">
        <div className="max-w-4xl mx-auto">
          {/* Heading Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-3 text-4xl font-bold text-gray-900">
              Start building your resume
            </h1>
            <p className="text-xl text-gray-600">
              Choose a design you like. You can customize or switch it later.
            </p>
          </div>

          {/* Resume Template Selection */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col p-4 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl">
              <div 
                className="flex items-center justify-center overflow-hidden transition-all duration-300 border-4 border-transparent rounded-lg cursor-pointer h-96 bg-gray-50 hover:border-green-500"
                onClick={() => navigate('/dynamic-resume-editor')}
              >
                <OptimizedImage
                  src="/resume-1.png" 
                  alt="Resume Template 1" 
                  width={600}
                  quality={85}
                  fit="contain"
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-gray-700">Classic Template</p>
                <p className="mt-1 text-xs text-gray-500">Professional & Clean</p>
              </div>
            </div>

            
            <div className="flex flex-col p-4 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl">
              <div 
                className="flex items-center justify-center overflow-hidden transition-all duration-300 border-4 border-transparent rounded-lg cursor-pointer h-96 bg-gray-50 hover:border-green-500"
                onClick={() => navigate('/two-side-resume')}
              >
                <OptimizedImage
                  src="/resume-2.png" 
                  alt="Resume Template 2" 
                  width={600}
                  quality={85}
                  fit="contain"
                  className="object-contain w-full h-full"
                />
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-gray-700">Modern Template</p>
                <p className="mt-1 text-xs text-gray-500">Contemporary & Bold</p>
              </div>
            </div>
            
            {/* Placeholder for future templates */}
            <div className="flex flex-col items-center justify-center p-4 transition-all duration-300 bg-white border-2 border-gray-300 border-dashed shadow-lg rounded-xl hover:border-green-300 hover:shadow-xl h-96">
              <div className="mb-2 text-4xl text-gray-300">➕</div>
              <p className="text-sm font-medium text-gray-400">More templates</p>
              <p className="mt-1 text-xs text-gray-400">Coming soon</p>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 text-white transition-all duration-300 bg-purple-600 rounded-lg hover:bg-purple-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DynamicResumeBuilder;
