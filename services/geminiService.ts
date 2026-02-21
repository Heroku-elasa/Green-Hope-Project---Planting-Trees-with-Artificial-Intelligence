

import { GoogleGenAI, Type, GenerateContentResponse, Content, Modality } from "@google/genai";
import { Grant, GrantSummary, VideoScene, PlantingSite, SuitableTree, EconomicBenefitAnalysis, Coords, GroundedResult, GroundedSource, SiteAnalysis, SiteEconomicAnalysis, SearchResultItem, DeforestationAnalysis } from "../types";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
    if (!_ai) {
        // Prefer Replit AI Integration if available
        const replitApiKey = process.env.AI_INTEGRATIONS_GEMINI_API_KEY;
        const replitBaseUrl = process.env.AI_INTEGRATIONS_GEMINI_BASE_URL;
        
        const apiKey = replitApiKey || process.env.API_KEY || process.env.GEMINI_API_KEY || '';
        
        if (!apiKey) {
            throw new Error('Please set the GEMINI_API_KEY environment variable or use Replit AI Integration.');
        }

        const options: any = { apiKey };
        if (replitBaseUrl) {
            options.httpOptions = {
                apiVersion: "",
                baseUrl: replitBaseUrl
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
    const systemInstruction = `You are an intelligent search assistant for the "Green Hope Project" application. Your task is to analyze the user's search query and determine the most relevant pages or features within the application that can fulfill their request. Respond with a ranked list of up to 3 relevant pages.

Here are the available pages and their functions:
- 'home': The main landing page with an overview of the project, services, and latest news.
- 'generator': "Project Planner" - A tool to generate detailed project plans, environmental reports, and funding proposals using AI.
- 'grant': "Grant Finder" - A tool to search for and analyze environmental grants.
- 'siteSelector': "AI Site Selector" - A tool to find optimal locations for planting trees and identify suitable species using geographic data.
- 'video': "AI Video Generator" - A tool to create promotional or informational videos about projects.
- 'imageEditor': "AI Image Editor" - A tool to edit images using text prompts.
- 'blog': "Blog Generator" - A feature for creating blog posts (currently marked as 'coming soon').
- 'composting': "Composting Guide" - A detailed guide on home and business composting methods.
- 'aiAssistant': "AI Personal Assistant" - A tool for personal progress tracking, goal setting, and celebrating milestones.
- 'projects': "Projects Page" - A portfolio showcasing the organization's key reforestation projects.
- 'team': "Team Page" - Information about the expert team behind the project.
- 'docs': "Function Docs" - Technical documentation about the application's functions.

Analyze the user's query and match it to the most appropriate page(s). Provide a concise title and a helpful description for each result. The 'targetPage' must be one of the exact page keys listed above.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `User query: "${query}"`,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "A clear, user-friendly title for the search result." },
                        description: { type: Type.STRING, description: "A brief, helpful description of what the user can do on this page." },
                        targetPage: { type: Type.STRING, description: "The exact page key from the provided list (e.g., 'generator', 'siteSelector')." }
                    },
                    required: ["title", "description", "targetPage"]
                }
            }
        }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};


export const getChatResponseWithFollowups = async (
    systemInstruction: string,
    history: Content[],
    latestMessage: string
): Promise<ChatResponse> => {
    const contents: Content[] = [
        ...history,
        { role: 'user', parts: [{ text: latestMessage }] }
    ];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    responseText: { type: Type.STRING, description: "Your direct, helpful response to the user's question." },
                    followUpPrompts: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "3 short, relevant, and engaging follow-up questions or actions the user might want to take next, based on the conversation."
                    }
                },
                required: ["responseText", "followUpPrompts"]
            }
        }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};


export const generateReport = async (topic: string, description: string, reportType: string): Promise<GroundedResult> => {
    const prompt = `
        Generate a comprehensive report of type "${reportType}".
        Topic: ${topic}
        Description: ${description}

        The report should be well-structured, detailed, and formatted in Markdown.
        Use Google Search to find up-to-date and relevant information for the report, including current reforestation trends, suitable native species for any mentioned regions, and potential funding sources.
        Include sections like Introduction, Site Analysis, Species Selection, Implementation Plan, Budget, and Impact Projection.
        List all web sources used.
    `;

    // Use ai.models.generateContent
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = groundingChunks.map(chunk => chunk.web).filter(s => s).map(s => ({ web: s })) as GroundedSource[];
    
    return {
        text: response.text,
        sources: sources,
    };
};

export const findGrants = async (keywords: string): Promise<Grant[]> => {
    const prompt = `
        Find available environmental and conservation grants related to these keywords: "${keywords}".
        Provide a list of 5 grants. For each grant, provide:
        - grantTitle: The official title of the grant.
        - fundingBody: The organization providing the funds.
        - summary: A brief summary of the grant's purpose.
        - deadline: The application deadline.
        - link: A direct URL to the grant page.
    `;
    
    // Use ai.models.generateContent with responseSchema for JSON output
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
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
                        link: { type: Type.STRING },
                    },
                    required: ["grantTitle", "fundingBody", "summary", "deadline", "link"]
                }
            }
        }
    });

    // Extract text and parse JSON
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

export const findGrantsWithGrounding = async (keywords: string): Promise<GroundedResult> => {
    const prompt = `Find the latest environmental and conservation grants related to these keywords: "${keywords}". Provide a summary of the top 3-5 grants, including their name, funding body, and a direct link to the application page. Also list all web sources used.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = groundingChunks.map(chunk => chunk.web).filter(s => s).map(s => ({ web: s })) as GroundedSource[];
    
    return {
        text: response.text,
        sources: sources,
    };
};

export const analyzeGrant = async (grant: Grant, userProfile: string): Promise<GrantSummary> => {
    const prompt = `
        Analyze the following grant opportunity based on my profile. Use Google Search to access the provided link and get the most up-to-date information.
        
        My Profile:
        ${userProfile}

        Grant Details:
        Title: ${grant.grantTitle}
        Funding Body: ${grant.fundingBody}
        Summary: ${grant.summary}
        Deadline: ${grant.deadline}
        Link: ${grant.link}

        After analyzing the grant from the link, extract the following information and respond ONLY with a valid JSON object. Do not add any other text or markdown formatting like \`\`\`json. The JSON object must contain these exact keys:
        "grantTitle", "fundingBody", "deadline", "amount", "duration", "geography", "eligibility", "scope", "howToApply", "contact", and "relevancePercentage" (an integer from 0 to 100 indicating relevance to my profile).
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{ googleSearch: {} }],
        }
    });
    
    let jsonStr = response.text.trim();
    // Clean up potential markdown formatting if the model adds it despite instructions.
    if (jsonStr.startsWith('```json')) {
        jsonStr = jsonStr.substring(7, jsonStr.length - 3).trim();
    }
     try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error("Failed to parse JSON from grant analysis:", jsonStr);
        throw new Error("The model did not return a valid JSON object for the grant analysis.");
    }
};

