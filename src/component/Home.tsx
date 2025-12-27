import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';

const Home: React.FC = () => {
  const navigate = useNavigate();

  // Clear resume data when returning to home
  useEffect(() => {
    localStorage.removeItem('resumeData');
    localStorage.removeItem('selectedTemplate');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />

      <main className="px-5 py-16 mx-auto max-w-7xl">
        <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4">
          <div 
            className="p-8 transition-all duration-300 bg-white border border-transparent cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-purple-200 bg-gradient-to-br from-white to-purple-50"
            onClick={() => navigate('/profile')}
          >
            <div className="mb-5 text-5xl text-center">👤</div>
            <h3 className="mb-4 text-xl font-semibold text-center text-gray-800">My Profile</h3>
            <p className="text-base leading-relaxed text-center text-gray-600">
              Manage your account details, designation, and area of interest.
            </p>
          </div>

          <div 
            className="p-8 transition-all duration-300 bg-white border border-transparent cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200 bg-gradient-to-br from-white to-blue-50"
            onClick={() => navigate('/resume-builder')}
          >
            <div className="mb-5 text-5xl text-center">📄</div>
            <h3 className="mb-4 text-xl font-semibold text-center text-gray-800">Resume Builder</h3>
            <p className="text-base leading-relaxed text-center text-gray-600">
              Create professional resumes with our AI-powered builder and choose from multiple templates.
            </p>
          </div>

          <div 
            className="relative p-8 transition-all duration-300 bg-white border border-transparent cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-amber-200 bg-gradient-to-br from-white to-amber-50"
            onClick={() => navigate('/dynamic-resume-builder')}
          >
            <div className="absolute top-4 right-4">
              <span className="px-3 py-1 text-xs font-bold rounded-full shadow-md text-amber-900 bg-gradient-to-r from-amber-300 to-yellow-400">
                ✨ NEW
              </span>
            </div>
            <div className="mb-5 text-5xl text-center">🎨</div>
            <h3 className="mb-4 text-xl font-semibold text-center text-gray-800">Dynamic Resume Builder</h3>
            <p className="text-base leading-relaxed text-center text-gray-600">
              Create custom resumes with flexible section ordering. Choose what comes first - education, projects, or hobbies!
            </p>
          </div>

          <div 
            className="p-8 transition-all duration-300 bg-white border border-transparent cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-green-200 bg-gradient-to-br from-white to-green-50"
            onClick={() => navigate('/job-search')}
          >
            <div className="mb-5 text-5xl text-center">💼</div>
            <h3 className="mb-4 text-xl font-semibold text-center text-gray-800">Job Search</h3>
            <p className="text-base leading-relaxed text-center text-gray-600">
              Search for your dream job based on role, designation, and experience level.
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-5 py-16 mt-20 -mx-5 bg-gradient-to-r from-purple-100 via-blue-50 to-green-100">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-2xl font-bold text-center text-gray-900 md:text-3xl">Why Choose SkillMint?</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <div className="p-6 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl">🎓</div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">Professional Templates</h3>
                <p className="text-sm text-gray-600 md:text-base">Choose from professionally designed resume templates that are optimized for ATS and crafted by industry experts.</p>
              </div>
              <div className="p-6 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl">⚡</div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600 md:text-base">Get intelligent AI analysis of your resume with personalized recommendations to improve content and presentation.</p>
              </div>
              <div className="p-6 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl bg-gradient-to-br from-green-400 to-green-600 rounded-2xl">🚀</div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">Career Ready</h3>
                <p className="text-sm text-gray-600 md:text-base">Create standout resumes that help you land interviews and advance your career with confidence.</p>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="max-w-4xl py-16 mx-auto">
          <h2 className="mb-8 text-2xl font-bold text-center text-gray-900 md:text-3xl">About SkillMint</h2>
          <div className="p-6 space-y-6 leading-relaxed text-gray-700 bg-white shadow-lg md:p-8 rounded-2xl">
            <p>
              SkillMint is an AI-powered platform designed to help job seekers create professional, compelling resumes that stand out 
              to recruiters and hiring managers. Our mission is to simplify the resume creation process while ensuring your professional 
              story is told effectively.
            </p>
            <p>
              Our intelligent resume builder combines professional templates with AI-powered analysis to help you create ATS-friendly 
              resumes. Get personalized recommendations, identify skill gaps, and receive actionable suggestions to improve your resume 
              content and maximize your chances of landing interviews.
            </p>
            <p>
              Whether you're a fresh graduate entering the job market, an experienced professional seeking new opportunities, or someone 
              making a career transition, SkillMint provides the tools you need to present your best professional self.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-10 pb-6 mt-20 border-t border-white/20">
          <div className="grid grid-cols-1 gap-8 mx-auto max-w-7xl md:grid-cols-3">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">SkillMint</h3>
              <p className="text-sm text-white/90">
                Empowering job seekers to build better careers through professional, AI-powered resume creation.
              </p>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="/about" className="text-white/90 hover:text-white">About Us</a></li>
                <li><a href="/privacy" className="text-white/90 hover:text-white">Privacy Policy</a></li>
                <li><a href="/terms" className="text-white/90 hover:text-white">Terms of Service</a></li>
                <li><a href="/contact" className="text-white/90 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Features</h3>
              <ul className="space-y-2 text-sm">
                <li className="text-white/90">AI-Powered Resume Builder</li>
                <li className="text-white/90">Professional Resume Templates</li>
                <li className="text-white/90">Intelligent Resume Analysis</li>
                <li className="text-white/90">ATS-Optimized Formats</li>
              </ul>
            </div>
          </div>
          <div className="pt-8 mx-auto mt-8 text-center border-t border-white/20">
            <p className="mb-3 text-sm text-white/90">© 2025 SkillMint. All rights reserved.</p>
            <div className="flex justify-center gap-4 text-xs text-white/80">
              <a href="/privacy" className="hover:text-white">Privacy Policy</a>
              <span>|</span>
              <a href="/terms" className="hover:text-white">Terms of Service</a>
              <span>|</span>
              <a href="/contact" className="hover:text-white">Contact</a>
              <span>|</span>
              <a href="/ads.txt" target="_blank" rel="noopener noreferrer" className="hover:text-white">Ads.txt</a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Home;
