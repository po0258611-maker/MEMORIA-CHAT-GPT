import React from 'react';
import { ArrowLeft, Download, Undo2, Redo2, Save, Wand2 } from 'lucide-react';

interface TopBarProps {
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export default function TopBar({ onBack, onUndo, onRedo, onSave, onExport, canUndo, canRedo }: TopBarProps) {
  return (
    <header className="bg-surface border-b border-white/10 p-4 flex items-center justify-between z-10">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 hover:bg-surface-light rounded-full transition-colors">
          <ArrowLeft size={24} className="text-white" />
        </button>
        <h1 className="text-xl font-display font-bold text-white hidden sm:block">Editor de Capa</h1>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onUndo} 
          disabled={!canUndo}
          className="p-2 text-text-muted hover:text-white disabled:opacity-50 transition-colors"
        >
          <Undo2 size={20} />
        </button>
        <button 
          onClick={onRedo} 
          disabled={!canRedo}
          className="p-2 text-text-muted hover:text-white disabled:opacity-50 transition-colors"
        >
          <Redo2 size={20} />
        </button>
        <div className="w-px h-6 bg-white/10 mx-2"></div>
        <button 
          onClick={onSave}
          className="bg-surface-light text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-white/10 transition-colors text-sm"
        >
          <Save size={16} />
          <span className="hidden sm:inline">Salvar</span>
        </button>
        <button 
          onClick={onExport}
          className="bg-primary text-black font-bold px-3 py-1.5 rounded-lg flex items-center gap-2 hover:bg-primary-dark transition-colors text-sm"
        >
          <Download size={16} />
          <span className="hidden sm:inline">Exportar</span>
        </button>
      </div>
    </header>
  );
}
