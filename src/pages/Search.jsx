import React, { useState, useEffect } from "react";
import { Document, SearchQuery, ScrapedContent } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Search as SearchIcon, Filter, Clock, Star, ExternalLink, FileText, Globe } from "lucide-react";
import BrutalistCard from "../components/BrutalistCard";
import BrutalistButton from "../components/BrutalistButton";

export default function Search() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState("hybrid");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [filters, setFilters] = useState({
    type: "all", // all, document, scraped
    category: "all",
    dateRange: "all"
  });
  const [executionTime, setExecutionTime] = useState(0);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await SearchQuery.list("-created_date", 5);
      setSearchHistory(history);
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  };

  const performSearch = async () => {
    if (!query.trim()) return;

    setSearching(true);
    const startTime = Date.now();

    try {
      let searchResults = [];

      if (searchType === "keyword" || searchType === "hybrid") {
        // Keyword search
        const [documents, scrapedContent] = await Promise.all([
          Document.list(),
          ScrapedContent.list()
        ]);

        const allContent = [
          ...documents.map(doc => ({ ...doc, source_type: 'document' })),
          ...scrapedContent.map(content => ({ ...content, source_type: 'scraped' }))
        ];

        const keywordResults = allContent.filter(item => {
          const searchText = query.toLowerCase();
          const title = (item.title || '').toLowerCase();
          const content = (item.content || '').toLowerCase();
          const summary = (item.summary || '').toLowerCase();
          const tags = (item.tags || []).join(' ').toLowerCase();

          return title.includes(searchText) || 
                 content.includes(searchText) || 
                 summary.includes(searchText) ||
                 tags.includes(searchText);
        });

        searchResults = [...keywordResults];
      }

      if (searchType === "semantic" || searchType === "hybrid") {
        // Semantic search using AI
        const semanticResult = await InvokeLLM({
          prompt: `Perform a semantic search for the query: "${query}"

Based on this query, generate 3-5 relevant search results that would match semantically. Each result should have:
- title: A relevant document/article title
- content_excerpt: A short excerpt (100-200 words)
- source_type: Either "document" or "scraped"
- relevance_score: A score from 0-100
- tags: Array of relevant tags
- summary: Brief summary explaining why this is relevant

Focus on Python-related content, tutorials, documentation, and programming concepts.`,
          response_json_schema: {
            type: "object",
            properties: {
              results: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content_excerpt: { type: "string" },
                    source_type: { type: "string" },
                    relevance_score: { type: "number" },
                    tags: { type: "array", items: { type: "string" } },
                    summary: { type: "string" }
                  }
                }
              }
            }
          }
        });

        const semanticResults = semanticResult.results.map((result, index) => ({
          id: `semantic-${index}`,
          title: result.title,
          content: result.content_excerpt,
          summary: result.summary,
          tags: result.tags,
          source_type: result.source_type,
          relevance_score: result.relevance_score,
          is_semantic: true
        }));

        searchResults = [...searchResults, ...semanticResults];
      }

      // Apply filters
      let filteredResults = searchResults;

      if (filters.type !== "all") {
        filteredResults = filteredResults.filter(result => 
          result.source_type === filters.type
        );
      }

      if (filters.category !== "all") {
        filteredResults = filteredResults.filter(result => 
          result.category === filters.category
        );
      }

      // Sort by relevance (semantic results first, then by creation date)
      filteredResults.sort((a, b) => {
        if (a.is_semantic && !b.is_semantic) return -1;
        if (!a.is_semantic && b.is_semantic) return 1;
        if (a.relevance_score && b.relevance_score) {
          return b.relevance_score - a.relevance_score;
        }
        return new Date(b.created_date || 0) - new Date(a.created_date || 0);
      });

      setResults(filteredResults);

      const endTime = Date.now();
      const execTime = endTime - startTime;
      setExecutionTime(execTime);

      // Save search query
      await SearchQuery.create({
        query_text: query,
        search_type: searchType,
        results_count: filteredResults.length,
        execution_time: execTime
      });

      loadSearchHistory();

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleQuickSearch = (historyQuery) => {
    setQuery(historyQuery.query_text);
    setSearchType(historyQuery.search_type);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-4">
          SEARCH ENGINE
        </h1>
        <div className="bg-green-500 border-4 border-black brutalist-shadow p-4 inline-block">
          <p className="font-black text-xl text-white uppercase tracking-wider">
            FIND KNOWLEDGE INSTANTLY
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <BrutalistCard>
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black" />
              <input
                type="text"
                placeholder="SEARCH THE KNOWLEDGE BASE..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && performSearch()}
                className="brutalist-input w-full pl-12 pr-4 py-4 text-black font-black uppercase placeholder-gray-500 text-lg"
              />
            </div>
            <BrutalistButton
              onClick={performSearch}
              disabled={searching || !query.trim()}
              variant="primary"
              size="large"
            >
              {searching ? (
                <>
                  <SearchIcon className="w-5 h-5 mr-2 animate-pulse" />
                  SEARCHING...
                </>
              ) : (
                <>
                  <SearchIcon className="w-5 h-5 mr-2" />
                  SEARCH
                </>
              )}
            </BrutalistButton>
          </div>

          {/* Search Options */}
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block font-black text-sm uppercase mb-2">SEARCH TYPE</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="brutalist-input w-full py-3 text-black font-black uppercase"
              >
                <option value="hybrid">HYBRID (BEST)</option>
                <option value="keyword">KEYWORD ONLY</option>
                <option value="semantic">SEMANTIC (AI)</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-sm uppercase mb-2">CONTENT TYPE</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="brutalist-input w-full py-3 text-black font-black uppercase"
              >
                <option value="all">ALL CONTENT</option>
                <option value="document">DOCUMENTS</option>
                <option value="scraped">SCRAPED PAGES</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-sm uppercase mb-2">CATEGORY</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                className="brutalist-input w-full py-3 text-black font-black uppercase"
              >
                <option value="all">ALL CATEGORIES</option>
                <option value="tutorial">TUTORIALS</option>
                <option value="documentation">DOCS</option>
                <option value="code">CODE</option>
                <option value="article">ARTICLES</option>
              </select>
            </div>

            <div>
              <label className="block font-black text-sm uppercase mb-2">DATE RANGE</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="brutalist-input w-full py-3 text-black font-black uppercase"
              >
                <option value="all">ALL TIME</option>
                <option value="today">TODAY</option>
                <option value="week">THIS WEEK</option>
                <option value="month">THIS MONTH</option>
              </select>
            </div>
          </div>
        </div>
      </BrutalistCard>

      {/* Search Results */}
      {results.length > 0 && (
        <BrutalistCard>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black uppercase tracking-wider">
              SEARCH RESULTS ({results.length})
            </h3>
            <div className="bg-yellow-400 border-2 border-black px-3 py-1">
              <span className="font-black text-sm text-black">
                {executionTime}MS
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {results.map((result, index) => (
              <div
                key={result.id || index}
                className={`
                  border-4 border-black p-6
                  ${result.is_semantic ? 'bg-blue-50' : 'bg-white'}
                  hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000] transition-all duration-100
                `}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    {result.source_type === 'document' ? (
                      <FileText className="w-6 h-6 text-blue-500" />
                    ) : (
                      <Globe className="w-6 h-6 text-green-500" />
                    )}
                    <div>
                      <h4 className="font-black text-lg uppercase line-clamp-2">
                        {result.title}
                      </h4>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`
                          px-2 py-1 border-2 border-black font-black text-xs uppercase
                          ${result.source_type === 'document' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}
                        `}>
                          {result.source_type}
                        </span>
                        {result.is_semantic && (
                          <span className="bg-pink-500 text-white px-2 py-1 border-2 border-black font-black text-xs uppercase">
                            AI SEMANTIC
                          </span>
                        )}
                        {result.relevance_score && (
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="font-black text-sm">{result.relevance_score}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {result.source_url && (
                    <a
                      href={result.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-orange-500 text-white p-2 border-2 border-black hover:bg-orange-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                {result.summary && (
                  <div className="bg-gray-100 border-2 border-black p-3 mb-4">
                    <p className="font-bold text-sm text-gray-800">{result.summary}</p>
                  </div>
                )}

                <div className="text-sm font-mono text-gray-700 mb-4 line-clamp-3">
                  {result.content?.substring(0, 300)}...
                </div>

                {result.tags && result.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {result.tags.slice(0, 5).map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="bg-gray-500 text-white px-2 py-1 border-1 border-black font-black text-xs uppercase"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </BrutalistCard>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && (
        <BrutalistCard>
          <h3 className="text-xl font-black uppercase tracking-wider mb-6">
            RECENT SEARCHES
          </h3>
          
          <div className="space-y-3">
            {searchHistory.map((historyItem) => (
              <div
                key={historyItem.id}
                className="bg-gray-100 border-4 border-black p-4 flex items-center justify-between cursor-pointer hover:bg-gray-200"
                onClick={() => handleQuickSearch(historyItem)}
              >
                <div className="flex items-center space-x-4">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-black text-sm uppercase">
                      "{historyItem.query_text}"
                    </p>
                    <p className="font-bold text-xs text-gray-600">
                      {historyItem.search_type.toUpperCase()} • {historyItem.results_count} results • {historyItem.execution_time}ms
                    </p>
                  </div>
                </div>
                <BrutalistButton variant="outline" size="small">
                  SEARCH AGAIN
                </BrutalistButton>
              </div>
            ))}
          </div>
        </BrutalistCard>
      )}

      {/* No Results */}
      {!searching && query && results.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-red-500 border-4 border-black brutalist-shadow p-8 inline-block">
            <p className="font-black text-xl text-white uppercase mb-2">
              NO RESULTS FOUND
            </p>
            <p className="font-bold text-sm text-white">
              TRY DIFFERENT KEYWORDS OR ADD MORE CONTENT
            </p>
          </div>
        </div>
      )}
    </div>
  );
}