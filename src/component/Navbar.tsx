import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../service/authService";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    // Clear resume data on logout
    localStorage.removeItem('resumeData');
    localStorage.removeItem('selectedTemplate');
    navigate('/login');
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    navigate('/home');
  };

  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-white border-b border-gray-200 navbar">
      <div className="flex items-center justify-between px-5 py-4 mx-auto max-w-7xl">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={handleLogoClick}
        >
          <img 
            src="/logo.png" 
            alt="SkillMint Logo" 
            className="h-10 transition-transform hover:scale-105" 
            style={{ width: 'auto' }} 
          />
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="items-center hidden gap-6 ml-auto md:flex">
          <button 
            onClick={() => navigate('/home')}
            className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Home
          </button>
          <button 
            onClick={() => navigate('/resume-builder')}
            className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Resume
          </button>
          <button 
            onClick={() => navigate('/dynamic-resume-builder')}
            className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Dynamic Resume
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Profile
          </button>
          <button 
            onClick={() => navigate('/job-search')}
            className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Job Search
          </button>
          <button 
            onClick={() => navigate('/about')}
            className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            About
          </button>
          <button 
            onClick={() => navigate('/contact')}
            className="text-base font-medium text-gray-700 transition-colors hover:text-primary-600"
          >
            Contact
          </button>
          <button 
            onClick={handleLogout} 
            className="btn btn-primary"
          >
            Logout
          </button>
        </nav>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-gray-700 md:hidden hover:text-primary-600"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-gray-200 md:hidden">
          <nav className="flex flex-col px-5 py-3 space-y-2">
            <button
              onClick={() => handleNavClick('/home')}
              className="px-4 py-3 text-base font-medium text-left text-gray-700 transition-colors rounded-lg hover:bg-primary-50 hover:text-primary-600"
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('/resume-builder')}
              className="px-4 py-3 text-base font-medium text-left text-gray-700 transition-colors rounded-lg hover:bg-primary-50 hover:text-primary-600"
            >
              Resume
            </button>
            <button
              onClick={() => handleNavClick('/dynamic-resume-builder')}
              className="px-4 py-3 text-base font-medium text-left text-gray-700 transition-colors rounded-lg hover:bg-primary-50 hover:text-primary-600"
            >
              Dynamic Resume
            </button>
            <button
              onClick={() => handleNavClick('/profile')}
              className="px-4 py-3 text-base font-medium text-left text-gray-700 transition-colors rounded-lg hover:bg-primary-50 hover:text-primary-600"
            >
              Profile
            </button>
            <button
              onClick={() => handleNavClick('/job-search')}
              className="px-4 py-3 text-base font-medium text-left text-gray-700 transition-colors rounded-lg hover:bg-primary-50 hover:text-primary-600"
            >
              Job Search
            </button>
            <button
              onClick={() => handleNavClick('/about')}
              className="px-4 py-3 text-base font-medium text-left text-gray-700 transition-colors rounded-lg hover:bg-primary-50 hover:text-primary-600"
            >
              About
            </button>
            <button
              onClick={() => handleNavClick('/contact')}
              className="px-4 py-3 text-base font-medium text-left text-gray-700 transition-colors rounded-lg hover:bg-primary-50 hover:text-primary-600"
            >
              Contact
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-3 text-base font-medium text-left text-white transition-colors rounded-lg bg-primary-600 hover:bg-primary-700"
            >
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
