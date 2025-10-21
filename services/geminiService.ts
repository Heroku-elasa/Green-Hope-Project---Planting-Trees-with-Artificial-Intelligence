import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { 
    Language,
    PlantingSuggestion,
    VegetationAnalysis,
    RiskAnalysis,
    CrowdfundingCampaign,
    PlantingArea,
    HomePlant,
    GroundingSource,
    WeatherData,
    ReforestationArea,
    FullAnalysis,
} from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const suggestionSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { type: Type.STRING, description: "A two-sentence summary of the area's potential for tree planting." },
        suitableSpecies: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the tree species." },
                    reason: { type: Type.STRING, description: "Reason why this species is suitable for the area (climate, soil, biodiversity)." },
                    estimatedCostPerTree: {
                        type: Type.OBJECT,
                        properties: {
                           min: { type: Type.NUMBER, description: "Minimum estimated cost per sapling in USD." },
                           max: { type: Type.NUMBER, description: "Maximum estimated cost per sapling in USD." }
                        },
                         required: ["min", "max"]
                    },
                    bestPlantingTime: { type: Type.STRING, description: "Best time or season to plant this species (e.g., 'Early Spring')." },
                    initialWateringNeeds: { type: Type.STRING, description: "Initial watering requirements (e.g., 'Twice a week for 90 days')." },
                    protectionDuration: { type: Type.STRING, description: "Duration needed to protect the saplings (e.g., '2-3 years')." },
                },
                required: ["name", "reason", "estimatedCostPerTree", "bestPlantingTime", "initialWateringNeeds", "protectionDuration"],
            },
        },
    },
    required: ["summary", "suitableSpecies"],
};

const vegetationSchema = {
    type: Type.OBJECT,
    properties: {
        coveragePercentage: { type: Type.NUMBER, description: "A placeholder field, return 0. The analysis text is what matters." },
        reforestationNeed: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "The level of need for reforestation." },
        analysis: { type: Type.STRING, description: "A brief qualitative analysis of the current vegetation status (e.g., dense forest, sparse scrubland) and the reason for the reforestation need." },
    },
    required: ["coveragePercentage", "reforestationNeed", "analysis"],
};

const riskSchema = {
    type: Type.OBJECT,
    properties: {
        overallRiskScore: { type: Type.NUMBER, description: "An overall risk score from 0 to 100, where 100 is the highest risk." },
        risks: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Name of the risk (e.g., 'Environmental Regulations', 'Wildfire Hazard')." },
                    severity: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "The severity of the risk." },
                    explanation: { type: Type.STRING, description: "A brief explanation of the risk and its impact." },
                },
                required: ["name", "severity", "explanation"],
            },
        },
    },
    required: ["overallRiskScore", "risks"],
};

const fullAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        plantingSuggestion: suggestionSchema,
        vegetationAnalysis: vegetationSchema,
        riskAnalysis: riskSchema,
    },
    required: ["plantingSuggestion", "vegetationAnalysis", "riskAnalysis"],
};

const campaignSchema = {
    type: Type.OBJECT,
    properties: {
        title: { type: Type.STRING, description: "A catchy title for the campaign." },
        description: { type: Type.STRING, description: "A two-paragraph description for the campaign." },
    },
    required: ["title", "description"],
};

const areasSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            location: {
                type: Type.OBJECT,
                properties: {
                    lat: { type: Type.NUMBER, description: "Latitude of the suggested area." },
                    lng: { type: Type.NUMBER, description: "Longitude of the suggested area." },
                },
                required: ["lat", "lng"],
            },
            reason: { type: Type.STRING, description: "A brief reason why this area is suitable." },
        },
        required: ["location", "reason"],
    },
};

const reforestationAreasSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            location: {
                type: Type.OBJECT,
                properties: {
                    lat: { type: Type.NUMBER, description: "Latitude of the area in need." },
                    lng: { type: Type.NUMBER, description: "Longitude of the area in need." },
                },
                required: ["lat", "lng"],
            },
            need: { type: Type.STRING, enum: ['Low', 'Medium', 'High'], description: "The level of need for reforestation." },
            reason: { type: Type.STRING, description: "A brief reason for the reforestation need level." },
        },
        required: ["location", "need", "reason"],
    },
};

const homePlantsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The common name of the plant." },
            type: { type: Type.STRING, description: "The type of plant (e.g., 'Flowering Plant', 'Herb', 'Succulent')." },
            careInstructions: { type: Type.STRING, description: "Simple, brief care instructions for the plant." },
            suitableFor: { type: Type.STRING, description: "What environment it is best suited for (e.g., 'small pots', 'hanging baskets')." },
        },
        required: ["name", "type", "careInstructions", "suitableFor"],
    },
};

