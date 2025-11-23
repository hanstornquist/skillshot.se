import React from "react";

const BackButton = ({ onClick, label }) => {
  return (
    <button
      onClick={onClick}
      className="text-sm font-bold uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
    >
      &larr; {label}
    </button>
  );
};

export default BackButton;
