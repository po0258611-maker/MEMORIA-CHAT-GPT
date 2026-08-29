import React, { useState } from 'react';
import { X, Wand2, Sparkles, Lightbulb } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AIEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
  backgroundImage: string;
}

export default function AIEditModal({ isOpen, onClose, onGenerate, isGenerating, backgroundImage }: AIEditModalProps) {
  const [prompt, setPrompt] = useState("Refinar a legibilidade do texto, realçar o rosto e aplicar cores vibrantes.");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const match = backgroundImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      
      if (!match) {
        throw new Error("Formato de imagem inválido");
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            },
            {
              text: "Analise esta imagem de fundo. Crie um prompt curto e direto (máximo 20 palavras) para um gerador de imagens por IA (como Midjourney) para melhorar esta imagem, tornando-a uma capa de YouTube viral, com cores vibrantes, alto contraste, iluminação dramática e um elemento surpresa. Retorne APENAS o texto do prompt sugerido, sem aspas ou explicações adicionais.",
            },
          ],
        },
      });

      if (response.text) {
        setPrompt(response.text.trim());
      }
    } catch (error) {
      console.error("Erro ao analisar imagem:", error);
      alert("Erro ao analisar a imagem para gerar o prompt.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-primary">
            <Wand2 size={20} />
            <h3 className="font-bold text-lg text-white">Edição com IA (Nano Banana)</h3>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-white transition-colors" disabled={isGenerating}>
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-start mb-4 gap-4">
            <p className="text-sm text-text-muted flex-1">
              Descreva como você quer que a IA modifique a imagem de fundo da sua capa. 
              O modelo Nano Banana (Gemini 2.5 Flash Image) irá gerar uma nova versão baseada no seu pedido.
            </p>
            <button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || isGenerating}
              className="flex items-center gap-2 bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {isAnalyzing ? (
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Lightbulb size={16} />
              )}
              {isAnalyzing ? "Analisando..." : "Sugerir Prompt"}
            </button>
          </div>
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-text-muted focus:outline-none focus:border-primary resize-none h-32"
            placeholder="Ex: Adicione explosões ao fundo, deixe as cores mais quentes..."
            disabled={isGenerating || isAnalyzing}
          />

          <div className="mt-4 flex flex-wrap gap-2">
            <button 
              onClick={() => setPrompt("Refinar a legibilidade do texto, realçar o rosto e aplicar cores vibrantes.")}
              className="text-xs bg-white/5 hover:bg-white/10 text-text-muted hover:text-white px-3 py-1.5 rounded-full transition-colors border border-white/10"
              disabled={isGenerating || isAnalyzing}
            >
              Refinar Imagem
            </button>
            <button 
              onClick={() => setPrompt("Deixe com estilo de capa de YouTube viral, cores vibrantes, alto contraste, adicione um elemento surpresa")}
              className="text-xs bg-white/5 hover:bg-white/10 text-text-muted hover:text-white px-3 py-1.5 rounded-full transition-colors border border-white/10"
              disabled={isGenerating || isAnalyzing}
            >
              Estilo Viral
            </button>
            <button 
              onClick={() => setPrompt("Transforme em uma ilustração 3D estilo Pixar, cores quentes e iluminação suave")}
              className="text-xs bg-white/5 hover:bg-white/10 text-text-muted hover:text-white px-3 py-1.5 rounded-full transition-colors border border-white/10"
              disabled={isGenerating || isAnalyzing}
            >
              Estilo 3D
            </button>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button 
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-medium text-white hover:bg-white/5 transition-colors"
              disabled={isGenerating}
            >
              Cancelar
            </button>
            <button 
              onClick={() => onGenerate(prompt)}
              disabled={!prompt.trim() || isGenerating}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-xl font-bold transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Gerar Imagem
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
