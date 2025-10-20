import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

const translations: Record<string, any> = {
  en: {
    langCode: 'en-US',
    nav: { 
      home: "Home", 
      reportGenerator: "Project Planner", 
      grantFinder: "Grant Finder", 
      siteSelector: "Site Selector",
      videoGenerator: "Video Generator",
      imageEditor: "Image Editor",
      blogGenerator: "Blog Generator",
      projects: "Projects", 
      team: "Team", 
      docs: "Function Docs" 
    },
    hero: {
        title: "Planting a Greener Tomorrow<br/> with Artificial Intelligence",
        subtitle: "We leverage AI and data science to optimize reforestation projects, secure funding, and raise global awareness for a sustainable future.",
        button1: "Explore Our Projects",
        button2: "Get Involved",
        videoUrl: "https://storage.googleapis.com/verdant-assets/forest-hero-2.mp4"
    },
    home: {
        introTitle: "The Green Hope Project is an environmental organization using technology to fight climate change. We identify the best places to plant trees and measure our impact to ensure a thriving planet for future generations.",
        servicesTitle: "Our Core Strategies",
        services: [
            { iconKey: 'science', title: 'AI-Powered Site Selection', text: 'Using satellite data and machine learning to identify optimal locations for reforestation to maximize survival and impact.' },
            { iconKey: 'grant', title: 'Grant Acquisition', text: 'Securing funding from global environmental funds to power large-scale planting initiatives.' },
            { iconKey: 'education', title: 'Impact Reporting', text: 'Generating transparent, data-driven reports on carbon sequestration, biodiversity gains, and community benefits.' },
            { iconKey: 'consulting', title: 'Public Awareness', text: 'Creating compelling videos and content to engage communities and promote environmental stewardship.' }
        ],
        portfolioTitle: "Featured Reforestation Projects",
        portfolioItems: [
            { img: "https://storage.googleapis.com/verdant-assets/project-amazon.jpg", title: "Amazon Rainforest Restoration", link: "#", description: "A large-scale initiative to reforest degraded areas of the Amazon, using native species to restore biodiversity hotspots and support indigenous communities.", tags: ["AI/ML", "Biodiversity", "Amazon", "Community"]},
            { img: "https://storage.googleapis.com/verdant-assets/project-sahel.jpg", title: "The Great Green Wall, Sahel", link: "#", description: "Contributing to the ambitious pan-African project to combat desertification by planting a mosaic of trees, vegetation, and water-harvesting systems.", tags: ["Desertification", "Africa", "Sustainability", "Agroforestry"]},
            { img: "https://storage.googleapis.com/verdant-assets/project-mangrove.jpg", title: "Mangrove Restoration in Southeast Asia", link: "#", description: "Replanting vital mangrove forests that serve as critical coastal defenses, carbon sinks, and nurseries for marine life.", tags: ["Coastal Ecosystems", "Carbon Sequestration", "Blue Carbon", "Marine Biology"]},
            { img: "https://storage.googleapis.com/verdant-assets/project-urban.jpg", title: "Urban Greening in North America", link: "#", description: "Partnering with cities to plant urban forests, reducing heat island effects, improving air quality, and increasing access to green spaces.", tags: ["Urban Forestry", "Climate Resilience", "Public Health", "Smart Cities"]},
        ],
        achievementsTitle: "Our Global Impact",
        achievements: [
            { iconKey: 'publications', count: 50, suffix: 'M+', label: 'Trees Planted' },
            { iconKey: 'funded', count: 200, suffix: 'K+', label: 'Hectares Restored' },
            { iconKey: 'collaborations', count: 30, suffix: '+', label: 'Global Partners' },
            { iconKey: 'team', count: 15, suffix: '', label: 'Countries with Projects' },
            { iconKey: 'trained', count: 10, suffix: 'K+', label: 'Community Members Engaged' }
        ],
        customersTitle: "In Collaboration With",
        customerLogos: [
            { img: 'https://storage.googleapis.com/verdant-assets/logo-unep.svg', alt: 'UN Environment Programme' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-wwf.svg', alt: 'World Wildlife Fund' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-gef.svg', alt: 'Global Environment Facility' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-conservation-intl.svg', alt: 'Conservation International' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-nature-conservancy.svg', alt: 'The Nature Conservancy' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-wri.svg', alt: 'World Resources Institute' },
        ],
        calendarTitle: "Latest News From the Field",
        latestPosts: [
            { img: "https://storage.googleapis.com/verdant-assets/blog-1.jpg", title: "How AI is Helping Us Choose the Right Tree for the Right Place", date: "July 18, 2024", comments: 15, link: "#" },
            { img: "https://storage.googleapis.com/verdant-assets/blog-2.jpg", title: "A Community's Story: The First Saplings in the Sahel", date: "June 30, 2024", comments: 22, link: "#" },
            { img: "https://storage.googleapis.com/verdant-assets/blog-3.jpg", title: "Measuring Carbon Capture with Drones and Satellite Data", date: "June 12, 2024", comments: 9, link: "#" },
            { img: "https://storage.googleapis.com/verdant-assets/blog-4.jpg", title: "Why Mangroves are a Climate Superhero", date: "May 25, 2024", comments: 18, link: "#" },
        ]
    },
    footer: {
      description: "An environmental organization using technology to fight climate change and restore ecosystems worldwide.",
      contactTitle: "Get in Touch",
      email: "info@greenhope.proj",
      phone: "+1 555 123 4567",
      address: "San Francisco, USA",
      socialMediaTitle: "Follow Our Mission",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      facebook: "Facebook",
      quickLinksTitle: "Quick Links",
      quickLinks: [
        { text: "About Us", link: "#" },
        { text: "Our Strategies", link: "#services" },
        { text: "Projects Portfolio", link: "#" },
        { text: "Careers", link: "#" },
        { text: "Privacy Policy", link: "#" },
      ],
      addressTitle: "Our Location",
      copyright: "© 2024 Green Hope Project. All Rights Reserved. For a greener planet.",
    },
    projectsPage: {
        title: "Our Portfolio of Work",
        subtitle: "A selection of our key projects demonstrating our commitment to technology-driven reforestation across the globe."
    },
    teamPage: {
        title: "Meet Our Experts",
        subtitle: "A dedicated, multidisciplinary team of scientists, ecologists, and technologists committed to restoring our planet.",
        members: [
            { img: 'https://storage.googleapis.com/verdant-assets/team-1.jpg', name: 'Dr. Aris Thorne', title: 'Founder & Lead Ecologist', bio: 'With 20+ years in conservation, Aris pioneers data-driven restoration techniques to maximize biodiversity and climate impact.', linkedin: '#' },
            { img: 'https://storage.googleapis.com/verdant-assets/team-2.jpg', name: 'Lena Petrova', title: 'Director of AI & Remote Sensing', bio: 'Specializes in geospatial analysis and predictive modeling to identify and monitor reforestation sites worldwide. PhD in GIS.', linkedin: '#' },
            { img: 'https://storage.googleapis.com/verdant-assets/team-3.jpg', name: 'David Chen', title: 'Head of Funding & Partnerships', bio: 'Expert in securing and managing large-scale grants from environmental funds and building coalitions for global impact.', linkedin: '#' },
            { img: 'https://storage.googleapis.com/verdant-assets/team-4.jpg', name: 'Dr. Samira Iqbal', title: 'Community Engagement Lead', bio: 'Focuses on building sustainable, community-led planting programs that provide economic and social benefits.', linkedin: '#' },
        ]
    },
    reportTypes: {
        reforestation_plan: "Reforestation Plan",
        environmental_report: "Environmental Impact Report",
        funding_proposal: "Funding Proposal",
        species_viability_report: "Species Viability Report",
        literature_review: "Literature Review"
    },
    generatorForm: {
        title: "Project Planner",
        docType: "Document Type",
        topic: "Project Title / Topic",
        topicPlaceholder: "e.g., Reforestation Plan for the Usambara Mountains",
        description: "Key Information & Outline",
        descriptionPlaceholder: "Provide project goals, target species, location coordinates, community partners, expected outcomes, budget overview, etc.",
        buttonText: "Generate Document",
        validationError: "Please fill in both topic and description.",
    },
    reportDisplay: {
        title: "Generated Document",
        export: "Export",
        copy: "Copy Text",
        downloadMD: "Download (.md)",
        downloadDOCX: "Download (.docx)",
        downloadHTML: "Download (.html)",
        printPDF: "Print / Save as PDF",
        docTitle: "Generated Report",
        generating: "Generating...",
        placeholder1: "Your document will appear here.",
        placeholder2: "Fill out the form and click 'Generate' to begin."
    },
    grantFinder: {
        title: "Environmental Grant Finder",
        searchPlaceholder: "Enter keywords (e.g., 'reforestation Africa', 'mangrove restoration')",
        searchButton: "Find Grants",
        searching: "Searching...",
        from: "From",
        analyzeButton: "Analyze",
        error: "An error occurred while searching for grants.",
        noResults: "No grants found for these keywords. Try a broader search."
    },
    grantAnalyzer: {
        title: "AI Grant Analysis",
        close: "Close Analysis",
        loadingTitle: "Analyzing Grant...",
        loadingSubtitle: "Our AI is reviewing the grant's relevance to our environmental mission.",
        viewOriginal: "View Original Grant Posting",
        relevance: "Relevance",
        deadline: "Deadline",
        amount: "Funding Amount",
        duration: "Project Duration",
        geography: "Geographic Focus",
        eligibility: "Eligibility",
        scope: "Scope & Objectives",
        howToApply: "Application Process",
        contact: "Contact Information",
        useForProposal: "Use this analysis to start a proposal",
        exportDOCX: "Export Analysis (.docx)",
        printPDF: "Print Analysis",
        export: {
            summaryTitle: "Grant Analysis Summary",
            officialLink: "Official Link",
            relevance: "Relevance Score",
            details: "Grant Details",
            fundingBody: "Funding Body",
            deadline: "Deadline",
            amount: "Amount",
            duration: "Duration",
            geography: "Geography",
            eligibility: "Eligibility",
            scope: "Scope",
            applicationProcess: "Application Process",
            contact: "Contact",
            fileName: "Grant_Analysis"
        }
    },
    siteSelector: {
        title: "AI Site Selector",
        subtitle: "Get data-driven recommendations for planting locations and suitable tree species.",
        findLocationsMode: "Find Planting Locations",
        findTreesMode: "Find Suitable Trees",
        locations: {
            label: "Describe your project goals",
            placeholder: "e.g., A large-scale project in a semi-arid region of North Africa focused on combating desertification and supporting local agroforestry.",
            button: "Find Locations"
        },
        trees: {
            label: "Describe the location and conditions",
            placeholder: "e.g., Coastal area in Southeast Asia with saline soil, high humidity, and monsoon season. Goal is to restore mangrove ecosystem and protect coastline.",
            button: "Find Trees"
        },
        resultsTitle: "AI Recommendations",
        generating: "Analyzing...",
        placeholder: "Your recommendations will appear here.",
        validationError: "Please describe your requirements to get a recommendation.",
        validationErrorCoords: "Please select a location on the map first.",
        selectOnMap: "To begin, click on the map to select an area for analysis.",
        selectedCoords: "Selected Location",
        latitude: "Latitude",
        longitude: "Longitude",
        locationResult: {
            rationale: "Rationale",
            species: "Suggested Species"
        },
        treeResult: {
            description: "Description",
            rationale: "Suitability Rationale"
        },
        suggestedGoals: {
            title: "Suggested Project Goals",
            loading: "Generating ideas...",
            useGoal: "Use this goal & find sites"
        }
    },
    videoGenerator: {
        title: "AI Video Generator",
        subtitle: "Create compelling videos to showcase your planting projects, share impact stories, or raise awareness.",
        quotaExhaustedBanner: "Video generation quota may be limited. Some features might be unavailable.",
        errorTitle: "Error",
        step1Title: "1. Define Your Video Concept",
        videoType: "Video Purpose",
        typeGeneral: "General / Social Media",
        typeBooth: "Project Showcase / Report",
        promptLabel: "What is the video about?",
        promptPlaceholder: "e.g., A hopeful video showing our community planting event and the first sprouts growing.",
        boothPromptPlaceholder: "e.g., A technical showcase of our drone monitoring system for tree growth, explaining the methodology.",
        negativePromptLabel: "Exclude these elements (Optional)",
        negativePromptPlaceholder: "e.g., dry land, pollution, text overlays",
        imageLabel: "Inspirational Image (Optional)",
        uploadButton: "Upload an image",
        imagePrompt: "Guides the AI on visual style and mood.",
        removeImage: "Remove Image",
        addWatermark: "Add Green Hope Watermark",
        numberOfVersions: "Number of Video Versions",
        aspectRatio: "Aspect Ratio",
        durationLabel: "Approximate Video Duration",
        generateScriptButton: "Generate Script & Scenes",
        generatingScriptTitle: "Generating Script...",
        validationError: "Please provide a prompt or an image to start.",
        step2Title: "2. Review & Generate Scenes",
        progressSavedAutomatically: "Progress is saved automatically.",
        startOver: "Start Over",
        scene: "Scene",
        narration: "Narration",
        readNarration: "Read narration aloud",
        visuals: "Visuals Prompt",
        confirmPrompt: "Confirm Prompt",
        editPrompt: "Edit Prompt",
        approveScene: "Approve",
        approved: "Approved",
        generateSceneVideo: "Generate Video",
        regenerateScene: "Regenerate Video",
        generateSceneImage: "Generate Image",
        regenerateSceneImage: "Regenerate Image",
        downloadVideo: "Download",
        promptRequiredError: "Visuals prompt cannot be empty.",
        quotaErrorImageFallback: "Video generation failed (Quota Exceeded). Try generating an alternative or a still image.",
        generateAlternativeVideo: "Generate Alternative Video",
        generateAnimatedScene: "Generate Animated Scene",
        askGoogleBaba: "Ask AI",
        askGoogleBabaFocus: "Focus your question (optional)",
        step3Title: "3. Add Music",
        musicPromptLabel: "Describe the music you want",
        generateMusicButton: "Generate Music Idea",
        generatingMusic: "Generating...",
        musicDescriptionTitle: "AI Music Suggestion",
        musicLibraryTitle: "Or Select from Library",
        select: "Select",
        selected: "Selected",
        step4Title: "4. Finalize",
        combineAndExport: "Combine & Export Video",
        approveAllToCombine: "Approve all {approvedCount}/{totalCount} scenes to enable export.",
        musicRequired: "Please select a music track to enable export.",
    },
    imageEditor: {
        title: "AI Image Editor",
        subtitle: "Modify images with simple text commands. Add objects, change styles, or reimagine your photos.",
        uploadLabel: "Original Image",
        uploadButton: "Upload an Image",
        uploadPrompt: "Drag and drop or click to upload.",
        editPromptLabel: "Describe your edit",
        editPromptPlaceholder: "e.g., Add a futuristic city in the background, make it look like a watercolor painting, put a party hat on the dog...",
        generateButton: "Generate Edit",
        generatingButton: "Generating...",
        clearButton: "Start Over",
        resultTitle: "Edited Image",
        downloadButton: "Download Image",
        placeholder: "Your edited image will appear here.",
        validationError: "Please upload an image and provide an edit description."
    },
    quotaErrorModal: {
        title: "API Quota Exceeded",
        body: "You have exceeded your current API quota. Please check your billing account or try again later. Some features may be unavailable.",
        cta: "Check Billing",
        close: "Close"
    },
    googleBabaModal: {
        title: "AI Insights",
        close: "Close",
        loading: "Searching the web for insights...",
        userFocus: "Your focus:",
        resultsTitle: "Analysis:",
        sourcesTitle: "Sources:",
    },
    chatbot: {
        title: "Green Hope Assistant",
        placeholder: "Ask about our projects...",
        initialGreeting: "Hello! How can I help you learn about our reforestation projects? You can ask me about our technology, our mission, or where we plant.",
        send: "Send"
    }
  },
  fa: {
    langCode: 'fa-IR',
    nav: { 
      home: "خانه", 
      reportGenerator: "برنامه‌ریز پروژه", 
      grantFinder: "گرنت یاب", 
      siteSelector: "مکان‌یاب هوشمند",
      videoGenerator: "ویدیو ساز",
      imageEditor: "ویرایشگر تصویر",
      blogGenerator: "بلاگ ساز",
      projects: "پروژه ها", 
      team: "تیم", 
      docs: "مستندات" 
    },
    hero: {
        title: "کاشت فردایی سبزتر<br/> با هوش مصنوعی",
        subtitle: "ما از هوش مصنوعی و علم داده برای بهینه‌سازی پروژه‌های درخت‌کاری، تأمین بودجه و افزایش آگاهی جهانی برای آینده‌ای پایدار استفاده می‌کنیم.",
        button1: "مشاهده پروژه‌ها",
        button2: "مشارکت کنید",
        videoUrl: "https://storage.googleapis.com/verdant-assets/forest-hero-2.mp4"
    },
    home: {
        introTitle: "پروژه امید سبز یک سازمان محیط زیستی است که با استفاده از فناوری با تغییرات اقلیمی مبارزه می‌کند. ما بهترین مکان‌ها را برای کاشت درخت شناسایی کرده و تأثیر خود را برای تضمین سیاره‌ای شکوفا برای نسل‌های آینده اندازه‌گیری می‌کنیم.",
        servicesTitle: "استراتژی‌های اصلی ما",
        services: [
            { iconKey: 'science', title: 'مکان‌یابی با هوش مصنوعی', text: 'استفاده از داده‌های ماهواره‌ای و یادگیری ماشین برای یافتن مکان‌های بهینه درخت‌کاری جهت به حداکثر رساندن بقا و تأثیر.' },
            { iconKey: 'grant', title: 'جذب گرنت', text: 'تأمین بودجه از صندوق‌های جهانی محیط زیست برای اجرای طرح‌های گسترده کاشت درخت.' },
            { iconKey: 'education', title: 'گزارش‌دهی تأثیر', text: 'تهیه گزارش‌های شفاف و مبتنی بر داده در مورد جذب کربن، افزایش تنوع زیستی و مزایای اجتماعی.' },
            { iconKey: 'consulting', title: 'افزایش آگاهی عمومی', text: 'ساخت ویدیوها و محتوای جذاب برای درگیر کردن جوامع و ترویج حفاظت از محیط زیست.' }
        ],
        portfolioTitle: "پروژه‌های برجسته درخت‌کاری",
        portfolioItems: [
            { img: "https://storage.googleapis.com/verdant-assets/project-amazon.jpg", title: "احیای جنگل‌های آمازون", link: "#", description: "یک طرح بزرگ برای جنگل‌کاری مجدد مناطق تخریب‌شده آمازون با استفاده از گونه‌های بومی برای احیای کانون‌های تنوع زیستی و حمایت از جوامع بومی.", tags: ["هوش مصنوعی", "تنوع زیستی", "آمازون", "جامعه"]},
            { img: "https://storage.googleapis.com/verdant-assets/project-sahel.jpg", title: "دیوار بزرگ سبز، ساحل", link: "#", description: "مشارکت در پروژه بلندپروازانه آفریقایی برای مبارزه با بیابان‌زایی از طریق کاشت موزاییکی از درختان، گیاهان و سیستم‌های برداشت آب.", tags: ["بیابان‌زدایی", "آفریقا", "پایداری", "جنگل‌داری زراعی"]},
            { img: "https://storage.googleapis.com/verdant-assets/project-mangrove.jpg", title: "احیای جنگل‌های مانگرو در جنوب شرقی آسیا", link: "#", description: "کاشت مجدد جنگل‌های حیاتی مانگرو که به عنوان دفاع ساحلی، جاذب کربن و محل پرورش آبزیان عمل می‌کنند.", tags: ["اکوسیستم ساحلی", "جذب کربن", "کربن آبی", "زیست‌شناسی دریا"]},
            { img: "https://storage.googleapis.com/verdant-assets/project-urban.jpg", title: "فضای سبز شهری در آمریکای شمالی", link: "#", description: "همکاری با شهرها برای کاشت جنگل‌های شهری، کاهش اثر جزیره گرمایی، بهبود کیفیت هوا و افزایش دسترسی به فضاهای سبز.", tags: ["جنگل‌داری شهری", "تاب‌آوری اقلیمی", "بهداشت عمومی", "شهرهای هوشمند"]},
        ],
        achievementsTitle: "تأثیر جهانی ما",
        achievements: [
            { iconKey: 'publications', count: 50, suffix: '+ میلیون', label: 'درخت کاشته شده' },
            { iconKey: 'funded', count: 200, suffix: '+ هزار', label: 'هکتار احیا شده' },
            { iconKey: 'collaborations', count: 30, suffix: '+', label: 'همکار جهانی' },
            { iconKey: 'team', count: 15, suffix: '', label: 'کشور با پروژه فعال' },
            { iconKey: 'trained', count: 10, suffix: '+ هزار', label: 'عضو جامعه درگیر شده' }
        ],
        customersTitle: "با همکاری",
        customerLogos: [
            { img: 'https://storage.googleapis.com/verdant-assets/logo-unep.svg', alt: 'برنامه محیط زیست سازمان ملل' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-wwf.svg', alt: 'صندوق جهانی طبیعت' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-gef.svg', alt: 'تسهیلات جهانی محیط زیست' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-conservation-intl.svg', alt: 'حفاظت بین‌الملل' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-nature-conservancy.svg', alt: 'حفاظت از طبیعت' },
            { img: 'https://storage.googleapis.com/verdant-assets/logo-wri.svg', alt: 'مؤسسه منابع جهان' },
        ],
        calendarTitle: "آخرین اخبار از میدان عمل",
        latestPosts: [
            { img: "https://storage.googleapis.com/verdant-assets/blog-1.jpg", title: "چگونه هوش مصنوعی به ما در انتخاب درخت مناسب برای مکان مناسب کمک می‌کند", date: "۲۸ تیر ۱۴۰۳", comments: 15, link: "#" },
            { img: "https://storage.googleapis.com/verdant-assets/blog-2.jpg", title: "داستان یک جامعه: اولین نهال‌ها در ساحل", date: "۱۰ تیر ۱۴۰۳", comments: 22, link: "#" },
            { img: "https://storage.googleapis.com/verdant-assets/blog-3.jpg", title: "اندازه‌گیری جذب کربن با پهپادها و داده‌های ماهواره‌ای", date: "۲۳ خرداد ۱۴۰۳", comments: 9, link: "#" },
            { img: "https://storage.googleapis.com/verdant-assets/blog-4.jpg", title: "چرا مانگروها یک ابرقهرمان اقلیمی هستند", date: "۵ خرداد ۱۴۰۳", comments: 18, link: "#" },
        ]
    },
    footer: {
      description: "یک سازمان محیط زیستی که با استفاده از فناوری با تغییرات اقلیمی مبارزه کرده و اکوسیستم‌های جهانی را احیا می‌کند.",
      contactTitle: "در تماس باشید",
      email: "info@greenhope.proj",
      phone: "۴۵۶۷ ۱۲۳ ۵۵۵ ۱+",
      address: "سان فرانسیسکو، آمریکا",
      socialMediaTitle: "ماموریت ما را دنبال کنید",
      instagram: "اینستاگرام",
      linkedin: "لینکدین",
      facebook: "فیسبوک",
      quickLinksTitle: "دسترسی سریع",
      quickLinks: [
        { text: "درباره ما", link: "#" },
        { text: "استراتژی‌های ما", link: "#services" },
        { text: "نمونه کارها", link: "#" },
        { text: "فرصت‌های شغلی", link: "#" },
        { text: "سیاست حفظ حریم خصوصی", link: "#" },
      ],
      addressTitle: "موقعیت ما",
      copyright: "© ۲۰۲۴ پروژه امید سبز. تمامی حقوق محفوظ است. برای سیاره‌ای سبزتر.",
    },
    projectsPage: {
        title: "نمونه کارهای ما",
        subtitle: "مجموعه‌ای از پروژه‌های کلیدی ما که تعهد ما به درخت‌کاری مبتنی بر فناوری را در سراسر جهان نشان می‌دهد."
    },
    teamPage: {
        title: "با متخصصان ما آشنا شوید",
        subtitle: "تیمی متعهد و چند رشته‌ای از دانشمندان، بوم‌شناسان و فناورانی که به احیای سیاره ما متعهد هستند.",
        members: [
            { img: 'https://storage.googleapis.com/verdant-assets/team-1.jpg', name: 'دکتر آریس تورن', title: 'بنیانگذار و بوم‌شناس ارشد', bio: 'آریس با بیش از ۲۰ سال سابقه در حفاظت، پیشگام تکنیک‌های احیای مبتنی بر داده برای به حداکثر رساندن تنوع زیستی و تأثیر اقلیمی است.', linkedin: '#' },
            { img: 'https://storage.googleapis.com/verdant-assets/team-2.jpg', name: 'لنا پتروا', title: 'مدیر هوش مصنوعی و سنجش از دور', bio: 'متخصص در تحلیل‌های مکانی و مدل‌سازی پیش‌بینی‌کننده برای شناسایی و نظارت بر سایت‌های درخت‌کاری در سراسر جهان. دارای دکترا در GIS.', linkedin: '#' },
            { img: 'https://storage.googleapis.com/verdant-assets/team-3.jpg', name: 'دیوید چن', title: 'رئیس تأمین بودجه و مشارکت‌ها', bio: 'متخصص در تأمین و مدیریت گرنت‌های بزرگ از صندوق‌های محیط زیستی و ایجاد ائتلاف برای تأثیر جهانی.', linkedin: '#' },
            { img: 'https://storage.googleapis.com/verdant-assets/team-4.jpg', name: 'دکتر سمیرا اقبال', title: 'مسئول تعاملات اجتماعی', bio: 'تمرکز بر ایجاد برنامه‌های کاشت پایدار و جامعه‌محور که مزایای اقتصادی و اجتماعی فراهم می‌کنند.', linkedin: '#' },
        ]
    },
    reportTypes: {
        reforestation_plan: "طرح درخت‌کاری",
        environmental_report: "گزارش اثرات زیست‌محیطی",
        funding_proposal: "پروپوزال تأمین بودجه",
        species_viability_report: "گزارش زیست‌پذیری گونه‌ها",
        literature_review: "مرور ادبیات"
    },
    generatorForm: {
        title: "برنامه‌ریز پروژه",
        docType: "نوع سند",
        topic: "موضوع / عنوان پروژه",
        topicPlaceholder: "مثال: طرح درخت‌کاری برای کوه‌های اوزامبارا",
        description: "اطلاعات کلیدی و طرح کلی",
        descriptionPlaceholder: "اهداف پروژه، گونه‌های هدف، مختصات جغرافیایی، شرکای محلی، نتایج مورد انتظار، نمای کلی بودجه و غیره را ارائه دهید.",
        buttonText: "تولید سند",
        validationError: "لطفاً هم موضوع و هم توضیحات را پر کنید.",
    },
    reportDisplay: {
        title: "سند تولید شده",
        export: "خروجی",
        copy: "کپی کردن متن",
        downloadMD: "دانلود (.md)",
        downloadDOCX: "دانلود (.docx)",
        downloadHTML: "دانلود (.html)",
        printPDF: "چاپ / ذخیره به صورت PDF",
        docTitle: "گزارش تولید شده",
        generating: "در حال تولید...",
        placeholder1: "سند شما در اینجا نمایش داده خواهد شد.",
        placeholder2: "فرم را پر کرده و روی 'تولید' کلیک کنید تا شروع شود."
    },
    grantFinder: {
        title: "یابنده گرنت‌های محیط زیستی",
        searchPlaceholder: "کلمات کلیدی را وارد کنید (مثال: 'درخت‌کاری آفریقا'، 'احیای مانگرو')",
        searchButton: "جستجوی گرنت‌ها",
        searching: "در حال جستجو...",
        from: "از طرف",
        analyzeButton: "تحلیل",
        error: "خطایی هنگام جستجوی گرنت‌ها رخ داد.",
        noResults: "هیچ گرنتی برای این کلمات کلیدی یافت نشد. جستجوی گسترده‌تری را امتحان کنید."
    },
    grantAnalyzer: {
        title: "تحلیل گرنت با هوش مصنوعی",
        close: "بستن تحلیل",
        loadingTitle: "در حال تحلیل گرنت...",
        loadingSubtitle: "هوش مصنوعی ما در حال بررسی ارتباط گرنت با مأموریت محیط زیستی ماست.",
        viewOriginal: "مشاهده آگهی اصلی گرنت",
        relevance: "ارتباط",
        deadline: "مهلت",
        amount: "مبلغ بودجه",
        duration: "مدت زمان پروژه",
        geography: "تمرکز جغرافیایی",
        eligibility: "شرایط لازم",
        scope: "محدوده و اهداف",
        howToApply: "فرآیند درخواست",
        contact: "اطلاعات تماس",
        useForProposal: "استفاده از این تحلیل برای شروع پروپوزال",
        exportDOCX: "خروجی تحلیل (.docx)",
        printPDF: "چاپ تحلیل",
        export: {
            summaryTitle: "خلاصه تحلیل گرنت",
            officialLink: "لینک رسمی",
            relevance: "درصد ارتباط",
            details: "جزئیات گرنت",
            fundingBody: "نهاد تأمین کننده بودجه",
            deadline: "مهلت",
            amount: "مبلغ",
            duration: "مدت",
            geography: "جغرافیا",
            eligibility: "شرایط",
            scope: "محدوده",
            applicationProcess: "فرآیند درخواست",
            contact: "تماس",
            fileName: "تحلیل_گرنت"
        }
    },
    siteSelector: {
        title: "مکان‌یاب هوشمند",
        subtitle: "توصیه‌های مبتنی بر داده برای مکان‌های کاشت و گونه‌های درختی مناسب دریافت کنید.",
        findLocationsMode: "یافتن مناطق کاشت",
        findTreesMode: "یافتن درختان مناسب",
        locations: {
            label: "اهداف پروژه خود را توصیف کنید",
            placeholder: "مثال: یک پروژه بزرگ در منطقه‌ای نیمه‌خشک در شمال آفریقا با تمرکز بر مبارزه با بیابان‌زایی و حمایت از جنگل‌داری زراعی محلی.",
            button: "یافتن مناطق"
        },
        trees: {
            label: "مکان و شرایط را توصیف کنید",
            placeholder: "مثال: منطقه ساحلی در جنوب شرقی آسیا با خاک شور، رطوبت بالا و فصل موسمی. هدف، احیای اکوسیستم مانگرو و حفاظت از خط ساحلی است.",
            button: "یافتن درختان"
        },
        resultsTitle: "توصیه‌های هوش مصنوعی",
        generating: "در حال تحلیل...",
        placeholder: "توصیه‌های شما در اینجا نمایش داده خواهد شد.",
        validationError: "لطفاً برای دریافت توصیه، نیازمندی‌های خود را توصیف کنید.",
        validationErrorCoords: "لطفا ابتدا یک مکان را روی نقشه انتخاب کنید.",
        selectOnMap: "برای شروع، روی نقشه کلیک کنید یا یک منطقه را برای تحلیل انتخاب نمایید.",
        selectedCoords: "مکان انتخاب شده",
        latitude: "عرض جغرافیایی",
        longitude: "طول جغرافیایی",
        locationResult: {
            rationale: "دلایل انتخاب",
            species: "گونه‌های پیشنهادی"
        },
        treeResult: {
            description: "توضیحات",
            rationale: "دلایل مناسب بودن"
        },
        suggestedGoals: {
            title: "اهداف پیشنهادی پروژه",
            loading: "در حال تولید ایده...",
            useGoal: "استفاده از این هدف و یافتن مکان‌ها"
        }
    },
    videoGenerator: {
        title: "ویدیو ساز هوش مصنوعی",
        subtitle: "برای نمایش پروژه‌های کاشت، اشتراک‌گذاری داستان‌های تأثیرگذار یا افزایش آگاهی، ویدیوهای جذاب بسازید.",
        quotaExhaustedBanner: "سهمیه تولید ویدیو ممکن است محدود باشد. برخی ویژگی‌ها ممکن است در دسترس نباشند.",
        errorTitle: "خطا",
        step1Title: "۱. ایده ویدیوی خود را تعریف کنید",
        videoType: "هدف ویدیو",
        typeGeneral: "عمومی / رسانه اجتماعی",
        typeBooth: "نمایش پروژه / گزارش",
        promptLabel: "موضوع ویدیو چیست؟",
        promptPlaceholder: "مثال: ویدیویی امیدوارکننده که رویداد کاشت مردمی ما و رشد اولین جوانه‌ها را نشان می‌دهد.",
        boothPromptPlaceholder: "مثال: نمایش فنی سیستم نظارت پهپادی ما بر رشد درختان، با توضیح روش‌شناسی.",
        negativePromptLabel: "این موارد را حذف کن (اختیاری)",
        negativePromptPlaceholder: "مثال: زمین خشک، آلودگی، متن روی ویدیو",
        imageLabel: "تصویر الهام‌بخش (اختیاری)",
        uploadButton: "آپلود تصویر",
        imagePrompt: "هوش مصنوعی را در مورد سبک بصری و حال و هوا راهنمایی می‌کند.",
        removeImage: "حذف تصویر",
        addWatermark: "افزودن واترمارک امید سبز",
        numberOfVersions: "تعداد نسخه‌های ویدیو",
        aspectRatio: "نسبت تصویر",
        durationLabel: "مدت زمان تقریبی ویدیو",
        generateScriptButton: "تولید فیلمنامه و صحنه‌ها",
        generatingScriptTitle: "در حال تولید فیلمنامه...",
        validationError: "لطفاً برای شروع یک دستور یا یک تصویر ارائه دهید.",
        step2Title: "۲. بازبینی و تولید صحنه‌ها",
        progressSavedAutomatically: "پیشرفت به طور خودکار ذخیره می‌شود.",
        startOver: "شروع مجدد",
        scene: "صحنه",
        narration: "گویندگی",
        readNarration: "خواندن گویندگی",
        visuals: "دستور بصری",
        confirmPrompt: "تایید دستور",
        editPrompt: "ویرایش دستور",
        approveScene: "تایید",
        approved: "تایید شده",
        generateSceneVideo: "تولید ویدیو",
        regenerateScene: "تولید مجدد ویدیو",
        generateSceneImage: "تولید تصویر",
        regenerateSceneImage: "تولید مجدد تصویر",
        downloadVideo: "دانلود",
        promptRequiredError: "دستور بصری نمی‌تواند خالی باشد.",
        quotaErrorImageFallback: "تولید ویدیو ناموفق بود (سهمیه تمام شده). تولید یک جایگزین یا یک تصویر ثابت را امتحان کنید.",
        generateAlternativeVideo: "تولید ویدیوی جایگزین",
        generateAnimatedScene: "تولید صحنه متحرک",
        askGoogleBaba: "بپرس از AI",
        askGoogleBabaFocus: "سوال خود را متمرکز کنید (اختیاری)",
        step3Title: "۳. افزودن موسیقی",
        musicPromptLabel: "موسیقی مورد نظر خود را توصیف کنید",
        generateMusicButton: "تولید ایده موسیقی",
        generatingMusic: "در حال تولید...",
        musicDescriptionTitle: "پیشنهاد موسیقی هوش مصنوعی",
        musicLibraryTitle: "یا از کتابخانه انتخاب کنید",
        select: "انتخاب",
        selected: "انتخاب شد",
        step4Title: "۴. نهایی‌سازی",
        combineAndExport: "ترکیب و خروجی ویدیو",
        approveAllToCombine: "برای فعال کردن خروجی، همه {approvedCount}/{totalCount} صحنه را تایید کنید.",
        musicRequired: "لطفاً برای فعال کردن خروجی، یک قطعه موسیقی انتخاب کنید.",
    },
    imageEditor: {
        title: "ویرایشگر تصویر با هوش مصنوعی",
        subtitle: "تصاویر را با دستورات متنی ساده تغییر دهید. اشیاء اضافه کنید، سبک‌ها را عوض کنید یا عکس‌های خود را بازآفرینی کنید.",
        uploadLabel: "تصویر اصلی",
        uploadButton: "آپلود تصویر",
        uploadPrompt: "فایل را بکشید و رها کنید یا برای آپلود کلیک کنید.",
        editPromptLabel: "تغییرات خود را توصیف کنید",
        editPromptPlaceholder: "مثال: یک شهر آینده‌نگرانه در پس‌زمینه اضافه کن، آن را شبیه نقاشی آبرنگ کن، یک کلاه تولد روی سر سگ بگذار...",
        generateButton: "اعمال تغییرات",
        generatingButton: "در حال تولید...",
        clearButton: "شروع مجدد",
        resultTitle: "تصویر ویرایش شده",
        downloadButton: "دانلود تصویر",
        placeholder: "تصویر ویرایش شده شما در اینجا نمایش داده خواهد شد.",
        validationError: "لطفاً یک تصویر آپلود کرده و توضیحات ویرایش را ارائه دهید."
    },
    quotaErrorModal: {
        title: "سهمیه API تمام شد",
        body: "شما از سهمیه API فعلی خود فراتر رفته‌اید. لطفاً حساب صورتحساب خود را بررسی کنید یا بعداً دوباره تلاش کنید. برخی ویژگی‌ها ممکن است در دسترس نباشند.",
        cta: "بررسی صورتحساب",
        close: "بستن"
    },
    googleBabaModal: {
        title: "بینش‌های هوش مصنوعی",
        close: "بستن",
        loading: "در حال جستجو در وب برای یافتن بینش‌ها...",
        userFocus: "تمرکز شما:",
        resultsTitle: "تحلیل:",
        sourcesTitle: "منابع:",
    },
    chatbot: {
        title: "دستیار امید سبز",
        placeholder: "درباره پروژه‌های ما بپرسید...",
        initialGreeting: "سلام! چگونه می‌توانم به شما در مورد پروژه‌های درخت‌کاری ما کمک کنم؟ می‌توانید درباره فناوری، مأموریت ما یا مکان‌های کاشت ما سؤال کنید.",
        send: "ارسال"
    }
  }
};


type Language = 'en' | 'fa';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => any;
  direction: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// A helper function for nested object access
const getNested = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('fa');

  const t = (key: string): any => {
    const translation = getNested(translations[language], key);
    if (translation !== undefined) {
      return translation;
    }
    // Fallback to English
    const fallback = getNested(translations.en, key);
    // If fallback is also not found, return the key itself
    return fallback !== undefined ? fallback : key;
  };

  const direction = language === 'fa' ? 'rtl' : 'ltr';

  // Apply direction to HTML element for global styles
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [language, direction]);

  // FIX: The "Unexpected token '>'" syntax error was caused by using JSX inside a .ts file.
  // Replaced the JSX return statement with a `React.createElement` call, which is the
  // JavaScript equivalent and is valid in a standard TypeScript file.
  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t, direction } }, children);
};

