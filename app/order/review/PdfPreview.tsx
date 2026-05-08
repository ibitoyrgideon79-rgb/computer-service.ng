"use client";

import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewProps {
  fileUrl: string;
  pageNumber: number;
  scale: number;
  onLoadSuccess: ({ numPages }: { numPages: number }) => void;
}

export default function PdfPreview({ fileUrl, pageNumber, scale, onLoadSuccess }: PdfPreviewProps) {
  return (
    <Document
      file={fileUrl}
      onLoadSuccess={onLoadSuccess}
      className="shadow-xl"
      loading={
        <div className="flex items-center justify-center h-full text-white/50">
          Loading PDF...
        </div>
      }
    >
      <Page 
        pageNumber={pageNumber} 
        scale={scale} 
        renderTextLayer={false}
        renderAnnotationLayer={false}
        className="bg-white"
      />
    </Document>
  );
}
