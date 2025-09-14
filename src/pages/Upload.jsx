import React, { useState, useCallback } from "react";
import { Document } from "@/api/entities";
import { UploadFile, ExtractDataFromUploadedFile, InvokeLLM } from "@/api/integrations";
import { Upload, FileText, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import BrutalistCard from "../components/BrutalistCard";
import BrutalistButton from "../components/BrutalistButton";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [results, setResults] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileInput = (e) => {
    const selectedFiles = Array.from(e.target.files);
    addFiles(selectedFiles);
  };

  const addFiles = (newFiles) => {
    const validFiles = newFiles.filter(file => 
      file.type === "application/pdf" || 
      file.type === "text/plain" || 
      file.name.endsWith('.py') ||
      file.name.endsWith('.md') ||
      file.name.endsWith('.rst')
    );
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const processFiles = async () => {
    if (files.length === 0) return;

    setProcessing(true);
    const processedResults = [];

    for (const file of files) {
      try {
        // Upload file
        const { file_url } = await UploadFile({ file });
        
        // Extract content
        let content = "";
        if (file.type === "application/pdf") {
          const extractResult = await ExtractDataFromUploadedFile({
            file_url,
            json_schema: {
              type: "object",
              properties: {
                content: { type: "string" }
              }
            }
          });
          
          if (extractResult.status === "success") {
            content = extractResult.output.content;
          }
        } else {
          // For text files, we'll read them directly
          content = await file.text();
        }

        // Generate summary and tags using AI
        const aiResult = await InvokeLLM({
          prompt: `Analyze this content and provide a summary and relevant tags for a Python knowledge base:

Content: ${content.substring(0, 2000)}...

Please provide:
1. A concise summary (2-3 sentences)
2. Relevant tags (5-8 tags related to Python, programming concepts, libraries, etc.)`,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              tags: { type: "array", items: { type: "string" } }
            }
          }
        });

        // Create document
        const document = await Document.create({
          title: file.name,
          content: content,
          file_type: getFileType(file),
          file_url: file_url,
          summary: aiResult.summary,
          tags: aiResult.tags,
          category: inferCategory(file.name),
          word_count: content.split(' ').length,
          processing_status: "completed",
          indexed_at: new Date().toISOString()
        });

        processedResults.push({
          file: file.name,
          status: "success",
          document: document,
          summary: aiResult.summary
        });

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        processedResults.push({
          file: file.name,
          status: "error",
          error: error.message
        });
      }
    }

    setResults(processedResults);
    setProcessing(false);
    setFiles([]);
  };

  const getFileType = (file) => {
    if (file.type === "application/pdf") return "pdf";
    if (file.name.endsWith('.py')) return "py";
    if (file.name.endsWith('.md')) return "md";
    if (file.name.endsWith('.rst')) return "rst";
    return "txt";
  };

  const inferCategory = (filename) => {
    const name = filename.toLowerCase();
    if (name.includes('tutorial') || name.includes('guide')) return "tutorial";
    if (name.includes('doc') || name.includes('reference')) return "documentation";
    if (name.endsWith('.py')) return "code";
    return "other";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-4">
          DOCUMENT UPLOAD CENTER
        </h1>
        <div className="bg-blue-500 border-4 border-black brutalist-shadow p-4 inline-block">
          <p className="font-black text-xl text-white uppercase tracking-wider">
            FEED THE KNOWLEDGE BASE
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <BrutalistCard color={dragActive ? "yellow" : "white"}>
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`
            border-4 border-dashed border-black p-12 text-center transition-all duration-200
            ${dragActive ? 'bg-yellow-100' : 'bg-white'}
          `}
        >
          <Upload className="w-16 h-16 text-black mx-auto mb-6" />
          <h3 className="text-2xl font-black text-black uppercase mb-4">
            DROP FILES HERE OR CLICK TO BROWSE
          </h3>
          <p className="text-lg font-bold text-gray-600 mb-6">
            Supported: PDF, TXT, PY, MD, RST
          </p>
          
          <input
            type="file"
            multiple
            accept=".pdf,.txt,.py,.md,.rst"
            onChange={handleFileInput}
            className="hidden"
            id="file-input"
          />
          
          <label htmlFor="file-input">
            <BrutalistButton variant="primary" size="large">
              CHOOSE FILES
            </BrutalistButton>
          </label>
        </div>
      </BrutalistCard>

      {/* File List */}
      {files.length > 0 && (
        <BrutalistCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black uppercase tracking-wider">
              READY TO PROCESS
            </h3>
            <BrutalistButton 
              onClick={processFiles}
              disabled={processing}
              variant="success"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  PROCESSING...
                </>
              ) : (
                `PROCESS ${files.length} FILES`
              )}
            </BrutalistButton>
          </div>

          <div className="space-y-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="bg-gray-100 border-4 border-black p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="w-6 h-6 text-black" />
                  <div>
                    <p className="font-black text-sm uppercase">{file.name}</p>
                    <p className="font-bold text-xs text-gray-600">
                      {(file.size / 1024 / 1024).toFixed(2)} MB • {getFileType(file)}
                    </p>
                  </div>
                </div>
                <BrutalistButton
                  variant="danger"
                  size="small"
                  onClick={() => removeFile(index)}
                >
                  REMOVE
                </BrutalistButton>
              </div>
            ))}
          </div>
        </BrutalistCard>
      )}

      {/* Results */}
      {results.length > 0 && (
        <BrutalistCard>
          <h3 className="text-xl font-black uppercase tracking-wider mb-6">
            PROCESSING RESULTS
          </h3>
          
          <div className="space-y-4">
            {results.map((result, index) => (
              <div
                key={index}
                className={`
                  border-4 border-black p-4
                  ${result.status === 'success' ? 'bg-green-100' : 'bg-red-100'}
                `}
              >
                <div className="flex items-center space-x-4 mb-3">
                  {result.status === 'success' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-red-500" />
                  )}
                  <div>
                    <p className="font-black text-sm uppercase">{result.file}</p>
                    <p className="font-bold text-xs text-gray-600">
                      Status: {result.status.toUpperCase()}
                    </p>
                  </div>
                </div>
                
                {result.status === 'success' && result.summary && (
                  <div className="bg-white border-2 border-black p-3 mt-3">
                    <p className="font-bold text-sm text-gray-800">
                      AI SUMMARY: {result.summary}
                    </p>
                  </div>
                )}
                
                {result.status === 'error' && (
                  <div className="bg-white border-2 border-black p-3 mt-3">
                    <p className="font-bold text-sm text-red-600">
                      ERROR: {result.error}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </BrutalistCard>
      )}
    </div>
  );
}