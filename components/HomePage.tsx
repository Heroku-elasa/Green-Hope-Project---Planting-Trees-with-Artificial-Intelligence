import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useLanguage, PlantingSuggestion, VegetationAnalysis, RiskAnalysis, CrowdfundingCampaign, PlantingArea, GroundingChunk } from '../types';
import { useToast } from './Toast';
import HomeGardeningPage from './HomeGardeningPage';
import { findPlantingAreas } from '../services/geminiService';
import MapLegend from './MapLegend';
import StartupShowcase from './StartupShowcase';

declare const L: any; // Declare Leaflet global

type LoadingState = 'full-analysis' | 'campaign' | 'areas' | false;
type Severity = 'Low' | 'Medium' | 'High';
type ActiveView = 'reforestation' | 'homeGardening' | 'startupShowcase';

interface GreenHopePageProps {
    onLocationSelect: (location: { lat: number, lng: number }) => void;
    selectedLocation: { lat: number, lng: number } | null;
    onFullAnalysis: () => void;
    onGenerateCampaign: () => void;
    plantingSuggestion: PlantingSuggestion | null;
    vegetationAnalysis: VegetationAnalysis | null;
    riskAnalysis: RiskAnalysis | null;
    crowdfundingCampaign: CrowdfundingCampaign | null;
    isLoading: LoadingState;
    error: string | null;
    numberOfTrees: number;
    onNumberOfTreesChange: (count: number) => void;
    reforestationGoal: number;
    onReforestationGoalChange: (goal: number) => void;
}

