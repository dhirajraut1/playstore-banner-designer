import React, { createContext, useCallback, useContext, useMemo, useReducer, useRef, useState, useEffect } from "react";
import { newProject, newCanvasModel, uid, MAX_SCREENS } from "../constants.js";

/* ============================================================
   Pure helpers for immutable project edits
   ============================================================ */
function findObjectContainer(project, activeIndex, id, shared) {
  if (shared) return project.sharedObjects;
  return project.canvases[activeIndex].objects;
}

function replaceObject(project, activeIndex, id, shared, updater) {
  if (shared) {
    return {
      ...project,
      sharedObjects: project.sharedObjects.map((o) => (o.id === id ? updater(o) : o)),
    };
  }
  const canvases = project.canvases.map((c, i) => {
    if (i !== activeIndex) return c;
    return { ...c, objects: c.objects.map((o) => (o.id === id ? updater(o) : o)) };
  });
  return { ...project, canvases };
}

function removeObject(project, activeIndex, id, shared) {
  if (shared) {
    return { ...project, sharedObjects: project.sharedObjects.filter((o) => o.id !== id) };
  }
  const canvases = project.canvases.map((c, i) =>
    i !== activeIndex ? c : { ...c, objects: c.objects.filter((o) => o.id !== id) }
  );
  return { ...project, canvases };
}

function getObject(project, activeIndex, id, shared) {
  const arr = findObjectContainer(project, activeIndex, id, shared);
  return arr.find((o) => o.id === id) || null;
}

/* ============================================================
   Reducer — operates on { project, activeIndex }
   ============================================================ */
