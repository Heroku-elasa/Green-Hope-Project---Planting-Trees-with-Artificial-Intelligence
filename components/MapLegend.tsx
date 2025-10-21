import React from 'react';
import { useLanguage } from '../types';

interface LegendItem {
    label: string;
    color: string;
}

interface MapLegendProps {
    items: LegendItem[];
}

const MapLegend: React.FC<MapLegendProps> = ({ items }) => {
    const { t } = useLanguage();

    return (
        <div className="absolute bottom-4 start-4 z-[1000] bg-slate-900/70 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-lg animate-fade-in">
            <h4 className="font-bold text-sm text-white mb-2">{t('mapLegend.title')}</h4>
            <div className="space-y-1">
                {items.map(item => (
                    <div key={item.label} className="flex items-center space-x-2 rtl:space-x-reverse">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="text-xs text-slate-300">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapLegend;
