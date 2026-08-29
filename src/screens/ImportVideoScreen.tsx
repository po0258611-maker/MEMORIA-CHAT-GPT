import React, { useState, useRef, useEffect } from 'react';
import { Upload, FileVideo, ArrowLeft, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { getVideoMetadata } from '../utils/videoUtils';

export default function ImportVideoScreen({ onVideoSelect, onBack }: { onVideoSelect: (file: File) => void, onBack: () => void }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<{ duration: number; width: number; height: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setVideoUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setVideoUrl(null);
    }
  }, [selectedFile]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setError(null);
    if (!file.type.startsWith('video/')) {
      setError("Por favor, selecione um arquivo de vídeo válido (MP4, MOV, etc).");
      return;
    }
    setSelectedFile(file);
    try {
      const meta = await getVideoMetadata(file);
      setMetadata(meta);
    } catch (err) {
      console.error("Erro ao ler metadados do vídeo", err);
      setError("Não foi possível ler os metadados deste vídeo. Ele pode estar corrompido ou em um formato não suportado.");
    }
  };

  const formatSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-surface rounded-full transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-2xl font-display font-bold text-white">Importar Vídeo</h1>
      </header>

      {!selectedFile ? (
        <div 
          className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-white/20 bg-surface'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="w-20 h-20 bg-surface-light rounded-full flex items-center justify-center mb-4">
            <Upload size={40} className="text-primary" />
          </div>
          <h3 className="text-xl font-bold text-white text-center">Arraste seu vídeo aqui</h3>
          <p className="text-text-muted text-center mb-6">ou selecione do seu dispositivo (MP4, MOV)</p>
          
          <input 
            ref={inputRef}
            type="file" 
            accept="video/*" 
            onChange={handleChange} 
            className="hidden" 
          />
          
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-xs">
            <button 
              onClick={() => inputRef.current?.click()}
              className="flex-1 bg-primary text-black font-bold py-3 px-6 rounded-xl hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
            >
              <FileVideo size={20} />
              Galeria
            </button>
            <button 
              onClick={() => setError("A integração com o Google Drive estará disponível em breve.")}
              className="flex-1 bg-surface-light text-white font-medium py-3 px-6 rounded-xl hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2"
            >
              <ImageIcon size={20} />
              Drive
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 max-w-md w-full">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          <div className="bg-surface border border-white/10 rounded-2xl overflow-hidden">
            <div className="aspect-video bg-black relative">
              {videoUrl && (
                <video 
                  src={videoUrl} 
                  controls 
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              )}
            </div>
            <div className="p-6">
              <h3 className="text-lg font-bold text-white mb-4 truncate">{selectedFile.name}</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-surface-light p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-text-muted block mb-1">Tamanho</span>
                  <span className="font-mono text-sm text-white">{formatSize(selectedFile.size)}</span>
                </div>
                <div className="bg-surface-light p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-text-muted block mb-1">Duração</span>
                  <span className="font-mono text-sm text-white">{metadata ? formatDuration(metadata.duration) : '...'}</span>
                </div>
                <div className="bg-surface-light p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-text-muted block mb-1">Resolução</span>
                  <span className="font-mono text-sm text-white">{metadata ? `${metadata.width}x${metadata.height}` : '...'}</span>
                </div>
                <div className="bg-surface-light p-3 rounded-xl border border-white/5">
                  <span className="text-xs text-text-muted block mb-1">Formato</span>
                  <span className="font-mono text-sm text-white">{selectedFile.type.split('/')[1].toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setSelectedFile(null)}
              className="flex-1 bg-surface-light text-white font-medium py-4 px-6 rounded-xl hover:bg-white/10 transition-colors border border-white/10"
            >
              Trocar Vídeo
            </button>
            <button 
              onClick={() => onVideoSelect(selectedFile)}
              className="flex-[2] bg-primary text-black font-bold py-4 px-6 rounded-xl hover:bg-primary-dark transition-colors text-lg shadow-[0_0_20px_rgba(0,255,102,0.3)]"
            >
              Analisar Vídeo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
