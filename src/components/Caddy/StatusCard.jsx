import React from "react";

const StatusCard = ({ image, count, label, color, className = "" }) => {
  const colorClasses = {
    success: { border: "border-green-500", text: "text-green-700" },
    info:    { border: "border-blue-500",  text: "text-blue-700"  },
    purple:  { border: "border-purple-500",text: "text-purple-700"},
    warning: { border: "border-yellow-400",text: "text-yellow-700"},
    error:   { border: "border-red-500",   text: "text-red-700"   },
  };
  const colors = colorClasses[color] || { border: "border-gray-300", text: "text-gray-700" };

  return (
    <div className={`w-full max-w-xs rounded-lg shadow-md p-4 flex flex-col items-center bg-white ${className}`}>
      {image && (
        <img
          src={image}
          alt={label}
          className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-md mb-3"
        />
      )}
      <span className={`mt-2 px-4 py-1 border ${colors.border} rounded-full text-lg font-bold ${colors.text}`}>
        {count ?? 0}
      </span>
      <div className="text-base text-black mt-4">{label}</div>
    </div>
  );
};

export default StatusCard;
