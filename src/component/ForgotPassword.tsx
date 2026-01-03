import React, { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendPasswordResetEmail } from '../service/firebaseAuthService';
import { useTranslation } from '../locales';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError(t('auth.pleaseEnterEmailAddress'));
      return;
    }

    setLoading(true);

    try {
      // Request password reset token from backend
      const response = await fetch(`${BASE_URL}/skill-mint/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.status === 429) {
        setError('Multiple password reset attempts detected. Your request has been temporarily blocked for security reasons. Please try again after 5 minutes.');
        setLoading(false);
        return;
      }

      if (response.ok && data.status === 'success') {
        const resetToken = data.data.resetToken;
        
        try {
          // Send Firebase email with reset link (same as signup verification)
          const resetUrl = `${window.location.origin}/login/token?email=${encodeURIComponent(email)}&token=${resetToken}&type=reset`;
          await sendPasswordResetEmail(email, resetUrl);
          
          setSuccess(t('auth.resetLinkSent'));
          setEmail('');
          
          // Redirect to email verification info page
          setTimeout(() => {
            navigate(`/email-verification?email=${encodeURIComponent(email)}&type=reset`);
          }, 2000);
        } catch (firebaseErr: any) {
          setError(t('auth.failedToSendResetEmail'));
        }
      } else {
        // For security, show success even if email doesn't exist
        setSuccess(t('auth.resetEmailSent'));
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(t('auth.errorOccurred'));
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
          <h2 className="mb-2 text-3xl font-bold" style={{ color: '#19B86B' }}>
            {t('auth.forgotPasswordTitle')}
          </h2>
          <p className="text-gray-600">
            {t('auth.enterEmailForReset')}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {success && (
            <div className="p-4 mb-4 text-sm border border-green-200 rounded-lg bg-green-50" style={{ color: '#19B86B' }}>
              {success}
            </div>
          )}
          
          {error && (
            <div className="banner-error animate-shake">
              {error}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="font-medium text-gray-700">
              {t('auth.emailAddressLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.enterYourEmail')}
              className="input"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 transition-all rounded-lg btn-primary disabled:opacity-50"
          >
            {loading ? t('auth.sending') : t('auth.sendResetLink')}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm text-gray-600 underline hover:text-gray-800"
            >
              {t('auth.backToLogin')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
