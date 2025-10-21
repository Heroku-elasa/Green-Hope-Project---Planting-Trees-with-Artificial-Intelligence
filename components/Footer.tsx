import React from 'react';
import { useLanguage } from '../types';

interface SiteFooterProps {
    onAdminClick: () => void;
}

const SiteFooter: React.FC<SiteFooterProps> = ({ onAdminClick }) => {
    const { t } = useLanguage();

    return (
        <footer id="footer" className="bg-slate-950 text-slate-400 border-t border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-2">
                       <i className="fa-solid fa-tree text-2xl text-emerald-500"></i>
                        <span className="font-bold text-lg text-white">{t('header.title')}</span>
                    </div>
                     <p className="text-xs">{t('footer.copyright')}</p>
                     <div className="mt-4">
                        <button onClick={onAdminClick} className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
                           {t('footer.adminLink')}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;