function reducer(state, action) {
  const { project, activeIndex } = state;
  switch (action.type) {
    case "LOAD_PROJECT":
      return { project: action.project, activeIndex: 0 };

    case "NEW_PROJECT":
      return { project: newProject(), activeIndex: 0 };

    case "SET_PROJECT_NAME":
      return { ...state, project: { ...project, name: action.name } };

    case "SWITCH_CANVAS":
      if (action.index < 0 || action.index >= project.canvases.length) return state;
      return { ...state, activeIndex: action.index };

    case "ADD_CANVAS": {
      if (project.canvases.length >= MAX_SCREENS) return state;
      const n = project.canvases.length + 1;
      const preset = action.preset;
      const cm = newCanvasModel("Screen " + n, preset ? preset.w : 1080, preset ? preset.h : 1920);
      return { project: { ...project, canvases: [...project.canvases, cm] }, activeIndex: project.canvases.length };
    }

    case "DUPLICATE_CANVAS": {
      if (project.canvases.length >= MAX_SCREENS) return state;
      const src = project.canvases[action.index];
      const clone = JSON.parse(JSON.stringify(src));
      clone.id = uid("scr");
      clone.name = src.name + " copy";
      clone.objects.forEach((o) => (o.id = uid("obj")));
      const canvases = [...project.canvases];
      canvases.splice(action.index + 1, 0, clone);
      return { project: { ...project, canvases }, activeIndex: action.index + 1 };
    }

    case "DELETE_CANVAS": {
      if (project.canvases.length <= 1) return state;
      const canvases = project.canvases.filter((_, i) => i !== action.index);
      let newActive = activeIndex;
      if (newActive >= canvases.length) newActive = canvases.length - 1;
      return { project: { ...project, canvases }, activeIndex: newActive };
    }

    case "RENAME_CANVAS": {
      const canvases = project.canvases.map((c, i) => (i === action.index ? { ...c, name: action.name } : c));
      return { ...state, project: { ...project, canvases } };
    }

    case "SET_CANVAS_BACKGROUND": {
      if (project.connectBackground) {
        return { ...state, project: { ...project, globalBackground: { ...project.globalBackground, ...action.patch } } };
      }
      const canvases = project.canvases.map((c, i) =>
        i !== activeIndex ? c : { ...c, background: { ...c.background, ...action.patch } }
      );
      return { ...state, project: { ...project, canvases } };
    }

    case "TOGGLE_CONNECT_BACKGROUND": {
      const connectBackground = !project.connectBackground;
      let globalBackground = project.globalBackground;
      if (connectBackground && !globalBackground) {
        globalBackground = { type: "linear", color1: "#0F2027", color2: "#2C5364", angle: 120 };
      }
      return { ...state, project: { ...project, connectBackground, globalBackground } };
    }

    case "ADD_OBJECT": {
      const canvases = project.canvases.map((c, i) => (i !== activeIndex ? c : { ...c, objects: [...c.objects, action.obj] }));
      return { project: { ...project, canvases }, activeIndex };
    }

    case "ADD_SHARED_OBJECT": {
      return { project: { ...project, sharedObjects: [...project.sharedObjects, action.obj] }, activeIndex };
    }

    case "PATCH_OBJECT": {
      const newProj = replaceObject(project, activeIndex, action.id, action.shared, (o) => ({ ...o, ...action.patch }));
      return { ...state, project: newProj };
    }

    case "DELETE_OBJECT": {
      return { ...state, project: removeObject(project, activeIndex, action.id, action.shared) };
    }

    case "DUPLICATE_OBJECT": {
      const obj = getObject(project, activeIndex, action.id, action.shared);
      if (!obj) return state;
      const clone = { ...JSON.parse(JSON.stringify(obj)), id: uid("obj") };
      clone.x = (clone.x || 0) + 30;
      clone.y = (clone.y || 0) + 30;
      if (action.shared) {
        return { ...state, project: { ...project, sharedObjects: [...project.sharedObjects, clone] } };
      }
      const canvases = project.canvases.map((c, i) => (i !== activeIndex ? c : { ...c, objects: [...c.objects, clone] }));
      return { ...state, project: { ...project, canvases } };
    }

    case "REORDER_CANVAS": {
      const { fromIndex, toIndex } = action;
      if (
        fromIndex < 0 ||
        fromIndex >= project.canvases.length ||
        toIndex < 0 ||
        toIndex >= project.canvases.length ||
        fromIndex === toIndex
      ) {
        return state;
      }
      const canvases = [...project.canvases];
      const [moved] = canvases.splice(fromIndex, 1);
      canvases.splice(toIndex, 0, moved);
      let newActive = activeIndex;
      if (activeIndex === fromIndex) {
        newActive = toIndex;
      } else if (fromIndex < activeIndex && toIndex >= activeIndex) {
        newActive -= 1;
      } else if (fromIndex > activeIndex && toIndex <= activeIndex) {
        newActive += 1;
      }
      return { ...state, project: { ...project, canvases }, activeIndex: newActive };
    }

    case "REORDER_OBJECT": {
      const arr = action.shared ? project.sharedObjects : project.canvases[activeIndex].objects;
      const idx = arr.findIndex((o) => o.id === action.id);
      if (idx < 0) return state;
      let newIdx = idx;
      if (action.to === "top") newIdx = arr.length - 1;
      else if (action.to === "bottom") newIdx = 0;
      else if (action.dir !== undefined) newIdx = idx + action.dir;
      if (newIdx < 0 || newIdx >= arr.length || newIdx === idx) return state;
      const copy = [...arr];
      const [item] = copy.splice(idx, 1);
      copy.splice(newIdx, 0, item);
      if (action.shared) return { ...state, project: { ...project, sharedObjects: copy } };
      const canvases = project.canvases.map((c, i) => (i !== activeIndex ? c : { ...c, objects: copy }));
      return { ...state, project: { ...project, canvases } };
    }

    case "TOGGLE_SYNC": {
      // Move object between the active canvas' local objects and the project-wide shared objects.
      if (action.shared) {
        const obj = project.sharedObjects.find((o) => o.id === action.id);
        if (!obj) return state;
        const sharedObjects = project.sharedObjects.filter((o) => o.id !== action.id);
        const canvases = project.canvases.map((c, i) => (i !== activeIndex ? c : { ...c, objects: [...c.objects, obj] }));
        return { ...state, project: { ...project, sharedObjects, canvases } };
      } else {
        const obj = project.canvases[activeIndex].objects.find((o) => o.id === action.id);
        if (!obj) return state;
        const canvases = project.canvases.map((c, i) =>
          i !== activeIndex ? c : { ...c, objects: c.objects.filter((o) => o.id !== action.id) }
        );
        return { ...state, project: { ...project, canvases, sharedObjects: [...project.sharedObjects, obj] } };
      }
    }

    case "SET_CANVAS_OBJECTS": {
      // bulk-replace the active canvas' objects (used by "apply template")
      const canvases = project.canvases.map((c, i) => (i !== activeIndex ? c : { ...c, objects: action.objects, background: action.background || c.background }));
      return { ...state, project: { ...project, canvases } };
    }

    case "APPLY_MULTI_TEMPLATE": {
      const built = action.built;
      if (!built) return state;
      return {
        project: {
          ...project,
          canvases: built.canvases,
          sharedObjects: built.sharedObjects,
          connectBackground: built.connectBackground,
          globalBackground: built.globalBackground,
        },
        activeIndex: 0,
      };
    }

    case "SET_CANVAS_VIDEO_PROPS": {
      const canvases = project.canvases.map((c, i) =>
        i !== activeIndex ? c : { ...c, ...action.patch }
      );
      return { ...state, project: { ...project, canvases } };
    }

    case "COMMIT":
      return { ...state };

    case "NOOP":
      return state;

    default:
      return state;
  }
}

/* ============================================================
   History hook — snapshot-based undo/redo wrapping the reducer
   ============================================================ */
