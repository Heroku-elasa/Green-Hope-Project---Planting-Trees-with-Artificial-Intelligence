
import { GoogleGenAI, Type, Content } from "@google/genai";
import { Grant, GrantSummary, PlantingSite, SuitableTree, EconomicBenefitAnalysis, Coords, GroundedResult, GroundedSource, SiteAnalysis, SiteEconomicAnalysis, SearchResultItem, DeforestationAnalysis } from "../types";
import PoYoClient from '../lib/poyoClient';

const poyo = process.env.POYO_API_KEY ? new PoYoClient({ apiKey: process.env.POYO_API_KEY }) : null;

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
    if (!_ai) {
        const replitApiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
        const replitBaseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
        const apiKey = replitApiKey || process.env.GEMINI_API_KEY || process.env.API_KEY || '';
        
        const options: any = { apiKey };
        if (replitApiKey && replitBaseUrl) {
            options.httpOptions = {
                apiVersion: "v1beta",
                baseUrl: replitBaseUrl
            };
        } else {
            if (!apiKey) {
                throw new Error('Please set the GEMINI_API_KEY environment variable or use Replit AI Integration.');
            }
            options.httpOptions = {
                apiVersion: "v1beta"
            };
        }
        _ai = new GoogleGenAI(options);
    }
    return _ai;
}
const ai = new Proxy({} as GoogleGenAI, {
    get(_target, prop) {
        return (getAI() as any)[prop];
    }
});

export interface ChatResponse {
    responseText: string;
    followUpPrompts: string[];
}

export const performSearch = async (query: string): Promise<SearchResultItem[]> => {
    const systemInstruction = `Search assistant for Green Hope Project.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `User query: "${query}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        targetPage: { type: Type.STRING }
                    },
                    required: ["title", "description", "targetPage"]
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const getChatResponseWithFollowups = async (systemInstruction: string, history: Content[], latestMessage: string): Promise<ChatResponse> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [...history, { role: 'user', parts: [{ text: latestMessage }] }],
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    responseText: { type: Type.STRING },
                    followUpPrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["responseText", "followUpPrompts"]
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const generateReport = async (topic: string, description: string, reportType: string): Promise<GroundedResult> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Generate ${reportType} report for ${topic}: ${description}`,
        config: { tools: [{ googleSearch: {} }] }
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    return { text: response.text, sources: groundingChunks.map(c => ({ web: c.web })).filter(s => s.web) as GroundedSource[] };
};

export const findGrants = async (keywords: string): Promise<Grant[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Find grants for: ${keywords}`,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        grantTitle: { type: Type.STRING },
                        fundingBody: { type: Type.STRING },
                        summary: { type: Type.STRING },
                        deadline: { type: Type.STRING },
                        link: { type: Type.STRING }
                    },
                    required: ["grantTitle", "fundingBody", "summary", "deadline", "link"]
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const findGrantsWithGrounding = async (keywords: string): Promise<GroundedResult> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Search grants for: ${keywords}`,
        config: { tools: [{ googleSearch: {} }] }
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    return { text: response.text, sources: groundingChunks.map(c => ({ web: c.web })).filter(s => s.web) as GroundedSource[] };
};

export const analyzeGrant = async (grant: Grant, userProfile: string): Promise<GrantSummary> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analyze grant ${grant.grantTitle} for profile ${userProfile}`,
        config: { tools: [{ googleSearch: {} }] }
    });
    let text = response.text.trim();
    if (text.startsWith('```json')) text = text.substring(7, text.length - 3).trim();
    return JSON.parse(text);
};

export const findPlantingSites = async (description: string, language: string = 'en'): Promise<PlantingSite[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: description,
        config: {
            systemInstruction: `Identify planting sites. Language: ${language}`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        locationName: { type: Type.STRING },
                        country: { type: Type.STRING },
                        latitude: { type: Type.NUMBER },
                        longitude: { type: Type.NUMBER },
                        rationale: { type: Type.STRING },
                        suggestedSpecies: { type: Type.ARRAY, items: { type: Type.STRING } },
                        priority: { type: Type.STRING }
                    },
                    required: ["locationName", "country", "latitude", "longitude", "rationale", "suggestedSpecies", "priority"]
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const analyzePlantingSite = async (site: PlantingSite, language: string = 'en'): Promise<SiteAnalysis> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Analyze site: ${site.locationName}`,
        config: {
            systemInstruction: `Feasibility analysis. Language: ${language}`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    estimatedCost: { type: Type.STRING },
                    treeCount: { type: Type.INTEGER },
                    projectDurationYears: { type: Type.STRING },
                    carbonSequestrationTonnesPerYear: { type: Type.INTEGER },
                    keyChallenges: { type: Type.ARRAY, items: { type: Type.STRING } },
                    successFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["estimatedCost", "treeCount", "projectDurationYears", "carbonSequestrationTonnesPerYear", "keyChallenges", "successFactors"]
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const analyzeSiteEconomicPotential = async (site: PlantingSite, language: string = 'en'): Promise<SiteEconomicAnalysis> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Economic potential for: ${site.locationName}`,
        config: {
            systemInstruction: `Economic analyst. Language: ${language}`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    potentialAnnualRevenue: { type: Type.STRING },
                    estimatedProfitabilityYears: { type: Type.STRING },
                    primaryEconomicDrivers: { type: Type.ARRAY, items: { type: Type.STRING } },
                    investmentOutlook: { type: Type.STRING }
                },
                required: ["potentialAnnualRevenue", "estimatedProfitabilityYears", "primaryEconomicDrivers", "investmentOutlook"]
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const findPlantingSitesWithMaps = async (query: string, userCoords: Coords): Promise<GroundedResult> => {
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: query,
        config: {
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: userCoords.lat, longitude: userCoords.lng } } }
        }
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    return { text: response.text, sources: groundingChunks.map(c => c.maps ? { maps: c.maps } : { web: c.web }).filter(s => s.maps || s.web) as any[] };
};

