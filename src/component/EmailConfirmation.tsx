import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const EmailConfirmation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
      setError('Please enter your password.');
      return;
    }

    // For password reset, require password confirmation
    if (type === 'reset') {
      if (!confirmPassword) {
        setError('Please confirm your password.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
    }

    if (!email || !token) {
      setError('Invalid confirmation link.');
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
        setError(data.message || (type === 'reset' ? 'Password reset failed.' : 'Confirmation failed. Please check your password.'));
      }
    } catch (err) {
      setError('An unexpected error occurred.');
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
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#19B86B' }}>
            {type === 'reset' ? 'Reset Your Password' : 'Confirm Your Email'}
          </h2>
          <p className="text-sm text-gray-600">
            {type === 'reset' 
              ? 'Enter your new password below' 
              : 'Enter your password to activate your account'}
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
              Email
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
              {type === 'reset' ? 'New Password' : 'Password'}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={type === 'reset' ? 'Enter new password' : 'Enter your password'}
              required
              disabled={loading}
              minLength={type === 'reset' ? 6 : undefined}
              className="input"
            />
            <p className="text-xs text-gray-500">
              {type === 'reset' 
                ? 'Must be at least 6 characters long' 
                : 'Enter the password you used during signup'}
            </p>
          </div>

          {type === 'reset' && (
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
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
              ? (type === 'reset' ? 'Resetting...' : 'Confirming...') 
              : (type === 'reset' ? 'Reset Password' : 'Confirm & Activate Account')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            type="button" 
            className="text-sm font-semibold transition-colors duration-200 hover:underline"
            style={{ color: '#19B86B' }}
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