function useHistoryReducer(init) {
  const [state, setState] = useState(init);
  const historyRef = useRef([init]);
  const indexRef = useRef(0);
  const [, forceTick] = useState(0);

  const dispatch = useCallback((action, opts = {}) => {
    setState((prev) => {
      const next = reducer(prev, action);
      if (next === prev) return prev;
      const commit = opts.commit !== false; // default true
      if (commit) {
        const h = historyRef.current.slice(0, indexRef.current + 1);
        h.push(next);
        if (h.length > 100) h.shift();
        historyRef.current = h;
        indexRef.current = h.length - 1;
        forceTick((t) => t + 1);
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return;
    indexRef.current -= 1;
    setState(historyRef.current[indexRef.current]);
    forceTick((t) => t + 1);
  }, []);
  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return;
    indexRef.current += 1;
    setState(historyRef.current[indexRef.current]);
    forceTick((t) => t + 1);
  }, []);

  const canUndo = indexRef.current > 0;
  const canRedo = indexRef.current < historyRef.current.length - 1;

  return [state, dispatch, { undo, redo, canUndo, canRedo }];
}

/* ============================================================
   Context
   ============================================================ */
const AppCtx = createContext(null);
export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}

const LS_KEY = "flowbanner_projects_v2";

export function AppProvider({ children }) {
  const [state, dispatch, history] = useHistoryReducer({ project: newProject(), activeIndex: 0 });
  const { project, activeIndex } = state;

  const [selection, setSelection] = useState(null); // {id, shared} | null
  const [zoom, setZoom] = useState(1);
  const [gridSnap, setGridSnap] = useState(false);
  const [viewMode, setViewMode] = useState("single"); // 'single' | 'panorama'
  const [clipboard, setClipboard] = useState(null);
  const [toast, setToastState] = useState("");
  const [savedText, setSavedText] = useState("Saved locally");

  // Promo Video Studio State
  const [appMode, setAppMode] = useState("designer"); // 'designer' | 'video'
  const [videoTime, setVideoTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoSoundtrack, setVideoSoundtrack] = useState({
    id: "upbeat",
    title: "Upbeat Tech",
    volume: 0.8,
    muted: false,
    customUrl: null,
  });
  const [videoFormat, setVideoFormat] = useState({
    id: "16-9",
    name: "16:9 Landscape",
    w: 1920,
    h: 1080,
  });
  const toastTimer = useRef(null);
  const autosaveTimer = useRef(null);
  const exportRefs = useRef({});

  const showToast = useCallback((msg) => {
    setToastState(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastState(""), 2200);
  }, []);

  const activeCanvas = project.canvases[activeIndex];

  // IMPORTANT: derive "is this shared?" from the data itself (which array actually
  // contains the object right now), never from a stored flag on `selection`. The
  // flag goes stale the instant an object moves between arrays (e.g. via
  // TOGGLE_SYNC), which previously caused the properties panel to lose the
  // selection — and any further edits to silently target the wrong array.
  const selectedIsShared = useMemo(() => {
    if (!selection) return false;
    return project.sharedObjects.some((o) => o.id === selection.id);
  }, [selection, project.sharedObjects]);

  const selectedObject = useMemo(() => {
    if (!selection) return null;
    const arr = selectedIsShared ? project.sharedObjects : activeCanvas.objects;
    return arr.find((o) => o.id === selection.id) || null;
  }, [selection, selectedIsShared, project.sharedObjects, activeCanvas]);

  function select(id, shared) {
    setSelection(id ? { id, shared: !!shared } : null);
  }
  function deselect() {
    setSelection(null);
  }

  // autosave to localStorage whenever project changes (debounced)
  useEffect(() => {
    setSavedText("Saving…");
    clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(() => {
      try {
        const all = JSON.parse(localStorage.getItem(LS_KEY) || "{}");
        all[project.id] = { name: project.name, updated: Date.now(), data: project };
        localStorage.setItem(LS_KEY, JSON.stringify(all));
        setSavedText("Saved locally");
      } catch (e) {
        setSavedText("Autosave failed");
      }
    }, 700);
    return () => clearTimeout(autosaveTimer.current);
  }, [project]);

  function listSavedProjects() {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
    } catch (e) {
      return {};
    }
  }
  function deleteSavedProject(id) {
    const all = listSavedProjects();
    delete all[id];
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  }
  function loadProject(id) {
    const all = listSavedProjects();
    if (all[id]) {
      dispatch({ type: "LOAD_PROJECT", project: all[id].data });
      deselect();
    }
  }
  function startNewProject() {
    dispatch({ type: "NEW_PROJECT" });
    deselect();
  }

  const value = {
    project, activeIndex, activeCanvas,
    dispatch, ...history,
    selection, selectedObject, selectedIsShared, select, deselect,
    zoom, setZoom, gridSnap, setGridSnap,
    viewMode, setViewMode,
    appMode, setAppMode,
    videoTime, setVideoTime,
    isPlaying, setIsPlaying,
    videoSoundtrack, setVideoSoundtrack,
    videoFormat, setVideoFormat,
    clipboard, setClipboard,
    toast, showToast, savedText,
    listSavedProjects, deleteSavedProject, loadProject, startNewProject,
    exportRefs,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