export const findPlantingSites = async (description: string, language: string = 'en'): Promise<PlantingSite[]> => {
    const langInstruction = language === 'fa' ? "Respond in Persian (Farsi) for all text fields." : "Respond in English.";
    const systemInstruction = `You are an expert ecologist and conservation strategist for the Green Hope Project. Your task is to identify and recommend optimal locations for reforestation projects based on user-defined goals. Analyze the user's request and provide 3-5 potential sites. For each site, provide a clear rationale (in Markdown), suggest suitable native or climate-adapted tree species, include its precise latitude and longitude, and assign a priority level ('Critical', 'High', 'Medium', or 'Low') based on ecological importance and urgency. ${langInstruction}`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: description,
        config: {
            systemInstruction,
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
                        rationale: { type: Type.STRING, description: "A detailed explanation in Markdown format about why this site is suitable." },
                        suggestedSpecies: { type: Type.ARRAY, items: { type: Type.STRING } },
                        priority: { type: Type.STRING, description: "Priority level: 'Critical', 'High', 'Medium', or 'Low'." },
                    },
                    required: ["locationName", "country", "latitude", "longitude", "rationale", "suggestedSpecies", "priority"]
                }
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

export const analyzePlantingSite = async (site: PlantingSite, language: string = 'en'): Promise<SiteAnalysis> => {
    const langInstruction = language === 'fa' ? "Respond in Persian (Farsi) for all text fields." : "Respond in English.";
    const systemInstruction = `You are a project manager and financial analyst for a large-scale environmental NGO. Your task is to provide a detailed feasibility analysis for a proposed reforestation project. Based on the provided site information, generate a realistic and data-driven project plan. ${langInstruction}`;
    const userPrompt = `
        Analyze the following proposed planting site:
        - Location: ${site.locationName}, ${site.country}
        - Rationale: ${site.rationale}
        - Suggested Species: ${site.suggestedSpecies.join(', ')}

        Provide the analysis in the following JSON format:
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    estimatedCost: { type: Type.STRING, description: "A realistic cost range, e.g., '$50,000 - $75,000 USD'" },
                    treeCount: { type: Type.INTEGER, description: "Estimated number of trees that can be planted." },
                    projectDurationYears: { type: Type.STRING, description: "Estimated project duration, e.g., '3-5 Years'" },
                    carbonSequestrationTonnesPerYear: { type: Type.INTEGER, description: "Estimated tonnes of CO2 sequestered per year once mature." },
                    keyChallenges: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 key potential challenges." },
                    successFactors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-3 critical success factors." },
                },
                required: ["estimatedCost", "treeCount", "projectDurationYears", "carbonSequestrationTonnesPerYear", "keyChallenges", "successFactors"]
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
}

export const analyzeSiteEconomicPotential = async (site: PlantingSite, language: string = 'en'): Promise<SiteEconomicAnalysis> => {
    const langInstruction = language === 'fa' ? "Respond in Persian (Farsi) for all text fields." : "Respond in English.";
    const systemInstruction = `You are a specialist in environmental economics and sustainable development investments. Your task is to provide a concise economic potential analysis for a proposed reforestation site. Based on the site's location, rationale, and suggested species, generate a realistic forecast. ${langInstruction}`;
    const userPrompt = `
        Analyze the economic potential of the following reforestation site:
        - Location: ${site.locationName}, ${site.country}
        - Rationale: ${site.rationale}
        - Suggested Species: ${site.suggestedSpecies.join(', ')}

        Provide the analysis in the following JSON format:
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    potentialAnnualRevenue: { type: Type.STRING, description: "A realistic estimated range for annual revenue, e.g., '$100,000 - $150,000 USD from timber, carbon credits, and tourism.'" },
                    estimatedProfitabilityYears: { type: Type.STRING, description: "Estimated range of years until the project becomes profitable, e.g., '8-12 Years'" },
                    primaryEconomicDrivers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 2-4 key economic drivers, e.g., 'Sustainable Timber', 'Carbon Credits', 'Ecotourism', 'Non-timber Forest Products'." },
                    investmentOutlook: { type: Type.STRING, description: "A brief summary in Markdown of the investment outlook, including risks and opportunities." },
                },
                required: ["potentialAnnualRevenue", "estimatedProfitabilityYears", "primaryEconomicDrivers", "investmentOutlook"]
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
}


export const findPlantingSitesWithMaps = async (query: string, userCoords: Coords): Promise<GroundedResult> => {
    const prompt = `Based on my current location, find information about: "${query}". Provide details about relevant places, their suitability for environmental projects, and include links to Google Maps for each location mentioned.`;

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            tools: [{googleMaps: {}}],
            toolConfig: {
                retrievalConfig: {
                    latLng: {
                        latitude: userCoords.lat,
                        longitude: userCoords.lng
                    }
                }
            }
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources: GroundedSource[] = groundingChunks
        .map(chunk => {
            if (chunk.maps) return { maps: chunk.maps };
            if (chunk.web) return { web: chunk.web };
            return null;
        })
        .filter((s): s is GroundedSource => s !== null);

    return {
        text: response.text,
        sources: sources,
    };
};

export const findSuitableTrees = async (latitude: number, longitude: number, language: string = 'en'): Promise<SuitableTree[]> => {
    const langInstruction = language === 'fa' ? "Respond in Persian (Farsi) for all text fields." : "Respond in English.";
    const systemInstruction = `You are an expert botanist and reforestation specialist for the Green Hope Project. Your task is to recommend suitable tree species for planting at the given geographic coordinates. Analyze the location based on the latitude and longitude, considering typical climate, soil, and environmental conditions for that area. Provide a list of 3-5 highly suitable tree species. For each species, provide its common and scientific name, a brief description (in Markdown), and a clear rationale (in Markdown) for why it's a good choice for the specified location. ${langInstruction}`;
    const userPrompt = `Find suitable trees for planting at latitude: ${latitude}, longitude: ${longitude}.`
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        commonName: { type: Type.STRING },
                        scientificName: { type: Type.STRING },
                        description: { type: Type.STRING, description: "A brief description of the tree and its benefits, in Markdown format." },
                        rationale: { type: Type.STRING, description: "A detailed explanation in Markdown format about why this species is suitable." },
                    },
                    required: ["commonName", "scientificName", "description", "rationale"]
                }
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

