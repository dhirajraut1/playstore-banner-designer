import React from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useApp } from "../state/store.jsx";
import CanvasObjectNode from "./CanvasObjectNode.jsx";
import { getCanvasBackgroundConfig, getCanvasRenderObjects } from "../utils/flowLayout.js";

function noop() {}
const NO_HANDLERS = { onSelect: noop, onDragMove: noop, onDragEnd: noop, onTransformEnd: noop };

function ExportBackground({ cfg, width, height }) {
  if (!cfg) return null;
  if (cfg.type === "solid") return <Rect x={0} y={0} width={width} height={height} fill={cfg.color || "#222"} />;
  const rad = ((cfg.angle || 90) * Math.PI) / 180;
  const len = Math.max(width, height);
  const dx = (Math.cos(rad) * len) / 2, dy = (Math.sin(rad) * len) / 2;
  const startPoint = cfg.startPoint || { x: width / 2 - dx, y: height / 2 - dy };
  const endPoint = cfg.endPoint || { x: width / 2 + dx, y: height / 2 + dy };

  if (cfg.type === "linear") {
    return (
      <Rect
        x={0} y={0} width={width} height={height}
        fillLinearGradientStartPoint={startPoint}
        fillLinearGradientEndPoint={endPoint}
        fillLinearGradientColorStops={[0, cfg.color1 || "#0F2027", 1, cfg.color2 || "#2C5364"]}
      />
    );
  }
  const radStart = cfg.startPoint || { x: width / 2, y: height / 2 };
  const radEnd = cfg.endPoint || { x: width / 2, y: height / 2 };
  return (
    <Rect
      x={0} y={0} width={width} height={height}
      fillRadialGradientStartPoint={radStart}
      fillRadialGradientEndPoint={radEnd}
      fillRadialGradientStartRadius={cfg.startRadius || 0}
      fillRadialGradientEndRadius={cfg.endRadius || Math.max(width, height) / 1.3}
      fillRadialGradientColorStops={[0, cfg.color1 || "#0F2027", 1, cfg.color2 || "#2C5364"]}
    />
  );
}

export default function ExportHiddenStages() {
  const { project, exportRefs } = useApp();

  return (
    <div style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }} aria-hidden="true">
      {project.canvases.map((c, i) => {
        const cfg = getCanvasBackgroundConfig(i, project);
        const { localObjects, overflowObjects, sharedObjects } = getCanvasRenderObjects(i, project);

        return (
          <Stage
            key={c.id}
            width={c.width}
            height={c.height}
            ref={(node) => {
              if (node) exportRefs.current[c.id] = node;
              else delete exportRefs.current[c.id];
            }}
          >
            <Layer listening={false}>
              <ExportBackground cfg={cfg} width={c.width} height={c.height} />
            </Layer>
            <Layer listening={false}>
              {overflowObjects.map((obj) => (
                <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />
              ))}
              {localObjects.map((obj) => (
                <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />
              ))}
              {sharedObjects.map((obj) => (
                <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />
              ))}
            </Layer>
          </Stage>
        );
      })}
    </div>
  );
}
