import React from "react";

const LabsSection = ({ data, onNavigate }) => {
  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12 border-l-4 border-skillshot pl-8">
        <h2 className="mb-6 text-4xl font-black tracking-tighter text-black sm:text-6xl md:text-8xl uppercase break-words">
          {data.heading}
        </h2>
        <p className="max-w-2xl text-2xl font-light leading-tight text-gray-800 sm:text-3xl font-mono">
          {data.preamble}
        </p>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {data.links.map((link) => (
          <div
            key={link.id}
            className="border-2 border-black p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
            onClick={() => onNavigate(link.id)}
          >
            <h3 className="text-xl font-bold mb-2 font-mono uppercase group-hover:text-skillshot transition-colors">
              {link.title}
            </h3>
            <p className="text-gray-600 font-mono text-sm">
              {link.description}
            </p>
            <div className="mt-4 font-mono text-xs font-bold uppercase tracking-widest text-gray-400 group-hover:text-black">
              Open Tool &rarr;
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LabsSection;
