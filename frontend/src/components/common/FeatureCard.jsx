import React from "react";

const FeatureCard = ({ icon: Icon, title, description, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    orange: "from-orange-500 to-orange-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
      <div className="text-center">
        <div
          className={`inline-flex p-3 rounded-full mb-4 bg-gradient-to-r ${colorClasses[color]} text-white`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
