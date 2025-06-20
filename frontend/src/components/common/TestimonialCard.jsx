import React from "react";
import { Star } from "lucide-react";

const TestimonialCard = ({ name, role, content, rating, avatar }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border border-gray-100">
      <div className="flex items-center mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
        ))}
      </div>

      <p className="text-gray-700 mb-6 italic leading-relaxed">"{content}"</p>

      <div className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
          {avatar}
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{name}</h4>
          <p className="text-sm text-gray-600">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