// --- App State ---
export type Page = 'home' | 'projects' | 'team' | 'docs' | 'generator' | 'grant' | 'siteSelector' | 'video' | 'blog' | 'imageEditor';

export interface AppState {
  page: Page;
}

// --- Grant Related Types ---
export interface Grant {
  grantTitle: string;
  fundingBody: string;
  summary: string;
  deadline: string;
  link: string;
}

export interface GrantSummary {
  grantTitle: string;
  fundingBody: string;
  deadline: string;
  amount: string;
  duration: string;
  geography: string;
  eligibility: string;
  scope: string;
  howToApply: string;
  contact: string;
  relevancePercentage: number;
}

// --- Site Selector Types ---
export interface Coords {
    lat: number;
    lng: number;
}

export interface PlantingSite {
    locationName: string;
    country: string;
    latitude: number;
    longitude: number;
    rationale: string;
    suggestedSpecies: string[];
}

export interface SuitableTree {
    commonName: string;
    scientificName: string;
    description: string;
    rationale: string;
}

// --- Video Generator Types ---
export interface VideoScene {
    id: string;
    description: string;
    narration: string;
    videoUrls: string[];
    imageUrl: string | null;
    isGenerating: boolean;
    isApproved: boolean;
    isConfirmed: boolean;
    error: string | null;
}

// --- Chatbot Types ---
export interface ChatMessage {
    role: 'user' | 'model' | 'system';
    text: string;
}

// --- User Profile ---
export interface UserProfile {
    name: string;
    email: string;
    picture: string;
}