import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import type { PdfDocument, WorkspaceState } from '../types';
import { DrawingOverlay } from './DrawingOverlay';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdf: PdfDocument;
  workspace: WorkspaceState;
  updateWorkspace?: (updates: Partial<WorkspaceState>) => void;
  setTotalPages: (pages: number) => void;
  isPresentationMode?: boolean;
}

export function PDFViewer({ pdf, workspace, updateWorkspace, setTotalPages, isPresentationMode = false }: PDFViewerProps) {
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setTotalPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: workspace.zoom });
    setPageDimensions({ width: viewport.width, height: viewport.height });
  };

  return (
    <div className={`flex-1 overflow-y-auto overflow-x-auto flex flex-col items-center relative p-4 min-h-[400px] ${isPresentationMode ? 'bg-black' : 'bg-[#F8F9FA]'}`}>
      <div className={`relative shadow-2xl bg-white rounded-sm inline-block ${isPresentationMode ? 'border-none' : 'border border-gray-200'}`} style={{ width: pageDimensions.width, height: pageDimensions.height }}>
        <Document
          file={pdf.url}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col items-center"
        >
          <Page 
            pageNumber={workspace.currentPage} 
            scale={workspace.zoom}
            onLoadSuccess={onPageLoadSuccess}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        </Document>

        {pageDimensions.width > 0 && (
          <DrawingOverlay 
            width={pageDimensions.width} 
            height={pageDimensions.height} 
            activeTool={workspace.activeTool} 
            pageIndex={workspace.currentPage}
            resetKey={workspace.resetDrawings}
            brushSize={workspace.brushSize}
            textSize={workspace.textSize}
            highlighterOpacity={workspace.highlighterOpacity}
            undoTrigger={workspace.undoTrigger}
            redoTrigger={workspace.redoTrigger}
            drawingColor={workspace.drawingColor}
            fillColor={workspace.fillColor}
            fillType={workspace.fillType}
            isRounded={workspace.isRounded}
            focusMode={workspace.focusMode}
            focusSpeed={workspace.focusSpeed}
            autoConvertHandwriting={workspace.autoConvertHandwriting}
            convertTrigger={workspace.convertTrigger}
            onFocusRegion={updateWorkspace ? (rect) => {
              if (workspace.focusMode === 'zoom') {
                updateWorkspace({ currentFocus: rect });
              }
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}
