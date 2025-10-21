import React from 'react';
import { useLanguage } from '../types';

interface Startup {
    name: string;
    description: string;
    icon: string;
    link: string;
}

const StartupShowcase: React.FC = () => {
    const { t } = useLanguage();

    // Fetching startup data from translations to support i18n
    const startups: Startup[] = t('startupShowcase.startups');

    return (
        <div className="max-w-6xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
                <i className="fa-solid fa-rocket text-5xl text-emerald-400 mb-4"></i>
                <h2 className="text-3xl font-bold text-white">{t('startupShowcase.title')}</h2>
                <p className="mt-2 text-slate-300 max-w-3xl mx-auto">{t('startupShowcase.description')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {startups.map((startup, index) => (
                    <div 
                        key={index} 
                        className="bg-slate-900 rounded-lg border border-slate-800 p-6 flex flex-col hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-900/50 transition-all duration-300 transform hover:-translate-y-1"
                    >
                        <div className="flex-shrink-0 mb-4">
                            <i className={`fa-solid ${startup.icon} text-4xl text-emerald-400`}></i>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">{startup.name}</h3>
                        <p className="text-slate-400 text-sm flex-grow mb-4">{startup.description}</p>
                        <a 
                            href={startup.link} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-auto inline-block text-center bg-slate-800 text-emerald-400 font-semibold py-2 px-4 rounded-md hover:bg-emerald-600 hover:text-white transition-colors"
                        >
                            {t('startupShowcase.learnMore')}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StartupShowcase;