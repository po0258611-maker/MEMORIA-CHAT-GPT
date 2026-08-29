import React from 'react';
import { Type, Image as ImageIcon, Sparkles, Square, Smile, Layers, Wand2 } from 'lucide-react';

interface ToolbarProps {
  onAIEdit?: () => void;
  onQuickEnhance?: () => void;
  isGenerating?: boolean;
}

export default function Toolbar({ onAIEdit, onQuickEnhance, isGenerating }: ToolbarProps) {
  return (
    <div className="bg-surface border-t border-white/10 p-4 flex justify-center items-center overflow-x-auto gap-8">
      {onQuickEnhance && (
        <ToolButton 
          icon={isGenerating ? <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <Sparkles size={24} className="text-primary" />} 
          label={isGenerating ? "Gerando..." : "Refinar (IA)"} 
          onClick={onQuickEnhance} 
          disabled={isGenerating}
        />
      )}
      {onAIEdit && (
        <ToolButton icon={<Wand2 size={24} className="text-primary" />} label="IA Edit" onClick={onAIEdit} disabled={isGenerating} />
      )}
    </div>
  );
}

function ToolButton({ icon, label, onClick, disabled }: { icon: React.ReactNode, label: string, onClick: () => void, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-1 transition-colors min-w-[60px] ${disabled ? 'opacity-50 cursor-not-allowed text-text-muted' : 'text-text-muted hover:text-white'}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
