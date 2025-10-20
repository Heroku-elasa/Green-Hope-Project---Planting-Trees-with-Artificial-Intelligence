import React from 'react';
import { useLanguage } from '../types';

const BlogGenerator: React.FC = () => {
    const { t } = useLanguage();
    return (
        <div className="py-12 sm:py-16">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                    Blog Post Generator
                </h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">
                    This feature is coming soon.
                </p>
            </div>
        </div>
    );
};

export default BlogGenerator;
