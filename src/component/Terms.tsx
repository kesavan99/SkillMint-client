import Navbar from './Navbar';

const Terms = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="max-w-4xl px-5 py-16 mx-auto">
        <h1 className="mb-4 text-4xl font-bold text-white">Terms of Service</h1>
        <p className="mb-8 text-white/90">Last updated: December 14, 2025</p>
        
        <div className="p-6 space-y-6 leading-relaxed bg-white shadow-2xl md:p-8 rounded-2xl text-gray-700">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Free to Use</h2>
            <p>
              SkillMint is a completely free application. You can use all features without any cost or subscription fees.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Usage Limits</h2>
            <p>
              While the service is free and unlimited, we implement rate limits for security purposes to protect our platform 
              and users from abuse. These limits are designed to accommodate normal usage patterns.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">User Accounts</h2>
            <p>
              Login is required for accountability purposes. By creating an account, you agree to provide accurate information 
              and maintain the security of your credentials.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Prohibited Use</h2>
            <p>You may not:</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>Embed this application in iframes on other websites</li>
              <li>Use the application's API without explicit permission</li>
              <li>Attempt to bypass security measures or rate limits</li>
              <li>Use the service for illegal purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contact</h2>
            <p>
              For questions or concerns, contact us at{' '}
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

export default Terms;
