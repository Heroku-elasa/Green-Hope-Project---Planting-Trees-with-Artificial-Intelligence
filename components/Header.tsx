import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../types';

interface SiteHeaderProps {
    onLogoClick: () => void;
}

const SiteHeader: React.FC<SiteHeaderProps> = ({ onLogoClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  return (
    <header className="bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button onClick={onLogoClick} className="flex-shrink-0 flex items-center space-x-3 rtl:space-x-reverse transform transition-transform hover:scale-105">
               <i className="fa-solid fa-tree text-3xl text-emerald-500"></i>
              <span className="font-bold text-xl text-white">{t('header.title')}</span>
            </button>
          </div>

          <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <div className="relative" ref={langMenuRef}>
                <button onClick={() => setIsLangMenuOpen(!isLangMenuOpen)} className="flex items-center text-gray-300 hover:text-white transform transition-transform hover:scale-110" aria-label="Change language">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m4 13l4-4M19 9l-4 4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </button>
                {isLangMenuOpen && (
                    <div className="absolute end-0 mt-2 w-48 rounded-md shadow-lg bg-slate-900 ring-1 ring-slate-700 focus:outline-none" role="menu" aria-orientation="vertical" aria-labelledby="language-menu">
                        <div className="p-1" role="none">
                            <button 
                                onClick={() => { setLanguage('en'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-left block px-4 py-2 text-sm rounded-md transition-colors ${language === 'en' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                                role="menuitem"
                            >
                                English
                            </button>
                            <button 
                                onClick={() => { setLanguage('fa'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-left block px-4 py-2 text-sm rounded-md transition-colors ${language === 'fa' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                                role="menuitem"
                            >
                                فارسی (Persian)
                            </button>
                            <button 
                                onClick={() => { setLanguage('ar'); setIsLangMenuOpen(false); }} 
                                className={`w-full text-left block px-4 py-2 text-sm rounded-md transition-colors ${language === 'ar' ? 'bg-emerald-600 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                                role="menuitem"
                            >
                                العربية (Arabic)
                            </button>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default SiteHeader;