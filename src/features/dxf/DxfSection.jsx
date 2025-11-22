import { useState, useRef } from "react";
import { processDxfContent } from "./dxfHelpers";

const DxfSection = ({ data }) => {
  const [dxfContent, setDxfContent] = useState("");
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
        setDxfContent(content);
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
      case "ARC":
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
      case "LWPOLYLINE":
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
    <section className="dxf-section">
      <h3>{data.heading}</h3>
      <p>{data.preamble}</p>

      <div
        style={{
          marginBottom: "2rem",
          border: isDragging ? "2px dashed #f05a28" : "2px dashed #ccc",
          borderRadius: "8px",
          padding: "2rem",
          textAlign: "center",
          backgroundColor: isDragging
            ? "rgba(240, 90, 40, 0.05)"
            : "transparent",
          transition: "all 0.2s ease",
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <p>{data.dragDropText}</p>
        <input
          type="file"
          accept=".dxf"
          onChange={handleFileUpload}
          style={{ display: "none" }}
          id="dxf-upload"
        />
        <label
          htmlFor="dxf-upload"
          className="button button-skillshot"
          style={{
            fontWeight: "bold",
            padding: "0 30px",
            height: "48px",
            lineHeight: "48px",
            borderRadius: "4px",
            textTransform: "uppercase",
            letterSpacing: "1px",
            fontSize: "12px",
            display: "inline-block",
            cursor: "pointer",
          }}
        >
          {data.selectFileButton}
        </label>
        {fileName && (
          <p style={{ marginTop: "1rem" }}>
            {data.selectedFilePrefix}
            <strong>{fileName}</strong>
          </p>
        )}
      </div>

      {previewData && (
        <div style={{ marginBottom: "2rem" }}>
          <h5>{data.previewHeading}</h5>
          <div style={{ border: "1px solid #eee", height: "400px" }}>
            <svg
              viewBox={previewData.viewBox}
              style={{ width: "100%", height: "100%" }}
              preserveAspectRatio="xMidYMid meet"
            >
              {previewData.unique.map((ent, i) =>
                renderEntity(ent, `u-${i}`, "#333")
              )}
              {previewData.duplicates.map((ent, i) =>
                renderEntity(ent, `d-${i}`, "red", 2)
              )}
            </svg>
          </div>
          <p style={{ fontSize: "0.8em", color: "#666" }}>{data.previewNote}</p>
        </div>
      )}

      <div style={{ marginTop: "2rem", display: "flex", gap: "1rem" }}>
        {optimizedDxf && (
          <button
            className="button button-skillshot"
            onClick={downloadDxf}
            style={{
              fontWeight: "bold",
              padding: "0 30px",
              height: "48px",
              lineHeight: "48px",
              borderRadius: "4px",
              textTransform: "uppercase",
              letterSpacing: "1px",
              fontSize: "12px",
            }}
          >
            {data.downloadButton}
          </button>
        )}
      </div>

      {stats && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            background: "#e1f5fe",
            borderRadius: "4px",
          }}
        >
          <strong>{data.resultsHeading}</strong>
          <ul>
            <li>
              {data.removedCountPrefix}
              {stats.removedCount}
              {data.removedCountSuffix}
            </li>
            <li>
              {data.sizeReducedPrefix}
              {((stats.originalSize - stats.optimizedSize) / 1024).toFixed(2)}
              {data.sizeReducedSuffix}
            </li>
          </ul>
        </div>
      )}
    </section>
  );
};

export default DxfSection;
