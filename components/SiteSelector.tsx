// FIX: The google.maps types are not available in this build environment. To resolve compilation errors, 
// the failing triple-slash directive is removed and a minimal set of local type declarations for the Google Maps API is provided below.

import React, { useState, useRef, useEffect } from 'react';
import { useLanguage, PlantingSite, SuitableTree, Coords } from '../types';
import { marked } from 'marked';

type Mode = 'locations' | 'trees';

// @ts-ignore
declare global { 
  interface Window { 
    initMapSiteSelector: () => void;
    google: typeof google;
  } 
}

// Minimal type declarations for Google Maps to fix compilation errors when types are not found.
declare namespace google {
    namespace maps {
        type MapTypeStyle = any;
        class Map {
            constructor(mapDiv: Element | null, opts?: any);
            addListener(eventName: string, handler: (...args: any[]) => void): any;
            fitBounds(bounds: any): void;
            panTo(latLng: any): void;
            setZoom(zoom: number): void;
        }
        class Marker {
            constructor(opts?: any);
            setMap(map: Map | null): void;
            addListener(eventName: string, handler: (...args: any[]) => void): any;
        }
        type MapMouseEvent = { latLng: { lat: () => number, lng: () => number } | null };
        class LatLngBounds {
            constructor();
            extend(point: any): void;
        }
        class InfoWindow {
            constructor(opts?: any);
            open(map: Map, anchor?: any): void;
        }
    }
}


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

const SiteSelectorForm: React.FC<Pick<SiteSelectorProps, 'onFindLocations' | 'onFindTrees' | 'isLoading' | 'mode' | 'setMode' | 'locationsInput' | 'setLocationsInput' | 'coords' | 'suggestedGoals' | 'isSuggestingGoals' | 'onUseSuggestedGoal'>> = 
({ onFindLocations, onFindTrees, isLoading, mode, setMode, locationsInput, setLocationsInput, coords, suggestedGoals, isSuggestingGoals, onUseSuggestedGoal }) => {
    const { t } = useLanguage();
    
    const handleLocationsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!locationsInput.trim()) {
            alert(t('siteSelector.validationError'));
            return;
        }
        onFindLocations(locationsInput);
    };
    
    const handleTreesSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!coords) {
            alert(t('siteSelector.validationErrorCoords'));
            return;
        }
        onFindTrees(coords);
    };

    return (
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
                        <textarea
                            id="description"
                            rows={8}
                            value={locationsInput}
                            onChange={(e) => setLocationsInput(e.target.value)}
                            className="mt-1 block w-full bg-slate-700/80 border-slate-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm text-white"
                            placeholder={t(`siteSelector.locations.placeholder`)}
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 hover:from-blue-700 hover:to-pink-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all">
                            {isLoading ? t('siteSelector.generating') : t(`siteSelector.locations.button`)}
                        </button>
                    </div>
                </form>
            ) : (
                 <div className="space-y-6">
                    <form onSubmit={handleTreesSubmit}>
                        <div className="text-center p-4 bg-slate-800/50 rounded-md border border-slate-700">
                        <p className="text-sm text-gray-400">{t('siteSelector.selectOnMap')}</p>
                        {coords && (
                            <div className="mt-3 text-left text-xs bg-slate-700 p-2 rounded-md">
                                <h4 className="font-bold text-white text-sm mb-1">{t('siteSelector.selectedCoords')}</h4>
                                <p><span className="font-semibold text-gray-300">{t('siteSelector.latitude')}:</span> {coords.lat.toFixed(6)}</p>
                                <p><span className="font-semibold text-gray-300">{t('siteSelector.longitude')}:</span> {coords.lng.toFixed(6)}</p>
                            </div>
                        )}
                        </div>
                        <div>
                            <button type="submit" disabled={isLoading || !coords} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 hover:from-blue-700 hover:to-pink-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed transition-all">
                                {isLoading ? t('siteSelector.generating') : t(`siteSelector.trees.button`)}
                            </button>
                        </div>
                    </form>

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
                                        <button 
                                            key={index} 
                                            onClick={() => onUseSuggestedGoal(goal)} 
                                            className="w-full text-left p-3 bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-sm text-gray-300"
                                            title={t('siteSelector.suggestedGoals.useGoal')}
                                        >
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
};

