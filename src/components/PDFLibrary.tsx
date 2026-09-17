import React, { useRef } from 'react';
import { Upload, FileText, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { PdfDocument } from '../types';

interface PDFLibraryProps {
  pdfs: PdfDocument[];
  setPdfs: React.Dispatch<React.SetStateAction<PdfDocument[]>>;
}

export function PDFLibrary({ pdfs, setPdfs }: PDFLibraryProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    const newPdf: PdfDocument = {
      id: uuidv4(),
      name: file.name,
      url,
      pages: 0,
      uploadDate: new Date().toLocaleDateString(),
    };

    setPdfs(prev => [...prev, newPdf]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const deletePdf = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPdfs(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1 bg-[#F8F9FA] overflow-y-auto p-8 relative">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-brand-dark-green">My PDF Library</h2>
            <p className="text-gray-500 mt-1">Upload and manage your teaching materials.</p>
          </div>
          
          <div>
            <input 
              type="file" 
              accept="application/pdf" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-brand-dark-green text-white px-5 py-2.5 rounded-md hover:bg-brand-secondary-green transition-colors font-medium shadow-sm"
            >
              <Upload className="w-5 h-5" />
              Upload PDF
            </button>
          </div>
        </div>

        {pdfs.length === 0 ? (
          <div className="w-full bg-white border border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No PDFs Uploaded</h3>
            <p className="text-gray-500 text-center max-w-sm mb-6">
              Upload your first Quran or Tajweed PDF to start teaching with the interactive board.
            </p>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-brand-dark-green font-medium hover:underline"
            >
              Click to upload a file
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pdfs.map((pdf) => (
              <div key={pdf.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow group flex flex-col">
                <div className="h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center text-gray-300 relative group-hover:bg-green-50 transition-colors">
                  <FileText className="w-12 h-12 group-hover:text-brand-secondary-green transition-colors" />
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-gray-800 text-lg mb-1 truncate" title={pdf.name}>
                    {pdf.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-4 mt-auto">
                    <span>{pdf.uploadDate}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button 
                      onClick={(e) => deletePdf(pdf.id, e)}
                      className="flex-1 flex items-center justify-center bg-white border border-gray-200 text-red-500 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
                      title="Delete PDF"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
