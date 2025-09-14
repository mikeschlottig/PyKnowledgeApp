import React from "react";

export default function BrutalistCard({ 
  children, 
  className = "", 
  color = "white",
  hover = false 
}) {
  const colorClasses = {
    white: "bg-white",
    blue: "bg-blue-500",
    pink: "bg-pink-500", 
    yellow: "bg-yellow-400",
    green: "bg-green-500",
    orange: "bg-orange-500"
  };

  return (
    <div 
      className={`
        brutalist-card brutalist-shadow p-6 
        ${colorClasses[color]} 
        ${hover ? 'hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#000000] transition-all duration-100' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}