
import React from 'react';
import { useLanguage } from '../types';

interface ImageEditorProps {
    originalImage: string | null;
    setOriginalImage: (image: string | null) => void;
    editedImage: string | null;
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    error: string | null;
    onClear: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({
    originalImage,
    setOriginalImage,
    editedImage,
    prompt,
    setPrompt,
    onGenerate,
    isLoading,
    error,
    onClear,
}) => {
    const { t } = useLanguage();

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleDownload = () => {
        if (!editedImage) return;
        const a = document.createElement('a');
        a.href = editedImage;
        a.download = `edited-image.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                    {t('imageEditor.title')}
                </h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('imageEditor.subtitle')}</p>
            </div>

            <div className="mt-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Control Panel */}
                <div className="bg-slate-900/60 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-slate-700 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">{t('imageEditor.uploadLabel')}</label>
                        <div className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-slate-600 border-dashed rounded-md space-y-3">
                             {!originalImage ? (
                                <>
                                    <label htmlFor="image-upload" className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-pink-400 hover:text-pink-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-pink-500 px-4 py-2 transition-colors">
                                        <span>{t('imageEditor.uploadButton')}</span>
                                        <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageUpload} disabled={isLoading}/>
                                    </label>
                                    <p className="text-xs text-gray-500">{t('imageEditor.uploadPrompt')}</p>
                                </>
                             ) : (
                                 <div className="relative">
                                    <img src={originalImage} alt="Original" className="max-h-48 rounded-md" />
                                 </div>
                             )}
                        </div>
                    </div>
                    
                    <div>
                        <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300">{t('imageEditor.editPromptLabel')}</label>
                        <textarea
                            id="edit-prompt"
                            rows={4}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                            placeholder={t('imageEditor.editPromptPlaceholder')}
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={onGenerate}
                            disabled={isLoading || !originalImage || !prompt}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 hover:from-blue-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? t('imageEditor.generatingButton') : t('imageEditor.generateButton')}
                        </button>
                         <button
                            onClick={onClear}
                            disabled={isLoading}
                            className="w-full sm:w-auto flex justify-center py-3 px-6 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-400 transition-colors"
                        >
                            {t('imageEditor.clearButton')}
                        </button>
                    </div>

                </div>

                {/* Display Panel */}
                <div className="bg-slate-900/60 rounded-lg p-4 shadow-lg backdrop-blur-sm border border-slate-700 min-h-[400px] flex flex-col">
                     <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">{t('imageEditor.resultTitle')}</h3>
                        {editedImage && (
                            <button onClick={handleDownload} className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-md transition-colors flex items-center">
                                {t('imageEditor.downloadButton')}
                            </button>
                        )}
                    </div>
                     <div className="flex-grow flex items-center justify-center p-4">
                        {isLoading && (
                             <div className="flex flex-col items-center justify-center text-center text-gray-400">
                                <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-400"></div>
                                <span className="mt-3">{t('imageEditor.generatingButton')}</span>
                            </div>
                        )}
                        {error && !isLoading && (
                            <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>
                        )}
                        {editedImage && !isLoading && (
                             <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain rounded-md animate-fade-in" />
                        )}
                        {!isLoading && !editedImage && !error && (
                             <div className="text-center text-gray-500">
                                <p>{t('imageEditor.placeholder')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImageEditor;
