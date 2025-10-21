

import { GoogleGenAI, Type, GenerateContentResponse, Content, Modality } from "@google/genai";
import { Grant, GrantSummary, VideoScene, PlantingSite, SuitableTree, EconomicBenefitAnalysis, Coords } from "../types";

// Always use new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export interface GrantResult {
    text: string;
    sources: { web: { uri: string; title: string } }[];
}

export interface ChatResponse {
    responseText: string;
    followUpPrompts: string[];
}

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


export const generateReport = async (topic: string, description: string, reportType: string): Promise<string> => {
    const prompt = `
        Generate a comprehensive report of type "${reportType}".
        Topic: ${topic}
        Description: ${description}

        The report should be well-structured, detailed, and formatted in Markdown.
        Include sections like Introduction, Site Analysis, Species Selection, Implementation Plan, Budget, and Impact Projection.
    `;

    // Use ai.models.generateContent
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    // Extract text using response.text
    return response.text;
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

export const analyzeGrant = async (grant: Grant, userProfile: string): Promise<GrantSummary> => {
    const prompt = `
        Analyze the following grant opportunity based on my profile.
        
        My Profile:
        ${userProfile}

        Grant Details:
        Title: ${grant.grantTitle}
        Funding Body: ${grant.fundingBody}
        Summary: ${grant.summary}
        Deadline: ${grant.deadline}
        Link: ${grant.link}

        Extract the following information from the grant's website (use search if needed from the link) and provide a relevance score:
        - grantTitle
        - fundingBody
        - deadline
        - amount
        - duration
        - geography
        - eligibility
        - scope
        - howToApply
        - contact
        - relevancePercentage: A score from 0 to 100 indicating how relevant this grant is to my profile.
    `;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    grantTitle: { type: Type.STRING },
                    fundingBody: { type: Type.STRING },
                    deadline: { type: Type.STRING },
                    amount: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    geography: { type: Type.STRING },
                    eligibility: { type: Type.STRING },
                    scope: { type: Type.STRING },
                    howToApply: { type: Type.STRING },
                    contact: { type: Type.STRING },
                    relevancePercentage: { type: Type.INTEGER },
                },
                required: ["grantTitle", "fundingBody", "deadline", "amount", "duration", "geography", "eligibility", "scope", "howToApply", "contact", "relevancePercentage"]
            }
        }
    });
    
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

export const findPlantingSites = async (description: string): Promise<PlantingSite[]> => {
    const systemInstruction = `You are an expert ecologist and conservation strategist for the Green Hope Project. Your task is to identify and recommend optimal locations for reforestation projects based on user-defined goals. Analyze the user's request and provide 3-5 potential sites. For each site, provide a clear rationale (in Markdown), suggest suitable native or climate-adapted tree species, and include its precise latitude and longitude.`;
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
                    },
                    required: ["locationName", "country", "latitude", "longitude", "rationale", "suggestedSpecies"]
                }
            }
        }
    });
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr);
};

export const findSuitableTrees = async (latitude: number, longitude: number): Promise<SuitableTree[]> => {
    const systemInstruction = `You are an expert botanist and reforestation specialist for the Green Hope Project. Your task is to recommend suitable tree species for planting at the given geographic coordinates. Analyze the location based on the latitude and longitude, considering typical climate, soil, and environmental conditions for that area. Provide a list of 3-5 highly suitable tree species. For each species, provide its common and scientific name, a brief description (in Markdown), and a clear rationale (in Markdown) for why it's a good choice for the specified location.`;
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

export const calculateEconomicBenefits = async (treeName: string, scientificName: string, coords: Coords): Promise<EconomicBenefitAnalysis> => {
    const systemInstruction = `You are an agro-economist specializing in forestry and horticulture. Your task is to provide a realistic economic analysis for a specific tree species planted at a given location. Consider factors like climate, potential local markets, and typical growth rates.`;
    const userPrompt = `
        Provide an economic benefit analysis for planting the tree "${treeName}" (${scientificName}) at latitude ${coords.lat}, longitude ${coords.lng}.
        I need the following information:
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


export const suggestProjectGoals = async (latitude: number, longitude: number): Promise<string[]> => {
    const systemInstruction = `You are a conservation strategist. Based on the provided geographic coordinates, generate 3 concise and actionable project goals for a reforestation or environmental project. Focus on specific, realistic objectives relevant to the likely ecosystem of that location.`;
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

export const askGoogleBabaAboutImage = async (image: {data: string, mimeType: string}, userFocus?: string): Promise<GrantResult> => {
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
    const sources = groundingChunks.map(chunk => chunk.web).filter(s => s) as { uri: string; title: string }[];
    
    return {
        text: response.text,
        sources: sources.map(s => ({ web: s })),
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