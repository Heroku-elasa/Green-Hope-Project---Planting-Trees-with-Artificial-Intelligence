
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { useLanguage, PlantingSite, SuitableTree, Coords, EconomicBenefitAnalysis, GroundedResult, SiteAnalysis, SiteEconomicAnalysis, DeforestationAnalysis } from '../types';
import * as geminiService from '../services/geminiService';
import { marked } from 'marked';
import MapLegend from './MapLegend';

type Mode = 'locations' | 'trees' | 'deforestation';

declare const L: any;

interface SiteSelectorProps {
    onFindLocations: (description: string) => void;
    onFindTrees: (coords: Coords) => void;
    results: (PlantingSite | SuitableTree)[];
    isLoading: boolean;
    error: string | null;
    mode: Mode;
    setMode: (mode: Mode) => void;
    locationsInput: string;
    setLocationsInput: (value: string) => void;
    coords: Coords | null;
    setCoords: (coords: Coords | null) => void;
    suggestedGoals: string[];
    isSuggestingGoals: boolean;
    onUseSuggestedGoal: (goal: string) => void;
    onFindGrantsForTree: (query: string) => void;
    handleApiError: (err: unknown) => string;
}

const SiteAnalysisModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  site: PlantingSite | null;
  analysis: SiteAnalysis | null;
  isLoading: boolean;
  error: string | null;
}> = ({ isOpen, onClose, site, analysis, isLoading, error }) => {
  const { t } = useLanguage();

  if (!isOpen || !site) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[1002] animate-fade-in" aria-modal="true" role="dialog">
      <div className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 border border-pink-500/50 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
           <h3 className="text-lg font-semibold leading-6 text-white">{t('siteAnalysisModal.title')}: <span className="text-pink-400">{site.locationName}</span></h3>
           <button onClick={onClose} className="p-1 text-gray-400 hover:text-white transition-colors" aria-label={t('siteAnalysisModal.close')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        <div className="overflow-y-auto pr-2 flex-grow">
          {isLoading && (
            <div className="text-center py-10">
              <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-400 mx-auto mb-4"></div>
              <h4 className="text-lg font-semibold text-white">{t('siteAnalysisModal.analyzing')}</h4>
            </div>
          )}
          {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{t('siteAnalysisModal.error')} {error}</div>}
          {analysis && !isLoading && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">{t('siteAnalysisModal.estimatedCost')}</div>
                      <div className="text-xl font-bold text-pink-400">{analysis.estimatedCost}</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">{t('siteAnalysisModal.treeCount')}</div>
                      <div className="text-xl font-bold text-pink-400">{analysis.treeCount.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">{t('siteAnalysisModal.duration')}</div>
                      <div className="text-xl font-bold text-pink-400">{analysis.projectDurationYears}</div>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-lg">
                      <div className="text-xs text-gray-400">{t('siteAnalysisModal.carbonSeq')}</div>
                      <div className="text-xl font-bold text-pink-400">{analysis.carbonSequestrationTonnesPerYear.toLocaleString()} <span className="text-sm font-normal text-gray-400">{t('siteAnalysisModal.tonnesPerYear')}</span></div>
                  </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">{t('siteAnalysisModal.keyChallenges')}</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                    {analysis.keyChallenges.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">{t('siteAnalysisModal.successFactors')}</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                    {analysis.successFactors.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-700 text-right">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex justify-center rounded-md border border-slate-600 shadow-sm px-4 py-2 bg-slate-700 text-base font-medium text-white hover:bg-slate-600 focus:outline-none sm:text-sm"
          >
            {t('siteAnalysisModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};


const SiteSelector: React.FC<SiteSelectorProps> = (props) => {
    const { t, language } = useLanguage();
    const isRtl = language === 'fa';
    const { 
        onFindLocations, 
        onFindTrees,
        results, 
        isLoading, 
        error, 
        mode, 
        setMode, 
        locationsInput, 
        setLocationsInput, 
        coords, 
        setCoords, 
        suggestedGoals, 
        isSuggestingGoals, 
        onUseSuggestedGoal,
        onFindGrantsForTree,
        handleApiError
    } = props;
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const drawControlRef = useRef<any>(null);
    
    const [latInput, setLatInput] = useState(coords?.lat.toString() || '36.175683');
    const [lngInput, setLngInput] = useState(coords?.lng.toString() || '58.465929');
    const [isGeolocating, setIsGeolocating] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(true);

    const [mapsQuery, setMapsQuery] = useState('');
    const [mapsResult, setMapsResult] = useState<GroundedResult | null>(null);
    const [isMapsLoading, setIsMapsLoading] = useState(false);
    const [mapsError, setMapsError] = useState<string | null>(null);

    const [economicAnalysis, setEconomicAnalysis] = useState<Record<string, EconomicBenefitAnalysis | null>>({});
    const [loadingAnalysisFor, setLoadingAnalysisFor] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<Record<string, string | null>>({});

    const [selectedSiteForAnalysis, setSelectedSiteForAnalysis] = useState<PlantingSite | null>(null);
    const [siteAnalysis, setSiteAnalysis] = useState<SiteAnalysis | null>(null);
    const [isAnalyzingSite, setIsAnalyzingSite] = useState(false);
    const [siteAnalysisError, setSiteAnalysisError] = useState<string | null>(null);

    const [siteEconomicAnalysis, setSiteEconomicAnalysis] = useState<Record<string, SiteEconomicAnalysis | null>>({});
    const [loadingSiteEconomic, setLoadingSiteEconomic] = useState<string | null>(null);
    const [errorSiteEconomic, setErrorSiteEconomic] = useState<Record<string, string | null>>({});

    const [deforestationAnalysis, setDeforestationAnalysis] = useState<DeforestationAnalysis | null>(null);
    const [isAnalyzingDeforestation, setIsAnalyzingDeforestation] = useState(false);
    const [deforestationError, setDeforestationError] = useState<string | null>(null);

    const PopupContent = ({ coords, onConfirm }: { coords: Coords, onConfirm: () => void }) => {
        const { t } = useLanguage();
        return (
            <div className="text-white">
                <h4 className="font-bold mb-2">{t('siteSelector.confirmPopup.title')}</h4>
                <p className="text-sm mb-3">
                    {t('siteSelector.confirmPopup.coordinates')
                        .replace('{lat}', coords.lat.toFixed(4))
                        .replace('{lng}', coords.lng.toFixed(4))}
                </p>
                <button
                    className="w-full text-center text-sm bg-teal-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-teal-700 transition-colors"
                    onClick={onConfirm}
                >
                    {t('siteSelector.confirmPopup.button')}
                </button>
            </div>
        );
    };

    const handleAnalyzeSite = useCallback(async (site: PlantingSite) => {
        setSelectedSiteForAnalysis(site);
        setIsAnalyzingSite(true);
        setSiteAnalysis(null);
        setSiteAnalysisError(null);
        try {
            const result = await geminiService.analyzePlantingSite(site, language);
            setSiteAnalysis(result);
        } catch (err) {
            setSiteAnalysisError(handleApiError(err));
        } finally {
            setIsAnalyzingSite(false);
        }
    }, [handleApiError, language]);

    const handleAnalyzeSuggestion = (suggestion: { lat: number, lng: number, note: string }) => {
        const mockSite: PlantingSite = {
            locationName: `${t('siteSelector.deforestation.suggestionLabel')} (${suggestion.lat.toFixed(4)}, ${suggestion.lng.toFixed(4)})`,
            country: t('siteSelector.deforestation.unknownLocation'),
            latitude: suggestion.lat,
            longitude: suggestion.lng,
            rationale: suggestion.note,
            suggestedSpecies: [t('siteSelector.deforestation.tbdSpecies')],
            priority: 'High'
        };
        handleAnalyzeSite(mockSite);
    };
    
    const handleAnalyzeSiteEconomics = useCallback(async (site: PlantingSite) => {
        const siteId = site.locationName;
        setLoadingSiteEconomic(siteId);
        setErrorSiteEconomic(prev => ({ ...prev, [siteId]: null }));
        try {
            const result = await geminiService.analyzeSiteEconomicPotential(site, language);
            setSiteEconomicAnalysis(prev => ({ ...prev, [siteId]: result }));
        } catch (err) {
            const message = handleApiError(err);
            setErrorSiteEconomic(prev => ({ ...prev, [siteId]: message }));
        } finally {
            setLoadingSiteEconomic(null);
        }
    }, [handleApiError, language]);

    const handleDeforestationAnalysis = useCallback(async (targetCoords: Coords) => {
        setIsAnalyzingDeforestation(true);
        setDeforestationAnalysis(null);
        setDeforestationError(null);
        try {
            const result = await geminiService.analyzeDeforestation(targetCoords, language);
            setDeforestationAnalysis(result);
        } catch(err) {
            setDeforestationError(handleApiError(err));
        } finally {
            setIsAnalyzingDeforestation(false);
        }
    }, [handleApiError, language]);

    useEffect(() => {
        setLatInput(coords?.lat.toFixed(6) || '36.175683');
        setLngInput(coords?.lng.toFixed(6) || '58.465929');
    }, [coords]);

    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
            const map = L.map(mapRef.current, {
                center: [32.4279, 53.6880],
                zoom: 5,
            });
            mapInstanceRef.current = map;

            const tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18,
            });

            tileLayer.on('loading', () => setIsMapLoading(true));
            tileLayer.on('load', () => setIsMapLoading(false));
            tileLayer.addTo(map);

            const mapContainer = mapRef.current;
            if (mapContainer) {
                const tooltip = document.createElement('div');
                tooltip.className = 'absolute z-[1001] bg-slate-900/80 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none hidden';
                mapContainer.appendChild(tooltip);

                map.on('mousemove', (e: any) => {
                    tooltip.style.left = `${e.containerPoint.x + 10}px`;
                    tooltip.style.top = `${e.containerPoint.y + 10}px`;
                    tooltip.innerHTML = `${t('siteSelector.latLabelShort')}: ${e.latlng.lat.toFixed(4)}, ${t('siteSelector.lngLabelShort')}: ${e.latlng.lng.toFixed(4)}`;
                    tooltip.classList.remove('hidden');
                });

                map.on('mouseout', () => {
                    tooltip.classList.add('hidden');
                });
            }

            map.on('click', (e: any) => {
                 if (mode === 'trees' || mode === 'deforestation') {
                    const { lat, lng } = e.latlng;
                    const latLng = { lat, lng };

                    const popupContainer = document.createElement('div');
                    const popup = L.popup()
                        .setLatLng(latLng)
                        .setContent(popupContainer)
                        .openOn(map);
                    
                    const root = createRoot(popupContainer);

                    const handleConfirm = () => {
                        setCoords(latLng);
                        map.closePopup(popup);
                        if (mode === 'trees') {
                            onFindTrees(latLng);
                        } else {
                            handleDeforestationAnalysis(latLng);
                        }
                    };

                    root.render(<PopupContent coords={latLng} onConfirm={handleConfirm} />);
                }
            });

            const drawnItems = new L.FeatureGroup();
            map.addLayer(drawnItems);

            const drawControl = new L.Control.Draw({
                edit: { featureGroup: drawnItems, remove: false },
                draw: {
                    polyline: false, circle: false, circlemarker: false, marker: false,
                    polygon: { shapeOptions: { color: '#ec4899' } },
                    rectangle: { shapeOptions: { color: '#ec4899' } },
                },
            });
            drawControlRef.current = drawControl;

            map.on(L.Draw.Event.CREATED, (event: any) => {
                const type = event.layerType;
                const layer = event.layer;
                drawnItems.addLayer(layer);
                
                let newPrompt = '';
                if (type === 'rectangle') {
                    const bounds = layer.getBounds();
                    const sw = bounds.getSouthWest();
                    const ne = bounds.getNorthEast();
                    newPrompt = t('siteSelector.drawPrompt')
                        .replace('{swLat}', sw.lat.toFixed(4))
                        .replace('{swLng}', sw.lng.toFixed(4))
                        .replace('{neLat}', ne.lat.toFixed(4))
                        .replace('{neLng}', ne.lng.toFixed(4));
                } else if (type === 'polygon') {
                    const latLngs = layer.getLatLngs()[0];
                    const vertices = latLngs.map((latlng: any) => `[${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}]`).join(', ');
                    newPrompt = t('siteSelector.drawPolygonPrompt').replace('{vertices}', vertices);
                }
                
                if (newPrompt && mode === 'locations') {
                    setLocationsInput(newPrompt);
                    onFindLocations(newPrompt);
                } else if (mode === 'deforestation' && type !== 'marker') {
                   const center = layer.getBounds().getCenter();
                   const latLng = { lat: center.lat, lng: center.lng };
                   setCoords(latLng);
                   handleDeforestationAnalysis(latLng);
                }
            });

            setTimeout(() => {
                map.invalidateSize();
            }, 100);
        }
    }, [t, onFindLocations, onFindTrees, setCoords, setLocationsInput, mode, handleDeforestationAnalysis]); 

    useEffect(() => {
        const map = mapInstanceRef.current;
        const drawControl = drawControlRef.current;
        if (map && drawControl) {
            if (mode === 'locations' || mode === 'deforestation') {
                map.addControl(drawControl);
            } else {
                map.removeControl(drawControl);
            }
        }
    }, [mode]);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        const createIcon = (color: string) => {
            const iconSvg = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="${color}" stroke="white" stroke-width="1"><path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 15.5 8.5 15.5s8.5-10.25 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11.5a3 3 0 110-6 3 3 0 010 6z"/></svg>`;
            const iconUrl = `data:image/svg+xml;base64,${btoa(iconSvg)}`;
            return L.icon({
                iconUrl: iconUrl,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });
        };
        
        const priorityIcons: Record<PlantingSite['priority'], any> = {
            'Critical': createIcon('#ef4444'),
            'High': createIcon('#f97316'),
            'Medium': createIcon('#eab308'),
            'Low': createIcon('#22c55e'),
        };

        const blueIcon = createIcon('#3b82f6');
        const greenIcon = createIcon('#10b981');

        if (mode === 'locations' && results.length > 0) {
            const latLngs: any[] = [];
            results.forEach(result => {
                const site = result as PlantingSite;
                if (typeof site.latitude === 'number' && typeof site.longitude === 'number' && site.priority) {
                    const pos: [number, number] = [site.latitude, site.longitude];
                    const icon = priorityIcons[site.priority] || priorityIcons['Medium'];
                    const marker = L.marker(pos, { icon }).addTo(map);

                    marker.on('click', () => {
                        handleAnalyzeSite(site);
                    });
                    
                    marker.bindTooltip(`<b>${site.locationName}</b><br/>Priority: ${site.priority}<br/>Click to analyze`);

                    markersRef.current.push(marker);
                    latLngs.push(pos);
                }
            });
            if (latLngs.length > 0) {
                map.fitBounds(latLngs, { padding: [50, 50] });
            }
        } else if (mode === 'trees' && coords) {
             const pos: [number, number] = [coords.lat, coords.lng];
             const marker = L.marker(pos, { icon: blueIcon, draggable: true }).addTo(map);
             marker.on('dragend', (e: any) => {
                const { lat, lng } = e.target.getLatLng();
                const latLng = { lat, lng };
                setCoords(latLng);
                onFindTrees(latLng);
             });
             markersRef.current.push(marker);
             map.setView(pos, 8);
        } else if (mode === 'deforestation' && deforestationAnalysis) {
             deforestationAnalysis.replantingSuggestions.forEach(s => {
                 const pos: [number, number] = [s.lat, s.lng];
                 const marker = L.marker(pos, { icon: greenIcon }).addTo(map);
                 marker.bindPopup(`<b>Replanting Suggestion</b><br/>${s.note}`);
                 markersRef.current.push(marker);
             });
        }
    }, [results, mode, coords, t, onFindTrees, setCoords, handleAnalyzeSite, deforestationAnalysis]);

    const handleLocationsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!locationsInput.trim()) {
            alert(t('siteSelector.validationError'));
            return;
        }
        onFindLocations(locationsInput);
    };
    
    const handleCoordsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (!isNaN(lat) && !isNaN(lng)) {
            const newCoords = { lat, lng };
            setCoords(newCoords);
            onFindTrees(newCoords);
        } else {
            alert(t('siteSelector.validationErrorCoords'));
        }
    };
    
    const handleMapsSearchSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mapsQuery.trim() || !coords) {
            alert(t('siteSelector.nearbyAnalysis.validation'));
            return;
        }
        setIsMapsLoading(true);
        setMapsError(null);
        setMapsResult(null);
        try {
            const result = await geminiService.findPlantingSitesWithMaps(mapsQuery, coords);
            setMapsResult(result);
        } catch (err) {
            setMapsError(handleApiError(err));
        } finally {
            setIsMapsLoading(false);
        }
    }, [mapsQuery, coords, handleApiError, t]);

    const handleGeolocate = () => {
        if (navigator.geolocation) {
            setIsGeolocating(true);
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newCoords = { lat: latitude, lng: longitude };
                    setCoords(newCoords);
                    mapInstanceRef.current?.setView(newCoords, 13);
                    if (mode === 'trees') {
                        onFindTrees(newCoords);
                    }
                    setIsGeolocating(false);
                },
                () => {
                    alert(t('siteSelector.locationError'));
                    setIsGeolocating(false);
                }
            );
        }
    };

    const handleExamplePromptClick = (prompt: string) => {
        setLocationsInput(prompt);
        onFindLocations(prompt);
    };

    const renderForm = () => (
        <div className="bg-slate-900/60 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-slate-700">
            <div className="mb-6">
                <label className="block text-sm font-medium text-pink-400 mb-2">
                    📤 {isRtl ? 'افزودن محتوا (متن یا تصویر):' : 'Add Content (Text or Photo):'}
                </label>
                <div className="flex flex-col gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                    <textarea 
                        className="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
                        placeholder={isRtl ? 'توضیحات متنی خود را اینجا وارد کنید...' : 'Enter your text description here...'}
                        rows={2}
                    />
                    <div className="flex items-center gap-3">
                        <label className="flex-grow flex items-center justify-center gap-2 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg cursor-pointer transition-colors text-white text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {isRtl ? 'انتخاب تصویر' : 'Select Photo'}
                            <input type="file" className="hidden" accept="image/*" />
                        </label>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex flex-col sm:flex-row rounded-md shadow-sm bg-slate-700/80 p-1">
                    <button onClick={() => setMode('locations')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'locations' ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-slate-600'}`}>
                        {t('siteSelector.findLocationsMode')}
                    </button>
                    <button onClick={() => setMode('trees')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'trees' ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-slate-600'}`}>
                        {t('siteSelector.findTreesMode')}
                    </button>
                    <button onClick={() => setMode('deforestation')} className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'deforestation' ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-slate-600'}`}>
                        {t('siteSelector.deforestationMode')}
                    </button>
                </div>
            </div>
            {mode === 'locations' && (
                <form onSubmit={handleLocationsSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-300">{t(`siteSelector.locations.label`)}</label>
                        <textarea id="description" rows={8} value={locationsInput} onChange={(e) => setLocationsInput(e.target.value)}
                            className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                            placeholder={t(`siteSelector.locations.placeholder`)} disabled={isLoading} />
                    </div>
                    
                     <div className="pt-2 space-y-3">
                        <h4 className="text-sm font-medium text-gray-400">{t('siteSelector.locations.examplePrompts.title')}</h4>
                        <div className="flex flex-col space-y-2">
                            {t('siteSelector.locations.examplePrompts.prompts').map((prompt: string, index: number) => (
                                <button key={index} type="button" onClick={() => handleExamplePromptClick(prompt)}
                                    className="text-left p-3 flex items-start text-sm gap-3 bg-slate-800/60 hover:bg-slate-700/80 rounded-lg transition-colors text-gray-300 hover:text-white border border-slate-700 disabled:opacity-50"
                                    disabled={isLoading}>
                                    <svg className="w-5 h-5 text-pink-400 mt-px flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                                    </svg>
                                    <span>{prompt}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 hover:from-blue-700 hover:to-pink-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all">
                            {isLoading ? t('siteSelector.generating') : t(`siteSelector.locations.button`)}
                        </button>
                    </div>
                     <div className="text-center p-4 bg-slate-800/50 rounded-md border border-slate-700">
                        <p className="text-sm text-gray-400">{t('siteSelector.drawArea')}</p>
                    </div>
                </form>
            )}
            {mode === 'trees' && (
                 <div className="space-y-6">
                    <form onSubmit={handleCoordsSubmit} className="space-y-4 p-4 bg-slate-800/50 rounded-md border border-slate-700">
                        <h4 className="font-bold text-white text-md">{t('siteSelector.manualCoordsTitle')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="latitude-input" className="block text-xs font-medium text-gray-300">{t('siteSelector.latitude')}</label>
                                <input type="number" id="latitude-input" step="any" value={latInput} onChange={(e) => setLatInput(e.target.value)}
                                    className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                                    placeholder={t('siteSelector.latitudePlaceholder')} />
                            </div>
                            <div>
                                <label htmlFor="longitude-input" className="block text-xs font-medium text-gray-300">{t('siteSelector.longitude')}</label>
                                <input type="number" id="longitude-input" step="any" value={lngInput} onChange={(e) => setLngInput(e.target.value)}
                                    className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                                    placeholder={t('siteSelector.longitudePlaceholder')} />
                            </div>
                        </div>
                        <button type="submit" disabled={isLoading} className="w-full text-center text-sm bg-teal-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-teal-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                             {isLoading ? t('siteSelector.generating') : t('siteSelector.analyzeCoordsButton')}
                        </button>
                    </form>
                     <div className="pt-6 border-t border-slate-700/50 space-y-4">
                        <h4 className="font-semibold text-white">{t('siteSelector.nearbyAnalysis.title')}</h4>
                        <form onSubmit={handleMapsSearchSubmit} className="space-y-3">
                             <div>
                                <label htmlFor="maps-query" className="block text-sm font-medium text-gray-300">{t('siteSelector.nearbyAnalysis.prompt')}</label>
                                <input type="text" id="maps-query" value={mapsQuery} onChange={e => setMapsQuery(e.target.value)} 
                                className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                                placeholder={t('siteSelector.nearbyAnalysis.placeholder')} />
                             </div>
                            <button type="submit" disabled={isMapsLoading || !coords} className="w-full text-center text-sm bg-blue-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed">
                                 {isMapsLoading ? t('siteSelector.generating') : t('siteSelector.nearbyAnalysis.button')}
                            </button>
                        </form>
                    </div>
                    <div className="text-center p-4 bg-slate-800/50 rounded-md border border-slate-700">
                        <p className="text-sm text-gray-400">{t('siteSelector.selectOnMap')}</p>
                    </div>
                     { (isSuggestingGoals || suggestedGoals.length > 0) && (
                        <div className="pt-6 border-t border-slate-700/50 space-y-4 animate-fade-in">
                            <h4 className="font-semibold text-white">{t('siteSelector.suggestedGoals.title')}</h4>
                            {isSuggestingGoals ? (
                                <div className="text-center text-sm text-gray-400 flex items-center justify-center">
                                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-pink-400 mr-2"></div>
                                    {t('siteSelector.suggestedGoals.loading')}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {suggestedGoals.map((goal, index) => (
                                        <button key={index} onClick={() => onUseSuggestedGoal(goal)} 
                                            className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-sm text-gray-300"
                                            title={t('siteSelector.suggestedGoals.useGoal')}>
                                            <p>{goal}</p>
                                            <span className="block text-xs text-pink-400 mt-1 font-semibold">{t('siteSelector.suggestedGoals.useGoal')} &rarr;</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                 </div>
            )}
            {mode === 'deforestation' && (
                <div className="space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
                        <h4 className="font-bold text-white text-lg">{t('siteSelector.deforestation.label')}</h4>
                        <p className="text-sm text-gray-400">{t('siteSelector.selectOnMap')}</p>
                    </div>
                    {isAnalyzingDeforestation && (
                        <div className="flex items-center justify-center py-6">
                             <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-400 mr-3"></div>
                             <span className="text-gray-300">{t('siteSelector.deforestation.analyzing')}</span>
                        </div>
                    )}
                    {deforestationError && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{deforestationError}</div>}
                    {deforestationAnalysis && (
                         <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4 animate-fade-in">
                            <h4 className="text-xl font-bold text-red-400">{t('siteSelector.deforestation.result.title')}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-slate-900/50 p-4 rounded-md">
                                    <div className="text-xs text-gray-400">{t('siteSelector.deforestation.result.ndviScore')}</div>
                                    <div className="text-2xl font-bold text-white">{deforestationAnalysis.ndviScore}</div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-md">
                                    <div className="text-xs text-gray-400">{t('siteSelector.deforestation.result.ndviChange')}</div>
                                    <div className="text-lg font-bold text-red-300">{deforestationAnalysis.ndviChange}</div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-md">
                                    <div className="text-xs text-gray-400">{t('siteSelector.deforestation.result.forestLoss')}</div>
                                    <div className="text-lg font-bold text-white">{deforestationAnalysis.forestLossEstimate}</div>
                                </div>
                                <div className="bg-slate-900/50 p-4 rounded-md">
                                    <div className="text-xs text-gray-400">{t('siteSelector.deforestation.result.causes')}</div>
                                    <div className="text-sm text-gray-200">{deforestationAnalysis.causes.join(', ')}</div>
                                </div>
                            </div>
                            <div className="prose prose-sm prose-invert max-w-none text-gray-300 mt-4" dangerouslySetInnerHTML={{ __html: marked.parse(deforestationAnalysis.analysisText) }} />
                            <div>
                                <h5 className="font-semibold text-white mb-2">{t('siteSelector.deforestation.result.replantingSuggestions')}</h5>
                                <ul className="space-y-2">
                                    {deforestationAnalysis.replantingSuggestions.map((s, idx) => (
                                        <li key={idx} className="bg-slate-900/50 p-3 rounded-md text-sm text-gray-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                             <div className="flex items-start">
                                                <span className="text-green-400 mr-2 mt-0.5">●</span>
                                                <span>{s.note} ({s.lat.toFixed(4)}, {s.lng.toFixed(4)})</span>
                                             </div>
                                             <button 
                                                onClick={() => handleAnalyzeSuggestion(s)}
                                                className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap self-end sm:self-auto"
                                             >
                                                {t('siteSelector.deforestation.analyzeSuggestionButton')}
                                             </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                         </div>
                    )}
                </div>
            )}
        </div>
    );
    
    const renderResults = () => {
        if (results.length === 0 && !isLoading && mode !== 'deforestation') {
            return (
                <div className="bg-slate-900/40 rounded-lg p-12 text-center border border-dashed border-slate-700">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
                        <svg className="w-8 h-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t('siteSelector.resultsTitle')}</h3>
                    <p className="text-gray-400 max-w-sm mx-auto">{t('siteSelector.placeholder')}</p>
                </div>
            );
        }

        const renderLocationCard = (item: PlantingSite, index: number) => {
            const siteId = item.locationName;
            const economicAnalysis = siteEconomicAnalysis[siteId];
            const isLoadingEconomic = loadingSiteEconomic === siteId;
            const errorEconomic = errorSiteEconomic[siteId];

            const handleFindGrantsClick = () => {
                if (!economicAnalysis) return;
                const query = `Grants for ${economicAnalysis.primaryEconomicDrivers.join(', ')} projects in ${item.locationName}, ${item.country}`;
                onFindGrantsForTree(query);
            };

            const priorityStyles: Record<PlantingSite['priority'], string> = {
                'Critical': 'bg-red-500/20 text-red-300 border-red-500/50',
                'High': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
                'Medium': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50',
                'Low': 'bg-green-500/20 text-green-300 border-green-500/50',
            };

            return (
                <div key={index} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4 animate-fade-in">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h4 className="text-xl font-bold text-pink-400">{item.locationName}</h4>
                            <p className="text-lg font-medium text-gray-300">{item.country}</p>
                        </div>
                        <div className={`text-xs font-bold px-3 py-1 rounded-full border ${priorityStyles[item.priority]}`}>
                            {item.priority.toUpperCase()} PRIORITY
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h5 className="font-semibold text-white mb-2">{t('siteSelector.locationResult.rationale')}</h5>
                            <div className="prose prose-sm prose-invert max-w-none text-gray-300 bg-slate-900/40 p-3 rounded-md" dangerouslySetInnerHTML={{ __html: marked.parse(item.rationale) }} />
                        </div>
                        <div>
                            <h5 className="font-semibold text-white mb-2">{t('siteSelector.locationResult.species')}</h5>
                            <div className="flex flex-wrap gap-2">
                                {item.suggestedSpecies.map(species =>
                                    <span key={species} className="bg-teal-500/20 text-teal-300 text-xs font-semibold px-2 py-1 rounded-full">{species}</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => handleAnalyzeSite(item)}
                            className="w-full text-center text-sm bg-teal-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-teal-700 transition-colors"
                        >
                            {t('siteSelector.locationResult.detailedAnalysisButton')}
                        </button>
                        <button
                            onClick={() => handleAnalyzeSiteEconomics(item)}
                            disabled={isLoadingEconomic}
                            className="w-full text-center text-sm bg-purple-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-500"
                        >
                            {isLoadingEconomic ? t('siteSelector.locationResult.analyzingEconomicPotential') : t('siteSelector.locationResult.analyzeEconomicPotentialButton')}
                        </button>
                    </div>

                    {(isLoadingEconomic || economicAnalysis || errorEconomic) && (
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-md border border-slate-700 animate-fade-in">
                            <h5 className="font-semibold text-white mb-3">{t('siteSelector.locationResult.economicPotentialTitle')}</h5>
                            {isLoadingEconomic && (
                                <div className="flex items-center justify-center text-gray-400">
                                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-400 mr-2"></div>
                                    <span>{t('siteSelector.locationResult.analyzingEconomicPotential')}</span>
                                </div>
                            )}
                            {errorEconomic && <div className="text-red-400 text-sm">{errorEconomic}</div>}
                            {economicAnalysis && (
                                <div className="space-y-3">
                                    <dl className="text-sm space-y-2">
                                        <div className="flex justify-between"><dt className="text-gray-400">{t('siteSelector.locationResult.potentialRevenue')}:</dt><dd className="font-medium text-white text-right">{economicAnalysis.potentialAnnualRevenue}</dd></div>
                                        <div className="flex justify-between"><dt className="text-gray-400">{t('siteSelector.locationResult.profitabilityYears')}:</dt><dd className="font-medium text-white">{economicAnalysis.estimatedProfitabilityYears}</dd></div>
                                        <div className="flex justify-between items-start"><dt className="text-gray-400 flex-shrink-0 mr-2">{t('siteSelector.locationResult.economicDrivers')}:</dt><dd className="font-medium text-white text-right">{economicAnalysis.primaryEconomicDrivers.join(', ')}</dd></div>
                                        <div>
                                            <dt className="text-gray-400 mb-1">{t('siteSelector.locationResult.investmentOutlook')}:</dt>
                                            <dd className="prose prose-xs prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: marked.parse(economicAnalysis.investmentOutlook) }} />
                                        </div>
                                    </dl>
                                    <div className="pt-3 border-t border-slate-700/50">
                                        <button
                                            onClick={handleFindGrantsClick}
                                            className="w-full text-center text-sm bg-blue-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                            {t('siteSelector.locationResult.findGrantsForProjectButton')}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        const renderTreeCard = (item: SuitableTree, index: number) => {
            const treeId = item.scientificName;
            const analysis = economicAnalysis[treeId];
            const isLoadingAnalysis = loadingAnalysisFor === treeId;
            const errorAnalysis = analysisError[treeId];

            const handleFindGrantsClick = () => {
                const query = `reforestation grant for ${item.commonName} (${item.scientificName})`;
                onFindGrantsForTree(query);
            };

            return (
                 <div key={index} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4 animate-fade-in">
                    <h4 className="text-xl font-bold text-pink-400">{item.commonName} <span className="text-lg font-medium text-gray-400 italic">({item.scientificName})</span></h4>
                    <div>
                        <h5 className="font-semibold text-white mb-2">{t('siteSelector.treeResult.description')}</h5>
                         <div className="prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: marked.parse(item.description) }} />
                    </div>
                    <div>
                        <h5 className="font-semibold text-white mb-2">{t('siteSelector.treeResult.rationale')}</h5>
                        <div className="prose prose-sm prose-invert max-w-none text-gray-300 bg-slate-900/40 p-3 rounded-md" dangerouslySetInnerHTML={{ __html: marked.parse(item.rationale) }} />
                    </div>
                    <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleFindGrantsClick}
                            className="w-full text-center text-sm bg-teal-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-teal-700 transition-colors"
                        >
                            {t('siteSelector.treeResult.findGrantsButton')}
                        </button>
                        <button
                            onClick={async () => {
                                setLoadingAnalysisFor(treeId);
                                try {
                                    const res = await geminiService.analyzeTreeEconomicBenefits(item, language);
                                    setEconomicAnalysis(prev => ({ ...prev, [treeId]: res }));
                                } catch (e) {
                                    setAnalysisError(prev => ({ ...prev, [treeId]: handleApiError(e) }));
                                } finally {
                                    setLoadingAnalysisFor(null);
                                }
                            }}
                            disabled={isLoadingAnalysis}
                            className="w-full text-center text-sm bg-purple-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-500"
                        >
                            {isLoadingAnalysis ? t('siteSelector.treeResult.analyzingBenefits') : t('siteSelector.treeResult.analyzeBenefitsButton')}
                        </button>
                    </div>

                    {(isLoadingAnalysis || analysis || errorAnalysis) && (
                        <div className="mt-4 p-4 bg-slate-900/50 rounded-md border border-slate-700 animate-fade-in">
                            <h5 className="font-semibold text-white mb-3">{t('siteSelector.treeResult.economicAnalysisTitle')}</h5>
                            {isLoadingAnalysis && (
                                <div className="flex items-center justify-center text-gray-400">
                                    <div className="w-4 h-4 border-2 border-dashed rounded-full animate-spin border-purple-400 mr-2"></div>
                                    <span>{t('siteSelector.treeResult.analyzingBenefits')}</span>
                                </div>
                            )}
                            {errorAnalysis && <div className="text-red-400 text-sm">{errorAnalysis}</div>}
                            {analysis && (
                                <dl className="text-sm space-y-2">
                                    <div className="flex justify-between"><dt className="text-gray-400">{t('siteSelector.treeResult.annualRevenue')}:</dt><dd className="font-medium text-white">{analysis.estimatedAnnualRevenuePerTree}</dd></div>
                                    <div className="flex justify-between"><dt className="text-gray-400">{t('siteSelector.treeResult.yearsToProfit')}:</dt><dd className="font-medium text-white">{analysis.yearsToProfitability}</dd></div>
                                    <div className="flex justify-between items-start"><dt className="text-gray-400 flex-shrink-0 mr-2">{t('siteSelector.treeResult.primaryProducts')}:</dt><dd className="font-medium text-white text-right">{analysis.primaryProducts.join(', ')}</dd></div>
                                    <div className="flex justify-between items-start"><dt className="text-gray-400 flex-shrink-0 mr-2">{t('siteSelector.treeResult.otherBenefits')}:</dt><dd className="font-medium text-white text-right">{analysis.otherEconomicBenefits.join(', ')}</dd></div>
                                </dl>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                    <span className="p-2 bg-pink-500/20 rounded-lg">✨</span>
                    {t('siteSelector.resultsTitle')}
                </h3>
                
                {mode === 'locations' && (
                    <div className="grid grid-cols-1 gap-6">
                        {results.map((item, index) => renderLocationCard(item as PlantingSite, index))}
                    </div>
                )}
                
                {mode === 'trees' && (
                    <div className="grid grid-cols-1 gap-6">
                        {results.map((item, index) => renderTreeCard(item as SuitableTree, index))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`min-h-screen bg-slate-950 text-slate-100 ${isRtl ? 'rtl' : 'ltr'}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-pink-500 to-purple-500 mb-4 drop-shadow-sm">
                        {t('siteSelector.title')}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        {t('siteSelector.subtitle')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-5 space-y-8 h-full">
                         {renderForm()}
                         {mode === 'trees' && mapsResult && (
                             <div className="bg-slate-900/60 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-slate-700 animate-fade-in">
                                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                     📍 {t('siteSelector.nearbyAnalysis.resultsTitle').replace('{query}', mapsQuery)}
                                 </h3>
                                 <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                     {mapsResult.places.map((place, idx) => (
                                         <div key={idx} className="bg-slate-800/60 p-4 rounded-lg border border-slate-700 hover:border-pink-500/30 transition-all group">
                                             <div className="flex justify-between items-start mb-2">
                                                 <h4 className="font-bold text-white group-hover:text-pink-400 transition-colors">{place.name}</h4>
                                                 {place.rating && (
                                                     <span className="text-yellow-400 text-xs font-bold bg-yellow-400/10 px-2 py-0.5 rounded flex items-center gap-1">
                                                         ★ {place.rating}
                                                     </span>
                                                 )}
                                             </div>
                                             <p className="text-xs text-gray-400 mb-3">{place.address}</p>
                                             <div className="flex gap-2">
                                                 <a href={place.mapLink} target="_blank" rel="noopener noreferrer" 
                                                    className="flex-1 text-center py-1.5 px-3 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-bold text-white transition-colors">
                                                     🗺️ {t('siteSelector.nearbyAnalysis.mapLink')}
                                                 </a>
                                                 {place.reviewLink && (
                                                     <a href={place.reviewLink} target="_blank" rel="noopener noreferrer"
                                                        className="flex-1 text-center py-1.5 px-3 bg-slate-700 hover:bg-slate-600 rounded text-[10px] font-bold text-white transition-colors">
                                                         💬 {t('siteSelector.nearbyAnalysis.reviewLink')}
                                                     </a>
                                                 )}
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                                 <div className="mt-6 pt-6 border-t border-slate-700">
                                     <div className="prose prose-sm prose-invert text-gray-300" 
                                          dangerouslySetInnerHTML={{ __html: marked.parse(mapsResult.analysis) }} />
                                 </div>
                             </div>
                         )}
                         {renderResults()}
                    </div>

                    <div className="lg:col-span-7 space-y-6 lg:sticky lg:top-8">
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-pink-500 rounded-xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                            <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-2xl h-[600px]">
                                {isMapLoading && (
                                    <div className="absolute inset-0 z-[1001] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-pink-500 mb-4"></div>
                                            <span className="text-white font-medium">{t('siteSelector.mapLoading')}</span>
                                        </div>
                                    </div>
                                )}
                                <div ref={mapRef} className="w-full h-full z-0" />
                                
                                <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
                                    <button
                                        onClick={handleGeolocate}
                                        disabled={isGeolocating}
                                        className="p-3 bg-slate-900/90 text-white rounded-lg shadow-lg hover:bg-slate-800 transition-all border border-slate-700 group flex items-center gap-2 whitespace-nowrap"
                                        title={t('siteSelector.findMyLocation')}
                                    >
                                        <span className={isGeolocating ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}>
                                            {isGeolocating ? '⏳' : '📍'}
                                        </span>
                                        <span className="text-xs font-bold">{isGeolocating ? t('siteSelector.findingLocation') : t('siteSelector.findMyLocation')}</span>
                                    </button>
                                </div>
                                
                                <MapLegend isRtl={isRtl} />
                            </div>
                        </div>
                        
                        {coords && (
                            <div className="bg-slate-900/60 p-6 rounded-xl border border-slate-800 backdrop-blur-sm shadow-xl animate-fade-in">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
                                    {t('siteSelector.selectedCoords')}
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">{t('siteSelector.latitude')}</div>
                                        <div className="text-lg font-mono text-white">{coords.lat.toFixed(6)}</div>
                                    </div>
                                    <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                        <div className="text-[10px] text-gray-400 uppercase tracking-wider mb-1 font-bold">{t('siteSelector.longitude')}</div>
                                        <div className="text-lg font-mono text-white">{coords.lng.toFixed(6)}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm animate-shake">
                                <span className="mr-2">⚠️</span> {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <SiteAnalysisModal
              isOpen={!!selectedSiteForAnalysis}
              onClose={() => setSelectedSiteForAnalysis(null)}
              site={selectedSiteForAnalysis}
              analysis={siteAnalysis}
              isLoading={isAnalyzingSite}
              error={siteAnalysisError}
            />
        </div>
    );
};

export default SiteSelector;
