import React, { useState, useEffect } from 'react';
import { useLanguage, Page } from '../types';
import { marked } from 'marked';

interface HomeCompostingPageProps {
  setPage: (page: Page) => void;
  compostPlan: string;
  isCompostPlanLoading: boolean;
  compostPlanError: string | null;
  onGenerateCompostPlan: (waste: string, space: string, climate: string) => void;
  compostAdvice: string;
  isCompostAdviceLoading: boolean;
  compostAdviceError: string | null;
  onTroubleshootCompost: (problem: string) => void;
  businessAdvice: string;
  isBusinessAdviceLoading: boolean;
  businessAdviceError: string | null;
  onGenerateBusinessIdeas: (query: string) => void;
  compostVisionResult: string;
  isCompostVisionLoading: boolean;
  compostVisionError: string | null;
  onAnalyzeCompostImage: (imageData: string, mimeType: string, question: string) => void;
}

const Icon: React.FC<{ iconKey: string; className?: string }> = ({ iconKey, className = "w-12 h-12" }) => {
    const icons: { [key: string]: React.ReactElement } = {
        hot: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4.5a5 5 0 0 0-7 7L9 13l-2.5 2.5a7 7 0 0 0 9.9 0l-2.5-2.5 1.5-1.5a5 5 0 0 0-7-7z"></path><path d="M14.5 11.5 9.5 6.5"></path></svg>,
        cold: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a5 5 0 0 0-5 5c0 1.94.94 3.69 2.43 4.72C8.3 12.56 8 13.78 8 15c0 2.22 1.21 4.16 3 5.19l-1.42 1.42C8.33 22.88 7 22.24 7 20c0-2 1-3.5 2.5-4.5C10.5 15 11 14.08 11 13c0-1.38-.5-2.6-1.5-3.5C8.5 8.5 8 7.2 8 6a4 4 0 0 1 8 0c0 1.2-.5 2.5-1.5 3.5C13.5 10.4 13 11.62 13 13c0 1.08.19 2.12.53 3.09"></path><path d="M17.8 21.8a2.5 2.5 0 0 0 3.2-3.2l-1.3-1.3a2.5 2.5 0 0 0-3.2 3.2l1.3 1.3Z"></path></svg>,
        vermi: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7.5 19a5 5 0 1 0-5-5"></path><path d="M5.5 15.5a2.5 2.5 0 1 0-2.5-2.5"></path><path d="M16.5 19a5 5 0 1 1 5-5"></path><path d="M18.5 15.5a2.5 2.5 0 1 1 2.5-2.5"></path><path d="M12 11a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"></path><path d="M12 11v6a2 2 0 0 0 2 2h2"></path><path d="M12 11V5a2 2 0 0 1 2-2h4"></path></svg>,
        bokashi: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
        location: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
        bin: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"></path><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>,
        layers: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>,
        activator: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4"></path><path d="M12 22v-4"></path><path d="m4.93 4.93 2.83 2.83"></path><path d="m16.24 16.24 2.83 2.83"></path><path d="M2 12h4"></path><path d="M18 12h4"></path><path d="m4.93 19.07 2.83-2.83"></path><path d="m16.24 7.76 2.83-2.83"></path></svg>,
        moisture: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path></svg>,
        aerate: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.4 1.4 3.1 2.3 5 2.3-1.2 2.6-3.9 3.2-6.1 2.3-.5-.2-1-.4-1.5-.7-1.1-.5-2.3-1-3.6-1.1-1.3-.1-2.6.2-3.8.8-1.5.8-3.1 1.9-4.5 3.2-1.4-1.3-2.5-2.8-3.2-4.5-.6-1.2-.9-2.5-.8-3.8.1-1.3.6-2.5 1.1-3.6.3-.5.5-1 .7-1.5 1-2.2 1.7-4.9-2.3-6.1C3.8 3.1 4.7 1.4 5.7.4c1.3-1.3 3.4-2.1 5.4-1.2z"></path></svg>,
        harvest: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 6 7z"></path><path d="M12 12v10"></path></svg>,
        brain: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7v0A2.5 2.5 0 0 1 7 4.5v0A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7v0A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 14.5 2Z" /><path d="M12 7.5c-2 0-2.5-1-4.5-1-2 0-2.5 1-4.5 1" /><path d="M12 7.5c2 0 2.5-1 4.5-1 2 0 2.5 1 4.5 1" /><path d="M4.5 10.5c-1.5 0-2.5.5-2.5 3v0c0 1.5 1 3 2.5 3" /><path d="M19.5 10.5c1.5 0 2.5.5 2.5 3v0c0 1.5-1 3-2.5 3" /><path d="M4.5 14h15" /><path d="M7 16.5c.5 1.5 1.5 3 5 3s4.5-1.5 5-3" /><path d="M10 12.5c0 .5.5 1.5 2 1.5s2-1 2-1.5" /><path d="M7 12c-1-1.5-1-3 0-4.5" /><path d="M17 12c1-1.5 1-3 0-4.5" /></svg>,
        troubleshoot: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9.06 2 2 1-1 2-2-1-3 2v5l-1 2-2-1-1 3 2 1 1 3 2 1 3-1 1-3 1 2 3-1 2-2-1-2v-5l-2-2-2 1-1-2-1-1Z" /><path d="m9.06 2 6 6" /><path d="M15.06 2l-6 6" /><path d="M12 7.5a4.5 4.5 0 1 1-4.5 4.5 4.5 4.5 0 0 1 4.5-4.5Z" /></svg>,
        advisor: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L6.5 7.5 7 14l-4 3 2 4h14l2-4-4-3 .5-6.5L12 2z" /><path d="M12 2v6" /><path d="M15.5 9.5 12 12l-3.5-2.5" /></svg>,
        vision: <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>,
    };
    return icons[iconKey] || <div className={className}></div>;
};

