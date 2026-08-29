import React, { useCallback } from 'react';
import { AnalysisResult } from '../types';
import { ArrowLeft, Download, Scissors, Hash, Type, Image as ImageIcon, TrendingUp, Activity, Eye, MessageCircle, Zap, Smartphone, MonitorPlay, Instagram } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsResultScreen({ result, onBack, onOpenEditor }: { result: AnalysisResult, onBack: () => void, onOpenEditor: () => void }) {
  const handleDownloadReport = useCallback(() => {
    const reportContent = `
RELATÓRIO DE ANÁLISE DE VÍDEO - CORTES ANALIXY
==============================================
Vídeo: ${result.videoName}
Data: ${result.date}
Score Viral: ${result.viralScore}/100

FATORES DE ANÁLISE:
- Gancho Inicial: ${result.factors.hook}%
- Energia do Áudio: ${result.factors.audioEnergy}%
- Ritmo de Corte: ${result.factors.pacing}%
- Expressão Facial: ${result.factors.facialExpression}%
- Curiosidade: ${result.factors.curiosity}%

MOMENTOS EXATOS PARA CORTES (CENAS):
${result.recommendedCuts.map((cut, i) => `
Corte ${i + 1}:
- Início: ${cut.start}
- Fim: ${cut.end}
- Duração: ${cut.duration}
- Motivo: ${cut.reason}`).join('\n')}

TÍTULOS OTIMIZADOS:
${result.titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}

HASHTAGS RECOMENDADAS:
- Para Curtos: ${result.hashtags.shorts.join(', ')}
- Crescimento: ${result.hashtags.reach.join(', ')}
- Nicho: ${result.hashtags.niche.join(', ')}

FORMATOS DE EXPORTAÇÃO RECOMENDADOS:
- TikTok / Shorts / Reels: 1080 x 1920 (9:16)
- Instagram Feed: 1080 x 1350 (4:5)
- YouTube Padrão: 1920 x 1080 (16:9)
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${result.videoName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [result]);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-surface rounded-full transition-colors">
            <ArrowLeft size={24} className="text-white" />
          </button>
          <h1 className="text-2xl font-display font-bold text-white truncate max-w-[200px] md:max-w-md">{result.videoName}</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={onOpenEditor} className="bg-surface-light text-white p-2 rounded-full hover:bg-white/10 transition-colors" title="Editor de Capa">
            <ImageIcon size={20} />
          </button>
          <button onClick={handleDownloadReport} className="bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20 transition-colors" title="Exportar Relatório">
            <Download size={20} />
          </button>
        </div>
      </header>

      {/* Main Score Card */}
      <section className="bg-gradient-to-br from-surface to-surface-light border border-white/10 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="relative w-40 h-40 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle 
              cx="50" cy="50" r="45" 
              fill="none" 
              stroke="var(--color-primary)" 
              strokeWidth="8" 
              strokeDasharray="283"
              strokeDashoffset={283 - (283 * result.viralScore) / 100}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-display font-bold text-white">{result.viralScore}</span>
            <span className="text-xs text-primary font-medium uppercase tracking-wider">Score Viral</span>
          </div>
        </div>
        
        <div className="flex-1 w-full space-y-4">
          <h3 className="text-xl font-bold text-white mb-4">Fatores de Análise</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FactorBar label="Gancho Inicial" value={result.factors.hook} icon={<Zap size={16} />} />
            <FactorBar label="Energia do Áudio" value={result.factors.audioEnergy} icon={<Activity size={16} />} />
            <FactorBar label="Ritmo de Corte" value={result.factors.pacing} icon={<Scissors size={16} />} />
            <FactorBar label="Expressão Facial" value={result.factors.facialExpression} icon={<Eye size={16} />} />
            <FactorBar label="Curiosidade" value={result.factors.curiosity} icon={<MessageCircle size={16} />} />
          </div>
        </div>
      </section>

      {/* Retention Chart */}
      <section className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="text-primary" size={20} />
          Retenção Estimada
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={result.retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} tickFormatter={(val) => `${val}s`} />
              <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)'}} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                itemStyle={{ color: '#00FF66' }}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Retenção']}
                labelFormatter={(label) => `${label} segundos`}
              />
              <Line type="monotone" dataKey="retention" stroke="#00FF66" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#00FF66', stroke: '#000', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recommended Cuts */}
        <section className="bg-surface border border-white/5 rounded-2xl p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Scissors className="text-primary" size={20} />
            Momentos Exatos para Cortes (Cenas)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {result.recommendedCuts.map((cut, i) => (
              <div key={i} className="bg-surface-light rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <span className="text-white font-bold">Corte {i + 1}</span>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                    {cut.duration}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Início</span>
                  <span className="font-mono text-white font-bold">{cut.start}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-text-muted text-sm">Fim</span>
                  <span className="font-mono text-white font-bold">{cut.end}</span>
                </div>
                <div className="pt-2 border-t border-white/10">
                  <p className="text-sm text-text-muted">{cut.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Titles */}
        <section className="bg-surface border border-white/5 rounded-2xl p-6 md:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Type className="text-primary" size={20} />
            Títulos Otimizados
          </h3>
          <ul className="space-y-2">
            {result.titles.map((title, i) => (
              <li key={i} className="bg-surface-light p-3 rounded-lg border border-white/5 text-sm text-white flex gap-3">
                <span className="text-primary font-mono opacity-50">{i + 1}.</span>
                {title}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Export Resolutions */}
      <section className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Smartphone className="text-primary" size={20} />
          Formatos e Resoluções de Exportação
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-light p-5 rounded-xl border border-white/5 flex flex-col items-center text-center space-y-3 hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Smartphone size={24} />
            </div>
            <h4 className="font-bold text-white">TikTok / Shorts / Reels</h4>
            <div className="text-sm text-text-muted">Formato Vertical (9:16)</div>
            <div className="font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-md">1080 x 1920</div>
            <p className="text-xs text-text-muted mt-2">Ideal para alcance orgânico e viralização rápida.</p>
          </div>

          <div className="bg-surface-light p-5 rounded-xl border border-white/5 flex flex-col items-center text-center space-y-3 hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <Instagram size={24} />
            </div>
            <h4 className="font-bold text-white">Instagram Feed</h4>
            <div className="text-sm text-text-muted">Formato Retrato (4:5)</div>
            <div className="font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-md">1080 x 1350</div>
            <p className="text-xs text-text-muted mt-2">Maior retenção no feed sem cortar conteúdo.</p>
          </div>

          <div className="bg-surface-light p-5 rounded-xl border border-white/5 flex flex-col items-center text-center space-y-3 hover:border-primary/30 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2">
              <MonitorPlay size={24} />
            </div>
            <h4 className="font-bold text-white">YouTube Padrão</h4>
            <div className="text-sm text-text-muted">Formato Paisagem (16:9)</div>
            <div className="font-mono text-primary font-bold bg-primary/10 px-3 py-1 rounded-md">1920 x 1080</div>
            <p className="text-xs text-text-muted mt-2">Para vídeos longos, tutoriais e vlogs.</p>
          </div>
        </div>
      </section>

      {/* Hashtags */}
      <section className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Hash className="text-primary" size={20} />
          Hashtags Recomendadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <HashtagGroup title="Para Curtos" tags={result.hashtags.shorts} />
          <HashtagGroup title="Crescimento" tags={result.hashtags.reach} />
          <HashtagGroup title="Nicho" tags={result.hashtags.niche} />
        </div>
      </section>

      {/* Thumbnails */}
      <section className="bg-surface border border-white/5 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <ImageIcon className="text-primary" size={20} />
          Thumbnails Geradas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ThumbnailCard src={result.thumbnailBase64} label="Viral TikTok" filter="contrast(1.2) saturate(1.5)" />
          <ThumbnailCard src={result.thumbnailBase64} label="YouTube Premium" filter="brightness(1.1) contrast(1.1)" />
          <ThumbnailCard src={result.thumbnailBase64} label="Cinemático" filter="contrast(1.3) saturate(0.8) sepia(0.2)" />
        </div>
      </section>
    </div>
  );
}

const FactorBar = React.memo(function FactorBar({ label, value, icon }: { label: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-text-muted flex items-center gap-1.5">{icon} {label}</span>
        <span className="font-mono text-white font-medium">{value}%</span>
      </div>
      <div className="h-2 w-full bg-surface-light rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-1000"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
});

const HashtagGroup = React.memo(function HashtagGroup({ title, tags }: { title: string, tags: string[] }) {
  return (
    <div className="bg-surface-light p-4 rounded-xl border border-white/5">
      <h4 className="text-sm font-bold text-white mb-3">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded-md">
            {tag.startsWith('#') ? tag : `#${tag}`}
          </span>
        ))}
      </div>
    </div>
  );
});

const ThumbnailCard = React.memo(function ThumbnailCard({ src, label, filter }: { src: string, label: string, filter: string }) {
  return (
    <div className="group relative aspect-[9/16] bg-black rounded-xl overflow-hidden border border-white/10 cursor-pointer">
      <img 
        src={src} 
        alt={label} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ filter }}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
        <span className="text-white font-bold text-sm">{label}</span>
      </div>
    </div>
  );
});
