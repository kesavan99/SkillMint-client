import Navbar from './Navbar';
import { useState, type FormEvent } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Contact = () => {
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${API_URL}/api/contact/send`, formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data.success) {
        setSubmitted(true);
        setFormData({ subject: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="max-w-4xl px-5 py-16 mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-white">Contact Us</h1>
        
        <div className="p-6 md:p-8 bg-white shadow-2xl rounded-2xl">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-2xl font-semibold text-gray-900">Get in Touch</h2>
            <div className="space-y-6">
              <p className="text-gray-700">
                Have questions, feedback, or need support? We're here to help! Fill out the form and we'll get back 
                to you as soon as possible.
              </p>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">Email</h3>
                <p className="text-gray-700">
                  <a href="mailto:kesavan081999@gmail.com" className="text-green-600 hover:underline">
                    kesavan081999@gmail.com
                  </a>
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">Response Time</h3>
                <p className="text-gray-700">
                  We typically respond within 24-48 hours during business days.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-gray-900">Support Hours</h3>
                <p className="text-gray-700">
                  Monday - Friday: 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitted && (
                <div className="p-4 text-green-700 border border-green-200 rounded-lg bg-green-50">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}
              
              {error && (
                <div className="p-4 text-red-700 border border-red-200 rounded-lg bg-red-50">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Tell us more about your question or feedback..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 font-semibold text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
        </div>

        <div className="p-6 md:p-8 mt-8 rounded-2xl bg-white/80 backdrop-blur shadow-lg">
          <h2 className="mb-4 text-2xl font-semibold text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-gray-800">How do I reset my password?</h3>
              <p className="text-gray-600">
                You can reset your password from the login page by clicking "Forgot Password" and following the 
                instructions sent to your email.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-800">Is my resume data secure?</h3>
              <p className="text-gray-600">
                Yes, all your data is encrypted and stored securely. We follow industry best practices for data security 
                and privacy.
              </p>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-gray-800">Can I export my resume?</h3>
              <p className="text-gray-600">
                Absolutely! Once you create a resume, you can download it as a PDF file that you can use for job applications.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contact;
