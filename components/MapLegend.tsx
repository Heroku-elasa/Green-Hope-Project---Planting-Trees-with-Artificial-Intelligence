import React from 'react';
import { useLanguage } from '../types';

const MapLegend: React.FC<{ isRtl?: boolean }> = ({ isRtl }) => {
    const { t } = useLanguage();

    const items = [
        { label: t('mapLegend.plantingSite'), color: 'bg-teal-500' },
        { label: t('mapLegend.selectedPoint'), color: 'bg-blue-500' },
        { label: t('mapLegend.criticalSite'), color: 'bg-red-500' },
        { label: t('mapLegend.highPrioritySite'), color: 'bg-orange-500' },
        { label: t('mapLegend.mediumPrioritySite'), color: 'bg-yellow-500' },
    ];

    return (
        <div className={`absolute bottom-4 ${isRtl ? 'right-4' : 'left-4'} z-[1000] bg-slate-900/70 backdrop-blur-sm rounded-lg p-3 border border-white/20 shadow-lg animate-fade-in`}>
            <h4 className="font-bold text-sm text-white mb-2">{t('mapLegend.title')}</h4>
            <div className="space-y-1">
                {items.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${item.color}`}></span>
                        <span className="text-xs text-slate-300">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapLegend;