const weatherSchema = {
    type: Type.OBJECT,
    properties: {
        temperature: { type: Type.NUMBER, description: "Current temperature in Celsius." },
        precipitationProbability: { type: Type.NUMBER, description: "Probability of precipitation as a percentage (0-100)." },
        windSpeed: { type: Type.NUMBER, description: "Wind speed in kilometers per hour (km/h)." },
        summary: { type: Type.STRING, description: "A brief one-sentence summary of the weather conditions."}
    },
    required: ["temperature", "precipitationProbability", "windSpeed", "summary"],
};

const parseGroundingSources = (response: GenerateContentResponse): GroundingSource[] => {
    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
        for (const chunk of chunks) {
            if (chunk.web && chunk.web.uri) {
                sources.push({ uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri, type: 'web' });
            } else if (chunk.maps && chunk.maps.uri) {
                sources.push({ uri: chunk.maps.uri, title: chunk.maps.title || chunk.maps.uri, type: 'maps' });
            }
        }
    }
    // De-duplicate sources
    return [...new Map(sources.map(item => [item.uri, item])).values()];
};

function cleanAndParseJson(text: string) {
    const trimmedText = text.trim();
    const jsonMatch = trimmedText.match(/^```json\s*([\s\S]*?)\s*```$/);
    if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(trimmedText);
}

export const getFullAnalysis = async (location: { lat: number; lng: number }, language: Language, useGrounding: boolean): Promise<FullAnalysis> => {
    let prompt = `Perform a comprehensive environmental analysis for the location at latitude ${location.lat} and longitude ${location.lng}. Provide the output in ${language} and in a single JSON object that strictly adheres to the schema. The analysis should include three sections:

1.  **Planting Suggestion**: Suggest 3 suitable native tree species. For each species, provide: reason for suitability, estimated cost per sapling in USD (min/max), best planting time, initial watering needs, and protection duration. Also include a general summary.

2.  **Vegetation Analysis**: Provide a qualitative description of the current vegetation cover (e.g., 'dense forest', 'sparse scrubland', 'arid') in the 'analysis' field. Instead of a numeric percentage, describe the vegetation. Based on this, assess the reforestation need as 'Low', 'Medium', or 'High'. For the 'coveragePercentage' field, return 0 as a placeholder.

3.  **Risk Analysis**: For a project to plant 1000 trees, analyze potential risks (e.g., environmental laws, climate impacts like drought/wildfires, ecological risks). Provide a list of risks with their severity ('Low', 'Medium', 'High') and an explanation. Calculate an overall risk score from 0 to 100.`;

    const config: any = {};
    if (useGrounding) {
        prompt = `Using Google Search for the most current and localized information, ${prompt}`;
        config.tools = [{googleSearch: {}}, {googleMaps: {}}];
    } else {
        config.responseMimeType = "application/json";
        config.responseSchema = fullAnalysisSchema;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config,
    });
    
    const sources = useGrounding ? parseGroundingSources(response) : undefined;
    
    let parsedJson: any;

    try {
        parsedJson = cleanAndParseJson(response.text);
    } catch (e) {
        console.error("Failed to parse JSON from full analysis response:", response.text, e);
        const errorMessage = `The model provided a response that could not be parsed as JSON. Please see the raw output below.\n\n---\n\n${response.text}`;
        return {
            plantingSuggestion: {
                summary: errorMessage,
                suitableSpecies: [],
            },
            vegetationAnalysis: {
                 analysis: "Failed to parse model response.",
                 coveragePercentage: 0,
                 reforestationNeed: 'Low',
            },
            riskAnalysis: {
                overallRiskScore: 0,
                risks: [{ name: "Response Parsing Error", severity: "High", explanation: "Failed to parse model response." }],
            },
            sources: sources
        };
    }

    return {
        plantingSuggestion: parsedJson.plantingSuggestion,
        vegetationAnalysis: parsedJson.vegetationAnalysis,
        riskAnalysis: parsedJson.riskAnalysis,
        sources: sources,
    };
};

