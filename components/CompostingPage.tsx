import React from 'react';
import { useLanguage, Page } from '../types';

interface ListItem {
    title: string;
    text: string;
}

interface CompostingPageProps {
    setPage: (page: Page) => void;
}

const CompostingPage: React.FC<CompostingPageProps> = ({ setPage }) => {
    const { t } = useLanguage();
    
    // Data from translations
    const hero = t('compostingPage.hero');
    const methods = t('compostingPage.methods');
    const homeGuide = t('compostingPage.homeGuide');
    const businessGuide = t('compostingPage.businessGuide');
    const aiSection = t('compostingPage.aiSection');
    const closing = t('compostingPage.closing');
    const ctaText = t('compostingPage.cta');
    
    // Type assertion for safety
    const methodTypes: { name: string; bestFor: string; effort: string; time: string; }[] = methods.types || [];
    const homeSteps: ListItem[] = homeGuide.steps || [];
    const businessSteps: ListItem[] = businessGuide.steps || [];
    const aiFeatures: ListItem[] = aiSection.features || [];

    return (
        <div className="animate-fade-in text-white">
            {/* Hero Section */}
            <section className="bg-slate-800/50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-teal-400 to-sky-500 tracking-tight">
                        {hero.title}
                    </h1>
                    <p className="mt-6 text-lg text-gray-300 max-w-3xl mx-auto">
                        {hero.subtitle}
                    </p>
                </div>
            </section>
            
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="max-w-4xl mx-auto space-y-20">
                    {/* Methods Section */}
                    <section>
                        <h2 className="text-3xl font-bold text-center text-white mb-12">{methods.title}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {methodTypes.map((type) => (
                                <div key={type.name} className="bg-slate-800/70 p-6 rounded-lg border border-slate-700 space-y-3 transition-all hover:border-teal-500/50 hover:bg-slate-800">
                                    <h3 className="text-xl font-bold text-teal-400">{type.name}</h3>
                                    <p><strong className="text-gray-400">Best for:</strong> <span className="text-gray-300">{type.bestFor}</span></p>
                                    <p><strong className="text-gray-400">Effort:</strong> <span className="text-gray-300">{type.effort}</span></p>
                                    <p><strong className="text-gray-400">Time:</strong> <span className="text-gray-300">{type.time}</span></p>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {/* Home Guide Section */}
                    <section>
                        <h2 className="text-3xl font-bold text-center text-white mb-12">{homeGuide.title}</h2>
                        <div className="space-y-8">
                            {homeSteps.map((step) => (
                                <div key={step.title} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-teal-500/20 text-teal-300 font-bold text-xl">{step.title.split('.')[0]}</div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{step.title.substring(step.title.indexOf('.') + 1).trim()}</h3>
                                        <p className="mt-1 text-gray-400">{step.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Business Guide Section */}
                    <section>
                        <h2 className="text-3xl font-bold text-center text-white mb-12">{businessGuide.title}</h2>
                         <div className="bg-slate-800/70 p-8 rounded-lg border border-slate-700 space-y-6">
                            {businessSteps.map((step: ListItem) => (
                                <div key={step.title}>
                                    <h3 className="text-xl font-bold text-teal-400">{step.title}</h3>
                                    <p className="mt-1 text-gray-300">{step.text}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                    
                    {/* AI Section */}
                    <section>
                        <h2 className="text-3xl font-bold text-center text-white mb-12">{aiSection.title}</h2>
                        <div className="bg-slate-800/70 p-8 rounded-lg border border-slate-700 space-y-6">
                            <p className="text-center text-gray-300 mb-6">{aiSection.intro}</p>
                            {aiFeatures.map((feature: ListItem) => (
                                <div key={feature.title} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 text-teal-400 mt-1">
                                         <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 01-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 013.09-3.09L12 5.25l.813 2.846a4.5 4.5 0 013.09 3.09L18.75 12l-2.846.813a4.5 4.5 0 01-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.898 20.572L16.25 21.75l-.648-1.178a3.375 3.375 0 00-2.455-2.456L12 17.25l1.178-.648a3.375 3.375 0 002.455-2.456L16.25 13.5l.648 1.178a3.375 3.375 0 002.456 2.456L20.25 18l-1.178.648a3.375 3.375 0 00-2.456 2.456z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-teal-400">{feature.title}</h3>
                                        <p className="mt-1 text-gray-400">{feature.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>


                    {/* Closing Section */}
                    <section className="text-center bg-slate-800/50 p-10 rounded-lg border border-slate-700">
                        <h2 className="text-3xl font-bold text-white mb-4">{closing.title}</h2>
                        <p className="text-gray-300 max-w-3xl mx-auto leading-relaxed">{closing.text}</p>
                    </section>

                    {/* CTA Section */}
                    <section className="text-center">
                        <button 
                            onClick={() => setPage('generator')}
                            className="px-10 py-4 bg-gradient-to-r from-teal-500 to-sky-600 text-white font-bold rounded-lg shadow-lg hover:scale-105 transition-transform text-lg"
                        >
                            {ctaText}
                        </button>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default CompostingPage;