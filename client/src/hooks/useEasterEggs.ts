import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useEasterEggs() {
  const { toast } = useToast();
  const keySequenceRef = useRef<string>('');
  const clickCountRef = useRef<number>(0);
  const lastClickTimeRef = useRef<number>(0);

  useEffect(() => {
    // Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keySequenceRef.current += key;

      // Konami code for rainbow mode
      if (keySequenceRef.current.includes('arrowuparrowuparrowdownarrowdownarrowleftarrowarrowarrowleftarrowrightba')) {
        toast({
          title: "🌈 RAINBOW MODE ACTIVATED! 🌈",
          description: "You found the secret rainbow theme!",
        });
        document.documentElement.style.filter = 'hue-rotate(360deg)';
        keySequenceRef.current = '';
        setTimeout(() => {
          document.documentElement.style.filter = 'hue-rotate(0deg)';
        }, 3000);
      }

      // Shorter sequences to avoid too long strings
      if (keySequenceRef.current.length > 50) {
        keySequenceRef.current = keySequenceRef.current.slice(-20);
      }
    };

    // Triple click on logo for surprise
    const handleLogoClick = () => {
      const now = Date.now();
      if (now - lastClickTimeRef.current < 500) {
        clickCountRef.current++;
      } else {
        clickCountRef.current = 1;
      }
      lastClickTimeRef.current = now;

      if (clickCountRef.current === 3) {
        toast({
          title: "🎉 AXOLOTL ACTIVATED! 🎉",
          description: "You found the triple-click secret!",
        });
        playAxolotlAnimation();
        clickCountRef.current = 0;
      }
    };

    // Type "axo" anywhere to get a fun message
    const handleSecretTyping = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        keySequenceRef.current = 'a';
      } else if ((e.key === 'x' || e.key === 'X') && keySequenceRef.current.toLowerCase() === 'a') {
        keySequenceRef.current = 'ax';
      } else if ((e.key === 'o' || e.key === 'O') && keySequenceRef.current.toLowerCase() === 'ax') {
        toast({
          title: "🦎 AXOLOTL MODE 🦎",
          description: "The adorable pink axolotl approves!",
        });
        keySequenceRef.current = '';
      } else {
        keySequenceRef.current = '';
      }
    };

    // Find logo element and add click listener
    const logo = document.querySelector('[data-testid="logo"], h1, a[href="/"]');
    if (logo) {
      logo.addEventListener('click', handleLogoClick);
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keydown', handleSecretTyping);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keydown', handleSecretTyping);
      if (logo) {
        logo.removeEventListener('click', handleLogoClick);
      }
    };
  }, [toast]);

  const playAxolotlAnimation = () => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes axolotlBounce {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        25% { transform: translateY(-20px) rotate(-5deg); }
        50% { transform: translateY(0) rotate(0deg); }
        75% { transform: translateY(-20px) rotate(5deg); }
      }
      
      .axolotl-egg {
        position: fixed;
        font-size: 60px;
        animation: axolotlBounce 0.6s ease-in-out;
        pointer-events: none;
        z-index: 9999;
      }
    `;
    document.head.appendChild(style);

    // Spawn multiple axolotls
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const axolotl = document.createElement('div');
        axolotl.className = 'axolotl-egg';
        axolotl.textContent = '🦎';
        axolotl.style.left = Math.random() * window.innerWidth + 'px';
        axolotl.style.top = Math.random() * window.innerHeight + 'px';
        document.body.appendChild(axolotl);

        setTimeout(() => axolotl.remove(), 600);
      }, i * 100);
    }
  };
}
