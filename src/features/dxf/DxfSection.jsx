import { useState, useRef, useEffect } from "react";
import { processDxfContent } from "./dxfHelpers";
import DxfCanvas from "./DxfCanvas";
import BackButton from "../../components/BackButton";

const DxfSection = ({ data, globalData, onNavigate }) => {
  const [optimizedDxf, setOptimizedDxf] = useState("");
  const [stats, setStats] = useState(null);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(800);

  const common = globalData?.common || {
    backButton: "Back",
    backTarget: "labs",
  };

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    // Update width when previewData changes (and element appears)
    if (previewData) {
      updateWidth();
    }

    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [previewData]);

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

  const downloadDxf = () => {
    if (!optimizedDxf) return;
    const blob = new Blob([optimizedDxf], { type: "application/dxf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.optimizedFilePrefix || "optimized_"}${fileName}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <BackButton
          onClick={() => onNavigate(common.backTarget)}
          label={common.backButton}
        />
      </div>

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
          <div ref={containerRef} className="w-full">
            <DxfCanvas data={previewData} width={containerWidth} height={500} />
          </div>
          <p className="font-mono text-xs text-gray-400 mt-2">
            {data.previewNote}
          </p>
          {previewData.unsupportedTypes &&
            previewData.unsupportedTypes.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-800 font-mono text-xs">
                <strong>{data.unsupportedWarningTitle}</strong>{" "}
                {data.unsupportedWarningPrefix}
                {previewData.unsupportedTypes.join(", ")}
                {data.unsupportedWarningSuffix}
              </div>
            )}
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
