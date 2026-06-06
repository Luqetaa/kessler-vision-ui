import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface NavSection {
  id: string;
  label: string;
}

const NAV_SECTIONS: NavSection[] = [
  { id: 'home',         label: 'HOME¹' },
  { id: 'debris',       label: 'DEBRIS²' },
  { id: 'algorithm',    label: 'ALGORITHM³' },
  { id: 'python-agent-wrapper', label: 'AGENT⁴' },
];

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const updateActiveSection = () => {
      const trigger = window.scrollY + window.innerHeight * 0.35;
      let current = NAV_SECTIONS[0].id;
      
      NAV_SECTIONS.forEach(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.getBoundingClientRect().top + window.scrollY <= trigger) {
          current = id;
        }
      });
      
      setActiveSection(current);
    };

    updateActiveSection();
    window.addEventListener('scroll', updateActiveSection, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveSection);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const absoluteTop = el.getBoundingClientRect().top + window.scrollY;
      window.dispatchEvent(new CustomEvent('customScrollTo', { detail: absoluteTop }));
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-40 pointer-events-auto select-none"
      style={{
        background: 'transparent',
        color: '#fff',
        mixBlendMode: 'difference',
      }}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo restaurada como antes com underline piscando */}
        <div 
          onClick={() => scrollTo('home')}
          className="flex items-center cursor-pointer group"
        >
          <span 
            style={{ fontFamily: "'Neue Metana Mono', monospace", mixBlendMode: 'difference' }}
            className="text-sm tracking-wider text-white font-bold transition-all duration-300"
          >
            Kessler<span className="animate-blink inline-block">_</span> Visi0n
          </span>
        </div>

        {/* Desktop Navigation com fonte aumentada (text-sm) */}
        <div className="hidden sm:flex items-center gap-2">
          {NAV_SECTIONS.map(({ id, label }) => {
            const isActive = activeSection === id;
            return (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="relative px-3 py-1.5 font-mono text-sm tracking-widest transition-opacity duration-300 pointer-events-auto cursor-pointer"
                style={{ opacity: isActive ? 1 : 0.4 }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Mobile Hamburger */}
        <button 
          className="sm:hidden flex flex-col gap-1.5 p-2 cursor-pointer ml-auto" 
          onClick={() => setMobileOpen((o) => !o)} 
          aria-label="Toggle menu"
        >
          <motion.span 
            animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }} 
            className="block w-5 h-px origin-center bg-current" 
            transition={{ duration: 0.2 }} 
          />
          <motion.span 
            animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }} 
            className="block w-5 h-px bg-current" 
            transition={{ duration: 0.15 }} 
          />
          <motion.span 
            animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }} 
            className="block w-5 h-px origin-center bg-current" 
            transition={{ duration: 0.2 }} 
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="sm:hidden overflow-hidden bg-black/90 backdrop-blur-md border-b border-white/10"
          >
            <div className="flex flex-col py-2">
              {NAV_SECTIONS.map(({ id, label }) => {
                const isActive = activeSection === id;
                return (
                  <button 
                    key={id} 
                    onClick={() => scrollTo(id)}
                    className="w-full flex items-center px-6 py-4 font-mono text-base tracking-widest transition-opacity duration-200 cursor-pointer"
                    style={{ opacity: isActive ? 1 : 0.4 }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
