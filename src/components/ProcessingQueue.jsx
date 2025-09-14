import React from "react";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";
import BrutalistCard from "./BrutalistCard";

export default function ProcessingQueue({ items = [] }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "failed":
        return <XCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Clock className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "processing":
        return "bg-blue-100";
      case "completed":
        return "bg-green-100";
      case "failed":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <BrutalistCard>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-black uppercase tracking-wider">
          PROCESSING QUEUE
        </h3>
        <div className="bg-black text-white px-3 py-1 border-2 border-black">
          <span className="font-black text-sm">{items.length} ITEMS</span>
        </div>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-200 border-4 border-black p-6">
              <p className="font-black uppercase text-lg text-gray-600">
                NO ITEMS IN QUEUE
              </p>
              <p className="font-bold text-sm text-gray-500 mt-2">
                Upload documents or start web scraping to see activity here
              </p>
            </div>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={index}
              className={`
                ${getStatusColor(item.status)} 
                border-4 border-black p-4 flex items-center justify-between
              `}
            >
              <div className="flex items-center space-x-4">
                {getStatusIcon(item.status)}
                <div>
                  <p className="font-black text-sm uppercase">
                    {item.name}
                  </p>
                  <p className="font-bold text-xs text-gray-600 mt-1">
                    {item.type} • {item.timestamp}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`
                  px-3 py-1 border-2 border-black font-black text-xs uppercase
                  ${item.status === 'processing' ? 'bg-blue-500 text-white' : ''}
                  ${item.status === 'completed' ? 'bg-green-500 text-white' : ''}
                  ${item.status === 'failed' ? 'bg-red-500 text-white' : ''}
                  ${item.status === 'pending' ? 'bg-gray-500 text-white' : ''}
                `}>
                  {item.status}
                </div>
                {item.progress && (
                  <div className="mt-2 bg-gray-300 border-2 border-black h-2 w-32">
                    <div 
                      className="bg-blue-500 h-full border-r-2 border-black transition-all duration-300"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </BrutalistCard>
  );
}