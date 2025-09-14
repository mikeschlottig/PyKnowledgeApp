
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  Database, 
  Upload, 
  Search, 
  Globe, 
  BarChart3, 
  FileText, 
  Settings,
  Zap,
  Brain
} from "lucide-react";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const navigationItems = [
    { name: "Dashboard", url: createPageUrl("Dashboard"), icon: BarChart3 },
    { name: "Upload", url: createPageUrl("Upload"), icon: Upload },
    { name: "Knowledge Base", url: createPageUrl("KnowledgeBase"), icon: Database },
    { name: "Web Scraper", url: createPageUrl("WebScraper"), icon: Globe },
    { name: "Search", url: createPageUrl("Search"), icon: Search },
    { name: "Reports", url: createPageUrl("Reports"), icon: FileText },
    { name: "Settings", url: createPageUrl("Settings"), icon: Settings },
  ];

  const isActive = (url) => location.pathname === url;

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700;800&display=swap');
        
        * {
          font-family: 'JetBrains Mono', monospace !important;
        }
        
        .brutalist-shadow {
          box-shadow: 6px 6px 0px #000000;
        }
        
        .brutalist-shadow-small {
          box-shadow: 3px 3px 0px #000000;
        }
        
        .brutalist-button {
          background: #0066FF;
          color: white;
          border: 4px solid #000000;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          transition: all 0.1s ease;
        }
        
        .brutalist-button:hover {
          transform: translate(-2px, -2px);
          box-shadow: 8px 8px 0px #000000;
          background: #0052CC;
        }
        
        .brutalist-card {
          border: 4px solid #000000;
          background: white;
        }
        
        .brutalist-input {
          border: 4px solid #000000;
          background: white;
          font-weight: 700;
        }
        
        .brutalist-input:focus {
          outline: none;
          border-color: #0066FF;
          box-shadow: 4px 4px 0px #000000;
        }
      `}</style>

      {/* Header */}
      <header className="bg-white border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-black p-3 brutalist-shadow-small">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-black uppercase tracking-tight">
                  PyKnowledge
                </h1>
                <p className="text-lg font-bold text-black mt-1 uppercase tracking-wide">
                  AI-POWERED KNOWLEDGE BASE
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-yellow-400 px-4 py-2 border-4 border-black brutalist-shadow-small">
                <div className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-black" />
                  <span className="text-black font-black uppercase text-sm">
                    PROCESSING
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-black border-b-4 border-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-0 overflow-x-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.url);
              
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`
                    flex items-center space-x-3 px-6 py-4 font-black uppercase text-sm
                    border-r-4 border-black transition-all duration-100 whitespace-nowrap
                    ${active 
                      ? 'bg-blue-500 text-white hover:bg-blue-400' 
                      : 'bg-white text-black hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="tracking-wider">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-black border-t-4 border-black mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center">
            <p className="text-white font-black uppercase text-lg tracking-wider">
              POWERED BY AI • BUILT FOR PYTHON DEVELOPERS
            </p>
            <div className="mt-4 flex justify-center space-x-8">
              <div className="bg-pink-500 px-4 py-2 border-4 border-white">
                <span className="text-white font-black uppercase text-sm">
                  ALWAYS LEARNING
                </span>
              </div>
              <div className="bg-green-500 px-4 py-2 border-4 border-white">
                <span className="text-white font-black uppercase text-sm">
                  ALWAYS SEARCHING
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
