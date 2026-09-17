import React, { useEffect, useRef, useState } from "react";
import { useApp } from "./state/store.jsx";
import { uid, baseObject } from "./constants.js";
import TopBar from "./components/TopBar.jsx";
import LeftSidebar from "./components/LeftSidebar.jsx";
import RightSidebar from "./components/RightSidebar.jsx";
import Filmstrip from "./components/Filmstrip.jsx";
import CanvasStage from "./components/CanvasStage.jsx";
import ExportHiddenStages from "./components/ExportHiddenStages.jsx";
import { ExportModal, ProjectsModal, PreviewModal } from "./components/Modals.jsx";
import VideoCanvasStage from "./components/VideoCanvasStage.jsx";
import VideoTimeline from "./components/VideoTimeline.jsx";
import VideoPropertiesPanel from "./components/VideoPropertiesPanel.jsx";
import VideoExportModal from "./components/VideoExportModal.jsx";

export default function App() {
  const {
    activeCanvas, project, selection, selectedObject, selectedIsShared, dispatch, deselect,
    zoom, setZoom, gridSnap, setGridSnap, viewMode, setViewMode,
    clipboard, setClipboard, undo, redo, toast, showToast, select,
    appMode, setAppMode, isPlaying, setIsPlaying, videoTime, setVideoTime,
    videoFormat, setVideoFormat,
  } = useApp();

  const scrollRef = useRef(null);
  const videoStageRef = useRef(null);
  const [modal, setModal] = useState(null); // 'export' | 'projects' | 'preview' | 'video-export' | null
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  function alignH() {
    if (!selectedObject) return;
    const isCenterOrigin = selectedObject.type === "circle" || selectedObject.type === "triangle";
    const x = isCenterOrigin
      ? activeCanvas.width / 2
      : activeCanvas.width / 2 - (selectedObject.width * (selectedObject.scaleX || 1)) / 2;
    dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { x } });
  }

  function alignV() {
    if (!selectedObject) return;
    const isCenterOrigin = selectedObject.type === "circle" || selectedObject.type === "triangle";
    const y = isCenterOrigin
      ? activeCanvas.height / 2
      : activeCanvas.height / 2 - (selectedObject.height * (selectedObject.scaleY || 1)) / 2;
    dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { y } });
  }

  // Prevent browser from opening dropped files anywhere on the page
  useEffect(() => {
    function onWindowDragOver(e) { e.preventDefault(); }
    function onWindowDrop(e) { e.preventDefault(); }
    window.addEventListener("dragover", onWindowDragOver);
    window.addEventListener("drop", onWindowDrop);
    return () => {
      window.removeEventListener("dragover", onWindowDragOver);
      window.removeEventListener("drop", onWindowDrop);
    };
  }, []);

  function handleCanvasDrop(e) {
    e.preventDefault();
    setIsDragOverCanvas(false);
    const files = e.dataTransfer.files;
    if (!files || !files.length) return;

    [...files].forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        // If a device is currently selected, drop into that device
        if (selectedObject && selectedObject.type === "device") {
          dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { imageSrc: dataUrl } });
          showToast("Screenshot applied to device mockup");
          return;
        }
        // Otherwise add as new image object centered
        const img = new window.Image();
        img.onload = () => {
          const maxW = activeCanvas.width * 0.6;
          const scale = Math.min(1, maxW / img.width);
          const w = img.width * scale;
          const h = img.height * scale;
          const newObj = baseObject(
            {
              type: "image",
              x: (activeCanvas.width - w) / 2,
              y: (activeCanvas.height - h) / 2,
              width: w,
              height: h,
              imageSrc: dataUrl,
            },
            activeCanvas
          );
          dispatch({ type: "ADD_OBJECT", obj: newObj });
          select(newObj.id, false);
          showToast("Image added to canvas");
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    });
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
      if (e.code === "Space" && appMode === "video") {
        e.preventDefault();
        setIsPlaying((p) => !p);
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
  }, [selectedObject, selectedIsShared, selection, clipboard, dispatch, deselect, setZoom, setClipboard, undo, redo, appMode, setIsPlaying]);

  return (
    <div id="app">
      <TopBar
        onOpenProjects={() => setModal("projects")}
        onOpenPreview={() => setModal("preview")}
        onOpenExport={() => setModal("export")}
        onOpenVideoExport={() => setModal("video-export")}
      />
      <div id="main">
        <LeftSidebar />
        <div id="center">
          {appMode === "video" ? (
            <div id="canvas-toolbar">
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
                <span>🎬</span> Promo Video Studio
              </div>
              <div className="topbar-sep" />
              <div className="field-row" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "var(--text-2)" }}>Aspect Ratio:</span>
                <div className="seg">
                  <button
                    type="button"
                    className={videoFormat?.id === "16-9" ? "active" : ""}
                    onClick={() => setVideoFormat({ id: "16-9", name: "16:9 Landscape", w: 1920, h: 1080 })}
                  >
                    16:9 Landscape (1080p)
                  </button>
                  <button
                    type="button"
                    className={videoFormat?.id === "9-16" ? "active" : ""}
                    onClick={() => setVideoFormat({ id: "9-16", name: "9:16 Portrait", w: 1080, h: 1920 })}
                  >
                    9:16 Reel / Shorts
                  </button>
                  <button
                    type="button"
                    className={videoFormat?.id === "1-1" ? "active" : ""}
                    onClick={() => setVideoFormat({ id: "1-1", name: "1:1 Square", w: 1080, h: 1080 })}
                  >
                    1:1 Square
                  </button>
                </div>
              </div>

              <div className="spacer" />
              <div style={{ fontSize: 11, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 6 }}>
                <kbd style={{ background: "var(--bg-3)", padding: "2px 6px", borderRadius: 4, border: "1px solid var(--border)", fontSize: 10 }}>Space</kbd> Play / Pause
              </div>
            </div>
          ) : (
            <div id="canvas-toolbar">
              <button type="button" className="icon-btn" title="Zoom out" onClick={() => setZoom((z) => Math.max(0.15, z - 0.1))}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M8 11h6" /></svg>
              </button>
              <div className="zoom-readout">{Math.round(zoom * 100)}%</div>
              <button type="button" className="icon-btn" title="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.1))}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /><path d="M11 8v6" /><path d="M8 11h6" /></svg>
              </button>
              <button type="button" className="icon-btn" title="Fit to view" onClick={() => setZoom(1)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
              </button>
              <div className="topbar-sep" />
              <div
                className={"pill-toggle" + (gridSnap ? " on" : "")}
                tabIndex={0}
                role="switch"
                aria-checked={gridSnap}
                onClick={() => setGridSnap((v) => !v)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setGridSnap((v) => !v); } }}
              >
                <div className="switch" />Snap to grid
              </div>

              {/* View Mode Switcher: Single vs Panorama */}
              <div className="seg" style={{ marginLeft: 8 }}>
                <button
                  type="button"
                  className={viewMode === "single" ? "active" : ""}
                  onClick={() => setViewMode("single")}
                  title="View active screen"
                >
                  Single Screen
                </button>
                <button
                  type="button"
                  className={viewMode === "panorama" ? "active" : ""}
                  onClick={() => setViewMode("panorama")}
                  title="View all screens connected side-by-side"
                >
                  Panorama Strip
                </button>
              </div>

              <div className="spacer" />
              <button type="button" className="icon-btn" title="Center horizontally" onClick={alignH} disabled={!selectedObject}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20" /><rect x="7" y="6" width="10" height="5" rx="1" /><rect x="4" y="14" width="16" height="5" rx="1" /></svg>
              </button>
              <button type="button" className="icon-btn" title="Center vertically" onClick={alignV} disabled={!selectedObject}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h20" /><rect x="6" y="7" width="5" height="10" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></svg>
              </button>
            </div>
          )}

          <div
            id="stage-scroll"
            ref={scrollRef}
            className={isDragOverCanvas ? "drag-target-active" : ""}
            onDragOver={(e) => { e.preventDefault(); setIsDragOverCanvas(true); }}
            onDragLeave={() => setIsDragOverCanvas(false)}
            onDrop={handleCanvasDrop}
          >
            <div id="stage-wrap">
              <div className="canvas-label">
                {appMode === "video"
                  ? `Live Promo Video Preview — ${videoFormat?.name || "16:9 Landscape"} (${videoFormat?.w}×${videoFormat?.h})`
                  : viewMode === "panorama"
                  ? `Panorama Flow — ${project.canvases.length} screens continuous strip`
                  : `${activeCanvas.name} — ${activeCanvas.width}×${activeCanvas.height}`}
              </div>
              {appMode === "video" ? (
                <VideoCanvasStage containerRef={scrollRef} stageRef={videoStageRef} />
              ) : (
                <CanvasStage containerRef={scrollRef} />
              )}
            </div>
          </div>
          {appMode === "video" ? <VideoTimeline /> : <Filmstrip />}
        </div>
        {appMode === "video" ? <VideoPropertiesPanel /> : <RightSidebar />}
      </div>

      <ExportHiddenStages />

      {modal === "export" && <ExportModal onClose={() => setModal(null)} />}
      {modal === "video-export" && <VideoExportModal onClose={() => setModal(null)} videoStageRef={videoStageRef} />}
      {modal === "projects" && <ProjectsModal onClose={() => setModal(null)} />}
      {modal === "preview" && <PreviewModal onClose={() => setModal(null)} />}

      <div className={"toast" + (toast ? " show" : "")}>{toast}</div>
    </div>
  );
}