export const calculateEconomicBenefits = async (treeName: string, scientificName: string, coords: Coords, language: string = 'en'): Promise<EconomicBenefitAnalysis> => {
    const langInstruction = language === 'fa' ? "Respond in Persian (Farsi) for all text fields." : "Respond in English.";
    const systemInstruction = `You are an agro-economist specializing in forestry and horticulture. Your task is to provide a realistic economic analysis for a specific tree species planted at a given location. Consider factors like climate, potential local markets, and typical growth rates. ${langInstruction}`;
    const userPrompt = `
        Provide an economic benefit analysis for planting the tree "${treeName}" (${scientificName}) at latitude ${coords.lat}, longitude ${coords.lng}.
        I need the following information in a JSON object:
        - annualRevenuePerTree: A realistic estimated range of annual income from the tree's products (e.g., fruit, nuts, timber, sap) once it reaches maturity.
        - yearsToProfitability: An estimated range of years it takes for the tree to become profitable.
        - primaryProducts: A list of the main commercial products from this tree.
        - otherBenefits: A brief summary in Markdown of other potential economic benefits, such as carbon credits, soil improvement leading to better yields of other crops, or ecotourism.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    annualRevenuePerTree: { type: Type.STRING },
                    yearsToProfitability: { type: Type.STRING },
                    primaryProducts: { type: Type.ARRAY, items: { type: Type.STRING } },
                    otherBenefits: { type: Type.STRING, description: "A summary in Markdown." },
                },
                required: ["annualRevenuePerTree", "yearsToProfitability", "primaryProducts", "otherBenefits"]
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};


export const suggestProjectGoals = async (latitude: number, longitude: number, language: string = 'en'): Promise<string[]> => {
    const langInstruction = language === 'fa' ? "Respond in Persian (Farsi)." : "Respond in English.";
    const systemInstruction = `You are a conservation strategist. Based on the provided geographic coordinates, generate 3 concise and actionable project goals for a reforestation or environmental project. Focus on specific, realistic objectives relevant to the likely ecosystem of that location. ${langInstruction}`;
    const userPrompt = `Project location: latitude ${latitude}, longitude ${longitude}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    goals: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "An array of 3 distinct project goal strings."
                    }
                },
                required: ["goals"]
            }
        }
    });

    const jsonStr = response.text.trim();
    const parsed = JSON.parse(jsonStr);
    return parsed.goals;
};


