import React, { useState } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { useApp } from "../state/store.jsx";
import { MAX_SCREENS, CANVAS_PRESETS, uid } from "../constants.js";
import CanvasObjectNode from "./CanvasObjectNode.jsx";
import { bgConfigFor } from "./CanvasStage.jsx";

const THUMB_W = 56;

function noop() {}
const NO_HANDLERS = { onSelect: noop, onDragMove: noop, onDragEnd: noop, onTransformEnd: noop };

function ThumbBackground({ cfg, width, height }) {
  if (!cfg) return null;
  if (cfg.type === "solid") return <Rect x={0} y={0} width={width} height={height} fill={cfg.color || "#222"} />;
  const rad = ((cfg.angle || 90) * Math.PI) / 180;
  if (cfg.type === "linear") {
    const len = Math.max(width, height);
    const dx = (Math.cos(rad) * len) / 2, dy = (Math.sin(rad) * len) / 2;
    return (
      <Rect x={0} y={0} width={width} height={height}
        fillLinearGradientStartPoint={{ x: width / 2 - dx, y: height / 2 - dy }}
        fillLinearGradientEndPoint={{ x: width / 2 + dx, y: height / 2 + dy }}
        fillLinearGradientColorStops={[0, cfg.color1, 1, cfg.color2]} />
    );
  }
  return (
    <Rect x={0} y={0} width={width} height={height}
      fillRadialGradientStartPoint={{ x: width / 2, y: height / 2 }}
      fillRadialGradientEndPoint={{ x: width / 2, y: height / 2 }}
      fillRadialGradientStartRadius={0} fillRadialGradientEndRadius={Math.max(width, height) / 1.3}
      fillRadialGradientColorStops={[0, cfg.color1, 1, cfg.color2]} />
  );
}

function Thumbnail({ canvas, project }) {
  const h = Math.round(THUMB_W * (canvas.height / canvas.width));
  const scale = THUMB_W / canvas.width;
  const cfg = bgConfigFor(project, canvas);
  return (
    <Stage width={THUMB_W} height={h} scaleX={scale} scaleY={scale} listening={false}>
      <Layer listening={false}>
        <ThumbBackground cfg={cfg} width={canvas.width} height={canvas.height} />
        {canvas.objects.map((obj) => (
          <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />
        ))}
        {project.sharedObjects.map((obj) => (
          <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />
        ))}
      </Layer>
    </Stage>
  );
}

export default function Filmstrip() {
  const { project, activeIndex, dispatch, showToast, deselect } = useApp();
  const [addOpen, setAddOpen] = useState(false);

  function switchCanvas(i) {
    deselect();
    dispatch({ type: "SWITCH_CANVAS", index: i }, { commit: false });
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
    showToast("Screen duplicated — elements marked “sync across screens” stay linked automatically");
  }
  function deleteCanvas(i) {
    if (project.canvases.length <= 1) {
      showToast("A project needs at least one screen");
      return;
    }
    deselect();
    dispatch({ type: "DELETE_CANVAS", index: i });
  }
  function renameCanvas(i, name) {
    dispatch({ type: "RENAME_CANVAS", index: i, name });
  }
  function toggleFlow() {
    dispatch({ type: "TOGGLE_CONNECT_BACKGROUND" });
    showToast(
      !project.connectBackground
        ? "Backgrounds now flow continuously across screens"
        : "Screens now have independent backgrounds"
    );
  }

  return (
    <div id="filmstrip-bar">
      <div className={"flow-toggle" + (project.connectBackground ? " on" : "")} onClick={toggleFlow} title="Flow the background gradient continuously across screens">
        <div className="flow-dots"><span /><span /><span /></div>
        <div className="ft-label">Connect flow</div>
      </div>

      <div id="filmstrip">
        {project.canvases.map((c, i) => (
          <React.Fragment key={c.id}>
            {i > 0 && <div className={"fs-connector" + (project.connectBackground ? " on" : "")} />}
            <div className={"fs-item" + (i === activeIndex ? " active" : "")}>
              <div className="fs-thumb" onClick={() => switchCanvas(i)}>
                <Thumbnail canvas={c} project={project} />
                <button
                  className="fs-dup"
                  title="Duplicate this banner's layout to a new screen"
                  onClick={(e) => { e.stopPropagation(); duplicateCanvas(i); }}
                >
                  ⧉
                </button>
                <button
                  className="fs-del"
                  title="Delete screen"
                  onClick={(e) => { e.stopPropagation(); deleteCanvas(i); }}
                >
                  ✕
                </button>
              </div>
              <div
                className="fs-name"
                onDoubleClick={() => {
                  const nn = prompt("Rename screen", c.name);
                  if (nn) renameCanvas(i, nn);
                }}
              >
                {c.name}
              </div>
            </div>
          </React.Fragment>
        ))}
        {project.canvases.length < MAX_SCREENS && (
          <button className="fs-add" title={`Add screen (up to ${MAX_SCREENS})`} onClick={() => setAddOpen(true)}>
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
              <button className="btn" onClick={() => setAddOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
