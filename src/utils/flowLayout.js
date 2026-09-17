/**
 * flowLayout.js
 * Utilities for computing multi-screen strip coordinates, continuous background
 * gradients, and cross-screen overflowing objects for Flowbanner.
 */

/**
 * Computes the horizontal start offset (x) of each canvas in the strip.
 * @param {Array} canvases 
 * @returns {number[]} Array of x offsets for each canvas
 */
export function computeScreenOffsets(canvases) {
  let cur = 0;
  const offsets = [];
  for (const c of canvases) {
    offsets.push(cur);
    cur += c.width;
  }
  return offsets;
}

/**
 * Computes total width across all canvases in the strip.
 * @param {Array} canvases 
 * @returns {number}
 */
export function computeTotalFlowWidth(canvases) {
  return canvases.reduce((sum, c) => sum + (c.width || 1080), 0);
}

/**
 * Computes max height among canvases (normally uniform, e.g. 1920)
 * @param {Array} canvases 
 * @returns {number}
 */
export function computeMaxFlowHeight(canvases) {
  return canvases.reduce((max, c) => Math.max(max, c.height || 1920), 0);
}

/**
 * Calculates sliced linear or radial background configuration for canvas index i
 * when connectBackground is active.
 * 
 * @param {number} canvasIndex 
 * @param {object} project 
 * @returns {object} background configuration with gradient endpoints mapped to local canvas coords
 */
export function getCanvasBackgroundConfig(canvasIndex, project) {
  const canvas = project.canvases[canvasIndex];
  if (!canvas) return { type: "solid", color: "#101216" };

  if (!project.connectBackground) {
    return canvas.background || { type: "solid", color: "#101216" };
  }

  const g = project.globalBackground || { type: "linear", color1: "#0F2027", color2: "#2C5364", angle: 120 };
  if (g.type === "solid") {
    return { type: "solid", color: g.color || "#0F2027" };
  }

  const offsets = computeScreenOffsets(project.canvases);
  const totalW = computeTotalFlowWidth(project.canvases);
  const ox = offsets[canvasIndex] || 0;
  const h = canvas.height;

  if (g.type === "radial") {
    return {
      type: "radial",
      color1: g.color1,
      color2: g.color2,
      startPoint: { x: totalW / 2 - ox, y: h / 2 },
      endPoint: { x: totalW / 2 - ox, y: h / 2 },
      startRadius: 0,
      endRadius: Math.max(totalW, h) / 1.3,
    };
  }

  // Linear gradient: continuous across totalW
  const angle = g.angle ?? 120;
  const rad = (angle * Math.PI) / 180;
  const cx = totalW / 2;
  const cy = h / 2;
  const len = Math.max(totalW, h);
  const dx = (Math.cos(rad) * len) / 2;
  const dy = (Math.sin(rad) * len) / 2;

  const globalStartX = cx - dx;
  const globalStartY = cy - dy;
  const globalEndX = cx + dx;
  const globalEndY = cy + dy;

  return {
    type: "linear",
    color1: g.color1,
    color2: g.color2,
    angle,
    startPoint: { x: globalStartX - ox, y: globalStartY },
    endPoint: { x: globalEndX - ox, y: globalEndY },
  };
}

/**
 * Returns all renderable objects for a specific canvas, including:
 * 1. The canvas's own local objects
 * 2. Overlapping / bleeding objects from other canvases
 * 3. Synced / shared objects
 * 
 * @param {number} canvasIndex
 * @param {object} project
 * @returns {{ localObjects: Array, overflowObjects: Array, sharedObjects: Array }}
 */
export function getCanvasRenderObjects(canvasIndex, project) {
  const targetCanvas = project.canvases[canvasIndex];
  if (!targetCanvas) return { localObjects: [], overflowObjects: [], sharedObjects: [] };

  const offsets = computeScreenOffsets(project.canvases);
  const targetOx = offsets[canvasIndex];
  const targetLeft = targetOx;
  const targetRight = targetOx + targetCanvas.width;

  const overflowObjects = [];

  // Inspect all other canvases to see if any of their objects bleed into canvasIndex
  project.canvases.forEach((otherCanvas, otherIndex) => {
    if (otherIndex === canvasIndex) return;

    const otherOx = offsets[otherIndex];

    (otherCanvas.objects || []).forEach((obj) => {
      if (obj.hidden) return;

      const scaleX = obj.scaleX || 1;
      const w = obj.width * scaleX;
      // Object horizontal span in world strip coordinates
      const worldLeft = otherOx + obj.x;
      const worldRight = worldLeft + w;

      // Check if world bounding box overlaps target canvas horizontal window
      if (worldRight > targetLeft && worldLeft < targetRight) {
        // Compute local coordinate on target canvas
        const localX = obj.x + (otherOx - targetOx);
        overflowObjects.push({
          ...obj,
          id: `${obj.id}__flow_${otherIndex}_to_${canvasIndex}`,
          originalId: obj.id,
          sourceCanvasIndex: otherIndex,
          isOverflow: true,
          x: localX,
          locked: false, // allow selection so user can click to edit
        });
      }
    });
  });

  return {
    localObjects: targetCanvas.objects || [],
    overflowObjects,
    sharedObjects: project.sharedObjects || [],
  };
}
