import React, { useRef } from "react";
import { useApp } from "../state/store.jsx";
import { computeSceneTimings, getActiveSceneState, globalAudioEngine } from "../utils/videoEngine.js";

function formatSeconds(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  const ms = Math.floor((sec % 1) * 10);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${ms}`;
}

export default function VideoTimeline() {
  const {
    project, activeIndex, dispatch,
    videoTime, setVideoTime,
    isPlaying, setIsPlaying,
    videoSoundtrack, setVideoSoundtrack,
    videoFormat, setVideoFormat,
  } = useApp();

  const { totalDuration, sceneStarts, sceneDurations } = computeSceneTimings(project.canvases);
  const activeState = getActiveSceneState(project.canvases, videoTime);

  function togglePlay() {
    setIsPlaying((p) => !p);
  }

  function restart() {
    setVideoTime(0);
    globalAudioEngine.seek(0);
  }

  function handleScrub(e) {
    const val = +e.target.value;
    setVideoTime(val);
    globalAudioEngine.seek(val);
  }

  function updateSceneDuration(sceneIdx, delta) {
    const cur = project.canvases[sceneIdx].videoDuration || 3.0;
    const next = Math.max(1.5, Math.min(10.0, +(cur + delta).toFixed(1)));
    dispatch({
      type: "SET_CANVAS_VIDEO_PROPS",
      patch: { videoDuration: next },
    });
  }

  function cycleTransition(sceneIdx) {
    const types = ["slide", "fade", "zoom"];
    const cur = project.canvases[sceneIdx].videoTransition || "slide";
    const nextIdx = (types.indexOf(cur) + 1) % types.length;
    dispatch({
      type: "SET_CANVAS_VIDEO_PROPS",
      patch: { videoTransition: types[nextIdx] },
    });
  }

  function jumpToScene(idx) {
    const start = sceneStarts[idx] || 0;
    setVideoTime(start);
    globalAudioEngine.seek(start);
    dispatch({ type: "SWITCH_CANVAS", index: idx }, { commit: false });
  }

  return (
    <div id="video-timeline-bar">
      {/* Transport Header */}
      <div className="vt-transport">
        <div className="vt-controls">
          <button
            type="button"
            className={"icon-btn vt-play-btn" + (isPlaying ? " playing" : "")}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
            onClick={togglePlay}
          >
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <polygon points="6 3 20 12 6 21 6 3" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="icon-btn"
            title="Restart video from beginning"
            onClick={restart}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>
          <div className="vt-timecode">
            <span className="vt-time-cur">{formatSeconds(videoTime)}</span>
            <span className="vt-time-sep">/</span>
            <span className="vt-time-tot">{formatSeconds(totalDuration)}</span>
          </div>
        </div>

        {/* Video Format selector */}
        <div className="tb-group">
          <span style={{ fontSize: 11, color: "var(--text-2)", fontWeight: 600 }}>Aspect ratio:</span>
          <div className="seg">
            {[
              { id: "16-9", name: "16:9 Landscape", w: 1920, h: 1080 },
              { id: "9-16", name: "9:16 Portrait", w: 1080, h: 1920 },
              { id: "1-1", name: "1:1 Square", w: 1080, h: 1080 },
            ].map((fmt) => (
              <button
                type="button"
                key={fmt.id}
                className={videoFormat.id === fmt.id ? "active" : ""}
                onClick={() => setVideoFormat(fmt)}
              >
                {fmt.id}
              </button>
            ))}
          </div>
        </div>

        {/* Audio Soundtrack quick controls */}
        <div className="vt-soundtrack-quick">
          <span style={{ fontSize: 12 }}>🎵</span>
          <span style={{ fontSize: 11.5, color: "var(--text-1)", fontWeight: 500 }}>
            {videoSoundtrack.title || "Soundtrack"}
          </span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={videoSoundtrack.volume ?? 0.8}
            style={{ width: 60, accentColor: "var(--accent)" }}
            onChange={(e) => {
              const vol = +e.target.value;
              setVideoSoundtrack((s) => ({ ...s, volume: vol }));
              globalAudioEngine.setVolume(vol);
            }}
            title="Music volume"
          />
        </div>
      </div>

      {/* Scrubber Progress Bar */}
      <div className="vt-scrubber-wrap">
        <input
          type="range"
          min="0"
          max={totalDuration}
          step="0.05"
          value={videoTime}
          onChange={handleScrub}
          className="vt-scrubber"
        />
        {/* Scene break tick markers on scrubber */}
        <div className="vt-ticks" pointerEvents="none">
          {sceneStarts.map((st, i) => (
            <div
              key={i}
              className="vt-tick"
              style={{ left: `${(st / totalDuration) * 100}%` }}
              title={`Scene ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Scene Blocks Sequence Track */}
      <div className="vt-track-scenes">
        {project.canvases.map((c, i) => {
          const isCurrentScene = activeState.sceneIndex === i;
          const dur = c.videoDuration || 3.0;
          const trans = c.videoTransition || "slide";

          return (
            <React.Fragment key={c.id}>
              {/* Scene Block */}
              <div
                className={"vt-scene-card" + (isCurrentScene ? " active" : "")}
                onClick={() => jumpToScene(i)}
              >
                <div className="vt-scene-head">
                  <span className="vt-scene-badge">{i + 1}</span>
                  <span className="vt-scene-name">{c.name}</span>
                </div>
                <div className="vt-scene-timing">
                  <button
                    type="button"
                    className="vt-dur-btn"
                    title="Shorten scene"
                    onClick={(e) => { e.stopPropagation(); updateSceneDuration(i, -0.5); }}
                  >
                    -
                  </button>
                  <span className="vt-dur-label">{dur.toFixed(1)}s</span>
                  <button
                    type="button"
                    className="vt-dur-btn"
                    title="Extend scene"
                    onClick={(e) => { e.stopPropagation(); updateSceneDuration(i, 0.5); }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Transition Pill between scenes */}
              {i < project.canvases.length - 1 && (
                <button
                  type="button"
                  className="vt-transition-pill"
                  title={`Transition: ${trans}. Click to change.`}
                  onClick={() => cycleTransition(i)}
                >
                  <span>{trans === "slide" ? "Slide ➔" : trans === "fade" ? "Fade ➔" : "Zoom ➔"}</span>
                </button>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