type ScriptScene = Omit<VideoScene, 'videoUrls' | 'imageUrl' | 'isGenerating' | 'isApproved' | 'error'>;

export const generateVideoScript = async (prompt: string, image: string | null, duration: number, videoType: string): Promise<ScriptScene[]> => {
    const systemInstruction = `You are a creative scriptwriter for an environmental organization. Your task is to generate a script for a short video about reforestation and conservation. The script should be broken down into scenes. For each scene, provide inspiring narration and a detailed description of the visuals. The total number of scenes should be appropriate for a ${duration}-second video (approximately one scene per 5-7 seconds).`;
    
    let userPrompt = `Video Topic: ${prompt}\nVideo Type: ${videoType}`;
    if (image) {
        userPrompt += "\nAn image has been provided as inspiration.";
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique ID for the scene, e.g., 'scene_1'" },
                        narration: { type: Type.STRING, description: "The voiceover narration for this scene." },
                        description: { type: Type.STRING, description: "A detailed visual description for the AI video/image generator." },
                    },
                    required: ["id", "narration", "description"],
                }
            }
        }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

export const askGoogleBabaAboutImage = async (image: {data: string, mimeType: string}, userFocus?: string): Promise<GroundedResult> => {
    const textPart = { text: `Analyze this image in the context of environmental conservation and reforestation. The user is particularly interested in: "${userFocus || 'General information, context, and potential opportunities related to the image, such as grants or partnerships.'}". Use Google Search to find relevant, up-to-date information. Provide web sources.` };
    const imagePart = { inlineData: image };

    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            tools: [{ googleSearch: {} }],
        },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
    const sources = groundingChunks.map(chunk => chunk.web).filter(s => s).map(s => ({ web: s })) as GroundedSource[];
    
    return {
        text: response.text,
        sources: sources,
    };
};

