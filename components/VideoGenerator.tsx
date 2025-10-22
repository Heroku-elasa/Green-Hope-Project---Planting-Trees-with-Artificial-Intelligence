import React, { useEffect, useState, useRef, useMemo } from 'react';
// FIX: Replaced incorrect `GrantResult` type with `GroundedResult` and imported it from `types.ts`.
import { useLanguage, VideoScene, GroundedResult } from '../types';
import GoogleBabaModal from './GoogleBabaModal';
import { askGoogleBabaAboutImage } from '../services/geminiService';
import { MUSIC_LIBRARY } from '../constants';


interface VideoGeneratorProps {
    prompt: string;
    setPrompt: (value: string) => void;
    negativePrompt: string;
    setNegativePrompt: (value: string) => void;
    image: string | null;
    setImage: (value: string | null) => void;
    scenes: VideoScene[];
    onSceneChange: (index: number, newDescription: string) => void;
    onApproveScene: (index: number, isApproved: boolean) => void;
    onConfirmScene: (index: number, isConfirmed: boolean) => void;
    onGenerateScript: () => void;
    isScriptLoading: boolean;
    onGenerateSceneVideo: (sceneIndex: number, isAlternative?: boolean) => void;
    onGenerateSceneImage: (sceneIndex: number) => void;
    error: string | null;
    onClear: () => void;
    duration: number;
    setDuration: (value: number) => void;
    aspectRatio: '16:9' | '9:16' | '1:1' | '4:5';
    setAspectRatio: (value: '16:9' | '9:16' | '1:1' | '4:5') => void;
    numberOfVersions: number;
    setNumberOfVersions: (value: number) => void;
    withWatermark: boolean;
    setWithWatermark: (value: boolean) => void;
    isQuotaExhausted: boolean;
    handleApiError: (err: unknown) => string;
    musicPrompt: string;
    setMusicPrompt: (value: string) => void;
    musicDescription: string;
    isMusicLoading: boolean;
    onGenerateMusic: () => void;
    selectedMusicUrl: string | null;
    onSelectMusicUrl: (url: string | null) => void;
    videoType: 'general' | 'research_showcase';
    setVideoType: (value: 'general' | 'research_showcase') => void;
}

