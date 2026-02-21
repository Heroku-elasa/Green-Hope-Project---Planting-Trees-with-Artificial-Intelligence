import { GoogleGenAI, Type, GenerateContentResponse, Content } from "@google/genai";
import { Grant, GrantSummary, VideoScene } from "../types";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
    if (!_ai) {
        const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
        if (!apiKey) {
            throw new Error('Please set the GEMINI_API_KEY environment variable to use AI features.');
        }
        _ai = new GoogleGenAI({ apiKey });
    }
    return _ai;
}
const ai = new Proxy({} as GoogleGenAI, {
    get(_target, prop) {
        return (getAI() as any)[prop];
    }
});

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

export const generateMusicDescription = async (prompt: string): Promise<string> => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Describe a suitable background music track for a video with the following theme: "${prompt}". Describe the mood, instruments, and tempo.`,
    });
    return response.text;
};

export const generateCompostPlan = async (wasteType: string, space: string, climate: string): Promise<string> => {
    const prompt = `
        Act as a master composter and environmental scientist. A user needs a personalized home composting plan.
        
        User's situation:
        - Primary waste source: "${wasteType}"
        - Available space: "${space}"
        - Local climate: "${climate}"

        Based on this, generate a comprehensive, easy-to-follow composting plan in Markdown format. The plan should include:
        1.  **Recommended Method:** Suggest the best composting method (e.g., Hot Composting, Cold Composting, Vermicomposting, Bokashi) and explain why it's suitable.
        2.  **Getting Started:** A simple list of materials and tools needed.
        3.  **Location Tips:** Specific advice on where to place their compost pile/bin based on their available space.
        4.  **"Green" to "Brown" Ratio:** A clear, simple explanation of the carbon-to-nitrogen ratio they should aim for, with examples relevant to their waste type.
        5.  **Step-by-Step Instructions:** A numbered list for building and maintaining their compost.
        6.  **Success Tips:** 3-4 key tips for success, tailored to their climate and setup.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const troubleshootCompost = async (problem: string): Promise<string> => {
    const prompt = `
        Act as a master composter and problem-solver. A user is having an issue with their compost pile.
        
        User's problem: "${problem}"

        Please provide a helpful diagnosis and solution in Markdown format. Your response should include:
        1.  **Likely Cause(s):** Clearly explain the most common reasons for this problem.
        2.  **Immediate Actions:** A numbered list of steps the user can take right now to fix the issue.
        3.  **Long-Term Prevention:** Tips on how to avoid this problem in the future.
        
        Keep the language encouraging and easy to understand for a beginner.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const generateCompostBusinessIdeas = async (query: string): Promise<string> => {
    const prompt = `
        Act as a business consultant specializing in sustainable and green startups. A user is interested in starting a business related to composting.

        User's query/goal: "${query}"

        Provide a concise yet comprehensive response in Markdown format. Your advice should cover:
        1.  **Business Models:** Suggest 2-3 specific business ideas based on their query (e.g., subscription collection service, premium soil blend production, corporate waste consulting).
        2.  **First Steps:** Outline a clear, actionable 3-step plan to get started.
        3.  **Key Considerations:** Briefly mention important factors like local regulations, sourcing materials, and marketing.
        4.  **A Word of Encouragement:** End with a positive, motivating statement.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
};

export const analyzeCompostImage = async (imageData: string, mimeType: string, question: string): Promise<string> => {
    const systemInstruction = "You are a master composter and environmental scientist. Analyze the user's image and question to provide expert, helpful, and encouraging advice in Markdown format.";
    
    const imagePart = {
      inlineData: {
        mimeType,
        data: imageData,
      },
    };
    const textPart = {
      text: `User's question: "${question}"\n\nPlease analyze the image and answer the question.`
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            systemInstruction
        }
    });

    return response.text;
};