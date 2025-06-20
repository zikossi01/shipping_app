import React from "react";

const StatCard = ({ number, label, icon: Icon }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 text-center border border-white/20 hover:bg-white/90 transition-all duration-300">
      <div className="flex justify-center mb-2">
        <Icon className="h-8 w-8 text-blue-600" />
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{number}</div>
      <div className="text-sm text-gray-600 font-medium">{label}</div>
    </div>
  );
};

export default StatCard;
