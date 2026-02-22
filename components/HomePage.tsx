import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage, PlantingSuggestion, VegetationAnalysis, RiskAnalysis, CrowdfundingCampaign, PlantingArea, GroundingSource, WeatherData, ReforestationArea } from '../types';
import { useToast } from './Toast';
import HomeGardeningPage from './HomeGardeningPage';
import { findPlantingAreas, analyzePolygonArea, findReforestationAreas } from '../services/geminiService';
import MapLegend from './MapLegend';

declare const L: any; // Declare Leaflet global

type LoadingState = 'full-analysis' | 'campaign' | 'areas' | 'weather' | 'reforestation-need' | false;
type Severity = 'Low' | 'Medium' | 'High';
type ActiveView = 'reforestation' | 'homeGardening';

interface GreenHopePageProps {
    onLocationSelect: (location: { lat: number, lng: number }, analyze?: boolean) => void;
    selectedLocation: { lat: number, lng: number } | null;
    onFullAnalysis: () => void;
    onGenerateCampaign: () => void;
    onFetchWeather: () => void;
    plantingSuggestion: PlantingSuggestion | null;
    vegetationAnalysis: VegetationAnalysis | null;
    riskAnalysis: RiskAnalysis | null;
    crowdfundingCampaign: CrowdfundingCampaign | null;
    weatherData: WeatherData | null;
    isLoading: LoadingState;
    setIsLoading: (loading: LoadingState) => void;
    error: string | null;
    numberOfTrees: number;
    onNumberOfTreesChange: (count: number) => void;
    reforestationGoal: number;
    onReforestationGoalChange: (goal: number) => void;
    useGrounding: boolean;
    onUseGroundingChange: (use: boolean) => void;
}

// --- Reusable UI Components ---

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-emerald-400"></div>
    </div>
);

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: string; isLoading: boolean; loadingSkeleton?: React.ReactNode }> = ({ title, icon, children, isLoading, loadingSkeleton }) => (
    <div className="bg-slate-800/50 p-6 rounded-lg border border-white/10 h-full">
        <div className="flex items-center mb-4">
            <i className={`${icon} text-2xl text-emerald-400 mr-3 rtl:ml-3`}></i>
            <h3 className="text-xl font-bold text-white">{title}</h3>
        </div>
        {isLoading ? (loadingSkeleton ?? <LoadingIndicator />) : children}
    </div>
);

// --- Skeleton Loaders for Analysis Results ---

const PlantingSuggestionSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="bg-slate-700/50 rounded h-10 w-full"></div>
        {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-900/50 p-4 rounded-lg space-y-3 border border-slate-700">
                <div className="flex justify-between items-start">
                    <div className="bg-slate-700/50 rounded h-6 w-1/3"></div>
                    <div className="flex-shrink-0 pl-2 rtl:pr-2 rtl:pl-0 w-24 space-y-1">
                        <div className="bg-slate-700/50 rounded h-4 w-full"></div>
                        <div className="bg-slate-700/50 rounded h-5 w-full"></div>
                    </div>
                </div>
                <div className="bg-slate-700/50 rounded h-4 w-full"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 pt-3 border-t border-slate-700/50">
                    {[...Array(3)].map((_, j) => (
                        <div key={j} className="space-y-1">
                            <div className="bg-slate-700/50 rounded h-4 w-2/3"></div>
                            <div className="bg-slate-700/50 rounded h-4 w-1/2"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-slate-700/50 rounded-md h-16 mt-2"></div>
            </div>
        ))}
    </div>
);

const VegetationAnalysisSkeleton: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="bg-slate-700/50 rounded h-5 w-3/4"></div>
        <div className="bg-slate-700/50 rounded h-5 w-1/2"></div>
        <div className="pt-2 border-t border-slate-700 space-y-2">
             <div className="bg-slate-700/50 rounded h-4 w-full"></div>
             <div className="bg-slate-700/50 rounded h-4 w-5/6"></div>
        </div>
    </div>
);

const RiskAnalysisSkeleton: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="text-center mb-4">
            <div className="bg-slate-700/50 rounded h-4 w-1/2 mx-auto mb-2"></div>
            <div className="bg-slate-700/50 rounded h-8 w-1/3 mx-auto"></div>
        </div>
        {[...Array(2)].map((_, i) => (
             <div key={i} className="bg-slate-900/50 p-2 rounded-md space-y-1">
                <div className="bg-slate-700/50 rounded h-4 w-3/4"></div>
                <div className="bg-slate-700/50 rounded h-3 w-full"></div>
            </div>
        ))}
    </div>
);

const WeatherDisplaySkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="flex justify-between items-center">
            <div className="bg-slate-700/50 rounded h-5 w-1/3"></div>
            <div className="bg-slate-700/50 rounded h-6 w-1/4"></div>
        </div>
        <div className="flex justify-between items-center">
            <div className="bg-slate-700/50 rounded h-5 w-1/2"></div>
            <div className="bg-slate-700/50 rounded h-6 w-1/5"></div>
        </div>
        <div className="flex justify-between items-center">
            <div className="bg-slate-700/50 rounded h-5 w-2/5"></div>
            <div className="bg-slate-700/50 rounded h-6 w-1/4"></div>
        </div>
        <div className="pt-2 border-t border-slate-700 space-y-2">
            <div className="bg-slate-700/50 rounded h-4 w-full"></div>
        </div>
    </div>
);

// --- Analysis Result Display Components ---
const SourceList: React.FC<{ sources?: GroundingSource[], t: (key: string) => string }> = ({ sources, t }) => {
    if (!sources || sources.length === 0) return null;

    return (
        <div className="mt-6 pt-4 border-t border-slate-700/50">
            <h5 className="text-sm font-semibold text-slate-400 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-link"></i>
                {t('results.sources')}
            </h5>
            <ul className="space-y-1 list-none pl-0 text-xs">
                {sources.map((source, index) => (
                    <li key={index} className="flex items-start gap-2">
                        <span className="text-slate-500 mt-0.5">{source.type === 'web' ? <i className="fa-solid fa-globe"></i> : <i className="fa-solid fa-map-pin"></i>}</span>
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline truncate" title={source.title}>
                           {source.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const getSeverityBadgeClasses = (severity: Severity) => {
    const colors: Record<Severity, string> = {
        High: 'bg-red-500/20 text-red-300 border-red-500/50',
        Medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
        Low: 'bg-green-500/20 text-green-300 border-green-500/50',
    };
    return `px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[severity] || ''}`;
};


const RiskScore: React.FC<{ score: number }> = ({ score }) => {
    const getColor = () => {
        if (score > 75) return 'text-red-400';
        if (score > 40) return 'text-yellow-400';
        return 'text-green-400';
    };
    return <span className={`font-bold text-2xl ${getColor()}`}>{score} / 100</span>;
};

const PlantingSuggestionDisplay: React.FC<Pick<GreenHopePageProps, 'plantingSuggestion' | 'numberOfTrees' | 'onGenerateCampaign' | 'isLoading'>> = ({ plantingSuggestion, numberOfTrees, onGenerateCampaign, isLoading }) => {
    const { t } = useLanguage();
    if (!plantingSuggestion) return null;

    return (
        <div className="space-y-4">
            <p className="text-slate-300 mb-4 whitespace-pre-wrap">{plantingSuggestion.summary}</p>
            {plantingSuggestion.suitableSpecies.length > 0 && (
                 <div className="space-y-4">
                    {plantingSuggestion.suitableSpecies.map(s => (
                        <div key={s.name} className="bg-slate-900/50 p-4 rounded-lg space-y-3 border border-slate-700">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-emerald-300 text-lg">{s.name}</h4>
                                <div className="text-right flex-shrink-0 pl-2 rtl:pr-2 rtl:pl-0">
                                    <p className="text-xs text-slate-400">{t('results.costPerTree')}</p>
                                    <p className="font-semibold text-white">${s.estimatedCostPerTree.min} - ${s.estimatedCostPerTree.max}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-300"><strong className="text-slate-400">{t('results.reason')}:</strong> {s.reason}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 pt-3 border-t border-slate-700/50 text-sm">
                                <div>
                                    <p className="font-semibold text-slate-400">{t('results.bestPlantingTime')}</p>
                                    <p className="text-white">{s.bestPlantingTime}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-400">{t('results.wateringNeeds')}</p>
                                    <p className="text-white">{s.initialWateringNeeds}</p>
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-400">{t('results.protectionDuration')}</p>
                                    <p className="text-white">{s.protectionDuration}</p>
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-emerald-800/50 to-emerald-700/50 text-center p-4 rounded-lg mt-4 border border-emerald-600/50 shadow-lg">
                                <p className="text-base font-bold text-emerald-200 flex items-center justify-center gap-2">
                                    <i className="fa-solid fa-sack-dollar"></i>
                                    <span>{t('results.totalCost', { count: numberOfTrees.toLocaleString() })}</span>
                                </p>
                                <p className="text-2xl font-mono font-bold text-white mt-1">
                                    ${(s.estimatedCostPerTree.min * numberOfTrees).toLocaleString()} - ${(s.estimatedCostPerTree.max * numberOfTrees).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <SourceList sources={plantingSuggestion.sources} t={t} />
            {plantingSuggestion.suitableSpecies.length > 0 && (
                <button onClick={onGenerateCampaign} disabled={!!isLoading || numberOfTrees < 1} className="w-full mt-4 py-2 px-4 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">{t('results.startCrowdfunding')}</button>
            )}
        </div>
    );
};

const CampaignDisplay: React.FC<Pick<GreenHopePageProps, 'crowdfundingCampaign'>> = ({ crowdfundingCampaign }) => {
    const { t } = useLanguage();
    if (!crowdfundingCampaign) return null;
    return (
        <div className="space-y-4 text-center">
            <h4 className="text-2xl font-bold text-yellow-300">{crowdfundingCampaign.title}</h4>
            <p className="text-slate-300 whitespace-pre-wrap">{crowdfundingCampaign.description}</p>
            <div className="w-full bg-slate-700 rounded-full h-4 my-4">
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 h-4 rounded-full" style={{ width: '15%' }}></div>
            </div>
            <p className="text-sm text-slate-400">{t('campaign.goal')}</p>
            <button className="px-8 py-3 bg-yellow-500 text-white font-bold rounded-lg hover:bg-yellow-600 transition-colors shadow-lg animate-pulse-glow">{t('campaign.donate')}</button>
        </div>
    );
};

const VegetationAnalysisDisplay: React.FC<Pick<GreenHopePageProps, 'vegetationAnalysis'>> = ({ vegetationAnalysis }) => {
    const { t } = useLanguage();
    if (!vegetationAnalysis) return null;
    return (
        <div className="space-y-3">
             <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('results.need')}:</span>
                <span className={getSeverityBadgeClasses(vegetationAnalysis.reforestationNeed)}>{vegetationAnalysis.reforestationNeed}</span>
            </div>
             <div className="pt-3 border-t border-slate-700">
                <span className="text-slate-400 text-sm">{t('results.analysis')}:</span>
                 <p className="text-sm text-slate-300 whitespace-pre-wrap">{vegetationAnalysis.analysis}</p>
            </div>
            <SourceList sources={vegetationAnalysis.sources} t={t} />
        </div>
    );
};

const RiskAnalysisDisplay: React.FC<Pick<GreenHopePageProps, 'riskAnalysis'>> = ({ riskAnalysis }) => {
    const { t } = useLanguage();
    if (!riskAnalysis) return null;
    return (
        <div className="space-y-3">
            <div className="text-center mb-4">
                <p className="text-slate-400 text-sm">{t('results.overallScore')}</p>
                <RiskScore score={riskAnalysis.overallRiskScore} />
            </div>
            {riskAnalysis.risks.map(r => (
                <div key={r.name} className="bg-slate-900/50 p-3 rounded-md text-sm">
                    <div className="flex justify-between items-center mb-1">
                        <strong className="text-slate-300">{r.name}</strong>
                        <span className={getSeverityBadgeClasses(r.severity)}>{r.severity}</span>
                    </div>
                    <p className="text-xs text-slate-400 whitespace-pre-wrap">{r.explanation}</p>
                </div>
            ))}
            <SourceList sources={riskAnalysis.sources} t={t} />
        </div>
    );
};

const WeatherDisplay: React.FC<{ weatherData: WeatherData | null, onFetchWeather: () => void, isLoading: boolean }> = ({ weatherData, onFetchWeather, isLoading }) => {
    const { t } = useLanguage();
    if (!weatherData) return null;

    const weatherItems = [
        { icon: 'fa-temperature-half', label: t('weather.temperature'), value: `${weatherData.temperature.toFixed(1)}°C` },
        { icon: 'fa-cloud-showers-heavy', label: t('weather.precipitation'), value: `${weatherData.precipitationProbability}%` },
        { icon: 'fa-wind', label: t('weather.windSpeed'), value: `${weatherData.windSpeed} km/h` },
    ];

    return (
        <div className="flex flex-col h-full">
            <div className="flex-grow">
                <div className="space-y-3 mb-4">
                    {weatherItems.map(item => (
                        <div key={item.label} className="flex items-center justify-between text-sm">
                            <div className="flex items-center text-slate-400">
                                <i className={`fa-solid ${item.icon} w-5 text-center mr-2 rtl:ml-2`}></i>
                                <span>{item.label}:</span>
                            </div>
                            <span className="font-bold text-lg text-white">{item.value}</span>
                        </div>
                    ))}
                </div>
                <p className="pt-3 border-t border-slate-700 text-sm text-slate-300 whitespace-pre-wrap">{weatherData.summary}</p>
                <SourceList sources={weatherData.sources} t={t} />
            </div>
            <div className="mt-4">
                 <button onClick={onFetchWeather} disabled={isLoading} className="w-full text-xs py-2 px-3 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse">
                    {isLoading ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div> : <i className="fa-solid fa-arrows-rotate"></i>}
                    <span>{t('weather.refresh')}</span>
                </button>
            </div>
        </div>
    );
};

// --- Main Page Component ---

const legendItemsConfig = [
    { labelKey: 'mapLegend.high', color: 'bg-red-500' },
    { labelKey: 'mapLegend.medium', color: 'bg-yellow-500' },
    { labelKey: 'mapLegend.low', color: 'bg-green-500' },
];

const GreenHopePage: React.FC<GreenHopePageProps> = (props) => {
    const { language, t } = useLanguage();
    const { addToast } = useToast();
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>(null);
    const [marker, setMarker] = useState<any>(null);
    const [areaMarkers, setAreaMarkers] = useState<any[]>([]);
    const [needMarkers, setNeedMarkers] = useState<any[]>([]);
    const [activeMapType, setActiveMapType] = useState<string>('satellite');
    const [tileLayer, setTileLayer] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');
    const [activeView, setActiveView] = useState<ActiveView>('reforestation');
    const [suggestedAreas, setSuggestedAreas] = useState<PlantingArea[]>([]);
    const [reforestationAreas, setReforestationAreas] = useState<ReforestationArea[]>([]);
    const [showNeedLayer, setShowNeedLayer] = useState(false);
    const dataLayersPanelRef = useRef<HTMLDivElement>(null);
    const [dataLayers, setDataLayers] = useState<Record<string, { layer: any; active: boolean }>>({});
    const [isDataLayerPanelOpen, setIsDataLayerPanelOpen] = useState(false);
    const drawnItems = useRef<any>(null);

    const mapTiles = {
        satellite: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
            attribution: 'Tiles &copy; Esri'
        },
        terrain: {
            url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
            attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        },
        roadmap: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }
    };

    const availableDataLayers = {
        gfc: {
            id: 'gfc',
            name: t('mapDataLayers.gfc'),
            url: 'https://tiles.globalforestwatch.org/gfw_integrated_alerts/latest/default/{z}/{x}/{y}.png',
            attribution: 'GFW'
        }
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dataLayersPanelRef.current && !dataLayersPanelRef.current.contains(event.target as Node)) {
                setIsDataLayerPanelOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleDataLayer = (layerId: keyof typeof availableDataLayers) => {
        if (!map) return;

        setDataLayers(prevLayers => {
            const newLayers = { ...prevLayers };
            const layerInfo = availableDataLayers[layerId];
            const existingLayerState = newLayers[layerId];

            if (existingLayerState && existingLayerState.active) {
                // Deactivate and remove
                map.removeLayer(existingLayerState.layer);
                newLayers[layerId] = { ...existingLayerState, active: false };
            } else {
                // Activate and add
                const newTileLayer = L.tileLayer(layerInfo.url, {
                    attribution: layerInfo.attribution,
                    opacity: 0.7
                });
                newTileLayer.addTo(map);
                newLayers[layerId] = { layer: newTileLayer, active: true };
            }
            return newLayers;
        });
    };

    const clearAllDynamicMarkers = useCallback(() => {
         areaMarkers.forEach(m => m.remove());
         setAreaMarkers([]);
         setSuggestedAreas([]);
         needMarkers.forEach(m => m.remove());
         setNeedMarkers([]);
         setReforestationAreas([]);
    }, [areaMarkers, needMarkers]);
    
    useEffect(() => {
        if (mapRef.current && !map) {
            try {
                if (typeof L === 'undefined') {
                    console.error("Leaflet (L) is undefined. Skipping map initialization.");
                    return;
                }
                const newMap = L.map(mapRef.current, {
                    zoomControl: false,
                }).setView([35.6892, 51.3890], 5);
                
                L.control.zoom({ position: 'bottomright' }).addTo(newMap);
                setMap(newMap);

                const initialTileLayer = L.tileLayer(mapTiles.satellite.url, { attribution: mapTiles.satellite.attribution }).addTo(newMap);
                setTileLayer(initialTileLayer);

                // --- Drawing Logic ---
                const featureGroup = new L.FeatureGroup().addTo(newMap);
                drawnItems.current = featureGroup;

                if (L.Control.Draw) {
                    new L.Control.Draw({
                        position: 'topright',
                        draw: {
                            polygon: {
                                shapeOptions: { color: '#10b981', weight: 2, opacity: 0.8, },
                                allowIntersection: false,
                            },
                            polyline: false, circle: false, rectangle: false, marker: false, circlemarker: false,
                        },
                        edit: { featureGroup: featureGroup, remove: true }
                    }).addTo(newMap);
                }

                const handleAnalyzePolygon = async (layer: any) => {
                    clearAllDynamicMarkers();
                    const latlngs = layer.getLatLngs()[0].map((p: any) => ({ lat: p.lat, lng: p.lng }));
                    props.setIsLoading('areas');
                    try {
                        const result = await findPlantingAreas(latlngs, props.numberOfTrees, language, props.useGrounding);
                        setSuggestedAreas(result);
                        addToast(result.length > 0 ? `${result.length} suitable spots found.` : 'No suitable spots found.', result.length > 0 ? 'success' : 'info');
                    } catch (err) {
                        console.error(err);
                        addToast(t('error'), 'error');
                    } finally {
                        props.setIsLoading(false);
                    }
                };
                
                newMap.on(L.Draw.Event.CREATED, (e: any) => {
                    const layer = e.layer;
                    drawnItems.current.clearLayers();
                    drawnItems.current.addLayer(layer);
                    handleAnalyzePolygon(layer);
                });

                newMap.on(L.Draw.Event.EDITED, (e: any) => {
                    e.layers.eachLayer((layer: any) => handleAnalyzePolygon(layer));
                });

                newMap.on(L.Draw.Event.DELETED, () => {
                    clearAllDynamicMarkers();
                });

                // Force layout recalculation
                setTimeout(() => {
                    newMap.invalidateSize();
                }, 100);

            } catch (err) {
                console.error("Map initialization failed in HomePage:", err);
            }
        }
    }, [mapRef, map, language, props, addToast, t, clearAllDynamicMarkers, mapTiles.satellite.attribution, mapTiles.satellite.url]);
                     clearAllDynamicMarkers();
                });

            } catch (error) {
                console.error("Leaflet map initialization failed:", error);
                addToast(t('mapError.init'), 'error');
            }
        }
        return () => { if (map) { map.remove(); } };
    }, [props.useGrounding]); // Rerun effect if grounding changes to update handler closure

    useEffect(() => {
        if (!map) return;
        const handleClick = (e: any) => {
            if (drawnItems.current) { drawnItems.current.clearLayers(); }
            props.onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
            clearAllDynamicMarkers();
            setShowNeedLayer(false);
            map.panTo(e.latlng);
        };
        map.on('click', handleClick);
        return () => { map.off('click', handleClick); };
    }, [map, props.onLocationSelect, clearAllDynamicMarkers]);


    useEffect(() => {
        if (map && props.selectedLocation) {
            if (marker) {
                marker.setLatLng(props.selectedLocation);
            } else {
                const newMarker = L.marker(props.selectedLocation).addTo(map);
                setMarker(newMarker);
            }
        }
    }, [props.selectedLocation, map, marker]);
    

    useEffect(() => {
        if (map && suggestedAreas.length > 0) {
            const newMarkers: any[] = [];
            
            suggestedAreas.forEach(area => {
                const icon = L.divIcon({
                    html: `<div class="bg-emerald-500 w-4 h-4 rounded-full border-2 border-white shadow-md"></div>`,
                    className: '',
                    iconSize: [16, 16],
                    iconAnchor: [8, 8],
                });
                const areaMarker = L.marker(area.location, { icon }).addTo(map);

                const popupContent = `
                    <div class="text-slate-800 font-sans p-1">
                        <h4 class="font-bold mt-0 mb-1">${t('main.areaSuggestion')}</h4>
                        <p class="m-0 mb-1 text-xs">${area.reason}</p>
                        <button onclick="document.dispatchEvent(new CustomEvent('selectArea', { detail: { lat: ${area.location.lat}, lng: ${area.location.lng} } }))" class="text-emerald-600 font-bold border-none bg-transparent p-0 cursor-pointer hover:underline text-sm">${t('main.analyzeLocation')}</button>
                    </div>
                `;
                areaMarker.bindPopup(popupContent);
                newMarkers.push(areaMarker);
            });
            setAreaMarkers(newMarkers);
        }
    }, [suggestedAreas, map, t]);

    useEffect(() => {
        if (map && reforestationAreas.length > 0) {
            const newMarkers: any[] = [];
            const colorMap: Record<Severity, string> = { 'High': 'red', 'Medium': 'yellow', 'Low': 'green' };

            reforestationAreas.forEach(area => {
                const color = colorMap[area.need];
                const icon = L.divIcon({
                    html: `<div class="w-5 h-5 rounded-full bg-${color}-500 border-2 border-white shadow-lg animate-pulse"></div>`,
                    className: '',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                });
                const needMarker = L.marker(area.location, { icon }).addTo(map);
                needMarker.bindTooltip(area.reason, { direction: 'top', offset: L.point(0, -10) });
                needMarker.on('click', () => {
                    props.onLocationSelect(area.location, true);
                    map.setView(area.location, 14);
                });
                newMarkers.push(needMarker);
            });
            setNeedMarkers(newMarkers);
        }
    }, [reforestationAreas, map, props.onLocationSelect]);

    useEffect(() => {
        const selectAreaHandler = (e: CustomEvent) => props.onLocationSelect(e.detail, true);
        document.addEventListener('selectArea', selectAreaHandler as EventListener);
        return () => document.removeEventListener('selectArea', selectAreaHandler as EventListener);
    }, [props.onLocationSelect]);
    
    const handleFindAreas = async () => {
        if (!map) return;
        if (drawnItems.current) { drawnItems.current.clearLayers(); }
        clearAllDynamicMarkers();
        props.setIsLoading('areas');
        try {
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            const result = await findPlantingAreas({ sw: { lat: sw.lat, lng: sw.lng }, ne: { lat: ne.lat, lng: ne.lng } }, props.numberOfTrees, language, props.useGrounding);
            setSuggestedAreas(result);
            addToast(result.length > 0 ? `${result.length} suitable areas found.` : 'No suitable areas found in the current view.', result.length > 0 ? 'success' : 'info');
        } catch (err) {
            console.error(err);
            addToast(t('error'), 'error');
        } finally {
            props.setIsLoading(false);
        }
    };
    
    const handleToggleNeedsLayer = async () => {
        if (!map) return;
        
        if (showNeedLayer) {
            setShowNeedLayer(false);
            needMarkers.forEach(m => m.remove());
            setNeedMarkers([]);
            setReforestationAreas([]);
            return;
        }

        clearAllDynamicMarkers();
        setShowNeedLayer(true);
        props.setIsLoading('reforestation-need');
        try {
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            const result = await findReforestationAreas({ sw: { lat: sw.lat, lng: sw.lng }, ne: { lat: ne.lat, lng: ne.lng } }, language);
            setReforestationAreas(result);
            addToast(result.length > 0 ? `${result.length} critical areas identified.` : 'No critical areas found in this view.', result.length > 0 ? 'success' : 'info');
        } catch (err) {
            console.error(err);
            addToast(t('error'), 'error');
        } finally {
            props.setIsLoading(false);
        }
    };

    const handleMapTypeChange = (newMapTypeId: keyof typeof mapTiles) => {
        if (map && tileLayer && activeMapType !== newMapTypeId) {
            const newTileLayer = L.tileLayer(mapTiles[newMapTypeId].url, {
                attribution: mapTiles[newMapTypeId].attribution
            });
            map.removeLayer(tileLayer);
            newTileLayer.addTo(map);
            setTileLayer(newTileLayer);
            setActiveMapType(newMapTypeId);
        }
    };
    
    const mapTypes = [
        { id: 'satellite', label: t('mapLayers.satellite'), icon: 'fa-solid fa-satellite' },
        { id: 'terrain', label: t('mapLayers.terrain'), icon: 'fa-solid fa-mountain-sun' },
        { id: 'roadmap', label: t('mapLayers.roadmap'), icon: 'fa-solid fa-map' },
    ];
    
    const handleSearch = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery || !map) return;
        setIsSearching(true);
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lng = parseFloat(result.lon);
                const location = { lat, lng };
                const [swLat, neLat, swLng, neLng] = result.boundingbox.map(parseFloat);
                map.fitBounds([[swLat, swLng], [neLat, neLng]]);
                props.onLocationSelect(location);
                setSearchQuery('');
            } else {
                addToast(t('mapError.locationNotFound', { query: searchQuery }), 'error');
            }
        } catch (error) {
            console.error('Nominatim search error:', error);
            addToast(t('mapError.searchError'), 'error');
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery, map, props.onLocationSelect, addToast, t]);

    const handleSetManualLocation = () => {
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (isNaN(lat) || lat < -90 || lat > 90) return addToast(t('mapError.invalidLat'), 'error');
        if (isNaN(lng) || lng < -180 || lng > 180) return addToast(t('mapError.invalidLng'), 'error');
        const location = { lat, lng };
        props.onLocationSelect(location);
        if(map) { map.setView(location, 12); }
    };

    const legendItems = legendItemsConfig.map(item => ({ label: t(item.labelKey), color: item.color }));
    
    const TabButton: React.FC<{label: string, icon: string, targetView: ActiveView}> = ({label, icon, targetView}) => (
        <button onClick={() => setActiveView(targetView)} role="tab" aria-selected={activeView === targetView} className={`flex-1 sm:flex-initial sm:px-6 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse ${ activeView === targetView ? 'text-emerald-400 border-emerald-400 bg-slate-800/50' : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/20'}`}>
            <i className={`fa-solid ${icon}`}></i>
            <span>{label}</span>
        </button>
    );
    
    const progressPercentage = props.reforestationGoal > 0 ? Math.min((props.numberOfTrees / props.reforestationGoal) * 100, 100) : 0;

    return (
        <div className="animate-fade-in">
            <section className="py-20 text-center bg-gradient-to-b from-slate-900 to-emerald-900/30">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">{t('hero.title')}</h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">{t('hero.subtitle')}</p>
                </div>
            </section>
            
            <section className="container mx-auto px-4 py-16">
                 <div className="flex justify-center border-b border-slate-700 mb-8" role="tablist">
                    <TabButton label={t('tabs.reforestation')} icon="fa-map-location-dot" targetView="reforestation" />
                    <TabButton label={t('tabs.homeGardening')} icon="fa-house-chimney-window" targetView="homeGardening" />
                </div>
                
                {activeView === 'reforestation' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 bg-slate-800/50 p-6 rounded-lg border border-white/10 h-min">
                                <p className="text-slate-300 text-center mb-4 text-sm">{t('main.instructions')}</p>
                                <form onSubmit={handleSearch} className="mb-4">
                                    <label htmlFor="location-search" className="sr-only">{t('main.searchPlaceholder')}</label>
                                    <div className="relative">
                                        <input type="text" id="location-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('main.searchPlaceholder')} className="w-full bg-slate-900/50 border border-slate-600 rounded-md py-2 pl-3 pr-10 rtl:pl-10 rtl:pr-3 text-white focus:ring-emerald-500 focus:border-emerald-500" disabled={!map} />
                                        <button type="submit" disabled={isSearching || !searchQuery} className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pl-3 disabled:opacity-50" title={t('main.searchButtonTitle')}>
                                            {isSearching ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div> : <i className="fa-solid fa-magnifying-glass text-slate-400 hover:text-white"></i>}
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-4 pt-4 border-t border-slate-700 mb-6">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('main.manualInputLabel')}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                        <input type="number" value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder={t('main.latLabel')} step="any" className="w-full bg-slate-900/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500" />
                                        <input type="number" value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder={t('main.lngLabel')} step="any" className="w-full bg-slate-900/50 border border-slate-600 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500" />
                                    </div>
                                    <button type="button" onClick={handleSetManualLocation} className="w-full py-2 px-4 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors">{t('main.setLocationButton')}</button>
                                </div>
                                {props.selectedLocation && !showNeedLayer && (
                                    <div className="text-center bg-slate-900/50 p-3 rounded-md mb-6"><p className="text-sm text-slate-400">{t('main.selectedLocation')}</p><p className="font-mono text-emerald-300">{props.selectedLocation.lat.toFixed(4)}, {props.selectedLocation.lng.toFixed(4)}</p></div>
                                )}
                                 <div className="pt-4 border-t border-slate-700 space-y-4">
                                    <h3 className="font-bold text-center text-lg">{t('main.analysisProgress')}</h3>
                                    <label htmlFor="reforestation-goal" className="block text-sm font-medium text-slate-300">{t('main.reforestationGoalLabel')}</label>
                                    <input type="number" id="reforestation-goal" value={props.reforestationGoal} onChange={(e) => props.onReforestationGoalChange(parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-900/50 border border-slate-600 rounded-md p-2 text-white focus:ring-emerald-500 focus:border-emerald-500" min="1" step="100" />
                                    <label htmlFor="tree-count" className="block text-sm font-medium text-slate-300">{t('main.numberOfTreesLabel')}</label>
                                    <input type="number" id="tree-count" value={props.numberOfTrees} onChange={(e) => props.onNumberOfTreesChange(parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-900/50 border border-slate-600 rounded-md p-2 text-white focus:ring-emerald-500 focus:border-emerald-500" min="1" step="10" />
                                    <div className="flex justify-between items-center text-xs text-slate-300"><p>{props.numberOfTrees.toLocaleString()} / {props.reforestationGoal.toLocaleString()}</p></div>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5"><div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} role="progressbar" aria-valuenow={progressPercentage}></div></div>
                                </div>

                                <div className="space-y-4 pt-4 mt-4 border-t border-slate-700">
                                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <button onClick={handleFindAreas} disabled={!map || props.isLoading === 'areas'} className="w-full py-2 px-3 text-sm bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">{props.isLoading === 'areas' ? <><div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div></> : t('main.findAreas')}</button>
                                        <button onClick={handleToggleNeedsLayer} disabled={!map || props.isLoading === 'reforestation-need'} className={`w-full py-2 px-3 text-sm font-semibold rounded-md transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center ${showNeedLayer ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}>{props.isLoading === 'reforestation-need' ? <><div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div></> : (showNeedLayer ? t('main.hideNeeds') : t('main.showNeeds'))}</button>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-2 text-center">
                                       {props.isLoading === 'reforestation-need' ? t('main.findingNeeds') : t('main.findAreasDescription')}
                                    </p>
                                </div>

                                <div className="space-y-4 pt-4 mt-4 border-t border-slate-700">
                                    <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-md">
                                        <div className="flex-grow pr-4 rtl:pr-0 rtl:pl-4">
                                            <label htmlFor="grounding-switch" className="block text-sm font-medium text-slate-200 cursor-pointer">{t('main.useGroundingTitle')}</label>
                                            <p className="text-xs text-slate-400">{t('main.useGroundingDesc')}</p>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                id="grounding-switch" 
                                                className="sr-only peer" 
                                                checked={props.useGrounding}
                                                onChange={(e) => props.onUseGroundingChange(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] rtl:after:right-[2px] rtl:after:left-auto after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                        </div>
                                    </div>
                                    <button onClick={props.onFullAnalysis} disabled={!props.selectedLocation || !!props.isLoading} className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse">{props.isLoading === 'full-analysis' ? (<><div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div><span>{t('loading')}</span></>) : (<><i className="fa-solid fa-wand-magic-sparkles"></i><span>{t('main.analyzeLocation')}</span></>)}</button>
                                </div>
                            </div>
                            <div className="lg:col-span-2 h-96 lg:h-[650px] bg-slate-800 rounded-lg border border-white/10 shadow-lg flex items-center justify-center p-4 relative overflow-hidden">
                                {map && (<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"><div className="bg-slate-900/70 backdrop-blur-sm rounded-lg p-1 flex space-x-1 rtl:space-x-reverse border border-white/20 shadow-lg">{mapTypes.map(type => (<button key={type.id} onClick={() => handleMapTypeChange(type.id as keyof typeof mapTiles)} className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse ${activeMapType === type.id ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`} title={type.label}><i className={`${type.icon} text-base`}></i><span className="hidden sm:inline">{type.label}</span></button>))}</div></div>)}
                                {map && <MapLegend items={legendItems} />}
                                {map && (
                                    <div ref={dataLayersPanelRef} className="absolute top-4 end-4 z-[1000]">
                                        <div className="relative">
                                            <button onClick={() => setIsDataLayerPanelOpen(!isDataLayerPanelOpen)} className="bg-slate-900/70 backdrop-blur-sm rounded-lg p-2 w-10 h-10 flex items-center justify-center border border-white/20 shadow-lg text-white hover:bg-slate-800 transition-colors" title={t('mapDataLayers.title')}>
                                                <i className="fa-solid fa-layer-group text-xl"></i>
                                            </button>
                                            {isDataLayerPanelOpen && (
                                                <div className="absolute top-full end-0 mt-2 w-64 bg-slate-800/90 backdrop-blur-md rounded-lg p-4 border border-white/20 shadow-lg animate-fade-in">
                                                    <h4 className="font-bold text-sm text-white mb-3">{t('mapDataLayers.title')}</h4>
                                                    <div className="space-y-2">
                                                        {Object.values(availableDataLayers).map(layer => (
                                                            <label key={layer.id} className="flex items-center space-x-3 rtl:space-x-reverse cursor-pointer">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={dataLayers[layer.id]?.active || false}
                                                                    onChange={() => toggleDataLayer(layer.id as keyof typeof availableDataLayers)}
                                                                    className="h-4 w-4 rounded bg-slate-700 border-slate-500 text-emerald-500 focus:ring-emerald-500 accent-emerald-500"
                                                                />
                                                                <span className="text-sm text-slate-200">{layer.name}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <div ref={mapRef} className="w-full h-full rounded-md" />
                                {!map && (<div className="absolute inset-0 w-full h-full bg-slate-700 rounded-lg animate-pulse flex items-center justify-center text-slate-400 flex-col"><svg className="w-12 h-12 mb-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5-11.492A10.5 10.5 0 0 1 21.75 10.5c0 2.512-1.023 4.79-2.688 6.438a10.378 10.378 0 0 1-2.862 2.115M4.933 4.933a10.5 10.5 0 0 1 14.134 0M4.25 10.5a10.5 10.5 0 0 0 2.688 6.438c.954.954 2.068 1.685 3.28 2.115M19.067 4.933a10.5 10.5 0 0 0-14.134 0" /></svg><p className="font-semibold">{t('main.loadingMap')}</p></div>)}
                            </div>
                        </div>
                        {props.selectedLocation && (
                            <section className="mt-8 space-y-8">
                                {props.error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{props.error}</div>}
                                <InfoCard title={t('results.suggestionTitle')} icon="fa-solid fa-tree" isLoading={props.isLoading === 'full-analysis'} loadingSkeleton={<PlantingSuggestionSkeleton />}><PlantingSuggestionDisplay {...props} /></InfoCard>
                                {(props.isLoading === 'campaign' || props.crowdfundingCampaign) && (<InfoCard title={t('campaign.title')} icon="fa-solid fa-hand-holding-dollar" isLoading={props.isLoading === 'campaign'}><CampaignDisplay {...props} /></InfoCard>)}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <InfoCard title={t('results.vegetationTitle')} icon="fa-solid fa-seedling" isLoading={props.isLoading === 'full-analysis'} loadingSkeleton={<VegetationAnalysisSkeleton />}><VegetationAnalysisDisplay {...props} /></InfoCard>
                                    <InfoCard title={t('results.riskTitle')} icon="fa-solid fa-triangle-exclamation" isLoading={props.isLoading === 'full-analysis'} loadingSkeleton={<RiskAnalysisSkeleton />}><RiskAnalysisDisplay {...props} /></InfoCard>
                                     <InfoCard title={t('weather.title')} icon="fa-solid fa-cloud-sun" isLoading={props.isLoading === 'full-analysis'} loadingSkeleton={<WeatherDisplaySkeleton />}>
                                        <WeatherDisplay weatherData={props.weatherData} onFetchWeather={props.onFetchWeather} isLoading={props.isLoading === 'weather'} />
                                    </InfoCard>
                                </div>
                            </section>
                        )}
                    </div>
                )}
                {activeView === 'homeGardening' && (<div className="animate-fade-in"><HomeGardeningPage /></div>)}
            </section>
        </div>
    );
};

export default GreenHopePage;
