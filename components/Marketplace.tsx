import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../types';

declare const L: any;

const Marketplace: React.FC = () => {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [selectedLand, setSelectedLand] = useState<any>(null);
  const [view, setView] = useState<'map' | 'investment'>('map');

  const lands = [
    { id: 1, name: 'باغ پسته یزد', location: 'یزد، منطقه مرکزی', risk: 'کم‌خطر', product: 'پسته', price: '۱۵۰٬۰۰۰', area: '۱۰٬۰۰۰', lat: 31.90, lng: 54.36, yield: '۲٬۵۰۰', waterSaving: '45%', profit: '۸۵۰٬۰۰۰٬۰۰۰' },
    { id: 2, name: 'مزرعه عناب سمنان', location: 'سمنان، دشت شمالی', risk: 'متوسط', product: 'عناب', price: '۱۲۰٬۰۰۰', area: '۸٬۰۰۰', lat: 35.58, lng: 53.39, yield: '۱٬۸۰۰', waterSaving: '35%', profit: '۶۲۰٬۰۰۰٬۰۰۰' },
    { id: 3, name: 'نخلستان کرمان', location: 'کرمان، بم', risk: 'کم‌خطر', product: 'خرما', price: '۱۸۰٬۰۰۰', area: '۱۵٬۰۰۰', lat: 29.11, lng: 58.36, yield: '۴٬۲۰۰', waterSaving: '50%', profit: '۱٬۲۰۰٬۰۰۰٬۰۰۰' },
    { id: 4, name: 'باغ زعفران خراسان', location: 'خراسان جنوبی، قاین', risk: 'پرخطر', product: 'زعفران', price: '۲۵۰٬۰۰۰', area: '۵٬۰۰۰', lat: 33.73, lng: 59.18, yield: '۸۰۰', waterSaving: '60%', profit: '۱٬۵۰۰٬۰۰۰٬۰۰۰' },
  ];

  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
      const map = L.map(mapRef.current, { zoomControl: false }).setView([32.4279, 53.6880], 5);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      lands.forEach(land => {
        const marker = L.circleMarker([land.lat, land.lng], {
          radius: 8,
          fillColor: "#10b981",
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(map);
        marker.on('click', () => {
          setSelectedLand(land);
          setView('investment');
        });
      });
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white dir-rtl font-['Vazirmatn']">
      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 pt-8">
        <div className="flex justify-center space-x-4 space-x-reverse mb-8">
          <button 
            onClick={() => setView('map')}
            className={`px-8 py-2 rounded-full font-bold transition-all ${view === 'map' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            نقشه بازارچه
          </button>
          <button 
            onClick={() => setView('investment')}
            className={`px-8 py-2 rounded-full font-bold transition-all ${view === 'investment' ? 'bg-green-600 text-white shadow-lg shadow-green-900/20' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
          >
            جزئیات سرمایه‌گذاری
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-12">
        {view === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-2 relative">
              <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 h-[700px] relative" ref={mapRef}>
                <div className="absolute top-4 right-4 z-[1000] bg-slate-900/90 backdrop-blur p-4 rounded-2xl border border-slate-700 shadow-xl">
                  <h3 className="text-sm font-bold text-green-400 mb-1">وضعیت زمین‌های هوشمند</h3>
                  <p className="text-xs text-slate-400">نمایش زنده نقاط فعال در ایران</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[700px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">فرصت‌های فعال</h2>
                <span className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm border border-green-500/20">
                  {lands.length} مورد یافت شد
                </span>
              </div>
              {lands.map(land => (
                <div 
                  key={land.id}
                  onClick={() => { setSelectedLand(land); setView('investment'); }}
                  className={`group p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${selectedLand?.id === land.id ? 'border-green-500 bg-green-500/5 ring-1 ring-green-500/50' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-xl group-hover:text-green-400 transition-colors">{land.name}</h3>
                      <p className="text-sm text-slate-400 mt-1 flex items-center">
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        {land.location}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${land.risk === 'کم‌خطر' ? 'bg-green-500/20 text-green-400' : land.risk === 'متوسط' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                      {land.risk}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm mt-4 pt-4 border-t border-slate-800/50">
                    <div>
                      <p className="text-slate-500 text-xs mb-1">محصول</p>
                      <p className="font-bold">{land.product}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">قیمت پایه</p>
                      <p className="font-bold text-green-400">{land.price}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs mb-1">مساحت</p>
                      <p className="font-bold">{land.area} م²</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto animate-fade-in">
            {!selectedLand ? (
              <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
                <div className="mb-4 inline-flex p-4 bg-slate-800 rounded-full text-slate-500">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                </div>
                <h3 className="text-2xl font-bold mb-2">ابتدا یک زمین را انتخاب کنید</h3>
                <p className="text-slate-400">برای مشاهده تحلیل هوشمند و جزئیات سرمایه‌گذاری، یکی از زمین‌های روی نقشه را برگزینید.</p>
                <button onClick={() => setView('map')} className="mt-6 px-6 py-2 bg-green-600 rounded-xl font-bold hover:bg-green-700 transition-all">بازگشت به نقشه</button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Stats Cards */}
                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-blue-500"></div>
                      <h2 className="text-3xl font-black mb-6 flex items-center">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-500">تحلیل هوشمند سبزآفرین:</span>
                        <span className="mr-2">{selectedLand.name}</span>
                      </h2>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                          <p className="text-slate-400 text-sm mb-1">پیش‌بینی برداشت</p>
                          <p className="text-2xl font-black text-blue-400">{selectedLand.yield} <span className="text-sm font-normal text-slate-500">کیلوگرم/سال</span></p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                          <p className="text-slate-400 text-sm mb-1">بهینه‌سازی مصرف آب</p>
                          <p className="text-2xl font-black text-cyan-400">{selectedLand.waterSaving}</p>
                        </div>
                        <div className="p-4 bg-green-900/20 rounded-2xl border border-green-500/20">
                          <p className="text-green-400/70 text-sm mb-1">سود تخمینی ۵ ساله</p>
                          <p className="text-2xl font-black text-green-400">{selectedLand.profit} <span className="text-sm font-normal text-green-500/50">تومان</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl">
                      <h3 className="text-xl font-bold mb-6">ساختار توزیع ارزش (مدل شاپلی)</h3>
                      <div className="space-y-6">
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-400 bg-green-900/30">تامین‌کننده زمین</span></div>
                            <div className="text-right"><span className="text-sm font-bold inline-block text-green-400">30%</span></div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800"><div style={{ width: "30%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div></div>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-400 bg-blue-900/30">تکنولوژی و هوش مصنوعی</span></div>
                            <div className="text-right"><span className="text-sm font-bold inline-block text-blue-400">25%</span></div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800"><div style={{ width: "25%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"></div></div>
                        </div>
                        <div className="relative pt-1">
                          <div className="flex items-center justify-between mb-2">
                            <div><span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-purple-400 bg-purple-900/30">سرمایه‌گذار (شما)</span></div>
                            <div className="text-right"><span className="text-sm font-bold inline-block text-purple-400">45%</span></div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-800"><div style={{ width: "45%" }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-500"></div></div>
                        </div>
                      </div>
                      <p className="mt-6 text-sm text-slate-500 leading-relaxed bg-slate-800/30 p-4 rounded-xl">
                        مدل شاپلی تضمین می‌کند که سود حاصل از پروژه به صورت کاملاً عادلانه بر اساس میزان مشارکت واقعی هر بخش در خلق ارزش نهایی، بین ذینفعان تقسیم شود.
                      </p>
                    </div>
                  </div>

                  {/* Calculator Column */}
                  <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-xl h-fit sticky top-24">
                    <h3 className="text-xl font-bold mb-6">ماشین حساب سرمایه‌گذار</h3>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm text-slate-400 mb-4">متراژ مورد نظر (متر مربع)</label>
                        <input type="range" min="100" max="1000" step="50" className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-500" />
                        <div className="flex justify-between text-xs mt-3 font-bold text-slate-500">
                          <span>100 م²</span>
                          <span>1000 م²</span>
                        </div>
                      </div>

                      <div className="p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">مبلغ کل سرمایه:</span>
                          <span className="font-bold">۱۵٬۰۰۰٬۰۰۰ <span className="text-[10px] text-slate-500">تومان</span></span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">تعداد توکن سند:</span>
                          <span className="font-bold text-blue-400">۱۵۰ <span className="text-[10px]">SGT</span></span>
                        </div>
                        <div className="pt-4 border-t border-slate-700/50">
                          <p className="text-xs text-slate-400 mb-1">تخمین سود سالیانه شما</p>
                          <p className="text-2xl font-black text-green-400">۳٬۸۵۰٬۰۰۰ <span className="text-xs font-normal">تومان</span></p>
                        </div>
                      </div>

                      <button className="w-full py-4 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl font-black text-lg shadow-lg shadow-green-900/40 hover:scale-[1.02] active:scale-95 transition-all">
                        تایید و صدور سند دیجیتال
                      </button>
                      
                      <p className="text-[10px] text-center text-slate-500">
                        * تمامی اسناد به صورت NFT بر روی بلاک‌چین ثبت شده و قابلیت انتقال دارند.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;