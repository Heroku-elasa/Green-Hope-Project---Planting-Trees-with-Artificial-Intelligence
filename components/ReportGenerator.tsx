import React from 'react';
import GeneratorForm from './GeneratorForm';
import ReportDisplay from './ReportDisplay';
import { GroundedResult } from '../types';

interface ReportGeneratorProps {
  onGenerate: (topic: string, description: string, reportType: string) => void;
  generatedReport: GroundedResult | null;
  isLoading: boolean;
  error: string | null;
  isComplete: boolean;
  // Form state and setters are now passed down
  topic: string;
  description: string;
  reportType: string;
  setTopic: (value: string) => void;
  setDescription: (value: string) => void;
  setReportType: (value: string) => void;
  isQuotaExhausted: boolean;
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ 
  onGenerate, 
  generatedReport, 
  isLoading, 
  error, 
  isComplete, 
  topic, 
  description, 
  reportType, 
  setTopic, 
  setDescription, 
  setReportType,
  isQuotaExhausted
}) => {
  return (
    <section id="generator" className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="lg:sticky top-28">
            <GeneratorForm 
              onGenerate={onGenerate} 
              isLoading={isLoading} 
              isComplete={isComplete}
              topic={topic}
              description={description}
              reportType={reportType}
              setTopic={setTopic}
              setDescription={setDescription}
              setReportType={setReportType}
              isQuotaExhausted={isQuotaExhausted}
            />
          </div>
          <div className="bg-slate-900/60 rounded-lg shadow-lg backdrop-blur-sm border border-slate-700">
            <ReportDisplay generatedReport={generatedReport} isLoading={isLoading} error={error} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportGenerator;