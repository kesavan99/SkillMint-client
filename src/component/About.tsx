import Navbar from './Navbar';

const About = () => {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="max-w-4xl px-5 py-16 mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-white">About SkillMint</h1>
        
        <div className="p-6 md:p-8 space-y-6 leading-relaxed text-gray-700 bg-white shadow-2xl rounded-2xl">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Our Mission</h2>
            <p>
              SkillMint is dedicated to empowering job seekers and professionals with AI-powered tools to create compelling, 
              professional resumes. We believe that a well-crafted resume is the first step toward career success, and we're 
              here to make that process simple, intelligent, and effective.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">What We Offer</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">AI-Powered Resume Builder</h3>
                <p>
                  Create professional, ATS-friendly resumes using our intelligent resume builder. Choose from multiple 
                  professionally designed templates and get AI-powered suggestions to improve your resume content. Our 
                  analysis helps you understand what recruiters are looking for and provides personalized recommendations.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">Professional Templates</h3>
                <p>
                  Access a variety of resume templates designed by industry experts. Whether you're a fresh graduate or 
                  an experienced professional, we have templates that suit your career stage and industry. Each template 
                  is optimized for Applicant Tracking Systems (ATS) to maximize your chances of getting noticed.
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">Resume Analysis & Insights</h3>
                <p>
                  Get comprehensive AI-powered analysis of your resume including strength assessment, skill gap identification, 
                  and actionable recommendations. Our intelligent system evaluates your resume against industry standards and 
                  job requirements to help you create a compelling professional profile.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Who We Serve</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>Fresh graduates preparing for campus placements and entry-level positions</li>
              <li>Experienced professionals seeking career advancement or new opportunities</li>
              <li>Career changers transitioning into new industries or roles</li>
              <li>Job seekers looking to create multiple resume versions for different positions</li>
              <li>Anyone who wants to present their professional experience in the best possible way</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Our Commitment</h2>
            <p>
              We are committed to providing high-quality, accessible tools that help you achieve your career goals. 
              Our platform is continuously updated with new resume templates, enhanced AI capabilities, and features based on 
              current hiring trends and user feedback. Your success is our priority.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">Contact Us</h2>
            <p>
              Have questions or feedback? We'd love to hear from you. Reach out to us at{' '}
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

export default About;
