import React, { useState, useCallback } from 'react';
import { useLanguage, HomePlant } from '../types';
import { useToast } from './Toast';
import { getHomeGardeningSuggestions } from '../services/geminiService';

const HomeGardeningPage: React.FC = () => {
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    const [condition, setCondition] = useState('sunnyBalcony');
    const [suggestions, setSuggestions] = useState<HomePlant[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const conditions = [
        { id: 'sunnyBalcony', label: t('homeGardening.conditions.sunnyBalcony') },
        { id: 'shadedPatio', label: t('homeGardening.conditions.shadedPatio') },
        { id: 'indoorLowLight', label: t('homeGardening.conditions.indoorLowLight') },
        { id: 'indoorHighLight', label: t('homeGardening.conditions.indoorHighLight') },
    ];

    const handleGetSuggestions = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setSuggestions([]);
        try {
            const selectedConditionLabel = conditions.find(c => c.id === condition)?.label || condition;
            const result = await getHomeGardeningSuggestions(selectedConditionLabel, language);
            setSuggestions(result);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : t('error');
            setError(errorMessage);
            addToast(errorMessage, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [condition, language, addToast, t, conditions]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <i className="fa-solid fa-plant-wilt text-5xl text-emerald-400 mb-4"></i>
                <h2 className="text-3xl font-bold text-white">{t('homeGardening.title')}</h2>
                <p className="mt-2 text-slate-300">{t('homeGardening.description')}</p>
            </div>

            <div className="bg-slate-800/50 p-6 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="condition-select" className="block text-sm font-medium text-slate-300 mb-2">
                            {t('homeGardening.conditionLabel')}
                        </label>
                        <select
                            id="condition-select"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="w-full bg-slate-900/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            {conditions.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGetSuggestions}
                        disabled={isLoading}
                        className="w-full py-2 px-4 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white mr-2 rtl:ml-2"></div>
                                {t('loading')}
                            </>
                        ) : t('homeGardening.getSuggestions')}
                    </button>
                </div>
            </div>

            <div className="mt-8">
                {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md text-center">{error}</div>}

                {suggestions.length > 0 && (
                     <div className="border-t border-slate-700 pt-8 mt-8">
                        <h3 className="text-2xl font-bold text-center text-white mb-6">{t('homeGardening.resultsTitle')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestions.map((plant, index) => (
                                <div key={index} className="bg-slate-800/50 rounded-lg border border-white/10 p-5 flex flex-col animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                                     <h4 className="text-xl font-bold text-emerald-300 mb-2">{plant.name}</h4>
                                     <div className="mb-3">
                                         <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-300 bg-amber-900/50">
                                             {plant.type}
                                         </span>
                                     </div>
                                     <div className="text-sm text-slate-300 space-y-3">
                                         <div>
                                             <strong className="block text-slate-400 font-semibold">{t('homeGardening.suitableFor')}</strong>
                                             <p>{plant.suitableFor}</p>
                                         </div>
                                         <div>
                                             <strong className="block text-slate-400 font-semibold">{t('homeGardening.careInstructions')}</strong>
                                             <p>{plant.careInstructions}</p>
                                         </div>
                                     </div>
                                 </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeGardeningPage;
