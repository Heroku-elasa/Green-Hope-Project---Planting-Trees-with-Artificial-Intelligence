import React from 'react';
import { Grant, GrantSummary } from '../types';
import { useLanguage } from '../types';

interface GrantAdopterProps {
    grant: Grant;
    isAnalyzing: boolean;
    result: GrantSummary | null;
    error: string | null;
    onClear: () => void;
    onPrepareProposal: (grant: Grant) => void;
}

const SummaryItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-400">{label}</dt>
        <dd className="mt-1 text-sm text-white sm:mt-0 sm:col-span-2 whitespace-pre-wrap">{value || 'Not Found'}</dd>
    </div>
);

const RelevanceBadge: React.FC<{ score: number }> = ({ score }) => {
    const { t } = useLanguage();
    const getPillColor = () => {
        if (score >= 75) return 'bg-green-500/20 text-green-300';
        if (score >= 50) return 'bg-yellow-500/20 text-yellow-300';
        return 'bg-red-500/20 text-red-300';
    };

    return (
        <div className={`ml-3 inline-flex items-baseline px-3 py-1 rounded-full text-sm font-semibold ${getPillColor()}`}>
            <span className="font-bold text-base">{score}</span>
            <span className="text-sm">%</span>
            <span className="ml-1.5 font-medium">{t('grantAnalyzer.relevance')}</span>
        </div>
    );
};


