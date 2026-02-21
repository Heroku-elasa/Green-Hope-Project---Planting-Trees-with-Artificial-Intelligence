
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import Header from './components/Header';
import SiteFooter from './components/Footer';
import HomePage from './components/Hero';
import ReportGenerator from './components/ReportGenerator';
import GrantFinder from './components/GrantFinder';
import GrantAdopter from './components/GrantAdopter';
import SiteSelector from './components/SiteSelector';
import VideoGenerator from './components/VideoGenerator';
import ImageEditor from './components/ImageEditor';
import ProjectsPage from './components/ProjectsPage';
import TeamPage from './components/TeamPage';
import FunctionDocsPage from './components/FunctionDocsPage';
import BlogGenerator from './components/BlogGenerator';
import CompostingPage from './components/CompostingPage';
import ApiTest from './ApiTest';
import AdminPanel from './components/admin/AdminPanel';
import QuotaErrorModal from './components/QuotaErrorModal';
import Chatbot from './components/Chatbot';
import LoginModal from './components/LoginModal';
import ProgressTracker from './components/ProgressTracker';
import SearchModal from './components/SearchModal';
import { Page, Grant, GrantSummary, VideoScene, ChatMessage, useLanguage, UserProfile, PlantingSite, SuitableTree, Coords, GroundedResult, EconomicBenefitAnalysis, ProgressData, DailyCheckin, Goal, SearchResultItem } from './types';
import * as geminiService from './services/geminiService';
import type { Content } from '@google/genai';


const decodeJwt = (string: string): any => {
    try {
        return JSON.parse(atob(string.split('.')[1]));
    } catch (e) {
        console.error("Failed to decode JWT", e);
        return null;
    }
};

// Helper function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};