// --- Reusable UI Components ---
const GroundingReferences: React.FC<{ chunks: GroundingChunk[] | undefined, t: (key: string) => string }> = ({ chunks, t }) => {
    if (!chunks || chunks.length === 0) return null;
    
    const links = chunks.flatMap(chunk => {
        if (chunk.web) return { uri: chunk.web.uri, title: chunk.web.title || chunk.web.uri };
        if (chunk.maps) {
            const mapLinks = [{ uri: chunk.maps.uri, title: chunk.maps.title || chunk.maps.uri }];
            chunk.maps.placeAnswerSources?.forEach(source => {
                source.reviewSnippets?.forEach(snippet => {
                     mapLinks.push({ uri: snippet.uri, title: `Review by ${snippet.author}`});
                });
            });
            return mapLinks;
        }
        return [];
    }).filter((link, index, self) => index === self.findIndex(l => l.uri === link.uri)); // Remove duplicates

    if (links.length === 0) return null;

    return (
        <div className="mt-4 pt-4 border-t border-slate-700">
            <h5 className="text-sm font-semibold text-slate-400 mb-2">{t('results.sources')}:</h5>
            <ul className="list-disc list-inside text-xs space-y-1">
                {links.map((link, index) => (
                    <li key={index}>
                        <a href={link.uri} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline break-all">
                            {link.title}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-emerald-400"></div>
    </div>
);

const InfoCard: React.FC<{ title: string; children: React.ReactNode; icon: string; isLoading: boolean; loadingSkeleton?: React.ReactNode; tooltipText?: string; }> = ({ title, icon, children, isLoading, loadingSkeleton, tooltipText }) => (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-800">
        <div className="flex items-center mb-4">
            <i className={`${icon} text-2xl text-emerald-400 mr-3 rtl:ml-3`}></i>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            {tooltipText && (
                <div className="tooltip-container ml-2 rtl:mr-2">
                    <i className="fa-solid fa-circle-info text-slate-500 cursor-pointer"></i>
                    <span className="tooltip-text">{tooltipText}</span>
                </div>
            )}
        </div>
        {isLoading ? (loadingSkeleton ?? <LoadingIndicator />) : children}
    </div>
);

// --- Skeleton Loaders for Analysis Results ---

const PlantingSuggestionSkeleton: React.FC = () => (
    <div className="space-y-4 animate-pulse">
        <div className="bg-slate-800 rounded h-10 w-full"></div>
        {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-slate-800/50 p-4 rounded-lg space-y-3 border border-slate-700">
                <div className="flex justify-between items-start">
                    <div className="bg-slate-700 rounded h-6 w-1/3"></div>
                    <div className="flex-shrink-0 pl-2 rtl:pr-2 rtl:pl-0 w-24 space-y-1">
                        <div className="bg-slate-700 rounded h-4 w-full"></div>
                        <div className="bg-slate-700 rounded h-5 w-full"></div>
                    </div>
                </div>
                <div className="bg-slate-700 rounded h-4 w-full"></div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3 pt-3 border-t border-slate-700/50">
                    {[...Array(3)].map((_, j) => (
                        <div key={j} className="space-y-1">
                            <div className="bg-slate-700 rounded h-4 w-2/3"></div>
                            <div className="bg-slate-700 rounded h-4 w-1/2"></div>
                        </div>
                    ))}
                </div>
                <div className="bg-slate-700 rounded-md h-16 mt-2"></div>
            </div>
        ))}
    </div>
);

const VegetationAnalysisSkeleton: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="bg-slate-800 rounded h-5 w-3/4"></div>
        <div className="bg-slate-800 rounded h-5 w-1/2"></div>
        <div className="pt-2 border-t border-slate-700 space-y-2">
             <div className="bg-slate-800 rounded h-4 w-full"></div>
             <div className="bg-slate-800 rounded h-4 w-5/6"></div>
        </div>
    </div>
);

const RiskAnalysisSkeleton: React.FC = () => (
    <div className="space-y-3 animate-pulse">
        <div className="text-center mb-4">
            <div className="bg-slate-800 rounded h-12 w-1/3 mx-auto"></div>
        </div>
        {[...Array(2)].map((_, i) => (
             <div key={i} className="bg-slate-800/50 p-2 rounded-md space-y-1">
                <div className="bg-slate-700 rounded h-4 w-3/4"></div>
                <div className="bg-slate-700 rounded h-3 w-full"></div>
            </div>
        ))}
    </div>
);

// --- Analysis Result Display Components ---

const getSeverityBadgeClasses = (severity: Severity) => {
    const colors: Record<Severity, string> = {
        High: 'bg-red-500/10 text-red-400 border-red-500/30',
        Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
        Low: 'bg-green-500/10 text-green-400 border-green-500/30',
    };
    return `px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[severity] || ''}`;
};


const RiskScore: React.FC<{ score: number }> = ({ score }) => {
    const getColor = () => {
        if (score > 75) return 'text-red-400';
        if (score > 40) return 'text-yellow-400';
        return 'text-green-400';
    };
    return (
        <div className="text-center">
            <p className={`font-bold font-mono text-5xl ${getColor()}`}>{score}<span className="text-3xl text-slate-500">/100</span></p>
        </div>
    );
};

const PlantingSuggestionDisplay: React.FC<Pick<GreenHopePageProps, 'plantingSuggestion' | 'numberOfTrees' | 'onGenerateCampaign' | 'isLoading'>> = ({ plantingSuggestion, numberOfTrees, onGenerateCampaign, isLoading }) => {
    const { t, currencySymbol } = useLanguage();
    if (!plantingSuggestion) return null;

    return (
        <div className="space-y-4">
            <p className="text-slate-300 mb-4">{plantingSuggestion.summary}</p>
            <div className="space-y-4">
                {plantingSuggestion.suitableSpecies.map(s => (
                    <div key={s.name} className="bg-slate-800 p-4 rounded-lg space-y-3 border border-slate-700">
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-emerald-400 text-lg">{s.name}</h4>
                            <div className="text-right flex-shrink-0 pl-2 rtl:pr-2 rtl:pl-0">
                                <p className="text-xs text-slate-400">{t('results.costPerTree')}</p>
                                <p className="font-semibold text-white">
                                    {s.estimatedCostPerTree.min.toLocaleString()} - {s.estimatedCostPerTree.max.toLocaleString()}
                                    <span className="text-sm text-slate-400 ml-1 rtl:mr-1">{currencySymbol}</span>
                                </p>
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
                        <div className="bg-gradient-to-br from-slate-800 to-slate-700/50 text-center p-4 rounded-lg mt-4 border border-slate-700 shadow-lg">
                            <p className="text-base font-bold text-emerald-300 flex items-center justify-center gap-2">
                                <i className="fa-solid fa-sack-dollar"></i>
                                <span>{t('results.totalCost', { count: numberOfTrees.toLocaleString() })}</span>
                            </p>
                            <p className="text-2xl font-mono font-bold text-white mt-1">
                                {(s.estimatedCostPerTree.min * numberOfTrees).toLocaleString()} - {(s.estimatedCostPerTree.max * numberOfTrees).toLocaleString()}
                                <span className="text-lg text-slate-400 ml-1 rtl:mr-1">{currencySymbol}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
            <button onClick={onGenerateCampaign} disabled={!!isLoading || numberOfTrees < 1} className="w-full mt-4 py-2 px-4 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">{t('results.startCrowdfunding')}</button>
            <GroundingReferences chunks={plantingSuggestion.grounding} t={t} />
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
                <span className="text-slate-400">{t('results.coverage')}:</span>
                <span className="font-bold text-lg">{vegetationAnalysis.coveragePercentage}%</span>
            </div>
            <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('results.need')}:</span>
                <span className={getSeverityBadgeClasses(vegetationAnalysis.reforestationNeed)}>{vegetationAnalysis.reforestationNeed}</span>
            </div>
            <p className="pt-3 border-t border-slate-700 text-sm text-slate-300">{vegetationAnalysis.analysis}</p>
            <GroundingReferences chunks={vegetationAnalysis.grounding} t={t} />
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
                <div key={r.name} className="bg-slate-800 p-3 rounded-md text-sm border border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                        <strong className="text-slate-300">{r.name}</strong>
                        <span className={getSeverityBadgeClasses(r.severity)}>{r.severity}</span>
                    </div>
                    <p className="text-xs text-slate-400">{r.explanation}</p>
                </div>
            ))}
             <GroundingReferences chunks={riskAnalysis.grounding} t={t} />
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
    const [activeMapType, setActiveMapType] = useState<string>('satellite');
    const [tileLayer, setTileLayer] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');
    const [activeView, setActiveView] = useState<ActiveView>('reforestation');
    const [currentLoading, setCurrentLoading] = useState<LoadingState>(false);
    const [suggestedAreas, setSuggestedAreas] = useState<PlantingArea[]>([]);
    const [suggestedAreasGrounding, setSuggestedAreasGrounding] = useState<GroundingChunk[] | undefined>();
    const [isLocating, setIsLocating] = useState(false);
    const [isSelectingArea, setIsSelectingArea] = useState(false);
    const selectionRectangleRef = useRef<any>(null);

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
        },
        humanitarian: {
            url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="https://www.hotosm.org/" target="_blank">HOT</a>'
        }
    };

    useEffect(() => {
        if (mapRef.current && !map) {
            try {
                const newMap = L.map(mapRef.current, {
                    zoomControl: false, // Add it manually for positioning
                }).setView([35.6892, 51.3890], 5);
                
                L.control.zoom({ position: 'bottomright' }).addTo(newMap);

                setMap(newMap);

                const initialTileLayer = L.tileLayer(
                    mapTiles.satellite.url,
                    { attribution: mapTiles.satellite.attribution }
                ).addTo(newMap);
                setTileLayer(initialTileLayer);

                newMap.on('click', (e: any) => {
                    if (isSelectingArea) return;
                    props.onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
                    newMap.panTo(e.latlng);
                });
            } catch (error) {
                console.error("Leaflet map initialization failed:", error);
                addToast(t('mapError.init'), 'error');
            }
        }
        // Cleanup map instance on component unmount
        return () => {
            if (map) {
                map.remove();
            }
        };
    }, []);


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
    
    const clearAreaMarkers = useCallback(() => {
         areaMarkers.forEach(m => m.remove());
         setAreaMarkers([]);
         setSuggestedAreas([]);
         setSuggestedAreasGrounding(undefined);
    }, [areaMarkers]);

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
                    <div class="text-slate-300 font-sans p-1">
                        <h4 class="font-bold mt-0 mb-1 text-white">${t('main.areaSuggestion')}</h4>
                        <p class="m-0 mb-1 text-xs">${area.reason}</p>
                        <button onclick="document.dispatchEvent(new CustomEvent('selectArea', { detail: { lat: ${area.location.lat}, lng: ${area.location.lng} } }))" class="text-emerald-400 font-bold border-none bg-transparent p-0 cursor-pointer hover:underline text-sm">${t('main.selectForAnalysis')}</button>
                    </div>
                `;
                areaMarker.bindPopup(popupContent);
                newMarkers.push(areaMarker);
            });
            setAreaMarkers(newMarkers);
        }
    }, [suggestedAreas, map, t]);

    useEffect(() => {
        const selectAreaHandler = (e: CustomEvent) => props.onLocationSelect(e.detail);
        document.addEventListener('selectArea', selectAreaHandler as EventListener);
        return () => document.removeEventListener('selectArea', selectAreaHandler as EventListener);
    }, [props.onLocationSelect]);
    
    const handleFindAreas = async () => {
        if (!map) return;
        clearAreaMarkers();
        setCurrentLoading('areas');
        try {
            const bounds = map.getBounds();
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();
            const { areas, grounding } = await findPlantingAreas({ sw: { lat: sw.lat, lng: sw.lng }, ne: { lat: ne.lat, lng: ne.lng } }, props.numberOfTrees, language);
            setSuggestedAreas(areas);
            setSuggestedAreasGrounding(grounding);
            addToast(areas.length > 0 ? `${areas.length} suitable areas found.` : 'No suitable areas found in the current view.', areas.length > 0 ? 'success' : 'info');
        } catch (err) {
            console.error(err);
            addToast(t('error'), 'error');
        } finally {
            setCurrentLoading(false);
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

    const handleLocateUser = () => {
        if (!navigator.geolocation) {
            addToast(t('mapError.geolocationNotSupported'), 'error');
            return;
        }
        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const location = { lat: latitude, lng: longitude };
                map.setView(location, 13);
                props.onLocationSelect(location);
                setIsLocating(false);
            },
            (error) => {
                let message = t('mapError.geolocationPositionUnavailable');
                if (error.code === error.PERMISSION_DENIED) {
                    message = t('mapError.geolocationPermissionDenied');
                } else if (error.code === error.TIMEOUT) {
                    message = t('mapError.geolocationTimeout');
                }
                addToast(message, 'error');
                setIsLocating(false);
            }
        );
    };

    useEffect(() => {
        if (!map) return;
    
        if (isSelectingArea) {
            map.dragging.disable();
            L.DomUtil.addClass(map.getContainer(), 'leaflet-crosshair');
            
            let startPos: any = null;
    
            const onMouseDown = (e: any) => {
                startPos = e.latlng;
                if (selectionRectangleRef.current) {
                    selectionRectangleRef.current.remove();
                }
                selectionRectangleRef.current = L.rectangle([startPos, startPos], {
                    color: "#34d399", weight: 2, fillOpacity: 0.1,
                }).addTo(map);
                map.on('mousemove', onMouseMove);
                map.once('mouseup', onMouseUp);
            };
    
            const onMouseMove = (e: any) => {
                if (startPos && selectionRectangleRef.current) {
                    selectionRectangleRef.current.setBounds(L.latLngBounds(startPos, e.latlng));
                }
            };
    
            const onMouseUp = (e: any) => {
                map.off('mousemove', onMouseMove);
                
                if (selectionRectangleRef.current) {
                    const bounds = selectionRectangleRef.current.getBounds();
                    
                    const popupContent = document.createElement('div');
                    popupContent.innerHTML = `<p class="text-center font-sans mb-2">${t('main.analyzeSelection')}</p>`;
                    const button = document.createElement('button');
                    button.innerHTML = t('main.analyze');
                    button.className = "w-full py-1 px-3 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors";
                    
                    button.onclick = () => {
                        button.disabled = true;
                        button.innerHTML = `<div class="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white mx-auto"></div>`;
                        const sw = bounds.getSouthWest();
                        const ne = bounds.getNorthEast();
                        clearAreaMarkers();
                        findPlantingAreas({ sw: { lat: sw.lat, lng: sw.lng }, ne: { lat: ne.lat, lng: ne.lng } }, props.numberOfTrees, language)
                         .then(({ areas, grounding }) => {
                              setSuggestedAreas(areas);
                              setSuggestedAreasGrounding(grounding);
                              addToast(areas.length > 0 ? `${areas.length} areas found.` : 'No areas found in selection.', areas.length > 0 ? 'success' : 'info');
                         })
                         .catch(err => {
                              console.error(err);
                              addToast(t('error'), 'error');
                         })
                         .finally(() => {
                            map.closePopup();
                         });
                    };
                    popupContent.appendChild(button);
    
                    L.popup().setLatLng(bounds.getCenter()).setContent(popupContent).openOn(map);
                    
                    map.once('popupclose', () => {
                         if (selectionRectangleRef.current) {
                            selectionRectangleRef.current.remove();
                            selectionRectangleRef.current = null;
                         }
                    });
                }
                
                setIsSelectingArea(false);
            };
    
            map.on('mousedown', onMouseDown);
    
            return () => {
                map.off('mousedown', onMouseDown);
                map.off('mousemove', onMouseMove);
                map.off('mouseup', onMouseUp);
                map.dragging.enable();
                L.DomUtil.removeClass(map.getContainer(), 'leaflet-crosshair');
                 if (selectionRectangleRef.current) {
                    selectionRectangleRef.current.remove();
                    selectionRectangleRef.current = null;
                }
            };
        } else {
             map.dragging.enable();
             L.DomUtil.removeClass(map.getContainer(), 'leaflet-crosshair');
        }
    }, [map, isSelectingArea, t, language, props.numberOfTrees, addToast, clearAreaMarkers]);
    
    const mapTypes = [
        { id: 'satellite', label: t('mapLayers.satellite'), icon: 'fa-solid fa-satellite' },
        { id: 'terrain', label: t('mapLayers.terrain'), icon: 'fa-solid fa-mountain-sun' },
        { id: 'roadmap', label: t('mapLayers.roadmap'), icon: 'fa-solid fa-map' },
        { id: 'humanitarian', label: t('mapLayers.humanitarian'), icon: 'fa-solid fa-hand-holding-heart' },
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
        if (isNaN(lng) || lng < -180 || lat > 180) return addToast(t('mapError.invalidLng'), 'error');
        const location = { lat, lng };
        props.onLocationSelect(location);
        if(map) { map.setView(location, 12); }
    };

    const legendItems = legendItemsConfig.map(item => ({ label: t(item.labelKey), color: item.color }));
    
    const TabButton: React.FC<{label: string, icon: string, targetView: ActiveView}> = ({label, icon, targetView}) => (
        <button onClick={() => setActiveView(targetView)} role="tab" aria-selected={activeView === targetView} className={`flex-1 sm:flex-initial sm:px-6 py-3 text-sm font-semibold rounded-t-lg border-b-2 transition-all flex items-center justify-center space-x-2 rtl:space-x-reverse ${ activeView === targetView ? 'text-emerald-400 border-emerald-500 bg-slate-900' : 'text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50'}`}>
            <i className={`fa-solid ${icon}`}></i>
            <span>{label}</span>
        </button>
    );
    
    const progressPercentage = props.reforestationGoal > 0 ? Math.min((props.numberOfTrees / props.reforestationGoal) * 100, 100) : 0;

    return (
        <div className="animate-fade-in">
            <section className="py-20 text-center bg-gradient-to-b from-slate-950 to-emerald-900/20">
                <div className="container mx-auto px-4">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white">{t('hero.title')}</h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">{t('hero.subtitle')}</p>
                </div>
            </section>
            
            <section className="container mx-auto px-4 py-16">
                 <div className="flex justify-center border-b border-slate-800 mb-8" role="tablist">
                    <TabButton label={t('tabs.reforestation')} icon="fa-map-location-dot" targetView="reforestation" />
                    <TabButton label={t('tabs.homeGardening')} icon="fa-house-chimney-window" targetView="homeGardening" />
                    <TabButton label={t('tabs.startupShowcase')} icon="fa-rocket" targetView="startupShowcase" />
                </div>
                
                {activeView === 'reforestation' && (
                    <div className="animate-fade-in">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-1 bg-slate-900 p-6 rounded-lg border border-slate-800 h-min">
                                <p className="text-slate-300 text-center mb-4 text-sm">{t('main.instructions')}</p>
                                <form onSubmit={handleSearch} className="mb-4">
                                    <label htmlFor="location-search" className="sr-only">{t('main.searchPlaceholder')}</label>
                                    <div className="relative">
                                        <input type="text" id="location-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('main.searchPlaceholder')} className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-10 rtl:pl-10 rtl:pr-3 text-white focus:ring-emerald-500 focus:border-emerald-500" disabled={!map} />
                                        <button type="submit" disabled={isSearching || !searchQuery} className="absolute inset-y-0 right-0 rtl:right-auto rtl:left-0 flex items-center pr-3 rtl:pl-3 disabled:opacity-50" title={t('main.searchButtonTitle')}>
                                            {isSearching ? <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-white"></div> : <i className="fa-solid fa-magnifying-glass text-slate-400 hover:text-white"></i>}
                                        </button>
                                    </div>
                                </form>
                                <div className="mt-4 pt-4 border-t border-slate-700 mb-6">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('main.manualInputLabel')}</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                        <input type="number" value={manualLat} onChange={(e) => setManualLat(e.target.value)} placeholder={t('main.latLabel')} step="any" className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500" />
                                        <input type="number" value={manualLng} onChange={(e) => setManualLng(e.target.value)} placeholder={t('main.lngLabel')} step="any" className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 px-3 text-white focus:ring-emerald-500 focus:border-emerald-500" />
                                    </div>
                                    <button type="button" onClick={handleSetManualLocation} className="w-full py-2 px-4 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 transition-colors">{t('main.setLocationButton')}</button>
                                </div>
                                {props.selectedLocation && (
                                    <div className="text-center bg-slate-800 p-3 rounded-md mb-6"><p className="text-sm text-slate-400">{t('main.selectedLocation')}</p><p className="font-mono text-emerald-300">{props.selectedLocation.lat.toFixed(4)}, {props.selectedLocation.lng.toFixed(4)}</p></div>
                                )}
                                 <div className="pt-4 border-t border-slate-700 space-y-4">
                                    <label htmlFor="reforestation-goal" className="block text-sm font-medium text-slate-300">{t('main.reforestationGoalLabel')}</label>
                                    <input type="number" id="reforestation-goal" value={props.reforestationGoal} onChange={(e) => props.onReforestationGoalChange(parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-emerald-500 focus:border-emerald-500" min="1" step="100" />
                                    <label htmlFor="tree-count" className="block text-sm font-medium text-slate-300">{t('main.numberOfTreesLabel')}</label>
                                    <input type="number" id="tree-count" value={props.numberOfTrees} onChange={(e) => props.onNumberOfTreesChange(parseInt(e.target.value, 10) || 0)} className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 text-white focus:ring-emerald-500 focus:border-emerald-500" min="1" step="10" />
                                    <div className="flex justify-between items-center text-xs text-slate-300"><p>{t('main.analysisProgress')}</p><p>{props.numberOfTrees.toLocaleString()} / {props.reforestationGoal.toLocaleString()}</p></div>
                                    <div className="w-full bg-slate-800 rounded-full h-2.5"><div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} role="progressbar" aria-valuenow={progressPercentage}></div></div>
                                    <button onClick={handleFindAreas} disabled={!map || currentLoading === 'areas'} className="w-full py-3 px-4 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center">{currentLoading === 'areas' ? <><div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white mr-2"></div>{t('loading')}</> : t('main.findAreas')}</button>
                                    <p className="text-xs text-slate-400 mt-2 text-center">{t('main.findAreasDescription')}</p>
                                    <GroundingReferences chunks={suggestedAreasGrounding} t={t} />
                                </div>
                                <div className="space-y-4 pt-4 mt-4 border-t border-slate-700">
                                    <h3 className="font-bold text-center text-lg">{t('main.selectedLocation')}</h3>
                                    <button onClick={props.onFullAnalysis} disabled={!props.selectedLocation || !!props.isLoading} className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2 rtl:space-x-reverse">{props.isLoading === 'full-analysis' ? (<><div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div><span>{t('loading')}</span></>) : (<><i className="fa-solid fa-wand-magic-sparkles"></i><span>{t('main.analyzeLocation')}</span></>)}</button>
                                </div>
                            </div>
                            <div className="lg:col-span-2 h-96 lg:h-[650px] bg-slate-900 rounded-lg border border-slate-800 shadow-lg flex items-center justify-center p-4 relative overflow-hidden">
                                {map && (<div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10"><div className="bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 flex items-stretch space-x-1 rtl:space-x-reverse border border-slate-700 shadow-lg">{mapTypes.map(type => (<button key={type.id} onClick={() => handleMapTypeChange(type.id as keyof typeof mapTiles)} className={`px-4 py-2 text-xs font-semibold rounded-md transition-colors flex items-center justify-center space-x-2 rtl:space-x-reverse ${activeMapType === type.id ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-700/50'}`} title={type.label}><i className={`${type.icon} text-base`}></i><span className="hidden sm:inline">{type.label}</span></button>))}</div></div>)}
                                {map && <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                    <button onClick={handleLocateUser} disabled={isLocating} className="w-10 h-10 bg-slate-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700 shadow-lg transition-colors" title={t('main.locateMe')}>{isLocating ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-white"></div> : <i className="fa-solid fa-location-crosshairs text-lg"></i>}</button>
                                    <button onClick={() => setIsSelectingArea(!isSelectingArea)} className={`w-10 h-10 backdrop-blur-sm rounded-lg flex items-center justify-center border shadow-lg transition-colors ${isSelectingArea ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border-slate-700'}`} title={t('main.selectAreaOnMap')}><i className="fa-solid fa-vector-square text-lg"></i></button>
                                </div>}
                                {map && <MapLegend items={legendItems} />}
                                <div ref={mapRef} className="w-full h-full rounded-md" />
                                {!map && (<div className="absolute inset-0 w-full h-full bg-slate-900 rounded-lg animate-pulse flex items-center justify-center text-slate-400 flex-col"><svg className="w-12 h-12 mb-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.5-11.492A10.5 10.5 0 0 1 21.75 10.5c0 2.512-1.023 4.79-2.688 6.438a10.378 10.378 0 0 1-2.862 2.115M4.933 4.933a10.5 10.5 0 0 1 14.134 0M4.25 10.5a10.5 10.5 0 0 0 2.688 6.438c.954.954 2.068 1.685 3.28 2.115M19.067 4.933a10.5 10.5 0 0 0-14.134 0" /></svg><p className="font-semibold">{t('main.loadingMap')}</p></div>)}
                            </div>
                        </div>
                        {props.selectedLocation && (
                            <section className="mt-8 space-y-8">
                                {props.error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{props.error}</div>}
                                <InfoCard title={t('results.suggestionTitle')} icon="fa-solid fa-tree" isLoading={props.isLoading === 'full-analysis'} loadingSkeleton={<PlantingSuggestionSkeleton />}><PlantingSuggestionDisplay {...props} /></InfoCard>
                                {(props.isLoading === 'campaign' || props.crowdfundingCampaign) && (<InfoCard title={t('campaign.title')} icon="fa-solid fa-hand-holding-dollar" isLoading={props.isLoading === 'campaign'}><CampaignDisplay {...props} /></InfoCard>)}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <InfoCard title={t('results.vegetationTitle')} icon="fa-solid fa-seedling" isLoading={props.isLoading === 'full-analysis'} loadingSkeleton={<VegetationAnalysisSkeleton />} tooltipText={t('results.vegetationTooltip')}><VegetationAnalysisDisplay {...props} /></InfoCard>
                                    <InfoCard title={t('results.riskTitle')} icon="fa-solid fa-triangle-exclamation" isLoading={props.isLoading === 'full-analysis'} loadingSkeleton={<RiskAnalysisSkeleton />} tooltipText={t('results.riskTooltip')}><RiskAnalysisDisplay {...props} /></InfoCard>
                                </div>
                            </section>
                        )}
                    </div>
                )}
                {activeView === 'homeGardening' && (<div className="animate-fade-in"><HomeGardeningPage /></div>)}
                {activeView === 'startupShowcase' && (<div className="animate-fade-in"><StartupShowcase /></div>)}
            </section>
        </div>
    );
};

export default GreenHopePage;