import React from "react";
import { Truck } from "lucide-react";

const LoadingSpinner = ({ size = "md", message = "Chargement..." }) => {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
      <div className="relative">
        <Truck
          className={`${sizes[size]} text-blue-600 animate-pulse`}
          strokeWidth={2}
        />
        <div
          className={`absolute inset-0 ${sizes[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin`}
        />
      </div>
      {message && (
        <p className="text-sm text-gray-600 font-medium animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
