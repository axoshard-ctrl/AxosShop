import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useEasterEggs() {
  const { toast } = useToast();
  const keySequenceRef = useRef<string>('');
  const clickCountRef = useRef<number>(0);
  const lastClickTimeRef = useRef<number>(0);
  const logoClickedRef = useRef<boolean>(false);

  useEffect(() => {
    // Handle keyboard for "AXO" sequence
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Build sequence for AXO
      if (key === 'a') {
        keySequenceRef.current = 'a';
      } else if (key === 'x' && keySequenceRef.current === 'a') {
        keySequenceRef.current = 'ax';
      } else if (key === 'o' && keySequenceRef.current === 'ax') {
        // Trigger AXO Easter egg
        toast({
          title: "🦎 AXOLOTL MODE ACTIVATED 🦎",
          description: "The adorable axolotl approves!",
        });
        playAxolotlAnimation();
        keySequenceRef.current = '';
      } else {
        keySequenceRef.current = '';
      }
    };

    // Triple click handler for any clickable element
    const handleClick = (e: MouseEvent) => {
      const now = Date.now();
      const target = e.target as HTMLElement;
      
      // Check if clicking on a header/logo area
      if (target.tagName === 'H1' || target.closest('header') || target.tagName === 'A' && target.getAttribute('href') === '/') {
        if (now - lastClickTimeRef.current < 500) {
          clickCountRef.current++;
        } else {
          clickCountRef.current = 1;
        }
        lastClickTimeRef.current = now;

        if (clickCountRef.current === 3) {
          toast({
            title: "🎉 AXOLOTL PARTY TIME 🎉",
            description: "You found the triple-click secret!",
          });
          playAxolotlAnimation();
          clickCountRef.current = 0;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('click', handleClick);
    };
  }, [toast]);
}

const playAxolotlAnimation = () => {
  // Create animation style if not exists
  if (!document.getElementById('axolotl-egg-style')) {
    const style = document.createElement('style');
    style.id = 'axolotl-egg-style';
    style.textContent = `
      @keyframes axolotlBounce {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 1; }
        25% { transform: translateY(-30px) rotate(-10deg); opacity: 1; }
        50% { transform: translateY(0) rotate(0deg); opacity: 1; }
        75% { transform: translateY(-30px) rotate(10deg); opacity: 1; }
        100% { transform: translateY(0) rotate(0deg); opacity: 0; }
      }
      
      .axolotl-egg {
        position: fixed;
        font-size: 80px;
        animation: axolotlBounce 0.8s ease-in-out forwards;
        pointer-events: none;
        z-index: 9999;
        user-select: none;
      }
    `;
    document.head.appendChild(style);
  }

  // Spawn multiple axolotls
  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const axolotl = document.createElement('div');
      axolotl.className = 'axolotl-egg';
      axolotl.textContent = '🦎';
      axolotl.style.left = Math.random() * window.innerWidth + 'px';
      axolotl.style.top = Math.random() * window.innerHeight + 'px';
      document.body.appendChild(axolotl);

      setTimeout(() => axolotl.remove(), 800);
    }, i * 80);
  }
};
