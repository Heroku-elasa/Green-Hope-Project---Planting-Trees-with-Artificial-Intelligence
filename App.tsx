import React, { useState, useCallback } from 'react';
import SiteHeader from './components/Header';
import GreenHopePage from './components/HomePage';
import QuotaErrorModal from './components/QuotaErrorModal';
import { useLanguage, PlantingSuggestion, VegetationAnalysis, RiskAnalysis, CrowdfundingCampaign } from './types';
import { useToast } from './components/Toast';
import { getPlantingSuggestion, getVegetationAnalysis, getRiskAnalysis, generateCrowdfundingCampaign } from './services/geminiService';
import SiteFooter from './components/Footer';

type LoadingState = 'full-analysis' | 'campaign' | 'areas' | false;

const App: React.FC = () => {
  const [isQuotaExhausted, setIsQuotaExhausted] = useState(false);
  const { addToast } = useToast();
  const { language, t } = useLanguage();

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [plantingSuggestion, setPlantingSuggestion] = useState<PlantingSuggestion | null>(null);
  const [vegetationAnalysis, setVegetationAnalysis] = useState<VegetationAnalysis | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<RiskAnalysis | null>(null);
  const [crowdfundingCampaign, setCrowdfundingCampaign] = useState<CrowdfundingCampaign | null>(null);
  const [isLoading, setIsLoading] = useState<LoadingState>(false);
  const [error, setError] = useState<string | null>(null);
  const [numberOfTrees, setNumberOfTrees] = useState(100);
  const [reforestationGoal, setReforestationGoal] = useState(10000);
  

  const handleApiError = useCallback((error: unknown) => {
    let message = t('error');
    if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('429') || errorMessage.includes('quota')) {
            setIsQuotaExhausted(true);
            message = t('quotaErrorModal.title');
        } else if (errorMessage.includes('rpc failed') || errorMessage.includes('network')) {
            message = t('networkError');
        }
    }
    addToast(message, 'error');
    setError(message);
  }, [addToast, t]);
  
  const resetState = useCallback(() => {
      setSelectedLocation(null);
      setPlantingSuggestion(null);
      setVegetationAnalysis(null);
      setRiskAnalysis(null);
      setCrowdfundingCampaign(null);
      setError(null);
  }, []);

  const handleFullAnalysis = useCallback(async () => {
    if (!selectedLocation) return;
    setIsLoading('full-analysis');
    setError(null);
    setPlantingSuggestion(null);
    setVegetationAnalysis(null);
    setRiskAnalysis(null);
    
    try {
      const [suggestion, vegetation, risk] = await Promise.all([
        getPlantingSuggestion(selectedLocation, language),
        getVegetationAnalysis(selectedLocation, language),
        getRiskAnalysis(selectedLocation, numberOfTrees, language),
      ]);
      setPlantingSuggestion(suggestion);
      setVegetationAnalysis(vegetation);
      setRiskAnalysis(risk);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLocation, language, handleApiError, numberOfTrees]);


  const handleGenerateCampaign = useCallback(async () => {
    if (!plantingSuggestion || !selectedLocation) return;
    setIsLoading('campaign');
    setError(null);
    setCrowdfundingCampaign(null);
    try {
      const result = await generateCrowdfundingCampaign(plantingSuggestion, selectedLocation, language);
      setCrowdfundingCampaign(result);
    } catch (err) {
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [plantingSuggestion, selectedLocation, language, handleApiError]);
  
  const handleLocationSelect = useCallback((location: { lat: number, lng: number }) => {
    setSelectedLocation(location);
    // Reset analyses for new location
    setPlantingSuggestion(null);
    setVegetationAnalysis(null);
    setRiskAnalysis(null);
    setCrowdfundingCampaign(null);
    setError(null);
  }, []);

  return (
      <div className="text-white font-sans">
        <SiteHeader onLogoClick={resetState} />
        <main>
            <GreenHopePage
                onLocationSelect={handleLocationSelect}
                selectedLocation={selectedLocation}
                onFullAnalysis={handleFullAnalysis}
                onGenerateCampaign={handleGenerateCampaign}
                plantingSuggestion={plantingSuggestion}
                vegetationAnalysis={vegetationAnalysis}
                riskAnalysis={riskAnalysis}
                crowdfundingCampaign={crowdfundingCampaign}
                isLoading={isLoading}
                error={error}
                numberOfTrees={numberOfTrees}
                onNumberOfTreesChange={setNumberOfTrees}
                reforestationGoal={reforestationGoal}
                onReforestationGoalChange={setReforestationGoal}
            />
        </main>
        <SiteFooter />
        <QuotaErrorModal isOpen={isQuotaExhausted} onClose={() => setIsQuotaExhausted(false)} />
      </div>
  );
};

export default App;