const GrantAdopter: React.FC<GrantAdopterProps> = ({ grant, isAnalyzing, result, error, onClear, onPrepareProposal }) => {
    const { t } = useLanguage();
    
    const createHtmlForExport = (summary: GrantSummary): string => {
        const content = `
            <h1>${t('grantAnalyzer.export.summaryTitle')}: ${summary.grantTitle}</h1>
            <p><strong>${t('grantAnalyzer.export.officialLink')}:</strong> <a href="${grant.link}">${grant.link}</a></p>
            <p><strong>${t('grantAnalyzer.export.relevance')}:</strong> ${summary.relevancePercentage}%</p>
            <h2>${t('grantAnalyzer.export.details')}</h2>
            <ul>
                <li><strong>${t('grantAnalyzer.export.fundingBody')}:</strong> ${summary.fundingBody}</li>
                <li><strong>${t('grantAnalyzer.export.deadline')}:</strong> ${summary.deadline}</li>
                <li><strong>${t('grantAnalyzer.export.amount')}:</strong> ${summary.amount}</li>
                <li><strong>${t('grantAnalyzer.export.duration')}:</strong> ${summary.duration}</li>
                <li><strong>${t('grantAnalyzer.export.geography')}:</strong> ${summary.geography}</li>
            </ul>
            <h2>${t('grantAnalyzer.export.eligibility')}</h2>
            <p>${summary.eligibility}</p>
            <h2>${t('grantAnalyzer.export.scope')}</h2>
            <p>${summary.scope}</p>
            <h2>${t('grantAnalyzer.export.applicationProcess')}</h2>
            <p>${summary.howToApply}</p>
            <h2>${t('grantAnalyzer.export.contact')}</h2>
            <p>${summary.contact}</p>
        `;

        return `<!DOCTYPE html>
        <html lang="${t('langCode')}">
        <head>
          <meta charset="UTF-8">
          <title>${t('grantAnalyzer.export.summaryTitle')}: ${summary.grantTitle}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 2rem; max-width: 800px; margin: 0 auto; color: #333; }
            h1, h2 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; }
            ul { padding-left: 20px; list-style-type: none; }
            li { margin-bottom: 0.5em; }
            p { white-space: pre-wrap; }
          </style>
        </head>
        <body>
          ${content}
        </body>
        </html>`;
    };

    const handleDownloadDOCX = async () => {
        if (!result) return;
        const htmlContent = createHtmlForExport(result);
        try {
            const htmlToDocxModule = await import('html-to-docx');
            const htmlToDocx = htmlToDocxModule.default;
            if (typeof htmlToDocx !== 'function') throw new Error('Could not convert to DOCX.');
            // FIX: Ensure the data is a Blob before creating an object URL, as html-to-docx can return an ArrayBuffer.
            const docxData = await htmlToDocx(htmlContent, '', { margins: { top: 720, right: 720, bottom: 720, left: 720 } });
            const docxBlob = docxData instanceof Blob ? docxData : new Blob([docxData], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
            const url = URL.createObjectURL(docxBlob);
            const a = document.createElement('a');
            a.href = url;
            const safeFilename = result.grantTitle.replace(/[\/\\?%*:|"<>]/g, '-').replace(/ /g, '_');
            a.download = `${t('grantAnalyzer.export.fileName')} - ${safeFilename}.docx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error("Error converting to DOCX:", e);
            alert(e instanceof Error ? e.message : "An error occurred while generating the DOCX file.");
        }
    };
    
    const handlePrint = () => {
        if (!result) return;
        const htmlContent = createHtmlForExport(result);
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
        }
    };

    return (
        <section id="grant-analyzer" className="py-12 sm:py-16 animate-fade-in">
            <div className="bg-slate-900/60 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700">
                <div className="flex justify-between items-center p-4 bg-slate-800/80 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                        <svg className="h-5 w-5 mx-2 text-teal-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                        {t('grantAnalyzer.title')}: <span className="ml-2 font-normal text-gray-300 truncate">{grant.grantTitle}</span>
                    </h3>
                    <button onClick={onClear} className="p-1 text-gray-400 hover:text-white transition-colors" title={t('grantAnalyzer.close')}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="p-6">
                    {isAnalyzing && (
                        <div className="text-center py-10">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-400 mx-auto mb-4"></div>
                            <h4 className="text-lg font-semibold text-white">{t('grantAnalyzer.loadingTitle')}</h4>
                            <p className="text-gray-400 mt-2">{t('grantAnalyzer.loadingSubtitle')}</p>
                        </div>
                    )}
                    {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
                    {result && !isAnalyzing && (
                        <div className="animate-fade-in">
                            <div className="flex justify-between items-start flex-wrap gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center">
                                      <h4 className="text-xl font-bold text-pink-400">{result.grantTitle}</h4>
                                      {typeof result.relevancePercentage === 'number' && <RelevanceBadge score={result.relevancePercentage} />}
                                    </div>
                                    <p className="text-md text-gray-300">{t('grantFinder.from')} {result.fundingBody}</p>
                                    <a href={grant.link} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline inline-flex items-center mt-1">
                                        {t('grantAnalyzer.viewOriginal')}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"><path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" /><path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" /></svg>
                                    </a>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button onClick={handleDownloadDOCX} className="px-3 py-2 bg-slate-700 text-white text-sm rounded-md hover:bg-slate-600 transition-colors" title={t('grantAnalyzer.exportDOCX')}>
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                                    </button>
                                     <button onClick={handlePrint} className="px-3 py-2 bg-slate-700 text-white text-sm rounded-md hover:bg-slate-600 transition-colors" title={t('grantAnalyzer.printPDF')}>
                                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v-2a1 1 0 011-1h8a1 1 0 011 1v2h1a2 2 0 002-2v-3a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>
                                    </button>
                                </div>
                            </div>
                            <div className="mt-5 border-t border-slate-700">
                                <dl>
                                    <SummaryItem label={t('grantAnalyzer.deadline')} value={result.deadline} />
                                    <SummaryItem label={t('grantAnalyzer.amount')} value={result.amount} />
                                    <SummaryItem label={t('grantAnalyzer.duration')} value={result.duration} />
                                    <SummaryItem label={t('grantAnalyzer.geography')} value={result.geography} />
                                    <SummaryItem label={t('grantAnalyzer.eligibility')} value={result.eligibility} />
                                    <SummaryItem label={t('grantAnalyzer.scope')} value={result.scope} />
                                    <SummaryItem label={t('grantAnalyzer.howToApply')} value={result.howToApply} />
                                    <SummaryItem label={t('grantAnalyzer.contact')} value={result.contact} />
                                </dl>
                            </div>
                            <div className="mt-6 pt-6 border-t border-slate-700">
                                <button
                                    onClick={() => onPrepareProposal(grant)}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 transition-colors"
                                >
                                    {t('grantAnalyzer.useForProposal')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default GrantAdopter;