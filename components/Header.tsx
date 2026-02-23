
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Page, UserProfile } from '../types';

interface HeaderProps {
  setPage: (page: Page) => void;
  currentPage: Page;
  user: UserProfile | null;
  onLogout: () => void;
  onLoginClick: () => void;
  onSearchClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ setPage, currentPage, user, onLogout, onLoginClick, onSearchClick }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navItems: { page: Page; labelKey: string }[] = [
    { page: 'home', labelKey: 'nav.home' },
    { page: 'landEstimation', labelKey: 'nav.landEstimation' },
    { page: 'marketplace', labelKey: 'nav.marketplace' },
    { page: 'investment', labelKey: 'nav.investment' },
    { page: 'generator', labelKey: 'nav.reportGenerator' },
    { page: 'grant', labelKey: 'nav.grantFinder' },
    { page: 'siteSelector', labelKey: 'nav.siteSelector' },
    { page: 'video', labelKey: 'nav.videoGenerator' },
    { page: 'imageEditor', labelKey: 'nav.imageEditor' },
    { page: 'blog', labelKey: 'nav.blogGenerator' },
    { page: 'composting', labelKey: 'nav.compostingGuide' },
    { page: 'aiAssistant', labelKey: 'nav.aiAssistant' },
    { page: 'projects', labelKey: 'nav.projects' },
    { page: 'team', labelKey: 'nav.team' },
    { page: 'docs', labelKey: 'nav.docs' },
    { page: 'api-test', labelKey: 'nav.apiTest' },
  ];
  
  const handleLanguageChange = (lang: 'en' | 'fa') => {
    setLanguage(lang);
  };
  
  const handleNavClick = (page: Page) => {
    setPage(page);
    setIsMobileMenuOpen(false);
  }

  const handleLogoutClick = () => {
    onLogout();
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-slate-950/90 backdrop-blur-xl sticky top-0 z-50 w-full border-b border-white/5 shadow-2xl transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <button 
              onClick={() => handleNavClick('home')} 
              className="flex-shrink-0 flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-tr from-pink-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              </div>
              <span className="text-xl font-black tracking-tighter text-white bg-gradient-to-r from-white via-white to-white/50 bg-clip-text">
                Green Hope
              </span>
            </button>
            <nav className="hidden xl:flex ml-12 items-center space-x-1">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${
                    currentPage === item.page 
                      ? 'bg-white/10 text-pink-400' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden lg:flex items-center bg-slate-900 rounded-full p-1 border border-white/5">
                <button onClick={() => handleLanguageChange('en')} className={`px-3 py-1 text-xs font-black rounded-full transition-all ${language === 'en' ? 'bg-pink-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>EN</button>
                <button onClick={() => handleLanguageChange('fa')} className={`px-3 py-1 text-xs font-black rounded-full transition-all ${language === 'fa' ? 'bg-pink-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>FA</button>
            </div>
            
            <button onClick={onSearchClick} className="p-2.5 bg-slate-900 text-slate-400 hover:text-white rounded-xl border border-white/5 hover:border-white/10 transition-all shadow-lg">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>

             <div className="hidden xl:block">
                {user ? (
                    <div className="relative" ref={profileMenuRef}>
                        <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center space-x-2 rounded-full hover:ring-2 hover:ring-pink-500 transition-all shadow-lg">
                            <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full border border-white/10" />
                        </button>
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-slate-900 rounded-2xl shadow-2xl z-20 border border-white/5 animate-fade-in p-2">
                                <div className="p-4 border-b border-white/5 flex items-center space-x-3 mb-1">
                                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-bold text-white truncate text-sm">{user.name}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <ul className="py-1">
                                    <li className="flex items-center px-4 py-2.5 hover:bg-white/5 rounded-xl cursor-pointer text-sm font-bold text-slate-300 transition-colors" onClick={handleLogoutClick}>
                                         <svg className="w-4 h-4 mr-3 text-pink-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sign Out
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <button onClick={onLoginClick} className="px-6 py-2.5 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-sm font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-xl">
                        Get Started
                    </button>
                )}
             </div>
             
             <div className="xl:hidden ml-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="inline-flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-white/5 focus:outline-none transition-all"
                  aria-controls="mobile-menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <span className="sr-only">Open main menu</span>
                  {isMobileMenuOpen ? (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  )}
                </button>
              </div>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <nav className="xl:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-2xl" id="mobile-menu">
          <div className="px-4 pt-4 pb-6 space-y-2">
             {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`w-full text-left block px-4 py-3 rounded-xl text-base font-bold transition-all ${currentPage === item.page ? 'bg-pink-600/10 text-pink-400 border border-pink-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  aria-current={currentPage === item.page ? 'page' : undefined}
                >
                  {t(item.labelKey)}
                </button>
              ))}
          </div>
          <div className="px-6 py-6 border-t border-white/5 bg-slate-900/30">
            {user ? (
                 <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-4">
                        <img src={user.picture} alt={user.name} className="w-12 h-12 rounded-full border border-white/10" />
                        <div>
                            <p className="font-bold text-white truncate">{user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogoutClick} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            ) : (
                 <button onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }} className="w-full px-6 py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white text-lg font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform">
                    Get Started
                </button>
            )}
            </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
