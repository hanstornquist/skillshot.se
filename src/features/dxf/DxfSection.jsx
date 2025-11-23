import { useState } from "react";
import { processDxfContent } from "./dxfHelpers";

const DxfSection = ({ data }) => {
  const [optimizedDxf, setOptimizedDxf] = useState("");
  const [stats, setStats] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  const handleFile = (file) => {
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        setOptimizedDxf("");
        setStats(null);
        setPreviewData(null);

        const result = processDxfContent(content);
        if (result) {
          setOptimizedDxf(result.optimizedDxf);
          setStats(result.stats);
          setPreviewData(result.previewData);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (event) => {
    handleFile(event.target.files[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.name.toLowerCase().endsWith(".dxf")) {
      handleFile(file);
    }
  };

  const renderEntity = (entity, key, color = "black", strokeWidth = 1) => {
    const { type, props, vertices } = entity;

    switch (type) {
      case "LINE":
        return (
          <line
            key={key}
            x1={props[10] || 0}
            y1={-(props[20] || 0)} // Flip Y for SVG
            x2={props[11] || 0}
            y2={-(props[21] || 0)}
            stroke={color}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        );
      case "CIRCLE":
        return (
          <circle
            key={key}
            cx={props[10] || 0}
            cy={-(props[20] || 0)}
            r={props[40] || 0}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        );
      case "ARC": {
        // SVG Arc: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
        // DXF Arc: Center(10,20), Radius(40), StartAngle(50), EndAngle(51)
        const cx = props[10] || 0;
        const cy = -(props[20] || 0);
        const r = props[40] || 0;
        let startAngle = props[50] || 0;
        let endAngle = props[51] || 0;

        // Convert degrees to radians
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;

        // Calculate start and end points
        // Note: DXF angles are CCW from X-axis. SVG Y is down.
        // In standard math (Y up), x = r*cos(a), y = r*sin(a)
        // In SVG (Y down), y = -r*sin(a) if we want to match visual appearance

        const x1 = cx + r * Math.cos(startRad);
        const y1 = cy - r * Math.sin(startRad);
        const x2 = cx + r * Math.cos(endRad);
        const y2 = cy - r * Math.sin(endRad);

        // Large arc flag
        let diffAngle = endAngle - startAngle;
        if (diffAngle < 0) diffAngle += 360;
        const largeArc = diffAngle > 180 ? 1 : 0;

        // Sweep flag: DXF is CCW. In SVG (Y down), CCW is actually sweep=0 if we look at it?
        // Let's try sweep=0 for CCW in Y-down system.

        const d = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 0 ${x2} ${y2}`;

        return (
          <path
            key={key}
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        );
      }
      case "LWPOLYLINE": {
        if (!vertices || vertices.length < 2) return null;
        const pathData = vertices
          .map((v, i) => `${i === 0 ? "M" : "L"} ${v.x} ${-v.y}`)
          .join(" ");

        const isClosed = (props[70] & 1) === 1;
        const polyD = pathData + (isClosed ? " Z" : "");

        return (
          <path
            key={key}
            d={polyD}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            vectorEffect="non-scaling-stroke"
          />
        );
      }
      default:
        return null;
    }
  };

  const downloadDxf = () => {
    if (!optimizedDxf) return;
    const blob = new Blob([optimizedDxf], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized_${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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

      <div
        className={`mb-12 border-2 border-dashed p-12 text-center transition-all ${
          isDragging
            ? "border-skillshot bg-orange-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p className="mb-6 font-mono text-sm uppercase tracking-widest text-gray-500">
          {data.dragDropText}
        </p>
        <input
          type="file"
          accept=".dxf"
          onChange={handleFileUpload}
          className="hidden"
          id="dxf-upload"
        />
        <label
          htmlFor="dxf-upload"
          className="inline-block bg-black text-white font-mono text-xs font-bold py-4 px-10 uppercase tracking-widest hover:bg-skillshot transition-colors cursor-pointer"
        >
          {data.selectFileButton}
        </label>
        {fileName && (
          <div className="mt-6 font-mono text-sm">
            <span className="text-gray-500">{data.selectedFilePrefix}</span>
            <span className="font-bold text-black ml-2">{fileName}</span>
          </div>
        )}
      </div>

      {previewData && (
        <div className="mb-12">
          <h5 className="font-mono text-xs uppercase tracking-widest text-gray-500 mb-4">
            {data.previewHeading}
          </h5>
          <div className="border-2 border-black h-[500px] bg-white p-4">
            <svg
              viewBox={previewData.viewBox}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {previewData.unique.map((ent, i) =>
                renderEntity(ent, `u-${i}`, "#000")
              )}
              {previewData.duplicates.map((ent, i) =>
                renderEntity(ent, `d-${i}`, "#f05a28", 2)
              )}
            </svg>
          </div>
          <p className="font-mono text-xs text-gray-400 mt-2">
            {data.previewNote}
          </p>
        </div>
      )}

      <div className="flex gap-4">
        {optimizedDxf && (
          <button
            className="bg-skillshot text-white font-mono text-xs font-bold py-4 px-10 uppercase tracking-widest hover:bg-black transition-colors"
            onClick={downloadDxf}
          >
            {data.downloadButton}
          </button>
        )}
      </div>

      {stats && (
        <div className="mt-8 border-l-4 border-skillshot pl-6 py-2">
          <strong className="block font-mono text-xs uppercase tracking-widest text-gray-500 mb-2">
            {data.resultsHeading}
          </strong>
          <ul className="space-y-1 font-mono text-sm">
            <li>
              <span className="text-gray-600">{data.removedCountPrefix}</span>
              <span className="font-bold text-black ml-2">
                {stats.removedCount}
              </span>
              <span className="text-gray-600 ml-1">
                {data.removedCountSuffix}
              </span>
            </li>
            <li>
              <span className="text-gray-600">{data.sizeReducedPrefix}</span>
              <span className="font-bold text-black ml-2">
                {((stats.originalSize - stats.optimizedSize) / 1024).toFixed(2)}
              </span>
              <span className="text-gray-600 ml-1">
                {data.sizeReducedSuffix}
              </span>
            </li>
          </ul>
        </div>
      )}
    </section>
  );
};

export default DxfSection;
