import React, { useEffect, useRef, useState } from "react";
import { useApp } from "./state/store.jsx";
import { uid } from "./constants.js";
import TopBar from "./components/TopBar.jsx";
import LeftSidebar from "./components/LeftSidebar.jsx";
import RightSidebar from "./components/RightSidebar.jsx";
import Filmstrip from "./components/Filmstrip.jsx";
import CanvasStage from "./components/CanvasStage.jsx";
import ExportHiddenStages from "./components/ExportHiddenStages.jsx";
import { ExportModal, ProjectsModal, PreviewModal } from "./components/Modals.jsx";

export default function App() {
  const {
    activeCanvas, selection, selectedObject, selectedIsShared, dispatch, deselect,
    zoom, setZoom, gridSnap, setGridSnap,
    clipboard, setClipboard, undo, redo, toast,
  } = useApp();

  const scrollRef = useRef(null);
  const [modal, setModal] = useState(null); // 'export' | 'projects' | 'preview' | null

  function alignH() {
    if (!selectedObject) return;
    const x = activeCanvas.width / 2 - (selectedObject.width * (selectedObject.scaleX || 1)) / 2;
    dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { x } });
  }
  function alignV() {
    if (!selectedObject) return;
    const y = activeCanvas.height / 2 - (selectedObject.height * (selectedObject.scaleY || 1)) / 2;
    dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { y } });
  }

  useEffect(() => {
    function onKeyDown(e) {
      const tag = (e.target.tagName || "").toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      const mod = e.ctrlKey || e.metaKey;

      if (mod && e.key.toLowerCase() === "z" && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (mod && (e.key.toLowerCase() === "y" || (e.key.toLowerCase() === "z" && e.shiftKey))) { e.preventDefault(); redo(); return; }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (selectedObject) dispatch({ type: "DUPLICATE_OBJECT", id: selectedObject.id, shared: selectedIsShared });
        return;
      }
      if (mod && e.key.toLowerCase() === "c") {
        if (selectedObject) setClipboard(JSON.parse(JSON.stringify(selectedObject)));
        return;
      }
      if (mod && e.key.toLowerCase() === "v") {
        if (clipboard) {
          const clone = { ...JSON.parse(JSON.stringify(clipboard)), id: uid("obj") };
          clone.x = (clone.x || 0) + 30;
          clone.y = (clone.y || 0) + 30;
          dispatch({ type: "ADD_OBJECT", obj: clone });
        }
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (selectedObject) {
          dispatch({ type: "DELETE_OBJECT", id: selectedObject.id, shared: selectedIsShared });
          deselect();
        }
        return;
      }
      if (e.key === "Escape") { deselect(); return; }
      if (e.key === "+" || e.key === "=") { setZoom((z) => Math.min(3, z + 0.1)); return; }
      if (e.key === "-") { setZoom((z) => Math.max(0.15, z - 0.1)); return; }
      if (e.key.startsWith("Arrow") && selectedObject) {
        e.preventDefault();
        const d = e.shiftKey ? 10 : 1;
        const dx = e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0;
        const dy = e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0;
        dispatch(
          { type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { x: selectedObject.x + dx, y: selectedObject.y + dy } },
          { commit: false }
        );
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedObject, selectedIsShared, selection, clipboard, dispatch, deselect, setZoom, setClipboard, undo, redo]);

  return (
    <div id="app">
      <TopBar
        onOpenProjects={() => setModal("projects")}
        onOpenPreview={() => setModal("preview")}
        onOpenExport={() => setModal("export")}
      />
      <div id="main">
        <LeftSidebar />
        <div id="center">
          <div id="canvas-toolbar">
            <button className="icon-btn" title="Zoom out" onClick={() => setZoom((z) => Math.max(0.15, z - 0.1))}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" /></svg>
            </button>
            <div className="zoom-readout">{Math.round(zoom * 100)}%</div>
            <button className="icon-btn" title="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.1))}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6" /><path d="M8 11h6" /></svg>
            </button>
            <button className="icon-btn" title="Fit to screen" onClick={() => setZoom(1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
            </button>
            <div className="topbar-sep" />
            <div className={"pill-toggle" + (gridSnap ? " on" : "")} onClick={() => setGridSnap((v) => !v)}>
              <div className="switch" />Snap to grid
            </div>
            <div className="spacer" />
            <button className="icon-btn" title="Center horizontally" onClick={alignH} disabled={!selectedObject}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20" /><rect x="7" y="6" width="10" height="5" rx="1" /><rect x="4" y="14" width="16" height="5" rx="1" /></svg>
            </button>
            <button className="icon-btn" title="Center vertically" onClick={alignV} disabled={!selectedObject}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20" /><rect x="6" y="7" width="5" height="10" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></svg>
            </button>
          </div>
          <div id="stage-scroll" ref={scrollRef}>
            <div id="stage-wrap">
              <div className="canvas-label">{activeCanvas.name} — {activeCanvas.width}×{activeCanvas.height}</div>
              <CanvasStage containerRef={scrollRef} />
            </div>
          </div>
          <Filmstrip />
        </div>
        <RightSidebar />
      </div>

      <ExportHiddenStages />

      {modal === "export" && <ExportModal onClose={() => setModal(null)} />}
      {modal === "projects" && <ProjectsModal onClose={() => setModal(null)} />}
      {modal === "preview" && <PreviewModal onClose={() => setModal(null)} />}

      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}
