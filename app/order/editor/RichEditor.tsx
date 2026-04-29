"use client";

import React from "react";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const FONTS = [
  "Arial", "Times New Roman", "Georgia", "Courier New", "Verdana",
  "Tahoma", "Trebuchet MS", "Impact",
];

const SIZES = [
  "8px", "10px", "12px", "14px", "16px", "18px", "20px",
  "24px", "28px", "32px", "36px", "48px", "64px", "72px",
];

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Quill = require("quill");
  const Font = Quill.import("formats/font");
  Font.whitelist = FONTS.map((f: string) => f.replace(/\s+/g, "-").toLowerCase());
  Quill.register(Font, true);
  const Size = Quill.import("attributors/style/size");
  Size.whitelist = SIZES;
  Quill.register(Size, true);
}

const modules = {
  toolbar: [
    [{ font: FONTS.map((f) => f.replace(/\s+/g, "-").toLowerCase()) }],
    [{ size: SIZES }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link"],
    ["clean"],
  ],
};

const formats = [
  "font", "size", "bold", "italic", "underline", "strike",
  "color", "background", "align", "list", "indent", "link",
];

export default function RichEditor({ value, onChange }: RichEditorProps) {
  return (
    <div className="rich-editor-wrapper h-full flex flex-col">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        className="flex-grow"
        placeholder="Start typing your document here..."
      />
      <style>{`
        .rich-editor-wrapper .ql-container {
          font-size: 14px;
          height: calc(100vh - 260px);
          min-height: 400px;
          background: white;
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border-color: #e2d9f3;
        }
        .rich-editor-wrapper .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #f8f5ff;
          border-color: #e2d9f3;
          flex-wrap: wrap;
        }
        .rich-editor-wrapper .ql-editor {
          min-height: 400px;
          color: #000;
          line-height: 1.7;
        }
        .rich-editor-wrapper .ql-editor.ql-blank::before {
          color: #9ca3af;
          font-style: italic;
        }
        .ql-toolbar .ql-picker-label { color: #374151; }
        .ql-toolbar button { color: #374151; }
        .ql-toolbar .ql-active,
        .ql-toolbar button:hover { color: #5123d4 !important; }
        @media (max-width: 640px) {
          .rich-editor-wrapper .ql-container {
            height: calc(100vh - 300px);
            min-height: 300px;
          }
          .rich-editor-wrapper .ql-toolbar { font-size: 11px; }
          .ql-toolbar .ql-picker { max-width: 80px; }
        }
      `}</style>
    </div>
  );
}
