import React from 'react';
// FIX: The 'is not a module' error was caused by empty 'types.ts' and 'geminiService.ts' files.
// By adding content and exports to these files, the modules can be resolved correctly. The import paths are correct.
// FIX: Replaced incorrect `GrantResult` type with `GroundedResult` and imported it from `types.ts`.
import { useLanguage, GroundedResult } from '../types';

interface GoogleBabaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: GroundedResult | null;
  error: string | null;
  userPrompt: string | null;
}

const GoogleBabaModal: React.FC<GoogleBabaModalProps> = ({ isOpen, onClose, isLoading, result, error, userPrompt }) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 border border-pink-500/50 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4">
           <h3 className="text-lg font-semibold leading-6 text-white">{t('googleBabaModal.title')}</h3>
           <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors" aria-label={t('googleBabaModal.close')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        <div className="overflow-y-auto pr-2 flex-grow">
          {isLoading && (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-400 mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-white">{t('googleBabaModal.loading')}</h4>
            </div>
          )}
          {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
          {result && (
            <div className="space-y-4 animate-fade-in">
              {userPrompt && (
                <div>
                  <h4 className="font-semibold text-pink-300">{t('googleBabaModal.userFocus')}</h4>
                   <blockquote className="mt-2 pl-4 border-l-4 border-gray-600 text-gray-400 italic">
                    "{userPrompt}"
                  </blockquote>
                </div>
              )}
              <div>
                <h4 className="font-semibold text-pink-300">{t('googleBabaModal.resultsTitle')}</h4>
                <div className="prose prose-sm prose-invert max-w-none text-gray-300 whitespace-pre-wrap mt-2" dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br />') }} />
              </div>
              {result.sources && result.sources.length > 0 && (
                <div>
                   <h4 className="font-semibold text-pink-300">{t('googleBabaModal.sourcesTitle')}</h4>
                   <ul className="list-disc list-inside mt-2 space-y-1">
                     {result.sources.map((source, index) => (
                       source.web && (
                         <li key={index} className="text-sm">
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
        </div>
         <div className="mt-5 sm:mt-6 pt-4 border-t border-gray-700 text-right">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-white hover:bg-gray-600 focus:outline-none sm:text-sm"
          >
            {t('googleBabaModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleBabaModal;