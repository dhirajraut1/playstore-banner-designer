import React, { useRef } from "react";
import { useApp } from "../state/store.jsx";
import { labelForType } from "../constants.js";
import { globalAudioEngine } from "../utils/videoEngine.js";

export default function VideoPropertiesPanel() {
  const {
    project, activeIndex, activeCanvas, dispatch,
    selection, selectedObject, selectedIsShared,
    videoSoundtrack, setVideoSoundtrack,
    videoTime, setVideoTime, isPlaying, setIsPlaying,
  } = useApp();

  const audioInputRef = useRef(null);
  const currentScene = project.canvases[activeIndex] || project.canvases[0];

  const patchObject = (patch) => {
    if (!selectedObject) return;
    const curAnim = selectedObject.anim || {};
    dispatch({
      type: "PATCH_OBJECT",
      id: selectedObject.id,
      shared: selectedIsShared,
      patch: { anim: { ...curAnim, ...patch } },
    });
  };

  const patchScene = (patch) => {
    dispatch({
      type: "SET_CANVAS_VIDEO_PROPS",
      patch,
    });
  };

  function handleCustomAudioUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setVideoSoundtrack({
      id: "custom",
      title: file.name.replace(/\.[^/.]+$/, ""),
      volume: 0.8,
      customUrl: url,
    });
    if (isPlaying) {
      globalAudioEngine.startSoundtrack("custom", 0.8, url);
    }
  }

  function selectSoundtrack(trackId, title) {
    setVideoSoundtrack((prev) => ({
      ...prev,
      id: trackId,
      title,
      customUrl: trackId === "custom" ? prev.customUrl : null,
    }));
    if (isPlaying) {
      globalAudioEngine.startSoundtrack(trackId, videoSoundtrack.volume ?? 0.8, trackId === "custom" ? videoSoundtrack.customUrl : null);
    }
  }

  const anim = selectedObject?.anim || {};
  const entrance = anim.entrance || (selectedObject?.type === "device" ? "tilt-in" : "slide-up");
  const delay = anim.delay ?? 0.15;
  const duration = anim.duration ?? 0.65;
  const loop = anim.loop || (selectedObject?.type === "device" ? "float" : "none");

  return (
    <div id="right">
      <div id="props-scroll">
        {selectedObject ? (
          /* Component Animation Inspector */
          <div>
            <div className="mini-label">
              Component Motion · {labelForType(selectedObject.type)}
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <label>Entrance Animation</label>
              <select
                value={entrance}
                onChange={(e) => patchObject({ entrance: e.target.value })}
              >
                <option value="slide-up">Slide Up &amp; Spring (Best for text/cards)</option>
                <option value="slide-down">Slide Down &amp; Fade</option>
                <option value="pop">Spring Pop / Overshoot (Best for badges/icons)</option>
                <option value="tilt-in">3D Perspective Tilt-In (Best for phones)</option>
                <option value="zoom-in">Zoom In Reveal</option>
                <option value="fade">Smooth Dissolve Fade</option>
                <option value="none">None (Static)</option>
              </select>
            </div>

            <div className="field-row" style={{ marginTop: 8 }}>
              <div className="field">
                <label>Delay (start)</label>
                <div className="range-row">
                  <input
                    type="range"
                    min="0"
                    max="2.0"
                    step="0.05"
                    value={delay}
                    onChange={(e) => patchObject({ delay: +e.target.value })}
                  />
                  <span className="range-val">{delay.toFixed(2)}s</span>
                </div>
              </div>
              <div className="field">
                <label>Duration</label>
                <div className="range-row">
                  <input
                    type="range"
                    min="0.2"
                    max="1.5"
                    step="0.05"
                    value={duration}
                    onChange={(e) => patchObject({ duration: +e.target.value })}
                  />
                  <span className="range-val">{duration.toFixed(2)}s</span>
                </div>
              </div>
            </div>

            <div className="divider" />
            <div className="mini-label">Continuous Ambient Motion</div>
            <div className="field">
              <label>Loop Behavior</label>
              <select
                value={loop}
                onChange={(e) => patchObject({ loop: e.target.value })}
              >
                <option value="float">Gentle 3D Float / Levitation (Best for phones)</option>
                <option value="pulse">Rhythmic Subtle Pulse</option>
                <option value="none">None (Hold position)</option>
              </select>
            </div>
            <div style={{ fontSize: 10.5, color: "var(--text-2)", lineHeight: 1.5, marginTop: 4 }}>
              Ambient motion starts smoothly after the entrance animation settles.
            </div>
          </div>
        ) : (
          /* Scene Timing & Transitions */
          <div>
            <div className="mini-label">
              Scene Timing · Scene {activeIndex + 1} ({currentScene.name})
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <label>Scene Duration</label>
              <div className="range-row">
                <input
                  type="range"
                  min="1.5"
                  max="8.0"
                  step="0.5"
                  value={currentScene.videoDuration || 3.0}
                  onChange={(e) => patchScene({ videoDuration: +e.target.value })}
                />
                <span className="range-val">{(currentScene.videoDuration || 3.0).toFixed(1)}s</span>
              </div>
            </div>

            <div className="field" style={{ marginTop: 8 }}>
              <label>Transition to next scene</label>
              <select
                value={currentScene.videoTransition || "slide"}
                onChange={(e) => patchScene({ videoTransition: e.target.value })}
              >
                <option value="slide">Slide Left (Continuous app flow)</option>
                <option value="fade">Smooth Dissolve Fade</option>
                <option value="zoom">Zoom &amp; Push</option>
              </select>
            </div>
          </div>
        )}

        <div className="divider" />

        {/* Music & Sound Section */}
        <div className="mini-label">Soundtrack &amp; Music</div>
        <div className="field" style={{ marginTop: 6 }}>
          <label>Background Track</label>
          <select
            value={videoSoundtrack.id}
            onChange={(e) => {
              const val = e.target.value;
              const names = {
                upbeat: "Upbeat Tech",
                chill: "Lo-Fi Modern",
                pulse: "Energetic Pulse",
                none: "No Audio",
                custom: "Custom Upload",
              };
              selectSoundtrack(val, names[val] || val);
            }}
          >
            <option value="upbeat">Upbeat Tech (Fintech / SaaS promo)</option>
            <option value="chill">Lo-Fi Modern (Chill app showcase)</option>
            <option value="pulse">Energetic Pulse (Fitness / Fast tempo)</option>
            <option value="none">No Audio (Silent)</option>
            {videoSoundtrack.customUrl && <option value="custom">Custom Audio ({videoSoundtrack.title})</option>}
          </select>
        </div>

        <input
          ref={audioInputRef}
          type="file"
          accept="audio/*"
          style={{ display: "none" }}
          onChange={handleCustomAudioUpload}
        />
        <button
          type="button"
          className="btn"
          style={{ width: "100%", justifyContent: "center", marginTop: 8, fontSize: 11.5 }}
          onClick={() => audioInputRef.current?.click()}
        >
          📁 Upload MP3 / WAV
        </button>

        <div className="field" style={{ marginTop: 10 }}>
          <label>Volume</label>
          <div className="range-row">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={videoSoundtrack.volume ?? 0.8}
              onChange={(e) => {
                const vol = +e.target.value;
                setVideoSoundtrack((s) => ({ ...s, volume: vol }));
                globalAudioEngine.setVolume(vol);
              }}
            />
            <span className="range-val">{Math.round((videoSoundtrack.volume ?? 0.8) * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