const Step1_InitialPrompt: React.FC<Pick<VideoGeneratorProps, 'prompt' | 'setPrompt' | 'negativePrompt' | 'setNegativePrompt' | 'image' | 'setImage' | 'onGenerateScript' | 'isScriptLoading' | 'duration' | 'setDuration' | 'aspectRatio' | 'setAspectRatio' | 'numberOfVersions' | 'setNumberOfVersions' | 'withWatermark' | 'setWithWatermark' | 'videoType' | 'setVideoType'>> = ({
    prompt, setPrompt, negativePrompt, setNegativePrompt, image, setImage, onGenerateScript, isScriptLoading, duration, setDuration, aspectRatio, setAspectRatio, numberOfVersions, setNumberOfVersions, withWatermark, setWithWatermark, videoType, setVideoType
}) => {
    const { t } = useLanguage();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() && !image) {
          alert(t('videoGenerator.validationError'));
          return;
        }
        onGenerateScript();
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="bg-slate-900/60 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-6">{t('videoGenerator.step1Title')}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300">{t('videoGenerator.videoType')}</label>
                     <div className="mt-2 grid grid-cols-2 gap-3">
                        <label className={`cursor-pointer rounded-md p-3 text-center border-2 transition-colors ${videoType === 'general' ? 'border-pink-500 bg-pink-500/10' : 'border-slate-600 bg-slate-700 hover:bg-slate-600'}`}>
                            <input type="radio" name="video-type" value="general" checked={videoType === 'general'} onChange={() => setVideoType('general')} className="sr-only" disabled={isScriptLoading}/>
                            <span className="text-sm font-semibold text-white">{t('videoGenerator.typeGeneral')}</span>
                        </label>
                        <label className={`cursor-pointer rounded-md p-3 text-center border-2 transition-colors ${videoType === 'research_showcase' ? 'border-pink-500 bg-pink-500/10' : 'border-slate-600 bg-slate-700 hover:bg-slate-600'}`}>
                            <input type="radio" name="video-type" value="research_showcase" checked={videoType === 'research_showcase'} onChange={() => setVideoType('research_showcase')} className="sr-only" disabled={isScriptLoading}/>
                            <span className="text-sm font-semibold text-white">{t('videoGenerator.typeBooth')}</span>
                        </label>
                    </div>
                </div>
                <div>
                    <label htmlFor="video-prompt" className="block text-sm font-medium text-gray-300">{t('videoGenerator.promptLabel')}</label>
                    <textarea
                        id="video-prompt"
                        rows={5}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                        placeholder={videoType === 'research_showcase' ? t('videoGenerator.boothPromptPlaceholder') : t('videoGenerator.promptPlaceholder')}
                        disabled={isScriptLoading}
                    />
                </div>
                 <div>
                    <label htmlFor="video-negative-prompt" className="block text-sm font-medium text-gray-300">{t('videoGenerator.negativePromptLabel')}</label>
                    <textarea
                        id="video-negative-prompt"
                        rows={2}
                        value={negativePrompt}
                        onChange={(e) => setNegativePrompt(e.target.value)}
                        className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                        placeholder={t('videoGenerator.negativePromptPlaceholder')}
                        disabled={isScriptLoading}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300">{t('videoGenerator.imageLabel')}</label>
                    <div className="mt-1 flex flex-col items-center justify-center p-4 border-2 border-slate-600 border-dashed rounded-md space-y-3">
                        <label htmlFor="image-upload" className="relative cursor-pointer bg-slate-700 rounded-md font-medium text-pink-400 hover:text-pink-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-pink-500 px-4 py-2 transition-colors">
                            <span>{t('videoGenerator.uploadButton')}</span>
                            <input id="image-upload" name="image-upload" type="file" className="sr-only" accept="image/png, image/jpeg, image/webp" onChange={handleImageChange} disabled={isScriptLoading}/>
                        </label>
                        <p className="text-xs text-gray-500">{t('videoGenerator.imagePrompt')}</p>
                    </div>
                    {image && (
                        <div className="mt-4 relative w-32 mx-auto">
                            <img src={image} alt="Preview" className="w-32 h-32 object-cover rounded-md" />
                            <button type="button" onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm" title={t('videoGenerator.removeImage')}>&times;</button>
                        </div>
                    )}
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-700/50">
                    <div>
                        <div className="relative flex items-start">
                            <div className="flex h-6 items-center">
                                <input
                                    id="with-watermark"
                                    name="with-watermark"
                                    type="checkbox"
                                    checked={withWatermark}
                                    onChange={(e) => setWithWatermark(e.target.checked)}
                                    className="h-4 w-4 rounded border-slate-500 bg-slate-700 text-pink-600 focus:ring-pink-500 cursor-pointer"
                                    disabled={isScriptLoading}
                                />
                            </div>
                            <div className="ml-3 text-sm leading-6">
                                <label htmlFor="with-watermark" className="font-medium text-gray-300 cursor-pointer">
                                    {t('videoGenerator.addWatermark')}
                                </label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300">{t('videoGenerator.numberOfVersions')}</label>
                        <div className="mt-2 grid grid-cols-2 gap-3">
                            {[1, 2].map(num => (
                                <label key={num} className={`cursor-pointer rounded-md p-3 text-center border-2 transition-colors ${numberOfVersions === num ? 'border-pink-500 bg-pink-500/10' : 'border-slate-600 bg-slate-700 hover:bg-slate-600'}`}>
                                    <input type="radio" name="number-of-versions" value={num} checked={numberOfVersions === num} onChange={() => setNumberOfVersions(num)} className="sr-only" disabled={isScriptLoading}/>
                                    <span className="text-sm font-semibold text-white">{num} Version{num > 1 ? 's' : ''}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300">{t('videoGenerator.aspectRatio')}</label>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {(['16:9', '9:16', '1:1', '4:5'] as const)
                                .filter(ratio => videoType === 'research_showcase' ? ['16:9', '4:5'].includes(ratio) : true)
                                .map(ratio => (
                                <label key={ratio} className={`cursor-pointer rounded-md p-3 text-center border-2 transition-colors ${aspectRatio === ratio ? 'border-pink-500 bg-pink-500/10' : 'border-slate-600 bg-slate-700 hover:bg-slate-600'}`}>
                                    <input type="radio" name="aspect-ratio" value={ratio} checked={aspectRatio === ratio} onChange={() => setAspectRatio(ratio)} className="sr-only" disabled={isScriptLoading} />
                                    <span className="text-sm font-semibold text-white">{ratio}</span>
                                    <span className="block text-xs text-gray-400">{ratio === '16:9' ? 'Widescreen' : ratio === '9:16' ? 'Vertical' : ratio === '1:1' ? 'Square' : 'Portrait'}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label htmlFor="video-duration" className="block text-sm font-medium text-gray-300">
                            {t('videoGenerator.durationLabel')} ({duration}s)
                        </label>
                        <input
                            id="video-duration"
                            type="range"
                            min={videoType === 'research_showcase' ? 15 : 10}
                            max={videoType === 'research_showcase' ? 30 : 60}
                            step="5"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="mt-2 block w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                            disabled={isScriptLoading}
                        />
                    </div>
                </div>

                <div>
                    <button type="submit" disabled={isScriptLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 hover:from-blue-700 hover:to-pink-800 disabled:bg-gray-500 disabled:cursor-not-allowed transition-all">
                        {isScriptLoading ? t('videoGenerator.generatingScriptTitle') : t('videoGenerator.generateScriptButton')}
                    </button>
                </div>
            </form>
        </div>
    );
}

const SceneItem: React.FC<{
    scene: VideoScene;
    index: number;
    onSceneChange: (index: number, newDescription: string) => void;
    onConfirmScene: (index: number, isConfirmed: boolean) => void;
    onGenerateSceneVideo: (sceneIndex: number, isAlternative?: boolean) => void;
    onGenerateSceneImage: (sceneIndex: number) => void;
    onApproveScene: (index: number, isApproved: boolean) => void;
    isQuotaExhausted: boolean;
    image: string | null;
    onAskGoogleBaba: (prompt?: string) => void;
}> = ({ scene, index, onSceneChange, onConfirmScene, onGenerateSceneVideo, onGenerateSceneImage, onApproveScene, isQuotaExhausted, image, onAskGoogleBaba }) => {
    const { t, language } = useLanguage();
    const [babaPrompt, setBabaPrompt] = useState('');
    
    const handleDownload = (url: string, type: 'video' | 'image') => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `scene_${index + 1}.${type === 'video' ? 'mp4' : 'png'}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleReadNarration = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.currentTarget.blur(); // Remove focus after click
        if ('speechSynthesis' in window) {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
            const utterance = new SpeechSynthesisUtterance(scene.narration);
            utterance.lang = language === 'fa' ? 'fa-IR' : 'en-US';
            window.speechSynthesis.speak(utterance);
        } else {
            alert("Sorry, your browser doesn't support text-to-speech.");
        }
    };

    const hasMedia = (scene.videoUrls && scene.videoUrls.length > 0) || scene.imageUrl;
    const hasVideo = scene.videoUrls && scene.videoUrls.length > 0;
    const isQuotaErrorInScene = !!scene.error?.includes('(Quota Exceeded)');

    return (
        <div className="p-4 bg-slate-900/70 rounded-md border border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Left Column: Text and Prompts */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-lg font-bold text-white">{t('videoGenerator.scene')} {index + 1}</h4>
                    <button 
                        onClick={() => onApproveScene(index, !scene.isApproved)} 
                        disabled={!hasMedia || scene.isGenerating}
                        className={`px-3 py-1 text-sm font-semibold rounded-full transition-colors flex items-center justify-center ${scene.isApproved ? 'bg-green-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-gray-300'} disabled:bg-slate-800 disabled:text-gray-500 disabled:cursor-not-allowed`}
                    >
                        {scene.isApproved && (
                            <svg
                                className="w-4 h-4 mr-1 checkmark-flourish"
                                xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                        {scene.isApproved ? t('videoGenerator.approved') : t('videoGenerator.approveScene')}
                    </button>
                </div>
                <div>
                    <label htmlFor={`narration-${index}`} className="block text-sm font-medium text-gray-400 flex items-center">
                        {t('videoGenerator.narration')}
                        <button onClick={handleReadNarration} className="ml-2 text-gray-400 hover:text-white" title={t('videoGenerator.readNarration')}>
                             <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v10H5V5zm4.45 2.22a.75.75 0 00-1.1 1.06l1.3 1.47-1.3 1.47a.75.75 0 101.1 1.06L10.56 8l1.15-1.3a.75.75 0 00-1.1-1.06L9.45 7.22z"/></svg>
                        </button>
                    </label>
                    <p id={`narration-${index}`} className="mt-1 text-gray-300 bg-slate-800 p-2 rounded-md text-sm">{scene.narration}</p>
                </div>
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <label htmlFor={`description-${index}`} className="block text-sm font-medium text-gray-400">{t('videoGenerator.visuals')}</label>
                        <button 
                            onClick={() => onConfirmScene(index, !scene.isConfirmed)} 
                            disabled={scene.isGenerating}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${scene.isConfirmed ? 'bg-slate-700 hover:bg-slate-600 text-gray-300' : 'bg-pink-600 hover:bg-pink-700 text-white'}`}
                        >
                            {scene.isConfirmed ? t('videoGenerator.editPrompt') : t('videoGenerator.confirmPrompt')}
                        </button>
                    </div>
                    <textarea 
                        id={`description-${index}`} 
                        rows={4} 
                        value={scene.description} 
                        onChange={(e) => onSceneChange(index, e.target.value)}
                        className="block w-full bg-slate-800 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white disabled:bg-slate-800/50 disabled:text-gray-400" 
                        disabled={scene.isConfirmed || scene.isGenerating}
                    />
                </div>
            </div>

            {/* Right Column: Visuals and Actions */}
            <div className="space-y-4">
                <div className="aspect-video bg-black rounded-md flex items-center justify-center relative overflow-hidden">
                    {scene.isGenerating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10">
                             <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-400"></div>
                        </div>
                    )}
                    {hasMedia ? (
                        scene.videoUrls && scene.videoUrls.length > 0 ? (
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full h-full">
                                {scene.videoUrls.map((url, i) => (
                                    <div key={i} className="relative group">
                                        <video src={url} controls className="w-full h-full object-cover" />
                                        <button onClick={() => handleDownload(url, 'video')} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title={t('videoGenerator.downloadVideo')}>
                                            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : scene.imageUrl && (
                            <div className="relative group w-full h-full">
                                <img src={scene.imageUrl} alt={scene.description} className="w-full h-full object-cover" />
                                <button onClick={() => handleDownload(scene.imageUrl!, 'image')} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title={t('videoGenerator.downloadVideo')}>
                                     <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                </button>
                            </div>
                        )
                    ) : (
                        <span className="text-gray-500 text-sm">Visuals will appear here</span>
                    )}
                </div>

                <div className="space-y-2">
                    {scene.error && !isQuotaErrorInScene && (
                        <div className="text-red-400 text-xs p-2 bg-red-900/50 rounded-md">
                           <strong>{t('videoGenerator.errorTitle')}:</strong> {scene.error.includes('PROMPT_REQUIRED') ? t('videoGenerator.promptRequiredError') : scene.error}
                        </div>
                    )}
                    {isQuotaErrorInScene && (
                        <div className="text-yellow-300 text-xs p-3 bg-yellow-900/50 rounded-md space-y-3">
                            <p>{t('videoGenerator.quotaErrorImageFallback')}</p>
                            <div className="flex flex-col space-y-2">
                                <button onClick={() => onGenerateSceneVideo(index, true)} className="w-full text-center text-xs bg-yellow-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-yellow-700 transition-colors">{t('videoGenerator.generateAlternativeVideo')}</button>
                                <button onClick={() => onGenerateSceneImage(index)} className="w-full text-center text-xs bg-slate-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-slate-500 transition-colors">{t('videoGenerator.generateAnimatedScene')}</button>
                                {image && (
                                    <div className="pt-2 border-t border-yellow-500/20">
                                        <div className="relative">
                                            <input type="text" value={babaPrompt} onChange={(e) => setBabaPrompt(e.target.value)} placeholder={t('videoGenerator.askGoogleBabaFocus')} className="w-full bg-slate-800 border-slate-600 text-xs rounded-md py-1 px-2 focus:ring-pink-500 focus:border-pink-500" />
                                            <button onClick={() => onAskGoogleBaba(babaPrompt)} className="absolute right-1 top-1/2 -translate-y-1/2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded hover:bg-blue-700">{t('videoGenerator.askGoogleBaba')}</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => onGenerateSceneVideo(index)} disabled={!scene.isConfirmed || scene.isGenerating || isQuotaExhausted} className="w-full text-center text-sm bg-gradient-to-r from-blue-600 to-purple-700 text-white font-semibold py-2 px-3 rounded-md hover:from-blue-700 hover:to-purple-800 transition-all disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed">
                            {hasVideo ? t('videoGenerator.regenerateScene') : t('videoGenerator.generateSceneVideo')}
                        </button>
                        <button onClick={() => onGenerateSceneImage(index)} disabled={!scene.isConfirmed || scene.isGenerating} className="w-full text-center text-sm bg-slate-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-slate-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {scene.imageUrl ? t('videoGenerator.regenerateSceneImage') : t('videoGenerator.generateSceneImage')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


const VideoGenerator: React.FC<VideoGeneratorProps> = (props) => {
    const { t } = useLanguage();
    const { scenes, onClear, error, isQuotaExhausted, image, handleApiError, musicPrompt, setMusicPrompt, musicDescription, isMusicLoading, onGenerateMusic, selectedMusicUrl, onSelectMusicUrl } = props;

    const [isBabaOpen, setIsBabaOpen] = useState(false);
    const [isBabaLoading, setIsBabaLoading] = useState(false);
    // FIX: Changed state type from `GrantResult` to `GroundedResult` to match the return type of `askGoogleBabaAboutImage`.
    const [babaResult, setBabaResult] = useState<GroundedResult | null>(null);
    const [babaError, setBabaError] = useState<string | null>(null);
    const [babaUserPrompt, setBabaUserPrompt] = useState<string | null>(null);

    const handleAskGoogleBaba = async (prompt?: string) => {
        if (!image) return;
        setIsBabaOpen(true);
        setIsBabaLoading(true);
        setBabaResult(null);
        setBabaError(null);
        setBabaUserPrompt(prompt || null);
        try {
            const imagePart = {
                data: image.split(',')[1],
                mimeType: image.match(/data:(.*?);/)?.[1] || 'image/jpeg'
            };
            const result = await askGoogleBabaAboutImage(imagePart, prompt);
            setBabaResult(result);
        } catch(err) {
            const msg = handleApiError(err);
            setBabaError(msg);
        } finally {
            setIsBabaLoading(false);
        }
    };
    
    const approvedCount = useMemo(() => scenes.filter(s => s.isApproved).length, [scenes]);

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                    {t('videoGenerator.title')}
                </h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('videoGenerator.subtitle')}</p>
            </div>
            
            { isQuotaExhausted && (
                <div className="mt-8 p-4 bg-red-900/50 border border-red-500/50 text-red-300 text-center rounded-md">
                   {t('videoGenerator.quotaExhaustedBanner')}
                </div>
            )}
            
            { error && !error.includes('PROMPT_REQUIRED') && (
                <div className="mt-8 p-4 bg-red-900/50 border border-red-500/50 text-red-300 rounded-md">
                   <strong>{t('videoGenerator.errorTitle')}:</strong> {error}
                </div>
            )}

            <div className="mt-12 max-w-6xl mx-auto">
                 {scenes.length === 0 ? (
                    <Step1_InitialPrompt {...props} />
                 ) : (
                    <div className="animate-fade-in space-y-12">
                        <div>
                            <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
                                <h2 className="text-2xl font-bold text-white">{t('videoGenerator.step2Title')}</h2>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-400">{t('videoGenerator.progressSavedAutomatically')}</span>
                                    <button onClick={onClear} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-md transition-colors">{t('videoGenerator.startOver')}</button>
                                </div>
                            </div>
                            <div className="space-y-6">
                                {scenes.map((scene, index) => (
                                    <SceneItem
                                        key={scene.id}
                                        scene={scene}
                                        index={index}
                                        onSceneChange={props.onSceneChange}
                                        onConfirmScene={props.onConfirmScene}
                                        onGenerateSceneVideo={props.onGenerateSceneVideo}
                                        onGenerateSceneImage={props.onGenerateSceneImage}
                                        onApproveScene={props.onApproveScene}
                                        isQuotaExhausted={isQuotaExhausted}
                                        image={image}
                                        onAskGoogleBaba={handleAskGoogleBaba}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-900/60 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-slate-700">
                             <h3 className="text-xl font-bold text-white mb-6">{t('videoGenerator.step3Title')}</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-4">
                                     <label htmlFor="music-prompt" className="block text-sm font-medium text-gray-300">{t('videoGenerator.musicPromptLabel')}</label>
                                     <textarea id="music-prompt" rows={3} value={musicPrompt} onChange={(e) => setMusicPrompt(e.target.value)}
                                        className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white" />
                                     <button onClick={onGenerateMusic} disabled={isMusicLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 hover:from-blue-700 hover:to-pink-800 disabled:bg-gray-500 transition-colors">
                                         {isMusicLoading ? t('videoGenerator.generatingMusic') : t('videoGenerator.generateMusicButton')}
                                     </button>
                                     {musicDescription && (
                                         <div className="mt-4 p-4 bg-slate-900/50 rounded-md animate-fade-in">
                                             <h4 className="font-semibold text-pink-400 mb-2">{t('videoGenerator.musicDescriptionTitle')}</h4>
                                             <div className="prose prose-sm prose-invert text-gray-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: musicDescription.replace(/\n/g, '<br />') }} />
                                         </div>
                                     )}
                                 </div>
                                 <div className="space-y-4">
                                     <h4 className="block text-sm font-medium text-gray-300">{t('videoGenerator.musicLibraryTitle')}</h4>
                                     <ul className="space-y-2">
                                         {MUSIC_LIBRARY.map(track => (
                                             <li key={track.url} className="flex items-center justify-between bg-slate-700 p-2 rounded-md">
                                                 <span className="text-sm text-white">{track.name}</span>
                                                 <div className="flex items-center space-x-2">
                                                     <audio src={track.url} controls className="h-8" />
                                                     <button onClick={() => onSelectMusicUrl(track.url)} className={`px-3 py-1 text-xs font-semibold rounded-full ${selectedMusicUrl === track.url ? 'bg-pink-600 text-white' : 'bg-slate-600 hover:bg-slate-500'}`}>
                                                        {selectedMusicUrl === track.url ? t('videoGenerator.selected') : t('videoGenerator.select')}
                                                     </button>
                                                 </div>
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             </div>
                        </div>

                         <div className="bg-slate-900/60 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-slate-700 text-center">
                             <h3 className="text-xl font-bold text-white mb-4">{t('videoGenerator.step4Title')}</h3>
                             <button disabled={approvedCount !== scenes.length || !selectedMusicUrl} className="w-full max-w-md mx-auto flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-pink-500 disabled:bg-gray-500 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors">
                                {t('videoGenerator.combineAndExport')}
                             </button>
                             <p className="text-sm text-gray-400 mt-3">
                                {approvedCount !== scenes.length ? t('videoGenerator.approveAllToCombine').replace('{approvedCount}', approvedCount.toString()).replace('{totalCount}', scenes.length.toString()) : !selectedMusicUrl ? t('videoGenerator.musicRequired') : ''}
                             </p>
                         </div>
                    </div>
                )}
            </div>
            <GoogleBabaModal 
                isOpen={isBabaOpen}
                onClose={() => setIsBabaOpen(false)}
                isLoading={isBabaLoading}
                result={babaResult}
                error={babaError}
                userPrompt={babaUserPrompt}
            />
        </div>
    );
};

export default VideoGenerator;