const ResultsDisplay: React.FC<Pick<SiteSelectorProps, 'results' | 'isLoading' | 'error' | 'mode'>> = ({ results, isLoading, error, mode }) => {
    const { t } = useLanguage();

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
}

const mapStyles: google.maps.MapTypeStyle[] = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ];

const SiteSelector: React.FC<SiteSelectorProps> = (props) => {
    const { t, language } = useLanguage();
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [isMapScriptLoaded, setIsMapScriptLoaded] = useState(!!(window.google && window.google.maps));

    useEffect(() => {
        if (isMapScriptLoaded) {
            return;
        }

        const scriptId = 'google-maps-script';
        if (document.getElementById(scriptId)) {
            return;
        }
        
        const script = document.createElement('script');
        script.id = scriptId;
        // IMPORTANT: Use process.env.API_KEY to load the script
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        const callbackName = 'initMapSiteSelector';
        window[callbackName] = () => {
            setIsMapScriptLoaded(true);
            delete (window as any)[callbackName];
        };
        script.src += `&callback=${callbackName}`;

        script.onerror = () => {
            console.error("Google Maps script failed to load.");
            delete (window as any)[callbackName];
        };

        document.head.appendChild(script);

        return () => {
            const scriptElement = document.getElementById(scriptId);
            if (scriptElement) {
                scriptElement.remove();
            }
        };
    }, [isMapScriptLoaded]);
    
    useEffect(() => {
        if (mapRef.current && !map && isMapScriptLoaded) {
            const newMap = new window.google.maps.Map(mapRef.current, {
                center: { lat: 32, lng: 53 }, // Center of Iran
                zoom: 5,
                mapTypeControl: false,
                streetViewControl: false,
                styles: mapStyles
            });
            
            newMap.addListener('click', (e: google.maps.MapMouseEvent) => {
                if (props.mode === 'trees' && e.latLng) {
                    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    props.setCoords(latLng);
                }
            });

            setMap(newMap);
        }
    }, [mapRef, map, props.mode, props.setCoords, isMapScriptLoaded]);

    useEffect(() => {
        if (!map) return;
        // Clear previous markers
        markers.forEach(marker => marker.setMap(null));
        const newMarkers: google.maps.Marker[] = [];

        if (props.mode === 'locations' && props.results.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            props.results.forEach(result => {
                const site = result as PlantingSite;
                if (typeof site.latitude === 'number' && typeof site.longitude === 'number') {
                    const pos = { lat: site.latitude, lng: site.longitude };
                    const marker = new google.maps.Marker({ position: pos, map: map, title: site.locationName });
                    
                    const infoWindow = new google.maps.InfoWindow({
                       content: `<div class="bg-slate-800 text-white p-2"><h4 class="font-bold">${site.locationName}</h4><p class="text-sm">${site.country}</p></div>`,
                    });
                    marker.addListener('click', () => infoWindow.open(map, marker));

                    newMarkers.push(marker);
                    bounds.extend(pos);
                }
            });
            if (newMarkers.length > 0) {
                map.fitBounds(bounds);
            }
        } else if (props.mode === 'trees' && props.coords) {
             const marker = new google.maps.Marker({
                position: props.coords,
                map: map,
                title: t('siteSelector.selectedCoords'),
                draggable: true,
             });
             marker.addListener('dragend', (e: google.maps.MapMouseEvent) => {
                 if (e.latLng) {
                    const latLng = { lat: e.latLng.lat(), lng: e.latLng.lng() };
                    props.setCoords(latLng);
                 }
             });
             newMarkers.push(marker);
             map.panTo(props.coords);
             map.setZoom(8);
        }
        
        setMarkers(newMarkers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [map, props.results, props.mode, props.coords, t]);


    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
            <div className="text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight">
                    {t('siteSelector.title')}
                </h1>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('siteSelector.subtitle')}</p>
            </div>
            
            <div ref={mapRef} className="mt-8 h-96 w-full rounded-lg bg-slate-800 border border-slate-700 shadow-lg" />

            <div className="mt-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="lg:sticky top-28">
                    <SiteSelectorForm {...props} />
                </div>
                <div>
                    <ResultsDisplay {...props} />
                </div>
            </div>
        </div>
    );
};

export default SiteSelector;