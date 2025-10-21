import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

// Basic Types
export type Language = 'en' | 'fa' | 'ar';

export interface GroundingSource {
    uri: string;
    title: string;
    type: 'web' | 'maps';
}

// Green Hope App Types
export interface PlantingSuggestion {
    suitableSpecies: {
        name: string;
        reason: string;
        estimatedCostPerTree: {
            min: number;
            max: number;
        };
        bestPlantingTime: string;
        initialWateringNeeds: string;
        protectionDuration: string;
    }[];
    summary: string;
    sources?: GroundingSource[];
}

export interface VegetationAnalysis {
    coveragePercentage: number; // Will now be used for qualitative description rather than a strict number from the model.
    reforestationNeed: 'Low' | 'Medium' | 'High';
    analysis: string;
    sources?: GroundingSource[];
}

export interface RiskAnalysis {
    risks: {
        name:string;
        severity: 'Low' | 'Medium' | 'High';
        explanation: string;
    }[];
    overallRiskScore: number;
    sources?: GroundingSource[];
}

export interface FullAnalysis {
    plantingSuggestion: Omit<PlantingSuggestion, 'sources'>;
    vegetationAnalysis: Omit<VegetationAnalysis, 'sources'>;
    riskAnalysis: Omit<RiskAnalysis, 'sources'>;
    sources?: GroundingSource[];
}

export interface CrowdfundingCampaign {
    title: string;
    description: string;
}

export interface PlantingArea {
    location: {
        lat: number;
        lng: number;
    };
    reason: string;
}

export interface ReforestationArea {
    location: {
        lat: number;
        lng: number;
    };
    need: 'High' | 'Medium' | 'Low';
    reason: string;
}

export interface HomePlant {
    name: string;
    type: string;
    careInstructions: string;
    suitableFor: string;
}

export interface WeatherData {
    temperature: number;
    precipitationProbability: number;
    windSpeed: number;
    summary: string;
    sources?: GroundingSource[];
}


