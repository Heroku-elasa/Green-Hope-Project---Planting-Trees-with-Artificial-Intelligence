import React, { useState } from 'react';
import { useLanguage } from '../types';
import * as geminiService from '../services/geminiService';

const LandEstimationPage: React.FC = () => {
    const { t, language } = useLanguage();
    const [location, setLocation] = useState('');
    const [envTarget, setEnvTarget] = useState('');
    const [finTarget, setFinTarget] = useState('');
    const [famTarget, setFamTarget] = useState('');
    const [result, setResult] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleEstimate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const data = await geminiService.estimateLandValue(location, envTarget, finTarget, famTarget, language);
            setResult(data);
        } catch (err) {
            setError('خطایی در محاسبه رخ داد. لطفاً دوباره تلاش کنید.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700 shadow-xl">
                <h1 className="text-3xl font-bold text-white mb-2">{t('landEstimation.title')}</h1>
                <p className="text-slate-400 mb-8">{t('landEstimation.subtitle')}</p>

                <form onSubmit={handleEstimate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">{t('landEstimation.form.location')}</label>
                            <input 
                                type="text" 
                                value={location} 
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">{t('landEstimation.form.environmentalTarget')}</label>
                            <input 
                                type="text" 
                                value={envTarget} 
                                onChange={(e) => setEnvTarget(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">{t('landEstimation.form.financialTarget')}</label>
                            <input 
                                type="text" 
                                value={finTarget} 
                                onChange={(e) => setFinTarget(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">{t('landEstimation.form.familyTarget')}</label>
                            <input 
                                type="text" 
                                value={famTarget} 
                                onChange={(e) => setFamTarget(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-pink-500 outline-none"
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg disabled:opacity-50"
                    >
                        {isLoading ? 'در حال محاسبه...' : t('landEstimation.form.button')}
                    </button>
                </form>

                {error && <p className="text-red-400 mt-4">{error}</p>}

                {result && (
                    <div className="mt-12 p-6 bg-slate-900/80 rounded-xl border border-pink-500/30 animate-fade-in">
                        <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                            <span className="bg-pink-500/20 text-pink-400 p-2 rounded-lg mr-3">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                            </span>
                            {t('landEstimation.results.title')}
                        </h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                <p className="text-slate-400 text-sm mb-1">{t('landEstimation.results.score')}</p>
                                <p className="text-3xl font-black text-pink-400">{result.score}/100</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{t('landEstimation.results.rationale')}</h3>
                                <p className="text-slate-300 leading-relaxed">{result.rationale}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">{t('landEstimation.results.recommendation')}</h3>
                                <p className="text-slate-300 leading-relaxed">{result.recommendation}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LandEstimationPage;