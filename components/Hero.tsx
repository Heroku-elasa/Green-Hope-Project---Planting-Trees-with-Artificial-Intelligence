import React, { useEffect, useRef, useState } from 'react';
import { useLanguage, AppState, Page } from '../types';
import * as geminiService from '../services/geminiService';

// Declare Leaflet global object to avoid TypeScript errors, as it's loaded from a CDN.
declare const L: any;

interface HomePageProps {
  setPage: (page: AppState['page']) => void;
}

// FIX: Replaced JSX.Element with React.ReactElement to fix "Cannot find namespace 'JSX'" error.
const Icon: React.FC<{ iconKey: string; className?: string }> = ({ iconKey, className = "w-12 h-12" }) => {
    const icons: { [key: string]: React.ReactElement } = {
        science: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M22 18.5a2.5 2.5 0 0 1-4 0a2.5 2.5 0 0 1-4 0a2.5 2.5 0 0 1-4 0a2.5 2.5 0 0 1-4 0" />
                <path d="M22 12v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <path d="M6 12v-2" />
                <path d="M10 12v-2" />
                <path d="M14 12v-2" />
                <path d="M18 12v-2" />
                <path d="M4 12v6.5" />
                <path d="M20 12v6.5" />
                <path d="M12 22V6" />
                <path d="M12 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
            </svg>
        ),
        grant: (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
            </svg>
        ),
        education: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M22 10v6M2 10.6V16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-5.4M4 19.5V18c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v1.5M12 14v-.5M4 12V6c0-1.1.9-2 2-2h12c1.1 0 2 .9 2 2v6M18 5l-6 4-6-4"></path>
            </svg>
        ),
        consulting: (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><polyline points="17 11 19 13 23 9"></polyline>
            </svg>
        ),
        publications: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
        ),
        funded: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
        ),
        collaborations: (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path>
            </svg>
        ),
        team: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
        ),
        trained: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path>
            </svg>
        )
    };
    return icons[iconKey] || <div className={className}></div>;
};