export const findSuitableTrees = async (latitude: number, longitude: number, language: string = 'en'): Promise<SuitableTree[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Trees for ${latitude}, ${longitude}`,
        config: {
            systemInstruction: `Botanist. Language: ${language}`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        commonName: { type: Type.STRING },
                        scientificName: { type: Type.STRING },
                        description: { type: Type.STRING },
                        rationale: { type: Type.STRING }
                    },
                    required: ["commonName", "scientificName", "description", "rationale"]
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const calculateEconomicBenefits = async (treeName: string, scientificName: string, coords: Coords, language: string = 'en'): Promise<EconomicBenefitAnalysis> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Benefits of ${treeName} (${scientificName}) at ${coords.lat}, ${coords.lng}`,
        config: {
            systemInstruction: `Agro-economist. Language: ${language}`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    annualRevenuePerTree: { type: Type.STRING },
                    yearsToProfitability: { type: Type.STRING },
                    primaryProducts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    otherBenefits: { type: Type.STRING }
                },
                required: ["annualRevenuePerTree", "yearsToProfitability", "primaryProducts", "otherBenefits"]
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const analyzeTreeEconomicBenefits = calculateEconomicBenefits;

export const suggestProjectGoals = async (latitude: number, longitude: number, language: string = 'en'): Promise<string[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Goals for ${latitude}, ${longitude}`,
        config: {
            systemInstruction: `Conservation strategist. Language: ${language}`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: { goals: { type: Type.ARRAY, items: { type: Type.STRING } } },
                required: ["goals"]
            }
        }
    });
    return JSON.parse(response.text.trim()).goals;
};

export const generateVideoScript = async (prompt: string, image: string | null, duration: number, videoType: string): Promise<any[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
            systemInstruction: `Video director. Duration: ${duration}, Type: ${videoType}`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { description: { type: Type.STRING }, narration: { type: Type.STRING } },
                    required: ["description", "narration"]
                }
            }
        }
    });
    return JSON.parse(response.text.trim());
};

export const generateSceneVideo = async (description: string): Promise<string[]> => {
    if (!poyo) throw new Error("PoYo AI client not initialized.");
    const result = await poyo.generateVideo('kling-1.5', description);
    return [result.url || result.video_url || result];
};

export const generateSceneImage = async (description: string): Promise<string> => {
    if (!poyo) throw new Error("PoYo AI client not initialized.");
    const result = await poyo.generateImage('flux.2', description);
    return result.url || result.image_url || result;
};

export const generateMusicDescription = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt });
    return response.text;
};

export const editImage = async (base64: string, mimeType: string, prompt: string): Promise<string> => {
    return "Edit functionality coming soon via PoYo AI.";
};

export const askGoogleBabaAboutImage = async (base64: string, mimeType: string, prompt: string): Promise<string> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }, { inlineData: { data: base64, mimeType } }] }]
    });
    return response.text;
};

export const analyzeDeforestation = async (coords: Coords, language: string = 'en'): Promise<DeforestationAnalysis> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: `Deforestation at ${coords.lat}, ${coords.lng}`,
        config: {
            systemInstruction: `Satellite analyst. Language: ${language}`,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    status: { type: Type.STRING },
                    estimatedLossPercent: { type: Type.NUMBER },
                    primaryCauses: { type: Type.ARRAY, items: { type: Type.STRING } },
                    replantingSuggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: { lat: { type: Type.NUMBER }, lng: { type: Type.NUMBER }, note: { type: Type.STRING } },
                            required: ["lat", "lng", "note"]
                        }
                    }
                },
                required: ["status", "estimatedLossPercent", "primaryCauses", "replantingSuggestions"]
            }
        }
    });
    return JSON.parse(response.text.trim());
};
