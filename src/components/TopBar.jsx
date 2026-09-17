import React from "react";
import { useApp } from "../state/store.jsx";

export default function TopBar({ onOpenProjects, onOpenPreview, onOpenExport, onOpenVideoExport }) {
  const {
    project, dispatch, undo, redo, canUndo, canRedo, savedText,
    appMode, setAppMode, setIsPlaying,
  } = useApp();

  function switchMode(mode) {
    if (mode !== appMode) {
      if (appMode === "video") setIsPlaying(false);
      setAppMode(mode);
    }
  }

  return (
    <div id="topbar">
      <div className="brand">
        <div className="brand-mark">F</div>
        <div className="brand-name">Flowbanner</div>
      </div>
      <input
        id="project-name"
        value={project.name}
        spellCheck={false}
        onChange={(e) => dispatch({ type: "SET_PROJECT_NAME", name: e.target.value }, { commit: false })}
        onBlur={(e) => dispatch({ type: "SET_PROJECT_NAME", name: e.target.value })}
      />
      <div className="topbar-sep" />
      <div className="tb-group">
        <button className="icon-btn" title="Undo (Ctrl+Z)" disabled={!canUndo} onClick={undo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 10h10a5 5 0 0 1 0 10H8" /><path d="M8 5 3 10l5 5" /></svg>
        </button>
        <button className="icon-btn" title="Redo (Ctrl+Shift+Z)" disabled={!canRedo} onClick={redo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10H11a5 5 0 0 0 0 10h5" /><path d="M16 5l5 5-5 5" /></svg>
        </button>
      </div>
      <div className="topbar-sep" />
      <div className="save-indicator"><span className="save-dot" /><span>{savedText}</span></div>

      {/* Mode Switcher Pill */}
      <div className="mode-switcher-bar">
        <button
          type="button"
          className={`mode-btn ${appMode === "designer" ? "active" : ""}`}
          onClick={() => switchMode("designer")}
          title="Static Play Store listing graphic designer"
        >
          <span>🎨</span> Listing Graphics
        </button>
        <button
          type="button"
          className={`mode-btn ${appMode === "video" ? "active" : ""}`}
          onClick={() => switchMode("video")}
          title="Animated infographics & app promo video creator"
        >
          <span>🎬</span> Promo Video
        </button>
      </div>

      <div className="spacer" />
      <button className="btn" onClick={onOpenProjects}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></svg>
        Projects
      </button>
      <button className="btn" onClick={onOpenPreview}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z" /><circle cx="12" cy="12" r="3" /></svg>
        Preview
      </button>
      {appMode === "video" ? (
        <button className="btn primary video-export-btn" onClick={onOpenVideoExport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          Export Video
        </button>
      ) : (
        <button className="btn primary" onClick={onOpenExport}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3v12" /><path d="m7 10 5 5 5-5" /><path d="M5 21h14" /></svg>
          Export
        </button>
      )}
    </div>
  );
}
