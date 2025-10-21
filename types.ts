import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';

// Basic Types
export type Language = 'en' | 'fa' | 'ar';

export interface GroundingChunk {
    web?: {
        uri: string;
        title: string;
    };
    maps?: {
        uri: string;
        title: string;
        placeAnswerSources?: {
            reviewSnippets: {
                uri: string;
                text: string;
                author: string;
                rating: number;
            }[];
        }[];
    };
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
    grounding?: GroundingChunk[];
}

export interface VegetationAnalysis {
    coveragePercentage: number;
    reforestationNeed: 'Low' | 'Medium' | 'High';
    analysis: string;
    grounding?: GroundingChunk[];
}

export interface RiskAnalysis {
    risks: {
        name:string;
        severity: 'Low' | 'Medium' | 'High';
        explanation: string;
        location?: {
            lat: number;
            lng: number;
        };
    }[];
    overallRiskScore: number;
    grounding?: GroundingChunk[];
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

export interface HomePlant {
    name: string;
    type: string;
    careInstructions: string;
    suitableFor: string;
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
            startupShowcase: 'نمایش استارتاپ‌ها',
        },
        hero: {
            title: 'آینده‌ای سبزتر، یک درخت در هر زمان',
            subtitle: 'از هوش مصنوعی برای یافتن بهترین مکان‌ها برای کاشت درخت، تحلیل ریسک‌های زیست‌محیطی و جمع‌آوری سرمایه برای پروژه‌های احیای جنگل در سراسر جهان استفاده کنید.',
        },
        main: {
            instructions: 'برای شروع، روی نقشه کلیک کنید یا مکانی را برای تحلیل جستجو نمایید.',
            selectedLocation: 'مکان انتخاب شده:',
            analyzeLocation: 'انجام تحلیل کامل',
            suggestForToday: 'پیشنهاد کاشت برای امروز',
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
            findAreas: 'یافتن مناطق مناسب',
            findAreasDescription: 'یافتن چندین نقطه کاشت مناسب در نمای فعلی نقشه.',
            areaSuggestion: 'منطقه پیشنهادی',
            clickForDetails: 'روی یک نشانگر کلیک کنید تا برای تحلیل دقیق انتخاب شود.',
            selectForAnalysis: 'انتخاب برای تحلیل',
            selectAreaOnMap: 'انتخاب منطقه',
            analyzeSelection: 'تحلیل منطقه انتخاب شده؟',
            analyze: 'تحلیل',
            locateMe: 'مکان‌یابی من',
            currentTime: 'زمان فعلی',
        },
        results: {
            suggestionTitle: 'پیشنهاد کاشت درخت',
            vegetationTitle: 'تحلیل پوشش گیاهی',
            riskTitle: 'تحلیل ریسک‌های زیست‌محیطی',
            vegetationTooltip: 'این تحلیل درصد پوشش گیاهی فعلی و نیاز به کاشت درختان جدید را ارزیابی می‌کند.',
            riskTooltip: 'این تحلیل خطرات بالقوه مانند خشکسالی، آتش‌سوزی یا مشکلات قانونی مرتبط با پروژه شما را شناسایی می‌کند.',
            species: 'گونه‌های مناسب',
            reason: 'دلیل',
            cost: 'هزینه تخمین زده شده',
            summary: 'خلاصه',
            coverage: 'درصد پوشش گیاهی',
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
        startupShowcase: {
            title: 'نمایش استارتاپ‌های نوآور',
            description: 'با استارتاپ‌های پیشرو در زمینه فناوری سبز و پایداری آشنا شوید.',
            learnMore: 'بیشتر بدانید',
            startups: [
                {
                    name: 'پایش کربن',
                    description: 'استفاده از ماهواره و هوش مصنوعی برای نظارت دقیق بر جنگل‌های جهان و اندازه‌گیری جذب کربن.',
                    icon: 'fa-satellite-dish',
                    link: '#',
                },
                {
                    name: 'آبیاری هوشمند',
                    description: 'سیستم‌های آبیاری مبتنی بر اینترنت اشیاء که مصرف آب در کشاورزی و جنگل‌کاری را تا ۵۰٪ کاهش می‌دهد.',
                    icon: 'fa-water',
                    link: '#',
                },
                {
                    name: 'پهپادهای بذرکار',
                    description: 'ناوگانی از پهپادهای خودکار که قادر به کاشت سریع هزاران بذر در مناطق صعب‌العبور هستند.',
                    icon: 'fa-helicopter',
                    link: '#',
                },
            ]
        },
        footer: {
            copyright: '© ۲۰۲۴ پروژه امید سبز. تمام حقوق محفوظ است.',
            adminLink: 'پنل مدیریت',
        },
        admin: {
            title: 'پنل مدیریت',
            featureManagement: 'مدیریت ویژگی‌ها',
            googleDateFeature: 'ویژگی هوش مصنوعی Google Date',
            googleDateDescription: 'هنگامی که فعال باشد، این ویژگی از داده‌های Google برای بهبود تحلیل‌های زمانی استفاده می‌کند.',
            enabled: 'فعال',
            disabled: 'غیرفعال',
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
            geolocationNotSupported: 'مکان‌یابی توسط مرورگر شما پشتیبانی نمی‌شود.',
            geolocationPermissionDenied: 'دسترسی به موقعیت مکانی رد شد. لطفاً آن را در تنظیمات مرورگر خود فعال کنید.',
            geolocationPositionUnavailable: 'موقعیت مکانی شما قابل تشخیص نیست.',
            geolocationTimeout: 'درخواست برای دریافت موقعیت مکانی کاربر منقضی شد.',
        },
        mapLayers: {
            title: 'لایه‌های نقشه',
            satellite: 'ماهواره',
            terrain: 'عوارض زمین',
            roadmap: 'جاده',
            humanitarian: 'بشردوستانه',
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
            startupShowcase: 'Startup Showcase',
        },
        hero: {
            title: 'A Greener Future, One Tree at a Time',
            subtitle: 'Use AI to find the best locations for planting trees, analyze environmental risks, and raise funds for reforestation projects worldwide.',
        },
        main: {
            instructions: 'Click on the map or search for a location to begin analysis.',
            selectedLocation: 'Selected Location:',
            analyzeLocation: 'Perform Full Analysis',
            suggestForToday: 'Suggest for Today',
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
            findAreas: 'Find Suitable Areas',
            findAreasDescription: 'Find multiple suitable planting spots within the current map view.',
            areaSuggestion: 'Suggested Area',
            clickForDetails: 'Click a marker to select it for detailed analysis.',
            selectForAnalysis: 'Select for Analysis',
            selectAreaOnMap: 'Select Area',
            analyzeSelection: 'Analyze selected area?',
            analyze: 'Analyze',
            locateMe: 'Find My Location',
            currentTime: 'Current Time',
        },
        results: {
            suggestionTitle: 'Tree Planting Suggestion',
            vegetationTitle: 'Vegetation Analysis',
            riskTitle: 'Environmental Risk Analysis',
            vegetationTooltip: 'This analysis assesses the current percentage of plant cover and the need for new tree planting.',
            riskTooltip: 'This analysis identifies potential hazards like droughts, wildfires, or legal issues related to your project.',
            species: 'Suitable Species',
            reason: 'Reason',
            cost: 'Estimated Cost',
            summary: 'Summary',
            coverage: 'Vegetation Coverage',
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
        startupShowcase: {
            title: 'Innovative Startup Showcase',
            description: 'Discover leading startups at the forefront of green technology and sustainability.',
            learnMore: 'Learn More',
            startups: [
                {
                    name: 'CarbonTrace',
                    description: 'Utilizing satellite imagery and AI to accurately monitor the world\'s forests and measure carbon sequestration.',
                    icon: 'fa-satellite-dish',
                    link: '#',
                },
                {
                    name: 'AquaSmart',
                    description: 'IoT-based irrigation systems that reduce water consumption in agriculture and reforestation by up to 50%.',
                    icon: 'fa-water',
                    link: '#',
                },
                {
                    name: 'DroneSeed',
                    description: 'A fleet of autonomous drones capable of rapidly planting thousands of tree seeds in hard-to-reach areas.',
                    icon: 'fa-helicopter',
                    link: '#',
                },
            ]
        },
        footer: {
            copyright: '© 2024 Green Hope Initiative. All rights reserved.',
            adminLink: 'Admin Panel',
        },
        admin: {
            title: 'Admin Panel',
            featureManagement: 'Feature Management',
            googleDateFeature: 'Google Date AI Feature',
            googleDateDescription: 'When enabled, this feature utilizes Google date data to enhance temporal analyses.',
            enabled: 'Enabled',
            disabled: 'Disabled',
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
            geolocationNotSupported: 'Geolocation is not supported by your browser.',
            geolocationPermissionDenied: 'Geolocation permission was denied. Please enable it in your browser settings.',
            geolocationPositionUnavailable: 'Could not determine your location.',
            geolocationTimeout: 'Request to get user location timed out.',
        },
        mapLayers: {
            title: 'Map Layers',
            satellite: 'Satellite',
            terrain: 'Terrain',
            roadmap: 'Roadmap',
            humanitarian: 'Humanitarian',
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
            startupShowcase: 'عرض الشركات الناشئة',
        },
        hero: {
            title: 'مستقبل أكثر اخضرارًا، شجرة في كل مرة',
            subtitle: 'استخدم الذكاء الاصطناعي للعثور على أفضل المواقع لزراعة الأشجار، وتحليل المخاطر البيئية، وجمع الأموال لمشاريع إعادة التحريج في جميع أنحاء العالم.',
        },
        main: {
            instructions: 'انقر على الخريطة أو ابحث عن موقع لبدء التحليل.',
            selectedLocation: 'الموقع المحدد:',
            analyzeLocation: 'إجراء تحليل كامل',
            suggestForToday: 'اقتراح زراعة لليوم',
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
            findAreas: 'البحث عن مناطق مناسبة',
            findAreasDescription: 'البحث عن عدة نقاط زراعة مناسبة ضمن عرض الخريطة الحالي.',
            areaSuggestion: 'منطقة مقترحة',
            clickForDetails: 'انقر على علامة لتحديدها للتحليل التفصيلي.',
            selectForAnalysis: 'تحديد للتحليل',
            selectAreaOnMap: 'تحديد منطقة',
            analyzeSelection: 'تحليل المنطقة المحددة؟',
            analyze: 'تحليل',
            locateMe: 'تحديد موقعي',
            currentTime: 'الوقت الحالي',
        },
        results: {
            suggestionTitle: 'اقتراح زراعة الأشجار',
            vegetationTitle: 'تحليل الغطاء النباتي',
            riskTitle: 'تحليل المخاطر البيئية',
            vegetationTooltip: 'يقيّم هذا التحليل النسبة المئوية الحالية للغطاء النباتي والحاجة إلى زراعة أشجار جديدة.',
            riskTooltip: 'يحدد هذا التحليل المخاطر المحتملة مثل الجفاف أو حرائق الغابات أو المشكلات القانونية المتعلقة بمشروعك.',
            species: 'الأنواع المناسبة',
            reason: 'السبب',
            cost: 'التكلفة التقديرية',
            summary: 'ملخص',
            coverage: 'تغطية الغطاء النباتي',
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
            sources: 'المصادر',
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
        startupShowcase: {
            title: 'عرض الشركات الناشئة المبتكرة',
            description: 'اكتشف الشركات الناشئة الرائدة في طليعة التكنولوجيا الخضراء والاستدامة.',
            learnMore: 'اعرف المزيد',
            startups: [
                {
                    name: 'تتبع الكربون',
                    description: 'استخدام صور الأقمار الصناعية والذكاء الاصطناعي لمراقبة غابات العالم بدقة وقياس عزل الكربون.',
                    icon: 'fa-satellite-dish',
                    link: '#',
                },
                {
                    name: 'الري الذكي',
                    description: 'أنظمة ري قائمة على إنترنت الأشياء تقلل من استهلاك المياه في الزراعة وإعادة التحريج بنسبة تصل إلى ٥٠٪.',
                    icon: 'fa-water',
                    link: '#',
                },
                {
                    name: 'طائرات بدون طيار للبذور',
                    description: 'أسطول من الطائرات بدون طيار ذاتية التشغيل قادرة على زراعة آلاف بذور الأشجار بسرعة في المناطق التي يصعب الوصول إليها.',
                    icon: 'fa-helicopter',
                    link: '#',
                },
            ]
        },
        footer: {
            copyright: '© 2024 مبادرة الأمل الأخضر. جميع الحقوق محفوظة.',
            adminLink: 'لوحة الإدارة',
        },
        admin: {
            title: 'لوحة الإدارة',
            featureManagement: 'إدارة الميزات',
            googleDateFeature: 'ميزة الذكاء الاصطناعي لتاريخ Google',
            googleDateDescription: 'عند التمكين، تستخدم هذه الميزة بيانات تاريخ Google لتحسين التحليلات الزمنية.',
            enabled: 'ممكّن',
            disabled: 'معطّل',
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
            geolocationNotSupported: 'الموقع الجغرافي غير مدعوم من قبل متصفحك.',
            geolocationPermissionDenied: 'تم رفض إذن تحديد الموقع الجغرافي. يرجى تمكينه في إعدادات المتصفح.',
            geolocationPositionUnavailable: 'تعذر تحديد موقعك.',
            geolocationTimeout: 'انتهت مهلة طلب الحصول على موقع المستخدم.',
        },
        mapLayers: {
            title: 'طبقات الخريطة',
            satellite: 'قمر صناعي',
            terrain: 'تضاريس',
            roadmap: 'خريطة الطريق',
            humanitarian: 'إنسانية',
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
  currencySymbol: string;
  currencyCode: string;
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
        // FIX: Explicitly type `replacedString` as `string` upon declaration.
        // This prevents a TypeScript issue where the type of `replacedString` was
        // inferred as `never` inside the loop during reassignment.
        let replacedString: string = result;
        for (const placeholder in replacements) {
            replacedString = replacedString.replace(`{${placeholder}}`, String(replacements[placeholder]));
        }
        return replacedString;
    }
    
    return result || key;
  }, [language]);

  const currencyInfo: Record<Language, { symbol: string, code: string }> = {
      fa: { symbol: 'تومان', code: 'IRT' },
      en: { symbol: '$', code: 'USD' },
      ar: { symbol: 'ر.س', code: 'SAR' }, // Saudi Riyal
  };

  const currencySymbol = currencyInfo[language].symbol;
  const currencyCode = currencyInfo[language].code;
  const dir = language === 'fa' || language === 'ar' ? 'rtl' : 'ltr';

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t, dir, currencySymbol, currencyCode } }, children);
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
