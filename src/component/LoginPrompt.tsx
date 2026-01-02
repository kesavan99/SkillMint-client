import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../locales';

const LoginPrompt = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center backdrop-blur-sm p-4" style={{ backgroundColor: 'rgba(255, 255, 255, 0.3)' }}>
      <div className="relative w-full max-w-md p-8 mx-4 text-center transition-transform duration-300 transform scale-100 bg-white shadow-2xl rounded-2xl animate-fade-in">
        <div className="flex justify-center mb-6">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary-100">
            <svg 
              className="w-10 h-10 text-primary-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
              />
            </svg>
          </div>
        </div>
        
        <h2 className="mb-3 text-2xl font-bold text-gray-900">
          {t('loginPrompt.title') || 'Login Required'}
        </h2>
        
        <p className="mb-8 text-gray-600">
          {t('loginPrompt.message') || 'You need to login to access this feature. Please sign in to continue.'}
        </p>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/login')}
            className="w-full btn btn-primary"
          >
            {t('loginPrompt.loginButton') || 'Go to Login'}
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full px-4 py-2 text-gray-700 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {t('loginPrompt.backButton') || 'Back to Home'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPrompt;
