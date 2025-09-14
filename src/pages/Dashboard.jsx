import React, { useState, useEffect } from "react";
import { Document, SearchQuery, ScrapedContent, Report } from "@/api/entities";
import { 
  FileText, 
  Search, 
  Globe, 
  TrendingUp, 
  Zap, 
  Database,
  Clock,
  CheckCircle
} from "lucide-react";
import BrutalistCard from "../components/BrutalistCard";
import ProcessingQueue from "../components/ProcessingQueue";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalSearches: 0,
    totalScraped: 0,
    totalReports: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [processingQueue, setProcessingQueue] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [documents, searches, scraped, reports] = await Promise.all([
        Document.list(),
        SearchQuery.list(),
        ScrapedContent.list(),
        Report.list()
      ]);

      setStats({
        totalDocuments: documents.length,
        totalSearches: searches.length,
        totalScraped: scraped.length,
        totalReports: reports.length
      });

      // Mock recent activity
      const mockActivity = [
        { name: "python-tutorial.pdf", type: "Document Upload", status: "completed", timestamp: "2 min ago" },
        { name: "django-docs scraping", type: "Web Scraping", status: "processing", timestamp: "5 min ago", progress: 65 },
        { name: "Weekly Analytics Report", type: "Report Generation", status: "completed", timestamp: "1 hour ago" },
        { name: "machine-learning-guide.md", type: "Document Upload", status: "pending", timestamp: "3 hours ago" }
      ];

      setRecentActivity(mockActivity);
      setProcessingQueue(mockActivity.filter(item => item.status === "processing" || item.status === "pending"));
      
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <BrutalistCard color={color} hover>
      <div className="flex items-center justify-between">
        <div>
          <p className="font-black text-2xl text-black mb-1">{value}</p>
          <p className="font-bold text-sm text-black uppercase tracking-wider">
            {title}
          </p>
        </div>
        <div className="bg-black p-3 border-2 border-black">
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </BrutalistCard>
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-black text-black uppercase tracking-tight mb-4">
            LOADING DASHBOARD...
          </h1>
          <div className="bg-blue-500 border-4 border-black brutalist-shadow p-8 inline-block">
            <Zap className="w-12 h-12 text-white animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-black uppercase tracking-tight mb-4">
          SYSTEM DASHBOARD
        </h1>
        <div className="bg-yellow-400 border-4 border-black brutalist-shadow p-4 inline-block">
          <p className="font-black text-xl text-black uppercase tracking-wider">
            MONITORING ALL SYSTEMS
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Documents"
          value={stats.totalDocuments}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="Searches"
          value={stats.totalSearches}
          icon={Search}
          color="pink"
        />
        <StatCard
          title="Scraped Pages"
          value={stats.totalScraped}
          icon={Globe}
          color="green"
        />
        <StatCard
          title="Reports"
          value={stats.totalReports}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Processing Queue */}
        <ProcessingQueue items={processingQueue} />

        {/* Recent Activity */}
        <BrutalistCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-black uppercase tracking-wider">
              RECENT ACTIVITY
            </h3>
            <div className="bg-black text-white px-3 py-1 border-2 border-black">
              <span className="font-black text-sm">LIVE FEED</span>
            </div>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="bg-gray-100 border-4 border-black p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  {activity.status === 'completed' ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : activity.status === 'processing' ? (
                    <Zap className="w-6 h-6 text-blue-500 animate-pulse" />
                  ) : (
                    <Clock className="w-6 h-6 text-gray-500" />
                  )}
                  <div>
                    <p className="font-black text-sm uppercase">
                      {activity.name}
                    </p>
                    <p className="font-bold text-xs text-gray-600 mt-1">
                      {activity.type} • {activity.timestamp}
                    </p>
                  </div>
                </div>
                <div className={`
                  px-3 py-1 border-2 border-black font-black text-xs uppercase
                  ${activity.status === 'completed' ? 'bg-green-500 text-white' : ''}
                  ${activity.status === 'processing' ? 'bg-blue-500 text-white' : ''}
                  ${activity.status === 'pending' ? 'bg-gray-500 text-white' : ''}
                `}>
                  {activity.status}
                </div>
              </div>
            ))}
          </div>
        </BrutalistCard>
      </div>

      {/* System Status */}
      <div className="grid md:grid-cols-3 gap-6">
        <BrutalistCard color="green">
          <div className="text-center">
            <Database className="w-8 h-8 text-black mx-auto mb-3" />
            <p className="font-black text-lg text-black uppercase">
              DATABASE
            </p>
            <p className="font-bold text-sm text-black mt-1">
              OPERATIONAL
            </p>
          </div>
        </BrutalistCard>

        <BrutalistCard color="blue">
          <div className="text-center">
            <Zap className="w-8 h-8 text-black mx-auto mb-3" />
            <p className="font-black text-lg text-black uppercase">
              AI PROCESSING
            </p>
            <p className="font-bold text-sm text-black mt-1">
              ACTIVE
            </p>
          </div>
        </BrutalistCard>

        <BrutalistCard color="pink">
          <div className="text-center">
            <TrendingUp className="w-8 h-8 text-black mx-auto mb-3" />
            <p className="font-black text-lg text-black uppercase">
              SEARCH ENGINE
            </p>
            <p className="font-bold text-sm text-black mt-1">
              READY
            </p>
          </div>
        </BrutalistCard>
      </div>
    </div>
  );
}