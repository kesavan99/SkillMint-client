import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../config/firebase';
import { applyActionCode } from 'firebase/auth';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SetPassword = () => {
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
          setError('Invalid or expired verification link.');
          setVerifying(false);
        }
      } else {
        setVerifying(false);
        setError('Invalid verification link.');
      }
    };

    verifyEmailLink();
  }, [mode, oobCode]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!email) {
      setError('Email is missing. Please use the link from your email.');
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
        setError(data.message || 'Failed to set password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
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
            Verifying Your Email...
          </h2>
          <p className="text-gray-700">
            Please wait while we verify your email address.
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
            Verification Failed
          </h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full btn btn-primary"
          >
            Back to Login
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
            Account Verified!
          </h2>
          <p className="text-gray-700">
            Your account has been successfully verified. Redirecting to login...
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
            Set Your Password
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Complete your registration by setting a password
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
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
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
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
            {loading ? 'Verifying...' : 'Set Password & Activate Account'}
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

export default SetPassword;
