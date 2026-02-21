import React, { useState } from 'react';
import { Grant, GroundedResult } from '../types';
import { useLanguage } from '../types';
import { marked } from 'marked';

interface GrantFinderProps {
  onFindGrants: (keywords: string) => void;
  onFindGrantsWithGrounding: (keywords: string) => void;
  isLoading: boolean;
  error: string | null;
  grants: Grant[];
  groundedResult: GroundedResult | null;
  onAnalyzeGrant: (grant: Grant) => void;
  keywords: string;
  setKeywords: (keywords: string) => void;
}

const GrantItem: React.FC<{ grant: Grant, onAnalyze: (grant: Grant) => void }> = ({ grant, onAnalyze }) => {
    const { t } = useLanguage();
    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3">
            <div>
                <h4 className="font-bold text-pink-400">{grant.grantTitle}</h4>
                <p className="text-sm text-gray-400">{t('grantFinder.from')} {grant.fundingBody}</p>
            </div>
            <p className="text-sm text-gray-300">{grant.summary}</p>
            <div className="flex justify-between items-center pt-2 border-t border-slate-700/50">
                <div className="text-xs text-gray-500">
                    <strong>{t('grantAnalyzer.deadline')}:</strong> {grant.deadline}
                </div>
                <button 
                    onClick={() => onAnalyze(grant)}
                    className="px-3 py-1 bg-teal-600 text-white text-xs font-semibold rounded-md hover:bg-teal-700 transition-colors"
                >
                    {t('grantFinder.analyzeButton')}
                </button>
            </div>
        </div>
    );
};

const GrantFinder: React.FC<GrantFinderProps> = ({ onFindGrants, onFindGrantsWithGrounding, isLoading, error, grants, groundedResult, onAnalyzeGrant, keywords, setKeywords }) => {
  const { t } = useLanguage();
  const [useGrounding, setUseGrounding] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keywords.trim()) {
      if (useGrounding) {
        onFindGrantsWithGrounding(keywords);
      } else {
        onFindGrants(keywords);
      }
    }
  };

  return (
    <section id="grant-finder" className="py-12 sm:py-16">
      <div className="bg-slate-900/60 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-slate-700">
        <h2 className="text-2xl font-bold mb-6 text-white">{t('grantFinder.title')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="flex-grow bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
              placeholder={t('grantFinder.searchPlaceholder')}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex-shrink-0 flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 hover:from-blue-700 hover:to-pink-800 disabled:bg-gray-500 transition-all"
            >
              {isLoading ? t('grantFinder.searching') : t('grantFinder.searchButton')}
            </button>
          </div>
          <div className="relative flex items-start mt-4">
              <div className="flex h-6 items-center">
                  <input
                      id="use-grounding"
                      name="use-grounding"
                      type="checkbox"
                      checked={useGrounding}
                      onChange={(e) => setUseGrounding(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
              </div>
              <div className="ml-3 text-sm leading-6">
                  <label htmlFor="use-grounding" className="font-medium text-gray-300 cursor-pointer">
                      {t('grantFinder.useGrounding')}
                  </label>
              </div>
          </div>
        </form>

        <div className="mt-8">
            {isLoading && (
                <div className="text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-pink-400 mx-auto"></div>
                    <p className="mt-2">{t('grantFinder.searching')}</p>
                </div>
            )}
            {error && !isLoading && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{t('grantFinder.error')}: {error}</div>}
            
            {groundedResult && (
                <div className="animate-fade-in space-y-6">
                    <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: marked.parse(groundedResult.text) }} />
                    {groundedResult.sources && groundedResult.sources.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-pink-300 mt-6 mb-2">{t('grantFinder.sources')}:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm">
                                {groundedResult.sources.map((source, index) => (
                                    source.web && (
                                        <li key={index}>
                                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" title={source.web.title}>
                                                {source.web.title || source.web.uri}
                                            </a>
                                        </li>
                                    )
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {!isLoading && !error && !groundedResult && grants.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                    {grants.map((grant, index) => (
                        <GrantItem key={grant.link || index} grant={grant} onAnalyze={onAnalyzeGrant} />
                    ))}
                </div>
            )}

            {!isLoading && !error && grants.length === 0 && !groundedResult && keywords && (
                 <div className="text-center text-gray-500 py-10">
                    <p>{t('grantFinder.noResults')}</p>
                </div>
            )}
        </div>
      </div>
    </section>
  );
};

export default GrantFinder;