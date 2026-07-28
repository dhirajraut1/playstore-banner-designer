import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { Stage, Layer, Rect, Transformer } from "react-konva";
import { useApp } from "../state/store.jsx";
import CanvasObjectNode from "./CanvasObjectNode.jsx";

function bgConfigFor(project, canvas) {
  if (project.connectBackground) return project.globalBackground;
  return canvas.background;
}

function BackgroundRect({ cfg, width, height }) {
  if (!cfg) return null;
  if (cfg.type === "solid") {
    return <Rect x={0} y={0} width={width} height={height} fill={cfg.color || "#222"} listening={false} />;
  }
  if (cfg.type === "linear") {
    const rad = ((cfg.angle || 90) * Math.PI) / 180;
    const len = Math.max(width, height);
    const dx = (Math.cos(rad) * len) / 2;
    const dy = (Math.sin(rad) * len) / 2;
    return (
      <Rect
        x={0} y={0} width={width} height={height} listening={false}
        fillLinearGradientStartPoint={{ x: width / 2 - dx, y: height / 2 - dy }}
        fillLinearGradientEndPoint={{ x: width / 2 + dx, y: height / 2 + dy }}
        fillLinearGradientColorStops={[0, cfg.color1, 1, cfg.color2]}
      />
    );
  }
  return (
    <Rect
      x={0} y={0} width={width} height={height} listening={false}
      fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
      fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
      fillRadialGradientStartRadius={0}
      fillRadialGradientEndRadius={Math.max(width, height) / 1.3}
      fillRadialGradientColorStops={[0, cfg.color1, 1, cfg.color2]}
    />
  );
}

export default function CanvasStage({ containerRef }) {
  const { project, activeCanvas, dispatch, selection, select, deselect, zoom, gridSnap } = useApp();

  const stageRef = useRef(null);
  const trRef = useRef(null);
  const nodeMap = useRef(new Map());
  const [stageSize, setStageSize] = useState({ w: 400, h: 700, scale: 1 });

  const fit = useCallback(() => {
    const scrollEl = containerRef.current;
    if (!scrollEl) return;
    const availW = scrollEl.clientWidth - 60;
    const availH = scrollEl.clientHeight - 40;
    const base = Math.min(availW / activeCanvas.width, availH / activeCanvas.height, 1);
    const scale = base * zoom;
    setStageSize({ w: activeCanvas.width * scale, h: activeCanvas.height * scale, scale });
  }, [activeCanvas.width, activeCanvas.height, zoom, containerRef]);

  useLayoutEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  useEffect(() => {
    if (!trRef.current) return;
    if (!selection) {
      trRef.current.nodes([]);
      trRef.current.getLayer()?.batchDraw();
      return;
    }
    const node = nodeMap.current.get(selection.id);
    trRef.current.nodes(node ? [node] : []);
    trRef.current.getLayer()?.batchDraw();
  });

  function makeHandlers(obj, isShared) {
    return {
      onSelect: (e) => {
        e.cancelBubble = true;
        select(obj.id, isShared);
      },
      onDragMove: (e) => {
        const node = e.target;
        if (gridSnap) {
          const g = 20;
          node.x(Math.round(node.x() / g) * g);
          node.y(Math.round(node.y() / g) * g);
        }
        dispatch(
          { type: "PATCH_OBJECT", id: obj.id, shared: isShared, patch: { x: node.x(), y: node.y() } },
          { commit: false }
        );
      },
      onDragEnd: (e) => {
        dispatch(
          { type: "PATCH_OBJECT", id: obj.id, shared: isShared, patch: { x: e.target.x(), y: e.target.y() } },
          { commit: true }
        );
      },
      onTransformEnd: (e) => {
        const node = e.target;
        dispatch(
          {
            type: "PATCH_OBJECT", id: obj.id, shared: isShared,
            patch: { rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY() },
          },
          { commit: true }
        );
      },
    };
  }

  const bgCfg = bgConfigFor(project, activeCanvas);

  return (
    <Stage
      ref={stageRef}
      width={stageSize.w}
      height={stageSize.h}
      scaleX={stageSize.scale}
      scaleY={stageSize.scale}
      onMouseDown={(e) => {
        if (e.target === e.target.getStage()) deselect();
      }}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage()) deselect();
      }}
    >
      <Layer listening={false}>
        <BackgroundRect cfg={bgCfg} width={activeCanvas.width} height={activeCanvas.height} />
      </Layer>
      <Layer>
        {activeCanvas.objects.map((obj) => (
          <CanvasObjectNode
            key={obj.id}
            obj={obj}
            handlers={makeHandlers(obj, false)}
            ref={(node) => {
              if (node) nodeMap.current.set(obj.id, node);
              else nodeMap.current.delete(obj.id);
            }}
          />
        ))}
        {project.sharedObjects.map((obj) => (
          <CanvasObjectNode
            key={obj.id}
            obj={obj}
            handlers={makeHandlers(obj, true)}
            ref={(node) => {
              if (node) nodeMap.current.set(obj.id, node);
              else nodeMap.current.delete(obj.id);
            }}
          />
        ))}
        <Transformer
          ref={trRef}
          rotateAnchorOffset={22}
          anchorSize={8}
          anchorCornerRadius={3}
          anchorStroke="#29D398"
          anchorFill="#0B1220"
          borderStroke="#29D398"
          borderDash={[4, 3]}
          keepRatio={false}
        />
      </Layer>
    </Stage>
  );
}

export { bgConfigFor };