const HomePage: React.FC<HomePageProps> = ({ setPage }) => {
  const { t } = useLanguage();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  const handleScrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const services: { iconKey: string; title: string; text: string }[] = t('home.services');
  const portfolioItems: { img: string; title: string; link: string; description: string; tags: string[]; latitude: number; longitude: number; }[] = t('home.portfolioItems');
  const achievements: { iconKey: string; count: number; label: string; suffix: string }[] = t('home.achievements');
  const customerLogos: { img: string; alt: string }[] = t('home.customerLogos');
  
  const initialPosts: { img?: string; title: string; date: string; comments: number; link: string }[] = t('home.latestPosts');
  const [latestPosts, setLatestPosts] = useState(initialPosts);

  useEffect(() => {
    const generateMissingImages = async () => {
        const postsToUpdate = latestPosts.map(async (post, index) => {
            if (!post.img) {
                try {
                    // Use a fallback if image generation fails to prevent site crash
                    const imageUrl = await geminiService.generateBlogImage(post.title).catch(() => "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=1000");
                    return { ...post, img: imageUrl };
                } catch (error) {
                    console.error(`Failed to generate image for post: "${post.title}"`, error);
                    return post; // Return original post on error
                }
            }
            return post;
        });

        const updatedPosts = await Promise.all(postsToUpdate);
        setLatestPosts(updatedPosts);
    };

    if (latestPosts.some(p => !p.img)) {
        generateMissingImages();
    }
  }, []); // Run only once on mount


  const servicePageMap: { [key: string]: Page } = {
      science: 'siteSelector',
      grant: 'grant',
      education: 'generator',
      consulting: 'video',
  };
  
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
        const map = L.map(mapRef.current, {
            center: [15, 15],
            zoom: 2,
            scrollWheelZoom: false,
            zoomControl: false,
        });
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 10,
        }).addTo(map);
        
        const mapIconSvg = `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill="#10B981"><g><path d="M16 2.5c-4.96 0-8.99 4.03-8.99 8.99 0 1.95.62 3.75 1.68 5.24 0 .01 0 .01 0 .01.01.01.01.02.02.03C9.88 18.25 16 29.5 16 29.5s6.12-11.25 7.29-12.73c.01-.01.01-.02.02-.03 0 0 0-.01 0-.01 1.06-1.49 1.68-3.29 1.68-5.24C24.99 6.53 20.96 2.5 16 2.5zm0 12.25a3.26 3.26 0 110-6.52 3.26 3.26 0 010 6.52z"></path></g></svg>`;
        const mapIcon = L.icon({
            iconUrl: 'data:image/svg+xml;base64,' + btoa(mapIconSvg),
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });

        portfolioItems.forEach(item => {
            if (item.latitude && item.longitude) {
                const marker = L.marker([item.latitude, item.longitude], { icon: mapIcon }).addTo(map);
                marker.bindPopup(`<b>${item.title}</b><p>${item.description.substring(0, 100)}...</p>`);
            }
        });
    }
  }, [portfolioItems]);

  return (
    <div className="animate-fade-in text-white">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[500px] flex items-center justify-center text-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute z-0 w-auto min-w-full min-h-full max-w-none"
          src={t('hero.videoUrl')}
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-slate-900/70"></div>
        <div className="relative z-10 px-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 tracking-tight"
              dangerouslySetInnerHTML={{ __html: t('hero.title') }} />
          <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('hero.subtitle')}</p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => setPage('projects')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 via-purple-700 to-pink-700 text-white font-semibold rounded-md shadow-lg hover:scale-105 transition-transform"
            >
              {t('hero.button1')}
            </button>
            <button
              onClick={() => handleScrollTo('footer')}
              className="px-8 py-3 bg-slate-700/50 border border-slate-600 text-white font-semibold rounded-md shadow-lg hover:bg-slate-700 transition-colors"
            >
              {t('hero.button2')}
            </button>
          </div>
        </div>
      </section>

      {/* Intro Section */}
      <section className="py-16 sm:py-24 bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
                {t('home.introTitle')}
            </p>
        </div>
      </section>
      
      {/* Services Section */}
      <section id="services" className="py-16 sm:py-24 bg-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('home.servicesTitle')}</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {services.map((service, index) => (
              <button 
                key={index}
                onClick={() => setPage(servicePageMap[service.iconKey])}
                className="text-center p-6 bg-slate-900/60 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 transition-all duration-300 hover:border-pink-500/50 hover:bg-slate-800/80 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-purple-800 to-pink-800 mx-auto text-pink-300">
                    <Icon iconKey={service.iconKey} className="w-8 h-8"/>
                </div>
                <h3 className="mt-6 text-lg font-medium text-white">{service.title}</h3>
                <p className="mt-2 text-base text-gray-400">{service.text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      <section className="py-16 sm:py-24 bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('home.portfolioTitle')}</h2>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-2">
            {portfolioItems.slice(0, 4).map((item, index) => (
                <div key={index} className="group bg-slate-800/70 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700 overflow-hidden flex flex-col">
                    <div className="relative h-64 w-full overflow-hidden">
                        <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                        <h3 className="text-xl font-bold text-pink-400 mb-2">{item.title}</h3>
                        <p className="text-gray-300 mb-4 flex-grow text-sm">{item.description}</p>
                         <div className="flex flex-wrap gap-2">
                            {item.tags.map(tag => (
                                <span key={tag} className="bg-pink-500/20 text-pink-300 text-xs font-semibold px-2 py-1 rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                </div>
            ))}
          </div>
           <div className="mt-12 text-center">
                <button onClick={() => setPage('projects')} className="px-8 py-3 border border-pink-500/50 text-pink-300 font-semibold rounded-md shadow-lg hover:bg-pink-500/20 transition-colors">
                    {t('hero.button1')}
                </button>
           </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-16 sm:py-24 bg-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('home.achievementsTitle')}</h2>
            </div>
            <div className="mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 text-center">
                {achievements.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <Icon iconKey={item.iconKey} className="w-10 h-10 text-pink-400"/>
                        <p className="text-4xl font-bold text-white mt-2">{item.count}{item.suffix}</p>
                        <p className="text-sm text-gray-400 mt-1">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>
      
      {/* Map Section */}
      <section className="py-16 sm:py-24 bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('home.map.title')}</h2>
                <p className="mt-4 text-lg text-gray-300 max-w-2xl mx-auto">{t('home.map.subtitle')}</p>
            </div>
            <div ref={mapRef} className="h-[60vh] w-full rounded-lg bg-slate-800 border border-slate-700 shadow-lg" />
            <div className="mt-12 text-center">
                <button onClick={() => setPage('siteSelector')} className="px-8 py-3 bg-gradient-to-r from-teal-600 to-sky-700 text-white font-semibold rounded-md shadow-lg hover:scale-105 transition-transform">
                    {t('home.map.button')}
                </button>
           </div>
        </div>
      </section>


      {/* Partners Section */}
      <section className="py-16 sm:py-24 bg-slate-800/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('home.customersTitle')}</h2>
            </div>
            <div className="mt-12 flow-root">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8 items-center">
                    {customerLogos.map((logo, index) => (
                        <div key={index} className="flex justify-center">
                            <img className="max-h-12 opacity-60 hover:opacity-100 transition-opacity" src={logo.img} alt={logo.alt} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </section>

      {/* Blog/Insights Section */}
      <section className="py-16 sm:py-24 bg-slate-900">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">{t('home.calendarTitle')}</h2>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                {latestPosts.map((post, index) => (
                    <div key={index} className="group flex flex-col overflow-hidden rounded-lg shadow-lg bg-slate-800/70 border border-slate-700">
                        <div className="flex-shrink-0 h-48 w-full bg-slate-700 animate-pulse">
                            {post.img && (
                               <img className="h-48 w-full object-cover" src={post.img} alt={post.title} />
                            )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between p-6">
                            <div className="flex-1">
                                <a href={post.link} className="mt-2 block">
                                    <p className="text-xl font-semibold text-gray-100 group-hover:text-pink-400 transition-colors">{post.title}</p>
                                </a>
                            </div>
                            <div className="mt-6 flex items-center">
                                <div className="text-sm text-gray-500">
                                    <time dateTime={post.date}>{post.date}</time>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
          </div>
      </section>
    </div>
  );
};

export default HomePage;