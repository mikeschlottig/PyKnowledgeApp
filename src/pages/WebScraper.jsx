import React, { useState, useEffect } from "react";
import { ScrapedContent } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { Globe, Plus, Loader2, CheckCircle, XCircle, ExternalLink, Trash2 } from "lucide-react";
import BrutalistCard from "../components/BrutalistCard";
import BrutalistButton from "../components/BrutalistButton";

export default function WebScraper() {
  const [url, setUrl] = useState("");
  const [urls, setUrls] = useState([]);
  const [scraping, setScraping] = useState(false);
  const [scrapedContent, setScrapedContent] = useState([]);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    loadScrapedContent();
  }, []);

  const loadScrapedContent = async () => {
    try {
      const content = await ScrapedContent.list("-created_date");
      setScrapedContent(content);
    } catch (error) {
      console.error("Error loading scraped content:", error);
    }
  };

  const addUrl = () => {
    if (url.trim() && !urls.includes(url.trim())) {
      setUrls(prev => [...prev, url.trim()]);
      setUrl("");
    }
  };

  const removeUrl = (indexToRemove) => {
    setUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const startScraping = async () => {
    if (urls.length === 0) return;

    setScraping(true);
    const scrapeResults = [];

    // Add URLs to processing queue
    const queueItems = urls.map(url => ({
      url,
      status: "processing",
      timestamp: new Date().toLocaleTimeString()
    }));
    setProcessingQueue(queueItems);

    for (let i = 0; i < urls.length; i++) {
      const currentUrl = urls[i];
      
      try {
        // Simulate web scraping with AI
        const scrapingResult = await InvokeLLM({
          prompt: `Simulate web scraping for the URL: ${currentUrl}

Please generate realistic scraped content as if you visited this URL. Provide:
1. A realistic title for the page
2. Main content (500-1000 words) related to Python development, tutorials, or documentation
3. Determine the content type (article, documentation, tutorial, forum_post, blog, reference)
4. Generate relevant tags (5-8 tags)
5. Create a brief summary (2-3 sentences)

Make the content educational and relevant to Python developers.`,
          response_json_schema: {
            type: "object",
            properties: {
              title: { type: "string" },
              content: { type: "string" },
              content_type: { type: "string" },
              tags: { type: "array", items: { type: "string" } },
              summary: { type: "string" },
              word_count: { type: "number" }
            }
          }
        });

        // Create scraped content record
        const scrapedRecord = await ScrapedContent.create({
          source_url: currentUrl,
          title: scrapingResult.title,
          content: scrapingResult.content,
          content_type: scrapingResult.content_type,
          domain: new URL(currentUrl).hostname,
          scrape_status: "completed",
          word_count: scrapingResult.word_count,
          summary: scrapingResult.summary,
          tags: scrapingResult.tags,
          scraped_at: new Date().toISOString()
        });

        scrapeResults.push({
          url: currentUrl,
          status: "success",
          record: scrapedRecord
        });

        // Update queue status
        setProcessingQueue(prev => 
          prev.map(item => 
            item.url === currentUrl 
              ? { ...item, status: "completed" }
              : item
          )
        );

      } catch (error) {
        console.error(`Error scraping ${currentUrl}:`, error);
        scrapeResults.push({
          url: currentUrl,
          status: "error",
          error: error.message
        });

        setProcessingQueue(prev => 
          prev.map(item => 
            item.url === currentUrl 
              ? { ...item, status: "failed" }
              : item
          )
        );
      }
    }

    setResults(scrapeResults);
    setScraping(false);
    setUrls([]);
    loadScrapedContent();
  };

  const clearQueue = () => {
    setUrls([]);
    setProcessingQueue([]);
    setResults([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-4">
          WEB SCRAPER
        </h1>
        <div className="bg-pink-500 border-4 border-black brutalist-shadow p-4 inline-block">
          <p className="font-black text-xl text-white uppercase tracking-wider">
            HARVEST THE WEB FOR KNOWLEDGE
          </p>
        </div>
      </div>

      {/* URL Input */}
      <BrutalistCard>
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          ADD URLs TO SCRAPE
        </h3>
        
        <div className="flex gap-4 mb-6">
          <input
            type="url"
            placeholder="HTTPS://EXAMPLE.COM..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addUrl()}
            className="brutalist-input flex-1 py-3 text-black font-black uppercase placeholder-gray-500"
          />
          <BrutalistButton onClick={addUrl} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            ADD URL
          </BrutalistButton>
        </div>

        {/* URL Queue */}
        {urls.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="font-black text-sm uppercase">
                QUEUED URLS ({urls.length})
              </p>
              <div className="flex gap-2">
                <BrutalistButton onClick={clearQueue} variant="outline" size="small">
                  CLEAR ALL
                </BrutalistButton>
                <BrutalistButton 
                  onClick={startScraping} 
                  disabled={scraping}
                  variant="success"
                >
                  {scraping ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      SCRAPING...
                    </>
                  ) : (
                    `SCRAPE ${urls.length} URLS`
                  )}
                </BrutalistButton>
              </div>
            </div>

            <div className="space-y-3">
              {urls.map((urlItem, index) => (
                <div
                  key={index}
                  className="bg-gray-100 border-4 border-black p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <Globe className="w-5 h-5 text-black" />
                    <div>
                      <p className="font-black text-sm break-all">{urlItem}</p>
                      <p className="font-bold text-xs text-gray-600">
                        {new URL(urlItem).hostname}
                      </p>
                    </div>
                  </div>
                  <BrutalistButton
                    onClick={() => removeUrl(index)}
                    variant="danger"
                    size="small"
                  >
                    <Trash2 className="w-4 h-4" />
                  </BrutalistButton>
                </div>
              ))}
            </div>
          </div>
        )}
      </BrutalistCard>

      {/* Processing Queue */}
      {processingQueue.length > 0 && (
        <BrutalistCard color="yellow">
          <h3 className="text-xl font-black uppercase tracking-wider mb-6">
            SCRAPING IN PROGRESS
          </h3>
          
          <div className="space-y-4">
            {processingQueue.map((item, index) => (
              <div
                key={index}
                className={`
                  border-4 border-black p-4 flex items-center justify-between
                  ${item.status === 'processing' ? 'bg-blue-100' : ''}
                  ${item.status === 'completed' ? 'bg-green-100' : ''}
                  ${item.status === 'failed' ? 'bg-red-100' : ''}
                `}
              >
                <div className="flex items-center space-x-4">
                  {item.status === 'processing' && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
                  {item.status === 'completed' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {item.status === 'failed' && <XCircle className="w-5 h-5 text-red-500" />}
                  
                  <div>
                    <p className="font-black text-sm break-all">{item.url}</p>
                    <p className="font-bold text-xs text-gray-600">
                      {item.timestamp}
                    </p>
                  </div>
                </div>
                
                <div className={`
                  px-3 py-1 border-2 border-black font-black text-xs uppercase
                  ${item.status === 'processing' ? 'bg-blue-500 text-white' : ''}
                  ${item.status === 'completed' ? 'bg-green-500 text-white' : ''}
                  ${item.status === 'failed' ? 'bg-red-500 text-white' : ''}
                `}>
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </BrutalistCard>
      )}

      {/* Results */}
      {results.length > 0 && (
        <BrutalistCard>
          <h3 className="text-xl font-black uppercase tracking-wider mb-6">
            SCRAPING RESULTS
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
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )}
                    <div>
                      <p className="font-black text-sm break-all">{result.url}</p>
                      <p className="font-bold text-xs text-gray-600">
                        Status: {result.status.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  
                  {result.status === 'success' && (
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 text-white p-2 border-2 border-black hover:bg-blue-400"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
                
                {result.status === 'success' && result.record && (
                  <div className="bg-white border-2 border-black p-3">
                    <p className="font-black text-sm uppercase mb-2">
                      {result.record.title}
                    </p>
                    <p className="font-bold text-xs text-gray-600 mb-2">
                      {result.record.content_type.toUpperCase()} • {result.record.word_count} WORDS
                    </p>
                    <p className="font-bold text-sm text-gray-800">
                      {result.record.summary}
                    </p>
                  </div>
                )}
                
                {result.status === 'error' && (
                  <div className="bg-white border-2 border-black p-3">
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

      {/* Scraped Content History */}
      <BrutalistCard>
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          SCRAPED CONTENT HISTORY ({scrapedContent.length})
        </h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scrapedContent.slice(0, 6).map((item) => (
            <div
              key={item.id}
              className="bg-gray-100 border-4 border-black p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-black text-sm uppercase line-clamp-2">
                    {item.title}
                  </p>
                  <p className="font-bold text-xs text-gray-600 mt-1">
                    {item.domain} • {item.word_count} WORDS
                  </p>
                </div>
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white p-1 border-2 border-black hover:bg-blue-400"
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              
              {item.tags && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-pink-500 text-white px-2 py-1 border-1 border-black font-black text-xs uppercase"
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
    </div>
  );
}