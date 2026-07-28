import React from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useApp } from "../state/store.jsx";
import CanvasObjectNode from "./CanvasObjectNode.jsx";

function noop() {}
const NO_HANDLERS = { onSelect: noop, onDragMove: noop, onDragEnd: noop, onTransformEnd: noop };

function bgConfigForExport(project, canvas) {
  return project.connectBackground ? project.globalBackground : canvas.background;
}

function ExportBackground({ cfg, width, height }) {
  if (!cfg) return null;
  if (cfg.type === "solid") return <Rect x={0} y={0} width={width} height={height} fill={cfg.color || "#222"} />;
  const rad = ((cfg.angle || 90) * Math.PI) / 180;
  if (cfg.type === "linear") {
    const len = Math.max(width, height);
    const dx = (Math.cos(rad) * len) / 2, dy = (Math.sin(rad) * len) / 2;
    return (
      <Rect
        x={0} y={0} width={width} height={height}
        fillLinearGradientStartPoint={{ x: width / 2 - dx, y: height / 2 - dy }}
        fillLinearGradientEndPoint={{ x: width / 2 + dx, y: height / 2 + dy }}
        fillLinearGradientColorStops={[0, cfg.color1, 1, cfg.color2]}
      />
    );
  }
  return (
    <Rect
      x={0} y={0} width={width} height={height}
      fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
      fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
      fillRadialGradientStartRadius={0}
      fillRadialGradientEndRadius={Math.max(width, height) / 1.3}
      fillRadialGradientColorStops={[0, cfg.color1, 1, cfg.color2]}
    />
  );
}

export default function ExportHiddenStages() {
  const { project, exportRefs } = useApp();

  return (
    <div style={{ position: "fixed", left: -100000, top: 0, pointerEvents: "none" }} aria-hidden="true">
      {project.canvases.map((c) => {
        const cfg = bgConfigForExport(project, c);
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
              {c.objects.map((obj) => (
                <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />
              ))}
              {project.sharedObjects.map((obj) => (
                <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />
              ))}
            </Layer>
          </Stage>
        );
      })}
    </div>
  );
}
