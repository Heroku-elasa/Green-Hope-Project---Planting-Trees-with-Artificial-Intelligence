import React, { useState, useCallback } from 'react';
import { useLanguage, HomePlant, GroundingChunk } from '../types';
import { useToast } from './Toast';
import { getHomeGardeningSuggestions } from '../services/geminiService';

const GroundingReferences: React.FC<{ chunks: GroundingChunk[] | undefined, t: (key: string) => string }> = ({ chunks, t }) => {
    if (!chunks || chunks.length === 0) return null;
    
    const links = chunks.flatMap(chunk => {
        if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri };
        if (chunk.maps) {
            const mapLinks = [{ uri: chunk.maps.uri, title: chunk.maps.title || chunk.maps.uri }];
            chunk.maps.placeAnswerSources?.forEach(source => {
                source.reviewSnippets?.forEach(snippet => {
                     mapLinks.push({ uri: snippet.uri, title: `Review by ${snippet.author}`});
                });
            });
            return mapLinks;
        }
        return [];
    }).filter((link, index, self) => index === self.findIndex(l => l.uri === link.uri)); // Remove duplicates

    if (links.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-slate-700">
            <h5 className="text-sm font-semibold text-slate-400 mb-2">{t('results.sources')}:</h5>
            <ul className="list-disc list-inside text-xs space-y-1">
                {links.map((link, index) => (
                    <li key={index}>
                        <a href={link.uri} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline break-all">
                            {link.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const HomeGardeningPage: React.FC = () => {
    const { t, language } = useLanguage();
    const { addToast } = useToast();
    const [condition, setCondition] = useState('sunnyBalcony');
    const [suggestions, setSuggestions] = useState<HomePlant[]>([]);
    const [suggestionsGrounding, setSuggestionsGrounding] = useState<GroundingChunk[] | undefined>();
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
        setSuggestionsGrounding(undefined);
        try {
            const selectedConditionLabel = conditions.find(c => c.id === condition)?.label || condition;
            const { suggestions, grounding } = await getHomeGardeningSuggestions(selectedConditionLabel, language);
            setSuggestions(suggestions);
            setSuggestionsGrounding(grounding);
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

            <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="condition-select" className="block text-sm font-medium text-slate-300 mb-2">
                            {t('homeGardening.conditionLabel')}
                        </label>
                        <select
                            id="condition-select"
                            value={condition}
                            onChange={(e) => setCondition(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500"
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
                     <div className="border-t border-slate-800 pt-8 mt-8">
                        <h3 className="text-2xl font-bold text-center text-white mb-6">{t('homeGardening.resultsTitle')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {suggestions.map((plant, index) => (
                                <div key={index} className="bg-slate-800 rounded-lg border border-slate-700 p-5 flex flex-col animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                                     <h4 className="text-xl font-bold text-emerald-400 mb-2">{plant.name}</h4>
                                     <div className="mb-3">
                                         <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-400 bg-amber-500/10">
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
                        <GroundingReferences chunks={suggestionsGrounding} t={t} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default HomeGardeningPage;