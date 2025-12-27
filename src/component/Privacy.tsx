import Navbar from './Navbar';

const Privacy = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="px-5 py-16 mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-white/90 mb-8">Last updated: December 14, 2025</p>
        
        <div className="p-6 md:p-8 space-y-6 text-gray-700 leading-relaxed bg-white shadow-2xl rounded-2xl">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p>
              We collect your email address during registration. Email is collected solely for marketing purposes by the 
              application owner.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Email</h2>
            <p>
              Your email address will be used exclusively for marketing communications from SkillMint. We will never sell 
              your email address to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Resume Data Privacy</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Your resume data is not sold to any third parties</li>
              <li>We do not monitor or share your resume content</li>
              <li>All data is encrypted and securely stored in our database</li>
              <li>You retain full ownership of your resume data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p>
              All your data, including resume information and personal details, is encrypted and stored securely in our 
              database. We implement industry-standard security measures to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p>
              You have the right to access, modify, or delete your data at any time through your profile settings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:kesavan081999@gmail.com" className="text-green-600 hover:underline">
                kesavan081999@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
