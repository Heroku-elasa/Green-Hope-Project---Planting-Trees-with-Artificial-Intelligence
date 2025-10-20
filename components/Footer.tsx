import React from 'react';
import { useLanguage } from '../types';

const SiteFooter: React.FC = () => {
    const { t } = useLanguage();
    // FIX: Type assertion is now valid because the `t` function's return type is `any`.
    const quickLinks: { text: string; link: string }[] = t('footer.quickLinks');
    const mainPhone = (t('footer.phone') || '').replace(/[^\d+]/g, '');


    return (
        <footer id="footer" className="bg-slate-900 text-gray-400 border-t border-slate-800">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {/* Column 1: Logo & Description */}
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold tracking-tight text-white bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">Green Hope Project</h2>
                        <p className="text-sm leading-relaxed">{t('footer.description')}</p>
                    </div>
                    {/* Column 2: Contact Info */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white border-b-2 border-purple-800/70 pb-2">{t('footer.contactTitle')}</h2>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start">
                                <span className="mt-1 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0">📧</span>
                                <a href={`mailto:${t('footer.email')}`} className="hover:text-white transition-colors font-inter">{t('footer.email')}</a>
                            </li>
                            <li className="flex items-start">
                                <span className="mt-1 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0">📞</span>
                                <a href={`tel:${mainPhone}`} className="hover:text-white transition-colors">{t('footer.phone')}</a>
                            </li>
                            <li className="flex items-start">
                                <span className="mt-1 mr-3 rtl:ml-3 rtl:mr-0 flex-shrink-0">📍</span>
                                <span>{t('footer.address')}</span>
                            </li>
                        </ul>
                         <h2 className="text-lg font-semibold text-white border-b-2 border-purple-800/70 pb-2 pt-4">{t('footer.socialMediaTitle')}</h2>
                         <div className="flex items-center space-x-4 rtl:space-x-reverse pt-2">
                            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title={t('footer.instagram')}>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.012-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.08 2.525c.636-.247 1.363-.416 2.427-.465C9.53 2.013 9.884 2 12.315 2zm0 1.62c-2.403 0-2.741.01-3.72.058-1.002.046-1.634.21-2.126.41a3.272 3.272 0 00-1.18 1.18c-.2.492-.364 1.124-.41 2.126-.048.978-.058 1.316-.058 3.72s.01 2.742.058 3.72c.046 1.002.21 1.634.41 2.126a3.272 3.272 0 001.18 1.18c.492.2.924.364 2.126.41.978.048 1.316.058 3.72.058 2.403 0 2.741-.01 3.72-.058 1.002-.046 1.634-.21 2.126-.41a3.272 3.272 0 001.18-1.18c.2-.492.364-1.124.41-2.126.048-.978.058-1.316-.058-3.72s-.01-2.742-.058-3.72c-.046-1.002-.21-1.634-.41-2.126a3.272 3.272 0 00-1.18-1.18c-.492-.2-.924-.364-2.126-.41-.978-.048-1.316-.058-3.72-.058zM12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.652a3.517 3.517 0 110-7.034 3.517 3.517 0 010 7.034zM16.969 6.865a1.25 1.25 0 100 2.5 1.25 1.25 0 000-2.5z" clipRule="evenodd" /></svg>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title={t('footer.linkedin')}>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path></svg>
                            </a>
                            <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" title={t('footer.facebook')}>
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" /></svg>
                            </a>
                         </div>
                    </div>

                    {/* Column 3: Quick Links */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white border-b-2 border-purple-800/70 pb-2">{t('footer.quickLinksTitle')}</h2>
                        <ul className="space-y-3 text-sm">
                            {quickLinks.map(link => (
                                <li key={link.text}>
                                    <a href={link.link} className="hover:text-white transition-colors">{link.text}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 4: Location */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white border-b-2 border-purple-800/70 pb-2">{t('footer.addressTitle')}</h2>
                        <p className="text-sm">{t('footer.address')}</p>
                    </div>
                </div>
                <div className="mt-16 pt-8 border-t border-slate-800 text-center text-sm">
                    <p>{t('footer.copyright')}</p>
                </div>
            </div>
        </footer>
    );
};

export default SiteFooter;
