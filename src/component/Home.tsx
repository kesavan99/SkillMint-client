import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import { useAuth } from '../service/authService';
import AmazonAdCard from './AmazonAdCard';
import { getProductsForPage } from '../constants/amazonProducts';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    localStorage.removeItem('resumeData');
    localStorage.removeItem('selectedTemplate');
  }, []);

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />

      <main className="px-5 py-16 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Ad - Hidden on mobile, visible on desktop */}
          <aside className="hidden lg:block lg:col-span-2">
            <AmazonAdCard product={getProductsForPage('home')[0]} />
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-8">
        {!isAuthenticated ? (
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl lg:text-6xl">
              Build Your Professional Resume
            </h1>
            <p className="mb-8 text-lg text-white text-gray-700 md:text-xl">
              Create stunning resumes with AI-powered tools, multiple templates, and intelligent job search integration.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 text-lg font-semibold text-white transition-all duration-300 rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 hover:shadow-xl"
              >
                Get Started Free
              </button>
              <button
                onClick={() => navigate('/about')}
                className="px-8 py-3 text-lg font-semibold text-gray-700 transition-all duration-300 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:border-gray-400 hover:shadow-xl"
              >
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-1 gap-8 mt-16 md:grid-cols-3">
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <div className="flex justify-center mb-4">
                  <img src="/professional-development.png" alt="Professional Templates" className="w-16 h-16" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">Professional Templates</h3>
                <p className="text-gray-600">Choose from multiple ATS-optimized resume templates</p>
              </div>
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <div className="flex justify-center mb-4">
                  <img src="/statistcs.png" alt="AI-Powered" className="w-16 h-16" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">AI-Powered Builder</h3>
                <p className="text-gray-600">Smart suggestions and content optimization</p>
              </div>
              <div className="p-6 bg-white shadow-lg rounded-xl">
                <div className="flex justify-center mb-4">
                  <img src="/abilities.png" alt="Job Search" className="w-16 h-16" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">Job Search Integration</h3>
                <p className="text-gray-600">Find opportunities across top job platforms</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid max-w-6xl grid-cols-1 gap-8 mx-auto md:grid-cols-2 lg:grid-cols-4">
          <div 
            className="p-8 transition-all duration-300 bg-white border border-transparent cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-purple-200 bg-gradient-to-br from-white to-purple-50"
            onClick={() => navigate('/profile')}
          >
            <div className="flex justify-center mb-5">
              <img src="/profile.png" alt="Profile" className="w-16 h-16" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-center text-gray-800">My Profile</h3>
            <p className="text-base leading-relaxed text-center text-gray-600">
              Manage your account details, designation, and area of interest.
            </p>
          </div>

          <div 
            className="p-8 transition-all duration-300 bg-white border border-transparent cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-blue-200 bg-gradient-to-br from-white to-blue-50"
            onClick={() => navigate('/resume-builder')}
          >
            <div className="flex justify-center mb-5">
              <img src="/cv.png" alt="Resume" className="w-16 h-16" />
            </div>
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
            <div className="flex justify-center mb-5">
              <img src="/paint-palette.png" alt="Dynamic Resume" className="w-16 h-16" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-center text-gray-800">Dynamic Resume Builder</h3>
            <p className="text-base leading-relaxed text-center text-gray-600">
              Create custom resumes with flexible section ordering. Choose what comes first - education, projects, or hobbies!
            </p>
          </div>

          <div 
            className="p-8 transition-all duration-300 bg-white border border-transparent cursor-pointer rounded-2xl hover:shadow-2xl hover:-translate-y-2 hover:border-green-200 bg-gradient-to-br from-white to-green-50"
            onClick={() => navigate('/job-search')}
          >
            <div className="flex justify-center mb-5">
              <img src="/job.png" alt="Job Search" className="w-16 h-16" />
            </div>
            <h3 className="mb-4 text-xl font-semibold text-center text-gray-800">Job Search</h3>
            <p className="text-base leading-relaxed text-center text-gray-600">
              Search for your dream job based on role, designation, and experience level.
            </p>
          </div>
        </div>
        )}

        {/* Job Search Feature Section - Visible to All */}
        <div className="px-5 py-16 mt-20 -mx-5 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <div className="flex justify-center mb-6">
                <img src="/job-portal-search.png" alt="Job Search" className="w-20 h-20 md:w-24 md:h-24" />
              </div>
              <h2 className="mb-4 text-3xl font-bold text-white md:text-4xl">Smart Job Search with ATS Scoring</h2>
              <p className="max-w-3xl mx-auto text-lg text-white/90 md:text-xl">
                Discover your perfect job match with our intelligent job search engine
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 gap-6 mb-12 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-6 transition-all duration-300 border-2 bg-white/10 backdrop-blur-sm border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-14 h-14 p-2 bg-white rounded-xl">
                    <img src="/cv.png" alt="Resume-Based Search" className="object-contain w-full h-full" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-center text-white">Resume-Based Search</h3>
                <p className="text-sm text-center text-white/80">Search jobs that match your resume profile and skills automatically</p>
              </div>

              <div className="p-6 transition-all duration-300 border-2 bg-white/10 backdrop-blur-sm border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-14 h-14 p-2 bg-white rounded-xl">
                    <img src="/target.png" alt="ATS Score Matching" className="object-contain w-full h-full" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-center text-white">ATS Score Matching</h3>
                <p className="text-sm text-center text-white/80">See real-time ATS compatibility scores for each job posting</p>
              </div>

              <div className="p-6 transition-all duration-300 border-2 bg-white/10 backdrop-blur-sm border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-14 h-14 p-2 bg-white rounded-xl">
                    <img src="/testing.png" alt="Customizable ATS Weights" className="object-contain w-full h-full" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-center text-white">Customizable ATS Weights</h3>
                <p className="text-sm text-center text-white/80">Adjust scoring criteria based on your priorities - skills, experience, projects & more</p>
              </div>

              <div className="p-6 transition-all duration-300 border-2 bg-white/10 backdrop-blur-sm border-white/20 rounded-xl hover:bg-white/20 hover:border-white/40">
                <div className="flex justify-center mb-4">
                  <div className="flex items-center justify-center w-14 h-14 p-2 bg-white rounded-xl">
                    <img src="/job-search.png" alt="Easy Apply" className="object-contain w-full h-full" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-center text-white">Easy Apply</h3>
                <p className="text-sm text-center text-white/80">Apply to jobs directly with one click - no complicated forms</p>
              </div>
            </div>

            {/* Job Platforms */}
            <div className="p-8 border-2 bg-white/10 backdrop-blur-md border-white/20 rounded-2xl">
              <h3 className="mb-6 text-xl font-semibold text-center text-white md:text-2xl">Search Across Top Job Platforms</h3>
              <div className="flex flex-wrap items-center justify-center gap-8 mb-8">
                <div className="flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-110">
                  <div className="flex items-center justify-center w-20 h-20 p-3 bg-white shadow-lg rounded-xl">
                    <img src="/linkedin.png" alt="LinkedIn" className="object-contain w-full h-full" />
                  </div>
                  <span className="text-sm font-medium text-white">LinkedIn</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-110">
                  <div className="flex items-center justify-center w-20 h-20 p-3 bg-white shadow-lg rounded-xl">
                    <img src="/indeed.png" alt="Indeed" className="object-contain w-full h-full" />
                  </div>
                  <span className="text-sm font-medium text-white">Indeed</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-110">
                  <div className="flex items-center justify-center w-20 h-20 p-3 bg-white shadow-lg rounded-xl">
                    <img src="/glassdoor.png" alt="Glassdoor" className="object-contain w-full h-full" />
                  </div>
                  <span className="text-sm font-medium text-white">Glassdoor</span>
                </div>
                <div className="flex flex-col items-center gap-2 transition-transform duration-300 hover:scale-110">
                  <div className="flex items-center justify-center w-20 h-20 p-3 bg-white shadow-lg rounded-xl">
                    <img src="/naukari.png" alt="Naukri" className="object-contain w-full h-full" />
                  </div>
                  <span className="text-sm font-medium text-white">Naukri</span>
                </div>
              </div>

              {/* Detailed Description */}
              <div className="p-6 mx-auto max-w-4xl bg-white/20 backdrop-blur-sm rounded-xl">
                <p className="mb-4 text-base leading-relaxed text-center text-white md:text-lg">
                  <span className="font-semibold">You can search jobs based on your resume</span> and apply easily with just one click. 
                  Our advanced system provides <span className="font-semibold">ATS score matching</span> for each job posting, showing you 
                  exactly how well your profile matches the job requirements.
                </p>
                <p className="mb-4 text-base leading-relaxed text-center text-white md:text-lg">
                  What makes it unique? <span className="font-semibold">You can also customize the ATS score calculation</span> by adjusting 
                  weights for different factors like skills (35%), experience (30%), projects (15%), keywords (10%), summary (5%), and 
                  education (5%). Tailor the scoring to what matters most for your career goals!
                </p>
                <div className="flex justify-center mt-6">
                  {isAuthenticated ? (
                    <button
                      onClick={() => navigate('/job-search')}
                      className="px-8 py-3 text-lg font-semibold text-purple-600 transition-all duration-300 bg-white rounded-lg shadow-lg hover:bg-gray-100 hover:shadow-xl hover:scale-105"
                    >
                      Start Job Search →
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/login')}
                      className="px-8 py-3 text-lg font-semibold text-purple-600 transition-all duration-300 bg-white rounded-lg shadow-lg hover:bg-gray-100 hover:shadow-xl hover:scale-105"
                    >
                      Sign Up to Start Searching →
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-16 mt-20 -mx-5 bg-gradient-to-r from-purple-100 via-blue-50 to-green-100">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-2xl font-bold text-center text-gray-900 md:text-3xl">Why Choose SkillMint?</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              <div className="p-6 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl">
                  <img src="/professional-development.png" alt="Professional Templates" className="w-10 h-10" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">Professional Templates</h3>
                <p className="text-sm text-gray-600 md:text-base">Choose from professionally designed resume templates that are optimized for ATS and crafted by industry experts.</p>
              </div>
              <div className="p-6 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl">
                  <img src="/statistcs.png" alt="AI-Powered Analysis" className="w-10 h-10" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">AI-Powered Analysis</h3>
                <p className="text-sm text-gray-600 md:text-base">Get intelligent AI analysis of your resume with personalized recommendations to improve content and presentation.</p>
              </div>
              <div className="p-6 text-center transition-all duration-300 bg-white shadow-lg rounded-xl hover:shadow-2xl hover:-translate-y-1">
                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl">
                  <img src="/target.png" alt="Career Ready" className="w-10 h-10" />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-gray-800 md:text-xl">Career Ready</h3>
                <p className="text-sm text-gray-600 md:text-base">Create standout resumes that help you land interviews and advance your career with confidence.</p>
              </div>
            </div>
          </div>
        </div>

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
      
          </div>

          {/* Right Ad - Desktop only */}
          <aside className="hidden lg:block lg:col-span-2">
            <AmazonAdCard product={getProductsForPage('home')[1]} />
          </aside>
        </div>

        {/* Mobile Ads - Bottom on mobile */}
        <div className="grid grid-cols-1 gap-4 mt-8 sm:grid-cols-2 lg:hidden">
          <AmazonAdCard product={getProductsForPage('home')[0]} />
          <AmazonAdCard product={getProductsForPage('home')[1]} />
        </div>

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