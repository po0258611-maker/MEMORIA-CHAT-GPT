import React, { useEffect, useState } from 'react';
import { extractFrame, getVideoMetadata } from '../utils/videoUtils';
import { analyzeVideoWithGemini } from '../services/geminiService';
import { AnalysisResult } from '../types';

const STEPS = [
  "Extraindo frames chave...",
  "Analisando gancho inicial...",
  "Calculando energia do áudio...",
  "Avaliando ritmo de corte...",
  "Detectando expressões faciais...",
  "Gerando títulos e hashtags...",
  "Finalizando relatório..."
];

export default function ProcessingScreen({ file, onComplete }: { file: File, onComplete: (result: AnalysisResult) => void }) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const processVideo = async () => {
      const interval = setInterval(() => {
        if (isMounted) {
          setProgress(p => {
            const newP = p >= 95 ? p : p + (Math.random() * 5);
            setCurrentStep(Math.min(Math.floor((newP / 100) * STEPS.length), STEPS.length - 1));
            return newP;
          });
        }
      }, 500);

      try {
        const metadata = await getVideoMetadata(file);
        const validDuration = metadata.duration > 0 && metadata.duration !== Infinity ? metadata.duration : 10;
        const thumbnailBase64 = await extractFrame(file, Math.min(2, validDuration / 2));
        
        const geminiResult = await analyzeVideoWithGemini(file.name, thumbnailBase64, validDuration);

        clearInterval(interval);
        
        if (isMounted) {
          setProgress(100);
          setCurrentStep(STEPS.length - 1);
          
          const finalResult: AnalysisResult = {
            id: Math.random().toString(36).substr(2, 9),
            date: new Date().toLocaleDateString('pt-BR'),
            videoName: file.name,
            thumbnailBase64,
            viralScore: geminiResult.viralScore || 0,
            factors: geminiResult.factors || { hook: 0, audioEnergy: 0, pacing: 0, facialExpression: 0, curiosity: 0 },
            recommendedCuts: geminiResult.recommendedCuts || [{ start: "00:00", end: "00:15", duration: "15s", reason: "Padrão" }],
            hashtags: geminiResult.hashtags || { shorts: [], reach: [], niche: [] },
            titles: geminiResult.titles || [],
            retentionData: geminiResult.retentionData || []
          };

          setTimeout(() => {
            onComplete(finalResult);
          }, 1000);
        }
      } catch (error) {
        clearInterval(interval);
        console.error("Error processing video:", error);
        if (isMounted) {
          setError("Falha no processamento do vídeo. Tente novamente.");
        }
      }
    };

    processVideo();

    return () => {
      isMounted = false;
    };
  }, [file, onComplete]);

  if (error) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 max-w-md mx-auto space-y-6 text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white">Falha no Processamento</h2>
        <p className="text-text-muted">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 bg-surface-light text-white font-medium py-3 px-8 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
        >
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 max-w-md mx-auto space-y-8">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="rgba(255,255,255,0.1)" 
            strokeWidth="4" 
          />
          <circle 
            cx="50" cy="50" r="45" 
            fill="none" 
            stroke="var(--color-primary)" 
            strokeWidth="4" 
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * progress) / 100}
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-4xl font-display font-bold text-white">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-white">Analisando Vídeo</h2>
        <p className="text-primary animate-pulse">{STEPS[currentStep]}</p>
      </div>
    </div>
  );
}
