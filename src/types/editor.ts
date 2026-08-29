export type ElementType = 'text' | 'image' | 'sticker' | 'shape' | 'emoji';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  opacity: number;
  layerIndex: number;
  
  // Specific properties
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fill?: string;
  align?: 'left' | 'center' | 'right';
  shadowColor?: string;
  shadowBlur?: number;
  shadowOffsetX?: number;
  shadowOffsetY?: number;
  stroke?: string;
  strokeWidth?: number;
  
  src?: string; // For images/stickers
  
  shapeType?: 'rect' | 'circle' | 'arrow';
  cornerRadius?: number;
}

export interface ThumbnailProject {
  projectId: string;
  userId: string;
  canvasElements: CanvasElement[];
  background: {
    type: 'color' | 'image' | 'gradient';
    value: string; // hex color, url, or gradient string
    blur?: number;
    contrast?: number;
    saturation?: number;
    brightness?: number;
  };
  createdAt: number;
  updatedAt: number;
}
