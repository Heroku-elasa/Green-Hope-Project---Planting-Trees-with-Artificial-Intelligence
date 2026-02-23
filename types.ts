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
      compostingGuide: "Composting Guide",
      aiAssistant: "AI Assistant",
      projects: "Projects", 
      team: "Team", 
      docs: "Function Docs",
      apiTest: "API Test",
      marketplace: "Marketplace",
      investment: "Investment",
      landEstimation: "Land Value Estimator"
    },
    landEstimation: {
      title: "AI Land Value Estimator",
      subtitle: "Evaluate land potential based on environmental, financial, and family-oriented targets.",
      form: {
        location: "Location / Coordinates",
        environmentalTarget: "Environmental Goal (e.g., Reforestation, Soil Health)",
        financialTarget: "Financial Budget / ROI Target",
        familyTarget: "Family Needs (e.g., Recreation, Heritage)",
        button: "Estimate Value"
      },
      results: {
        title: "Estimation Result",
        score: "Land Score",
        rationale: "Rationale",
        recommendation: "AI Recommendation"
      }
    },
    hero: {
        title: "Planting a Greener Tomorrow<br/> with Artificial Intelligence",
        subtitle: "We leverage AI and data science to optimize reforestation projects, secure funding, and right global awareness for a sustainable future.",
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
            { img: "https://storage.googleapis.com/aistudio-public/prompts/6f3e334a-9391-450f-a63e-63f5b35274d4.jpeg", title: "Amazon Rainforest Restoration", link: "#", description: "A large-scale initiative to reforest degraded areas of the Amazon, using native species to restore biodiversity hotspots and support indigenous communities.", tags: ["AI/ML", "Biodiversity", "Amazon", "Community"], latitude: -3.4653, longitude: -62.2159},
            { img: "https://storage.googleapis.com/aistudio-public/prompts/12a8385d-4f74-4b47-9759-450a80e6c271.jpeg", title: "The Great Green Wall, Sahel", link: "#", description: "Contributing to the ambitious pan-African project to combat desertification by planting a mosaic of trees, vegetation, and water-harvesting systems.", tags: ["Desertification", "Africa", "Sustainability", "Agroforestry"], latitude: 14.4974, longitude: -14.4524},
            { img: "https://storage.googleapis.com/aistudio-public/prompts/c7891b92-56c6-4d5b-9d7a-115f573c0545.jpeg", title: "Mangrove Restoration in Southeast Asia", link: "#", description: "Replanting vital mangrove forests that serve as critical coastal defenses, carbon sinks, and nurseries for marine life.", tags: ["Coastal Ecosystems", "Carbon Sequestration", "Blue Carbon", "Marine Biology"], latitude: -2.5489, longitude: 118.0149},
            { img: "https://storage.googleapis.com/aistudio-public/prompts/89b12852-9799-470a-8a58-45e69d727b12.jpeg", title: "Urban Greening in North America", link: "#", description: "Partnering with cities to plant urban forests, reducing heat island effects, improving air quality, and increasing access to green spaces.", tags: ["Urban Forestry", "Climate Resilience", "Public Health", "Smart Cities"], latitude: 41.8781, longitude: -87.6298},
        ],
        achievementsTitle: "Our Global Impact",
        achievements: [
            { iconKey: 'publications', count: 50, suffix: 'M+', label: 'Trees Planted' },
            { iconKey: 'funded', count: 200, suffix: 'K+', label: 'Hectares Restored' },
            { iconKey: 'collaborations', count: 30, suffix: '+', label: 'Global Partners' },
            { iconKey: 'team', count: 15, suffix: '', label: 'Countries with Projects' },
            { iconKey: 'trained', count: 10, suffix: 'K+', label: 'Community Members Engaged' }
        ],
        map: {
            title: "Our Global Footprint",
            subtitle: "Explore our featured project sites around the world. Click on a marker to learn more.",
            button: "Find Your Own Planting Site"
        },
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
            { title: "Measuring Carbon Capture with Drones and Satellite Data", date: "June 12, 2024", comments: 9, link: "#" },
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
    compostingPage: {
        hero: {
            title: "Home Composting: Turning Waste into Green Gold",
            subtitle: "Learn how to manage your kitchen and garden waste, create nutrient-rich soil, reduce landfill, and support a healthier planet."
        },
        methods: {
            title: "Choose Your Composting Method",
            types: [
                { name: "Hot Composting", bestFor: "Faster results, larger volumes", effort: "High (frequent turning)", time: "1–3 months" },
                { name: "Cold Composting", bestFor: "Low maintenance, small gardens", effort: "Low", time: "6–18 months" },
                { name: "Vermicomposting (Worms)", bestFor: "Indoors, kitchen scraps, small spaces", effort: "Medium", time: "2–4 months" },
                { name: "Bokashi", bestFor: "Indoors, handles meat/dairy, urban dwellers", effort: "Medium", time: "2–4 weeks (fermentation)" }
            ]
        },
        homeGuide: {
            title: "Your First Backyard Compost Pile: A Step-by-Step Guide",
            steps: [
                { title: "1. Choose Your Site", text: "Find a flat, well-drained, and semi-shaded spot for your pile or bin." },
                { title: "2. Set Up Your Bin", text: "Use a store-bought bin, a DIY structure, or a simple pile. Good airflow is key." },
                { title: "3. Layer Your Materials", text: "Start with coarse 'browns' (twigs, cardboard) for drainage, then alternate layers of 'greens' (scraps) and 'browns' (leaves)." },
                { title: "4. Add an Activator (Optional)", text: "Speed up the process by adding a shovelful of garden soil, finished compost, or manure." },
                { title: "5. Maintain Moisture", text: "Keep the pile as moist as a wrung-out sponge. Add water if it gets too dry." },
                { title: "6. Aerate the Pile", text: "Turn the compost every one or two weeks with a pitchfork to provide oxygen, which is vital for hot composting." },
                { title: "7. Harvest Your Compost", text: "Your compost is ready when it’s dark, crumbly, and has a rich, earthy smell. Sift it and use it in your garden!" }
            ]
        },
        businessGuide: {
            title: "Thinking Bigger? Starting a Composting Business",
            steps: [
                { title: "Research and Planning", text: "First, create a solid business plan. Understand the composting process, research your local market demand, and identify your target customers (e.g., gardeners, landscapers, local farms). Define your business scope: will you focus on residential collection, commercial processing, or selling bagged compost products?" },
                { title: "Legal Requirements", text: "Navigate the necessary legal hurdles. Check with your local and state authorities about zoning laws, environmental guidelines, and required permits for composting operations. Compliance is key to a sustainable business." },
                { title: "Location and Equipment", text: "Choose a suitable location for your facility that's accessible and meets regulatory requirements. Acquire the necessary equipment, which can range from simple compost bins and pitchforks to industrial shredders, turners, and scales depending on your scale." },
                { title: "Sourcing Materials", text: "Your compost is only as good as your inputs. Establish reliable sources for organic 'green' and 'brown' materials. Build relationships with local businesses (restaurants, grocery stores), farms, and municipalities to secure a steady stream of organic waste." },
                { title: "Production & Quality Control", text: "Develop a systematic process for creating high-quality compost. This includes managing carbon-to-nitrogen ratios, monitoring temperature and moisture levels, and knowing when the compost is mature. Consistent quality will set you apart from competitors." },
                { title: "Marketing and Sales", text: "Develop a marketing strategy to reach your target audience. Promote your compost products to gardeners, landscapers, nurseries, and organic farms. Build an online presence and consider offering delivery services to expand your market." },
                { title: "Financial Planning", text: "Create a detailed financial forecast. Estimate your startup costs (equipment, site lease), ongoing operational expenses, and potential revenue. Research grants and subsidies available for green businesses and waste reduction initiatives to support your venture." }
            ]
        },
        aiSection: {
            title: "Enhancing Composting with AI",
            intro: "To further enhance the impact of composting, the Green Hope Project is exploring AI-powered modules to boost effectiveness and user engagement:",
            features: [
                { title: "Personalized Composting Models", text: "AI models that personalize composting methods based on user input, waste type, and local climate conditions." },
                { title: "Smart Site Selection", text: "Intelligent tools using satellite data and local environmental parameters to recommend the best composting spots." },
                { title: "Predictive Quality Analysis", text: "Predictive analytics to estimate compost readiness and nutrient quality based on input materials and environmental factors." },
                { title: "Compost Business Assistant", text: "A virtual AI advisor to help startups plan operations, forecast costs, and navigate regulations in compost-related ventures." },
                { title: "Interactive Feedback & Learning", text: "Interactive AI to guide users through best practices and troubleshoot composting issues in real-time." },
            ]
        },
        closing: {
            title: "Your Compost, Our Planet",
            text: "Every bit of waste you compost is a small but powerful act of restoring the earth. You're not just making soil; you're reducing methane emissions from landfills and building a foundation for new life to grow. It's the same principle we apply on a global scale."
        },
        cta: "Plan Your Green Project"
    },
    reportTypes: {
        reforestation_plan: "Reforestation Plan",
        tree_planting: "Tree Planting Strategy",
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
        noResults: "No grants found for these keywords. Try a broader search.",
        useGrounding: "Use Live Web Search (more up-to-date)",
        sources: "Sources",
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
        deforestationMode: "Deforestation Analysis",
        locations: {
            label: "Describe your project goals",
            placeholder: "e.g., A large-scale project in a semi-arid region of North Africa focused on combating desertification and supporting local agroforestry.",
            button: "Find Locations",
            examplePrompts: {
                title: "Or, try an example:",
                prompts: [
                    "Reforest a coastal area in Southeast Asia to prevent erosion and restore mangrove habitats.",
                    "Identify urban greening opportunities in major European cities to combat heat island effect.",
                    "Find suitable locations for a biodiversity corridor connecting two national parks in Central America."
                ]
            }
        },
        trees: {
            label: "Describe the location and conditions",
            placeholder: "e.g., Coastal area in Southeast Asia with saline soil, high humidity, and monsoon season. Goal is to restore mangrove ecosystem and protect coastline.",
            button: "Find Trees"
        },
        deforestation: {
            label: "Select an area to analyze vegetation changes",
            button: "Analyze Deforestation",
            analyzing: "Analyzing satellite data...",
            suggestionLabel: "Suggested Replanting Site",
            unknownLocation: "Unknown Location",
            tbdSpecies: "Native Species TBD",
            replantingSiteLabel: "Replanting Site",
            analyzeSuggestionButton: "Analyze This Site",
            result: {
                title: "NDVI Analysis Report",
                ndviScore: "Current NDVI",
                ndviChange: "10-Year Change",
                forestLoss: "Est. Forest Loss",
                causes: "Likely Causes",
                replantingSuggestions: "Suggested Replanting Sites"
            }
        },
        resultsTitle: "AI Recommendations",
        generating: "Analyzing...",
        placeholder: "Your recommendations will appear here.",
        validationError: "Please describe your requirements to get a recommendation.",
        validationErrorCoords: "Please provide valid coordinates.",
        selectOnMap: "To begin, click on the map to select an area for analysis.",
        selectedCoords: "Selected Location",
        latitude: "Latitude",
        longitude: "Longitude",
        manualCoordsTitle: "Or enter coordinates manually",
        analyzeCoordsButton: "Analyze Coordinates",
        manualCoordsDefaultLat: "36.175683",
        manualCoordsDefaultLng: "58.465929",
        latitudePlaceholder: "e.g., 36.1756",
        longitudePlaceholder: "e.g., 58.4659",
        locationResult: {
            rationale: "Rationale",
            species: "Suggested Species",
            analyzeEconomicPotentialButton: "Analyze Economic Potential",
            detailedAnalysisButton: "Detailed Site Analysis",
            analyzingEconomicPotential: "Analyzing...",
            economicPotentialTitle: "Economic Potential Analysis",
            potentialRevenue: "Potential Annual Revenue",
            profitabilityYears: "Est. Years to Profitability",
            economicDrivers: "Primary Economic Drivers",
            investmentOutlook: "Investment Outlook",
            findGrantsForProjectButton: "Find Grants for this Project"
        },
        treeResult: {
            description: "Description",
            rationale: "Suitability Rationale",
            findGrantsButton: "Find Grants for Planting This Tree",
            analyzeBenefitsButton: "Analyze Economic Benefits",
            analyzingBenefits: "Analyzing...",
            economicAnalysisTitle: "Economic Benefit Analysis",
            annualRevenue: "Est. Annual Revenue (Per Tree)",
            yearsToProfit: "Years to Profitability",
            primaryProducts: "Primary Products",
            otherBenefits: "Other Economic Benefits"
        },
        suggestedGoals: {
            title: "Suggested Project Goals",
            loading: "Generating ideas...",
            useGoal: "Use this goal & find sites"
        },
        findMyLocation: "Find My Location",
        findingLocation: "Finding your location...",
        locationError: "Could not get your location. Please ensure location services are enabled in your browser and try again.",
        drawPrompt: "Find planting sites within the area defined by the coordinates [{swLat}, {swLng}] to [{neLat}, {neLng}].",
        drawPolygonPrompt: "Find planting sites within the polygon defined by these vertices: {vertices}.",
        drawArea: "Draw an area to search",
        confirmPopup: {
            title: "Confirm Location",
            coordinates: "Coordinates: {lat}, {lng}",
            button: "Analyze Here"
        },
        latLabelShort: "Lat",
        lngLabelShort: "Lng",
        mapLoading: "Loading map...",
        nearbyAnalysis: {
            title: "Nearby Analysis",
            prompt: "What's nearby?",
            placeholder: "e.g., parks, rivers, conservation areas",
            button: "Search with Maps",
            validation: "Please enter a search query and select a location on the map.",
            resultsTitle: "Nearby Analysis for \"{query}\"",
            mapLink: "Map Link",
            reviewLink: "Review",
        }
    },
    mapLegend: {
        title: "Map Legend",
        plantingSite: "Planting Site Recommendation",
        selectedPoint: "Selected Analysis Point",
        criticalSite: "Critical Priority Site",
        highPrioritySite: "High Priority Site",
        mediumPrioritySite: "Medium Priority Site",
    },
    siteAnalysisModal: {
        title: "Detailed Site Analysis",
        analyzing: "Analyzing Site...",
        close: "Close",
        estimatedCost: "Estimated Cost",
        treeCount: "Est. Tree Count",
        duration: "Project Duration",
        carbonSeq: "Carbon Sequestration",
        tonnesPerYear: "tonnes/year",
        keyChallenges: "Key Challenges",
        successFactors: "Success Factors",
        error: "Could not generate analysis for this site.",
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
        send: "Send",
        initialPrompts: [
            "What is the Green Hope Project?",
            "How do you use AI for planting trees?",
            "Tell me about your latest project.",
            "What services do you offer?",
            "Explain your site selection process.",
            "How can I get involved?",
            "Who are your partners?"
        ]
    },
    searchModal: {
        title: "Intelligent Search",
        placeholder: "What would you like to do?",
        searchButton: "Search",
        suggestionsTitle: "Suggestions:",
        suggestionQueries: [
            "Create a reforestation plan",
            "Find environmental grants",
            "Find a good place to plant trees",
            "Make a video about my project"
        ],
        resultsTitle: "Search Results:",
        noResults: "No results found. Please try another query."
    },
    validation: {
        nameRequired: 'Name is required.',
        required: 'This field is required.',
        email: 'Please enter a valid email address.',
        passwordLength: 'Password must be at least 6 characters long.',
        passwordMismatch: 'Passwords do not match.',
        invalidCode: 'Invalid verification code. Please try again.',
    },
    loginModal: {
        title: 'Log In to Your Account',
        registerTitle: 'Create a New Account',
        google: 'Continue with Google',
        facebook: 'Continue with Facebook',
        instagram: 'Continue with Instagram',
        or: 'OR',
        namePlaceholder: 'Full Name',
        emailPlaceholder: 'Email Address',
        passwordPlaceholder: 'Password',
        confirmPasswordPlaceholder: 'Confirm Password',
        loginButton: 'Log In',
        registerButton: 'Create Account',
        switchToRegister: "Don't have an account? Sign up",
        switchToLogin: 'Already have an account? Log in',
        verifyTitle: 'Verify Your Email',
        verifyInstructions: 'A verification code has been sent to {email}. Please enter it below.',
        demoCodeNotice: 'For demo purposes, your code is: <strong>{code}</strong>',
        verificationCodePlaceholder: 'Enter 6-digit code',
        verifyButton: 'Verify & Create Account',
        backToRegister: 'Back to registration',
    },
    progressTracker: {
        title: "AI Personal Assistant",
        subtitle: "Track your journey, set goals, and celebrate your milestones one day at a time.",
        soberDays: "Sober Days",
        setStartDate: "Set your sobriety start date:",
        startDateSet: "Started on:",
        edit: "Edit",
        dailyCheckinTitle: "Daily Check-in",
        checkinComplete: "You've checked in for today! Great job.",
        moodLabel: "Mood (1-10)",
        cravingLabel: "Cravings (1-10)",
        submitCheckin: "Submit Check-in (+100 points)",
        goalsTitle: "Your Goals",
        addGoalPlaceholder: "e.g., Go for a walk, read a chapter...",
        addGoalButton: "Add",
        rewardsTitle: "Rewards & Milestones",
        totalPoints: "Total Points",
        milestones: {
            "1_day": "Day 1: The First Step",
            "3_days": "Gaining Momentum",
            "7_days": "1 Week: A Major Milestone",
            "14_days": "2 Weeks: Building Habits",
            "30_days": "1 Month: New Beginnings",
            "10_goals": "Achieved 10 Goals",
            "25_goals": "Achieved 25 Goals"
        }
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
      compostingGuide: "راهنمای کمپوست",
      aiAssistant: "دستیار هوشمند",
      projects: "پروژه ها", 
      team: "تیم", 
      apiTest: "تست API",
      marketplace: "بازارچه",
      investment: "سرمایه‌گذاری",
      landEstimation: "تخمین ارزش زمین"
    },
    landEstimation: {
      title: "تخمین‌گر هوشمند ارزش زمین",
      subtitle: "ارزیابی پتانسیل زمین بر اساس اهداف محیط‌زیستی، مالی و خانوادگی.",
      form: {
        location: "موقعیت / مختصات",
        environmentalTarget: "هدف محیط‌زیستی (مثلاً احیای جنگل، سلامت خاک)",
        financialTarget: "بودجه مالی / هدف بازگشت سرمایه",
        familyTarget: "نیازهای خانوادگی (مثلاً تفریح، میراث)",
        button: "تخمین ارزش"
      },
      results: {
        title: "نتیجه تخمین",
        score: "امتیاز زمین",
        rationale: "دلیل ارزیابی",
        recommendation: "پیشنهاد هوش مصنوعی"
      }
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
            { img: "https://storage.googleapis.com/aistudio-public/prompts/6f3e334a-9391-450f-a63e-63f5b35274d4.jpeg", title: "احیای جنگل‌های آمازون", link: "#", description: "یک طرح بزرگ برای جنگل‌کاری مجدد مناطق تخریب‌شده آمازون با استفاده از گونه‌های بومی برای احیای کانون‌های تنوع زیستی و حمایت از جوامع بومی.", tags: ["هوش مصنوعی", "تنوع زیستی", "آمازون", "جامعه"], latitude: -3.4653, longitude: -62.2159},
            { img: "https://storage.googleapis.com/aistudio-public/prompts/12a8385d-4f74-4b47-9759-450a80e6c271.jpeg", title: "دیوار بزرگ سبز، ساحل", link: "#", description: "مشارکت در پروژه بلندپروازانه آفریقایی برای مبارزه با بیابان‌زایی از طریق کاشت موزاییکی از درختان، گیاهان و سیستم‌های برداشت آب.", tags: ["بیابان‌زدایی", "آفریقا", "پایداری", "جنگل‌داری زراعی"], latitude: 14.4974, longitude: -14.4524},
            { img: "https://storage.googleapis.com/aistudio-public/prompts/c7891b92-56c6-4d5b-9d7a-115f573c0545.jpeg", title: "احیای جنگل‌های مانگرو در جنوب شرقی آسیا", link: "#", description: "کاشت مجدد جنگل‌های حیاتی مانگرو که به عنوان دفاع ساحلی، جاذب کربن و محل پرورش آبزیان عمل می‌کنند.", tags: ["اکوسیستم ساحلی", "جذب کربن", "کربن آبی", "زیست‌شناسی دریا"], latitude: -2.5489, longitude: 118.0149},
            { img: "https://storage.googleapis.com/aistudio-public/prompts/89b12852-9799-470a-8a58-45e69d727b12.jpeg", title: "فضای سبز شهری در آمریکای شمالی", link: "#", description: "همکاری با شهرها برای کاشت جنگل‌های شهری، کاهش اثر جزیره گرمایی، بهبود کیفیت هوا و افزایش دسترسی به فضاهای سبز.", tags: ["جنگل‌داری شهری", "تاب‌آوری اقلیمی", "بهداشت عمومی", "شهرهای هوشمند"], latitude: 41.8781, longitude: -87.6298},
        ],
        achievementsTitle: "تأثیر جهانی ما",
        achievements: [
            { iconKey: 'publications', count: 50, suffix: '+ میلیون', label: 'درخت کاشته شده' },
            { iconKey: 'funded', count: 200, suffix: '+ هزار', label: 'هکتار احیا شده' },
            { iconKey: 'collaborations', count: 30, suffix: '+', label: 'همکار جهانی' },
            { iconKey: 'team', count: 15, suffix: '', label: 'کشور با پروژه فعال' },
            { iconKey: 'trained', count: 10, suffix: '+ هزار', label: 'عضو جامعه درگیر شده' }
        ],
        map: {
            title: "حضور جهانی ما",
            subtitle: "سایت‌های پروژه‌های برجسته ما را در سراسر جهان کاوش کنید. برای اطلاعات بیشتر روی هر نشانگر کلیک کنید.",
            button: "مکان کاشت خود را پیدا کنید"
        },
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
            { title: "اندازه‌گیری جذب کربن با پهپادها و داده‌های ماهواره‌ای", date: "۲۳ خرداد ۱۴۰۳", comments: 9, link: "#" },
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
    compostingPage: {
        hero: {
            title: "کمپوست خانگی: تبدیل زباله به طلای سبز",
            subtitle: "یاد بگیرید چگونه پسماندهای آشپزخانه و باغچه خود را مدیریت کرده و خاکی غنی از مواد مغذی بسازید، دفن زباله را کاهش دهید و از سیاره‌ای سالم‌تر حمایت کنید."
        },
        methods: {
            title: "روش کمپوست خود را انتخاب کنید",
            types: [
                { name: "کمپوست گرم", bestFor: "نتایج سریع‌تر، حجم‌های بزرگ‌تر", effort: "زیاد (هم‌زدن مکرر)", time: "۱ تا ۳ ماه" },
                { name: "کمپوست سرد", bestFor: "نگهداری کم، باغچه‌های کوچک", effort: "کم", time: "۶ تا ۱۸ ماه" },
                { name: "ورمی کمپوست (کرم‌ها)", bestFor: "داخل خانه، پسماند آشپزخانه، فضاهای کوچک", effort: "متوسط", time: "۲ تا ۴ ماه" },
                { name: "بوکاشی", bestFor: "داخل خانه، مناسب برای گوشت/لبنیات، ساکنان شهری", effort: "متوسط", time: "۲ تا ۴ هفته (تخمیر)" }
            ]
        },
        homeGuide: {
            title: "اولین توده کمپوست حیاط شما: راهنمای گام به گام",
            steps: [
                { title: "۱. مکان خود را انتخاب کنید", text: "یک نقطه صاف، با زه‌کشی خوب و نیمه‌سایه برای توده یا سطل خود پیدا کنید." },
                { title: "۲. سطل خود را آماده کنید", text: "از سطل آماده، سازه دست‌ساز یا یک توده ساده استفاده کنید. جریان هوای خوب کلیدی است." },
                { title: "۳. مواد را لایه‌لایه بریزید", text: "با مواد 'قهوه‌ای' درشت (شاخه‌ها، مقوا) برای زه‌کشی شروع کنید، سپس لایه‌های 'سبز' (پسماند) و 'قهوه‌ای' (برگ) را به تناوب اضافه کنید." },
                { title: "۴. فعال‌کننده اضافه کنید (اختیاری)", text: "با افزودن یک بیلچه خاک باغچه، کمپوست آماده یا کود، فرآیند را تسریع کنید." },
                { title: "۵. رطوبت را حفظ کنید", text: "توده را به اندازه یک اسفنج فشرده مرطوب نگه دارید. اگر خیلی خشک شد، آب اضافه کنید." },
                { title: "۶. توده را هوادهی کنید", text: "هر یک یا دو هفته کمپوست را با چنگک زیر و رو کنید تا اکسیژن فراهم شود که برای کمپوست گرم حیاتی است." },
                { title: "۷. کمپوست خود را برداشت کنید", text: "کمپوست شما زمانی آماده است که تیره، ترد و با بوی غنی و خاکی باشد. آن را الک کرده و در باغچه خود استفاده کنید!" }
            ]
        },
        businessGuide: {
            title: "بزرگ‌تر فکر می‌کنید؟ راه‌اندازی کسب‌وکار کمپوست",
            steps: [
                { title: "تحقیق و برنامه‌ریزی", text: "ابتدا، یک طرح کسب‌وکار قوی ایجاد کنید. فرآیند کمپوست‌سازی را درک کنید، تقاضای بازار محلی خود را تحقیق کنید و مشتریان هدف خود را شناسایی کنید (مانند باغبانان، محوطه‌سازان، مزارع محلی). محدوده کسب‌وکار خود را تعریف کنید: آیا بر جمع‌آوری مسکونی، پردازش تجاری یا فروش محصولات کمپوست بسته‌بندی شده تمرکز خواهید کرد؟" },
                { title: "الزامات قانونی", text: "موانع قانونی لازم را پشت سر بگذارید. با مقامات محلی و ایالتی خود در مورد قوانین منطقه‌بندی، دستورالعمل‌های زیست‌محیطی و مجوزهای مورد نیاز برای عملیات کمپوست‌سازی مشورت کنید. رعایت قوانین کلید یک کسب‌وکار پایدار است." },
                { title: "مکان و تجهیزات", text: "یک مکان مناسب برای تأسیسات خود انتخاب کنید که در دسترس بوده و الزامات قانونی را برآورده کند. تجهیزات لازم را تهیه کنید، که بسته به مقیاس شما می‌تواند از سطل‌های کمپوست ساده و چنگک‌ها تا خردکن‌های صنعتی، همزن‌ها و ترازوها متغیر باشد." },
                { title: "تأمین مواد اولیه", text: "کیفیت کمپوست شما به ورودی‌های آن بستگی دارد. منابع قابل اعتماد برای مواد آلی 'سبز' و 'قهوه‌ای' ایجاد کنید. برای تضمین جریان مداوم پسماند آلی، با کسب‌وکارهای محلی (رستوران‌ها، فروشگاه‌های مواد غذایی)، مزارع و شهرداری‌ها ارتباط برقرار کنید." },
                { title: "تولید و کنترل کیفیت", text: "یک فرآیند سیستماتیک برای تولید کمپوست با کیفیت بالا توسعه دهید. این شامل مدیریت نسبت کربن به نیتروژن، نظارت بر دما و سطح رطوبت، و دانستن زمان بلوغ کمپوست است. کیفیت ثابت شما را از رقبا متمایز خواهد کرد." },
                { title: "بازاریابی و فروش", text: "یک استراتژی بازاریابی برای رسیدن به مخاطبان هدف خود توسعه دهید. محصولات کمپوست خود را به باغبانان، محوطه‌سازان، گلخانه‌ها و مزارع ارگانیک تبلیغ کنید. یک حضور آنلاین ایجاد کنید و ارائه خدمات تحویل را برای گسترش بازار خود در نظر بگیرید." },
                { title: "برنامه‌ریزی مالی", text: "یک پیش‌بینی مالی دقیق ایجاد کنید. هزینه‌های راه‌اندازی خود (تجهیزات، اجاره مکان)، هزینه‌های عملیاتی جاری و درآمد بالقوه را تخمین بزنید. در مورد گرنت‌ها و یارانه‌های موجود برای کسب‌وکارهای سبز و طرح‌های کاهش پسماند تحقیق کنید تا از سرمایه‌گذاری خود حمایت کنید." }
            ]
        },
        aiSection: {
            title: "بهبود کمپوست‌سازی با هوش مصنوعی",
            intro: "برای افزایش هرچه بیشتر تأثیر کمپوست‌سازی، پروژه امید سبز در حال بررسی ماژول‌های مبتنی بر هوش مصنوعی برای افزایش کارایی و تعامل کاربران است:",
            features: [
                { title: "مدل‌های شخصی‌سازی کمپوست", text: "مدل‌های هوش مصنوعی که روش‌های کمپوست‌سازی را بر اساس ورودی کاربر، نوع پسماند و شرایط آب و هوایی محلی شخصی‌سازی می‌کنند." },
                { title: "انتخاب هوشمند مکان", text: "ابزارهای هوشمند با استفاده از داده‌های ماهواره‌ای و پارامترهای محیطی محلی برای پیشنهاد بهترین نقاط برای کمپوست‌سازی." },
                { title: "تحلیل پیش‌بینی کیفیت", text: "تحلیل‌های پیش‌بینی‌کننده برای تخمین زمان آماده شدن کمپوست و کیفیت مواد مغذی آن بر اساس مواد اولیه و عوامل محیطی." },
                { title: "دستیار کسب‌وکار کمپوست", text: "یک مشاور هوش مصنوعی مجازی برای کمک به استارت‌آپ‌ها در برنامه‌ریزی عملیات، پیش‌بینی هزینه‌ها و آشنایی با مقررات." },
                { title: "آموزش و بازخورد تعاملی", text: "هوش مصنوعی تعاملی برای راهنمایی کاربران در مورد بهترین شیوه‌ها و عیب‌یابی مشکلات کمپوست‌سازی در زمان واقعی." },
            ]
        },
        closing: {
            title: "کمپوست شما، سیاره ما",
            text: "هر ذره زباله‌ای که کمپوست می‌کنید، یک اقدام کوچک اما قدرتمند در جهت احیای زمین است. شما فقط خاک نمی‌سازید؛ بلکه انتشار متان از محل‌های دفن زباله را کاهش داده و بنیادی برای رشد زندگی جدید می‌سازید. این همان اصلی است که ما در مقیاس جهانی به کار می‌بریم."
        },
        cta: "پروژه سبز خود را برنامه‌ریزی کنید"
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
        noResults: "هیچ گرنتی برای این کلمات کلیدی یافت نشد. جستجوی گسترده‌تری را امتحان کنید.",
        useGrounding: "استفاده از جستجوی زنده وب (به‌روزتر)",
        sources: "منابع",
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
        deforestationMode: "تشخیص جنگل‌زدایی (NDVI)",
        locations: {
            label: "اهداف پروژه خود را توصیف کنید",
            placeholder: "مثال: یک پروژه بزرگ در منطقه‌ای نیمه‌خشک در شمال آفریقا با تمرکز بر مبارزه با بیابان‌زایی و حمایت از جنگل‌داری زراعی محلی.",
            button: "یافتن مناطق",
            examplePrompts: {
                title: "یا، یک مثال را امتحان کنید:",
                prompts: [
                    "جنگل‌کاری مجدد یک منطقه ساحلی در جنوب شرقی آسیا برای جلوگیری از فرسایش و احیای زیستگاه‌های مانگرو.",
                    "شناسایی فرصت‌های فضای سبز شهری در شهرهای بزرگ اروپایی برای مبارزه با اثر جزیره گرمایی.",
                    "یافتن مکان‌های مناسب برای یک کریدور تنوع زیستی که دو پارک ملی را در آمریکای مرکزی به هم متصل می‌کند."
                ]
            }
        },
        trees: {
            label: "مکان و شرایط را توصیف کنید",
            placeholder: "مثال: منطقه ساحلی در جنوب شرقی آسیا با خاک شور، رطوبت بالا و فصل موسمی. هدف، احیای اکوسیستم مانگرو و حفاظت از خط ساحلی است.",
            button: "یافتن درختان"
        },
        deforestation: {
            label: "یک منطقه را برای تحلیل تغییرات پوشش گیاهی انتخاب کنید",
            button: "تحلیل جنگل‌زدایی",
            analyzing: "در حال تحلیل تصاویر ماهواره‌ای...",
            suggestionLabel: "سایت پیشنهادی کاشت مجدد",
            unknownLocation: "مکان نامشخص",
            tbdSpecies: "گونه‌های بومی (نیازمند بررسی)",
            replantingSiteLabel: "سایت کاشت مجدد",
            analyzeSuggestionButton: "تحلیل دقیق این سایت",
            result: {
                title: "گزارش تحلیل NDVI",
                ndviScore: "شاخص NDVI فعلی",
                ndviChange: "تغییر در ۱۰ سال گذشته",
                forestLoss: "تخمین جنگل‌زدایی",
                causes: "علل شناسایی شده",
                replantingSuggestions: "مکان‌های پیشنهادی برای کاشت مجدد"
            }
        },
        resultsTitle: "توصیه‌های هوش مصنوعی",
        generating: "در حال تحلیل...",
        placeholder: "توصیه‌های شما در اینجا نمایش داده خواهد شد.",
        validationError: "لطفاً برای دریافت توصیه، نیازمندی‌های خود را توصیف کنید.",
        validationErrorCoords: "لطفا مختصات معتبری را وارد کنید.",
        selectOnMap: "برای شروع، روی نقشه کلیک کنید یا یک منطقه را برای تحلیل انتخاب نمایید.",
        selectedCoords: "مکان انتخاب شده",
        latitude: "عرض جغرافیایی",
        longitude: "طول جغرافیایی",
        manualCoordsTitle: "یا مختصات را دستی وارد کنید",
        analyzeCoordsButton: "تحلیل مختصات",
        manualCoordsDefaultLat: "36.175683",
        manualCoordsDefaultLng: "58.465929",
        latitudePlaceholder: "مثال: ۳۶.۱۷۵۶",
        longitudePlaceholder: "مثال: ۵۸.۴۶۵۹",
        locationResult: {
            rationale: "دلایل انتخاب",
            species: "گونه‌های پیشنهادی",
            analyzeEconomicPotentialButton: "تحلیل پتانسیل اقتصادی",
            detailedAnalysisButton: "تحلیل دقیق سایت",
            analyzingEconomicPotential: "در حال تحلیل...",
            economicPotentialTitle: "تحلیل پتانسیل اقتصادی",
            potentialRevenue: "پتانسیل درآمد سالانه",
            profitabilityYears: "سال تا سودآوری",
            economicDrivers: "محرک‌های اصلی اقتصادی",
            investmentOutlook: "چشم‌انداز سرمایه‌گذاری",
            findGrantsForProjectButton: "یافتن گرنت برای این پروژه"
        },
        treeResult: {
            description: "توضیحات",
            rationale: "دلایل مناسب بودن",
            findGrantsButton: "یافتن گرنت برای کاشت این درخت",
            analyzeBenefitsButton: "تحلیل مزایای اقتصادی",
            analyzingBenefits: "در حال تحلیل...",
            economicAnalysisTitle: "تحلیل مزایای اقتصادی",
            annualRevenue: "درآمد سالانه تخمینی (به ازای هر درخت)",
            yearsToProfit: "سال تا سوددهی",
            primaryProducts: "محصولات اصلی",
            otherBenefits: "سایر مزایای اقتصادی"
        },
        suggestedGoals: {
            title: "اهداف پیشنهادی پروژه",
            loading: "در حال تولید ایده...",
            useGoal: "استفاده از این هدف و یافتن مکان‌ها"
        },
        findMyLocation: "مکان‌یابی من",
        findingLocation: "در حال یافتن موقعیت شما...",
        locationError: "موقعیت شما یافت نشد. لطفاً خدمات موقعیت مکانی را در مرورگر خود فعال کرده و دوباره امتحان کنید.",
        drawPrompt: "یافتن مناطق کاشت در محدوده مشخص شده با مختصات [{swLat}, {swLng}] تا [{neLat}, {neLng}].",
        drawPolygonPrompt: "یافتن مناطق کاشت در محدوده چندضلعی با رئوس زیر: {vertices}.",
        drawArea: "برای جستجو یک منطقه رسم کنید",
        confirmPopup: {
            title: "تایید مکان",
            coordinates: "مختصات: {lat}, {lng}",
            button: "تحلیل این منطقه"
        },
        latLabelShort: "عرض",
        lngLabelShort: "طول",
        mapLoading: "در حال بارگذاری نقشه...",
        nearbyAnalysis: {
            title: "تحلیل مناطق نزدیک",
            prompt: "چه چیزی در این نزدیکی است؟",
            placeholder: "مثال: پارک‌ها، رودخانه‌ها، مناطق حفاظت شده",
            button: "جستجو با نقشه",
            validation: "لطفاً یک عبارت جستجو وارد کرده و مکانی را روی نقشه انتخاب کنید.",
            resultsTitle: "تحلیل مناطق نزدیک برای \"{query}\"",
            mapLink: "لینک نقشه",
            reviewLink: "نظر",
        }
    },
    mapLegend: {
        title: "راهنمای نقشه",
        plantingSite: "مکان پیشنهادی کاشت",
        selectedPoint: "نقطه انتخابی تحلیل",
        criticalSite: "سایت با اولویت حیاتی",
        highPrioritySite: "سایت با اولویت بالا",
        mediumPrioritySite: "سایت با اولویت متوسط",
    },
    siteAnalysisModal: {
        title: "تحلیل دقیق سایت",
        analyzing: "در حال تحلیل سایت...",
        close: "بستن",
        estimatedCost: "هزینه تخمینی",
        treeCount: "تعداد تخمینی درختان",
        duration: "مدت زمان پروژه",
        carbonSeq: "جذب کربن",
        tonnesPerYear: "تن در سال",
        keyChallenges: "چالش‌های کلیدی",
        successFactors: "عوامل موفقیت",
        error: "تحلیل این سایت امکان‌پذیر نبود.",
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
        send: "ارسال",
        initialPrompts: [
            "پروژه امید سبز چیست؟",
            "چگونه از هوش مصنوعی برای کاشت درخت استفاده می‌کنید؟",
            "درباره آخرین پروژه خود به من بگویید.",
            "چه خدماتی ارائه می‌دهید؟",
            "فرآیند انتخاب سایت خود را توضیح دهید.",
            "چگونه می‌توانم مشارکت کنم؟",
            "شرکای شما چه کسانی هستند؟"
        ]
    },
    searchModal: {
        title: "جستجوی هوشمند",
        placeholder: "چه کاری می‌خواهید انجام دهید؟",
        searchButton: "جستجو",
        suggestionsTitle: "پیشنهادها:",
        suggestionQueries: [
            "ایجاد یک طرح درختکاری",
            "پیدا کردن گرنت‌های محیط زیستی",
            "یافتن مکان مناسب برای کاشت",
            "ساخت ویدیو برای پروژه"
        ],
        resultsTitle: "نتایج جستجو:",
        noResults: "هیچ نتیجه‌ای یافت نشد. لطفاً عبارت دیگری را امتحان کنید."
    },
    validation: {
        nameRequired: 'نام الزامی است.',
        required: 'این فیلد الزامی است.',
        email: 'لطفا یک آدرس ایمیل معتبر وارد کنید.',
        passwordLength: 'رمز عبور باید حداقل ۶ کاراکتر باشد.',
        passwordMismatch: 'رمزهای عبور مطابقت ندارند.',
        invalidCode: 'کد تایید نامعتبر است. لطفاً دوباره تلاش کنید.',
    },
    loginModal: {
        title: 'ورود به حساب کاربری',
        registerTitle: 'ایجاد حساب جدید',
        google: 'ادامه با گوگل',
        facebook: 'ادامه با فیسبوک',
        instagram: 'ادامه با اینستاگرام',
        or: 'یا',
        namePlaceholder: 'نام کامل',
        emailPlaceholder: 'آدرس ایمیل',
        passwordPlaceholder: 'رمز عبور',
        confirmPasswordPlaceholder: 'تکرار رمز عبور',
        loginButton: 'ورود',
        registerButton: 'ایجاد حساب',
        switchToRegister: "حساب کاربری ندارید؟ ثبت‌نام کنید",
        switchToLogin: 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید',
        verifyTitle: 'تایید ایمیل شما',
        verifyInstructions: 'یک کد تایید به ایمیل {email} ارسال شد. لطفاً آن را در زیر وارد کنید.',
        demoCodeNotice: 'برای اهداف نمایشی، کد شما: <strong>{code}</strong>',
        verificationCodePlaceholder: 'کد ۶ رقمی را وارد کنید',
        verifyButton: 'تایید و ایجاد حساب',
        backToRegister: 'بازگشت به ثبت‌نام',
    },
    progressTracker: {
        title: "دستیار شخصی هوشمند",
        subtitle: "سفر خود را دنبال کنید، اهداف تعیین کنید و دستاوردهای خود را روز به روز جشن بگیرید.",
        soberDays: "روزهای پاکی",
        setStartDate: "تاریخ شروع پاکی خود را تنظیم کنید:",
        startDateSet: "شروع از:",
        edit: "ویرایش",
        dailyCheckinTitle: "بررسی روزانه",
        checkinComplete: "شما برای امروز ثبت حضور کردید! عالیه.",
        moodLabel: "وضعیت روحی (۱-۱۰)",
        cravingLabel: "میزان وسوسه (۱-۱۰)",
        submitCheckin: "ثبت حضور (۱۰۰+ امتیاز)",
        goalsTitle: "اهداف شما",
        addGoalPlaceholder: "مثال: پیاده‌روی کردن، خواندن یک فصل کتاب...",
        addGoalButton: "افزودن",
        rewardsTitle: "جوایز و دستاوردها",
        totalPoints: "امتیاز کل",
        milestones: {
            "1_day": "روز اول: اولین قدم",
            "3_days": "۳ روز: شتاب گرفتن",
            "7_days": "۱ هفته: یک دستاورد بزرگ",
            "14_days": "۲ هفته: ساختن عادت‌ها",
            "30_days": "۱ ماه: شروعی دوباره",
            "10_goals": "دستیابی به ۱۰ هدف",
            "25_goals": "دستیابی به ۲۵ هدف"
        }
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
  const getInitialLanguage = (): Language => {
    // 1. Check for a language preference stored in localStorage.
    const storedLang = localStorage.getItem('app-language') as Language;
    if (storedLang && ['en', 'fa'].includes(storedLang)) {
      return storedLang;
    }

    // 2. Fallback to the user's browser language preference.
    const browserLang = navigator.language?.toLowerCase();
    if (browserLang?.startsWith('fa')) {
      return 'fa';
    }
    
    // 3. Default to Farsi as requested.
    return 'fa';
  };

  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    localStorage.setItem('app-language', lang);
    setLanguageState(lang);
  };

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

  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t, direction } }, children);
};