const App: React.FC = () => {
    const { t, language } = useLanguage();
    const [page, setPage] = useState<Page>('home');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<UserProfile | null>(null);

    // Report Generator State
    const [generatedReport, setGeneratedReport] = useState<GroundedResult | null>(null);
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
    const [groundedGrants, setGroundedGrants] = useState<GroundedResult | null>(null);


    // Site Selector State
    const [siteSelectorMode, setSiteSelectorMode] = useState<'locations' | 'trees'>('locations');
    const [siteSelectorLocationsInput, setSiteSelectorLocationsInput] = useState('');
    const [siteSelectorCoords, setSiteSelectorCoords] = useState<Coords | null>(null);
    const [siteSelectorResults, setSiteSelectorResults] = useState<(PlantingSite | SuitableTree)[]>([]);
    const [suggestedGoals, setSuggestedGoals] = useState<string[]>([]);
    const [isSuggestingGoals, setIsSuggestingGoals] = useState(false);

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
    
    // Image Editor State
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [editPrompt, setEditPrompt] = useState('');
    const [isEditingImage, setIsEditingImage] = useState(false);

    // Chatbot State
    const [chatHistory, setChatHistory] = useState<Content[]>([]);
    const [isChatLoading, setIsChatLoading] = useState(false);
    const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);

    // Login Modal State
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    
    // Search Modal State
    const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResultItem[] | null>(null);
    const [isSearchLoading, setIsSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);


    // Progress Tracker State
    const [progressData, setProgressData] = useState<ProgressData>(() => {
        try {
            const savedData = localStorage.getItem('progressData');
            return savedData ? JSON.parse(savedData) : { soberStartDate: null, dailyCheckins: [], goals: [], points: 0 };
        } catch (error) {
            console.error('Could not load progress data', error);
            return { soberStartDate: null, dailyCheckins: [], goals: [], points: 0 };
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('progressData', JSON.stringify(progressData));
        } catch (error) {
            console.error('Could not save progress data', error);
        }
    }, [progressData]);
    
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
    
    // Dummy login/register handlers for the modal
    const handleLogin = () => {
        console.log("Login action triggered");
        // In a real app, you would handle form submission or trigger social login here.
        setUser({ name: 'Demo User', email: 'demo@example.com', picture: 'https://storage.googleapis.com/verdant-assets/team-1.jpg' });
        setIsLoginModalOpen(false);
    };

    const handleRegister = () => {
        console.log("Register action triggered");
        setUser({ name: 'New User', email: 'new@example.com', picture: 'https://storage.googleapis.com/verdant-assets/team-2.jpg' });
        setIsLoginModalOpen(false);
    };


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
        // FIX: Add type guard to ensure script is HTMLScriptElement before accessing onload.
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
        setGeneratedReport(null);
        setIsReportComplete(false);
        try {
            const reportResult = await geminiService.generateReport(topic, description, reportType);
            setGeneratedReport(reportResult);
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
        setGroundedGrants(null);
        try {
            const grants = await geminiService.findGrants(keywords);
            setFoundGrants(grants);
        } catch(e) {
            setError(handleApiError(e));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindGrantsWithGrounding = async (keywords: string) => {
        setIsLoading(true);
        setError(null);
        setFoundGrants([]);
        setGroundedGrants(null);
        try {
            const result = await geminiService.findGrantsWithGrounding(keywords);
            setGroundedGrants(result);
        } catch (e) {
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
    
    const handleFindLocations = async (description: string) => {
        setIsLoading(true);
        setError(null);
        setSiteSelectorResults([]);
        try {
            const locations = await geminiService.findPlantingSites(description, language);
            setSiteSelectorResults(locations);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleFindTrees = useCallback(async (coords: Coords) => {
        setIsLoading(true);
        setError(null);
        setSiteSelectorResults([]);
        try {
            const trees = await geminiService.findSuitableTrees(coords.lat, coords.lng, language);
            setSiteSelectorResults(trees);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsLoading(false);
        }
    }, [handleApiError, language]);
    
    const handleSuggestGoals = useCallback(async (coords: Coords) => {
        setIsSuggestingGoals(true);
        setSuggestedGoals([]);
        try {
            const goals = await geminiService.suggestProjectGoals(coords.lat, coords.lng, language);
            setSuggestedGoals(goals);
        } catch (err) {
            console.error("Failed to suggest goals:", err);
            // Non-blocking error
        } finally {
            setIsSuggestingGoals(false);
        }
    }, [language]);

    useEffect(() => {
        if (siteSelectorMode === 'trees' && siteSelectorCoords) {
            handleSuggestGoals(siteSelectorCoords);
        } else {
            setSuggestedGoals([]);
        }
    }, [siteSelectorCoords, siteSelectorMode, handleSuggestGoals]);

    const handleUseSuggestedGoal = (goal: string) => {
        setPage('siteSelector');
        setSiteSelectorMode('locations');
        setSiteSelectorLocationsInput(goal);
        // Automatically trigger search for the new goal
        handleFindLocations(goal);
    };

    const handleFindGrantsForTree = useCallback((query: string) => {
        setGrantKeywords(query);
        setPage('grant');
        // Clear previous grant results to show loading state correctly
        setFoundGrants([]);
        handleFindGrants(query);
    }, []);

    const handleGenerateScript = async () => {
        setIsScriptLoading(true);
        setError(null);
        setVideoScenes([]);
        try {
            const script = await geminiService.generateVideoScript(videoPrompt, videoImage, videoDuration, videoType);
            const scenes: VideoScene[] = script.map(s => ({...s, videoUrls: [], imageUrl: null, isGenerating: false, isApproved: false, isConfirmed: false, error: null}));
            setVideoScenes(scenes);
        } catch(e) {
            setError(handleApiError(e));
        } finally {
            setIsScriptLoading(false);
        }
    };

    const onConfirmScene = (index: number, isConfirmed: boolean) => {
        const newScenes = [...videoScenes];
        newScenes[index].isConfirmed = isConfirmed;
        setVideoScenes(newScenes);
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
    
    const handleEditImage = async () => {
        if (!originalImage || !editPrompt.trim()) {
            setError(t('imageEditor.validationError'));
            return;
        }
        setIsEditingImage(true);
        setError(null);
        setEditedImage(null);
        try {
            const base64Data = originalImage.split(',')[1];
            const mimeType = originalImage.match(/data:(.*?);/)?.[1] || 'image/jpeg';
            const result = await geminiService.editImage(base64Data, mimeType, editPrompt);
            setEditedImage(result);
        } catch (err) {
            setError(handleApiError(err));
        } finally {
            setIsEditingImage(false);
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

    const chatMessagesForComponent: ChatMessage[] = useMemo(() => {
        const initialMessage: ChatMessage = { role: 'system', text: t('chatbot.initialGreeting') };
        const historyMessages: ChatMessage[] = chatHistory.map(content => ({
            role: content.role as 'user' | 'model',
            // @ts-ignore
            text: content.parts[0].text 
        }));
        return [initialMessage, ...historyMessages];
    }, [chatHistory, t]);

    // Set initial suggested prompts for the chatbot
    useEffect(() => {
        if (chatHistory.length === 0) {
            const allPrompts: string[] = t('chatbot.initialPrompts');
            const randomPrompts = shuffleArray(allPrompts).slice(0, 3);
            setSuggestedPrompts(randomPrompts);
        }
    }, [t, chatHistory.length]);
    
    const handleSearch = async (query: string) => {
        setIsSearchLoading(true);
        setSearchError(null);
        setSearchResults(null);
        try {
            const results = await geminiService.performSearch(query);
            setSearchResults(results);
        } catch(e) {
            setSearchError(handleApiError(e));
        } finally {
            setIsSearchLoading(false);
        }
    };
    
    const handleSearchNavigate = (page: Page) => {
        setIsSearchModalOpen(false);
        setSearchResults(null);
        setSearchError(null);
        setPage(page);
    };

    // --- Progress Tracker Handlers ---
    const handleSetSoberStartDate = (date: string) => {
        setProgressData(prev => ({ ...prev, soberStartDate: date }));
    };

    const handleAddGoal = (text: string) => {
        const newGoal: Goal = { id: Date.now().toString(), text, completed: false };
        setProgressData(prev => ({ ...prev, goals: [newGoal, ...prev.goals], points: prev.points + 25 }));
    };

    const handleToggleGoal = (id: string) => {
        setProgressData(prev => {
            let pointsChange = 0;
            const newGoals = prev.goals.map(g => {
                if (g.id === id) {
                    pointsChange = g.completed ? -50 : 50;
                    return { ...g, completed: !g.completed };
                }
                return g;
            });
            return { ...prev, goals: newGoals, points: prev.points + pointsChange };
        });
    };

    const handleDeleteGoal = (id: string) => {
        setProgressData(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== id) }));
    };

    const handleDailyCheckin = (mood: number, craving: number) => {
        const todayString = new Date().toISOString().split('T')[0];
        if (progressData.dailyCheckins.some(c => c.date === todayString)) return;

        const newCheckin: DailyCheckin = { date: todayString, mood, craving };
        setProgressData(prev => ({
            ...prev,
            dailyCheckins: [...prev.dailyCheckins, newCheckin],
            points: prev.points + 100,
        }));
    };


    const renderPage = () => {
        switch (page) {
            case 'api-test': return <ApiTest />;
            case 'home': return <HomePage setPage={setPage} />;
            case 'projects': return <ProjectsPage />;
            case 'team': return <TeamPage />;
            case 'docs': return <FunctionDocsPage />;
            case 'generator': return <ReportGenerator onGenerate={handleGenerateReport} generatedReport={generatedReport} isLoading={isLoading} error={error} isComplete={isReportComplete} topic={reportTopic} setTopic={setReportTopic} description={reportDescription} setDescription={setReportDescription} reportType={reportType} setReportType={setReportType} isQuotaExhausted={isQuotaExhausted} />;
            case 'grant': return (<>
                <GrantFinder onFindGrants={handleFindGrants} onFindGrantsWithGrounding={handleFindGrantsWithGrounding} isLoading={isLoading} error={error} grants={foundGrants} groundedResult={groundedGrants} onAnalyzeGrant={handleAnalyzeGrant} keywords={grantKeywords} setKeywords={setGrantKeywords} />
                {selectedGrant && <GrantAdopter grant={selectedGrant} isAnalyzing={isAnalyzingGrant} result={grantAnalysis} error={grantAnalysisError} onClear={() => setSelectedGrant(null)} onPrepareProposal={(grant) => { setPage('generator'); setReportTopic(`Funding Proposal for ${grant.grantTitle}`); setReportDescription(`Based on the grant summary: ${grant.summary}`); setReportType('funding_proposal'); }} />}
            </>);
            case 'siteSelector': return <SiteSelector onFindLocations={handleFindLocations} onFindTrees={handleFindTrees} results={siteSelectorResults} isLoading={isLoading} error={error} mode={siteSelectorMode} setMode={setSiteSelectorMode} locationsInput={siteSelectorLocationsInput} setLocationsInput={setSiteSelectorLocationsInput} coords={siteSelectorCoords} setCoords={setSiteSelectorCoords} suggestedGoals={suggestedGoals} isSuggestingGoals={isSuggestingGoals} onUseSuggestedGoal={handleUseSuggestedGoal} onFindGrantsForTree={handleFindGrantsForTree} handleApiError={handleApiError} />;
            case 'video': return <VideoGenerator prompt={videoPrompt} setPrompt={setVideoPrompt} negativePrompt={videoNegativePrompt} setNegativePrompt={setVideoNegativePrompt} image={videoImage} setImage={setVideoImage} scenes={videoScenes} onSceneChange={(index, desc) => { const newScenes = [...videoScenes]; newScenes[index].description = desc; setVideoScenes(newScenes); }} onApproveScene={(index, isApproved) => { const newScenes = [...videoScenes]; newScenes[index].isApproved = isApproved; setVideoScenes(newScenes); }} onConfirmScene={onConfirmScene} onGenerateScript={handleGenerateScript} isScriptLoading={isScriptLoading} onGenerateSceneVideo={handleGenerateSceneVideo} onGenerateSceneImage={handleGenerateSceneImage} error={error} onClear={() => { setVideoScenes([]); setVideoPrompt(''); setVideoImage(null); }} duration={videoDuration} setDuration={setVideoDuration} aspectRatio={videoAspectRatio} setAspectRatio={setVideoAspectRatio} numberOfVersions={videoVersions} setNumberOfVersions={setVideoVersions} withWatermark={videoWithWatermark} setWithWatermark={setVideoWithWatermark} isQuotaExhausted={isQuotaExhausted} handleApiError={handleApiError} musicPrompt={videoMusicPrompt} setMusicPrompt={setVideoMusicPrompt} musicDescription={videoMusicDescription} isMusicLoading={isMusicLoading} onGenerateMusic={onGenerateMusic} selectedMusicUrl={selectedMusicUrl} onSelectMusicUrl={setSelectedMusicUrl} videoType={videoType} setVideoType={setVideoType} />;
            case 'imageEditor': return <ImageEditor originalImage={originalImage} setOriginalImage={setOriginalImage} editedImage={editedImage} prompt={editPrompt} setPrompt={setEditPrompt} onGenerate={handleEditImage} isLoading={isEditingImage} error={error} onClear={() => { setOriginalImage(null); setEditedImage(null); setEditPrompt(''); setError(null); }} />;
            case 'blog': return <BlogGenerator />;
            case 'composting': return <CompostingPage setPage={setPage} />;
            case 'aiAssistant': return <ProgressTracker progressData={progressData} onSetSoberStartDate={handleSetSoberStartDate} onAddGoal={handleAddGoal} onToggleGoal={handleToggleGoal} onDeleteGoal={handleDeleteGoal} onDailyCheckin={handleDailyCheckin} />;
            default: return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen">
            <Header setPage={setPage} currentPage={page} user={user} onLogout={handleLogout} onLoginClick={() => setIsLoginModalOpen(true)} onSearchClick={() => setIsSearchModalOpen(true)} />
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
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} onRegister={handleRegister} />
            <SearchModal 
                isOpen={isSearchModalOpen}
                onClose={() => { setIsSearchModalOpen(false); setSearchResults(null); setSearchError(null); }}
                onSearch={handleSearch}
                isLoading={isSearchLoading}
                results={searchResults}
                error={searchError}
                onNavigate={handleSearchNavigate}
            />
        </div>
    );
};

export default App;
