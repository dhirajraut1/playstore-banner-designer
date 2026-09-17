import React, { useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useApp } from "../state/store.jsx";
import { MAX_SCREENS, CANVAS_PRESETS } from "../constants.js";
import CanvasObjectNode from "./CanvasObjectNode.jsx";
import { getCanvasBackgroundConfig, getCanvasRenderObjects } from "../utils/flowLayout.js";

const THUMB_W = 60;

function noop() {}
const NO_HANDLERS = { onSelect: noop, onDragMove: noop, onDragEnd: noop, onTransformEnd: noop };

function ThumbBackground({ cfg, width, height }) {
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

function Thumbnail({ canvas, index, project }) {
  const h = Math.round(THUMB_W * (canvas.height / canvas.width));
  const scale = THUMB_W / canvas.width;
  const cfg = getCanvasBackgroundConfig(index, project);
  const { localObjects, overflowObjects, sharedObjects } = getCanvasRenderObjects(index, project);

  return (
    <Stage width={THUMB_W} height={h} scaleX={scale} scaleY={scale} listening={false}>
      <Layer listening={false}>
        <ThumbBackground cfg={cfg} width={canvas.width} height={canvas.height} />
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
}

export default function Filmstrip() {
  const { project, activeIndex, dispatch, showToast, deselect, setViewMode } = useApp();
  const [addOpen, setAddOpen] = useState(false);
  const [renamingIndex, setRenamingIndex] = useState(null);
  const [renameText, setRenameText] = useState("");

  function switchCanvas(i) {
    deselect();
    dispatch({ type: "SWITCH_CANVAS", index: i }, { commit: false });
    setViewMode("single");
  }

  function addCanvas(preset) {
    if (project.canvases.length >= MAX_SCREENS) {
      showToast(`A project can have up to ${MAX_SCREENS} screens`);
      setAddOpen(false);
      return;
    }
    deselect();
    dispatch({ type: "ADD_CANVAS", preset });
    setAddOpen(false);
  }

  function duplicateCanvas(i) {
    if (project.canvases.length >= MAX_SCREENS) {
      showToast(`A project can have up to ${MAX_SCREENS} screens`);
      return;
    }
    deselect();
    dispatch({ type: "DUPLICATE_CANVAS", index: i });
    showToast("Screen duplicated");
  }

  function deleteCanvas(i) {
    if (project.canvases.length <= 1) {
      showToast("A project needs at least one screen");
      return;
    }
    deselect();
    dispatch({ type: "DELETE_CANVAS", index: i });
  }

  function moveCanvas(fromIndex, toIndex) {
    if (toIndex < 0 || toIndex >= project.canvases.length) return;
    dispatch({ type: "REORDER_CANVAS", fromIndex, toIndex });
  }

  function startRename(i, currentName) {
    setRenamingIndex(i);
    setRenameText(currentName);
  }

  function saveRename() {
    if (renamingIndex !== null && renameText.trim()) {
      dispatch({ type: "RENAME_CANVAS", index: renamingIndex, name: renameText.trim() });
    }
    setRenamingIndex(null);
  }

  function toggleFlow() {
    dispatch({ type: "TOGGLE_CONNECT_BACKGROUND" });
    showToast(
      !project.connectBackground
        ? "Backgrounds now flow continuously across all screens"
        : "Screens now have independent backgrounds"
    );
  }

  return (
    <div id="filmstrip-bar">
      <button
        type="button"
        className={"flow-toggle" + (project.connectBackground ? " on" : "")}
        onClick={toggleFlow}
        title="Flow the background gradient continuously across all screens"
        aria-pressed={project.connectBackground}
      >
        <div className="flow-dots"><span /><span /><span /></div>
        <div className="ft-label">Connect flow</div>
      </button>

      <div id="filmstrip">
        {project.canvases.map((c, i) => (
          <React.Fragment key={c.id}>
            {i > 0 && <div className={"fs-connector" + (project.connectBackground ? " on" : "")} />}
            <div
              className={"fs-item" + (i === activeIndex ? " active" : "")}
              onClick={() => switchCanvas(i)}
            >
              <div className="fs-thumb" onClick={() => switchCanvas(i)}>
                <Thumbnail canvas={c} index={i} project={project} />

                {/* Filmstrip action overlay */}
                <div className="fs-overlay" onClick={() => switchCanvas(i)}>
                  <div className="fs-actions-top" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="fs-act-btn fs-dup-btn"
                      title="Duplicate screen"
                      onClick={(e) => { e.stopPropagation(); duplicateCanvas(i); }}
                    >
                      ⧉
                    </button>
                    <button
                      type="button"
                      className="fs-act-btn fs-del-btn"
                      title="Delete screen"
                      onClick={(e) => { e.stopPropagation(); deleteCanvas(i); }}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="fs-actions-bottom" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="fs-act-btn"
                      title="Move screen left"
                      disabled={i === 0}
                      onClick={(e) => { e.stopPropagation(); moveCanvas(i, i - 1); }}
                    >
                      ◀
                    </button>
                    <button
                      type="button"
                      className="fs-act-btn"
                      title="Move screen right"
                      disabled={i === project.canvases.length - 1}
                      onClick={(e) => { e.stopPropagation(); moveCanvas(i, i + 1); }}
                    >
                      ▶
                    </button>
                  </div>
                </div>
              </div>

              {/* Screen name with inline edit */}
              {renamingIndex === i ? (
                <input
                  type="text"
                  className="fs-name-input"
                  value={renameText}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => setRenameText(e.target.value)}
                  onBlur={saveRename}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveRename();
                    if (e.key === "Escape") setRenamingIndex(null);
                  }}
                />
              ) : (
                <div
                  className="fs-name"
                  title="Click to open, double-click to rename"
                  onClick={(e) => {
                    e.stopPropagation();
                    switchCanvas(i);
                  }}
                  onDoubleClick={(e) => {
                    e.stopPropagation();
                    startRename(i, c.name);
                  }}
                >
                  {c.name}
                </div>
              )}
            </div>
          </React.Fragment>
        ))}

        {project.canvases.length < MAX_SCREENS && (
          <button
            type="button"
            className="fs-add"
            title={`Add screen (up to ${MAX_SCREENS})`}
            onClick={() => setAddOpen(true)}
          >
            +
          </button>
        )}
      </div>

      {addOpen && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setAddOpen(false); }}>
          <div className="modal">
            <h3>Add a screen</h3>
            {CANVAS_PRESETS.map((p) => (
              <div key={p.name} className="size-preset" onClick={() => addCanvas(p)}>
                <span>{p.name}</span>
                <span className="sp-dim">{p.w}×{p.h}</span>
              </div>
            ))}
            <div className="modal-actions">
              <button type="button" className="btn" onClick={() => setAddOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
