import React from "react";

export default function BrutalistButton({ 
  children, 
  onClick,
  variant = "primary",
  size = "default",
  disabled = false,
  className = "",
  type = "button"
}) {
  const variants = {
    primary: "bg-blue-500 hover:bg-blue-400 text-white",
    secondary: "bg-pink-500 hover:bg-pink-400 text-white", 
    success: "bg-green-500 hover:bg-green-400 text-white",
    warning: "bg-orange-500 hover:bg-orange-400 text-white",
    danger: "bg-red-500 hover:bg-red-400 text-white",
    outline: "bg-white hover:bg-gray-100 text-black"
  };

  const sizes = {
    small: "px-3 py-2 text-xs",
    default: "px-6 py-3 text-sm",
    large: "px-8 py-4 text-lg"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        border-4 border-black font-black uppercase tracking-wider
        brutalist-shadow transition-all duration-100
        hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000000]
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0
        ${className}
      `}
    >
      {children}
    </button>
  );
}