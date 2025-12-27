import { useNavigate, useSearchParams } from 'react-router-dom';

const EmailVerification = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#19B86B' }}>
            {isPasswordReset ? 'Reset Your Password' : 'Verify Your Email'}
          </h2>
        </div>

        <div className="text-center mb-6">
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
          
          <p className="text-lg text-gray-700 mb-4">
            {isPasswordReset 
              ? "We've sent a password reset link to:"
              : "We've sent a verification link to:"}
          </p>
          <p className="text-lg font-semibold mb-6" style={{ color: '#19B86B' }}>
            {email || 'your email address'}
          </p>
          
          <p className="text-sm text-gray-600 mb-6">
            {isPasswordReset
              ? 'Please check your email and click the reset link to set your new password.'
              : 'Please check your email and click the verification link to activate your account.'}
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> The {isPasswordReset ? 'reset' : 'verification'} link will expire in 24 hours.
            </p>
          </div>
        </div>

        <button
          onClick={handleBackToLogin}
          className="w-full btn btn-primary"
        >
          Back to Login
        </button>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Didn't receive the email?{' '}
            <button 
              type="button" 
              className="font-semibold transition-colors duration-200 hover:underline"
              style={{ color: '#19B86B' }}
            >
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
