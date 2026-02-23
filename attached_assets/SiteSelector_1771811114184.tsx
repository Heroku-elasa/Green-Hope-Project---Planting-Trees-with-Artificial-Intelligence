import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { useLanguage, PlantingSite, SuitableTree, Coords, EconomicBenefitAnalysis, GroundedResult, SiteAnalysis, ProjectGoal } from '../types';
import * as geminiService from '../services/geminiService';
import { marked } from 'marked';
import MapLegend from './MapLegend';

type Mode = 'locations' | 'trees';

// Declare Leaflet global object to avoid TypeScript errors, as it's loaded from a CDN.
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
    suggestedGoals: ProjectGoal[];
    isSuggestingGoals: boolean;
    onUseSuggestedGoal: (goal: string) => void;
    onFindGrantsForTree: (query: string) => void;
    handleApiError: (err: unknown) => string;
    isQuotaExhausted: boolean;
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

              {analysis.costBreakdown && (
                <div className="bg-slate-900/40 p-5 rounded-lg border border-slate-700">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    {t('siteAnalysisModal.costBreakdown.title')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-gray-400">{t('siteAnalysisModal.costBreakdown.sapling')}</span>
                      <span className="text-white font-medium">{analysis.costBreakdown.saplingCost}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-gray-400">{t('siteAnalysisModal.costBreakdown.labor')}</span>
                      <span className="text-white font-medium">{analysis.costBreakdown.laborCost}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-gray-400">{t('siteAnalysisModal.costBreakdown.water')}</span>
                      <span className="text-white font-medium">{analysis.costBreakdown.waterCost}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-700 pb-2">
                      <span className="text-gray-400">{t('siteAnalysisModal.costBreakdown.maintenance')}</span>
                      <span className="text-white font-medium">{analysis.costBreakdown.maintenanceCost}</span>
                    </div>
                    <div className="flex justify-between pt-2 col-span-1 sm:col-span-2">
                      <span className="text-pink-400 font-bold">{t('siteAnalysisModal.costBreakdown.total')}</span>
                      <span className="text-pink-400 font-bold">{analysis.costBreakdown.totalCost}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-white mb-2">{t('siteAnalysisModal.keyChallenges')}</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                    {(analysis?.keyChallenges || []).map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-2">{t('siteAnalysisModal.successFactors')}</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                    {(analysis?.successFactors || []).map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                </div>
              </div>

              {analysis.socioeconomicImpact && (
                <div className="bg-slate-900/40 p-5 rounded-lg border border-slate-700 mt-6">
                  <h4 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    {t('siteAnalysisModal.socioeconomicImpact.title')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-white mb-2">{t('siteAnalysisModal.socioeconomicImpact.communityBenefits')}</h5>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                        {(analysis.socioeconomicImpact?.communityBenefits || []).map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-white mb-2">{t('siteAnalysisModal.socioeconomicImpact.potentialRisks')}</h5>
                      <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                        {(analysis.socioeconomicImpact?.potentialRisks || []).map((item, index) => <li key={index}>{item}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
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
        handleApiError,
        isQuotaExhausted
    } = props;
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    const drawControlRef = useRef<any>(null);
    
    const [latInput, setLatInput] = useState(coords?.lat.toString() || '');
    const [lngInput, setLngInput] = useState(coords?.lng.toString() || '');
    const [isGeolocating, setIsGeolocating] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(true);

    // State for Maps Grounding
    const [mapsQuery, setMapsQuery] = useState('');
    const [mapsResult, setMapsResult] = useState<GroundedResult | null>(null);
    const [isMapsLoading, setIsMapsLoading] = useState(false);
    const [mapsError, setMapsError] = useState<string | null>(null);

    // State for Economic Benefit Analysis
    const [economicAnalysis, setEconomicAnalysis] = useState<Record<string, EconomicBenefitAnalysis | null>>({});
    const [loadingAnalysisFor, setLoadingAnalysisFor] = useState<string | null>(null);
    const [analysisError, setAnalysisError] = useState<Record<string, string | null>>({});

    // State for Site Analysis Modal
    const [selectedSiteForAnalysis, setSelectedSiteForAnalysis] = useState<PlantingSite | null>(null);
    const [siteAnalysis, setSiteAnalysis] = useState<SiteAnalysis | null>(null);
    const [isAnalyzingSite, setIsAnalyzingSite] = useState(false);
    const [siteAnalysisError, setSiteAnalysisError] = useState<string | null>(null);

    const handleCopyResults = () => {
        let text = `${t('siteSelector.resultsTitle')}\n\n`;
        results.forEach((item: any) => {
            if (mode === 'locations') {
                text += `${item.locationName}, ${item.country}\n`;
                text += `${t('siteSelector.locationResult.rationale')}: ${item.rationale}\n`;
                text += `${t('siteSelector.locationResult.species')}: ${item.suggestedSpecies.join(', ')}\n\n`;
            } else {
                text += `${item.commonName} (${item.scientificName})\n`;
                text += `${t('siteSelector.treeResult.description')}: ${item.description}\n`;
                text += `${t('siteSelector.treeResult.rationale')}: ${item.rationale}\n\n`;
            }
        });
        if (mapsResult) {
            text += `\n${t('siteSelector.nearbyAnalysis.resultsTitle').replace('{query}', mapsQuery)}\n${mapsResult.text}\n`;
        }
        navigator.clipboard.writeText(text).then(() => {
            alert(t('reportDisplay.copy'));
        });
    };

    const handleExportResults = () => {
        let content = `
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 20px; direction: ${language === 'fa' ? 'rtl' : 'ltr'}; }
                    h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
                    h2 { color: #059669; margin-top: 30px; }
                    h3 { color: #047857; }
                    .card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
                    .footer { margin-top: 50px; font-size: 0.8em; color: #6b7280; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 20px; }
                    .tag { display: inline-block; background: #d1fae5; color: #065f46; padding: 2px 8px; border-radius: 9999px; font-size: 0.75em; font-weight: 600; margin-right: 5px; }
                </style>
            </head>
            <body>
                <h1>Green Hope Project - ${t('siteSelector.resultsTitle')}</h1>
                <p>${t('siteSelector.subtitle')}</p>
        `;

        results.forEach((item: any) => {
            if (mode === 'locations') {
                content += `
                    <div class="card">
                        <h2>${item.locationName}, ${item.country}</h2>
                        <p><span class="tag">${item.priority} Priority</span></p>
                        <h3>${t('siteSelector.locationResult.rationale')}</h3>
                        <div>${marked.parse(item.rationale)}</div>
                        <h3>${t('siteSelector.locationResult.species')}</h3>
                        <ul>${item.suggestedSpecies.map((s: string) => `<li>${s}</li>`).join('')}</ul>
                    </div>
                `;
            } else {
                content += `
                    <div class="card">
                        <h2>${item.commonName} (<i>${item.scientificName}</i>)</h2>
                        <h3>${t('siteSelector.treeResult.description')}</h3>
                        <div>${marked.parse(item.description)}</div>
                        <h3>${t('siteSelector.treeResult.rationale')}</h3>
                        <div>${marked.parse(item.rationale)}</div>
                    </div>
                `;
            }
        });

        if (mapsResult) {
            content += `
                <div class="card">
                    <h2>${t('siteSelector.nearbyAnalysis.resultsTitle').replace('{query}', mapsQuery)}</h2>
                    <div>${marked.parse(mapsResult.text)}</div>
                </div>
            `;
        }

        content += `
                <div class="footer">
                    <p>© 2024 Green Hope Project. All Rights Reserved.</p>
                    <p>Generated on ${new Date().toLocaleDateString()}</p>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Green_Hope_Results_${new Date().getTime()}.html`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // This component is rendered inside a Leaflet popup, so it needs access to the language context.
    // It's defined inside the main component to capture the `useLanguage` hook.
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
                    // A bit of a hack to get Tailwind styles into dynamically generated Leaflet content
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

    useEffect(() => {
        setLatInput(coords?.lat.toFixed(6) || '');
        setLngInput(coords?.lng.toFixed(6) || '');
    }, [coords]);

    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
            const initialCenter = coords ? [coords.lat, coords.lng] : [32.4279, 53.6880];
            const initialZoom = coords ? 13 : 5;
            const map = L.map(mapRef.current, {
                center: initialCenter,
                zoom: initialZoom,
            });
            mapInstanceRef.current = map;

            const tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18,
            });

            tileLayer.on('loading', () => setIsMapLoading(true));
            tileLayer.on('load', () => setIsMapLoading(false));
            tileLayer.addTo(map);


            // --- Coordinate Tooltip ---
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
                 if (mode === 'trees') {
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
                        onFindTrees(latLng);
                        map.closePopup(popup);
                    };

                    root.render(<PopupContent coords={latLng} onConfirm={handleConfirm} />);
                }
            });

            // --- Leaflet Draw Initialization ---
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
                
                if (newPrompt) {
                    setLocationsInput(newPrompt);
                    onFindLocations(newPrompt);
                }
            });


            // Fix for map not rendering completely on initial load
            setTimeout(() => {
                map.invalidateSize();
            }, 100); // A small delay to allow the container to resize
        }
    }, [t, mode, onFindLocations, onFindTrees, setCoords, setLocationsInput]); 

    useEffect(() => {
        const map = mapInstanceRef.current;
        const drawControl = drawControlRef.current;
        if (map && drawControl) {
            if (mode === 'locations') {
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
            'Critical': createIcon('#ef4444'), // red-500
            'High': createIcon('#f97316'),     // orange-500
            'Medium': createIcon('#eab308'),   // yellow-500
            'Low': createIcon('#22c55e'),       // green-500
        };

        const blueIcon = createIcon('#3b82f6'); // blue-500

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
        }
    }, [results, mode, coords, t, onFindTrees, setCoords, handleAnalyzeSite]);

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
            const result = await geminiService.findPlantingSitesWithMaps(mapsQuery, coords, language);
            setMapsResult(result);
        } catch (err) {
            setMapsError(handleApiError(err));
        } finally {
            setIsMapsLoading(false);
        }
    }, [mapsQuery, coords, handleApiError, t, language]);

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
                (error) => {
                    alert(t('siteSelector.locationError'));
                    console.error("Geolocation error:", error);
                    setIsGeolocating(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    };
    
    const handleExamplePromptClick = (prompt: string) => {
        setLocationsInput(prompt);
        onFindLocations(prompt);
    }
    
    const handleAnalyzeEconomicBenefits = useCallback(async (tree: SuitableTree) => {
        if (!coords) return;
        const treeId = tree.scientificName;
        setLoadingAnalysisFor(treeId);
        setAnalysisError(prev => ({ ...prev, [treeId]: null }));
        try {
            const result = await geminiService.calculateEconomicBenefits(tree.commonName, tree.scientificName, coords, language);
            setEconomicAnalysis(prev => ({ ...prev, [treeId]: result }));
        } catch (err) {
            const message = handleApiError(err);
            setAnalysisError(prev => ({ ...prev, [treeId]: message }));
        } finally {
            setLoadingAnalysisFor(null);
        }
    }, [coords, handleApiError, language]);

    const renderForm = () => (
        <div className="bg-slate-900/60 rounded-lg p-8 shadow-lg backdrop-blur-sm border border-slate-700">
            <div className="mb-6">
                <div className="flex rounded-md shadow-sm bg-slate-700/80 p-1">
                    <button onClick={() => setMode('locations')} className={`w-1/2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'locations' ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-slate-600'}`}>
                        {t('siteSelector.findLocationsMode')}
                    </button>
                    <button onClick={() => setMode('trees')} className={`w-1/2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${mode === 'trees' ? 'bg-pink-600 text-white' : 'text-gray-300 hover:bg-slate-600'}`}>
                        {t('siteSelector.findTreesMode')}
                    </button>
                </div>
            </div>
            {mode === 'locations' ? (
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
            ) : (
                 <div className="space-y-6">
                    <form onSubmit={handleCoordsSubmit} className="space-y-4 p-4 bg-slate-800/50 rounded-md border border-slate-700">
                        <h4 className="font-bold text-white text-md">{t('siteSelector.manualCoordsTitle')}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="latitude-input" className="block text-xs font-medium text-gray-300">{t('siteSelector.latitude')}</label>
                                <input type="number" id="latitude-input" step="any" value={latInput} onChange={(e) => setLatInput(e.target.value)}
                                    className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                                    placeholder="e.g., 34.0522" />
                            </div>
                            <div>
                                <label htmlFor="longitude-input" className="block text-xs font-medium text-gray-300">{t('siteSelector.longitude')}</label>
                                <input type="number" id="longitude-input" step="any" value={lngInput} onChange={(e) => setLngInput(e.target.value)}
                                    className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                                    placeholder="e.g., -118.2437" />
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
                                    {suggestedGoals.map((goalObj, index) => (
                                        <div key={index} className="bg-slate-800 rounded-md border border-slate-700 overflow-hidden">
                                            <div className="p-3 space-y-2">
                                                <p className="text-sm text-white font-medium">{goalObj.goal}</p>
                                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                                    <div className="bg-slate-900/50 p-1.5 rounded">
                                                        <span className="text-gray-400 block uppercase tracking-wider mb-0.5">Economic Goal</span>
                                                        <span className="text-teal-400">{goalObj.economicGoal}</span>
                                                    </div>
                                                    <div className="bg-slate-900/50 p-1.5 rounded">
                                                        <span className="text-gray-400 block uppercase tracking-wider mb-0.5">Est. Cost</span>
                                                        <span className="text-pink-400">{goalObj.estimatedCost}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => onUseSuggestedGoal(goalObj.goal)} 
                                                className="w-full text-center p-2 bg-slate-700 hover:bg-slate-600 transition-colors text-xs text-pink-400 font-semibold border-t border-slate-700">
                                                {t('siteSelector.suggestedGoals.useGoal')} &rarr;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                 </div>
            )}
        </div>
    );
    
    const renderResults = () => {
        const renderLocationCard = (item: PlantingSite, index: number) => (
            <div key={index} className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4 animate-fade-in">
                <h4 className="text-xl font-bold text-pink-400">{item.locationName}, <span className="text-lg font-medium text-gray-300">{item.country}</span></h4>
                <div>
                    <h5 className="font-semibold text-white mb-2">{t('siteSelector.locationResult.rationale')}</h5>
                    <div className="prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: marked.parse(item.rationale) }} />
                </div>
                <div>
                    <h5 className="font-semibold text-white mb-2">{t('siteSelector.locationResult.species')}</h5>
                    <ul className="list-disc list-inside space-y-1">
                        {(item.suggestedSpecies || []).map(species => <li key={species} className="text-gray-300">{species}</li>)}
                    </ul>
                </div>
            </div>
        );

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
                         <div className="prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: marked.parse(item.rationale) }} />
                    </div>
                    <div className="pt-4 border-t border-slate-700 flex flex-col sm:flex-row gap-3">
                        <button 
                            onClick={handleFindGrantsClick}
                            className="w-full text-center text-sm bg-teal-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-teal-700 transition-colors"
                        >
                            {t('siteSelector.treeResult.findGrantsButton')}
                        </button>
                        <button 
                            onClick={() => handleAnalyzeEconomicBenefits(item)}
                            disabled={isLoadingAnalysis}
                            className="w-full text-center text-sm bg-purple-600 text-white font-semibold py-2 px-3 rounded-md hover:bg-purple-700 transition-colors disabled:bg-gray-500"
                        >
                            {isLoadingAnalysis ? t('siteSelector.treeResult.analyzingBenefits') : t('siteSelector.treeResult.analyzeBenefitsButton')}
                        </button>
                    </div>
                    { (isLoadingAnalysis || analysis || errorAnalysis) && (
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
                                    <div className="flex justify-between"><dt className="text-gray-400">{t('siteSelector.treeResult.annualRevenue')}:</dt><dd className="font-medium text-white">{analysis.annualRevenuePerTree}</dd></div>
                                    <div className="flex justify-between"><dt className="text-gray-400">{t('siteSelector.treeResult.yearsToProfit')}:</dt><dd className="font-medium text-white">{analysis.yearsToProfitability}</dd></div>
                                    <div className="flex justify-between"><dt className="text-gray-400">{t('siteSelector.treeResult.primaryProducts')}:</dt><dd className="font-medium text-white text-right">{analysis.primaryProducts.join(', ')}</dd></div>
                                    <div>
                                        <dt className="text-gray-400 mb-1">{t('siteSelector.treeResult.otherBenefits')}:</dt>
                                        <dd className="prose prose-xs prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: marked.parse(analysis.otherBenefits) }} />
                                    </div>
                                </dl>
                            )}
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="bg-slate-900/60 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 min-h-[60vh] flex flex-col">
                <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-slate-800/80 border-b border-slate-700 gap-4">
                    <h3 className="text-lg font-semibold text-white">{t('siteSelector.resultsTitle')}</h3>
                    {(results.length > 0 || mapsResult) && (
                        <div className="flex gap-2">
                            <button onClick={handleCopyResults} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-700 text-gray-200 rounded hover:bg-slate-600 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                                {t('siteSelector.copyResults')}
                            </button>
                            <button onClick={handleExportResults} className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-pink-600 text-white rounded hover:bg-pink-700 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                {t('siteSelector.exportResults')}
                            </button>
                        </div>
                    )}
                </div>
                <div className="p-6 flex-grow overflow-y-auto space-y-6">
                     {isMapsLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-400"></div>
                            <span className="ml-3 text-gray-400">{t('siteSelector.generating')}</span>
                        </div>
                    )}
                    {mapsError && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{mapsError}</div>}
                    {mapsResult && (
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4 animate-fade-in">
                            <h4 className="text-xl font-bold text-teal-400">{t('siteSelector.nearbyAnalysis.resultsTitle').replace('{query}', mapsQuery)}</h4>
                            <div className="prose prose-sm prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: marked.parse(mapsResult.text) }} />
                            {mapsResult.sources && mapsResult.sources.length > 0 && (
                                <div>
                                    <h5 className="font-semibold text-white mt-4 mb-2">{t('grantFinder.sources')}:</h5>
                                    <ul className="space-y-2 text-sm">
                                        {mapsResult.sources.map((source, index) => (
                                            <li key={index} className="bg-slate-900/50 p-2 rounded-md">
                                                {source.maps && (
                                                    <div className="space-y-1">
                                                        <a href={source.maps.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline font-semibold" title={source.maps.title}>
                                                            {source.maps.title} ({t('siteSelector.nearbyAnalysis.mapLink')})
                                                        </a>
                                                        {source.maps.placeAnswerSources?.reviewSnippets?.map((snippet, sIndex) => (
                                                            <a key={sIndex} href={snippet.uri} target="_blank" rel="noopener noreferrer" className="block text-xs text-gray-400 hover:text-gray-200 pl-4 italic" title={snippet.text}>
                                                                - "{snippet.text}" ({t('siteSelector.nearbyAnalysis.reviewLink')})
                                                            </a>
                                                        ))}
                                                    </div>
                                                )}
                                                {source.web && (
                                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline" title={source.web.title}>
                                                        {source.web.title || source.web.uri}
                                                    </a>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                     {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-pink-400"></div>
                            <span className="ml-3 text-gray-400">{t('siteSelector.generating')}</span>
                        </div>
                    )}
                    {error && <div className="text-red-400 p-4 bg-red-900/50 rounded-md">{error}</div>}
                    {!isLoading && !error && results.length > 0 && (
                        <div className="space-y-6">
                            {results.map((item, index) => mode === 'locations' 
                                ? renderLocationCard(item as PlantingSite, index)
                                : renderTreeCard(item as SuitableTree, index)
                            )}
                        </div>
                    )}
                    {!isLoading && !error && results.length === 0 && !isMapsLoading && !mapsResult && (
                        <div className="text-center text-gray-500 flex items-center justify-center h-full">
                            <p>{t('siteSelector.placeholder')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const locationLegendItems = [
        { label: t('mapLegend.criticalSite'), color: 'bg-red-500' },
        { label: t('mapLegend.highPrioritySite'), color: 'bg-orange-500' },
        { label: t('mapLegend.mediumPrioritySite'), color: 'bg-yellow-500' },
    ];
    
    const treeLegendItems = [
        { label: t('mapLegend.selectedPoint'), color: 'bg-blue-500' },
    ];

    const legendItems = mode === 'locations' ? locationLegendItems : treeLegendItems;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                    {t('siteSelector.title')}
                </h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('siteSelector.subtitle')}</p>
                {isQuotaExhausted && (
                    <div className="mt-4 p-3 bg-red-900/50 border border-red-500/50 text-red-300 text-center rounded-md text-sm">
                        {t('quotaErrorModal.body')}
                    </div>
                )}
            </div>
            
            <div className="mt-12 max-w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="lg:sticky top-28">
                    <div className="relative">
                        <div ref={mapRef} className="h-[60vh] lg:h-[85vh] w-full rounded-lg bg-slate-800 border border-slate-700 shadow-lg" />
                        
                        {isMapLoading && (
                            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-[1001] rounded-lg transition-opacity duration-300 animate-fade-in">
                                <div className="flex flex-col items-center text-white">
                                    <svg className="w-8 h-8 animate-spin text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <p className="mt-3 text-sm">{t('siteSelector.mapLoading')}</p>
                                </div>
                            </div>
                        )}

                        <MapLegend items={legendItems} />
                        <button 
                            onClick={handleGeolocate}
                            disabled={isGeolocating}
                            className="absolute top-24 right-2.5 z-[1000] bg-slate-900/70 backdrop-blur-sm rounded-md p-2 border border-white/20 shadow-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-wait"
                            title={t('siteSelector.findMyLocation')}
                        >
                            {isGeolocating ? (
                                <svg className="w-6 h-6 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            )}
                        </button>
                    </div>
                </div>
                <div className="space-y-12">
                    {renderForm()}
                    {renderResults()}
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