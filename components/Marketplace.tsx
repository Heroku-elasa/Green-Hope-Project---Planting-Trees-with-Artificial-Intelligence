import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage, Coords } from '../types';

declare const L: any;

const Marketplace: React.FC = () => {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedLand, setSelectedLand] = useState<any>(null);

  const lands = [
    { id: 1, name: 'باغ پسته یزد', location: 'یزد، منطقه مرکزی', risk: 'کم‌خطر', product: 'پسته', price: '۱۵۰٬۰۰۰', area: '۱۰٬۰۰۰', lat: 31.90, lng: 54.36 },
    { id: 2, name: 'مزرعه عناب سمنان', location: 'سمنان، دشت شمالی', risk: 'متوسط', product: 'عناب', price: '۱۲۰٬۰۰۰', area: '۸٬۰۰۰', lat: 35.58, lng: 53.39 },
    { id: 3, name: 'نخلستان کرمان', location: 'کرمان، بم', risk: 'کم‌خطر', product: 'خرما', price: '۱۸۰٬۰۰۰', area: '۱۵٬۰۰۰', lat: 29.11, lng: 58.36 },
    { id: 4, name: 'باغ زعفران خراسان', location: 'خراسان جنوبی، قاین', risk: 'پرخطر', product: 'زعفران', price: '۲۵۰٬۰۰۰', area: '۵٬۰۰۰', lat: 33.73, lng: 59.18 },
  ];

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
      const map = L.map(mapRef.current).setView([32.4279, 53.6880], 5);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      lands.forEach(land => {
        const marker = L.marker([land.lat, land.lng]).addTo(map);
        marker.on('click', () => setSelectedLand(land));
      });
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 text-white dir-rtl">
      <h1 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-500">
        بازارچه زمین‌های هوشمند
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-slate-800 rounded-xl overflow-hidden shadow-2xl border border-slate-700 h-[600px]" ref={mapRef}></div>
        </div>
        
        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
          <h2 className="text-xl font-semibold mb-4">لیست زمین‌ها ({lands.length})</h2>
          {lands.map(land => (
            <div 
              key={land.id}
              onClick={() => setSelectedLand(land)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedLand?.id === land.id ? 'border-green-500 bg-green-500/10' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{land.name}</h3>
                <span className={`px-2 py-1 rounded text-xs ${land.risk === 'کم‌خطر' ? 'bg-green-500/20 text-green-400' : land.risk === 'متوسط' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                  {land.risk}
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-2">{land.location}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>محصول: <span className="text-gray-200">{land.product}</span></div>
                <div>قیمت: <span className="text-green-400">{land.price} ت/م²</span></div>
                <div>مساحت: <span className="text-gray-200">{land.area} م²</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedLand && (
        <div className="mt-8 bg-slate-800 p-6 rounded-xl border border-slate-700 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4 text-green-400">پیش‌بینی AI: {selectedLand.name}</h2>
              <div className="space-y-4">
                <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                  <span>محصول پیشنهادی</span>
                  <span className="font-bold">{selectedLand.product}</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                  <span>پیش‌بینی برداشت</span>
                  <span className="font-bold text-blue-400">۲٬۵۰۰ کیلوگرم/سال</span>
                </div>
                <div className="flex justify-between p-3 bg-slate-900/50 rounded-lg">
                  <span>صرفه‌جویی آب</span>
                  <span className="font-bold text-cyan-400">45%</span>
                </div>
                <div className="flex justify-between p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                  <span>سود تخمینی ۵ ساله</span>
                  <span className="font-bold text-green-400 text-xl">۸۵۰٬۰۰۰٬۰۰۰ تومان</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-xl">
              <h2 className="text-xl font-bold mb-4">ماشین حساب ارزش شاپلی</h2>
              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">مساحت مورد نظر (متر مربع)</label>
                <input type="range" min="100" max="1000" step="10" className="w-full accent-green-500" />
                <div className="flex justify-between text-xs mt-1">
                  <span>100 م²</span>
                  <span>1,000 م²</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">مبلغ سرمایه‌گذاری</span>
                  <span className="font-bold">۱۵٬۰۰۰٬۰۰۰ تومان</span>
                </div>
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-sm font-semibold mb-2">تقسیم ارزش (شاپلی)</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs"><span>سهم زمین</span><span>30%</span></div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div className="bg-green-500 h-full w-[30%]"></div></div>
                    <div className="flex justify-between text-xs"><span>سهم تکنولوژی</span><span>25%</span></div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div className="bg-blue-500 h-full w-[25%]"></div></div>
                    <div className="flex justify-between text-xs"><span>سهم نیروی کار</span><span>20%</span></div>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden"><div className="bg-purple-500 h-full w-[20%]"></div></div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-center">
                  <p className="text-xs text-gray-400">سود تخمینی شما</p>
                  <p className="text-xl font-bold text-green-400">۳٬۳۷۵٬۰۰۰ تومان</p>
                </div>
                <button className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 rounded-lg font-bold hover:scale-[1.02] transition-transform mt-4">
                  سرمایه‌گذاری و دریافت سند دیجیتال
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;