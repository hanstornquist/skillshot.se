import { describe, it, expect } from "vitest";
import { processDxfContent, parseEntity } from "./dxfHelpers";

describe("dxfHelpers", () => {
  describe("parseEntity", () => {
    it("should parse a LINE entity", () => {
      const lines = [
        "0",
        "LINE",
        "8",
        "0",
        "10",
        "0.0",
        "20",
        "0.0",
        "11",
        "10.0",
        "21",
        "10.0",
      ];
      const entity = parseEntity(lines);
      expect(entity.type).toBe("LINE");
      expect(entity.props[10]).toBe(0);
      expect(entity.props[20]).toBe(0);
      expect(entity.props[11]).toBe(10);
      expect(entity.props[21]).toBe(10);
    });

    it("should parse a LWPOLYLINE entity", () => {
      const lines = [
        "0",
        "LWPOLYLINE",
        "8",
        "0",
        "90",
        "2",
        "70",
        "0",
        "10",
        "0.0",
        "20",
        "0.0",
        "10",
        "10.0",
        "20",
        "10.0",
      ];
      const entity = parseEntity(lines);
      expect(entity.type).toBe("LWPOLYLINE");
      expect(entity.vertices).toHaveLength(2);
      expect(entity.vertices[0]).toEqual({ x: 0, y: 0 });
      expect(entity.vertices[1]).toEqual({ x: 10, y: 10 });
    });
  });

  describe("processDxfContent", () => {
    it("should process a simple DXF with one LINE", () => {
      const content = `0
SECTION
2
ENTITIES
0
LINE
8
0
10
0.0
20
0.0
11
100.0
21
100.0
0
ENDSEC
0
EOF`;
      const result = processDxfContent(content);
      expect(result).not.toBeNull();
      expect(result.stats.removedCount).toBe(0);
      expect(result.previewData.unique).toHaveLength(1);

      // Check viewBox
      // minX=0, maxX=100, minY=-100 (flipped), maxY=0 (flipped)
      // padding = 10
      // minX = -10, maxX = 110
      // minY = -110, maxY = 10
      // width = 120, height = 120
      const viewBox = result.previewData.viewBox.split(" ").map(Number);
      expect(viewBox[0]).toBeLessThan(0); // minX
      expect(viewBox[1]).toBeLessThan(0); // minY
      expect(viewBox[2]).toBeGreaterThan(100); // width
      expect(viewBox[3]).toBeGreaterThan(100); // height
    });

    it("should handle empty content", () => {
      const result = processDxfContent("");
      expect(result).toBeNull();
    });

    it("should handle DXF with no entities", () => {
      const content = `0
SECTION
2
ENTITIES
0
ENDSEC
0
EOF`;
      const result = processDxfContent(content);
      expect(result.previewData.unique).toHaveLength(0);
      // Should fallback to default viewBox
      expect(result.previewData.viewBox).toBe("-10 -10 120 120");
    });
  });
});
