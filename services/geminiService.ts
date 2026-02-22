
import { GoogleGenAI, Type, Content } from "@google/genai";
import { Grant, GrantSummary, PlantingSite, SuitableTree, EconomicBenefitAnalysis, Coords, GroundedResult, GroundedSource, SiteAnalysis, SiteEconomicAnalysis, SearchResultItem, DeforestationAnalysis } from "../types";
import PoYoClient from '../lib/poyoClient';

const poyo = process.env.POYO_API_KEY ? new PoYoClient({ apiKey: process.env.POYO_API_KEY }) : null;
const OPENROUTER_API_KEY = "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";
const PORTKEY_API_KEY = "ST4fIU5r6s6JvLGE/ad2F+8CCCrU";
const NEW_POYO_KEY = "sk-gIv4XbAxnRo6197km3Lia3ZxVghXHMxgmPlnWWZJIm5Q0zJRy5ICcp0b6rDM79";

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
            } else if (OPENROUTER_API_KEY) {
                 // Fallback to OpenRouter if no Gemini key
                 options.apiKey = OPENROUTER_API_KEY;
                 options.httpOptions = {
                     apiVersion: "v1",
                     baseUrl: "https://openrouter.ai/api/v1",
                     // Use a reliable model as fallback
                     headers: {
                         "HTTP-Referer": "https://replit.com",
                         "X-Title": "Green Hope Project"
                     }
                 };
        } else if (PORTKEY_API_KEY) {
             // Fallback to Portkey
             options.apiKey = PORTKEY_API_KEY;
             options.httpOptions = {
                 apiVersion: "v1",
                 baseUrl: "https://api.portkey.ai/v1",
                 customHeaders: {
                     "x-portkey-api-key": PORTKEY_API_KEY,
                     "x-portkey-provider": "openai"
                 }
             };
        } else {
            if (!apiKey) {
                throw new Error('لطفاً کلید API را تنظیم کنید یا از سیستم داخلی استفاده کنید. (Please set API key)');
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

export const findPlantingAreas = async (polygon: { lat: number, lng: number }[], count: number, language: string, useGrounding: boolean): Promise<any[]> => {
    try {
        const systemInstruction = `You are an expert ecologist. Identify ${count} optimal planting locations within the provided polygon area. Respond in ${language}. Return JSON array of objects with latitude, longitude, and locationName.`;
        const contents = `Polygon vertices: ${JSON.stringify(polygon)}`;
        
        // Try primary Gemini first
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents,
                config: { systemInstruction, responseMimeType: "application/json" }
            });
            return JSON.parse(response.text.trim());
        } catch (geminiError) {
            console.warn("Gemini failed, trying OpenRouter fallback...", geminiError);
            
            // OpenRouter Fallback
            const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": "https://replit.com",
                    "X-Title": "Green Hope Project"
                },
                body: JSON.stringify({
                    model: "deepseek/deepseek-chat",
                    messages: [
                        { role: "system", content: systemInstruction },
                        { role: "user", content: contents }
                    ],
                    response_format: { type: "json_object" }
                })
            });
            
            const orData = await orResponse.json();
            const content = orData.choices[0].message.content;
            const parsed = JSON.parse(content);
            return parsed.locations || parsed.points || (Array.isArray(parsed) ? parsed : []);
        }
    } catch (error) {
        console.error("Error in findPlantingAreas:", error);
        return []; 
    }
};

export const analyzePolygonArea = async (polygon: { lat: number, lng: number }[], language: string, useGrounding: boolean): Promise<any> => {
    // Similar fallback logic can be added here
    return { analysis: "Analysis pending..." };
};

export const findReforestationAreas = async (language: string): Promise<any[]> => {
    return [];
};

export const performSearch = async (query: string): Promise<SearchResultItem[]> => {
    const systemInstruction = `Search assistant for Green Hope Project. Respond in Persian/Farsi if the query is in Farsi.`;
    const response = await ai.models.generateContent({
        model: OPENROUTER_API_KEY ? 'google/gemini-2.0-flash-001' : 'gemini-2.0-flash',
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
        model: OPENROUTER_API_KEY ? 'google/gemini-2.0-flash-001' : 'gemini-2.0-flash',
        contents: [...history, { role: 'user', parts: [{ text: latestMessage }] }],
        config: {
            systemInstruction: systemInstruction + " Respond in Persian/Farsi.",
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
        model: OPENROUTER_API_KEY ? 'google/gemini-2.0-flash-001' : 'gemini-2.0-flash',
        contents: `Generate ${reportType} report for ${topic}: ${description}. Write the report in Persian/Farsi.`,
        config: { tools: [{ googleSearch: {} }] }
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    return { text: response.text, sources: groundingChunks.map(c => ({ web: c.web })).filter(s => s.web) as GroundedSource[] };
};

export const findGrants = async (keywords: string): Promise<Grant[]> => {
    const response = await ai.models.generateContent({
        model: OPENROUTER_API_KEY ? 'google/gemini-2.0-flash-001' : 'gemini-2.0-flash',
        contents: `Find grants for: ${keywords}. Return results in Persian/Farsi where appropriate.`,
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

export const findPlantingSites = async (description: string, language: string = 'fa'): Promise<PlantingSite[]> => {
    const response = await ai.models.generateContent({
        model: OPENROUTER_API_KEY ? 'google/gemini-2.0-flash-001' : 'gemini-2.0-flash',
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
    const client = NEW_POYO_KEY ? new PoYoClient({ apiKey: NEW_POYO_KEY }) : poyo;
    if (!client) throw new Error("PoYo AI client not initialized.");
    const result = await client.generateVideo('kling-1.5', description);
    return [result.url || result.video_url || result];
};

export const generateSceneImage = async (description: string): Promise<string> => {
    const client = NEW_POYO_KEY ? new PoYoClient({ apiKey: NEW_POYO_KEY }) : poyo;
    if (!client) throw new Error("PoYo AI client not initialized.");
    const result = await client.generateImage('flux.2', description);
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
