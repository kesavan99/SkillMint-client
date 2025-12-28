import Navbar from './Navbar';
import { useTranslation } from '../locales';

const Terms = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-gradient-green)' }}>
      <Navbar />
      
      <main className="max-w-4xl px-5 py-16 mx-auto">
        <h1 className="mb-4 text-4xl font-bold text-white">{t('terms.pageTitle')}</h1>
        <p className="mb-8 text-white/90">{t('terms.lastUpdated')}</p>
        
        <div className="p-6 space-y-6 leading-relaxed text-gray-700 bg-white shadow-2xl md:p-8 rounded-2xl">
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('terms.freeToUse')}</h2>
            <p>
              {t('terms.freeToUseText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('terms.usageLimits')}</h2>
            <p>
              {t('terms.usageLimitsText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('terms.userAccounts')}</h2>
            <p>
              {t('terms.userAccountsText')}
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('terms.prohibitedUse')}</h2>
            <p>{t('terms.prohibitedUseIntro')}</p>
            <ul className="mt-3 space-y-2 list-disc list-inside">
              <li>{t('terms.prohibitedPoint1')}</li>
              <li>{t('terms.prohibitedPoint2')}</li>
              <li>{t('terms.prohibitedPoint3')}</li>
              <li>{t('terms.prohibitedPoint4')}</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">{t('terms.contact')}</h2>
            <p>
              {t('terms.contactText')}{' '}
              <a href={`mailto:${t('terms.contactEmail')}`} className="text-green-600 hover:underline">
                {t('terms.contactEmail')}
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Terms;
