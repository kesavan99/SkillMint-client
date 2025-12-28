import Navbar from './Navbar';
import { useTranslation } from '../locales';

const Privacy = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="max-w-4xl px-5 py-16 mx-auto">
        <h1 className="mb-4 text-4xl font-bold text-white">{t('privacy.pageTitle')}</h1>
        <p className="mb-8 text-white/90">{t('privacy.lastUpdated')}</p>
        
        <div className="p-6 space-y-6 leading-relaxed text-gray-700 bg-white shadow-2xl md:p-8 rounded-2xl">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('privacy.informationWeCollect')}</h2>
            <p>
              {t('privacy.infoCollectText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('privacy.howWeUseEmail')}</h2>
            <p>
              {t('privacy.howWeUseEmailText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('privacy.resumeDataPrivacy')}</h2>
            <ul className="space-y-2 list-disc list-inside">
              <li>{t('privacy.resumeDataPoint1')}</li>
              <li>{t('privacy.resumeDataPoint2')}</li>
              <li>{t('privacy.resumeDataPoint3')}</li>
              <li>{t('privacy.resumeDataPoint4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('privacy.dataSecurity')}</h2>
            <p>
              {t('privacy.dataSecurityText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('privacy.yourRights')}</h2>
            <p>
              {t('privacy.yourRightsText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('privacy.contact')}</h2>
            <p>
              {t('privacy.contactText')}{' '}
              <a href={`mailto:${t('privacy.contactEmail')}`} className="text-green-600 hover:underline">
                {t('privacy.contactEmail')}
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
