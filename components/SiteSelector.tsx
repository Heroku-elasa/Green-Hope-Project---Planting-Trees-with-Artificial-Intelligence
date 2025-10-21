import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, PlantingSite, SuitableTree, Coords } from '../types';
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
    suggestedGoals: string[];
    isSuggestingGoals: boolean;
    onUseSuggestedGoal: (goal: string) => void;
}

const SiteSelector: React.FC<SiteSelectorProps> = (props) => {
    const { t } = useLanguage();
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
        onUseSuggestedGoal 
    } = props;
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);
    
    const [latInput, setLatInput] = useState(coords?.lat.toString() || '');
    const [lngInput, setLngInput] = useState(coords?.lng.toString() || '');

    useEffect(() => {
        setLatInput(coords?.lat.toFixed(6) || '');
        setLngInput(coords?.lng.toFixed(6) || '');
    }, [coords]);

    useEffect(() => {
        if (mapRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
            const map = L.map(mapRef.current, {
                center: [20, 0],
                zoom: 2,
            });
            mapInstanceRef.current = map;

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 18,
            }).addTo(map);

            map.on('click', (e: any) => {
                 if (mode === 'trees') {
                    const { lat, lng } = e.latlng;
                    const latLng = { lat, lng };
                    setCoords(latLng);
                    onFindTrees(latLng);
                }
            });
        }
    }, [mode, onFindTrees, setCoords]);

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

        const pinkIcon = createIcon('#ec4899'); // pink-500
        const blueIcon = createIcon('#3b82f6'); // blue-500

        if (mode === 'locations' && results.length > 0) {
            const latLngs: any[] = [];
            results.forEach(result => {
                const site = result as PlantingSite;
                if (typeof site.latitude === 'number' && typeof site.longitude === 'number') {
                    const pos: [number, number] = [site.latitude, site.longitude];
                    const marker = L.marker(pos, { icon: pinkIcon }).addTo(map)
                        .bindPopup(`<b>${site.locationName}</b><br>${site.country}`);
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
    }, [results, mode, coords, t, onFindTrees, setCoords]);

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
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 hover:from-blue-700 hover:to-pink-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all">
                            {isLoading ? t('siteSelector.generating') : t(`siteSelector.locations.button`)}
                        </button>
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
                        {item.suggestedSpecies.map(species => <li key={species} className="text-gray-300">{species}</li>)}
                    </ul>
                </div>
            </div>
        );

        const renderTreeCard = (item: SuitableTree, index: number) => (
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
            </div>
        );

        return (
            <div className="bg-slate-900/60 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 min-h-[60vh] flex flex-col">
                <div className="flex justify-between items-center p-4 bg-slate-800/80 border-b border-slate-700">
                    <h3 className="text-lg font-semibold text-white">{t('siteSelector.resultsTitle')}</h3>
                </div>
                <div className="p-6 flex-grow overflow-y-auto">
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
                    {!isLoading && !error && results.length === 0 && (
                        <div className="text-center text-gray-500 flex items-center justify-center h-full">
                            <p>{t('siteSelector.placeholder')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const legendItems = [
        { label: t('mapLegend.plantingSite'), color: 'bg-pink-500' },
        { label: t('mapLegend.selectedPoint'), color: 'bg-blue-500' },
    ];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                    {t('siteSelector.title')}
                </h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('siteSelector.subtitle')}</p>
            </div>
            
            <div className="mt-12 max-w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="lg:sticky top-28">
                    <div className="relative">
                        <div ref={mapRef} className="h-[75vh] w-full rounded-lg bg-slate-800 border border-slate-700 shadow-lg" />
                        <MapLegend items={legendItems} />
                    </div>
                </div>
                <div className="space-y-12">
                    {renderForm()}
                    {renderResults()}
                </div>
            </div>
        </div>
    );
};

export default SiteSelector;
