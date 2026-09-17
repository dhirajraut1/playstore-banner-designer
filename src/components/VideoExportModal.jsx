import React, { useState, useEffect, useRef } from "react";
import { useApp } from "../state/store.jsx";
import { computeSceneTimings, globalAudioEngine } from "../utils/videoEngine.js";

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export default function VideoExportModal({ onClose, videoStageRef }) {
  const { project, videoSoundtrack, setVideoTime, setIsPlaying, showToast } = useApp();

  const timings = computeSceneTimings(project.canvases);
  const totalDuration = timings.totalDuration || 6.0;

  const [fps, setFps] = useState(30);
  const [format, setFormat] = useState("webm"); // 'webm' | 'mp4'
  const [includeAudio, setIncludeAudio] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recordingStatus, setRecordingStatus] = useState("");
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [downloadName, setDownloadName] = useState("");

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  // Check supported format
  const canMp4 = typeof MediaRecorder !== "undefined" && (
    MediaRecorder.isTypeSupported("video/mp4;codecs=avc1") ||
    MediaRecorder.isTypeSupported("video/mp4")
  );

  async function handleStartExport() {
    if (!videoStageRef.current) {
      showToast("Video stage not ready. Please try again.");
      return;
    }

    const canvasEl = videoStageRef.current.content?.querySelector("canvas");
    if (!canvasEl) {
      showToast("Canvas stream unavailable.");
      return;
    }

    setIsRecording(true);
    setProgress(0);
    setRecordingStatus("Preparing recording stream…");
    setDownloadUrl(null);

    // Stop and reset playback to beginning
    setIsPlaying(false);
    globalAudioEngine.stopSoundtrack();
    setVideoTime(0);

    // Wait a brief moment for canvas to clear and re-render frame 0
    await new Promise((r) => setTimeout(r, 150));

    try {
      const stream = canvasEl.captureStream(fps);

      // Mix Audio Track if soundtrack enabled and Web Audio is ready
      if (includeAudio && videoSoundtrack.id !== "none") {
        globalAudioEngine.init();
        if (globalAudioEngine.ctx && globalAudioEngine.masterGain) {
          const dest = globalAudioEngine.ctx.createMediaStreamDestination();
          globalAudioEngine.masterGain.connect(dest);
          const audioTracks = dest.stream.getAudioTracks();
          if (audioTracks.length > 0) {
            stream.addTrack(audioTracks[0]);
          }
        }
      }

      // Determine mime type
      let mimeType = "video/webm;codecs=vp9";
      if (format === "mp4" && canMp4) {
        mimeType = MediaRecorder.isTypeSupported("video/mp4;codecs=avc1")
          ? "video/mp4;codecs=avc1"
          : "video/mp4";
      } else if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported("video/webm") ? "video/webm" : "";
      }

      const recorder = new MediaRecorder(
        stream,
        mimeType
          ? { mimeType, videoBitsPerSecond: 8_000_000 }
          : { videoBitsPerSecond: 8_000_000 }
      );

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const ext = format === "mp4" && canMp4 ? "mp4" : "webm";
        const finalBlob = new Blob(chunksRef.current, {
          type: mimeType || (ext === "mp4" ? "video/mp4" : "video/webm"),
        });
        const fname = `${(project.name || "app_promo").replace(/\s+/g, "_")}.${ext}`;
        const objectUrl = URL.createObjectURL(finalBlob);

        setDownloadUrl(objectUrl);
        setDownloadName(fname);
        setIsRecording(false);
        setProgress(1);
        setRecordingStatus("Recording complete! Ready to download.");

        // Automatically trigger download
        downloadBlob(finalBlob, fname);
        showToast("Video exported successfully!");
      };

      recorderRef.current = recorder;
      recorder.start(100);

      // Start audio and playback synchronously
      if (includeAudio && videoSoundtrack.id !== "none") {
        globalAudioEngine.startSoundtrack(
          videoSoundtrack.id,
          videoSoundtrack.volume ?? 0.8,
          videoSoundtrack.customUrl
        );
      }
      setIsPlaying(true);

      const startTime = performance.now();
      setRecordingStatus(`Recording ${totalDuration.toFixed(1)}s video at ${fps} FPS…`);

      // Monitor recording progress
      recordingTimerRef.current = setInterval(() => {
        const elapsed = (performance.now() - startTime) / 1000;
        const p = Math.min(1, elapsed / totalDuration);
        setProgress(p);

        if (elapsed >= totalDuration) {
          clearInterval(recordingTimerRef.current);
          setIsPlaying(false);
          globalAudioEngine.stopSoundtrack();
          setVideoTime(0);

          if (recorder.state === "recording") {
            recorder.stop();
          }
        }
      }, 50);
    } catch (err) {
      console.error("Export error:", err);
      setIsRecording(false);
      setIsPlaying(false);
      globalAudioEngine.stopSoundtrack();
      setRecordingStatus("Recording failed: " + err.message);
      showToast("Export error. Please try again.");
    }
  }

  function handleCancelRecording() {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (recorderRef.current && recorderRef.current.state === "recording") {
      recorderRef.current.stop();
    }
    setIsRecording(false);
    setIsPlaying(false);
    globalAudioEngine.stopSoundtrack();
    setVideoTime(0);
    setRecordingStatus("Cancelled");
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    };
  }, [downloadUrl]);

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget && !isRecording) onClose(); }}>
      <div className="modal" style={{ width: 440 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
            <span>🎬</span> Export App Promo Video
          </h3>
          {!isRecording && (
            <button type="button" className="layer-btn" onClick={onClose}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {!isRecording && !downloadUrl && (
          <>
            <div className="field">
              <label>Format</label>
              <div className="seg">
                <button
                  type="button"
                  className={format === "webm" ? "active" : ""}
                  onClick={() => setFormat("webm")}
                >
                  WebM (High Quality VP9)
                </button>
                <button
                  type="button"
                  className={format === "mp4" ? "active" : ""}
                  onClick={() => setFormat("mp4")}
                  title={canMp4 ? "MP4 H.264 Video" : "MP4 encoding requires WebM fallback"}
                >
                  MP4 {canMp4 ? "(Supported)" : "(VP9 Fallback)"}
                </button>
              </div>
            </div>

            <div className="field" style={{ marginTop: 12 }}>
              <label>Frame Rate</label>
              <div className="seg">
                <button
                  type="button"
                  className={fps === 30 ? "active" : ""}
                  onClick={() => setFps(30)}
                >
                  30 FPS (Faster)
                </button>
                <button
                  type="button"
                  className={fps === 60 ? "active" : ""}
                  onClick={() => setFps(60)}
                >
                  60 FPS (Ultra Smooth)
                </button>
              </div>
            </div>

            <div className="field" style={{ marginTop: 12 }}>
              <label>Audio & Music</label>
              <div
                className={"pill-toggle" + (includeAudio ? " on" : "")}
                tabIndex={0}
                role="switch"
                aria-checked={includeAudio}
                onClick={() => setIncludeAudio((v) => !v)}
                onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIncludeAudio((v) => !v); } }}
              >
                <div className="switch" />
                Include Soundtrack ({videoSoundtrack.id === "none" ? "None selected" : videoSoundtrack.id})
              </div>
            </div>

            <div style={{
              background: "var(--bg-3)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              padding: "10px 14px",
              marginTop: 16,
              fontSize: 12,
              color: "var(--text-2)",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Scenes count:</span>
                <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{project.canvases.length} scenes</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Total video duration:</span>
                <span style={{ color: "var(--accent)", fontWeight: 600 }}>{totalDuration.toFixed(1)}s</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Audio generation:</span>
                <span style={{ color: "var(--text-1)" }}>Zero latency Web Audio mix</span>
              </div>
            </div>
          </>
        )}

        {isRecording && (
          <div style={{ padding: "16px 0", textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>🎥</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: "var(--text-1)" }}>
              {recordingStatus}
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 14 }}>
              Rendering high-definition video frame-by-frame…
            </div>

            <div style={{
              width: "100%",
              height: 10,
              background: "var(--bg-3)",
              borderRadius: 5,
              overflow: "hidden",
              border: "1px solid var(--border)",
              marginBottom: 10,
            }}>
              <div style={{
                height: "100%",
                width: `${Math.round(progress * 100)}%`,
                background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
                transition: "width 0.05s linear",
              }} />
            </div>

            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent)" }}>
              {Math.round(progress * 100)}%
            </div>
          </div>
        )}

        {downloadUrl && !isRecording && (
          <div style={{ padding: "12px 0", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>
              Promo Video Ready!
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 16 }}>
              Your file has been downloaded. You can also click below to download it again.
            </div>
            <a
              href={downloadUrl}
              download={downloadName}
              className="btn primary"
              style={{ display: "inline-flex", padding: "8px 20px", textDecoration: "none" }}
            >
              Download {downloadName}
            </a>
          </div>
        )}

        <div className="modal-actions" style={{ marginTop: 18 }}>
          {isRecording ? (
            <button type="button" className="btn" onClick={handleCancelRecording}>
              Cancel Recording
            </button>
          ) : (
            <>
              <button type="button" className="btn" onClick={onClose}>
                {downloadUrl ? "Close" : "Cancel"}
              </button>
              {!downloadUrl && (
                <button type="button" className="btn primary" onClick={handleStartExport}>
                  Start Video Export
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
