import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { Stage, Layer, Rect, Group } from "react-konva";
import { useApp } from "../state/store.jsx";
import CanvasObjectNode from "./CanvasObjectNode.jsx";
import {
  getActiveSceneState,
  evaluateObjectAnimation,
  globalAudioEngine,
} from "../utils/videoEngine.js";
import { getCanvasBackgroundConfig, getCanvasRenderObjects } from "../utils/flowLayout.js";

const NOOP = () => {};
const PLAY_HANDLERS = { onSelect: NOOP, onDragMove: NOOP, onDragEnd: NOOP, onTransformEnd: NOOP };

function AnimatedBackground({ cfg, width, height, opacity = 1 }) {
  if (!cfg) return null;
  if (cfg.type === "solid") {
    return <Rect x={0} y={0} width={width} height={height} fill={cfg.color || "#222"} opacity={opacity} listening={false} />;
  }
  const rad = ((cfg.angle || 90) * Math.PI) / 180;
  const len = Math.max(width, height);
  const dx = (Math.cos(rad) * len) / 2, dy = (Math.sin(rad) * len) / 2;
  const startPoint = cfg.startPoint || { x: width / 2 - dx, y: height / 2 - dy };
  const endPoint = cfg.endPoint || { x: width / 2 + dx, y: height / 2 + dy };

  if (cfg.type === "linear") {
    return (
      <Rect
        x={0} y={0} width={width} height={height} opacity={opacity} listening={false}
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
      x={0} y={0} width={width} height={height} opacity={opacity} listening={false}
      fillRadialGradientStartPoint={radStart}
      fillRadialGradientEndPoint={radEnd}
      fillRadialGradientStartRadius={cfg.startRadius || 0}
      fillRadialGradientEndRadius={cfg.endRadius || Math.max(width, height) / 1.3}
      fillRadialGradientColorStops={[0, cfg.color1 || "#0F2027", 1, cfg.color2 || "#2C5364"]}
    />
  );
}

export default function VideoCanvasStage({ containerRef, stageRef: externalStageRef }) {
  const {
    project, activeIndex, dispatch,
    videoTime, setVideoTime,
    isPlaying, setIsPlaying,
    videoSoundtrack, videoFormat,
    select,
  } = useApp();

  const internalStageRef = useRef(null);
  const stageRef = externalStageRef || internalStageRef;
  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(performance.now());
  const [stageSize, setStageSize] = useState({ w: 800, h: 450, scale: 1 });

  // Format dimensions (default 1920x1080 landscape, or 1080x1920 portrait)
  const formatW = videoFormat?.w || 1920;
  const formatH = videoFormat?.h || 1080;

  // Scale stage to fit viewport
  const fit = useCallback(() => {
    const scrollEl = containerRef.current;
    if (!scrollEl) return;
    const availW = scrollEl.clientWidth - 60;
    const availH = scrollEl.clientHeight - 60;
    const scale = Math.min(availW / formatW, availH / formatH, 1);
    setStageSize({ w: formatW * scale, h: formatH * scale, scale });
  }, [formatW, formatH, containerRef]);

  useLayoutEffect(() => {
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [fit]);

  // Audio sync
  useEffect(() => {
    if (isPlaying) {
      globalAudioEngine.startSoundtrack(
        videoSoundtrack.id,
        videoSoundtrack.volume ?? 0.8,
        videoSoundtrack.customUrl
      );
      globalAudioEngine.seek(videoTime);
    } else {
      globalAudioEngine.stopSoundtrack();
    }
    return () => {
      globalAudioEngine.stopSoundtrack();
    };
  }, [isPlaying, videoSoundtrack]);

  // Playback animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (now) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setVideoTime((prevTime) => {
        const activeState = getActiveSceneState(project.canvases, prevTime);
        const nextTime = prevTime + delta;
        if (nextTime >= activeState.totalDuration) {
          // Loop video automatically
          globalAudioEngine.seek(0);
          return 0;
        }
        return nextTime;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, project.canvases, setVideoTime]);

  const activeState = getActiveSceneState(project.canvases, videoTime);
  const currentSceneIndex = activeState.sceneIndex;
  const currentCanvas = project.canvases[currentSceneIndex] || project.canvases[0];
  const nextCanvas = activeState.nextSceneIndex !== null ? project.canvases[activeState.nextSceneIndex] : null;

  // Background configs
  const curBgCfg = getCanvasBackgroundConfig(currentSceneIndex, project);
  const nextBgCfg = activeState.nextSceneIndex !== null ? getCanvasBackgroundConfig(activeState.nextSceneIndex, project) : null;

  // Objects
  const { localObjects: curLocal, overflowObjects: curOverflow, sharedObjects } = getCanvasRenderObjects(currentSceneIndex, project);
  const { localObjects: nextLocal, overflowObjects: nextOverflow } = nextCanvas
    ? getCanvasRenderObjects(activeState.nextSceneIndex, project)
    : { localObjects: [], overflowObjects: [] };

  // Scale factor between canvas base resolution and video output format
  const sceneScaleX = formatW / (currentCanvas.width || 1080);
  const sceneScaleY = formatH / (currentCanvas.height || 1920);
  const uniformSceneScale = Math.min(sceneScaleX, sceneScaleY);
  const centerOffsetX = (formatW - currentCanvas.width * uniformSceneScale) / 2;
  const centerOffsetY = (formatH - currentCanvas.height * uniformSceneScale) / 2;

  // Transition parameters
  const isTransitioning = activeState.isTransitioning && nextCanvas;
  const transProg = activeState.transitionProgress;
  const transType = currentCanvas.videoTransition || "slide";

  let curSceneX = centerOffsetX;
  let curSceneOpacity = 1;
  let nextSceneX = centerOffsetX + formatW;
  let nextSceneOpacity = 0;

  if (isTransitioning) {
    if (transType === "slide") {
      curSceneX = centerOffsetX - transProg * formatW;
      nextSceneX = centerOffsetX + (1 - transProg) * formatW;
      nextSceneOpacity = 1;
    } else if (transType === "fade") {
      curSceneOpacity = 1 - transProg;
      nextSceneX = centerOffsetX;
      nextSceneOpacity = transProg;
    } else if (transType === "zoom") {
      curSceneOpacity = 1 - transProg;
      nextSceneX = centerOffsetX;
      nextSceneOpacity = transProg;
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <Stage
        ref={stageRef}
        width={stageSize.w}
        height={stageSize.h}
        scaleX={stageSize.scale}
        scaleY={stageSize.scale}
        onClick={() => setIsPlaying((p) => !p)}
        style={{ cursor: "pointer" }}
      >
        {/* Backgrounds */}
        <Layer listening={false}>
          <Group x={0} y={0} opacity={curSceneOpacity}>
            <AnimatedBackground cfg={curBgCfg} width={formatW} height={formatH} />
          </Group>
          {isTransitioning && nextBgCfg && (
            <Group x={transType === "slide" ? nextSceneX : 0} y={0} opacity={nextSceneOpacity}>
              <AnimatedBackground cfg={nextBgCfg} width={formatW} height={formatH} />
            </Group>
          )}
        </Layer>

        {/* Current Scene Objects */}
        <Layer listening={false}>
          <Group
            x={curSceneX}
            y={centerOffsetY}
            scaleX={uniformSceneScale}
            scaleY={uniformSceneScale}
            opacity={curSceneOpacity}
          >
            {/* Overflow objects */}
            {curOverflow.map((obj) => {
              const animated = evaluateObjectAnimation(obj, activeState.timeInScene, currentCanvas.videoDuration || 3.0);
              return <CanvasObjectNode key={animated.id} obj={animated} handlers={PLAY_HANDLERS} />;
            })}
            {/* Local objects */}
            {curLocal.map((obj) => {
              const animated = evaluateObjectAnimation(obj, activeState.timeInScene, currentCanvas.videoDuration || 3.0);
              return <CanvasObjectNode key={animated.id} obj={animated} handlers={PLAY_HANDLERS} />;
            })}
            {/* Shared objects */}
            {sharedObjects.map((obj) => {
              const animated = evaluateObjectAnimation(obj, activeState.timeInScene, currentCanvas.videoDuration || 3.0);
              return <CanvasObjectNode key={animated.id} obj={animated} handlers={PLAY_HANDLERS} />;
            })}
          </Group>

          {/* Next Scene Objects (during transition) */}
          {isTransitioning && nextCanvas && (
            <Group
              x={nextSceneX}
              y={centerOffsetY}
              scaleX={uniformSceneScale}
              scaleY={uniformSceneScale}
              opacity={nextSceneOpacity}
            >
              {nextOverflow.map((obj) => {
                const animated = evaluateObjectAnimation(obj, transProg * 0.5, nextCanvas.videoDuration || 3.0);
                return <CanvasObjectNode key={`next_${animated.id}`} obj={animated} handlers={PLAY_HANDLERS} />;
              })}
              {nextLocal.map((obj) => {
                const animated = evaluateObjectAnimation(obj, transProg * 0.5, nextCanvas.videoDuration || 3.0);
                return <CanvasObjectNode key={`next_${animated.id}`} obj={animated} handlers={PLAY_HANDLERS} />;
              })}
            </Group>
          )}
        </Layer>
      </Stage>

      {/* Play/Pause Overlay Indicator when paused */}
      {!isPlaying && (
        <div
          className="video-play-overlay"
          onClick={() => setIsPlaying(true)}
          title="Click to play video"
        >
          <div className="video-play-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
              <polygon points="6 3 20 12 6 21 6 3" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
