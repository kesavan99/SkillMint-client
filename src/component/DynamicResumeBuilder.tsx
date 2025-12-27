import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const DynamicResumeBuilder: React.FC = () => {
  const navigate = useNavigate();

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
            <div className="p-4 transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl">
              <div 
                className="overflow-hidden transition-all duration-300 border-4 border-transparent rounded-lg cursor-pointer hover:border-green-500"
                onClick={() => navigate('/dynamic-resume-editor')}
              >
                <img 
                  src="/resume-1.png" 
                  alt="Resume Template 1" 
                  className="object-cover w-full h-auto"
                />
              </div>
              
              <div className="mt-3 text-center">
                <p className="text-sm font-medium text-gray-700">Classic Template</p>
                <p className="mt-1 text-xs text-gray-500">Professional & Clean</p>
              </div>
            </div>
            
            {/* Placeholder for future templates */}
            <div className="flex flex-col items-center justify-center p-4 transition-all duration-300 bg-white border-2 border-gray-300 border-dashed shadow-lg rounded-xl hover:border-green-300 hover:shadow-xl">
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