const AIResultDisplay: React.FC<{isLoading: boolean, error: string | null, result: string, title: string}> = ({ isLoading, error, result, title }) => {
    const { t } = useLanguage();
    const [htmlResult, setHtmlResult] = useState('');

    useEffect(() => {
        if (result) {
            setHtmlResult(marked.parse(result) as string);
        } else {
            setHtmlResult('');
        }
    }, [result]);
    
    if (!isLoading && !error && !result) {
        return null; // Don't render anything if there's no activity
    }

    return (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 animate-fade-in min-h-[10rem]">
            <h4 className="font-semibold text-pink-400 mb-2">{title}</h4>
            {isLoading && (
                <div className="flex items-center justify-center h-full">
                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-pink-400"></div>
                    <span className="ml-2 text-gray-400">{t('compostingPage.aiAssistant.generating')}</span>
                </div>
            )}
            {error && <div className="text-red-400 p-2 bg-red-900/50 rounded-md text-sm">{error}</div>}
            {result && !isLoading && (
                 <div className="prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: htmlResult }} />
            )}
        </div>
    );
};

const HomeCompostingPage: React.FC<HomeCompostingPageProps> = (props) => {
    const { t } = useLanguage();
    const { setPage, onGenerateCompostPlan, onTroubleshootCompost, onGenerateBusinessIdeas, onAnalyzeCompostImage, ...aiProps } = props;

    const methods = t('compostingPage.methods');
    const guideSteps = t('compostingPage.guideSteps');
    const businessSteps = t('compostingPage.businessSteps');

    // State for Compost Planner form
    const [wasteType, setWasteType] = useState('mixed');
    const [space, setSpace] = useState('small_yard');
    const [climate, setClimate] = useState('temperate');
    
    // State for Troubleshooter form
    const [problem, setProblem] = useState('');

    // State for Business Advisor form
    const [query, setQuery] = useState('');
    
    // State for Vision Analyzer form
    const [visionImage, setVisionImage] = useState<string | null>(null);
    const [visionQuestion, setVisionQuestion] = useState('');


    const handlePlanSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerateCompostPlan(wasteType, space, climate);
    };

    const handleTroubleshootSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (problem.trim()) onTroubleshootCompost(problem);
    };

    const handleBusinessSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) onGenerateBusinessIdeas(query);
    };
    
    const handleVisionImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setVisionImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleVisionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (visionImage && visionQuestion.trim()) {
            const [mimeType, base64Data] = visionImage.split(';base64,');
            onAnalyzeCompostImage(base64Data, mimeType.replace('data:', ''), visionQuestion);
        }
    };

    return (
        <div className="animate-fade-in text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                        {t('compostingPage.title')}
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">{t('compostingPage.subtitle')}</p>
                </div>

                {/* Methods Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-10 text-white">{t('compostingPage.methodsTitle')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {methods.map((method: any) => (
                            <div key={method.title} className="group bg-slate-800/70 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 overflow-hidden flex flex-col">
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img src={method.img} alt={method.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6 flex-grow flex flex-col text-center">
                                    <h3 className="text-xl font-bold text-pink-400">{method.title}</h3>
                                    <ul className="mt-4 space-y-2 text-sm text-gray-300 flex-grow">
                                        <li><strong>Best for:</strong> {method.bestFor}</li>
                                        <li><strong>Effort:</strong> {method.effort}</li>
                                        <li><strong>Time:</strong> {method.time}</li>
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Step-by-Step Guide */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-10 text-white">{t('compostingPage.guideTitle')}</h2>
                    <div className="max-w-4xl mx-auto space-y-12">
                        {guideSteps.map((step: any, index: number) => (
                             <div key={step.title} className={`flex flex-col md:flex-row items-center gap-8 ${index % 2 === 1 ? 'md:flex-row-reverse' : ''}`}>
                                <div className="md:w-1/2 flex-shrink-0">
                                    <img src={step.img} alt={step.title} className="rounded-lg shadow-lg w-full h-auto object-cover aspect-video" />
                                </div>
                                <div className="md:w-1/2">
                                    <div className="flex items-center mb-2">
                                        <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full bg-slate-700 text-pink-400 mr-3 rtl:ml-3 rtl:mr-0">
                                            <Icon iconKey={step.iconKey} className="w-5 h-5" />
                                        </div>
                                        <h4 className="text-xl font-semibold text-white">{step.title}</h4>
                                    </div>
                                    <p className="text-gray-400 md:ml-[52px] rtl:md:mr-[52px] rtl:md:ml-0">{step.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
                
                 {/* AI Assistant Section */}
                <section className="mb-20">
                    <div className="text-center mb-12">
                         <h2 className="text-3xl font-bold text-white sm:text-4xl">{t('compostingPage.aiAssistant.title')}</h2>
                         <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">{t('compostingPage.aiAssistant.subtitle')}</p>
                    </div>
                    <div className="space-y-12 max-w-4xl mx-auto">
                        {/* Tool 1: Compost Planner */}
                        <div className="bg-slate-800/50 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 p-8">
                            <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                <Icon iconKey="brain" className="w-10 h-10 text-pink-400 flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{t('compostingPage.aiAssistant.planTitle')}</h3>
                                    <p className="text-gray-400 mt-1">{t('compostingPage.aiAssistant.planDescription')}</p>
                                </div>
                            </div>
                            <form onSubmit={handlePlanSubmit} className="mt-6 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">{t('compostingPage.aiAssistant.planWasteLabel')}</label>
                                        <select value={wasteType} onChange={e => setWasteType(e.target.value)} className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white">
                                            {Object.entries(t('compostingPage.aiAssistant.planWasteOptions')).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">{t('compostingPage.aiAssistant.planSpaceLabel')}</label>
                                        <select value={space} onChange={e => setSpace(e.target.value)} className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white">
                                            {Object.entries(t('compostingPage.aiAssistant.planSpaceOptions')).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300">{t('compostingPage.aiAssistant.planClimateLabel')}</label>
                                        <select value={climate} onChange={e => setClimate(e.target.value)} className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white">
                                            {Object.entries(t('compostingPage.aiAssistant.planClimateOptions')).map(([key, value]) => <option key={key} value={key}>{value as string}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" disabled={aiProps.isCompostPlanLoading} className="w-full md:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 transition-all">{t('compostingPage.aiAssistant.planButton')}</button>
                            </form>
                            <AIResultDisplay isLoading={aiProps.isCompostPlanLoading} error={aiProps.compostPlanError} result={aiProps.compostPlan} title={t('compostingPage.aiAssistant.resultTitle')} />
                        </div>
                        
                        {/* Tool 2: Troubleshooter */}
                        <div className="bg-slate-800/50 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 p-8">
                             <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                <Icon iconKey="troubleshoot" className="w-10 h-10 text-pink-400 flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{t('compostingPage.aiAssistant.troubleshooterTitle')}</h3>
                                    <p className="text-gray-400 mt-1">{t('compostingPage.aiAssistant.troubleshooterDescription')}</p>
                                </div>
                            </div>
                            <form onSubmit={handleTroubleshootSubmit} className="mt-6 space-y-4">
                                <textarea value={problem} onChange={e => setProblem(e.target.value)} rows={3} className="block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white" placeholder={t('compostingPage.aiAssistant.troubleshooterPlaceholder')}></textarea>
                                <button type="submit" disabled={aiProps.isCompostAdviceLoading} className="w-full md:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 transition-all">{t('compostingPage.aiAssistant.troubleshooterButton')}</button>
                            </form>
                             <AIResultDisplay isLoading={aiProps.isCompostAdviceLoading} error={aiProps.compostAdviceError} result={aiProps.compostAdvice} title={t('compostingPage.aiAssistant.resultTitle')} />
                        </div>

                        {/* Tool 3: Business Advisor */}
                         <div className="bg-slate-800/50 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 p-8">
                             <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                <Icon iconKey="advisor" className="w-10 h-10 text-pink-400 flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{t('compostingPage.aiAssistant.advisorTitle')}</h3>
                                    <p className="text-gray-400 mt-1">{t('compostingPage.aiAssistant.advisorDescription')}</p>
                                </div>
                            </div>
                            <form onSubmit={handleBusinessSubmit} className="mt-6 space-y-4">
                                <textarea value={query} onChange={e => setQuery(e.target.value)} rows={3} className="block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white" placeholder={t('compostingPage.aiAssistant.advisorPlaceholder')}></textarea>
                                <button type="submit" disabled={aiProps.isBusinessAdviceLoading} className="w-full md:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 transition-all">{t('compostingPage.aiAssistant.advisorButton')}</button>
                            </form>
                             <AIResultDisplay isLoading={aiProps.isBusinessAdviceLoading} error={aiProps.businessAdviceError} result={aiProps.businessAdvice} title={t('compostingPage.aiAssistant.resultTitle')} />
                        </div>
                        
                        {/* Tool 4: Vision Analyzer */}
                         <div className="bg-slate-800/50 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 p-8">
                             <div className="flex items-start space-x-4 rtl:space-x-reverse">
                                <Icon iconKey="vision" className="w-10 h-10 text-pink-400 flex-shrink-0 mt-1"/>
                                <div>
                                    <h3 className="text-xl font-bold text-white">{t('compostingPage.aiAssistant.visionTitle')}</h3>
                                    <p className="text-gray-400 mt-1">{t('compostingPage.aiAssistant.visionDescription')}</p>
                                </div>
                            </div>
                            <form onSubmit={handleVisionSubmit} className="mt-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">{t('compostingPage.aiAssistant.visionUploadLabel')}</label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md">
                                        <div className="space-y-1 text-center">
                                            {visionImage ? (
                                                <img src={visionImage} alt="Compost preview" className="mx-auto h-24 w-auto rounded-md" />
                                            ) : (
                                                <svg className="mx-auto h-12 w-12 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                                                </svg>
                                            )}
                                            <div className="flex justify-center text-sm text-gray-400">
                                                <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-pink-400 hover:text-pink-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-pink-500 px-3 py-1">
                                                    <span>{t('compostingPage.aiAssistant.visionUploadButton')}</span>
                                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleVisionImageChange} />
                                                </label>
                                                <p className="pl-1 rtl:pr-1 rtl:pl-0">{t('compostingPage.aiAssistant.visionDragAndDrop')}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">{t('compostingPage.aiAssistant.visionFileTypeInfo')}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300">{t('compostingPage.aiAssistant.visionQuestionLabel')}</label>
                                     <textarea value={visionQuestion} onChange={e => setVisionQuestion(e.target.value)} rows={3} className="block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white" placeholder={t('compostingPage.aiAssistant.visionQuestionPlaceholder')}></textarea>
                                </div>
                                <button type="submit" disabled={aiProps.isCompostVisionLoading || !visionImage || !visionQuestion.trim()} className="w-full md:w-auto flex justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 disabled:from-gray-500 disabled:to-gray-600 transition-all">{t('compostingPage.aiAssistant.visionButton')}</button>
                            </form>
                             <AIResultDisplay isLoading={aiProps.isCompostVisionLoading} error={aiProps.compostVisionError} result={aiProps.compostVisionResult} title={t('compostingPage.aiAssistant.resultTitle')} />
                        </div>

                    </div>
                </section>
                
                {/* Business Section */}
                <section className="mb-20">
                    <h2 className="text-3xl font-bold text-center mb-10 text-white">{t('compostingPage.businessTitle')}</h2>
                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {businessSteps.map((step: any) => (
                             <div key={step.title} className="group bg-slate-800/70 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 overflow-hidden flex flex-col">
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img src={step.img} alt={step.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <h4 className="text-lg font-semibold text-pink-400">{step.title}</h4>
                                    <p className="mt-2 text-gray-300 text-sm flex-grow">{step.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="bg-slate-800/70 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 p-10 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">{t('compostingPage.ctaTitle')}</h2>
                    <p className="text-gray-300 max-w-3xl mx-auto mb-8">{t('compostingPage.ctaText')}</p>
                    <button
                        onClick={() => setPage('generator')}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 text-white font-semibold rounded-md shadow-lg hover:scale-105 transition-transform"
                    >
                        {t('compostingPage.ctaButton')}
                    </button>
                </section>

            </div>
        </div>
    );
};

export default HomeCompostingPage;