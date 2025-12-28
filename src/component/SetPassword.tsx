import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../config/firebase';
import { applyActionCode } from 'firebase/auth';
import { useTranslation } from '../locales';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SetPassword = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode'); // Firebase action code
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    const verifyEmailLink = async () => {
      if (mode === 'verifyEmail' && oobCode) {
        try {
          // Verify the email with Firebase
          await applyActionCode(auth, oobCode);
          
          // Extract email from Firebase user if available
          if (auth.currentUser) {
            setEmail(auth.currentUser.email || '');
          }
          
          setVerifying(false);
        } catch (err: any) {
          setError(t('auth.invalidVerificationLink'));
          setVerifying(false);
        }
      } else {
        setVerifying(false);
        setError(t('auth.invalidLink'));
      }
    };

    verifyEmailLink();
  }, [mode, oobCode]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }

    if (password.length < 6) {
      setError(t('auth.passwordTooShort'));
      return;
    }

    if (!email) {
      setError(t('auth.emailMissing'));
      return;
    }

    setLoading(true);

    try {
      // Update password in backend
      const response = await fetch(`${BASE_URL}/skill-mint/set-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, confirmPassword })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || t('auth.passwordSetFailedMessage'));
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex items-center justify-center min-h-screen p-5" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-full max-w-md card animate-slide-in text-center">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 border-4 border-t-4 rounded-full animate-spin" 
                 style={{ borderColor: '#19B86B', borderTopColor: 'transparent' }}>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#19B86B' }}>
            {t('auth.verifyingEmailTitle')}
          </h2>
          <p className="text-gray-700">
            {t('auth.verifyingEmailMessage')}
          </p>
        </div>
      </div>
    );
  }

  if (error && verifying === false && !email) {
    return (
      <div className="flex items-center justify-center min-h-screen p-5" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-full max-w-md card animate-slide-in text-center">
          <div className="mb-6">
            <svg 
              className="w-20 h-20 mx-auto mb-4" 
              fill="none" 
              stroke="#EF4444" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-red-600">
            {t('auth.verificationFailedTitle')}
          </h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full btn btn-primary"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen p-5" style={{ backgroundColor: '#ffffff' }}>
        <div className="w-full max-w-md card animate-slide-in text-center">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#19B86B' }}>
            {t('auth.accountVerifiedTitle')}
          </h2>
          <p className="text-gray-700">
            {t('auth.accountVerifiedMessage')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-5" style={{ backgroundColor: '#ffffff' }}>
      <div className="w-full max-w-md card animate-slide-in">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="SkillMint Logo" className="h-12" style={{ width: 'auto' }} />
          </div>
          <h2 className="text-3xl font-bold" style={{ color: '#19B86B' }}>
            {t('auth.setPasswordTitle')}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {t('auth.setPasswordSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="banner-error animate-shake">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label 
              htmlFor="email"
              className="text-sm font-medium text-gray-700"
            >
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={email || ''}
              disabled
              className="input bg-gray-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label 
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              {t('auth.passwordLabel')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              required
              disabled={loading}
              minLength={6}
              className="input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label 
              htmlFor="confirmPassword"
              className="text-sm font-medium text-gray-700"
            >
              {t('auth.confirmPasswordLabel')}
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              required
              disabled={loading}
              minLength={6}
              className="input"
            />
          </div>

          <button 
            type="submit" 
            className="mt-3 btn btn-primary"
            disabled={loading}
          >
            {loading ? t('auth.verifying') : t('auth.setPasswordActivate')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            className="text-sm font-semibold transition-colors duration-200 hover:underline"
            style={{ color: '#19B86B' }}
            onClick={() => navigate('/login')}
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SetPassword;
