"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore, OrderData } from "@/store/useOrderStore";
import { UploadCloud } from "lucide-react";
import { useDropzone } from "react-dropzone";

const RadioOption = ({ label, name, options, formData, handleOptionSelect }: { label: string, name: string, options: string[], formData: Record<string, string | boolean | number>, handleOptionSelect: (name: string, value: string) => void }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4">
    <span className="font-medium text-black min-w-[200px] flex items-center before:content-['•'] before:mr-3 before:text-xl">{label}</span>
    <div className="flex flex-wrap items-center gap-4">
      {options.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer">
          <input 
            type="radio" 
            name={name} 
            value={opt}
            checked={formData[name] === opt}
            onChange={(e) => handleOptionSelect(name, e.target.value)}
            className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
          />
          <span className="text-gray-800 text-sm">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

export default function OrderDetailsPage() {
  const router = useRouter();
  const { orderData, setOrderData } = useOrderStore();
  const [formData, setFormData] = useState({
    name: orderData.name || "",
    phoneNumber: orderData.phoneNumber || "",
    email: orderData.email || "",
    documentText: orderData.documentText || "",
    checkFormatting: orderData.checkFormatting || false,
    printColor: orderData.printColor || "Black & white",
    paperType: orderData.paperType || "A4",
    customPaperType: orderData.customPaperType || "",
    copies: orderData.copies || 1,
    printLayout: orderData.printLayout || "Single Sided",
    pageSelection: orderData.pageSelection || "Print all pages",
    specificPages: orderData.specificPages || "",
    orientation: orderData.orientation || "Portrait",
    finishingOption: orderData.finishingOption || "None",
    bindingType: orderData.bindingType || "",
    frontCover: orderData.frontCover || "",
    backCover: orderData.backCover || "",
    deliveryMethod: orderData.deliveryMethod || "Pick Up",
    specificInstruction: orderData.specificInstruction || "",
    deadline: orderData.deadline || "Standard(24 -48 hours)",
    customDeadlineDate: orderData.customDeadlineDate || "",
    deliveryDetails: orderData.deliveryDetails || "",
  });

  const [uploadedFile, setUploadedFile] = useState<File | null>(orderData.document || null);

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleOptionSelect = (name: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderData({ ...formData, document: uploadedFile } as Partial<OrderData>);
    router.push("/order/review");
  };


  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      <div className="container mx-auto px-3 sm:px-6 max-w-4xl pt-8 sm:pt-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-8 sm:mb-12">Enter your details</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              className="w-full bg-[#E2E8F0] text-black p-4 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Phone Number</label>
            <input 
              type="tel" 
              name="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange}
              required
              className="w-full bg-[#E2E8F0] text-black p-4 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange}
              required
              className="w-full bg-[#E2E8F0] text-black p-4 rounded focus:outline-none focus:ring-2 focus:ring-[#5123d4]"
            />
          </div>

          {/* Upload Area */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Upload Document/ Text</label>
            <div 
              {...getRootProps()} 
              className={`w-full bg-[#E2E8F0] border-2 border-dashed ${isDragActive ? 'border-[#5123d4]' : 'border-transparent'} p-6 rounded cursor-pointer transition-colors hover:border-[#5123d4] flex items-center justify-between`}
            >
              <input {...getInputProps()} />
              <div className="text-gray-600 font-medium">
                {uploadedFile ? (
                  <span className="text-[#5123d4]">File attached: {uploadedFile.name}</span>
                ) : (
                  "Upload Document in pdf, word or image"
                )}
              </div>
              <UploadCloud className="text-gray-500 w-6 h-6" />
            </div>
          </div>

          {/* Options */}
          <div className="pt-8 space-y-6">
            <RadioOption 
              label="Do you want us to check formatting before posting?" 
              name="checkFormatting" 
              options={["Yes", "No"]} 
              formData={formData}
              handleOptionSelect={handleOptionSelect}
            />
            
            <RadioOption 
              label="Printing Colour?" 
              name="printColor" 
              options={["Black & white", "Coloured"]} 
              formData={formData}
              handleOptionSelect={handleOptionSelect}
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4">
              <span className="font-medium text-black min-w-[200px] flex items-center before:content-['•'] before:mr-3 before:text-xl">Paper Type?</span>
              <div className="flex flex-wrap items-center gap-4 flex-grow">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="paperType" value="A4" checked={formData.paperType === "A4"} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-gray-800 text-sm">A4</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="paperType" value="A3" checked={formData.paperType === "A3"} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-gray-800 text-sm">A3</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer flex-grow">
                  <input type="radio" name="paperType" value="Custom type" checked={formData.paperType === "Custom type"} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-gray-800 text-sm whitespace-nowrap">Custom type :</span>
                  <input 
                    type="text" 
                    name="customPaperType"
                    value={formData.customPaperType}
                    onChange={handleChange}
                    className="ml-2 border-b border-gray-400 text-black focus:outline-none focus:border-black bg-transparent flex-grow max-w-xs"
                    disabled={formData.paperType !== "Custom type"}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4">
              <span className="font-medium text-black flex items-center before:content-['•'] before:mr-3 before:text-xl">Number of Copies</span>
              <input 
                type="number" 
                min="1" 
                name="copies"
                value={formData.copies}
                onChange={handleChange}
                className="border-b border-gray-400 text-black focus:outline-none focus:border-black bg-transparent w-20 text-center" 
              />
            </div>

            <RadioOption 
              label="Print Layout:" 
              name="printLayout" 
              options={["Single Sided", "Double Sided"]} 
              formData={formData}
              handleOptionSelect={handleOptionSelect}
            />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4">
              <span className="font-medium text-black min-w-[150px] flex items-center before:content-['•'] before:mr-3 before:text-xl">Page selection :</span>
              <div className="flex flex-wrap items-center gap-4 flex-grow">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="pageSelection" value="Print all pages" checked={formData.pageSelection === "Print all pages"} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-gray-800 text-sm">Print all pages</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer flex-grow">
                  <input type="radio" name="pageSelection" value="Specify Pages" checked={formData.pageSelection === "Specify Pages"} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-gray-800 text-sm whitespace-nowrap">Specify Pages :</span>
                  <input 
                    type="text" 
                    name="specificPages"
                    value={formData.specificPages}
                    onChange={handleChange}
                    className="ml-2 border-b border-gray-400 text-black focus:outline-none focus:border-black bg-transparent flex-grow max-w-md" 
                    disabled={formData.pageSelection !== "Specify Pages"}
                  />
                </label>
              </div>
            </div>

            <RadioOption 
              label="Orientation :" 
              name="orientation" 
              options={["Landscape", "Portrait", "Auto"]} 
              formData={formData}
              handleOptionSelect={handleOptionSelect}
            />

            <RadioOption 
              label="Finishing Options :" 
              name="finishingOption" 
              options={["None", "Spiral Binding", "Stapled", "Hardcover Binding"]} 
              formData={formData}
              handleOptionSelect={handleOptionSelect}
            />

            {/* Binding Details Sub-section */}
            <div className="mt-6">
              <span className="font-medium text-black flex items-center before:content-['•'] before:mr-3 before:text-xl mb-4">Binding Details:</span>
              <div className="pl-8 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-sm font-medium min-w-[150px]">Binding Type ;</span>
                  <div className="flex gap-4">
                    {["Spiral", "Comb", "Hard Cover"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="bindingType" value={opt} checked={formData.bindingType === opt} onChange={handleChange} className="w-4 h-4" />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-sm font-medium min-w-[150px]">Front Cover :</span>
                  <div className="flex gap-4">
                    {["Transparent", "Designed Cover", "Use first page"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="frontCover" value={opt} checked={formData.frontCover === opt} onChange={handleChange} className="w-4 h-4" />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <span className="text-sm font-medium min-w-[150px]">Back Cover:</span>
                  <div className="flex gap-4">
                    {["Plain", "Cardboard"].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="backCover" value={opt} checked={formData.backCover === opt} onChange={handleChange} className="w-4 h-4" />
                        <span className="text-sm text-gray-700">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <RadioOption 
                label="" 
                name="deliveryMethod" 
                options={["Pick Up", "Doorstep"]} 
                formData={formData}
                handleOptionSelect={handleOptionSelect}
              />
              <span className="absolute -mt-8 font-medium text-black">Delivery Method</span>
            </div>

            <div className="flex flex-col mt-8">
              <span className="font-medium text-black flex items-center before:content-['•'] before:mr-3 before:text-xl mb-2">Specific Instruction:</span>
              <textarea 
                name="specificInstruction"
                value={formData.specificInstruction}
                onChange={handleChange}
                className="w-full bg-transparent text-black border-b border-gray-400 focus:outline-none focus:border-black resize-none"
                rows={2}
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-6">
              <span className="font-medium text-black flex items-center before:content-['•'] before:mr-3 before:text-xl min-w-[100px]">Deadline:</span>
              <div className="flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deadline" value="Standard(24 -48 hours)" checked={formData.deadline === "Standard(24 -48 hours)"} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Standard (24 - 48 hours)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deadline" value="Expresss ( same day)" checked={formData.deadline === "Expresss ( same day)"} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Expresss (same day)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="deadline" value="Customer (Date Picker)" checked={formData.deadline === "Customer (Date Picker)"} onChange={handleChange} className="w-4 h-4" />
                  <span className="text-sm text-gray-700">Customer (Date Picker)</span>
                  {formData.deadline === "Customer (Date Picker)" && (
                     <input 
                      type="date" 
                      name="customDeadlineDate" 
                      value={formData.customDeadlineDate} 
                      onChange={handleChange}
                      className="ml-2 border border-gray-300 text-black rounded px-2 py-1 text-sm focus:outline-none" 
                     />
                  )}
                </label>
              </div>
            </div>

            <div className="flex flex-col mt-6 ml-6">
              <span className="font-medium text-black mb-2">Delivery Details:</span>
              <textarea 
                name="deliveryDetails"
                value={formData.deliveryDetails}
                onChange={handleChange}
                className="w-full bg-transparent text-black border-b border-gray-400 focus:outline-none focus:border-black resize-none"
                rows={2}
              />
            </div>
          </div>

          <div className="pt-12 pb-8">
            <button 
              type="submit" 
              className="bg-[#5123d4] hover:bg-[#401AA0] text-white px-10 py-3 rounded font-medium transition-colors"
            >
              Preview
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
