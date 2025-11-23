import DxfParser from "dxf-parser";

// Helper to convert AutoCAD Color Index (ACI) to Hex
const aciToHex = (aci) => {
  // Basic ACI colors 1-9
  const standardColors = {
    1: 0xff0000, // Red
    2: 0xffff00, // Yellow
    3: 0x00ff00, // Green
    4: 0x00ffff, // Cyan
    5: 0x0000ff, // Blue
    6: 0xff00ff, // Magenta
    7: 0x000000, // White/Black (depending on background, usually black on white)
    8: 0x808080, // Dark Grey
    9: 0xc0c0c0, // Light Grey
  };
  if (standardColors[aci] !== undefined) return standardColors[aci];
  // For other colors, we could use a full map, but for now default to black
  return 0x000000;
};

export const processDxfContent = (content) => {
  if (!content) return null;

  // 1. Parse for Preview using dxf-parser
  const parser = new DxfParser();
  let parsed = null;
  try {
    parsed = parser.parseSync(content);
  } catch (err) {
    console.error("DXF Parsing failed:", err);
    return null;
  }

  if (!parsed || !parsed.entities) return null;

  // Extract layer colors
  const layerColors = {};
  if (parsed.tables && parsed.tables.layer && parsed.tables.layer.layers) {
    Object.values(parsed.tables.layer.layers).forEach((layer) => {
      let color = aciToHex(layer.color);

      // Force colors for specific layers
      const layerName = layer.name.toUpperCase();
      if (layerName.includes("INSETS")) {
        color = 0x00ff00; // Green
      } else if (layerName.includes("PERIMETER")) {
        color = 0x0000ff; // Blue
      }

      layerColors[layer.name] = color;
    });
  }

  // 2. Process for Optimization (Duplicate Removal)
  // We still use the text-based approach for writing the optimized file
  // to ensure we don't lose any data we don't understand.
  // However, we can use the parsed entities to help identify duplicates if needed,
  // but sticking to the text comparison is safer for exact byte-for-byte duplicates.

  const lines = content.split(/\r\n|\r|\n/).map((l) => l.trim());
  const outputLines = [];
  let i = 0;

  let inEntitiesSection = false;
  let currentEntity = [];
  let entities = [];
  let removedCount = 0;

  const unsupportedTypes = new Set();

  // Helper to parse entity from text lines for preview correlation
  // (We use the robust parser for the actual preview data now)

  while (i < lines.length) {
    if (!inEntitiesSection) {
      const line = lines[i];
      outputLines.push(line);

      if (line === "2" && i + 1 < lines.length) {
        const value = lines[i + 1];
        if (value === "ENTITIES") {
          inEntitiesSection = true;
          outputLines.push(value);
          i += 2;
          continue;
        }
      }
      i++;
    } else {
      // Skip empty lines to find the next Code
      while (i < lines.length && lines[i] === "") {
        i++;
      }

      if (i >= lines.length) break;

      const code = lines[i];

      // Ensure we have a value line
      if (i + 1 >= lines.length) {
        outputLines.push(code);
        i++;
        break;
      }

      const value = lines[i + 1];

      if (code === "0") {
        if (value === "ENDSEC") {
          // Ensure the last entity is included before processing
          if (currentEntity.length > 0) {
            entities.push(currentEntity);
            currentEntity = [];
          }

          const uniqueEntities = new Set();
          const uniqueEntityList = [];

          entities.forEach((ent) => {
            // Create a signature that ignores specific group codes
            // 5: Handle
            // 330: Owner Handle
            // 8: Layer
            // 62: Color
            // 6: Linetype
            // 420: True Color
            const ignoredCodes = new Set(["5", "330", "8", "62", "6", "420"]);
            let sigParts = [];
            for (let k = 0; k < ent.length; k += 2) {
              const code = ent[k];
              let value = ent[k + 1];
              if (ignoredCodes.has(code)) continue;

              // Round numeric values to avoid floating point noise
              // Codes 10-59, 110-149, 210-239 are typically doubles
              const codeInt = parseInt(code, 10);
              if (
                (codeInt >= 10 && codeInt <= 59) ||
                (codeInt >= 110 && codeInt <= 149) ||
                (codeInt >= 210 && codeInt <= 239)
              ) {
                const num = parseFloat(value);
                if (!isNaN(num)) {
                  value = (Math.round(num * 1000000) / 1000000).toString();
                }
              }

              sigParts.push(code);
              sigParts.push(value);
            }
            const signature = sigParts.join("\n");

            if (!uniqueEntities.has(signature)) {
              uniqueEntities.add(signature);
              uniqueEntityList.push(ent);
            } else {
              removedCount++;
            }
          });

          uniqueEntityList.forEach((ent) => {
            outputLines.push(...ent);
          });

          inEntitiesSection = false;
          outputLines.push(code);
          outputLines.push(value);
          i += 2;
          continue;
        }

        if (currentEntity.length > 0) {
          entities.push(currentEntity);
        }
        currentEntity = [code, value];
        i += 2;
      } else {
        currentEntity.push(code);
        currentEntity.push(value);
        i += 2;
      }
    }
  }

  if (currentEntity.length > 0) {
    entities.push(currentEntity);
  }

  const result = outputLines.join("\n");

  // Helper to apply transform to a point {x,y}
  const applyTransform = (point, t) => {
    if (!point) return { x: 0, y: 0 };
    // t = { x, y, scaleX, scaleY, rotation (rad) }
    const x = point.x * t.scaleX;
    const y = point.y * t.scaleY;

    const cos = Math.cos(t.rotation);
    const sin = Math.sin(t.rotation);

    const newX = x * cos - y * sin + t.x;
    const newY = x * sin + y * cos + t.y;

    // Preserve other properties (like bulge)
    // If the transform includes a flip (negative determinant), we might need to flip bulge sign.
    // Det = scaleX * scaleY.
    // If Det < 0, flip bulge.
    let newBulge = point.bulge;
    if (newBulge && t.scaleX * t.scaleY < 0) {
      newBulge = -newBulge;
    }

    return {
      ...point,
      x: newX,
      y: newY,
      bulge: newBulge,
    };
  };

  // Helper to transform entity geometry
  const transformEntityGeometry = (ent, t) => {
    // Clone entity
    const newEnt = JSON.parse(JSON.stringify(ent));

    // Apply t
    if (
      newEnt.type === "LINE" ||
      newEnt.type === "LWPOLYLINE" ||
      newEnt.type === "POLYLINE"
    ) {
      if (newEnt.vertices) {
        newEnt.vertices = newEnt.vertices.map((v) => applyTransform(v, t));
      }
    } else if (newEnt.type === "CIRCLE" || newEnt.type === "ARC") {
      if (newEnt.center) {
        newEnt.center = applyTransform(newEnt.center, t);
      }
      // Scale radius? Assuming uniform scale for radius for simplicity
      // If scaleX != scaleY, circle becomes ellipse, which we don't handle yet as CIRCLE
      // But for standard CAD parts, uniform scale is 99% of cases.
      newEnt.radius = (newEnt.radius || 0) * Math.abs(t.scaleX);

      // Rotation affects start/end angles of Arcs
      if (newEnt.type === "ARC") {
        newEnt.startAngle = (newEnt.startAngle || 0) + t.rotation;
        newEnt.endAngle = (newEnt.endAngle || 0) + t.rotation;
      }
    } else if (newEnt.type === "SPLINE") {
      if (newEnt.controlPoints) {
        newEnt.controlPoints = newEnt.controlPoints.map((v) =>
          applyTransform(v, t)
        );
      }
    }

    return newEnt;
  };

  // Recursive function to flatten entities (handle INSERTs)
  const flattenEntities = (
    entities,
    blocks,
    layerColors,
    transform = { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 },
    parentColor = null
  ) => {
    let result = [];

    if (!entities) return result;

    entities.forEach((ent) => {
      if (ent.type === "INSERT") {
        const blockName = ent.name;
        const block = blocks && blocks[blockName];
        if (block && block.entities) {
          // Calculate new transform
          const insPos = ent.position || { x: 0, y: 0 };
          const insScale = ent.scale || { x: 1, y: 1, z: 1 };
          const insRot = (ent.rotation || 0) * (Math.PI / 180); // degrees to radians

          const childTransform = {
            x: insPos.x,
            y: insPos.y,
            scaleX: insScale.x !== undefined ? insScale.x : 1,
            scaleY: insScale.y !== undefined ? insScale.y : 1,
            rotation: insRot,
          };

          // Determine color to pass down (Hex)
          let nextParentColor = parentColor;

          if (ent.color === 0) {
            // ByBlock: Inherit parent color
            nextParentColor = parentColor;
          } else if (ent.color === undefined || ent.color === 256) {
            // ByLayer: Use layer color
            nextParentColor = layerColors[ent.layer] || 0x000000;
          } else {
            // Explicit color (ACI)
            nextParentColor = aciToHex(ent.color);
          }

          // Recursively get entities from the block, transformed by childTransform
          const childEntities = flattenEntities(
            block.entities,
            blocks,
            layerColors,
            childTransform,
            nextParentColor
          );

          // Now apply parent transform to all child entities
          const transformedChildren = childEntities.map((child) =>
            transformEntityGeometry(child, transform)
          );

          result.push(...transformedChildren);
        }
      } else {
        // It's a geometry entity. Apply current transform.
        const newEnt = transformEntityGeometry(ent, transform);

        // Resolve final color (Hex)
        let finalColor = 0x000000;

        if (newEnt.color === 0) {
          // ByBlock: Use parent color (which is already Hex) or fallback to layer
          finalColor =
            parentColor !== null
              ? parentColor
              : layerColors[newEnt.layer] || 0x000000;
        } else if (newEnt.color === undefined || newEnt.color === 256) {
          // ByLayer: Use layer color
          finalColor = layerColors[newEnt.layer] || 0x000000;
        } else {
          // Explicit color (ACI)
          finalColor = aciToHex(newEnt.color);
        }

        newEnt.displayColor = finalColor;
        result.push(newEnt);
      }
    });

    return result;
  };

  // 3. Prepare Preview Data from the ROBUST parser
  // We need to map the parsed entities to our canvas format
  // and identify which ones are duplicates (this is tricky since we have two parsers now)
  // For now, let's just show the UNIQUE entities from the text parser,
  // but use the geometry from the robust parser?
  // No, that's hard to correlate.

  // Better approach:
  // Use the robust parser for EVERYTHING in the preview.
  // But we need to know which ones are duplicates.
  // We can try to deduplicate the parsed entities themselves.

  const parsedUnique = [];
  const parsedDuplicates = [];
  const seenSignatures = new Set();

  // Flatten entities (resolve Blocks/Inserts)
  const flattenedEntities = flattenEntities(
    parsed.entities,
    parsed.blocks,
    layerColors
  );

  flattenedEntities.forEach((ent) => {
    // Create a signature for the entity based on its properties
    // This is a simplified signature, might not catch all exact duplicates
    // but good enough for preview.
    const signature = JSON.stringify(ent, (key, value) => {
      if (
        key === "handle" ||
        key === "ownerHandle" ||
        key === "layer" ||
        key === "color" ||
        key === "displayColor" ||
        key === "lineType"
      )
        return undefined;
      if (typeof value === "number") {
        // Round to 6 decimal places to avoid floating point noise
        return Math.round(value * 1000000) / 1000000;
      }
      return value;
    });

    // Resolve color - already done in flattenEntities
    // let color = ent.displayColor;

    if (!seenSignatures.has(signature)) {
      seenSignatures.add(signature);
      parsedUnique.push(ent);
    } else {
      parsedDuplicates.push(ent);
    }
  }); // Calculate bounds from parsed entities
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  const allParsed = [...parsedUnique, ...parsedDuplicates];
  allParsed.forEach((ent) => {
    if (ent.type === "LINE") {
      minX = Math.min(minX, ent.vertices[0].x, ent.vertices[1].x);
      maxX = Math.max(maxX, ent.vertices[0].x, ent.vertices[1].x);
      minY = Math.min(minY, -ent.vertices[0].y, -ent.vertices[1].y);
      maxY = Math.max(maxY, -ent.vertices[0].y, -ent.vertices[1].y);
    } else if (ent.type === "CIRCLE" || ent.type === "ARC") {
      const r = ent.radius || 0;
      const cx = ent.center.x || 0;
      const cy = ent.center.y || 0;
      minX = Math.min(minX, cx - r);
      maxX = Math.max(maxX, cx + r);
      minY = Math.min(minY, -cy - r);
      maxY = Math.max(maxY, -cy + r);
    } else if (ent.type === "LWPOLYLINE" || ent.type === "POLYLINE") {
      ent.vertices.forEach((v) => {
        minX = Math.min(minX, v.x);
        maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, -v.y);
        maxY = Math.max(maxY, -v.y);
      });
    } else if (ent.type === "SPLINE") {
      ent.controlPoints.forEach((v) => {
        minX = Math.min(minX, v.x);
        maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, -v.y);
        maxY = Math.max(maxY, -v.y);
      });
    } else {
      unsupportedTypes.add(ent.type);
    }
  });

  if (minX === Infinity) {
    minX = 0;
    minY = 0;
    maxX = 100;
    maxY = 100;
  }

  // Add padding
  const padding = (maxX - minX) * 0.1 || 10;
  minX -= padding;
  maxX += padding;
  minY -= padding;
  maxY += padding;

  return {
    optimizedDxf: result,
    stats: {
      originalSize: content.length,
      optimizedSize: result.length,
      removedCount: removedCount,
    },
    previewData: {
      unique: parsedUnique,
      duplicates: parsedDuplicates,
      bounds: {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY,
      },
      unsupportedTypes: Array.from(unsupportedTypes),
    },
  };
};

export const parseEntity = () => {
  // Legacy parser kept for the text-based optimization logic
  // ... (we don't strictly need this exported anymore if we don't use it elsewhere)
  return {};
};
