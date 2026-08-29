import React from 'react';
import { Play, TrendingUp, Clock, ChevronRight, Search } from 'lucide-react';
import { AnalysisResult } from '../types';

export default function HomeScreen({ onNewAnalysis, recentAnalyses, onSelectResult, onOpenResearch }: { onNewAnalysis: () => void, recentAnalyses: AnalysisResult[], onSelectResult: (r: AnalysisResult) => void, onOpenResearch?: () => void }) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">SuperClipe Analytics</h1>
          <p className="text-text-muted text-sm">Bem-vindo de volta, Criador</p>
        </div>
        <div className="w-10 h-10 bg-surface-light rounded-full flex items-center justify-center border border-white/10">
          <span className="font-bold text-primary">SC</span>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          onClick={onNewAnalysis}
          className="bg-gradient-to-br from-surface to-surface-light border border-primary/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/50 transition-all group"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="text-primary" size={32} fill="currentColor" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-1">Analisar Novo Vídeo</h2>
            <p className="text-text-muted text-sm">Descubra o potencial viral do seu clipe</p>
          </div>
        </div>

        <div 
          onClick={onOpenResearch}
          className="bg-gradient-to-br from-surface to-surface-light border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-white/30 transition-all group"
        >
          <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Search className="text-white" size={32} />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-bold text-white mb-1">Pesquisa Viral</h2>
            <p className="text-text-muted text-sm">Gere hashtags e títulos em tempo real</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock size={20} className="text-primary" />
            Análises Recentes
          </h3>
          <button className="text-sm text-primary hover:underline">Ver todas</button>
        </div>

        {recentAnalyses.length === 0 ? (
          <div className="text-center p-8 bg-surface rounded-xl border border-white/5">
            <p className="text-text-muted">Nenhuma análise recente. Envie seu primeiro vídeo!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentAnalyses.map(result => (
              <div 
                key={result.id} 
                onClick={() => onSelectResult(result)}
                className="bg-surface border border-white/5 rounded-xl p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-light transition-colors"
              >
                <img src={result.thumbnailBase64} alt="Thumbnail" className="w-16 h-16 object-cover rounded-lg bg-black" />
                <div className="flex-1">
                  <h4 className="font-medium text-white line-clamp-1">{result.videoName}</h4>
                  <p className="text-xs text-text-muted">{result.date}</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-text-muted mb-1">Viral Score</span>
                  <div className="flex items-center gap-1 text-primary font-bold">
                    <TrendingUp size={16} />
                    {result.viralScore}%
                  </div>
                </div>
                <ChevronRight size={20} className="text-text-muted" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