// --- I18N CONTENT ---
const translations: Record<Language, Record<string, any>> = {
    fa: {
        header: {
            title: 'پروژه امید سبز',
        },
        tabs: {
            reforestation: 'تحلیل جنگل‌کاری',
            homeGardening: 'باغبانی خانگی',
        },
        hero: {
            title: 'آینده‌ای سبزتر، یک درخت در هر زمان',
            subtitle: 'از هوش مصنوعی برای یافتن بهترین مکان‌ها برای کاشت درخت، تحلیل ریسک‌های زیست‌محیطی و جمع‌آوری سرمایه برای پروژه‌های احیای جنگل در سراسر جهان استفاده کنید.',
        },
        main: {
            instructions: 'برای شروع، روی نقشه کلیک کنید یا مکانی را برای تحلیل جستجو نمایید.',
            selectedLocation: 'مکان انتخاب شده:',
            analyzeLocation: 'انجام تحلیل کامل',
            loadingMap: 'در حال بارگذاری نقشه...',
            numberOfTreesLabel: 'تعداد درخت برای تحلیل',
            reforestationGoalLabel: 'هدف کلی جنگل‌کاری',
            analysisProgress: 'پیشرفت تحلیل',
            searchPlaceholder: 'جستجوی یک مکان...',
            searchButtonTitle: 'جستجو',
            manualInputLabel: 'یا مختصات را دستی وارد کنید',
            latLabel: 'عرض جغرافیایی',
            lngLabel: 'طول جغرافیایی',
            setLocationButton: 'تنظیم مکان',
            findAreas: 'یافتن مناطق مناسب کاشت',
            findAreasDescription: 'یافتن چندین نقطه کاشت مناسب در نمای فعلی نقشه.',
            areaSuggestion: 'منطقه پیشنهادی',
            clickForDetails: 'روی یک نشانگر کلیک کنید تا برای تحلیل دقیق انتخاب شود.',
            useGroundingTitle: 'تحلیل به‌روز',
            useGroundingDesc: 'برای داده‌های جدید از جستجوی گوگل استفاده می‌کند',
            showNeeds: 'نمایش نیاز به جنگل‌کاری',
            hideNeeds: 'پنهان کردن نیاز به جنگل‌کاری',
            findingNeeds: 'در حال یافتن مناطق بحرانی...',
        },
        results: {
            suggestionTitle: 'پیشنهاد کاشت درخت',
            vegetationTitle: 'تحلیل پوشش گیاهی',
            riskTitle: 'تحلیل ریسک‌های زیست‌محیطی',
            species: 'گونه‌های مناسب',
            reason: 'دلیل',
            cost: 'هزینه تخمین زده شده',
            summary: 'خلاصه',
            coverage: 'توصیف پوشش گیاهی',
            need: 'نیاز به جنگل‌کاری مجدد',
            analysis: 'تحلیل',
            riskName: 'ریسک',
            severity: 'شدت',
            explanation: 'توضیحات',
            overallScore: 'امتیاز کلی ریسک',
            startCrowdfunding: 'شروع کمپین جمع‌آوری کمک',
            costPerTree: 'هزینه هر درخت',
            totalCost: 'هزینه کل تخمینی ({count} درخت)',
            bestPlantingTime: 'بهترین زمان کاشت',
            wateringNeeds: 'نیاز آبیاری اولیه',
            protectionDuration: 'مدت زمان محافظت',
            sources: 'منابع',
        },
        weather: {
            title: 'آب و هوای زنده',
            temperature: 'دما',
            precipitation: 'احتمال بارش',
            windSpeed: 'سرعت باد',
            refresh: 'تازه‌سازی',
        },
        campaign: {
            title: 'کمپین شما آماده است!',
            description: 'از متن زیر برای راه‌اندازی کمپین جمع‌آوری کمک‌های مالی خود استفاده کنید.',
            donate: 'هم اکنون حمایت کنید',
            goal: 'هدف: ۱۰۰۰ درخت',
        },
        homeGardening: {
            title: 'راهنمای باغبانی خانگی',
            description: 'برای گیاهانی که می‌توانید در خانه پرورش دهید، پیشنهادهایی دریافت کنید. شرایط رشد خود را انتخاب کنید تا توصیه‌های متناسبی دریافت نمایید.',
            conditionLabel: 'شرایط رشد خود را انتخاب کنید:',
            conditions: {
                sunnyBalcony: 'بالکن آفتابی',
                shadedPatio: 'پاسیو / حیاط سایه‌دار',
                indoorLowLight: 'داخل خانه (نور کم)',
                indoorHighLight: 'داخل خانه (نور زیاد)',
            },
            getSuggestions: 'دریافت پیشنهاد گیاه',
            resultsTitle: 'پیشنهادهای گیاه برای شما',
            plantType: 'نوع',
            careInstructions: 'دستورالعمل مراقبت',
            suitableFor: 'مناسب برای',
        },
        footer: {
            copyright: '© ۲۰۲۴ پروژه امید سبز. تمام حقوق محفوظ است.',
        },
        loading: 'در حال تحلیل...',
        error: 'خطایی رخ داد. لطفاً دوباره تلاش کنید.',
        networkError: 'خطای شبکه رخ داد. لطفاً اتصال خود را بررسی کرده و دوباره تلاش کنید.',
        mapError: {
            title: 'خطای نقشه',
            body: 'نقشه بارگذاری نشد. لطفاً اتصال اینترنت خود را بررسی کرده و دوباره تلاش کنید.',
            init: 'نقشه به درستی راه‌اندازی نشد. لطفاً صفحه را رفرش کنید.',
            fallback: 'نقشه تعاملی بارگیری نشد. لطفاً از جستجو یا ورود دستی مختصات برای انتخاب مکان استفاده کنید.',
            scriptLoadError: 'اسکریپت نقشه بارگذاری نشد. این مشکل ممکن است به دلیل مشکلات شبکه یا مسدودکننده‌های تبلیغات باشد. لطفاً اتصال خود را بررسی کنید.',
            locationNotFound: 'مکان پیدا نشد: {query}',
            searchError: 'خطایی در هنگام جستجو رخ داد.',
            geocoderNotAvailable: 'سرویس جستجوی موقعیت در دسترس نیست.',
            manualInputPrompt: 'نقشه بارگذاری نشد. می‌توانید مختصات را به صورت دستی وارد کنید.',
            invalidLat: 'عرض جغرافیایی باید بین -۹۰ و ۹۰ باشد.',
            invalidLng: 'طول جغرافیایی باید بین -۱۸۰ و ۱۸۰ باشد.',
        },
        mapLayers: {
            title: 'لایه‌های نقشه',
            satellite: 'ماهواره',
            terrain: 'عوارض زمین',
            roadmap: 'جاده',
        },
        mapDataLayers: {
            title: "لایه های داده",
            gfc: "هشدارهای تغییرات جهانی جنگل"
        },
        mapLegend: {
            title: 'راهنما',
            high: 'ریسک / نیاز بالا',
            medium: 'ریسک / نیاز متوسط',
            low: 'ریسک / نیاز کم',
        },
        quotaErrorModal: {
            title: 'محدودیت استفاده از API',
            body: 'به نظر می‌رسد شما به محدودیت استفاده از API رسیده‌اید. لطفاً صورتحساب خود را بررسی کرده و یا بعداً دوباره تلاش کنید.',
            cta: 'بررسی صورتحساب',
            close: 'بستن',
        },
    },
    en: {
        header: {
            title: 'Green Hope Initiative',
        },
        tabs: {
            reforestation: 'Reforestation Analysis',
            homeGardening: 'Home Gardening',
        },
        hero: {
            title: 'A Greener Future, One Tree at a Time',
            subtitle: 'Use AI to find the best locations for planting trees, analyze environmental risks, and raise funds for reforestation projects worldwide.',
        },
        main: {
            instructions: 'Click on the map or search for a location to begin analysis.',
            selectedLocation: 'Selected Location:',
            analyzeLocation: 'Perform Full Analysis',
            loadingMap: 'Loading Map...',
            numberOfTreesLabel: 'Number of Trees for Analysis',
            reforestationGoalLabel: 'Overall Reforestation Goal',
            analysisProgress: 'Analysis Progress',
            searchPlaceholder: 'Search for a location...',
            searchButtonTitle: 'Search',
            manualInputLabel: 'Or enter coordinates manually',
            latLabel: 'Latitude',
            lngLabel: 'Longitude',
            setLocationButton: 'Set Location',
            findAreas: 'Find Suitable Planting Areas',
            findAreasDescription: 'Find multiple suitable planting spots within the current map view.',
            areaSuggestion: 'Suggested Area',
            clickForDetails: 'Click a marker to select it for detailed analysis.',
            useGroundingTitle: 'Up-to-date Analysis',
            useGroundingDesc: 'Uses Google Search for recent data',
            showNeeds: 'Show Reforestation Needs',
            hideNeeds: 'Hide Reforestation Needs',
            findingNeeds: 'Finding critical areas...',
        },
        results: {
            suggestionTitle: 'Tree Planting Suggestion',
            vegetationTitle: 'Vegetation Analysis',
            riskTitle: 'Environmental Risk Analysis',
            species: 'Suitable Species',
            reason: 'Reason',
            cost: 'Estimated Cost',
            summary: 'Summary',
            coverage: 'Vegetation Description',
            need: 'Reforestation Need',
            analysis: 'Analysis',
            riskName: 'Risk',
            severity: 'Severity',
            explanation: 'Explanation',
            overallScore: 'Overall Risk Score',
            startCrowdfunding: 'Start Crowdfunding Campaign',
            costPerTree: 'Cost Per Tree',
            totalCost: 'Total Estimated Cost ({count} trees)',
            bestPlantingTime: 'Best Planting Time',
            wateringNeeds: 'Initial Watering Needs',
            protectionDuration: 'Protection Duration',
            sources: 'Sources',
        },
        weather: {
            title: 'Live Weather',
            temperature: 'Temperature',
            precipitation: 'Precipitation',
            windSpeed: 'Wind Speed',
            refresh: 'Refresh',
        },
        campaign: {
            title: 'Your Campaign is Ready!',
            description: 'Use the text below to launch your fundraising campaign.',
            donate: 'Donate Now',
            goal: 'Goal: 1,000 Trees',
        },
        homeGardening: {
            title: 'Home Gardening Guide',
            description: 'Get suggestions for plants you can grow at home. Select your growing conditions to receive tailored recommendations.',
            conditionLabel: 'Select your growing conditions:',
            conditions: {
                sunnyBalcony: 'Sunny Balcony',
                shadedPatio: 'Shaded Patio / Yard',
                indoorLowLight: 'Indoor (Low Light)',
                indoorHighLight: 'Indoor (High Light)',
            },
            getSuggestions: 'Get Plant Suggestions',
            resultsTitle: 'Your Plant Suggestions',
            plantType: 'Type',
            careInstructions: 'Care Instructions',
            suitableFor: 'Best For',
        },
        footer: {
            copyright: '© 2024 Green Hope Initiative. All rights reserved.',
        },
        loading: 'Analyzing...',
        error: 'An error occurred. Please try again.',
        networkError: 'A network error occurred. Please check your connection and try again.',
        mapError: {
            title: 'Map Error',
            body: 'The map could not be loaded. Please check your network connection and try again.',
            init: 'The map did not initialize correctly. Please refresh the page.',
            fallback: 'The interactive map failed to load. Please use the search or manual coordinate entry to select a location.',
            scriptLoadError: 'Failed to load the map script. This may be due to network issues or ad-blockers. Please check your connection.',
            locationNotFound: 'Could not find location: {query}',
            searchError: 'An error occurred during search.',
            geocoderNotAvailable: 'The location search service is not available.',
            manualInputPrompt: 'Map failed to load. You can enter coordinates manually.',
            invalidLat: 'Latitude must be between -90 and 90.',
            invalidLng: 'Longitude must be between -180 and 180.',
        },
        mapLayers: {
            title: 'Map Layers',
            satellite: 'Satellite',
            terrain: 'Terrain',
            roadmap: 'Roadmap',
        },
        mapDataLayers: {
            title: "Data Layers",
            gfc: "Global Forest Change Alerts"
        },
        mapLegend: {
            title: 'Legend',
            high: 'High Risk / Need',
            medium: 'Medium Risk / Need',
            low: 'Low Risk / Need',
        },
        quotaErrorModal: {
            title: 'API Quota Exceeded',
            body: 'You seem to have exceeded your API usage quota. Please check your billing or try again later.',
            cta: 'Check Billing',
            close: 'Close',
        },
    },
    ar: {
        header: {
            title: 'مبادرة الأمل الأخضر',
        },
        tabs: {
            reforestation: 'تحليل إعادة التحريج',
            homeGardening: 'البستنة المنزلية',
        },
        hero: {
            title: 'مستقبل أكثر اخضرارًا، شجرة في كل مرة',
            subtitle: 'استخدم الذكاء الاصطناعي للعثور على أفضل المواقع لزراعة الأشجار، وتحليل المخاطر البيئية، وجمع الأموال لمشاريع إعادة التحريج في جميع أنحاء العالم.',
        },
        main: {
            instructions: 'انقر على الخريطة أو ابحث عن موقع لبدء التحليل.',
            selectedLocation: 'الموقع المحدد:',
            analyzeLocation: 'إجراء تحليل كامل',
            loadingMap: 'جاري تحميل الخريطة...',
            numberOfTreesLabel: 'عدد الأشجار للتحليل',
            reforestationGoalLabel: 'الهدف العام لإعادة التحريج',
            analysisProgress: 'تقدم التحليل',
            searchPlaceholder: 'ابحث عن موقع...',
            searchButtonTitle: 'بحث',
            manualInputLabel: 'أو أدخل الإحداثيات يدويًا',
            latLabel: 'خط العرض',
            lngLabel: 'خط الطول',
            setLocationButton: 'تحديد الموقع',
            findAreas: 'البحث عن مناطق زراعة مناسبة',
            findAreasDescription: 'البحث عن عدة نقاط زراعة مناسبة ضمن عرض الخريطة الحالي.',
            areaSuggestion: 'منطقة مقترحة',
            clickForDetails: 'انقر على علامة لتحديدها للتحليل التفصيلي.',
            useGroundingTitle: 'تحليل محدّث',
            useGroundingDesc: 'يستخدم بحث جوجل للحصول على بيانات حديثة',
            showNeeds: 'إظهار مناطق الحاجة للتحريج',
            hideNeeds: 'إخفاء مناطق الحاجة للتحريج',
            findingNeeds: 'جاري البحث عن المناطق الحرجة...',
        },
        results: {
            suggestionTitle: 'اقتراح زراعة الأشجار',
            vegetationTitle: 'تحليل الغطاء النباتي',
            riskTitle: 'تحليل المخاطر البيئية',
            species: 'الأنواع المناسبة',
            reason: 'السبب',
            cost: 'التكلفة التقديرية',
            summary: 'ملخص',
            coverage: 'وصف الغطاء النباتي',
            need: 'الحاجة إلى إعادة التحريج',
            analysis: 'تحليل',
            riskName: 'الخطر',
            severity: 'الشدة',
            explanation: 'شرح',
            overallScore: 'درجة المخاطر الإجمالية',
            startCrowdfunding: 'بدء حملة تمويل جماعي',
            costPerTree: 'تكلفة الشجرة الواحدة',
            totalCost: 'التكلفة الإجمالية التقديرية ({count} شجرة)',
            bestPlantingTime: 'أفضل وقت للزراعة',
            wateringNeeds: 'احتياجات الري الأولية',
            protectionDuration: 'مدة الحماية',
            sources: 'مصادر',
        },
        weather: {
            title: 'الطقس المباشر',
            temperature: 'درجة الحرارة',
            precipitation: 'احتمال هطول الأمطار',
            windSpeed: 'سرعة الرياح',
            refresh: 'تحديث',
        },
        campaign: {
            title: 'حملتك جاهزة!',
            description: 'استخدم النص أدناه لإطلاق حملة جمع التبرعات الخاصة بك.',
            donate: 'تبرع الآن',
            goal: 'الهدف: ١٠٠٠ شجرة',
        },
        homeGardening: {
            title: 'دليل البستنة المنزلية',
            description: 'احصل على اقتراحات لنباتات يمكنك زراعتها في المنزل. اختر ظروف النمو لديك لتلقي توصيات مخصصة.',
            conditionLabel: 'اختر ظروف النمو لديك:',
            conditions: {
                sunnyBalcony: 'شرفة مشمسة',
                shadedPatio: 'فناء / حديقة مظللة',
                indoorLowLight: 'داخل المنزل (إضاءة منخفضة)',
                indoorHighLight: 'داخل المنزل (إضاءة عالية)',
            },
            getSuggestions: 'احصل على اقتراحات نباتات',
            resultsTitle: 'اقتراحات النباتات لك',
            plantType: 'النوع',
            careInstructions: 'تعليمات العناية',
            suitableFor: 'الأنسب لـ',
        },
        footer: {
            copyright: '© 2024 مبادرة الأمل الأخضر. جميع الحقوق محفوظة.',
        },
        loading: 'جاري التحليل...',
        error: 'حدث خطأ. يرجى المحاولة مرة أخرى.',
        networkError: 'حدث خطأ في الشبكة. يرجى التحقق من اتصالك والمحاولة مرة أخرى.',
        mapError: {
            title: 'خطأ في الخريطة',
            body: 'تعذر تحميل الخريطة. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.',
            init: 'لم يتم تهيئة الخريطة بشكل صحيح. يرجى تحديث الصفحة.',
            fallback: 'فشل تحميل الخريطة التفاعلية. يرجى استخدام البحث أو إدخال الإحداثيات اليدوي لتحديد موقع.',
            scriptLoadError: 'فشل تحميل نص الخرائط. قد يكون هذا بسبب مشاكل في الشبكة أو أدوات حظر الإعلانات. يرجى التحقق من اتصالك.',
            locationNotFound: 'تعذر العثور على الموقع: {query}',
            searchError: 'حدث خطأ أثناء البحث.',
            geocoderNotAvailable: 'خدمة البحث عن المواقع غير متوفرة.',
            manualInputPrompt: 'فشل تحميل الخريطة. يمكنك إدخال الإحداثيات يدويًا.',
            invalidLat: 'يجب أن يكون خط العرض بين -٩٠ و ٩٠.',
            invalidLng: 'يجب أن يكون خط الطول بين -١٨٠ و ١٨٠.',
        },
        mapLayers: {
            title: 'طبقات الخريطة',
            satellite: 'قمر صناعي',
            terrain: 'تضاريس',
            roadmap: 'خريطة الطريق',
        },
        mapDataLayers: {
            title: "طبقات البيانات",
            gfc: "تنبيهات تغير الغابات العالمي"
        },
        mapLegend: {
            title: 'دليل',
            high: 'خطر / حاجة عالية',
            medium: 'خطر / حاجة متوسطة',
            low: 'خطر / حاجة منخفضة',
        },
        quotaErrorModal: {
            title: 'تم تجاوز حصة واجهة برمجة التطبيقات',
            body: 'يبدو أنك تجاوزت حصة استخدام واجهة برمجة التطبيقات. يرجى التحقق من الفواتير أو المحاولة مرة أخرى لاحقًا.',
            cta: 'التحقق من الفواتير',
            close: 'إغلاق',
        },
    },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string | number>) => any;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('fa');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    const dir = lang === 'fa' || lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    if (dir === 'rtl') {
        document.body.classList.add('rtl');
    } else {
        document.body.classList.remove('rtl');
    }
  };
  
  useEffect(() => {
    setLanguage('fa');
  }, []);

  const t = useCallback((key: string, replacements?: Record<string, string | number>): any => {
    const keys = key.split('.');
    let result = translations[language];
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        let fallbackResult = translations.en;
        for (const fk of keys) {
            if (fallbackResult && typeof fallbackResult === 'object' && fk in fallbackResult) {
                fallbackResult = fallbackResult[fk];
            } else {
                return key;
            }
        }
        result = fallbackResult;
        break;
      }
    }

    if (typeof result === 'string' && replacements) {
        let replacedString = result;
        for (const placeholder in replacements) {
            replacedString = replacedString.replace(`{${placeholder}}`, String(replacements[placeholder]));
        }
        return replacedString;
    }
    
    return result || key;
  }, [language]);

  const dir = language === 'fa' || language === 'ar' ? 'rtl' : 'ltr';

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t, dir } }, children);
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