export const getWeatherData = async (location: { lat: number; lng: number }, language: Language): Promise<WeatherData> => {
    const prompt = `Using Google Search for real-time data, provide the current weather for latitude ${location.lat}, longitude ${location.lng}. I need temperature in Celsius, precipitation probability as a percentage (0-100), and wind speed in kilometers per hour (km/h). Also provide a brief, one-sentence summary of the conditions. The response must be in ${language} and in JSON format.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            tools: [{googleSearch: {}}],
        },
    });

    const sources = parseGroundingSources(response);

    try {
        const parsedJson = cleanAndParseJson(response.text);
        return { ...parsedJson, sources };
    } catch (e) {
        console.error("Failed to parse JSON from weather response:", response.text, e);
        return {
            temperature: 0,
            precipitationProbability: 0,
            windSpeed: 0,
            summary: `The model provided a response that could not be parsed as JSON. Please see the raw output below.\n\n---\n\n${response.text}`,
            sources: sources,
        };
    }
};

export const generateCrowdfundingCampaign = async (suggestion: PlantingSuggestion, location: { lat: number; lng: number }, language: Language): Promise<CrowdfundingCampaign> => {
    const speciesNames = suggestion.suitableSpecies.map(s => s.name).join(', ');
    const prompt = `Create a catchy title and a two-paragraph description for a crowdfunding campaign to plant trees (${speciesNames}) near location ${location.lat}, ${location.lng}. Mention the importance of this project for the environment. The tone should be inspiring. Respond in ${language} in a JSON format with 'title' and 'description' keys.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: campaignSchema,
        },
    });
    return JSON.parse(response.text);
};

export const findPlantingAreas = async (bounds: { sw: { lat: number, lng: number }, ne: { lat: number, lng: number } }, treeCount: number, language: Language, useGrounding: boolean): Promise<PlantingArea[]> => {
    let prompt = `Within the map area from Southwest corner ${bounds.sw.lat},${bounds.sw.lng} to Northeast corner ${bounds.ne.lat},${bounds.ne.lng}, identify up to 5 distinct locations suitable for planting ${treeCount} trees. Focus on areas with low vegetation or in need of ecological restoration. For each location, provide the precise latitude and longitude, and a brief one-sentence reason for its suitability. Respond in ${language} as a JSON array that strictly matches the schema.`;
    
    const config: any = {};
    if (useGrounding) {
        prompt = `Using Google Search to identify suitable land based on recent data, ${prompt}`;
        config.tools = [{googleSearch: {}}];
    } else {
        config.responseMimeType = "application/json";
        config.responseSchema = areasSchema;
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config,
    });

    if (!useGrounding) {
        return JSON.parse(response.text);
    }

    try {
        return cleanAndParseJson(response.text);
    } catch(e) {
        console.error("Failed to parse JSON for planting areas:", response.text, e);
        return [];
    }
};

export const findReforestationAreas = async (bounds: { sw: { lat: number, lng: number }, ne: { lat: number, lng: number } }, language: Language): Promise<ReforestationArea[]> => {
    const prompt = `Within the map area from Southwest corner ${bounds.sw.lat},${bounds.sw.lng} to Northeast corner ${bounds.ne.lat},${bounds.ne.lng}, identify up to 15 locations that need reforestation. Classify each location's need as 'High', 'Medium', or 'Low' based on visible deforestation, aridness, or proximity to urban areas. For each location, provide precise latitude/longitude and a very brief reason. Respond in ${language} as a JSON array that strictly matches the schema.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: reforestationAreasSchema,
        },
    });

    try {
        return JSON.parse(response.text);
    } catch(e) {
        console.error("Failed to parse JSON for reforestation areas:", response.text, e);
        return [];
    }
};

export const analyzePolygonArea = async (polygon: { lat: number, lng: number }[], treeCount: number, language: Language, useGrounding: boolean): Promise<PlantingArea[]> => {
    const polygonString = polygon.map(p => `(${p.lat.toFixed(5)}, ${p.lng.toFixed(5)})`).join(', ');
    let prompt = `Within the polygon defined by these vertices: ${polygonString}, identify up to 5 distinct locations suitable for planting ${treeCount} trees. Focus on areas with low vegetation or in need of ecological restoration. For each location, provide the precise latitude and longitude, and a brief one-sentence reason for its suitability. Respond in ${language} as a JSON array that strictly matches the schema.`;
    
    const config: any = {};
    if (useGrounding) {
        prompt = `Using Google Search to identify suitable land based on recent data, ${prompt}`;
        config.tools = [{googleSearch: {}}];
    } else {
        config.responseMimeType = "application/json";
        config.responseSchema = areasSchema;
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config,
    });

    if (!useGrounding) {
        return JSON.parse(response.text);
    }
    
    try {
        return cleanAndParseJson(response.text);
    } catch(e) {
        console.error("Failed to parse JSON for polygon areas:", response.text, e);
        return [];
    }
};


export const getHomeGardeningSuggestions = async (condition: string, language: Language): Promise<HomePlant[]> => {
    const prompt = `Suggest 3 to 5 plants suitable for home gardening in a '${condition}' environment. For each plant, provide its common name, its type (e.g., 'Flowering Plant', 'Herb', 'Succulent'), simple care instructions, and what it's best for (e.g., 'small pots', 'hanging baskets'). Respond in ${language} as a JSON array that strictly matches the schema.`;
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: homePlantsSchema,
        },
    });
    return JSON.parse(response.text);
};
