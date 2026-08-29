import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image as KonvaImage, Text, Rect, Circle, Arrow, Transformer } from 'react-konva';
import useImage from 'use-image';
import { CanvasElement } from '../../types/editor';

interface EditorCanvasProps {
  elements: CanvasElement[];
  background: { type: string, value: string, blur?: number, contrast?: number, saturation?: number, brightness?: number };
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onChange: (newAttrs: CanvasElement) => void;
  stageRef: React.RefObject<any>;
}

const URLImage = ({ element, isSelected, onSelect, onChange }: any) => {
  const isDataUrl = element.src?.startsWith('data:');
  const [image] = useImage(element.src, isDataUrl ? undefined : 'anonymous');
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <KonvaImage
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...element}
        image={image}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const TextElement = ({ element, isSelected, onSelect, onChange }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
      <Text
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...element}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...element,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...element,
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            fontSize: element.fontSize * scaleY, // Scale font size instead of height for text
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          anchorSize={24}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right', 'middle-left', 'middle-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const ShapeElement = ({ element, isSelected, onSelect, onChange }: any) => {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const commonProps = {
    onClick: onSelect,
    onTap: onSelect,
    ref: shapeRef,
    ...element,
    draggable: true,
    onDragEnd: (e: any) => {
      onChange({
        ...element,
        x: e.target.x(),
        y: e.target.y(),
      });
    },
    onTransformEnd: (e: any) => {
      const node = shapeRef.current;
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();
      node.scaleX(1);
      node.scaleY(1);
      onChange({
        ...element,
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width: Math.max(5, node.width() * scaleX),
        height: Math.max(5, node.height() * scaleY),
      });
    }
  };

  let ShapeComponent;
  if (element.shapeType === 'circle') {
    ShapeComponent = <Circle {...commonProps} radius={element.width / 2} />;
  } else if (element.shapeType === 'arrow') {
    ShapeComponent = <Arrow {...commonProps} points={[0, 0, element.width, element.height]} pointerLength={20} pointerWidth={20} />;
  } else {
    ShapeComponent = <Rect {...commonProps} />;
  }

  return (
    <React.Fragment>
      {ShapeComponent}
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

export default function EditorCanvas({ elements, background, selectedId, onSelect, onChange, stageRef }: EditorCanvasProps) {
  const isDataUrl = background.type === 'image' && background.value?.startsWith('data:');
  const [bgImage] = useImage(background.type === 'image' ? background.value : '', isDataUrl ? undefined : 'anonymous');
  
  // Calculate scale to fit container
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  const CANVAS_WIDTH = 1080;
  const CANVAS_HEIGHT = 1920;

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        
        if (containerWidth === 0 || containerHeight === 0) return;
        
        const scaleX = containerWidth / CANVAS_WIDTH;
        const scaleY = containerHeight / CANVAS_HEIGHT;
        
        // Use the smaller scale to fit entirely in the container, ensure it's > 0
        setScale(Math.max(0.05, Math.min(scaleX, scaleY) * 0.95)); // 95% to leave a small margin
      }
    };

    updateScale();
    // Sometimes it takes a frame for flexbox to assign dimensions
    requestAnimationFrame(updateScale);
    
    // Use ResizeObserver for more reliable resizing
    const observer = new ResizeObserver(updateScale);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage() || e.target.attrs.id === 'bg-rect' || e.target.attrs.id === 'bg-image';
    if (clickedOnEmpty) {
      onSelect(null);
    }
  };

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-bg overflow-hidden">
      <div 
        className="shadow-2xl border border-white/10"
        style={{
          width: CANVAS_WIDTH * scale,
          height: CANVAS_HEIGHT * scale,
          backgroundColor: background.type === 'color' ? background.value : '#000'
        }}
      >
        <Stage
          width={CANVAS_WIDTH * scale}
          height={CANVAS_HEIGHT * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
          ref={stageRef}
        >
          <Layer>
            {/* Background */}
            {background.type === 'image' && bgImage && (
              <KonvaImage
                id="bg-image"
                image={bgImage}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                // Basic filters could be applied here if needed, but Konva filters are complex
                // We'll keep it simple for now
              />
            )}
            {background.type === 'color' && (
              <Rect
                id="bg-rect"
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                fill={background.value}
              />
            )}

            {/* Elements */}
            {elements.map((el, i) => {
              const isSelected = el.id === selectedId;
              if (el.type === 'text' || el.type === 'emoji') {
                return (
                  <TextElement
                    key={el.id}
                    element={el}
                    isSelected={isSelected}
                    onSelect={() => onSelect(el.id)}
                    onChange={onChange}
                  />
                );
              } else if (el.type === 'image' || el.type === 'sticker') {
                return (
                  <URLImage
                    key={el.id}
                    element={el}
                    isSelected={isSelected}
                    onSelect={() => onSelect(el.id)}
                    onChange={onChange}
                  />
                );
              } else if (el.type === 'shape') {
                return (
                  <ShapeElement
                    key={el.id}
                    element={el}
                    isSelected={isSelected}
                    onSelect={() => onSelect(el.id)}
                    onChange={onChange}
                  />
                );
              }
              return null;
            })}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
