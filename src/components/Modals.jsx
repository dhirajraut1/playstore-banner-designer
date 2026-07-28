import React, { useState } from "react";
import JSZip from "jszip";
import { Stage, Layer, Rect } from "react-konva";
import { useApp } from "../state/store.jsx";
import { bgConfigFor } from "./CanvasStage.jsx";
import CanvasObjectNode from "./CanvasObjectNode.jsx";

function noop() {}
const NO_HANDLERS = { onSelect: noop, onDragMove: noop, onDragEnd: noop, onTransformEnd: noop };

function dataURLtoBlob(dataurl) {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new Blob([u8], { type: mime });
}
function downloadDataUrl(uri, filename) {
  const a = document.createElement("a");
  a.href = uri;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function ExportModal({ onClose }) {
  const { project, activeCanvas, exportRefs, showToast } = useApp();
  const [scope, setScope] = useState("current");
  const [format, setFormat] = useState("png");
  const [scale, setScale] = useState(1);
  const [busy, setBusy] = useState(false);

  async function runExport() {
    setBusy(true);
    await new Promise((r) => setTimeout(r, 30));
    try {
      if (scope === "current") {
        const node = exportRefs.current[activeCanvas.id];
        if (!node) throw new Error("Canvas not ready");
        const uri = node.toDataURL({ pixelRatio: scale, mimeType: format === "jpg" ? "image/jpeg" : "image/png" });
        downloadDataUrl(uri, `${activeCanvas.name.replace(/\s+/g, "_")}.${format}`);
      } else {
        const zip = new JSZip();
        project.canvases.forEach((c, i) => {
          const node = exportRefs.current[c.id];
          if (!node) return;
          const uri = node.toDataURL({ pixelRatio: scale, mimeType: "image/png" });
          zip.file(`${String(i + 1).padStart(2, "0")}_${c.name.replace(/\s+/g, "_")}.png`, dataURLtoBlob(uri));
        });
        const content = await zip.generateAsync({ type: "blob" });
        downloadDataUrl(URL.createObjectURL(content), `${project.name.replace(/\s+/g, "_")}.zip`);
      }
      showToast("Export complete");
      onClose();
    } catch (e) {
      showToast("Export failed — try again in a moment");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <h3>Export</h3>
        <div className="field">
          <label>Scope</label>
          <select value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value="current">Current screen</option>
            <option value="all">Entire project (ZIP)</option>
          </select>
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Format</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)} disabled={scope === "all"}>
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
          </select>
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label>Resolution</label>
          <div className="seg">
            {[1, 2, 3].map((v) => (
              <button key={v} className={scale === v ? "active" : ""} onClick={() => setScale(v)}>{v}×</button>
            ))}
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" onClick={runExport} disabled={busy}>{busy ? "Exporting…" : "Export"}</button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsModal({ onClose }) {
  const { listSavedProjects, deleteSavedProject, loadProject, startNewProject } = useApp();
  const [, setTick] = useState(0);
  const all = listSavedProjects();
  const entries = Object.entries(all).sort((a, b) => b[1].updated - a[1].updated);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: 380 }}>
        <h3>Projects</h3>
        <div className="btn primary" style={{ justifyContent: "center", marginBottom: 12, cursor: "pointer" }} onClick={() => { startNewProject(); onClose(); }}>
          + New project
        </div>
        <div style={{ maxHeight: 340, overflowY: "auto" }}>
          {entries.length === 0 && <div style={{ color: "var(--text-2)", fontSize: 12, textAlign: "center", padding: "16px 0" }}>No saved projects yet.</div>}
          {entries.map(([id, p]) => (
            <div key={id} className="proj-item" onClick={() => { loadProject(id); onClose(); }}>
              <div>
                <div className="pname">{p.name}</div>
                <div className="pmeta">{new Date(p.updated).toLocaleString()}</div>
              </div>
              <button
                className="layer-btn"
                onClick={(e) => { e.stopPropagation(); deleteSavedProject(id); setTick((t) => t + 1); }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function ThumbBg({ cfg, width, height }) {
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

function PreviewThumb({ canvas, project }) {
  const w = 130;
  const h = Math.round(w * (canvas.height / canvas.width));
  const scale = w / canvas.width;
  const cfg = bgConfigFor(project, canvas);
  return (
    <div style={{ flex: "0 0 auto", textAlign: "center" }}>
      <div style={{ width: w, height: h, borderRadius: 8, overflow: "hidden", border: "1px solid var(--border)" }}>
        <Stage width={w} height={h} scaleX={scale} scaleY={scale} listening={false}>
          <Layer listening={false}>
            <ThumbBg cfg={cfg} width={canvas.width} height={canvas.height} />
            {canvas.objects.map((obj) => <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />)}
            {project.sharedObjects.map((obj) => <CanvasObjectNode key={obj.id} obj={obj} handlers={NO_HANDLERS} />)}
          </Layer>
        </Stage>
      </div>
      <div style={{ fontSize: 10, color: "var(--text-2)", marginTop: 5 }}>{canvas.name}</div>
    </div>
  );
}

export function PreviewModal({ onClose }) {
  const { project } = useApp();
  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: "auto", maxWidth: "90vw" }}>
        <h3>Preview — both screens</h3>
        <div style={{ display: "flex", gap: 14, overflowX: "auto", padding: "6px 0 4px", maxWidth: "80vw" }}>
          {project.canvases.map((c) => <PreviewThumb key={c.id} canvas={c} project={project} />)}
        </div>
        <div className="modal-actions">
          <button className="btn primary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
