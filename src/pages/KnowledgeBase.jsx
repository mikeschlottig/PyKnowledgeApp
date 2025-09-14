
import React, { useState, useEffect } from "react";
import { Document } from "@/api/entities";
import { Search, FileText, Tag, Calendar, Eye, Download } from "lucide-react";
import BrutalistCard from "../components/BrutalistCard";
import BrutalistButton from "../components/BrutalistButton";

export default function KnowledgeBase() {
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTag, setSelectedTag] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const categories = ["all", "documentation", "tutorial", "code", "reference", "article", "book", "other"];

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc => 
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.summary?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(doc => doc.category === selectedCategory);
    }

    if (selectedTag) {
      filtered = filtered.filter(doc => 
        doc.tags && doc.tags.some(tag => 
          tag.toLowerCase().includes(selectedTag.toLowerCase())
        )
      );
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, selectedCategory, selectedTag]);

  const loadDocuments = async () => {
    try {
      const docs = await Document.list("-created_date");
      setDocuments(docs);
    } catch (error) {
      console.error("Error loading documents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAllTags = () => {
    const allTags = documents.flatMap(doc => doc.tags || []);
    return [...new Set(allTags)].sort();
  };

  if (isLoading) {
    return (
      <div className="text-center py-16">
        <div className="bg-blue-500 border-4 border-black brutalist-shadow p-8 inline-block">
          <p className="font-black text-xl text-white uppercase">
            LOADING KNOWLEDGE BASE...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-4">
          KNOWLEDGE BASE
        </h1>
        <div className="bg-green-500 border-4 border-black brutalist-shadow p-4 inline-block">
          <p className="font-black text-xl text-white uppercase tracking-wider">
            {documents.length} DOCUMENTS INDEXED
          </p>
        </div>
      </div>

      {/* Filters */}
      <BrutalistCard>
        <div className="space-y-6">
          <h3 className="text-xl font-black uppercase tracking-wider mb-4">
            SEARCH & FILTER
          </h3>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
            <input
              type="text"
              placeholder="SEARCH DOCUMENTS..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="brutalist-input w-full pl-12 pr-4 py-3 text-black font-black uppercase placeholder-gray-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block font-black text-sm uppercase mb-2">CATEGORY</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="brutalist-input w-full py-3 text-black font-black uppercase"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.toUpperCase().replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Filter */}
          <div>
            <label className="block font-black text-sm uppercase mb-2">TAG</label>
            <input
              type="text"
              placeholder="FILTER BY TAG..."
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="brutalist-input w-full py-3 text-black font-black uppercase placeholder-gray-500"
            />
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedCategory !== "all" || selectedTag) && (
            <BrutalistButton
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
                setSelectedTag("");
              }}
              variant="outline"
            >
              CLEAR ALL FILTERS
            </BrutalistButton>
          )}
        </div>
      </BrutalistCard>

      {/* Results Count */}
      <div className="text-center">
        <div className="bg-yellow-400 border-4 border-black brutalist-shadow p-3 inline-block">
          <p className="font-black text-lg text-black uppercase">
            SHOWING {filteredDocuments.length} OF {documents.length} DOCUMENTS
          </p>
        </div>
      </div>

      {/* Document Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.map((doc) => (
          <BrutalistCard key={doc.id} hover>
            <div className="space-y-4">
              {/* Document Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-black" />
                  <div>
                    <p className="font-black text-sm uppercase line-clamp-2">
                      {doc.title}
                    </p>
                    <p className="font-bold text-xs text-gray-600 mt-1">
                      {doc.file_type.toUpperCase()} • {doc.word_count} WORDS
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {doc.summary && (
                <div className="bg-gray-100 border-2 border-black p-3">
                  <p className="font-bold text-xs text-gray-800 line-clamp-3">
                    {doc.summary}
                  </p>
                </div>
              )}

              {/* Tags */}
              {doc.tags && doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {doc.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-pink-500 text-white px-2 py-1 border-2 border-black font-black text-xs uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                  {doc.tags.length > 3 && (
                    <span className="bg-gray-500 text-white px-2 py-1 border-2 border-black font-black text-xs uppercase">
                      +{doc.tags.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Category Badge */}
              <div className="flex items-center justify-between">
                <span className="bg-blue-500 text-white px-3 py-1 border-2 border-black font-black text-xs uppercase">
                  {doc.category}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setSelectedDocument(doc)}
                    className="bg-green-500 text-white p-2 border-2 border-black hover:bg-green-400"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  {doc.file_url && (
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-500 text-white p-2 border-2 border-black hover:bg-orange-400"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                <span className="font-bold">
                  {new Date(doc.created_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </BrutalistCard>
        ))}
      </div>

      {/* No Results */}
      {filteredDocuments.length === 0 && !isLoading && (
        <div className="text-center py-16">
          <div className="bg-red-500 border-4 border-black brutalist-shadow p-8 inline-block">
            <p className="font-black text-xl text-white uppercase mb-2">
              NO DOCUMENTS FOUND
            </p>
            <p className="font-bold text-sm text-white">
              TRY ADJUSTING YOUR FILTERS OR UPLOAD NEW CONTENT
            </p>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border-4 border-black brutalist-shadow max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase mb-2">
                    {selectedDocument.title}
                  </h2>
                  <p className="font-bold text-gray-600">
                    {selectedDocument.file_type.toUpperCase()} • {selectedDocument.word_count} WORDS
                  </p>
                </div>
                <BrutalistButton
                  onClick={() => setSelectedDocument(null)}
                  variant="danger"
                >
                  CLOSE
                </BrutalistButton>
              </div>

              {selectedDocument.summary && (
                <div className="bg-yellow-100 border-4 border-black p-4 mb-6">
                  <h3 className="font-black text-sm uppercase mb-2">AI SUMMARY</h3>
                  <p className="font-bold text-sm">{selectedDocument.summary}</p>
                </div>
              )}

              <div className="bg-gray-100 border-4 border-black p-4">
                <h3 className="font-black text-sm uppercase mb-4">CONTENT</h3>
                <div className="whitespace-pre-wrap font-mono text-sm max-h-96 overflow-y-auto">
                  {selectedDocument.content.substring(0, 2000)}
                  {selectedDocument.content.length > 2000 && "..."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