export const generateSceneVideo = async (description: string): Promise<string[]> => {
    // This is a placeholder as video generation is a long-running operation.
    // In a real app, this would initiate an operation and poll for results.
    console.log("Generating video for:", description);
    await new Promise(res => setTimeout(res, 3000)); // Simulate network delay
    // Returning a placeholder URL
    return [`/videos/placeholder.mp4`];
};

export const generateSceneImage = async (description: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: description,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9'
        }
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const generateBlogImage = async (title: string): Promise<string> => {
    const prompt = `A photorealistic, hopeful, and inspiring image for a blog post titled: '${title}'. The image should be suitable for an environmental organization focused on reforestation. The main subject should be clear and visually appealing. Avoid text overlays. Aspect ratio 16:9.`;
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9'
        }
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
};

export const editImage = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64ImageData,
            mimeType: mimeType,
        },
    };
    const textPart = {
        text: prompt,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [imagePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            const base64ImageBytes: string = part.inlineData.data;
            return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
        }
    }

    throw new Error("No image was generated.");
};


export const generateMusicDescription = async (prompt: string): Promise<string> => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Describe a suitable background music track for a video with the following theme: "${prompt}". Describe the mood, instruments, and tempo.`,
    });
    return response.text;
};

export const analyzeDeforestation = async (coords: Coords, language: string = 'en'): Promise<DeforestationAnalysis> => {
    const langInstruction = language === 'fa' ? "Respond in Persian (Farsi) for all text fields." : "Respond in English.";
    const systemInstruction = `You are an expert in remote sensing, environmental analysis, and satellite imagery interpretation for the Green Hope Project. 
    The user is asking to analyze deforestation at a specific geographic coordinate. 
    
    Use the following expert knowledge for your simulation:
    - **NDVI (Normalized Difference Vegetation Index)** is calculated as (NIR - Red) / (NIR + Red).
    - **Healthy vegetation** (dense forest) typically has an NDVI value close to +1 (e.g., 0.6 to 0.9).
    - **Barren land, urban areas, or deforested zones** have NDVI values closer to 0 or negative.
    - **Deforestation detection:** Look for a significant drop in NDVI over time (e.g., a drop > 0.2 indicates probable loss of vegetation).
    
    Simulate a detailed analysis based on historical satellite data trends (e.g., Landsat, Sentinel-2) for this region. 
    Report on estimated vegetation loss, simulated NDVI change (e.g., from 0.75 in 2014 to 0.35 in 2024), and suggest specific reforestation actions.
    Suggest 3 specific coordinate points nearby that are optimal for replanting trees.
    ${langInstruction}`;

    const userPrompt = `Analyze the area at Latitude: ${coords.lat}, Longitude: ${coords.lng} for deforestation. 
    Simulate a satellite image analysis using NDVI. 
    Provide the response in the following JSON format:
    - ndviScore: current simulated NDVI (0-1).
    - ndviChange: text description of change (e.g. "Dropped by 0.4 since 2014").
    - forestLossEstimate: text description of area lost (e.g. "Approx. 120 hectares").
    - causes: list of likely causes (e.g. "Agriculture expansion", "Logging").
    - replantingSuggestions: list of 3 objects with { lat, lng, note } for best replanting spots.
    - analysisText: A detailed markdown summary of the analysis.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: userPrompt,
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    ndviScore: { type: Type.NUMBER },
                    ndviChange: { type: Type.STRING },
                    forestLossEstimate: { type: Type.STRING },
                    causes: { type: Type.ARRAY, items: { type: Type.STRING } },
                    replantingSuggestions: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                lat: { type: Type.NUMBER },
                                lng: { type: Type.NUMBER },
                                note: { type: Type.STRING }
                            }
                        }
                    },
                    analysisText: { type: Type.STRING }
                },
                required: ["ndviScore", "ndviChange", "forestLossEstimate", "causes", "replantingSuggestions", "analysisText"]
            }
        }
    });

    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};