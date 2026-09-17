import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle as KonvaCircle, Arrow as KonvaArrow, Rect as KonvaRect, Text as KonvaText } from 'react-konva';
import type { DrawingTool, DrawingShape } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface DrawingOverlayProps {
  width: number;
  height: number;
  activeTool: DrawingTool;
  pageIndex: number;
  resetKey: number;
  brushSize?: number;
  textSize?: number;
  highlighterOpacity?: number;
  undoTrigger?: number;
  redoTrigger?: number;
  drawingColor?: string;
  fillColor?: string;
  fillType?: 'none' | 'transparent' | 'semi' | 'solid';
  isRounded?: boolean;
  focusMode?: 'highlight' | 'zoom';
  focusSpeed?: 'slow' | 'normal' | 'fast';
  onFocusRegion?: (rect: { x: number, y: number, w: number, h: number }) => void;
}

export function DrawingOverlay({ 
  width, height, activeTool, pageIndex, resetKey, 
  brushSize = 4, textSize = 24, highlighterOpacity = 0.4, 
  undoTrigger = 0, redoTrigger = 0,
  drawingColor = '#eab308', fillColor = '#fef08a80', fillType = 'semi',
  isRounded = true, focusMode = 'zoom', focusSpeed = 'normal', onFocusRegion
}: DrawingOverlayProps) {
  const [shapesPerPage, setShapesPerPage] = useState<Record<number, DrawingShape[]>>({});
  const [history, setHistory] = useState<Record<number, DrawingShape[][]>>({});
  const [historyStep, setHistoryStep] = useState<Record<number, number>>({});
  const [editingText, setEditingText] = useState<{ id: string, x: number, y: number, text: string } | null>(null);
  
  const isDrawing = useRef(false);
  const currentShapeId = useRef<string | null>(null);

  // Clear annotations when resetKey changes
  useEffect(() => {
    if (resetKey > 0) {
      saveToHistory(pageIndex, []);
    }
  }, [resetKey, pageIndex]);

  // Undo/Redo listeners
  useEffect(() => {
    if (undoTrigger > 0) handleUndo();
  }, [undoTrigger]);

  useEffect(() => {
    if (redoTrigger > 0) handleRedo();
  }, [redoTrigger]);

  const saveToHistory = (page: number, newShapes: DrawingShape[]) => {
    setShapesPerPage(prev => ({ ...prev, [page]: newShapes }));
    
    setHistory(prev => {
      const pageHistory = prev[page] || [[]];
      const step = historyStep[page] || 0;
      // truncate future history if we draw after undoing
      const newHistory = [...pageHistory.slice(0, step + 1), newShapes];
      return { ...prev, [page]: newHistory };
    });
    
    setHistoryStep(prev => ({
      ...prev,
      [page]: (prev[page] || 0) + 1
    }));
  };

  const handleUndo = () => {
    const step = historyStep[pageIndex] || 0;
    if (step > 0) {
      const newStep = step - 1;
      setHistoryStep(prev => ({ ...prev, [pageIndex]: newStep }));
      const pageHistory = history[pageIndex] || [[]];
      setShapesPerPage(prev => ({ ...prev, [pageIndex]: pageHistory[newStep] }));
    }
  };

  const handleRedo = () => {
    const step = historyStep[pageIndex] || 0;
    const pageHistory = history[pageIndex] || [[]];
    if (step < pageHistory.length - 1) {
      const newStep = step + 1;
      setHistoryStep(prev => ({ ...prev, [pageIndex]: newStep }));
      setShapesPerPage(prev => ({ ...prev, [pageIndex]: pageHistory[newStep] }));
    }
  };

  const shapes = shapesPerPage[pageIndex] || [];

  const handleMouseDown = (e: any) => {
    if (editingText) {
      // If clicking outside while editing, commit the text
      const shapeIndex = shapes.findIndex(s => s.id === editingText.id);
      if (shapeIndex !== -1 && editingText.text.trim() !== '') {
        const newShapes = [...shapes];
        newShapes[shapeIndex] = { ...newShapes[shapeIndex], text: editingText.text };
        saveToHistory(pageIndex, newShapes);
      } else if (shapeIndex !== -1 && editingText.text.trim() === '') {
        const newShapes = shapes.filter(s => s.id !== editingText.id);
        saveToHistory(pageIndex, newShapes);
      }
      setEditingText(null);
      return;
    }

    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const id = uuidv4();
    currentShapeId.current = id;

    let computedColor = drawingColor;
    let computedStrokeWidth = brushSize;
    let computedOpacity = 1;

    if (activeTool === 'highlighter') {
      computedColor = drawingColor;
      computedStrokeWidth = Math.max(20, brushSize * 4);
      computedOpacity = highlighterOpacity;
    } else if (activeTool === 'pencil') {
      computedStrokeWidth = Math.max(1, brushSize / 2);
    }

    const newShape: DrawingShape = {
      id,
      tool: activeTool,
      color: computedColor,
      fillColor: fillColor,
      fillType: fillType,
      isRounded: isRounded,
      points: [pos.x, pos.y],
      x: pos.x,
      y: pos.y,
      radius: 0,
      width: 0,
      height: 0,
      fontSize: textSize,
      strokeWidth: computedStrokeWidth,
      opacity: computedOpacity,
    };

    setShapesPerPage(prev => ({
      ...prev,
      [pageIndex]: [...(prev[pageIndex] || []), newShape]
    }));

    if (activeTool === 'text') {
      setEditingText({ id, x: pos.x, y: pos.y, text: '' });
      isDrawing.current = false;
      currentShapeId.current = null;
    }
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || !currentShapeId.current) return;

    const stage = e.target.getStage();
    const point = stage.getPointerPosition();

    setShapesPerPage(prev => {
      const pageShapes = prev[pageIndex] || [];
      const shapeIndex = pageShapes.findIndex(s => s.id === currentShapeId.current);
      if (shapeIndex === -1) return prev;

      const shape = { ...pageShapes[shapeIndex] };

      if (shape.tool === 'pen' || shape.tool === 'pencil' || shape.tool === 'highlighter' || shape.tool === 'eraser') {
        shape.points = [...(shape.points || []), point.x, point.y];
      } else if (shape.tool === 'circle') {
        const dx = point.x - (shape.x || 0);
        const dy = point.y - (shape.y || 0);
        shape.radius = Math.sqrt(dx * dx + dy * dy);
      } else if (shape.tool === 'rectangle') {
        shape.width = point.x - (shape.x || 0);
        shape.height = point.y - (shape.y || 0);
      } else if (shape.tool === 'line' || shape.tool === 'arrow') {
        shape.points = [shape.x || 0, shape.y || 0, point.x, point.y];
      }

      const newPageShapes = [...pageShapes];
      newPageShapes[shapeIndex] = shape;

      return {
        ...prev,
        [pageIndex]: newPageShapes
      };
    });
  };

  const handleMouseUp = () => {
    if (isDrawing.current && currentShapeId.current) {
      // End drawing, save to history
      const finalShapes = shapesPerPage[pageIndex] || [];
      const drawnShape = finalShapes.find(s => s.id === currentShapeId.current);
      saveToHistory(pageIndex, finalShapes);

      // Trigger focus effect if a shape is drawn and focus mode is enabled
      if (drawnShape && (drawnShape.tool === 'rectangle' || drawnShape.tool === 'circle') && onFocusRegion) {
        if (drawnShape.width && drawnShape.height && Math.abs(drawnShape.width) > 20 && Math.abs(drawnShape.height) > 20) {
          // It's a rectangle
          let rx = Math.min(drawnShape.x || 0, (drawnShape.x || 0) + drawnShape.width);
          let ry = Math.min(drawnShape.y || 0, (drawnShape.y || 0) + drawnShape.height);
          let rw = Math.abs(drawnShape.width);
          let rh = Math.abs(drawnShape.height);
          onFocusRegion({ x: rx, y: ry, w: rw, h: rh });
        } else if (drawnShape.radius && drawnShape.radius > 10) {
          // It's a circle
          let r = drawnShape.radius;
          onFocusRegion({ x: (drawnShape.x || 0) - r, y: (drawnShape.y || 0) - r, w: r * 2, h: r * 2 });
        }
      }
    }
    isDrawing.current = false;
    currentShapeId.current = null;
  };

  return (
    <div className="absolute inset-0 z-50">
      <Stage
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer>
          {shapes.map((shape) => {
            if (shape.tool === 'pen' || shape.tool === 'pencil' || shape.tool === 'highlighter' || shape.tool === 'eraser') {
              return (
                <Line
                  key={shape.id}
                  points={shape.points || []}
                  stroke={shape.tool === 'eraser' ? 'white' : shape.color}
                  strokeWidth={shape.tool === 'eraser' ? Math.max(20, (shape.strokeWidth || brushSize) * 4) : shape.strokeWidth || brushSize}
                  tension={shape.tool === 'pencil' ? 0 : 0.5}
                  lineCap="round"
                  lineJoin="round"
                  globalCompositeOperation={
                    shape.tool === 'eraser' ? 'destination-out' :
                    shape.tool === 'highlighter' ? 'multiply' : 'source-over'
                  }
                />
              );
            }
            if (shape.tool === 'circle') {
              let fillStr = undefined;
              if (shape.fillType === 'solid') fillStr = shape.color;
              else if (shape.fillType === 'semi' || shape.fillType === 'transparent') fillStr = shape.fillColor;

              return (
                <KonvaCircle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius || 0}
                  stroke={shape.fillType === 'transparent' ? 'transparent' : shape.color}
                  strokeWidth={shape.strokeWidth || brushSize}
                  fill={fillStr}
                />
              );
            }
            if (shape.tool === 'rectangle') {
              let fillStr = undefined;
              if (shape.fillType === 'solid') fillStr = shape.color;
              else if (shape.fillType === 'semi' || shape.fillType === 'transparent') fillStr = shape.fillColor;

              return (
                <KonvaRect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width || 0}
                  height={shape.height || 0}
                  stroke={shape.fillType === 'transparent' ? 'transparent' : shape.color}
                  strokeWidth={shape.strokeWidth || brushSize}
                  fill={fillStr}
                  cornerRadius={shape.isRounded ? 12 : 0}
                />
              );
            }
            if (shape.tool === 'line') {
              return (
                <Line
                  key={shape.id}
                  points={shape.points || []}
                  stroke={shape.color}
                  strokeWidth={shape.strokeWidth || brushSize}
                  lineCap="round"
                />
              );
            }
            if (shape.tool === 'arrow') {
              return (
                <KonvaArrow
                  key={shape.id}
                  points={shape.points || []}
                  stroke={shape.color}
                  fill={shape.color}
                  strokeWidth={shape.strokeWidth || brushSize}
                  pointerLength={10 + (shape.strokeWidth || brushSize)}
                  pointerWidth={10 + (shape.strokeWidth || brushSize)}
                />
              );
            }
            if (shape.tool === 'text') {
              if (editingText && editingText.id === shape.id) return null;
              return (
                <KonvaText
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  text={shape.text || ''}
                  fontSize={shape.fontSize || textSize}
                  fill={shape.color}
                  fontFamily="sans-serif"
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {/* Text Editing Input */}
      {editingText && (
        <textarea
          autoFocus
          value={editingText.text}
          onChange={(e) => setEditingText({ ...editingText, text: e.target.value })}
          style={{
            position: 'absolute',
            top: editingText.y,
            left: editingText.x,
            fontSize: `${textSize}px`,
            color: '#ef4444',
            background: 'transparent',
            border: '1px dashed #ef4444',
            outline: 'none',
            resize: 'none',
            overflow: 'hidden',
            minHeight: `${textSize * 1.5}px`,
            minWidth: '100px',
            fontFamily: 'sans-serif',
            whiteSpace: 'pre',
            padding: 0,
            margin: 0,
            lineHeight: 1
          }}
          onKeyDown={(e) => {
            // Commit on Enter, but allow shift+Enter for new line
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const shapeIndex = shapes.findIndex(s => s.id === editingText.id);
              if (shapeIndex !== -1 && editingText.text.trim() !== '') {
                const newShapes = [...shapes];
                newShapes[shapeIndex] = { ...newShapes[shapeIndex], text: editingText.text };
                saveToHistory(pageIndex, newShapes);
              }
              setEditingText(null);
            }
          }}
        />
      )}
    </div>
  );
}
