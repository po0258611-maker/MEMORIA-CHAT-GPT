import React from 'react';
import { AnalysisResult } from '../types';
import { Clock, TrendingUp, ChevronRight, Search } from 'lucide-react';

export default function HistoryScreen({ history, onSelectResult }: { history: AnalysisResult[], onSelectResult: (r: AnalysisResult) => void }) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="space-y-4">
        <h1 className="text-2xl font-display font-bold text-white">Histórico de Análises</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Buscar vídeos..." 
            className="w-full bg-surface border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </header>

      {history.length === 0 ? (
        <div className="text-center p-12 bg-surface rounded-2xl border border-white/5 flex flex-col items-center gap-4">
          <Clock size={48} className="text-text-muted opacity-50" />
          <p className="text-text-muted">Nenhuma análise encontrada no seu histórico.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map(result => (
            <div 
              key={result.id} 
              onClick={() => onSelectResult(result)}
              className="bg-surface border border-white/5 rounded-2xl p-4 flex items-center gap-4 cursor-pointer hover:bg-surface-light hover:border-white/10 transition-all group"
            >
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black flex-shrink-0">
                <img src={result.thumbnailBase64} alt="Thumbnail" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-bold text-white">Ver</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-white truncate mb-1">{result.videoName}</h4>
                <p className="text-xs text-text-muted mb-2">{result.date}</p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded">
                    <TrendingUp size={14} />
                    {result.viralScore}%
                  </div>
                  <span className="text-xs text-text-muted truncate">
                    {result.hashtags.shorts[0]}
                  </span>
                </div>
              </div>
              
              <ChevronRight size={20} className="text-text-muted group-hover:text-white transition-colors" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
