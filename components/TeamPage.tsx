import React from 'react';
import { useLanguage } from '../types';

interface TeamMember {
    img: string;
    name: string;
    title: string;
    bio: string;
    linkedin: string;
}

const TeamPage: React.FC = () => {
    const { t } = useLanguage();
    const members: TeamMember[] = t('teamPage.members');

    return (
        <div className="animate-fade-in text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                <div className="text-center mb-16">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                        {t('teamPage.title')}
                    </h1>
                    <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('teamPage.subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
                    {members.map((member, index) => (
                        <div key={index} className="group bg-slate-800/70 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 overflow-hidden flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                            <div className="flex-shrink-0 p-6">
                                <img src={member.img} alt={member.name} className="h-32 w-32 rounded-full object-cover mx-auto sm:mx-0 ring-4 ring-slate-700 group-hover:ring-pink-500 transition-all" />
                            </div>
                            <div className="p-6 pt-0 sm:pt-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold text-pink-400">{member.name}</h3>
                                <p className="text-md text-gray-400 mb-3">{member.title}</p>
                                <p className="text-gray-300 text-sm mb-4 flex-grow">{member.bio}</p>
                                <div className="mt-auto">
                                    <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="inline-block text-gray-400 hover:text-white transition-colors" title={`LinkedIn: ${member.name}`}>
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default TeamPage;