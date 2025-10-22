
import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, Page, UserProfile } from '../types';

interface HeaderProps {
  setPage: (page: Page) => void;
  currentPage: Page;
  user: UserProfile | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ setPage, currentPage, user, onLogout }) => {
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const navItems: { page: Page; labelKey: string }[] = [
    { page: 'home', labelKey: 'nav.home' },
    { page: 'generator', labelKey: 'nav.reportGenerator' },
    { page: 'grant', labelKey: 'nav.grantFinder' },
    { page: 'siteSelector', labelKey: 'nav.siteSelector' },
    { page: 'video', labelKey: 'nav.videoGenerator' },
    { page: 'imageEditor', labelKey: 'nav.imageEditor' },
    { page: 'blog', labelKey: 'nav.blogGenerator' },
    { page: 'projects', labelKey: 'nav.projects' },
    { page: 'team', labelKey: 'nav.team' },
    { page: 'docs', labelKey: 'nav.docs' },
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
    if (!user) {
        const renderGoogleButton = (elementId: string) => {
            const element = document.getElementById(elementId);
            // @ts-ignore
            if (element && window.google) {
                // @ts-ignore
                google.accounts.id.renderButton(
                    element,
                    { theme: 'outline', size: 'large', type: 'standard', text: 'signin_with', shape: 'pill' }
                );
            }
        };

        const initAndRender = () => {
            renderGoogleButton('google-signin-button');
            if (isMobileMenuOpen) {
                renderGoogleButton('google-signin-button-mobile');
            }
        }

        // @ts-ignore
        if (window.google) {
            initAndRender();
        } else {
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            // FIX: Add type guard to ensure script is HTMLScriptElement before accessing onload.
            if (script instanceof HTMLScriptElement) {
                script.onload = initAndRender;
            }
        }
    }
  }, [user, isMobileMenuOpen]);

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
    <header className="bg-slate-900/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b border-slate-700/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button onClick={() => handleNavClick('home')} className="flex-shrink-0 text-2xl font-bold tracking-tight text-white bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Green Hope Project
            </button>
            <nav className="hidden md:flex md:ml-10 md:space-x-8">
              {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`text-sm font-medium transition-colors hover:text-pink-400 ${currentPage === item.page ? 'text-pink-400' : 'text-gray-300'}`}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex items-center">
             <div className="flex items-center space-x-2 text-sm mr-4">
                <button onClick={() => handleLanguageChange('en')} className={`px-2 py-1 rounded ${language === 'en' ? 'bg-pink-500/30 text-pink-300' : 'text-gray-400 hover:bg-slate-700'}`}>EN</button>
                <button onClick={() => handleLanguageChange('fa')} className={`px-2 py-1 rounded ${language === 'fa' ? 'bg-pink-500/30 text-pink-300' : 'text-gray-400 hover:bg-slate-700'}`}>FA</button>
             </div>

             <div className="hidden md:block">
                {user ? (
                    <div className="relative" ref={profileMenuRef}>
                        <button onClick={() => setIsProfileMenuOpen(prev => !prev)} className="flex items-center space-x-2 rounded-full hover:ring-2 hover:ring-pink-500 transition-all">
                            <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full" />
                        </button>
                        {isProfileMenuOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-md shadow-lg z-20 border border-slate-700 animate-fade-in">
                                <div className="p-4 border-b border-slate-700 flex items-center space-x-3">
                                    <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                                    <div>
                                        <p className="font-semibold text-white truncate">{user.name}</p>
                                        <p className="text-sm text-gray-400 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <ul className="py-1 text-white">
                                    <li className="flex items-center px-4 py-2 hover:bg-slate-700 cursor-pointer text-sm" onClick={handleLogoutClick}>
                                         <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        Sign Out
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                ) : (
                    <div id="google-signin-button"></div>
                )}
             </div>
             
             <div className="md:hidden ml-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
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
        <nav className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             {navItems.map(item => (
                <button
                  key={item.page}
                  onClick={() => handleNavClick(item.page)}
                  className={`w-full text-left block px-3 py-2 rounded-md text-base font-medium transition-colors ${currentPage === item.page ? 'bg-slate-700 text-pink-300' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
                  aria-current={currentPage === item.page ? 'page' : undefined}
                >
                  {t(item.labelKey)}
                </button>
              ))}
          </div>
          <div className="px-4 py-3 border-t border-slate-700 flex justify-center">
            {user ? (
                 <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                        <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
                        <div>
                            <p className="font-semibold text-white truncate">{user.name}</p>
                            <p className="text-sm text-gray-400 truncate">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogoutClick} className="text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                    </button>
                </div>
            ) : (
                <div id="google-signin-button-mobile"></div>
            )}
            </div>
        </nav>
      )}
    </header>
  );
};

export default Header;
