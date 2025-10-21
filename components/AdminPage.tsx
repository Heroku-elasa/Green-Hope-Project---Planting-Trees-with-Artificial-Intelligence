import React, { useState, useEffect } from 'react';
import { useLanguage } from '../types';

const AdminPage: React.FC = () => {
    const { t } = useLanguage();
    const [isGoogleDateEnabled, setIsGoogleDateEnabled] = useState<boolean>(() => {
        const saved = localStorage.getItem('feature_google_date_enabled');
        return saved === 'true';
    });

    useEffect(() => {
        localStorage.setItem('feature_google_date_enabled', String(isGoogleDateEnabled));
    }, [isGoogleDateEnabled]);

    const handleToggle = () => {
        setIsGoogleDateEnabled(prevState => !prevState);
    };

    return (
        <div className="container mx-auto px-4 py-16 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <i className="fa-solid fa-user-shield text-5xl text-emerald-400 mb-4"></i>
                    <h1 className="text-4xl font-bold text-white">{t('admin.title')}</h1>
                </div>

                <div className="bg-slate-900 rounded-lg border border-slate-800 p-6">
                    <h2 className="text-2xl font-semibold text-white mb-6 border-b border-slate-700 pb-4">
                        {t('admin.featureManagement')}
                    </h2>

                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-grow">
                            <h3 className="font-bold text-lg text-slate-200">{t('admin.googleDateFeature')}</h3>
                            <p className="text-sm text-slate-400 mt-1">
                                {t('admin.googleDateDescription')}
                            </p>
                        </div>

                        <div className="flex-shrink-0 flex items-center">
                            <button
                                onClick={handleToggle}
                                type="button"
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                    isGoogleDateEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                                }`}
                                role="switch"
                                aria-checked={isGoogleDateEnabled}
                            >
                                <span className="sr-only">Use setting</span>
                                <span
                                    aria-hidden="true"
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                        isGoogleDateEnabled ? 'translate-x-5 rtl:-translate-x-5' : 'translate-x-0'
                                    }`}
                                ></span>
                            </button>
                             <span className={`ml-3 rtl:mr-3 text-sm font-medium ${isGoogleDateEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                                {isGoogleDateEnabled ? t('admin.enabled') : t('admin.disabled')}
                            </span>
                        </div>
                    </div>

                    {/* Future feature toggles can be added here */}

                </div>
            </div>
        </div>
    );
};

export default AdminPage;
