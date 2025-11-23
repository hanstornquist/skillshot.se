import { useEffect, useRef, useState } from "react";
import { Viewer } from "./viewer/index";

const DxfCanvas = ({ data, width = 800, height = 500 }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Prepare DXF data structure for three-dxf
    // We merge unique and duplicates, but force duplicates to be RED

    const duplicates = data.duplicates.map((ent) => ({
      ...ent,
      color: 0xff0000, // Red
      layer: "DUPLICATES", // Fake layer
    }));

    // Map unique entities to use their pre-calculated displayColor
    // This ensures layer colors are respected (converted from ACI to Hex)
    const unique = data.unique.map((ent) => ({
      ...ent,
      color: ent.displayColor || 0x000000,
    }));

    const mergedEntities = [...unique, ...duplicates];

    const dxfData = {
      header: {},
      tables: {
        layer: {
          layers: {
            DUPLICATES: { color: 1 },
          },
        },
        lineType: {
          lineTypes: {},
        },
      },
      blocks: {},
      entities: mergedEntities,
    };

    // Initialize Viewer
    // Note: Font is optional but text won't render without it.
    // We can try to load a font if needed, but for now let's skip it to avoid async complexity.
    try {
      setZoom(100);
      const viewer = new Viewer(
        dxfData,
        containerRef.current,
        width,
        height,
        null
      );
      viewer.onZoomChange = (z) => setZoom(Math.round(z * 100));
      viewerRef.current = viewer;
    } catch (e) {
      console.error("Three-dxf viewer error:", e);
    }

    const container = containerRef.current;
    return () => {
      // Cleanup if needed
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [data, width, height]);

  return (
    <div className="relative" style={{ width, height }}>
      <div
        ref={containerRef}
        className="border-2 border-black bg-white overflow-hidden w-full h-full"
      />
      <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border-2 border-black p-2 shadow-lg">
        <button
          onClick={() => viewerRef.current?.zoomOut()}
          className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-100 active:bg-gray-200"
          title="Zoom Out"
        >
          -
        </button>
        <span className="font-mono text-sm min-w-[3rem] text-center">
          {zoom}%
        </span>
        <button
          onClick={() => viewerRef.current?.zoomIn()}
          className="w-8 h-8 flex items-center justify-center font-bold hover:bg-gray-100 active:bg-gray-200"
          title="Zoom In"
        >
          +
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <button
          onClick={() => viewerRef.current?.resetView()}
          className="px-2 h-8 font-mono text-xs font-bold uppercase hover:bg-gray-100 active:bg-gray-200"
          title="Zoom to Fit"
        >
          Fit
        </button>
      </div>
    </div>
  );
};

export default DxfCanvas;
