import React from 'react';
import { useLanguage } from '../types';

interface Project {
    img: string;
    title: string;
    description: string;
    tags: string[];
    link: string;
}

const ProjectsPage: React.FC = () => {
    const { t } = useLanguage();
    const projects: Project[] = t('home.portfolioItems');

    return (
        <div className="animate-fade-in text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                        {t('projectsPage.title')}
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('projectsPage.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {projects.map((project, index) => (
                        <div key={index} className="group bg-slate-800/70 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 overflow-hidden flex flex-col">
                            <div className="relative h-64 w-full ken-burns-container">
                                <img src={project.img} alt={project.title} className="ken-burns-image" />
                                <div className="absolute inset-0 bg-black/40"></div>
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-2xl font-bold text-pink-400 mb-2">{project.title}</h3>
                                <p className="text-gray-300 mb-4 flex-grow">{project.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map(tag => (
                                        <span key={tag} className="bg-pink-500/20 text-pink-300 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProjectsPage;