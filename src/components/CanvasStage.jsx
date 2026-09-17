import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { Stage, Layer, Rect, Line, Text as KText, Transformer, Group } from "react-konva";
import { useApp } from "../state/store.jsx";
import CanvasObjectNode from "./CanvasObjectNode.jsx";
import {
  computeScreenOffsets,
  computeTotalFlowWidth,
  computeMaxFlowHeight,
  getCanvasBackgroundConfig,
  getCanvasRenderObjects,
} from "../utils/flowLayout.js";

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
    const startPoint = cfg.startPoint || { x: width / 2 - dx, y: height / 2 - dy };
    const endPoint = cfg.endPoint || { x: width / 2 + dx, y: height / 2 + dy };
    return (
      <Rect
        x={0} y={0} width={width} height={height} listening={false}
        fillLinearGradientStartPoint={startPoint}
        fillLinearGradientEndPoint={endPoint}
        fillLinearGradientColorStops={[0, cfg.color1 || "#0F2027", 1, cfg.color2 || "#2C5364"]}
      />
    );
  }
  const startPoint = cfg.startPoint || { x: width / 2, y: height / 2 };
  const endPoint = cfg.endPoint || { x: width / 2, y: height / 2 };
  return (
    <Rect
      x={0} y={0} width={width} height={height} listening={false}
      fillRadialGradientStartPoint={startPoint}
      fillRadialGradientEndPoint={endPoint}
      fillRadialGradientStartRadius={cfg.startRadius || 0}
      fillRadialGradientEndRadius={cfg.endRadius || Math.max(width, height) / 1.3}
      fillRadialGradientColorStops={[0, cfg.color1 || "#0F2027", 1, cfg.color2 || "#2C5364"]}
    />
  );
}

export default function CanvasStage({ containerRef }) {
  const {
    project, activeIndex, activeCanvas, dispatch,
    selection, selectedObject, select, deselect,
    zoom, gridSnap, viewMode,
  } = useApp();

  const stageRef = useRef(null);
  const trRef = useRef(null);
  const nodeMap = useRef(new Map());
  const [stageSize, setStageSize] = useState({ w: 400, h: 700, scale: 1 });

  const isPanorama = viewMode === "panorama";
  const offsets = computeScreenOffsets(project.canvases);
  const totalFlowWidth = computeTotalFlowWidth(project.canvases);
  const maxFlowHeight = computeMaxFlowHeight(project.canvases);

  const fit = useCallback(() => {
    const scrollEl = containerRef.current;
    if (!scrollEl) return;
    const availW = scrollEl.clientWidth - 80;
    const availH = scrollEl.clientHeight - 60;

    const baseW = isPanorama ? totalFlowWidth : activeCanvas.width;
    const baseH = isPanorama ? maxFlowHeight : activeCanvas.height;

    const baseScale = Math.min(availW / baseW, availH / baseH, 1);
    const scale = baseScale * zoom;
    setStageSize({
      w: baseW * scale,
      h: baseH * scale,
      scale,
      baseW,
      baseH,
    });
  }, [activeCanvas.width, activeCanvas.height, totalFlowWidth, maxFlowHeight, zoom, containerRef, isPanorama]);

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

  function makeLocalHandlers(obj, isShared, targetCanvasIndex = activeIndex) {
    return {
      onSelect: (e) => {
        e.cancelBubble = true;
        if (targetCanvasIndex !== activeIndex && !isShared) {
          dispatch({ type: "SWITCH_CANVAS", index: targetCanvasIndex }, { commit: false });
        }
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
            type: "PATCH_OBJECT",
            id: obj.id,
            shared: isShared,
            patch: { rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY() },
          },
          { commit: true }
        );
      },
    };
  }

  function makeOverflowHandlers(overflowObj) {
    const srcIndex = overflowObj.sourceCanvasIndex;
    const origId = overflowObj.originalId;
    const offsetDiff = offsets[srcIndex] - offsets[activeIndex];

    return {
      onSelect: (e) => {
        e.cancelBubble = true;
        // Switch to source canvas and select original object
        dispatch({ type: "SWITCH_CANVAS", index: srcIndex }, { commit: false });
        select(origId, false);
      },
      onDragMove: (e) => {
        const node = e.target;
        if (gridSnap) {
          const g = 20;
          node.x(Math.round(node.x() / g) * g);
          node.y(Math.round(node.y() / g) * g);
        }
        // Map local coords back to source canvas: origX = localX - (otherOx - targetOx)
        const realX = node.x() - (offsets[srcIndex] - offsets[activeIndex]);
        dispatch(
          { type: "PATCH_OBJECT", id: origId, shared: false, patch: { x: realX, y: node.y() } },
          { commit: false }
        );
      },
      onDragEnd: (e) => {
        const realX = e.target.x() - (offsets[srcIndex] - offsets[activeIndex]);
        dispatch(
          { type: "PATCH_OBJECT", id: origId, shared: false, patch: { x: realX, y: e.target.y() } },
          { commit: true }
        );
      },
      onTransformEnd: (e) => {
        const node = e.target;
        dispatch(
          {
            type: "PATCH_OBJECT",
            id: origId,
            shared: false,
            patch: { rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY() },
          },
          { commit: true }
        );
      },
    };
  }

  const { localObjects, overflowObjects, sharedObjects } = getCanvasRenderObjects(activeIndex, project);
  const bgCfg = getCanvasBackgroundConfig(activeIndex, project);

  const shouldKeepRatio =
    selectedObject &&
    (selectedObject.type === "device" ||
      selectedObject.type === "image" ||
      selectedObject.type === "icon");

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
      {/* Background layer */}
      <Layer listening={false}>
        {!isPanorama ? (
          <BackgroundRect cfg={bgCfg} width={activeCanvas.width} height={activeCanvas.height} />
        ) : (
          project.canvases.map((c, i) => {
            const cBg = getCanvasBackgroundConfig(i, project);
            return (
              <Group key={c.id} x={offsets[i]} y={0}>
                <BackgroundRect cfg={cBg} width={c.width} height={c.height} />
              </Group>
            );
          })
        )}
      </Layer>

      {/* Main objects layer */}
      <Layer>
        {!isPanorama ? (
          <>
            {/* Overflow objects from other screens (rendered behind or with active interactivity) */}
            {overflowObjects.map((obj) => (
              <CanvasObjectNode
                key={obj.id}
                obj={obj}
                handlers={makeOverflowHandlers(obj)}
                ref={(node) => {
                  if (node) nodeMap.current.set(obj.id, node);
                  else nodeMap.current.delete(obj.id);
                }}
              />
            ))}

            {/* Local objects */}
            {localObjects.map((obj) => (
              <CanvasObjectNode
                key={obj.id}
                obj={obj}
                handlers={makeLocalHandlers(obj, false)}
                ref={(node) => {
                  if (node) nodeMap.current.set(obj.id, node);
                  else nodeMap.current.delete(obj.id);
                }}
              />
            ))}

            {/* Shared synced objects */}
            {sharedObjects.map((obj) => (
              <CanvasObjectNode
                key={obj.id}
                obj={obj}
                handlers={makeLocalHandlers(obj, true)}
                ref={(node) => {
                  if (node) nodeMap.current.set(obj.id, node);
                  else nodeMap.current.delete(obj.id);
                }}
              />
            ))}
          </>
        ) : (
          <>
            {/* PANORAMA STRIP MODE: Render all canvases side by side */}
            {project.canvases.map((c, cIdx) => (
              <Group key={c.id} x={offsets[cIdx]} y={0}>
                {c.objects.map((obj) => (
                  <CanvasObjectNode
                    key={obj.id}
                    obj={obj}
                    handlers={makeLocalHandlers(obj, false, cIdx)}
                    ref={(node) => {
                      if (node) nodeMap.current.set(obj.id, node);
                      else nodeMap.current.delete(obj.id);
                    }}
                  />
                ))}
              </Group>
            ))}

            {/* Shared objects rendered on active screen or each screen */}
            {project.canvases.map((c, cIdx) => (
              <Group key={`shared_${c.id}`} x={offsets[cIdx]} y={0}>
                {sharedObjects.map((obj) => (
                  <CanvasObjectNode
                    key={`${obj.id}_c${cIdx}`}
                    obj={obj}
                    handlers={makeLocalHandlers(obj, true, cIdx)}
                    ref={(node) => {
                      if (cIdx === activeIndex) {
                        if (node) nodeMap.current.set(obj.id, node);
                        else nodeMap.current.delete(obj.id);
                      }
                    }}
                  />
                ))}
              </Group>
            ))}

            {/* Screen divider lines and headers in panorama view */}
            {project.canvases.map((c, i) => (
              <Group key={`divider_${c.id}`} x={offsets[i]} y={0}>
                {i > 0 && (
                  <Line
                    points={[0, 0, 0, c.height]}
                    stroke="#29D398"
                    strokeWidth={2}
                    dash={[10, 8]}
                    opacity={0.7}
                    listening={false}
                  />
                )}
                <Rect
                  x={12}
                  y={12}
                  width={140}
                  height={28}
                  fill={i === activeIndex ? "#29D398" : "rgba(16,18,22,0.85)"}
                  cornerRadius={6}
                  listening={false}
                />
                <KText
                  x={20}
                  y={20}
                  text={`${c.name}`}
                  fill={i === activeIndex ? "#062018" : "#EEF0F4"}
                  fontSize={13}
                  fontFamily="Inter"
                  fontStyle="bold"
                  listening={false}
                />
              </Group>
            ))}
          </>
        )}

        <Transformer
          ref={trRef}
          rotateAnchorOffset={22}
          anchorSize={8}
          anchorCornerRadius={3}
          anchorStroke="#29D398"
          anchorFill="#0B1220"
          borderStroke="#29D398"
          borderDash={[4, 3]}
          keepRatio={shouldKeepRatio}
        />
      </Layer>
    </Stage>
  );
}

export function bgConfigFor(project, canvas) {
  const idx = project.canvases.indexOf(canvas);
  return getCanvasBackgroundConfig(idx >= 0 ? idx : 0, project);
}
