import React from 'react';
import { useLanguage } from '../types';

const SiteFooter: React.FC = () => {
    const { t } = useLanguage();

    return (
        <footer id="footer" className="bg-black/20 text-slate-400 border-t border-white/10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="text-center">
                    <div className="flex items-center justify-center space-x-3 rtl:space-x-reverse mb-2">
                       <i className="fa-solid fa-tree text-2xl text-emerald-400"></i>
                        <span className="font-bold text-lg text-white">{t('header.title')}</span>
                    </div>
                     <p className="text-xs">{t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;
