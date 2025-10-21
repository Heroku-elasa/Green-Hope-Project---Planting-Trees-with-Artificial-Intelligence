import { GoogleGenAI, Type } from "@google/genai";
import { 
    Language,
    PlantingSuggestion,
    VegetationAnalysis,
    RiskAnalysis,
    CrowdfundingCampaign,
    PlantingArea,
    HomePlant,
    GroundingChunk,
} from '../types';

// FIX: Per @google/genai guidelines, initialize the AI client directly,
// assuming the API_KEY environment variable is always available.
// FIX: Per @google/genai guidelines, use `process.env.API_KEY` to get the API key.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Parses a string that is expected to be a JSON object.
 * It handles cases where the JSON is wrapped in markdown-style code blocks.
 * @param text The raw text response from the model.
 * @returns The parsed JavaScript object.
 * @throws An error if the JSON is invalid.
 */
const parseJsonResponse = (text: string): any => {
    // Try to find JSON within ```json ... ```
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(jsonRegex);
    const jsonString = match ? match[1] : text;

    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.error("Failed to parse JSON response:", jsonString, e);
        throw new Error("Invalid JSON response from API.");
    }
};


const getCurrencyInfo = (language: Language): { name: string, code: string, context: string } => {
    switch (language) {
        case 'fa':
            return { 
                name: 'Iranian Toman', 
                code: 'IRT',
                context: "Please provide realistic, local market prices in Iranian Toman. For reference, a common sapling might cost between 20,000 and 150,000 Toman. Base your estimate on the species type and typical nursery prices in the region."
            };
        case 'ar':
            return { 
                name: 'Saudi Riyal', 
                code: 'SAR',
                context: "Please provide realistic, local market prices in Saudi Riyal. For reference, a common sapling might cost between 10 and 50 SAR. Base your estimate on the species type and typical nursery prices in Saudi Arabia."
            };
        case 'en':
        default:
            return { 
                name: 'USD', 
                code: 'USD',
                context: "Base your estimate on the species type and typical nursery prices in USD for a young sapling, which often range from $1 to $10."
            };
    }
};

export const getPlantingSuggestion = async (location: { lat: number; lng: number }, language: Language): Promise<PlantingSuggestion> => {
    const currency = getCurrencyInfo(language);
    const prompt = `For the geographic location with latitude ${location.lat} and longitude ${location.lng}, suggest 3 suitable native tree species for planting. Use Google Search for up-to-date, local information. For each species, provide:
1. Reason for suitability (climate, soil, biodiversity).
2. Estimated cost per sapling in ${currency.name} (${currency.code}) (a numerical min/max range). ${currency.context}
3. Best time/season for planting.
4. Initial watering needs.
5. Duration of protection needed for saplings.
Also provide a general summary. The response must be in ${language}.
IMPORTANT: Your entire response must be a single, valid JSON object, without any markdown formatting or other text.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
             tools: [{googleSearch: {}}],
        },
    });
    
    const result: PlantingSuggestion = parseJsonResponse(response.text);
    result.grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return result;
};

export const getTodaysPlantingSuggestion = async (location: { lat: number; lng: number }, language: Language): Promise<PlantingSuggestion> => {
    const currency = getCurrencyInfo(language);
    const today = new Date().toLocaleDateString(language === 'fa' ? 'fa-IR-u-nu-latn' : language, { year: 'numeric', month: 'long', day: 'numeric' });
    const prompt = `For the geographic location with latitude ${location.lat} and longitude ${location.lng}, and considering today's date is ${today}, suggest 3 native tree species ideal for planting RIGHT NOW.
If today is NOT a good day, your summary must clearly explain why (e.g., wrong season, too hot) and suggest the next best time to plant. Otherwise, the summary should confirm it's a good time.
Use Google Search for up-to-date, local information. For each species, provide:
1. Reason for suitability (climate, soil, biodiversity).
2. Estimated cost per sapling in ${currency.name} (${currency.code}) (a numerical min/max range). ${currency.context}
3. Best time/season for planting (confirming if now is appropriate).
4. Initial watering needs.
5. Duration of protection needed for saplings.
The response must be in ${language}.
IMPORTANT: Your entire response must be a single, valid JSON object, without any markdown formatting or other text.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
             tools: [{googleSearch: {}}],
        },
    });
    
    const result: PlantingSuggestion = parseJsonResponse(response.text);
    result.grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return result;
};

