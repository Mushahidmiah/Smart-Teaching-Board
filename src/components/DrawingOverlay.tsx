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
  autoConvertHandwriting?: boolean;
  convertTrigger?: number;
}

export function DrawingOverlay({ 
  width, height, activeTool, pageIndex, resetKey, 
  brushSize = 4, textSize = 24, highlighterOpacity = 0.4, 
  undoTrigger = 0, redoTrigger = 0,
  drawingColor = '#eab308', fillColor = '#fef08a80', fillType = 'semi',
  isRounded = true, focusMode = 'zoom', focusSpeed = 'normal', onFocusRegion,
  autoConvertHandwriting = false, convertTrigger = 0
}: DrawingOverlayProps) {
  const [shapesPerPage, setShapesPerPage] = useState<Record<number, DrawingShape[]>>({});
  const [history, setHistory] = useState<Record<number, DrawingShape[][]>>({});
  const [historyStep, setHistoryStep] = useState<Record<number, number>>({});
  const [editingText, setEditingText] = useState<{ id: string, x: number, y: number, text: string } | null>(null);
  
  const stageRef = useRef<any>(null);
  const isDrawing = useRef(false);
  const currentShapeId = useRef<string | null>(null);
  const unconvertedStrokeIds = useRef<string[]>([]);
  const recognizeTimer = useRef<NodeJS.Timeout | null>(null);

  const [recognitionStatus, setRecognitionStatus] = useState<'idle' | 'recognizing' | 'done'>('idle');
  const [recognitionResult, setRecognitionResult] = useState<{ text: string, x: number, y: number } | null>(null);

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
        newShapes[shapeIndex] = { 
          ...newShapes[shapeIndex], 
          text: editingText.text,
          color: drawingColor,
          fontSize: textSize 
        };
        saveToHistory(pageIndex, newShapes);
      } else if (shapeIndex !== -1 && editingText.text.trim() === '') {
        const newShapes = shapes.filter(s => s.id !== editingText.id);
        saveToHistory(pageIndex, newShapes);
      }
      setEditingText(null);
      return;
    }

    // Don't draw if we clicked a text node with the text tool (we want to edit it) or eraser tool
    if ((activeTool === 'text' || activeTool === 'eraser') && e.target.className === 'Text') {
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

    if (activeTool === 'pen' || activeTool === 'pencil') {
      unconvertedStrokeIds.current.push(id);
      if (recognizeTimer.current) clearTimeout(recognizeTimer.current);
    }

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

      if (drawnShape && (drawnShape.tool === 'pen' || drawnShape.tool === 'pencil') && autoConvertHandwriting) {
        if (recognizeTimer.current) clearTimeout(recognizeTimer.current);
        recognizeTimer.current = setTimeout(recognizeHandwriting, 1500);
      }
    }
    isDrawing.current = false;
    currentShapeId.current = null;
  };

  useEffect(() => {
    if (convertTrigger > 0) {
      recognizeHandwriting();
    }
  }, [convertTrigger]);

  const recognizeHandwriting = async () => {
    if (unconvertedStrokeIds.current.length === 0 || !stageRef.current) return;
    
    // Find bounding box
    const currentShapes = shapesPerPage[pageIndex] || [];
    const strokesToConvert = currentShapes.filter(s => unconvertedStrokeIds.current.includes(s.id));
    if (strokesToConvert.length === 0) {
      unconvertedStrokeIds.current = [];
      return;
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    strokesToConvert.forEach(shape => {
      if (!shape.points) return;
      for (let i = 0; i < shape.points.length; i += 2) {
        const x = shape.points[i];
        const y = shape.points[i + 1];
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    });

    if (minX === Infinity) return;

    // Add padding
    const padding = 20;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(width, maxX + padding);
    maxY = Math.min(height, maxY + padding);
    const boxW = maxX - minX;
    const boxH = maxY - minY;

    setRecognitionStatus('recognizing');

    try {
      const dataURL = stageRef.current.toDataURL({
        x: minX,
        y: minY,
        width: boxW,
        height: boxH,
        pixelRatio: 2
      });

      const res = await fetch('/api/recognize-handwriting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: dataURL })
      });
      const data = await res.json();
      if (data.text) {
        setRecognitionResult({ text: data.text, x: minX, y: Math.max(0, minY - 40) });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setRecognitionStatus('done');
    }
  };

  return (
    <div className="absolute inset-0 z-50">
      <Stage
        ref={stageRef}
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
                  shadowBlur={shape.tool !== 'eraser' ? 12 : 0}
                  shadowColor={shape.color}
                  shadowOpacity={0.6}
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
                  shadowBlur={12}
                  shadowColor={shape.color}
                  shadowOpacity={0.6}
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
                  shadowBlur={12}
                  shadowColor={shape.color}
                  shadowOpacity={0.6}
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
                  shadowBlur={12}
                  shadowColor={shape.color}
                  shadowOpacity={0.6}
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
                  shadowBlur={12}
                  shadowColor={shape.color}
                  shadowOpacity={0.6}
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
                  draggable={activeTool === 'text'}
                  onDragEnd={(e) => {
                    const newShapes = [...shapes];
                    const shapeIndex = newShapes.findIndex(s => s.id === shape.id);
                    if (shapeIndex !== -1) {
                      newShapes[shapeIndex] = { ...newShapes[shapeIndex], x: e.target.x(), y: e.target.y() };
                      saveToHistory(pageIndex, newShapes);
                    }
                  }}
                  onClick={(e) => {
                    if (activeTool === 'eraser') {
                      const newShapes = shapes.filter(s => s.id !== shape.id);
                      saveToHistory(pageIndex, newShapes);
                    } else if (activeTool === 'text') {
                      e.cancelBubble = true;
                      setEditingText({ id: shape.id, x: shape.x || 0, y: shape.y || 0, text: shape.text || '' });
                    }
                  }}
                  onTap={(e) => {
                    if (activeTool === 'eraser') {
                      const newShapes = shapes.filter(s => s.id !== shape.id);
                      saveToHistory(pageIndex, newShapes);
                    } else if (activeTool === 'text') {
                      e.cancelBubble = true;
                      setEditingText({ id: shape.id, x: shape.x || 0, y: shape.y || 0, text: shape.text || '' });
                    }
                  }}
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
            color: drawingColor,
            background: 'transparent',
            border: `1px dashed ${drawingColor}`,
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
                newShapes[shapeIndex] = { 
                  ...newShapes[shapeIndex], 
                  text: editingText.text,
                  color: drawingColor,
                  fontSize: textSize 
                };
                saveToHistory(pageIndex, newShapes);
              }
              setEditingText(null);
            }
          }}
        />
      )}

      {/* Handwriting Recognition Popup */}
      {recognitionStatus === 'recognizing' && (
        <div className="absolute top-4 right-4 bg-brand-dark-green text-white px-4 py-2 rounded shadow-lg text-sm flex items-center gap-2 animate-pulse">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Recognizing Handwriting...
        </div>
      )}

      {recognitionResult && (
        <div 
          className="absolute bg-white text-gray-800 p-3 rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col gap-2 min-w-[200px]"
          style={{ top: Math.max(10, recognitionResult.y - 80), left: Math.max(10, recognitionResult.x) }}
        >
          <div className="text-sm font-semibold border-b pb-1">Recognized Text</div>
          <div className="text-lg font-bold font-sans text-brand-dark-green" dir="auto">{recognitionResult.text}</div>
          <div className="flex gap-2 mt-1">
            <button 
              onClick={() => {
                // Convert to text shape and delete handwritten strokes
                const currentShapes = shapesPerPage[pageIndex] || [];
                const newShapes = currentShapes.filter(s => !unconvertedStrokeIds.current.includes(s.id));
                const textShapeId = uuidv4();
                const textShape: DrawingShape = {
                  id: textShapeId,
                  tool: 'text',
                  color: drawingColor,
                  x: recognitionResult.x,
                  y: recognitionResult.y + 40,
                  text: recognitionResult.text,
                  fontSize: textSize,
                };
                newShapes.push(textShape);
                saveToHistory(pageIndex, newShapes);
                unconvertedStrokeIds.current = [];
                setRecognitionResult(null);
                setEditingText({ id: textShapeId, x: textShape.x || 0, y: textShape.y || 0, text: textShape.text || '' });
              }}
              className="flex-1 bg-brand-light-green text-brand-dark-green hover:bg-brand-dark-green hover:text-white px-2 py-1 rounded text-xs font-medium transition-colors"
            >
              Edit Text
            </button>
            <button 
              onClick={() => {
                setRecognitionResult(null);
                unconvertedStrokeIds.current = []; // Keep handwriting, don't try to convert these again
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium transition-colors"
            >
              Keep Handwriting
            </button>
            <button 
              onClick={() => {
                setRecognitionResult(null);
                // Retain in unconvertedStrokeIds to try again if triggered manually
              }}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
