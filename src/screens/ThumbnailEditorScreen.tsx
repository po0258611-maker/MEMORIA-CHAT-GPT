import React, { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenAI } from '@google/genai';
import { CanvasElement, ThumbnailProject } from '../types/editor';
import EditorCanvas from '../components/editor/EditorCanvas';
import Toolbar from '../components/editor/Toolbar';
import PropertiesPanel from '../components/editor/PropertiesPanel';
import TopBar from '../components/editor/TopBar';
import AIEditModal from '../components/editor/AIEditModal';

export default function ThumbnailEditorScreen({ thumbnailBase64, onBack }: { thumbnailBase64: string, onBack: () => void }) {
  const stageRef = useRef<any>(null);
  
  // State
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [background, setBackground] = useState<{ type: string, value: string }>({ type: 'image', value: thumbnailBase64 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  
  // History for Undo/Redo
  type HistoryState = { elements: CanvasElement[], background: { type: string, value: string } };
  const [history, setHistory] = useState<HistoryState[]>([{ elements: [], background: { type: 'image', value: thumbnailBase64 } }]);
  const [historyStep, setHistoryStep] = useState(0);

  // Initialize with base image if empty
  useEffect(() => {
    if (elements.length === 0 && historyStep === 0) {
      // Background is handled separately, but we could add initial text
      const initialText: CanvasElement = {
        id: uuidv4(),
        type: 'text',
        x: 1080 / 2 - 200,
        y: 1920 / 2 - 50,
        width: 400,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        rotation: 0,
        opacity: 1,
        layerIndex: 1,
        text: 'TEXTO VIRAL',
        fontFamily: 'Impact',
        fontSize: 80,
        fill: '#FFFFFF',
        align: 'center',
        shadowColor: 'rgba(0,0,0,0.8)',
        shadowBlur: 20,
        shadowOffsetX: 0,
        shadowOffsetY: 4,
      };
      const newElements = [initialText];
      setElements(newElements);
      setHistory([{ elements: newElements, background: { type: 'image', value: thumbnailBase64 } }]);
    }
  }, []);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Autosave simulation
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Autosaving project...');
      // In a real app, save to local storage or Firebase here
    }, 5000);
    return () => clearInterval(interval);
  }, [elements, background]);

  const handleUpdateHistory = useCallback((newElements: CanvasElement[], newBackground?: { type: string, value: string }) => {
    const bg = newBackground || background;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ elements: newElements, background: bg });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(newElements);
    if (newBackground) setBackground(newBackground);
  }, [history, historyStep, background]);

  const handleUndo = () => {
    if (historyStep === 0) return;
    const newStep = historyStep - 1;
    setHistoryStep(newStep);
    setElements(history[newStep].elements);
    setBackground(history[newStep].background);
    setSelectedId(null);
  };

  const handleRedo = () => {
    if (historyStep === history.length - 1) return;
    const newStep = historyStep + 1;
    setHistoryStep(newStep);
    setElements(history[newStep].elements);
    setBackground(history[newStep].background);
    setSelectedId(null);
  };

  const handleChange = (newAttrs: CanvasElement) => {
    const newElements = elements.map((el) => {
      if (el.id === newAttrs.id) {
        return newAttrs;
      }
      return el;
    });
    handleUpdateHistory(newElements);
  };

  const handleDelete = () => {
    if (!selectedId) return;
    const newElements = elements.filter(el => el.id !== selectedId);
    handleUpdateHistory(newElements);
    setSelectedId(null);
  };

  const handleExport = async () => {
    if (!stageRef.current) return;
    
    // Deselect before export
    setSelectedId(null);
    
    setTimeout(async () => {
      const uri = stageRef.current.toDataURL({ pixelRatio: 1 });
      
      // Try to use Web Share API on mobile
      if (navigator.share && /android|iphone|ipad|ipod/i.test(navigator.userAgent)) {
        try {
          const response = await fetch(uri);
          const blob = await response.blob();
          const file = new File([blob], `thumbnail-${Date.now()}.png`, { type: 'image/png' });
          await navigator.share({
            title: 'Minha Capa Viral',
            files: [file]
          });
          return;
        } catch (error) {
          console.log('Erro ao compartilhar', error);
          // Fallback to download if share fails
        }
      }

      // Fallback for desktop or if share fails
      const link = document.createElement('a');
      link.download = `thumbnail-${Date.now()}.png`;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 100); // Small delay to allow transformer to disappear
  };

  const handleAIEdit = async (prompt: string, useFullCanvas: boolean = false) => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      let sourceImage = background.value;
      
      // If using full canvas, deselect first to remove transformer, then get data URL
      if (useFullCanvas && stageRef.current) {
        setSelectedId(null);
        // Small delay to let React re-render without transformer
        await new Promise(resolve => setTimeout(resolve, 50));
        sourceImage = stageRef.current.toDataURL({ pixelRatio: 1 });
      }
      
      const match = sourceImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (!match) {
        throw new Error("Formato de imagem inválido");
      }
      const mimeType = match[1];
      const base64Data = match[2];

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
      });

      let newImageUrl = '';
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          newImageUrl = `data:${part.inlineData.mimeType || 'image/jpeg'};base64,${part.inlineData.data}`;
          break;
        }
      }

      if (newImageUrl) {
        if (useFullCanvas) {
          // If we baked the text into the image, clear the editable elements
          handleUpdateHistory([], { type: 'image', value: newImageUrl });
        } else {
          handleUpdateHistory(elements, { type: 'image', value: newImageUrl });
        }
        setIsAIModalOpen(false);
      } else {
        alert("A IA não retornou uma imagem. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro na edição com IA:", error);
      alert("Erro ao editar imagem com IA. Verifique o console para mais detalhes.");
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedElement = elements.find(el => el.id === selectedId);

  return (
    <div className="h-[100dvh] flex flex-col bg-bg overflow-hidden">
      <TopBar 
        onBack={onBack}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={() => showToast("Projeto salvo localmente!")}
        onExport={handleExport}
        canUndo={historyStep > 0}
        canRedo={historyStep < history.length - 1}
      />
      
      {toastMessage && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-surface-light border border-white/10 text-white px-4 py-2 rounded-full shadow-lg z-50 animate-in fade-in slide-in-from-top-4">
          {toastMessage}
        </div>
      )}
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Canvas Area */}
        <div className="flex-1 relative bg-black/50 overflow-hidden flex flex-col">
          <EditorCanvas 
            elements={elements}
            background={background}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onChange={handleChange}
            stageRef={stageRef}
          />
          
          <div className="mt-auto">
            <Toolbar 
              onAIEdit={() => setIsAIModalOpen(true)}
              onQuickEnhance={() => handleAIEdit("Refinar a legibilidade do texto, realçar o rosto e aplicar cores vibrantes.", true)}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* Properties Panel */}
        {selectedElement && (
          <PropertiesPanel 
            element={selectedElement}
            onChange={handleChange}
            onDelete={handleDelete}
          />
        )}
      </div>

      <AIEditModal 
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onGenerate={handleAIEdit}
        isGenerating={isGenerating}
        backgroundImage={background.value}
      />
    </div>
  );
}
