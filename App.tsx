import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './components/Header';
import SiteFooter from './components/Footer';
import HomePage from './components/Hero';
import ReportGenerator from './components/ReportGenerator';
import GrantFinder from './components/GrantFinder';
import GrantAdopter from './components/GrantAdopter';
import VideoGenerator from './components/VideoGenerator';
import ProjectsPage from './components/ProjectsPage';
import TeamPage from './components/TeamPage';
import FunctionDocsPage from './components/FunctionDocsPage';
import BlogGenerator from './components/BlogGenerator';
import HomeCompostingPage from './components/HomeCompostingPage';
import QuotaErrorModal from './components/QuotaErrorModal';
import Chatbot from './components/Chatbot';
import { Page, Grant, GrantSummary, VideoScene, ChatMessage, useLanguage, UserProfile } from './types';
import * as geminiService from './services/geminiService';
import type { Content } from '@google/genai';


const decodeJwt = (token: string): any => {
    try {
        return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
};

const App: React.FC = () => {
    const { t } = useLanguage();
    const [page, setPage] = useState<Page>('home');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);

    // Report Generator State
    const [generatedReport, setGeneratedReport] = useState('');
    const [isReportComplete, setIsReportComplete] = useState(false);
    const [reportTopic, setReportTopic] = useState('');
    const [reportDescription, setReportDescription] = useState('');
    const [reportType, setReportType] = useState('reforestation_plan');

    // Grant Finder State
    const [grantKeywords, setGrantKeywords] = useState('');
    const [foundGrants, setFoundGrants] = useState<Grant[]>([]);
    const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
    const [isAnalyzingGrant, setIsAnalyzingGrant] = useState(false);
    const [grantAnalysis, setGrantAnalysis] = useState<GrantSummary | null>(null);
    const [grantAnalysisError, setGrantAnalysisError] = useState<string | null>(null);

    // Video Generator State
    const [videoPrompt, setVideoPrompt] = useState('');
    const [videoNegativePrompt, setVideoNegativePrompt] = useState('');
    const [videoImage, setVideoImage] = useState<string | null>(null);
    const [videoScenes, setVideoScenes] = useState<VideoScene[]>([]);
    const [isScriptLoading, setIsScriptLoading] = useState(false);
    const [videoDuration, setVideoDuration] = useState(30);
    const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:5'>('16:9');
    const [videoVersions, setVideoVersions] = useState(1);
    const [videoWithWatermark, setVideoWithWatermark] = useState(true);
    const [videoMusicPrompt, setVideoMusicPrompt] = useState('');
    const [videoMusicDescription, setVideoMusicDescription] = useState('');
    const [isMusicLoading, setIsMusicLoading] = useState(false);
    const [selectedMusicUrl, setSelectedMusicUrl] = useState<string | null>(null);
    const [videoType, setVideoType] = useState<'general' | 'research_showcase'>('general');

    // Chatbot State
    const [chatHistory, setChatHistory] = useState<Content[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
    
    // AI Composting Assistant State
    const [compostPlan, setCompostPlan] = useState('');
    const [isCompostPlanLoading, setIsCompostPlanLoading] = useState(false);
    const [compostPlanError, setCompostPlanError] = useState<string | null>(null);

    const [compostAdvice, setCompostAdvice] = useState('');
    const [isCompostAdviceLoading, setIsCompostAdviceLoading] = useState(false);
    const [compostAdviceError, setCompostAdviceError] = useState<string | null>(null);

    const [businessAdvice, setBusinessAdvice] = useState('');
    const [isBusinessAdviceLoading, setIsBusinessAdviceLoading] = useState(false);
    const [businessAdviceError, setBusinessAdviceError] = useState<string | null>(null);

    const [compostVisionResult, setCompostVisionResult] = useState('');
    const [isCompostVisionLoading, setIsCompostVisionLoading] = useState(false);
    const [compostVisionError, setCompostVisionError] = useState<string | null>(null);


    // General State
    const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);

    const handleCredentialResponse = useCallback((response: any) => {
        const idToken = response.credential;
        localStorage.setItem('googleIdToken', idToken);
        const userObject = decodeJwt(idToken);
        if (userObject) {
            setUser({
                name: userObject.name,
                email: userObject.email,
                picture: userObject.picture,
            });
        }
    }, []);

    const handleLogout = useCallback(() => {
        // @ts-ignore
        if (window.google) {
            // @ts-ignore
            google.accounts.id.disableAutoSelect();
        }
        localStorage.removeItem('googleIdToken');
        setUser(null);
    }, []);

    useEffect(() => {
        const initializeGsi = () => {
            // @ts-ignore
            if (window.google) {
                // @ts-ignore
                google.accounts.id.initialize({
                    // IMPORTANT: Replace with your actual Google Client ID
                    client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
                    callback: handleCredentialResponse,
                });
                
                const storedToken = localStorage.getItem('googleIdToken');
                if (storedToken) {
                    const userObject = decodeJwt(storedToken);
                    // Check if token is expired
                    if (userObject && userObject.exp * 1000 > Date.now()) {
                        setUser({
                            name: userObject.name,
                            email: userObject.email,
                            picture: userObject.picture,
                        });
                    } else {
                        localStorage.removeItem('googleIdToken');
                    }
                }
            }
        };

        const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
        if (script instanceof HTMLScriptElement) {
            script.onload = () => initializeGsi();
        }
        // @ts-ignore
        if (window.google) {
            initializeGsi();
        }
    }, [handleCredentialResponse]);

    const handleApiError = useCallback((err: unknown): string => {
        let message = 'An unexpected error occurred.';
        if (err instanceof Error) {
            message = err.message;
            // Handle Quota errors
            if (message.includes('429') || message.includes('quota') || message.includes('billing')) {
                setIsQuotaExhausted(true);
                return t('quotaErrorModal.body');
            }
            // Handle Internal Server errors (500-level) based on user's feedback
            if (message.includes('500') || message.toLowerCase().includes('internal server error') || message.toLowerCase().includes('rpc failed')) {
                return 'A temporary server issue occurred. This is likely a transient problem. Please wait a few moments and try your request again. If the problem persists, consider simplifying your prompt.';
            }
        } else if (typeof err === 'string') {
            message = err;
        }
        console.error("API Error:", err);
        return message; // Return other errors as-is
    }, [t]);

    const handleGenerateReport = async (topic: string, description: string, reportType: string) => {
        setIsLoading(true);
        setError(null);
        setGeneratedReport('');
        setIsReportComplete(false);
        try {
            const report = await geminiService.generateReport(topic, description, reportType);
            setGeneratedReport(report);
            setIsReportComplete(true);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFindGrants = async (keywords: string) => {
        setIsLoading(true);
        setError(null);
        setFoundGrants([]);
        try {
            const grants = await geminiService.findGrants(keywords);
            setFoundGrants(grants);
        } catch(e) {
            setError(handleApiError(e));
        } finally {
            setIsLoading(false);
        }
    };

    const handleAnalyzeGrant = async (grant: Grant) => {
        setSelectedGrant(grant);
        setGrantAnalysis(null);
        setGrantAnalysisError(null);
        setIsAnalyzingGrant(true);
        try {
            // Profile for an environmental NGO
            const userProfile = "We are an environmental non-profit organization focused on large-scale reforestation, biodiversity restoration, and community-led planting initiatives using data-driven methods.";
            const analysis = await geminiService.analyzeGrant(grant, userProfile);
            setGrantAnalysis(analysis);
        } catch(e) {
            setGrantAnalysisError(handleApiError(e));
        } finally {
            setIsAnalyzingGrant(false);
        }
    };

    const handleGenerateScript = async () => {
        setIsScriptLoading(true);
        setError(null);
        setVideoScenes([]);
        try {
            const script = await geminiService.generateVideoScript(videoPrompt, videoImage, videoDuration, videoType);
            const scenes: VideoScene[] = script.map(s => ({...s, videoUrls: [], imageUrl: null, isGenerating: false, isApproved: false, error: null}));
            setVideoScenes(scenes);
        } catch(e) {
            setError(handleApiError(e));
        } finally {
            setIsScriptLoading(false);
        }
    };
    
    const onSceneMediaGenerate = async (index: number, generator: (desc: string) => Promise<string | string[]>, type: 'video' | 'image') => {
        let scenesSnapshot = [...videoScenes];
        scenesSnapshot[index].isGenerating = true;
        scenesSnapshot[index].error = null;
        setVideoScenes(scenesSnapshot);
        try {
            const result = await generator(scenesSnapshot[index].description);
            scenesSnapshot = [...videoScenes]; // get latest state
            if (type === 'image' && typeof result === 'string') {
                scenesSnapshot[index].imageUrl = result;
            } else if (type === 'video' && Array.isArray(result)) {
                scenesSnapshot[index].videoUrls = result;
            }
            scenesSnapshot[index].isGenerating = false;
            setVideoScenes(scenesSnapshot);
        } catch(e) {
            scenesSnapshot = [...videoScenes]; // get latest state
            scenesSnapshot[index].error = handleApiError(e);
            scenesSnapshot[index].isGenerating = false;
            setVideoScenes(scenesSnapshot);
        }
    };

    const handleGenerateSceneVideo = (index: number) => {
        onSceneMediaGenerate(index, geminiService.generateSceneVideo, 'video');
    };

    const handleGenerateSceneImage = (index: number) => {
        onSceneMediaGenerate(index, geminiService.generateSceneImage, 'image');
    };
    
    const onGenerateMusic = async () => {
        setIsMusicLoading(true);
        try {
            const desc = await geminiService.generateMusicDescription(videoMusicPrompt);
            setVideoMusicDescription(desc);
        } catch(e) {
            handleApiError(e);
        } finally {
            setIsMusicLoading(false);
        }
    };
    
    const CHAT_SYSTEM_INSTRUCTION = "You are a friendly and knowledgeable assistant for the Green Hope Project, an organization dedicated to reforestation and environmental conservation using technology. Your goal is to answer user questions about our services (AI-powered site selection, grant acquisition, impact reporting), projects, and mission to plant trees worldwide. Keep your answers concise and helpful. Always communicate in the same language as the user's query.";

    const handleSendMessage = async (message: string) => {
        setIsChatLoading(true);
        setSuggestedPrompts([]);
        const newUserMessage: Content = { role: 'user', parts: [{ text: message }] };
        const currentHistory = [...chatHistory, newUserMessage];
        setChatHistory(currentHistory);

        try {
            const result = await geminiService.getChatResponseWithFollowups(
                CHAT_SYSTEM_INSTRUCTION,
                chatHistory, // Pass history *before* the new user message
                message
            );
            const newBotMessage: Content = { role: 'model', parts: [{ text: result.responseText }] };
            setChatHistory(prev => [...prev, newBotMessage]);
            setSuggestedPrompts(result.followUpPrompts);
        } catch (e) {
            const errorMessage = handleApiError(e);
            const errorBotMessage: Content = { role: 'model', parts: [{ text: `Sorry, an error occurred: ${errorMessage}` }] };
            setChatHistory(prev => [...prev, errorBotMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleGenerateCompostPlan = async (wasteType: string, space: string, climate: string) => {
        setIsCompostPlanLoading(true);
        setCompostPlanError(null);
        setCompostPlan('');
        try {
            const plan = await geminiService.generateCompostPlan(wasteType, space, climate);
            setCompostPlan(plan);
        } catch (err) {
            setCompostPlanError(handleApiError(err));
        } finally {
            setIsCompostPlanLoading(false);
        }
    };

    const handleTroubleshootCompost = async (problem: string) => {
        setIsCompostAdviceLoading(true);
        setCompostAdviceError(null);
        setCompostAdvice('');
        try {
            const advice = await geminiService.troubleshootCompost(problem);
            setCompostAdvice(advice);
        } catch (err) {
            setCompostAdviceError(handleApiError(err));
        } finally {
            setIsCompostAdviceLoading(false);
        }
    };

    const handleGenerateBusinessIdeas = async (query: string) => {
        setIsBusinessAdviceLoading(true);
        setBusinessAdviceError(null);
        setBusinessAdvice('');
        try {
            const ideas = await geminiService.generateCompostBusinessIdeas(query);
            setBusinessAdvice(ideas);
        } catch (err) {
            setBusinessAdviceError(handleApiError(err));
        } finally {
            setIsBusinessAdviceLoading(false);
        }
    };

    const handleAnalyzeCompostImage = async (imageData: string, mimeType: string, question: string) => {
        setIsCompostVisionLoading(true);
        setCompostVisionError(null);
        setCompostVisionResult('');
        try {
            const result = await geminiService.analyzeCompostImage(imageData, mimeType, question);
            setCompostVisionResult(result);
        } catch (err) {
            setCompostVisionError(handleApiError(err));
        } finally {
            setIsCompostVisionLoading(false);
        }
    };


    const chatMessagesForComponent: ChatMessage[] = useMemo(() => {
        const initialMessage: ChatMessage = { role: 'system', text: t('chatbot.initialGreeting') };
        const historyMessages: ChatMessage[] = chatHistory.map(content => ({
            role: content.role as 'user' | 'model',
            // @ts-ignore
            text: content.parts[0].text 
        }));
        return [initialMessage, ...historyMessages];
    }, [chatHistory, t]);


    const renderPage = () => {
        switch (page) {
            case 'home': return <HomePage setPage={setPage} />;
            case 'projects': return <ProjectsPage />;
            case 'team': return <TeamPage />;
            case 'docs': return <FunctionDocsPage />;
            case 'generator': return <ReportGenerator onGenerate={handleGenerateReport} generatedReport={generatedReport} isLoading={isLoading} error={error} isComplete={isReportComplete} topic={reportTopic} setTopic={setReportTopic} description={reportDescription} setDescription={setReportDescription} reportType={reportType} setReportType={setReportType} isQuotaExhausted={isQuotaExhausted} />;
            case 'grant': return (<>
                <GrantFinder onFindGrants={handleFindGrants} isLoading={isLoading} error={error} grants={foundGrants} onAnalyzeGrant={handleAnalyzeGrant} keywords={grantKeywords} setKeywords={setGrantKeywords} />
                {selectedGrant && <GrantAdopter grant={selectedGrant} isAnalyzing={isAnalyzingGrant} result={grantAnalysis} error={grantAnalysisError} onClear={() => setSelectedGrant(null)} onPrepareProposal={(grant) => { setPage('generator'); setReportTopic(`Funding Proposal for ${grant.grantTitle}`); setReportDescription(`Based on the grant summary: ${grant.summary}`); setReportType('funding_proposal'); }} />}
            </>);
            case 'video': return <VideoGenerator prompt={videoPrompt} setPrompt={setVideoPrompt} negativePrompt={videoNegativePrompt} setNegativePrompt={setVideoNegativePrompt} image={videoImage} setImage={setVideoImage} scenes={videoScenes} onSceneChange={(index, desc) => { const newScenes = [...videoScenes]; newScenes[index].description = desc; setVideoScenes(newScenes); }} onApproveScene={(index, isApproved) => { const newScenes = [...videoScenes]; newScenes[index].isApproved = isApproved; setVideoScenes(newScenes); }} onGenerateScript={handleGenerateScript} isScriptLoading={isScriptLoading} onGenerateSceneVideo={handleGenerateSceneVideo} onGenerateSceneImage={handleGenerateSceneImage} error={error} onClear={() => { setVideoScenes([]); setVideoPrompt(''); setVideoImage(null); }} duration={videoDuration} setDuration={setVideoDuration} aspectRatio={videoAspectRatio} setAspectRatio={setVideoAspectRatio} numberOfVersions={videoVersions} setNumberOfVersions={setVideoVersions} withWatermark={videoWithWatermark} setWithWatermark={setVideoWithWatermark} isQuotaExhausted={isQuotaExhausted} handleApiError={handleApiError} musicPrompt={videoMusicPrompt} setMusicPrompt={setVideoMusicPrompt} musicDescription={videoMusicDescription} isMusicLoading={isMusicLoading} onGenerateMusic={onGenerateMusic} selectedMusicUrl={selectedMusicUrl} onSelectMusicUrl={setSelectedMusicUrl} videoType={videoType} setVideoType={setVideoType} />;
            case 'blog': return <BlogGenerator />;
            case 'composting': return <HomeCompostingPage 
                setPage={setPage}
                compostPlan={compostPlan}
                isCompostPlanLoading={isCompostPlanLoading}
                compostPlanError={compostPlanError}
                onGenerateCompostPlan={handleGenerateCompostPlan}
                compostAdvice={compostAdvice}
                isCompostAdviceLoading={isCompostAdviceLoading}
                compostAdviceError={compostAdviceError}
                onTroubleshootCompost={handleTroubleshootCompost}
                businessAdvice={businessAdvice}
                isBusinessAdviceLoading={isBusinessAdviceLoading}
                businessAdviceError={businessAdviceError}
                onGenerateBusinessIdeas={handleGenerateBusinessIdeas}
                compostVisionResult={compostVisionResult}
                isCompostVisionLoading={isCompostVisionLoading}
                compostVisionError={compostVisionError}
                onAnalyzeCompostImage={handleAnalyzeCompostImage}
            />;
            default: return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen">
            <Header setPage={setPage} currentPage={page} user={user} onLogout={handleLogout} />
            <main>
                {renderPage()}
            </main>
            <SiteFooter />
            <Chatbot 
                messages={chatMessagesForComponent}
                onSendMessage={handleSendMessage}
                isLoading={isChatLoading}
                suggestedPrompts={suggestedPrompts}
            />
            <QuotaErrorModal isOpen={isQuotaExhausted} onClose={() => setIsQuotaExhausted(false)} />
        </div>
    );
};

export default App;