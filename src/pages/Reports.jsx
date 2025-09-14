
import React, { useState, useEffect } from "react";
import { Report, Document, SearchQuery, ScrapedContent } from "@/api/entities";
import { InvokeLLM } from "@/api/integrations";
import { BarChart3, Download, Calendar, TrendingUp, FileText, Loader2, CheckCircle } from "lucide-react";
import BrutalistCard from "../components/BrutalistCard";
import BrutalistButton from "../components/BrutalistButton";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [generating, setGenerating] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [dateRange, setDateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    {
      type: "usage_analytics",
      title: "Usage Analytics Report",
      description: "Detailed analysis of system usage, search patterns, and user activity",
      color: "blue"
    },
    {
      type: "content_summary",
      title: "Content Summary Report", 
      description: "Overview of all indexed content, categorization, and growth metrics",
      color: "green"
    },
    {
      type: "search_insights",
      title: "Search Insights Report",
      description: "Analysis of search queries, popular topics, and result effectiveness",
      color: "pink"
    },
    {
      type: "processing_stats",
      title: "Processing Statistics Report",
      description: "System performance metrics, processing times, and efficiency analysis",
      color: "orange"
    }
  ];

  useEffect(() => {
    const loadReports = async () => {
      try {
        const reportsList = await Report.list("-created_date");
        setReports(reportsList);
      } catch (error) {
        console.error("Error loading reports:", error);
      }
    };

    const loadAnalytics = async () => {
      try {
        const [documents, searches, scrapedContent] = await Promise.all([
          Document.list(),
          SearchQuery.list(),
          ScrapedContent.list()
        ]);

        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentDocuments = documents.filter(doc => 
          new Date(doc.created_date) >= thirtyDaysAgo
        );

        const recentSearches = searches.filter(search => 
          new Date(search.created_date) >= thirtyDaysAgo
        );

        const getTopCategories = (documents) => {
          const categories = {};
          documents.forEach(doc => {
            categories[doc.category] = (categories[doc.category] || 0) + 1;
          });
          return Object.entries(categories)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
        };

        const getSearchTrends = (searches) => {
          const trends = {};
          searches.forEach(search => {
            const words = search.query_text.toLowerCase().split(' ');
            words.forEach(word => {
              if (word.length > 3) { // Filter out very short words
                trends[word] = (trends[word] || 0) + 1;
              }
            });
          });
          return Object.entries(trends)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        };

        setAnalytics({
          totalDocuments: documents.length,
          totalSearches: searches.length,
          totalScraped: scrapedContent.length,
          recentDocuments: recentDocuments.length,
          recentSearches: recentSearches.length,
          avgSearchTime: searches.reduce((sum, s) => sum + (s.execution_time || 0), 0) / searches.length || 0,
          topCategories: getTopCategories(documents),
          searchTrends: getSearchTrends(recentSearches)
        });

      } catch (error) {
        console.error("Error loading analytics:", error);
      }
    };

    loadReports();
    loadAnalytics();
  }, []);

  const generateReport = async (reportType) => {
    setGenerating(reportType);

    try {
      // Generate report data using AI
      const reportData = await InvokeLLM({
        prompt: `Generate a comprehensive ${reportType.replace('_', ' ')} report for a Python knowledge base platform.

Current system statistics:
- Total Documents: ${analytics.totalDocuments}
- Total Searches: ${analytics.totalSearches}
- Total Scraped Content: ${analytics.totalScraped}
- Recent Documents (30 days): ${analytics.recentDocuments}
- Recent Searches (30 days): ${analytics.recentSearches}
- Average Search Time: ${analytics.avgSearchTime?.toFixed(2)}ms

Date Range: ${dateRange.start_date} to ${dateRange.end_date}

Please provide:
1. Executive Summary (2-3 paragraphs)
2. Key Metrics and KPIs
3. Detailed Analysis (5-7 sections)
4. Recommendations (3-5 actionable items)
5. Trends and Insights
6. Performance Analysis

Make it professional and data-driven with specific insights for a Python developer knowledge base.`,
        response_json_schema: {
          type: "object",
          properties: {
            executive_summary: { type: "string" },
            key_metrics: {
              type: "object",
              properties: {
                growth_rate: { type: "string" },
                engagement_score: { type: "string" },
                efficiency_rating: { type: "string" },
                user_satisfaction: { type: "string" }
              }
            },
            detailed_analysis: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  section: { type: "string" },
                  content: { type: "string" }
                }
              }
            },
            recommendations: {
              type: "array",
              items: { type: "string" }
            },
            trends: {
              type: "array",
              items: { type: "string" }
            }
          }
        }
      });

      // Create report record
      const report = await Report.create({
        report_type: reportType,
        title: reportTypes.find(rt => rt.type === reportType)?.title || reportType,
        data: reportData,
        generation_status: "completed",
        date_range: dateRange,
        generated_by: "System"
      });

      // Reload reports
      const reportsList = await Report.list("-created_date");
      setReports(reportsList);
      
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setGenerating(null);
    }
  };

  const downloadReport = (report) => {
    const reportContent = `
# ${report.title}
Generated: ${new Date(report.created_date).toLocaleString()}
Date Range: ${report.date_range?.start_date} to ${report.date_range?.end_date}

## Executive Summary
${report.data?.executive_summary || 'No summary available'}

## Key Metrics
${Object.entries(report.data?.key_metrics || {}).map(([key, value]) => `- ${key.replace('_', ' ').toUpperCase()}: ${value}`).join('\n')}

## Detailed Analysis
${report.data?.detailed_analysis?.map(section => `### ${section.section}\n${section.content}`).join('\n\n') || 'No detailed analysis available'}

## Recommendations
${report.data?.recommendations?.map((rec, i) => `${i + 1}. ${rec}`).join('\n') || 'No recommendations available'}

## Trends & Insights
${report.data?.trends?.map((trend, i) => `${i + 1}. ${trend}`).join('\n') || 'No trends available'}
    `;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-4">
          ANALYTICS & REPORTS
        </h1>
        <div className="bg-orange-500 border-4 border-black brutalist-shadow p-4 inline-block">
          <p className="font-black text-xl text-white uppercase tracking-wider">
            DATA-DRIVEN INSIGHTS
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <BrutalistCard color="blue" hover>
          <div className="text-center">
            <FileText className="w-8 h-8 text-black mx-auto mb-3" />
            <p className="font-black text-2xl text-black">{analytics.totalDocuments || 0}</p>
            <p className="font-bold text-sm text-black uppercase">TOTAL DOCS</p>
          </div>
        </BrutalistCard>

        <BrutalistCard color="green" hover>
          <div className="text-center">
            <BarChart3 className="w-8 h-8 text-black mx-auto mb-3" />
            <p className="font-black text-2xl text-black">{analytics.totalSearches || 0}</p>
            <p className="font-bold text-sm text-black uppercase">SEARCHES</p>
          </div>
        </BrutalistCard>

        <BrutalistCard color="pink" hover>
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-black mx-auto mb-3" />
            <p className="font-black text-2xl text-black">{analytics.recentDocuments || 0}</p>
            <p className="font-bold text-sm text-black uppercase">THIS MONTH</p>
          </div>
        </BrutalistCard>

        <BrutalistCard color="yellow" hover>
          <div className="text-center">
            <Calendar className="w-8 h-8 text-black mx-auto mb-3" />
            <p className="font-black text-2xl text-black">{analytics.avgSearchTime?.toFixed(0) || 0}MS</p>
            <p className="font-bold text-sm text-black uppercase">AVG SEARCH</p>
          </div>
        </BrutalistCard>
      </div>

      {/* Report Generation */}
      <BrutalistCard>
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          GENERATE NEW REPORT
        </h3>

        {/* Date Range */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block font-black text-sm uppercase mb-2">START DATE</label>
            <input
              type="date"
              value={dateRange.start_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, start_date: e.target.value }))}
              className="brutalist-input w-full py-3 text-black font-black"
            />
          </div>
          <div>
            <label className="block font-black text-sm uppercase mb-2">END DATE</label>
            <input
              type="date"
              value={dateRange.end_date}
              onChange={(e) => setDateRange(prev => ({ ...prev, end_date: e.target.value }))}
              className="brutalist-input w-full py-3 text-black font-black"
            />
          </div>
        </div>

        {/* Report Types */}
        <div className="grid md:grid-cols-2 gap-6">
          {reportTypes.map((reportType) => (
            <BrutalistCard key={reportType.type} color={reportType.color}>
              <div className="space-y-4">
                <div>
                  <h4 className="font-black text-lg text-black uppercase mb-2">
                    {reportType.title}
                  </h4>
                  <p className="font-bold text-sm text-black">
                    {reportType.description}
                  </p>
                </div>
                
                <BrutalistButton
                  onClick={() => generateReport(reportType.type)}
                  disabled={generating === reportType.type}
                  variant="outline"
                  className="w-full"
                >
                  {generating === reportType.type ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      GENERATING...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4 mr-2" />
                      GENERATE
                    </>
                  )}
                </BrutalistButton>
              </div>
            </BrutalistCard>
          ))}
        </div>
      </BrutalistCard>

      {/* Generated Reports */}
      <BrutalistCard>
        <h3 className="text-xl font-black uppercase tracking-wider mb-6">
          GENERATED REPORTS ({reports.length})
        </h3>

        {reports.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-200 border-4 border-black p-6">
              <p className="font-black text-lg text-gray-600 uppercase">
                NO REPORTS GENERATED YET
              </p>
              <p className="font-bold text-sm text-gray-500 mt-2">
                Generate your first report using the options above
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-gray-100 border-4 border-black p-6 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <div>
                    <p className="font-black text-lg uppercase">{report.title}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="font-bold text-sm text-gray-600">
                        Generated: {new Date(report.created_date).toLocaleDateString()}
                      </span>
                      {report.date_range && (
                        <span className="font-bold text-sm text-gray-600">
                          Range: {report.date_range.start_date} to {report.date_range.end_date}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <BrutalistButton
                    onClick={() => downloadReport(report)}
                    variant="success"
                    size="small"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    DOWNLOAD
                  </BrutalistButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </BrutalistCard>

      {/* Quick Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Categories */}
        <BrutalistCard>
          <h4 className="font-black text-lg uppercase mb-4">TOP CATEGORIES</h4>
          <div className="space-y-3">
            {analytics.topCategories?.map(([category, count], index) => (
              <div key={category} className="flex justify-between items-center">
                <span className="font-bold text-sm uppercase">{category}</span>
                <div className="bg-blue-500 text-white px-3 py-1 border-2 border-black font-black text-xs">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </BrutalistCard>

        {/* Search Trends */}
        <BrutalistCard>
          <h4 className="font-black text-lg uppercase mb-4">SEARCH TRENDS</h4>
          <div className="space-y-3">
            {analytics.searchTrends?.slice(0, 5).map(([term, count], index) => (
              <div key={term} className="flex justify-between items-center">
                <span className="font-bold text-sm uppercase">"{term}"</span>
                <div className="bg-pink-500 text-white px-3 py-1 border-2 border-black font-black text-xs">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </BrutalistCard>
      </div>
    </div>
  );
}
