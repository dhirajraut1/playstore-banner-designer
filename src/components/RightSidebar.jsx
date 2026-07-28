import React from "react";
import { useApp } from "../state/store.jsx";
import { labelForType } from "../constants.js";

function IconSvg({ path, size = 13 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d={path} />
    </svg>
  );
}

function toHex(c) {
  if (!c) return "#000000";
  return /^#[0-9a-fA-F]{6}$/.test(c) ? c : "#000000";
}

export default function RightSidebar() {
  return (
    <div id="right">
      <div id="props-scroll">
        <PropertiesPanel />
      </div>
      <LayersPanel />
    </div>
  );
}

function PropertiesPanel() {
  const { selection, selectedObject, selectedIsShared, dispatch, project, activeCanvas } = useApp();

  if (!selectedObject) {
    return <BackgroundEditor />;
  }

  const obj = selectedObject;
  const shared = selectedIsShared;
  const patch = (p, commit = true) => dispatch({ type: "PATCH_OBJECT", id: obj.id, shared, patch: p }, { commit });
  const commitNoop = () => dispatch({ type: "NOOP" });

  const showFill = ["rect", "circle", "line", "triangle", "blob", "wave", "icon", "device", "text"].includes(obj.type);
  const showStroke = ["rect", "circle", "triangle"].includes(obj.type);

  return (
    <div>
      <div className="mini-label">{labelForType(obj.type)}{shared ? " · synced" : ""}</div>

      <div className="field-row">
        <div className="field">
          <label>X</label>
          <input type="number" value={Math.round(obj.x)} onChange={(e) => patch({ x: +e.target.value }, false)} onBlur={commitNoop} />
        </div>
        <div className="field">
          <label>Y</label>
          <input type="number" value={Math.round(obj.y)} onChange={(e) => patch({ y: +e.target.value }, false)} onBlur={commitNoop} />
        </div>
      </div>

      {obj.type !== "icon" && (
        <div className="field-row">
          <div className="field">
            <label>Width</label>
            <input type="number" value={Math.round(obj.width)} onChange={(e) => patch({ width: +e.target.value }, false)} onBlur={commitNoop} />
          </div>
          <div className="field">
            <label>Height</label>
            <input type="number" value={Math.round(obj.height)} onChange={(e) => patch({ height: +e.target.value }, false)} onBlur={commitNoop} />
          </div>
        </div>
      )}

      <div className="field-row">
        <div className="field">
          <label>Rotation</label>
          <input type="number" value={Math.round(obj.rotation || 0)} onChange={(e) => patch({ rotation: +e.target.value }, false)} onBlur={commitNoop} />
        </div>
        <div className="field">
          <label>Opacity</label>
          <div className="range-row">
            <input type="range" min="0" max="100" value={Math.round((obj.opacity ?? 1) * 100)} onChange={(e) => patch({ opacity: +e.target.value / 100 }, false)} onMouseUp={commitNoop} onTouchEnd={commitNoop} />
            <span className="range-val">{Math.round((obj.opacity ?? 1) * 100)}%</span>
          </div>
        </div>
      </div>

      <div className="mini-label" style={{ marginTop: 2 }}>Tilt (3D perspective)</div>
      <div className="field-row">
        <div className="field">
          <label>Tilt X</label>
          <div className="range-row">
            <input type="range" min="-45" max="45" value={Math.round(obj.tiltX || 0)} onChange={(e) => patch({ tiltX: +e.target.value }, false)} onMouseUp={commitNoop} onTouchEnd={commitNoop} />
            <span className="range-val">{Math.round(obj.tiltX || 0)}°</span>
          </div>
        </div>
        <div className="field">
          <label>Tilt Y</label>
          <div className="range-row">
            <input type="range" min="-45" max="45" value={Math.round(obj.tiltY || 0)} onChange={(e) => patch({ tiltY: +e.target.value }, false)} onMouseUp={commitNoop} onTouchEnd={commitNoop} />
            <span className="range-val">{Math.round(obj.tiltY || 0)}°</span>
          </div>
        </div>
      </div>
      <div className="grid-3" style={{ marginBottom: 10 }}>
        <button className="asset-btn" style={{ padding: "7px 4px" }} onClick={() => patch({ tiltX: -12, tiltY: 16 })}><span style={{ fontSize: 10 }}>Tilt left</span></button>
        <button className="asset-btn" style={{ padding: "7px 4px" }} onClick={() => patch({ tiltX: 0, tiltY: 0 })}><span style={{ fontSize: 10 }}>Flat</span></button>
        <button className="asset-btn" style={{ padding: "7px 4px" }} onClick={() => patch({ tiltX: 12, tiltY: -16 })}><span style={{ fontSize: 10 }}>Tilt right</span></button>
      </div>

      {showFill && (
        <>
          <div className="divider" />
          <div className="mini-label">Fill</div>
          <div className="color-field">
            <input type="color" value={toHex(obj.fill)} onChange={(e) => patch({ fill: e.target.value }, false)} onBlur={commitNoop} />
            <input type="text" value={obj.fill || ""} readOnly />
          </div>
        </>
      )}

      {showStroke && (
        <div className="field-row" style={{ marginTop: 9 }}>
          <div className="field">
            <label>Stroke</label>
            <input type="color" value={toHex(obj.stroke || "#000000")} onChange={(e) => patch({ stroke: e.target.value }, false)} onBlur={commitNoop} />
          </div>
          <div className="field">
            <label>Stroke width</label>
            <input type="number" value={obj.strokeWidth || 0} onChange={(e) => patch({ strokeWidth: +e.target.value }, false)} onBlur={commitNoop} />
          </div>
        </div>
      )}

      {obj.type === "rect" && (
        <div className="field">
          <label>Corner radius</label>
          <div className="range-row">
            <input type="range" min="0" max={Math.round(Math.min(obj.width, obj.height) / 2)} value={obj.cornerRadius || 0} onChange={(e) => patch({ cornerRadius: +e.target.value }, false)} onMouseUp={commitNoop} onTouchEnd={commitNoop} />
            <span className="range-val">{obj.cornerRadius || 0}</span>
          </div>
        </div>
      )}

      {obj.type === "device" && (
        <div className="field">
          <label>Frame color</label>
          <input type="color" value={toHex(obj.frameColor || "#0B1220")} onChange={(e) => patch({ frameColor: e.target.value }, false)} onBlur={commitNoop} />
        </div>
      )}

      {obj.type === "text" && (
        <>
          <div className="divider" />
          <div className="mini-label">Typography</div>
          <div className="field">
            <label>Content</label>
            <textarea rows={2} value={obj.text} onChange={(e) => patch({ text: e.target.value }, false)} onBlur={commitNoop} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Font</label>
              <select value={obj.fontFamily} onChange={(e) => patch({ fontFamily: e.target.value })}>
                <option>Inter</option>
                <option>Space Grotesk</option>
                <option>IBM Plex Mono</option>
                <option>Georgia</option>
                <option>Arial</option>
              </select>
            </div>
            <div className="field">
              <label>Size</label>
              <input type="number" value={obj.fontSize} onChange={(e) => patch({ fontSize: +e.target.value }, false)} onBlur={commitNoop} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Weight</label>
              <select value={obj.fontWeight} onChange={(e) => patch({ fontWeight: +e.target.value })}>
                <option value={400}>Regular</option>
                <option value={500}>Medium</option>
                <option value={700}>Bold</option>
              </select>
            </div>
            <div className="field">
              <label>Align</label>
              <div className="seg">
                {["left", "center", "right"].map((a) => (
                  <button key={a} className={obj.align === a ? "active" : ""} onClick={() => patch({ align: a })}>
                    {a[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Letter spacing</label>
              <input type="number" value={obj.letterSpacing || 0} onChange={(e) => patch({ letterSpacing: +e.target.value }, false)} onBlur={commitNoop} />
            </div>
            <div className="field">
              <label>Line height</label>
              <input type="number" step="0.05" value={obj.lineHeight || 1.15} onChange={(e) => patch({ lineHeight: +e.target.value }, false)} onBlur={commitNoop} />
            </div>
          </div>
          <div className="toggle-row" style={{ marginTop: 10 }}>
            <label>Stroke outline</label>
            <div className={"chk-switch" + (obj.strokeOn ? " on" : "")} onClick={() => patch({ strokeOn: !obj.strokeOn, stroke: obj.stroke || "#000000" })} />
          </div>
          {obj.strokeOn && (
            <div className="field-row">
              <div className="field">
                <label>Stroke color</label>
                <input type="color" value={toHex(obj.stroke || "#000000")} onChange={(e) => patch({ stroke: e.target.value }, false)} onBlur={commitNoop} />
              </div>
              <div className="field">
                <label>Stroke width</label>
                <input type="number" value={obj.strokeWidth || 2} onChange={(e) => patch({ strokeWidth: +e.target.value }, false)} onBlur={commitNoop} />
              </div>
            </div>
          )}
        </>
      )}

      <div className="divider" />
      <div className="toggle-row">
        <label>Shadow</label>
        <div
          className={"chk-switch" + (obj.shadow && obj.shadow.on ? " on" : "")}
          onClick={() => patch({ shadow: { color: "#000000", blur: 16, x: 0, y: 8, opacity: 0.4, ...obj.shadow, on: !(obj.shadow && obj.shadow.on) } })}
        />
      </div>
      {obj.shadow && obj.shadow.on && (
        <>
          <div className="field-row">
            <div className="field">
              <label>Blur</label>
              <input type="number" value={obj.shadow.blur} onChange={(e) => patch({ shadow: { ...obj.shadow, blur: +e.target.value } }, false)} onBlur={commitNoop} />
            </div>
            <div className="field">
              <label>Opacity</label>
              <input type="number" step="0.1" min="0" max="1" value={obj.shadow.opacity} onChange={(e) => patch({ shadow: { ...obj.shadow, opacity: +e.target.value } }, false)} onBlur={commitNoop} />
            </div>
          </div>
          <div className="field-row">
            <div className="field">
              <label>Offset X</label>
              <input type="number" value={obj.shadow.x} onChange={(e) => patch({ shadow: { ...obj.shadow, x: +e.target.value } }, false)} onBlur={commitNoop} />
            </div>
            <div className="field">
              <label>Offset Y</label>
              <input type="number" value={obj.shadow.y} onChange={(e) => patch({ shadow: { ...obj.shadow, y: +e.target.value } }, false)} onBlur={commitNoop} />
            </div>
          </div>
        </>
      )}

      <div className="divider" />
      <div className="toggle-row">
        <label>Sync across screens</label>
        <div className={"chk-switch" + (shared ? " on" : "")} onClick={() => dispatch({ type: "TOGGLE_SYNC", id: obj.id, shared })} />
      </div>
      <div style={{ fontSize: 10.5, color: "var(--text-2)", lineHeight: 1.5, marginTop: -4 }}>
        A synced element appears at the same spot on every screen and edits everywhere at once — great for a shared logo, decoration, or background flourish.
      </div>
    </div>
  );
}

function BackgroundEditor() {
  const { project, activeCanvas } = useApp();
  const cfg = project.connectBackground ? project.globalBackground : activeCanvas.background;
  return (
    <div>
      <div className="mini-label">{project.connectBackground ? "Connected background (both screens)" : "Screen background"}</div>
      <div style={{ fontSize: 12, color: "var(--text-1)", lineHeight: 1.6, marginTop: 8 }}>
        Select an object to edit its properties, or use the <strong>Backgrounds</strong> tab on the left to edit this screen's fill.
      </div>
      <div style={{ height: 44, borderRadius: 8, marginTop: 12, background: cfg.type === "solid" ? cfg.color : `linear-gradient(${cfg.angle || 120}deg, ${cfg.color1}, ${cfg.color2})` }} />
      <div style={{ fontSize: 11, color: "var(--text-2)", marginTop: 12, lineHeight: 1.6 }}>
        {project.connectBackground
          ? "This gradient flows continuously across both connected screens."
          : "Turn on “Connect flow” in the filmstrip to make backgrounds flow continuously across both screens."}
      </div>
    </div>
  );
}

function layerTypeIcon(t) {
  const map = {
    rect: "M3 3h18v18H3z", circle: "M12 21a9 9 0 100-18 9 9 0 000 18Z", line: "M3 12h18",
    triangle: "M12 3l9 18H3z", blob: "M12 3a9 6 0 019 6 9 6 0 01-9 6 9 6 0 01-9-6 9 6 0 019-6Z",
    wave: "M2 12c3-6 6 6 10 0s6 6 10 0", icon: "M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.3l7.1-.7L12 2z",
    text: "M4 6h16M12 6v14M8 20h8", image: "M4 4h16v16H4zM8 12l3 3 5-6 4 5", device: "M7 2h10v20H7z",
  };
  return <IconSvg path={map[t] || map.rect} />;
}

function LayersPanel() {
  const { activeCanvas, project, selection, select, dispatch } = useApp();
  const combined = [
    ...activeCanvas.objects.map((o) => ({ obj: o, shared: false })),
    ...project.sharedObjects.map((o) => ({ obj: o, shared: true })),
  ];

  return (
    <>
      <div id="layers-head">
        <div className="panel-head">Layers</div>
      </div>
      <div id="layers-scroll">
        {combined.length === 0 && (
          <div style={{ padding: "16px 10px", color: "var(--text-2)", fontSize: 11.5, textAlign: "center" }}>No layers yet on this screen.</div>
        )}
        {[...combined].reverse().map(({ obj, shared }) => (
          <div
            key={obj.id}
            className={"layer-row" + (selection && selection.id === obj.id ? " selected" : "")}
            onClick={() => select(obj.id, shared)}
          >
            <span className="layer-icon">{layerTypeIcon(obj.type)}</span>
            <span className="layer-name">{labelForType(obj.type)}{shared ? " ⇄" : ""}</span>
            <button
              className={"layer-btn" + (obj.locked ? " active-state" : "")}
              title="Lock"
              onClick={(e) => { e.stopPropagation(); dispatch({ type: "PATCH_OBJECT", id: obj.id, shared, patch: { locked: !obj.locked } }); }}
            >
              <IconSvg path={obj.locked ? "M6 10V7a6 6 0 1112 0v3M5 10h14v10H5z" : "M6 10V7a6 6 0 1112 0M5 10h14v10H5z"} />
            </button>
            <button
              className={"layer-btn" + (obj.hidden ? " active-state" : "")}
              title="Show/Hide"
              onClick={(e) => { e.stopPropagation(); dispatch({ type: "PATCH_OBJECT", id: obj.id, shared, patch: { hidden: !obj.hidden } }); }}
            >
              <IconSvg path={obj.hidden ? "M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8" : "M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"} />
            </button>
            <button className="layer-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); dispatch({ type: "DUPLICATE_OBJECT", id: obj.id, shared }); }}>
              <IconSvg path="M8 8h11v11H8zM4 4h11v4H8v7H4z" />
            </button>
            <button className="layer-btn" title="Delete" onClick={(e) => { e.stopPropagation(); dispatch({ type: "DELETE_OBJECT", id: obj.id, shared }); if (selection && selection.id === obj.id) select(null); }}>
              <IconSvg path="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
