import React, { useState, useEffect } from 'react';
import { Search, Hash, Type, Loader2 } from 'lucide-react';
import { useDebounce } from '../utils/useDebounce';

// Simulated Services
const HashtagResearchService = {
  search: async (query: string): Promise<string[]> => {
    if (!query) return [];
    return new Promise(resolve => {
      setTimeout(() => {
        const base = query.toLowerCase().replace(/\s+/g, '');
        resolve([
          `#${base}`,
          `#${base}viral`,
          `#dicasde${base}`,
          `#${base}brasil`,
          `#${base}2026`
        ]);
      }, 500); // 500ms delay as requested
    });
  }
};

const TitleResearchService = {
  search: async (query: string): Promise<string[]> => {
    if (!query) return [];
    return new Promise(resolve => {
      setTimeout(() => {
        resolve([
          `3 formas de ${query} rápido`,
          `Esse erro está te impedindo de ${query}`,
          `Como ${query} mesmo começando do zero`,
          `O segredo para ${query} que ninguém te conta`,
          `Pare de errar ao tentar ${query}`
        ]);
      }, 700); // 700ms delay as requested
    });
  }
};

export default function ResearchScreen() {
  const [query, setQuery] = useState('');
  const debouncedHashtagQuery = useDebounce(query, 500);
  const debouncedTitleQuery = useDebounce(query, 700);

  const [hashtags, setHashtags] = useState<string[]>([]);
  const [titles, setTitles] = useState<string[]>([]);
  
  const [isHashtagLoading, setIsHashtagLoading] = useState(false);
  const [isTitleLoading, setIsTitleLoading] = useState(false);

  // Hashtag Effect
  useEffect(() => {
    if (debouncedHashtagQuery) {
      setIsHashtagLoading(true);
      HashtagResearchService.search(debouncedHashtagQuery).then(res => {
        setHashtags(res);
        setIsHashtagLoading(false);
      });
    } else {
      setHashtags([]);
      setIsHashtagLoading(false);
    }
  }, [debouncedHashtagQuery]);

  // Title Effect
  useEffect(() => {
    if (debouncedTitleQuery) {
      setIsTitleLoading(true);
      TitleResearchService.search(debouncedTitleQuery).then(res => {
        setTitles(res);
        setIsTitleLoading(false);
      });
    } else {
      setTitles([]);
      setIsTitleLoading(false);
    }
  }, [debouncedTitleQuery]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (e.target.value) {
      setIsHashtagLoading(true);
      setIsTitleLoading(true);
    } else {
      setIsHashtagLoading(false);
      setIsTitleLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 pb-24">
      <header>
        <h1 className="text-2xl font-display font-bold text-white mb-2">Pesquisa em Tempo Real</h1>
        <p className="text-text-muted text-sm">Gere hashtags e títulos virais instantaneamente</p>
      </header>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-text-muted" size={20} />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Digite o tema do seu vídeo (ex: finanças)"
          className="w-full bg-surface border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-text-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hashtags Section */}
        <section className="bg-surface border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Hash className="text-primary" size={20} />
              Hashtags Virais
            </h3>
            {isHashtagLoading && <Loader2 className="animate-spin text-primary" size={20} />}
          </div>
          
          <div className="min-h-[150px]">
            {!query ? (
              <div className="h-full flex items-center justify-center text-text-muted text-sm text-center">
                Digite um tema para gerar hashtags
              </div>
            ) : hashtags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, i) => (
                  <span key={i} className="bg-primary/10 text-primary px-3 py-1.5 rounded-lg font-mono text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            ) : !isHashtagLoading ? (
              <div className="h-full flex items-center justify-center text-text-muted text-sm text-center">
                Nenhuma hashtag encontrada
              </div>
            ) : null}
          </div>
        </section>

        {/* Titles Section */}
        <section className="bg-surface border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Type className="text-primary" size={20} />
              Títulos Sugeridos
            </h3>
            {isTitleLoading && <Loader2 className="animate-spin text-primary" size={20} />}
          </div>
          
          <div className="min-h-[150px]">
            {!query ? (
              <div className="h-full flex items-center justify-center text-text-muted text-sm text-center">
                Digite um tema para gerar títulos
              </div>
            ) : titles.length > 0 ? (
              <div className="space-y-3">
                {titles.map((title, i) => (
                  <div key={i} className="bg-surface-light p-3 rounded-xl border border-white/5 text-sm text-white">
                    {title}
                  </div>
                ))}
              </div>
            ) : !isTitleLoading ? (
              <div className="h-full flex items-center justify-center text-text-muted text-sm text-center">
                Nenhum título encontrado
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
