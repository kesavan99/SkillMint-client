import Navbar from './Navbar';
import { useTranslation } from '../locales';

const About = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="max-w-4xl px-5 py-16 mx-auto">
        <h1 className="mb-8 text-4xl font-bold text-white">{t('about.pageTitle')}</h1>
        
        <div className="p-6 space-y-6 leading-relaxed text-gray-700 bg-white shadow-2xl md:p-8 rounded-2xl">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('about.mission')}</h2>
            <p>
              {t('about.missionText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('about.whatWeOffer')}</h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">{t('about.aiResumeBuilder')}</h3>
                <p>
                  {t('about.aiResumeBuilderText')}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">{t('about.professionalTemplates')}</h3>
                <p>
                  {t('about.professionalTemplatesText')}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-xl font-semibold text-gray-800">{t('about.resumeAnalysis')}</h3>
                <p>
                  {t('about.resumeAnalysisText')}
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('about.whoWeServe')}</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>{t('about.freshGraduates')}</li>
              <li>{t('about.experiencedProfessionals')}</li>
              <li>{t('about.careerChangers')}</li>
              <li>{t('about.jobSeekers')}</li>
              <li>{t('about.anyone')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('about.ourCommitment')}</h2>
            <p>
              {t('about.commitmentText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('about.contactUs')}</h2>
            <p>
              {t('about.contactText')}{' '}
              <a href={`mailto:${t('about.contactEmail')}`} className="text-green-600 hover:underline">
                {t('about.contactEmail')}
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