export const getVegetationAnalysis = async (location: { lat: number; lng: number }, language: Language): Promise<VegetationAnalysis> => {
    const prompt = `Analyze the current vegetation cover for the area around latitude ${location.lat} and longitude ${location.lng}. Use Google Search to get recent, relevant data. Provide the percentage of vegetation cover, the level of reforestation need (Low, Medium, High), and a brief analysis. The response must be in ${language}.
IMPORTANT: Your entire response must be a single, valid JSON object, without any markdown formatting or other text.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const result: VegetationAnalysis = parseJsonResponse(response.text);
    result.grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return result;
};

export const getRiskAnalysis = async (location: { lat: number; lng: number }, numberOfTrees: number, language: Language): Promise<RiskAnalysis> => {
    const prompt = `For a project to plant ${numberOfTrees} trees at latitude ${location.lat} and longitude ${location.lng}, analyze potential risks. Use Google Search for local environmental laws, climate impacts (drought, wildfires), and ecological risks. Provide a list of risks. For each risk, include:
1. 'name' (string).
2. 'severity' ('Low', 'Medium', or 'High').
3. 'explanation' (string).
4. 'location' (an object with 'lat' and 'lng') IF the risk is tied to a specific point (e.g., a factory for pollution). This is optional.
Also, calculate an 'overallRiskScore' from 0 to 100. Respond in ${language}.
IMPORTANT: The entire response must be a single, valid JSON object without markdown.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });
    
    const result: RiskAnalysis = parseJsonResponse(response.text);
    result.grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return result;
};

export const generateCrowdfundingCampaign = async (suggestion: PlantingSuggestion, location: { lat: number; lng: number }, language: Language): Promise<CrowdfundingCampaign> => {
    const speciesNames = suggestion.suitableSpecies.map(s => s.name).join(', ');
    const prompt = `Create a catchy title and a two-paragraph description for a crowdfunding campaign to plant trees (${speciesNames}) near location ${location.lat}, ${location.lng}. Mention the importance of this project for the environment. The tone should be inspiring. Respond in ${language} in a JSON format with 'title' and 'description' keys.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING },
                },
                required: ["title", "description"],
            },
        },
    });
    // The response is already a JSON object when responseMimeType is application/json.
    const result = JSON.parse(response.text);
    return result;
};

export const findPlantingAreas = async (bounds: { sw: { lat: number, lng: number }, ne: { lat: number, lng: number } }, treeCount: number, language: Language): Promise<{ areas: PlantingArea[], grounding?: GroundingChunk[] }> => {
    const prompt = `Within the map area from Southwest corner ${bounds.sw.lat},${bounds.sw.lng} to Northeast corner ${bounds.ne.lat},${bounds.ne.lng}, identify up to 5 distinct locations suitable for planting ${treeCount} trees. Use Google Maps to focus on areas with low vegetation, wastelands, or areas in need of ecological restoration. For each location, provide the precise latitude and longitude, and a brief one-sentence reason for its suitability. Respond in ${language}.
IMPORTANT: Your entire response must be a single, valid JSON array of objects, without any markdown formatting or other text. Each object must have 'location' ({lat, lng}) and 'reason' (string).`;
    const centerLat = (bounds.sw.lat + bounds.ne.lat) / 2;
    const centerLng = (bounds.sw.lng + bounds.ne.lng) / 2;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleMaps: {}}],
            toolConfig: {
              retrievalConfig: {
                latLng: {
                  latitude: centerLat,
                  longitude: centerLng
                }
              }
            }
        },
    });
    
    const areas: PlantingArea[] = parseJsonResponse(response.text);
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return { areas, grounding };
};

export const getHomeGardeningSuggestions = async (condition: string, language: Language): Promise<{ suggestions: HomePlant[], grounding?: GroundingChunk[] }> => {
    const prompt = `Suggest 3 to 5 plants suitable for home gardening in a '${condition}' environment. Use Google Search to find interesting and suitable plants. For each plant, provide its common name, its type (e.g., 'Flowering Plant', 'Herb', 'Succulent'), simple care instructions, and what it's best for (e.g., 'small pots', 'hanging baskets'). Respond in ${language}.
IMPORTANT: Your entire response must be a single, valid JSON array of objects, without any markdown formatting or other text.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
             tools: [{googleSearch: {}}],
        },
    });

    const suggestions: HomePlant[] = parseJsonResponse(response.text);
    const grounding = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    return { suggestions, grounding };
};
