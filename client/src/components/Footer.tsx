import { Link } from "wouter";
import { Heart, Mail, Twitter, Instagram, Youtube, Github, Linkedin } from "lucide-react";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { useLanguage, t } from "@/lib/languageContext";
import heroImage from "@assets/hero-purple-axolotl-mascot_1762939234262.png";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { language } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-background via-card/30 to-background py-16 border-t border-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={heroImage} alt="Axo Shard" className="h-10 w-10 rounded-lg" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                AxoShard
              </h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {t('footer.description', language)}
            </p>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('footer.newsletter', language)}</h3>
            <NewsletterSignup />
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('footer.quick_links', language)}</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/shop">
                  <a className="hover:text-primary transition-colors duration-200">{t('footer.shop', language)}</a>
                </Link>
              </li>
              <li>
                <Link href="/staff">
                  <a className="hover:text-primary transition-colors duration-200">{t('footer.about', language)}</a>
                </Link>
              </li>
              <li>
                <Link href="/staff">
                  <a className="hover:text-primary transition-colors duration-200">{t('footer.contact', language)}</a>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <a className="hover:text-primary transition-colors duration-200">{t('footer.privacy', language)}</a>
                </Link>
              </li>
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">{t('footer.follow', language)}</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://twitter.com/axoshard"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://instagram.com/axoshard"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.youtube.com/@axo_shard"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="https://www.reddit.com/user/Myhagaby/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-100 p-2.5 rounded-lg text-orange-600 hover:bg-orange-200 transition hover:scale-110"
                aria-label="Reddit"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="currentColor" opacity="1"></circle>
                  <circle cx="9" cy="10" r="1.5" fill="white"></circle>
                  <circle cx="15" cy="10" r="1.5" fill="white"></circle>
                  <path d="M9 14c0 1.66 2.69 3 6 3s6-1.34 6-3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"></path>
                </svg>
              </a>
              <a
                href="https://discord.gg/U3cgX7HDFd"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                aria-label="Discord"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.3671a19.8063 19.8063 0 0 0-4.885-1.515.0741.0741 0 0 0-.0785.0371c-.211.3671-.4437.8484-.6079 1.2278a18.268 18.268 0 0 0-5.487 0c-.1645-.3799-.4022-.8607-.6079-1.2278a.077.077 0 0 0-.0785-.037 19.7363 19.7363 0 0 0-4.885 1.515.0699.0699 0 0 0-.0321.0277C1.75 8.068 1.1968 11.692 2.705 15.0832a.0764.0764 0 0 0 .0945.0052c1.1164.8784 2.1909 1.2171 3.2383 1.6779a.0777.0777 0 0 0 .1692-.0277c.2424-.3933.4775-.8108.6655-1.2475a.0711.0711 0 0 0-.0383-.0922c-.784-.2956-1.528-.6679-2.2225-1.0742a.077.077 0 0 1-.0076-.1277c.1494.111.2983.2324.4406.3645a.0755.0755 0 0 0 .1174-.0274c4.568 2.285 9.534 2.285 14.051 0a.0755.0755 0 0 0 .1196.0274c.1423-.1319.2912-.2526.4406-.3645a.077.077 0 0 1-.0066.1288c-.6954.4057-1.4382.7742-2.2225 1.0742a.077.077 0 0 0-.0383.0922c.1884.4367.4226.8542.6655 1.2475a.076.076 0 0 0 .1692.0277c1.0464-.4608 2.1215-.7998 3.2383-1.6779a.0755.0755 0 0 0 .0945-.0052c1.5127-3.4407.992-6.9956-1.617-9.8159a.0528.0528 0 0 0-.0321-.0277zM8.02 12.6979c-1.1164 0-2.0425-.9852-2.0425-2.1961s.9181-2.1961 2.0425-2.1961c1.1244 0 2.062.9852 2.0425 2.1961 0 1.2108-.9181 2.1961-2.0425 2.1961zm7.9596 0c-1.1164 0-2.0425-.9852-2.0425-2.1961s.9181-2.1961 2.0425-2.1961c1.1244 0 2.062.9852 2.0425 2.1961 0 1.2108-.9181 2.1961-2.0425 2.1961z"></path>
                </svg>
              </a>
              <a
                href="mailto:contact@axoshard.com"
                className="p-2.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 hover:scale-110"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-primary/10 pt-8 text-center">
          <p className="text-muted-foreground text-sm">{t('footer.copyright', language, { year: currentYear })}</p>
          <p className="text-muted-foreground text-sm mt-2">{t('footer.tagline', language)}</p>
        </div>
      </div>
    </footer>
  );
}
