import React from 'react';
import { CanvasElement } from '../../types/editor';

interface PropertiesPanelProps {
  element: CanvasElement;
  onChange: (newAttrs: CanvasElement) => void;
  onDelete: () => void;
}

export default function PropertiesPanel({ element, onChange, onDelete }: PropertiesPanelProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsedValue: any = value;
    
    if (name === 'fontSize' || name === 'opacity') {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) {
        parsedValue = name === 'fontSize' ? 20 : 1; // Default fallbacks to prevent rendering crash
      }
    }

    onChange({
      ...element,
      [name]: parsedValue,
    });
  };

  return (
    <div className="w-64 bg-surface border-l border-white/10 p-4 flex flex-col gap-4 overflow-y-auto">
      <h3 className="text-lg font-bold text-white mb-2">Propriedades</h3>

      {element.type === 'text' && (
        <>
          <div className="space-y-2">
            <label className="text-xs text-text-muted">Texto</label>
            <input
              type="text"
              name="text"
              value={element.text || ''}
              onChange={handleChange}
              className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-text-muted">Fonte</label>
            <select
              name="fontFamily"
              value={element.fontFamily || 'Impact'}
              onChange={handleChange}
              className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white text-sm"
            >
              <option value="Impact">Impact</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Bebas Neue">Bebas Neue</option>
              <option value="Anton">Anton</option>
              <option value="Arial">Arial</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-text-muted">Tamanho</label>
            <input
              type="number"
              name="fontSize"
              value={element.fontSize || 20}
              onChange={handleChange}
              className="w-full bg-surface-light border border-white/10 rounded-lg p-2 text-white text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-text-muted">Cor</label>
            <input
              type="color"
              name="fill"
              value={element.fill || '#ffffff'}
              onChange={handleChange}
              className="w-full h-8 bg-surface-light border border-white/10 rounded-lg cursor-pointer"
            />
          </div>
        </>
      )}

      {element.type === 'shape' && (
        <>
          <div className="space-y-2">
            <label className="text-xs text-text-muted">Cor</label>
            <input
              type="color"
              name="fill"
              value={element.fill || '#ffffff'}
              onChange={handleChange}
              className="w-full h-8 bg-surface-light border border-white/10 rounded-lg cursor-pointer"
            />
          </div>
        </>
      )}

      <div className="space-y-2">
        <label className="text-xs text-text-muted">Opacidade</label>
        <input
          type="range"
          name="opacity"
          min="0"
          max="1"
          step="0.1"
          value={element.opacity || 1}
          onChange={handleChange}
          className="w-full accent-primary"
        />
      </div>

      <button
        onClick={onDelete}
        className="mt-auto bg-red-500/20 text-red-500 font-bold py-2 rounded-lg hover:bg-red-500/30 transition-colors"
      >
        Excluir Elemento
      </button>
    </div>
  );
}
