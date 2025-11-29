import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage, t } from '@/lib/languageContext';

export default function About() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} onCartClick={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">{t('pages.about.title', language)}</h1>
        <p className="text-lg text-muted-foreground">{t('pages.about.description', language)}</p>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Our Mission</h2>
          <p className="text-muted-foreground">We build delightful Axolotl merchandise and community-driven experiences.</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
