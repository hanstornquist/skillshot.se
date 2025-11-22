export const parseEntity = (lines) => {
  const entity = { type: "UNKNOWN", props: {}, vertices: [] };
  // First two lines are 0 and TYPE
  if (lines.length < 2) return entity;
  entity.type = lines[1].trim();

  let currentVertex = null;

  for (let i = 2; i < lines.length; i += 2) {
    if (i + 1 >= lines.length) break;
    const code = parseInt(lines[i].trim());
    const value = lines[i + 1].trim();

    if (entity.type === "LWPOLYLINE") {
      if (code === 10) {
        if (currentVertex) {
          entity.vertices.push(currentVertex);
        }
        currentVertex = { x: parseFloat(value), y: 0 };
      } else if (code === 20) {
        if (currentVertex) currentVertex.y = parseFloat(value);
      } else if (code === 70) {
        entity.props[code] = parseInt(value);
      }
    } else {
      // Store coordinates
      if (code >= 10 && code <= 39) {
        // Coordinates
        entity.props[code] = parseFloat(value);
      } else if (
        code === 40 ||
        code === 41 ||
        code === 42 ||
        code === 50 ||
        code === 51
      ) {
        // Radius, angles, bulge
        entity.props[code] = parseFloat(value);
      } else if (code === 70) {
        // Flags
        entity.props[code] = parseInt(value);
      }
    }
  }

  if (entity.type === "LWPOLYLINE" && currentVertex) {
    entity.vertices.push(currentVertex);
  }

  return entity;
};

export const processDxfContent = (content) => {
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const outputLines = [];
  let i = 0;

  let inEntitiesSection = false;
  let currentEntity = [];
  let entities = [];
  let removedCount = 0;

  const duplicates = [];
  const unique = [];

  while (i < lines.length) {
    const line = lines[i];
    // eslint-disable-next-line no-unused-vars
    const trimmed = line.trim();

    if (!inEntitiesSection) {
      outputLines.push(line);
      if (i + 1 < lines.length) {
        const code = lines[i].trim();
        const value = lines[i + 1].trim();

        if (code === "2" && value === "ENTITIES") {
          inEntitiesSection = true;
          outputLines.push(lines[i + 1]);
          i += 2;
          continue;
        }
      }
      i++;
    } else {
      const code = lines[i].trim();

      if (code === "0") {
        if (i + 1 < lines.length) {
          const value = lines[i + 1].trim();
          if (value === "ENDSEC") {
            const uniqueEntities = new Set();
            const uniqueEntityList = [];

            entities.forEach((ent) => {
              const signature = ent.join("\n");
              if (!uniqueEntities.has(signature)) {
                uniqueEntities.add(signature);
                uniqueEntityList.push(ent);
                unique.push(parseEntity(ent));
              } else {
                removedCount++;
                duplicates.push(parseEntity(ent));
              }
            });

            uniqueEntityList.forEach((ent) => {
              outputLines.push(...ent);
            });

            inEntitiesSection = false;
            outputLines.push(lines[i]);
            outputLines.push(lines[i + 1]);
            i += 2;
            continue;
          }

          if (currentEntity.length > 0) {
            entities.push(currentEntity);
          }
          currentEntity = [lines[i], lines[i + 1]];
          i += 2;
        } else {
          outputLines.push(lines[i]);
          i++;
        }
      } else {
        currentEntity.push(lines[i]);
        i++;
      }
    }
  }

  if (currentEntity.length > 0) {
    entities.push(currentEntity);
  }

  const result = outputLines.join("\n");

  // Calculate bounds for preview
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const allEnts = [...unique, ...duplicates];

  allEnts.forEach((ent) => {
    if (ent.type === "LWPOLYLINE" && ent.vertices) {
      ent.vertices.forEach((v) => {
        minX = Math.min(minX, v.x);
        maxX = Math.max(maxX, v.x);
        minY = Math.min(minY, -v.y);
        maxY = Math.max(maxY, -v.y);
      });
    } else {
      if (ent.props[10] !== undefined) {
        minX = Math.min(minX, ent.props[10]);
        maxX = Math.max(maxX, ent.props[10]);
      }
      if (ent.props[11] !== undefined) {
        minX = Math.min(minX, ent.props[11]);
        maxX = Math.max(maxX, ent.props[11]);
      }
      if (ent.props[20] !== undefined) {
        minY = Math.min(minY, -ent.props[20]); // Flip Y
        maxY = Math.max(maxY, -ent.props[20]);
      }
      if (ent.props[21] !== undefined) {
        minY = Math.min(minY, -ent.props[21]);
        maxY = Math.max(maxY, -ent.props[21]);
      }
      if (ent.type === "CIRCLE" || ent.type === "ARC") {
        const r = ent.props[40] || 0;
        minX = Math.min(minX, ent.props[10] - r);
        maxX = Math.max(maxX, ent.props[10] + r);
        minY = Math.min(minY, -ent.props[20] - r);
        maxY = Math.max(maxY, -ent.props[20] + r);
      }
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
      unique,
      duplicates,
      viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
    },
  };
};
