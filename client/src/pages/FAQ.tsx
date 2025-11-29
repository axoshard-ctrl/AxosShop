import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage, t } from '@/lib/languageContext';

export default function FAQ() {
  const { language } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
      <Header cartItemCount={0} onCartClick={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-4">{t('pages.faq.title', language)}</h1>
        <p className="text-lg text-muted-foreground">{t('pages.faq.description', language)}</p>

        <section className="mt-8 space-y-6">
          <div>
            <h3 className="font-semibold">How do I track my order?</h3>
            <p className="text-muted-foreground">Use the order tracking page with your order id.</p>
          </div>
          <div>
            <h3 className="font-semibold">What is the return policy?</h3>
            <p className="text-muted-foreground">Returns are accepted within 30 days of delivery.</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
