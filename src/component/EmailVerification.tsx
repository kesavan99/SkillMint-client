import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../locales';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const email = searchParams.get('email');
  const type = searchParams.get('type') || 'verify'; // 'verify' or 'reset'

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const isPasswordReset = type === 'reset';

  return (
    <div className="flex items-center justify-center min-h-screen p-5" style={{ backgroundColor: '#ffffff' }}>
      <div className="w-full max-w-md card animate-slide-in">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="SkillMint Logo" className="h-12" style={{ width: 'auto' }} />
          </div>
          <h2 className="mb-4 text-3xl font-bold" style={{ color: '#19B86B' }}>
            {isPasswordReset ? t('auth.resetYourPasswordTitle') : t('auth.verifyYourEmail')}
          </h2>
        </div>

        <div className="mb-6 text-center">
          <div className="mb-6">
            <svg 
              className="w-20 h-20 mx-auto mb-4" 
              fill="none" 
              stroke="#19B86B" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
          </div>
          
          <p className="mb-4 text-lg text-gray-700">
            {isPasswordReset 
              ? t('auth.passwordResetLinkSent')
              : t('auth.verificationLinkSent')}
          </p>
          <p className="mb-6 text-lg font-semibold" style={{ color: '#19B86B' }}>
            {email || t('auth.yourEmailAddress')}
          </p>
          
          <p className="mb-6 text-sm text-gray-600">
            {isPasswordReset
              ? t('auth.checkEmailClickReset')
              : t('auth.checkEmailClickVerify')}
          </p>
          
          <div className="p-4 mb-6 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-700">
              <strong>{t('auth.noteLabel')}</strong> {isPasswordReset ? t('auth.resetLinkExpires') : t('auth.verificationLinkExpires')}
            </p>
          </div>
        </div>

        <button
          onClick={handleBackToLogin}
          className="w-full btn btn-primary"
        >
          {t('auth.backToLogin')}
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {t('auth.didNotReceive')}{' '}
            <button 
              type="button" 
              className="font-semibold transition-colors duration-200 hover:underline"
              style={{ color: '#19B86B' }}
            >
              {t('auth.resend')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