// --- App State ---
export type Page = 'home' | 'projects' | 'team' | 'docs' | 'generator' | 'grant' | 'siteSelector' | 'video' | 'blog' | 'imageEditor' | 'composting' | 'aiAssistant' | 'marketplace' | 'investment' | 'landEstimation';

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

export interface GroundedSource {
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string; placeAnswerSources?: { reviewSnippets: { uri: string; text: string; }[] } };
}

export interface GroundedResult {
    text: string;
    sources: GroundedSource[];
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
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface SiteAnalysis {
  estimatedCost: string;
  treeCount: number;
  projectDurationYears: string;
  carbonSequestrationTonnesPerYear: number;
  keyChallenges: string[];
  successFactors: string[];
}

export interface SiteEconomicAnalysis {
  potentialAnnualRevenue: string;
  estimatedProfitabilityYears: string;
  primaryEconomicDrivers: string[];
  investmentOutlook: string; // A summary in Markdown
}

export interface SuitableTree {
    commonName: string;
    scientificName: string;
    description: string;
    rationale: string;
}

export interface EconomicBenefitAnalysis {
    annualRevenuePerTree: string;
    yearsToProfitability: string;
    primaryProducts: string[];
    otherBenefits: string;
}

export interface DeforestationAnalysis {
    ndviScore: number;
    ndviChange: string;
    forestLossEstimate: string;
    causes: string[];
    replantingSuggestions: { lat: number; lng: number; note: string }[];
    analysisText: string;
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

// --- Search Types ---
export interface SearchResultItem {
    title: string;
    description: string;
    targetPage: Page;
}


// --- Progress Tracker Types ---
export interface DailyCheckin {
    date: string; // YYYY-MM-DD
    mood: number; // 1-10
    craving: number; // 1-10
}

export interface Goal {
    id: string;
    text: string;
    completed: boolean;
}

export interface ProgressData {
    soberStartDate: string | null;
    dailyCheckins: DailyCheckin[];
    goals: Goal[];
    points: number;
}