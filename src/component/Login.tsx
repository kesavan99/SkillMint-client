import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../service/authService';
import { signInWithGooglePopup, createUserWithEmail } from '../service/firebaseAuthService';
import { useTranslation } from '../locales';

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  useEffect(() => {
    // Check if redirected after email verification or password reset
    if (searchParams.get('verified') === 'true') {
      setSuccess(t('auth.emailVerifiedSuccess'));
    } else if (searchParams.get('reset') === 'true') {
      setSuccess(t('auth.passwordResetSuccess'));
    }
  }, [searchParams, t]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    
    try {
      const result = await signInWithGooglePopup();
      const user = result.user;
      
      
      // Send Google sign-in data to backend
      const response = await fetch(`${BASE_URL}/skill-mint/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: user.email, 
          name: user.displayName,
          googleId: user.uid
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        setError('Multiple login attempts detected. Your account has been temporarily frozen for security reasons. Please try again after 5 minutes.');
        return;
      }

      if (response.ok && data.status === 'success') {
        // Check if user needs to set a password
        if (data.needsPassword) {
          // New Google user - redirect to password setup page
          navigate(`/google-set-password?email=${encodeURIComponent(user.email || '')}&name=${encodeURIComponent(user.displayName || '')}`);
        } else {
          // Existing user - store data and redirect to home with full page reload
          localStorage.setItem('userEmail', user.email || '');
          localStorage.setItem('userName', user.displayName || '');
          window.location.href = '/';
        }
      } else {
        setError(data.message || t('auth.googleSignInFailed'));
      }
    } catch (err) {
      if (err instanceof Error) {
        // Handle rate limiting
        if (err.message.includes('Too many requests') || err.message.includes('rate limit')) {
          setError(t('auth.tooManyRequests'));
        }
        // Handle specific Firebase errors
        else if (err.message.includes('popup-closed-by-user')) {
          setError(t('auth.signInCancelled'));
        } else if (err.message.includes('network-request-failed')) {
          setError(t('auth.networkError'));
        } else {
          setError(t('auth.failedGoogleSignIn'));
        }
      } else {
        setError(t('auth.unexpectedGoogleError'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${BASE_URL}/skill-mint/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: adminUsername, 
          password: adminPassword 
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        setError('Multiple login attempts detected. Your account has been temporarily frozen for security reasons. Please try again after 5 minutes.');
        return;
      }

      if (response.ok && data.status === 'success') {
        // Admin authenticated - redirect to admin home page
        window.location.href = '/admin-home';
      } else {
        setError(data.message || t('auth.invalidAdminCredentials'));
      }
    } catch (err) {
      console.error(err);
      setError(t('auth.failedAdminLogin'));
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Prevent multiple submissions
    if (loading || isSubmitting) return;

    if (isSignUp) {
      // Validate passwords match
      if (password !== confirmPassword) {
        setError(t('auth.passwordsDoNotMatch'));
        return;
      }

      // Validate password length
      if (password.length < 6) {
        setError(t('auth.passwordTooShortSignup'));
        return;
      }

      // Handle signup with email verification
      setLoading(true);
      setIsSubmitting(true);
      try {
        
        // Register user in backend with status = 'inactive'
        const response = await fetch(`${BASE_URL}/skill-mint/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            name, 
            email, 
            password,
            newOne: true 
          })
        });

        const data = await response.json();

        if (response.status === 429) {
          setError('Multiple signup attempts detected. Your request has been temporarily blocked for security reasons. Please try again after 5 minutes.');
          setLoading(false);
          setIsSubmitting(false);
          return;
        }

        if (response.ok && data.status === 'success') {
          
          // Get verification token from response
          const token = data.data.verificationToken;
          
          try {
            // Create user in Firebase and send custom verification email
            const verificationUrl = `${window.location.origin}/login/token?email=${encodeURIComponent(email)}&token=${token}`;
            await createUserWithEmail(email, verificationUrl);
            
            // Redirect to email verification page
            navigate(`/email-verification?email=${encodeURIComponent(email)}`);
          } catch (firebaseErr: any) {
            // If Firebase email fails, show error
            setError(t('auth.failedVerificationEmail'));
            setLoading(false);
            setIsSubmitting(false);
          }
        } else {
          setError(data.message || t('auth.signupFailed'));
          setLoading(false);
          setIsSubmitting(false);
        }
      } catch (err: any) {
        if (err.code === 'auth/email-already-in-use') {
          setError(t('auth.emailAlreadyRegistered'));
        } else {
          setError(t('auth.failedCreateAccount'));
        }
        setLoading(false);
        setIsSubmitting(false);
      } finally {
        // Don't reset here if navigation is happening
      }
    } else {
      // Handle login
      setLoading(true);
      setIsSubmitting(true);
      try {
        const response = await fetch(`${BASE_URL}/skill-mint/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            email, 
            password,
            newOne: false 
          })
        });

        const data = await response.json();

        if (response.status === 429) {
          setError('Multiple login attempts detected. Your account has been temporarily frozen for security reasons. Please try again after 5 minutes.');
          return;
        }

        if (response.ok && data.status === 'success') {
          // Store authentication data
          localStorage.setItem('userEmail', email);
          window.location.href = '/';
        } else {
          setError(data.message || t('auth.loginFailedCredentials'));
        }
      } catch (err) {
        setError(t('auth.unexpectedLoginError'));
      } finally {
        setLoading(false);
        setIsSubmitting(false);
      }
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="relative flex flex-col min-h-screen overflow-hidden lg:flex-row" style={{ background: 'var(--bg-gradient-green)' }}>
      {/* Animated Background Shapes - Visible on all screens */}
      <div className="absolute inset-0">
        <div className="absolute rounded-full top-20 left-20 w-72 h-72 bg-white/10 blur-3xl animate-pulse"></div>
        <div className="absolute delay-1000 rounded-full bottom-20 right-20 w-96 h-96 bg-emerald-400/20 blur-3xl animate-pulse"></div>
        <div className="absolute w-64 h-64 transform -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 bg-teal-400/20 blur-2xl"></div>
      </div>

      {/* Left Side - Decorative Design (Desktop Only) */}
      <div className="relative z-10 items-center justify-center hidden lg:flex lg:w-1/2">
        {/* Content */}
        <div className="px-12 text-center text-white">
          <div className="mb-8">
            <div className="mb-6 text-6xl">🎯</div>
            <h1 className="mb-6 text-5xl font-bold leading-tight">
              {t('auth.welcomeToSkillMint')}
            </h1>
            <p className="text-xl leading-relaxed text-green-100">
              {t('auth.heroTagline')}
            </p>
          </div>
          
          <div className="grid max-w-md grid-cols-2 gap-6 mx-auto mt-12">
            <div className="p-5 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
              <div className="flex justify-center mb-3">
                <img src="/create.png" alt="Resume Builder" className="w-12 h-12" />
              </div>
              <p className="text-sm font-medium">{t('auth.smartResumeBuilder')}</p>
            </div>
            <div className="p-5 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
              <div className="flex justify-center mb-3">
                <img src="/statistcs.png" alt="AI Analysis" className="w-12 h-12" />
              </div>
              <p className="text-sm font-medium">{t('auth.aiAnalysisFeature')}</p>
            </div>
            <div className="p-5 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
              <div className="flex justify-center mb-3">
                <img src="/paint-palette.png" alt="Templates" className="w-12 h-12" />
              </div>
              <p className="text-sm font-medium">{t('auth.proTemplates')}</p>
            </div>
            <div className="p-5 border bg-white/10 backdrop-blur-sm rounded-xl border-white/20">
              <div className="flex justify-center mb-3">
                <img src="/download.png" alt="Download" className="w-12 h-12" />
              </div>
              <p className="text-sm font-medium">{t('auth.instantDownload')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header - Promotional Content (Mobile Only) */}
      <div className="relative z-10 px-6 py-12 text-center text-white lg:hidden">
        <div className="mb-4 text-4xl">🎯</div>
        <h1 className="mb-3 text-3xl font-bold leading-tight">
          {t('auth.welcomeToSkillMint')}
        </h1>
        <p className="max-w-md mx-auto text-sm leading-relaxed text-green-100">
          {t('auth.heroTaglineMobile')}
        </p>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 flex items-center justify-center w-full p-5 lg:w-1/2">
        <div className="w-full max-w-md animate-slide-in">
          <div className="mb-8 text-center">
            <div className="flex justify-center mb-6">
              <img src="/logo.png" alt="SkillMint Logo" className="h-12" style={{ width: 'auto' }} />
            </div>
            <h2 className="text-3xl font-bold text-white">
              {showAdminLogin ? t('auth.adminLogin') : (isSignUp ? t('auth.createAccount') : t('auth.signIn'))}
            </h2>
            <p className="mt-2 text-sm text-white/90">
              {showAdminLogin ? t('auth.accessAdminDashboard') : (isSignUp ? t('auth.startBuildingResume') : t('auth.buildProfessionalResumes'))}
            </p>
          </div>

          <div className="p-8 bg-white border border-gray-100 shadow-2xl rounded-2xl">
        
        {showAdminLogin ? (
          // Admin Login Form
          <form onSubmit={handleAdminLogin} className="flex flex-col gap-5">
            {error && (
              <div className={error.includes('rate limit') || error.includes('Too many requests') ? 'banner-rate-limit' : 'banner-error'}>
                {(error.includes('rate limit') || error.includes('Too many requests')) && (
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-sm leading-relaxed sm:text-base">{error}</div>
                  {(error.includes('rate limit') || error.includes('Too many requests')) && (
                    <div className="mt-2 text-xs sm:text-sm opacity-90">
                      {t('auth.rateLimitHelp')}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="adminUsername"
                className="text-sm font-medium text-gray-700"
              >
                {t('auth.username')}
              </label>
              <input
                type="text"
                id="adminUsername"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder={t('auth.enterAdminUsername')}
                required
                disabled={loading}
                className="input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label 
                htmlFor="adminPassword"
                className="text-sm font-medium text-gray-700"
              >
                {t('auth.password')}
              </label>
              <input
                type="password"
                id="adminPassword"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder={t('auth.enterAdminPassword')}
                required
                disabled={loading}
                className="input"
              />
            </div>

            <button 
              type="submit" 
              className="mt-3 btn btn-primary"
              disabled={loading || isSubmitting}
            >
              {loading ? t('auth.signingIn') : t('auth.adminSignIn')}
            </button>
          </form>
        ) : (
          // Regular User Login/Signup Form
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {success && (
            <div className="p-4 mb-4 text-sm border border-green-200 rounded-lg bg-green-50" style={{ color: '#19B86B' }}>
              {success}
            </div>
          )}
          
          {error && (
            <div className={error.includes('frozen for security') || error.includes('temporarily blocked') || error.includes('rate limit') || error.includes('Too many') ? 'banner-rate-limit' : 'banner-error'}>
              {(error.includes('frozen for security') || error.includes('temporarily blocked') || error.includes('rate limit') || error.includes('Too many')) && (
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm leading-relaxed sm:text-base">{error}</div>
                {(error.includes('frozen for security') || error.includes('temporarily blocked') || error.includes('rate limit') || error.includes('Too many')) && (
                  <div className="mt-2 text-xs sm:text-sm opacity-90">
                    ⏱️ Please wait 5 minutes before attempting to login again.
                  </div>
                )}
              </div>
            </div>
          )}
          
          {isSignUp && (
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                {t('auth.name')}
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.enterYourName')}
                required
                disabled={loading}
                className="input"
              />
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('auth.enterYourEmail')}
              required
              disabled={loading}
              className="input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label 
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              {t('auth.password')}
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.enterYourPassword')}
              required
              disabled={loading}
              minLength={isSignUp ? 6 : undefined}
              className="input"
            />
          </div>

          {!isSignUp && (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
              >
                {t('auth.forgotPassword')}
              </button>
            </div>
          )}

          {isSignUp && (
            <div className="flex flex-col gap-2">
              <label 
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700"
              >
                {t('auth.confirmPassword')}
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmYourPassword')}
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
            disabled={loading || isSubmitting}
          >
            {loading 
              ? (isSignUp ? t('auth.creatingAccount') : t('auth.signingIn')) 
              : (isSignUp ? t('auth.signUp') : t('auth.signIn'))
            }
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500 bg-white">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border-2 border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-all duration-200 font-medium text-gray-700 hover:border-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {isSignUp ? t('auth.signUpWithGoogle') : t('auth.signInWithGoogle')}
          </button>
        </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? t('auth.alreadyHaveAccount') : t('auth.dontHaveAccount')}{' '}
            <button 
              type="button" 
              className="font-semibold transition-colors duration-200 hover:underline disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ color: '#19B86B' }}
              onClick={toggleMode}
              disabled={loading}
            >
              {isSignUp ? t('auth.signIn') : t('auth.signUpHere')}
            </button>
          </p>
        </div>

        {!isSignUp && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => {
                setShowAdminLogin(!showAdminLogin);
                setError('');
                setAdminUsername('');
                setAdminPassword('');
              }}
              className="flex items-center justify-center gap-1.5 mx-auto text-xs text-gray-500 transition-colors hover:text-gray-700"
            >
              {!showAdminLogin && <img src="/database-user.png" alt="Admin" className="w-8 h-8" />}
              {showAdminLogin ? t('auth.backToUserLogin') : t('auth.adminLoginLink')}
            </button>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
