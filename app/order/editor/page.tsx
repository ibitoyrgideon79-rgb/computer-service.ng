"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/store/useOrderStore";
import { ChevronLeft, Save, Eye, FileText, Loader2, AlertCircle } from "lucide-react";
import dynamic from "next/dynamic";

const RichEditor = dynamic(() => import("./RichEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col items-center gap-3 text-gray-400">
        <div className="w-8 h-8 border-2 border-[#5123d4] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">Loading editor...</span>
      </div>
    </div>
  ),
});

export default function EditorPage() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrderStore();
  const [saved, setSaved] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extractError, setExtractError] = useState("");
  const hasExtracted = useRef(false);

  const uploadedFile = orderData.document;
  const uploadedFileName = uploadedFile?.name;

  // Initialize content based on file type
  const getInitialContent = () => {
    if (orderData.customDocumentHtml) return orderData.customDocumentHtml;
    if (uploadedFile?.type.startsWith("image/")) {
      return `<p><strong>Reference image:</strong> ${uploadedFile.name}</p><p>Type your document here...</p>`;
    }
    return "";
  };

  const [content, setContent] = useState(getInitialContent());

  useEffect(() => {
    if (hasExtracted.current) return;
    if (!uploadedFile || orderData.customDocumentHtml) return;
    if (uploadedFile.type !== "application/pdf") {
      hasExtracted.current = true;
      return;
    }

    // Extract text from PDF using pdfjs
    hasExtracted.current = true;

    const fileUrl = URL.createObjectURL(uploadedFile);

    import("pdfjs-dist").then(async (pdfjs) => {
      setExtracting(true);
      setExtractError("");
      
      pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

      try {
        const pdf = await pdfjs.getDocument(fileUrl).promise;
        let fullHtml = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          // Group items into lines
          const lines: string[] = [];
          let lastY: number | null = null;
          let currentLine = "";

          for (const item of textContent.items) {
            if ("str" in item) {
              const transform = (item as { transform: number[] }).transform;
              const y = transform[5];
              if (lastY !== null && Math.abs(y - lastY) > 2) {
                if (currentLine.trim()) lines.push(currentLine.trim());
                currentLine = "";
              }
              currentLine += item.str;
              lastY = y;
            }
          }
          if (currentLine.trim()) lines.push(currentLine.trim());

          const pageHtml = lines
            .map((line) => {
              const trimmed = line.trim();
              if (!trimmed) return "<p><br></p>";
              return `<p>${trimmed}</p>`;
            })
            .join("");

          fullHtml += pageHtml;
          if (i < pdf.numPages) fullHtml += `<hr><p><em>— Page ${i + 1} —</em></p>`;
        }

        setContent(fullHtml || "<p>The PDF text could not be extracted. Start typing here.</p>");
      } catch {
        setExtractError("Could not extract text from the PDF. You can still type your document below.");
        setContent("<p>Start typing your document here...</p>");
      } finally {
        setExtracting(false);
        URL.revokeObjectURL(fileUrl);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    setOrderData({ customDocumentHtml: content });
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSaveAndPreview = () => {
    setOrderData({ customDocumentHtml: content });
    router.push("/order/review");
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] text-black font-sans">
      {/* Sticky header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 max-w-7xl h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1 text-gray-600 hover:text-black transition-colors text-sm font-medium shrink-0"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>

            <div className="hidden sm:block w-px h-5 bg-gray-200" />

            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-[#5123d4] shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                {uploadedFileName ? `Editing: ${uploadedFileName}` : "Document Editor"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium border transition-all ${
                saved
                  ? "bg-green-50 border-green-300 text-green-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              {saved ? "Saved!" : "Save"}
            </button>

            <button
              onClick={handleSaveAndPreview}
              className="flex items-center gap-1.5 px-3 sm:px-5 py-2 bg-[#5123d4] hover:bg-[#401AA0] text-white rounded-md text-xs sm:text-sm font-medium transition-colors shadow-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Save &amp; Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-3 sm:px-6 max-w-5xl py-4 sm:py-8">
        {/* Extraction banner */}
        {extracting && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
            <p className="text-sm text-blue-800 font-medium">Reading your PDF... This may take a moment.</p>
          </div>
        )}

        {extractError && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-800">{extractError}</p>
          </div>
        )}

        {/* Editor card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-md overflow-hidden">
          {/* Doc top bar */}
          <div className="bg-[#f0ebff] border-b border-[#e2d9f3] px-4 sm:px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5123d4]" />
              <span className="text-xs font-medium text-[#5123d4]">
                {uploadedFileName || "New Document"}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            </div>
          </div>

          <div className="p-2 sm:p-4">
            {!extracting && (
              <RichEditor value={content} onChange={setContent} />
            )}
            {extracting && (
              <div className="flex items-center justify-center h-64 text-gray-400">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#5123d4]" />
                  <span className="text-sm">Importing document content...</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom tip bar */}
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-gray-500">
            Use the toolbar to change <strong>font</strong>, <strong>size</strong>, <strong>color</strong> &amp; <strong>style</strong>. Click <strong>Save &amp; Preview</strong> when done.
          </p>
          <button
            onClick={handleSaveAndPreview}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#5123d4] hover:bg-[#401AA0] text-white rounded-md font-medium transition-colors shadow-sm text-sm"
          >
            <Eye className="w-4 h-4" /> Save &amp; Preview
          </button>
        </div>
      </div>
    </div>
  );
}
