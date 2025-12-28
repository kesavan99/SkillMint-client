import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from '../locales';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [type, setType] = useState(''); // 'reset' or 'verify'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Parse email, token, and type from URL
    // Check continueUrl first (from Firebase redirect)
    const continueUrl = searchParams.get('continueUrl');
    if (continueUrl) {
      try {
        const url = new URL(continueUrl);
        const emailFromUrl = url.searchParams.get('email');
        const tokenFromUrl = url.searchParams.get('token');
        const typeFromUrl = url.searchParams.get('type');
        if (emailFromUrl) setEmail(decodeURIComponent(emailFromUrl));
        if (tokenFromUrl) setToken(tokenFromUrl);
        if (typeFromUrl) setType(typeFromUrl);
      } catch (err) {
        console.error('Invalid continueUrl:', err);
      }
    }
    
    // Fallback to direct params
    if (!email || !token) {
      const directEmail = searchParams.get('email');
      const directToken = searchParams.get('token');
      const directType = searchParams.get('type');
      if (directEmail && directEmail !== '%EMAIL%') setEmail(decodeURIComponent(directEmail));
      if (directToken) setToken(directToken);
      if (directType) setType(directType);
    }
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (!password) {
      setError(t('auth.pleaseEnterPassword'));
      return;
    }

    // For password reset, require password confirmation
    if (type === 'reset') {
      if (!confirmPassword) {
        setError(t('auth.pleaseConfirmPassword'));
        return;
      }
      if (password !== confirmPassword) {
        setError(t('auth.passwordsDoNotMatch'));
        return;
      }
      if (password.length < 6) {
        setError(t('auth.passwordTooShortSignup'));
        return;
      }
    }

    if (!email || !token) {
      setError(t('auth.invalidConfirmationLink'));
      return;
    }

    setLoading(true);

    try {
      // Verify email with password or reset password
      const response = await fetch(`${BASE_URL}/skill-mint/confirm-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, token, password, type })
      });

      const data = await response.json();

      if (response.ok && data.status === 'success') {
        // Redirect to login page with success message
        const message = type === 'reset' ? 'reset=true' : 'verified=true';
        navigate(`/login?${message}`);
      } else {
        setError(data.message || (type === 'reset' ? t('auth.passwordResetFailed') : t('auth.confirmationFailed')));
      }
    } catch (err) {
      setError(t('auth.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-5" style={{ backgroundColor: '#ffffff' }}>
      <div className="w-full max-w-md card animate-slide-in">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo.png" alt="SkillMint Logo" className="h-12" style={{ width: 'auto' }} />
          </div>
          <h2 className="mb-4 text-3xl font-bold" style={{ color: '#19B86B' }}>
            {type === 'reset' ? t('auth.resetYourPassword') : t('auth.confirmYourEmail')}
          </h2>
          <p className="text-sm text-gray-600">
            {type === 'reset' 
              ? t('auth.enterNewPassword') 
              : t('auth.enterPasswordToActivate')}
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
              {t('auth.email')}
            </label>
            <input
              type="email"
              id="email"
              value={email || ''}
              disabled
              className="bg-gray-100 input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label 
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              {type === 'reset' ? t('auth.newPassword') : t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={type === 'reset' ? t('auth.newPasswordPlaceholder') : t('auth.enterYourPassword')}
              required
              disabled={loading}
              minLength={type === 'reset' ? 6 : undefined}
              className="input"
            />
            <p className="text-xs text-gray-500">
              {type === 'reset' 
                ? t('auth.passwordMinLength') 
                : t('auth.passwordUsedDuringSignup')}
            </p>
          </div>

          {type === 'reset' && (
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                {t('auth.confirmNewPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmNewPasswordPlaceholder')}
                required
                disabled={loading}
                minLength={6}
                className="input"
              />
            </div>
          )}

          <button 
            type="submit" 
            className="mt-3 btn btn-primary"
            disabled={loading}
          >
            {loading 
              ? (type === 'reset' ? t('auth.resetting') : t('auth.confirming')) 
              : (type === 'reset' ? t('auth.resetPasswordButton') : t('auth.confirmActivateAccount'))}
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

export default EmailConfirmation;
