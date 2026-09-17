import React, { useState } from "react";
import { useApp } from "../state/store.jsx";
import { baseObject, uid, ICONS, SOLID_PALETTE, GRADIENT_PRESETS, TEMPLATES, MAX_SCREENS } from "../constants.js";
import { MULTI_TEMPLATES, buildMultiTemplateProject } from "../multiTemplates.js";
import { VIDEO_TEMPLATES, buildVideoTemplateProject } from "../videoTemplates.js";

function IconSvg({ path, size = 20 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d={path} />
    </svg>
  );
}

const BASIC_SHAPES = [
  ["rect", "Square", "M4 4h16v16H4z"],
  ["rrect", "Rounded", "M4 8a4 4 0 014-4h8a4 4 0 014 4v8a4 4 0 01-4 4H8a4 4 0 01-4-4z"],
  ["circle", "Circle", "M12 21a9 9 0 100-18 9 9 0 000 18Z"],
  ["star5", "Star", "M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.3l7.1-.7L12 2z"],
  ["hexagon", "Hexagon", "M12 2l8 4.5v9L12 20l-8-4.5v-9z"],
  ["speech", "Bubble", "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"],
  ["triangle", "Triangle", "M12 3l9 18H3z"],
  ["line", "Line", "M3 12h18"],
];
const ABSTRACT_SHAPES = [
  ["blob", "Blob", "M12 3a9 6 0 019 6 9 6 0 01-9 6 9 6 0 01-9-6 9 6 0 019-6Z"],
  ["wave", "Wave", "M2 12c3-6 6 6 10 0s6 6 10 0"],
];

export default function LeftSidebar() {
  const [tab, setTab] = useState("shapes");
  const [templateFilter, setTemplateFilter] = useState("multi"); // 'multi' | 'video' | 'single'
  const {
    project, activeCanvas, dispatch, select, deselect, selection, selectedObject, selectedIsShared, showToast,
    appMode, setAppMode, setVideoSoundtrack, setIsPlaying, setVideoTime,
  } = useApp();
  const [uploads, setUploads] = useState([]);
  const [confirmMulti, setConfirmMulti] = useState(null); // multi-template pending confirmation
  const [confirmVideo, setConfirmVideo] = useState(null); // video-template pending confirmation

  function addObject(partial) {
    const obj = baseObject(partial, activeCanvas);
    dispatch({ type: "ADD_OBJECT", obj });
    select(obj.id, false);
  }

  function addShapeAsset(kind) {
    const cx = activeCanvas.width / 2, cy = activeCanvas.height / 2;
    const map = {
      rect: { type: "rect", x: cx - 90, y: cy - 90, width: 180, height: 180, fill: "#29D398" },
      rrect: { type: "rect", x: cx - 90, y: cy - 90, width: 180, height: 180, cornerRadius: 28, fill: "#1A8FBF" },
      circle: { type: "circle", x: cx - 90, y: cy - 90, width: 180, height: 180, fill: "#7C5CFF" },
      star5: { type: "star5", x: cx - 80, y: cy - 80, width: 160, height: 160, fill: "#F5A623" },
      hexagon: { type: "hexagon", x: cx - 80, y: cy - 80, width: 160, height: 160, fill: "#7C5CFF" },
      speech: { type: "speech", x: cx - 120, y: cy - 70, width: 240, height: 140, fill: "#29D398" },
      line: { type: "line", x: cx - 100, y: cy, width: 200, height: 6, fill: "#F5A623", strokeWidth: 8 },
      triangle: { type: "triangle", x: cx - 90, y: cy - 90, width: 180, height: 180, fill: "#FF6161" },
      blob: { type: "blob", x: cx - 100, y: cy - 100, width: 200, height: 200, fill: "#29D398", opacity: 0.9 },
      wave: { type: "wave", x: cx - 160, y: cy - 40, width: 320, height: 80, fill: "#1A8FBF" },
    };
    addObject(map[kind] || map.rect);
  }

  function addRatingCard(cfg = {}) {
    const c = activeCanvas;
    const w = 340, h = 100;
    addObject({
      type: "rating",
      x: (c.width - w) / 2,
      y: c.height * 0.16,
      width: w,
      height: h,
      score: cfg.score || "4.9",
      countText: cfg.countText || "120K+ Reviews",
      categoryText: cfg.categoryText || "#1 In Productivity",
      starColor: cfg.starColor || "#F5A623",
      fill: cfg.fill || "#141722",
      textColor: "#ffffff",
      stroke: "rgba(255,255,255,0.18)",
      shadow: { on: true, color: "#000000", blur: 24, x: 0, y: 10, opacity: 0.35 },
    });
    showToast("Added Rating Card");
  }

  function addFeatureCard(cfg = {}) {
    const c = activeCanvas;
    const w = 380, h = 135;
    addObject({
      type: "card",
      x: (c.width - w) / 2,
      y: c.height * 0.22,
      width: w,
      height: h,
      title: cfg.title || "Instant Cloud Backup",
      subtitle: cfg.subtitle || "Keep your data safely backed up & synced everywhere.",
      icon: cfg.icon || "bolt",
      iconColor: cfg.iconColor || "#29D398",
      iconBg: cfg.iconBg || "rgba(41,211,152,0.16)",
      badgeText: cfg.badgeText || "NEW",
      fill: cfg.fill || "#161822",
      textColor: "#ffffff",
      stroke: "rgba(255,255,255,0.14)",
      shadow: { on: true, color: "#000000", blur: 28, x: 0, y: 12, opacity: 0.35 },
    });
    showToast("Added Feature Card");
  }

  function addBadgePill(cfg = {}) {
    const c = activeCanvas;
    const w = cfg.width || 280, h = 54;
    addObject({
      type: "badge",
      x: (c.width - w) / 2,
      y: c.height * 0.12,
      width: w,
      height: h,
      text: cfg.text || "★ 4.9 (100K+ Reviews)",
      icon: cfg.icon || "star",
      iconColor: cfg.iconColor || "#F5A623",
      fill: cfg.fill || "rgba(255,255,255,0.12)",
      stroke: cfg.stroke || "rgba(255,255,255,0.22)",
      textColor: cfg.textColor || "#ffffff",
      shadow: { on: false },
    });
    showToast("Added Badge Pill");
  }

  function addStoreBadge(platform = "play") {
    const c = activeCanvas;
    const w = 220, h = 64;
    addObject({
      type: "store_badge",
      platform,
      x: (c.width - w) / 2,
      y: c.height * 0.82,
      width: w,
      height: h,
    });
    showToast(platform === "play" ? "Added Google Play Badge" : "Added App Store Badge");
  }
  function addIconAsset(name) {
    addObject({ type: "icon", icon: name, x: activeCanvas.width / 2 - 40, y: activeCanvas.height / 2 - 40, width: 80, height: 80, fill: "#ffffff" });
  }
  function addTextAsset(kind) {
    const c = activeCanvas;
    if (kind === "heading") {
      addObject({
        type: "text", text: "Your headline here", x: c.width * 0.12, y: c.height * 0.14, width: c.width * 0.76, height: 160,
        fontFamily: "Space Grotesk", fontSize: Math.round(c.width * 0.09), fontWeight: 700, fill: "#ffffff", align: "left", lineHeight: 1.05,
      });
    } else {
      addObject({
        type: "text", text: "Supporting line of body copy that explains the feature.", x: c.width * 0.12, y: c.height * 0.26, width: c.width * 0.76, height: 120,
        fontFamily: "Inter", fontSize: Math.round(c.width * 0.035), fontWeight: 400, fill: "#e6e9ee", align: "left", lineHeight: 1.35,
      });
    }
  }
  function addDeviceAsset(style) {
    const c = activeCanvas;
    const w = style.startsWith("tablet") ? c.width * 0.72 : c.width * 0.56;
    const h = style.startsWith("tablet") ? w * 1.33 : w * 2.05;
    addObject({
      type: "device", style, width: w, height: h, x: (c.width - w) / 2, y: (c.height - h) * 0.55,
      fill: "#0B1220", frameColor: "#0B1220", shadow: { on: true, color: "#000000", blur: 40, x: 0, y: 24, opacity: 0.45 },
    });
  }
  function handleFiles(files) {
    [...files].forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploads((prev) => [...prev, { id: uid("up"), dataUrl: e.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });
  }
  function addImageToCanvas(rec) {
    const c = activeCanvas;
    if (selectedObject && selectedObject.type === "device" && !selectedObject.imageSrc) {
      dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { imageSrc: rec.dataUrl } });
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      const maxW = c.width * 0.6;
      const scale = Math.min(1, maxW / img.width);
      const w = img.width * scale, h = img.height * scale;
      addObject({ type: "image", x: (c.width - w) / 2, y: (c.height - h) / 2, width: w, height: h, imageSrc: rec.dataUrl });
    };
    img.src = rec.dataUrl;
  }

  function applyTemplate(t) {
    const c = activeCanvas;
    const background = { type: "linear", color1: t.bg.c1, color2: t.bg.c2, angle: 120 };
    let objects = [];

    if (t.special === "tilted-wallet") {
      objects.push(baseObject({ type: "blob", x: c.width * 0.62, y: -c.height * 0.03, width: c.width * 0.5, height: c.width * 0.5, rotation: 20, opacity: 0.1, fill: "#ffffff" }, c));
      objects.push(baseObject({ type: "blob", x: c.width * 0.78, y: c.height * 0.02, width: c.width * 0.28, height: c.width * 0.28, rotation: -10, opacity: 0.14, fill: "#ffffff" }, c));
      objects.push(baseObject({ type: "text", text: t.headline, x: c.width * 0.09, y: c.height * 0.06, width: c.width * 0.8, height: 120, fill: t.accent, fontFamily: "Space Grotesk", fontSize: Math.round(c.width * 0.13), fontWeight: 700, align: "left", lineHeight: 1 }, c));
      objects.push(baseObject({ type: "text", text: t.subtext || "", x: c.width * 0.09, y: c.height * 0.155, width: c.width * 0.72, height: 160, opacity: 0.92, fill: "#eafff2", fontFamily: "Inter", fontSize: Math.round(c.width * 0.042), fontWeight: 500, align: "left", lineHeight: 1.35 }, c));
      const dw = c.width * 0.62, dh = dw * 2.02;
      objects.push(baseObject({ type: "device", style: "phone-notch", width: dw, height: dh, x: c.width * 0.14, y: c.height * 0.42, rotation: -9, tiltX: -10, tiltY: 16, frameColor: "#0B1220", shadow: { on: true, color: "#000000", blur: 36, x: 0, y: 26, opacity: 0.4 } }, c));
      objects.push(baseObject({ type: "circle", x: c.width * 0.09, y: c.height * 0.9, width: c.width * 0.07, height: c.width * 0.07, fill: "#ffffff" }, c));
      objects.push(baseObject({ type: "text", text: t.brand || "Brand", x: c.width * 0.18, y: c.height * 0.9, width: c.width * 0.6, height: 80, fill: "#ffffff", fontFamily: "Space Grotesk", fontSize: Math.round(c.width * 0.06), fontWeight: 700, align: "left", lineHeight: 1 }, c));
    } else {
      objects.push(baseObject({ type: "text", text: t.headline, x: c.width * 0.1, y: c.height * 0.12, width: c.width * 0.8, height: 200, fill: t.accent, fontFamily: "Space Grotesk", fontSize: Math.round(c.width * 0.1), fontWeight: 700, align: "left", lineHeight: 1.05 }, c));
      objects.push(baseObject({ type: "device", style: "phone-notch", width: c.width * 0.56, height: c.width * 0.56 * 2.05, x: (c.width - c.width * 0.56) / 2, y: c.height * 0.32, frameColor: "#0B1220", shadow: { on: true, color: "#000000", blur: 40, x: 0, y: 24, opacity: 0.45 } }, c));
    }

    dispatch({ type: "SET_CANVAS_OBJECTS", objects, background });
    showToast(
      t.special === "tilted-wallet"
        ? `Applied "${t.name}" — duplicate this screen from the filmstrip to build a matching set (different headline per screen)`
        : `Applied "${t.name}" template`
    );
  }

  function applyMultiTemplate(t) {
    const built = buildMultiTemplateProject(t.id);
    if (!built) return;
    deselect();
    dispatch({ type: "APPLY_MULTI_TEMPLATE", built });
    setConfirmMulti(null);
    showToast(`Applied "${t.name}" — ${built.canvases.length} screens, with a synced logo you can restyle from any screen`);
  }

  function applyVideoTemplate(v) {
    const built = buildVideoTemplateProject(v.id);
    if (!built) return;
    deselect();
    dispatch({ type: "LOAD_PROJECT", project: built });
    setConfirmVideo(null);
    setAppMode("video");
    if (built.soundtrack) {
      setVideoSoundtrack({ ...built.soundtrack, muted: false });
    }
    setVideoTime(0);
    setIsPlaying(true);
    showToast(`Loaded "${v.name}" Promo Video Template!`);
  }

  return (
    <div id="left">
      <div id="left-tabs">
        {[
          ["shapes", "Shapes & Icons", "M3 3h8v8H3zM17 7a4 4 0 100 8 4 4 0 000-8zM3 21l6-11 6 11H3z"],
          ["components", "Components & Badges", "M19 11H5m14 0a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2m14 0V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"],
          ["text", "Text", "M4 6h16M12 6v14M8 20h8"],
          ["bg", "Backgrounds", "M3 3h18v18H3zM3 16l5-5 4 4 5-6 4 5"],
          ["device", "Device mockups", "M7 2h10v20H7zM11 18h2"],
          ["uploads", "Uploads", "M12 3v12M7 8l5-5 5 5M5 21h14"],
          ["templates", "Templates", "M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
        ].map(([id, title, path]) => (
          <button key={id} className={"ltab" + (tab === id ? " active" : "")} title={title} onClick={() => setTab(id)}>
            <IconSvg path={path} size={17} />
          </button>
        ))}
      </div>
      <div id="left-panel">
        {tab === "shapes" && (
          <div className="panel-scroll">
            <div className="section-title">Basic shapes</div>
            <div className="grid-3">
              {BASIC_SHAPES.map(([kind, label, path]) => (
                <div key={kind} className="asset-btn" onClick={() => addShapeAsset(kind)}>
                  <IconSvg path={path} /><span>{label}</span>
                </div>
              ))}
            </div>
            <div className="section-title">Abstract &amp; decorative</div>
            <div className="grid-3">
              {ABSTRACT_SHAPES.map(([kind, label, path]) => (
                <div key={kind} className="asset-btn" onClick={() => addShapeAsset(kind)}>
                  <IconSvg path={path} /><span>{label}</span>
                </div>
              ))}
            </div>
            <div className="section-title">Icons ({Object.keys(ICONS).length})</div>
            <div className="grid-3">
              {Object.entries(ICONS).map(([name, path]) => (
                <div key={name} className="asset-btn" onClick={() => addIconAsset(name)}>
                  <IconSvg path={path} /><span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "components" && (
          <div className="panel-scroll">
            <div className="section-title">⭐ App Store Ratings</div>
            <div
              className="tpl-card"
              onClick={() => addRatingCard({ score: "4.9", countText: "120K+ Reviews", categoryText: "#1 In Productivity" })}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "var(--accent)" }}>4.9 ★★★★★</span>
                <span style={{ fontSize: 11, color: "var(--text-2)" }}>120K+ Reviews</span>
              </div>
              <div className="tpl-desc" style={{ marginTop: 4 }}>High-converting 5-star social proof card</div>
            </div>

            <div
              className="tpl-card"
              onClick={() => addRatingCard({ score: "5.0", countText: "50,000+ Ratings", categoryText: "🏆 Editor's Choice 2026", starColor: "#FFD200" })}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#FFD200" }}>5.0 ★★★★★</span>
                <span style={{ fontSize: 11, color: "var(--text-2)" }}>Top Rated</span>
              </div>
              <div className="tpl-desc" style={{ marginTop: 4 }}>Editor's Choice rating spotlight</div>
            </div>

            <div className="section-title" style={{ marginTop: 14 }}>💳 Feature &amp; Notification Cards</div>
            <div
              className="tpl-card"
              onClick={() => addFeatureCard({ title: "Instant Cloud Sync", subtitle: "Real-time synchronization across all devices.", icon: "bolt", badgeText: "FAST" })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <span className="tpl-name" style={{ margin: 0 }}>Instant Cloud Sync</span>
              </div>
              <div className="tpl-desc">Glassmorphic feature callout card</div>
            </div>

            <div
              className="tpl-card"
              onClick={() => addFeatureCard({ title: "Live Insights & Stats", subtitle: "Track key metrics & trends in real time.", icon: "chart", iconColor: "#5B8CFF", iconBg: "rgba(91,140,255,0.2)", badgeText: "LIVE" })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📊</span>
                <span className="tpl-name" style={{ margin: 0 }}>Live Metrics &amp; Stats</span>
              </div>
              <div className="tpl-desc">Performance analytics badge card</div>
            </div>

            <div
              className="tpl-card"
              onClick={() => addFeatureCard({ title: "🔔 $450.00 Received", subtitle: "Instant zero-fee transfer from Alex.", icon: "bell", iconColor: "#29D398", iconBg: "rgba(41,211,152,0.2)", badgeText: "NOW" })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>🔔</span>
                <span className="tpl-name" style={{ margin: 0 }}>Push Notification Pill</span>
              </div>
              <div className="tpl-desc">Realistic mobile push notification banner</div>
            </div>

            <div
              className="tpl-card"
              onClick={() => addFeatureCard({ title: "“Best app of the year!”", subtitle: "“Clean, fast, and saves me hours every single week.” — Alex M.", icon: "user", iconColor: "#7C5CFF", iconBg: "rgba(124,92,255,0.2)", badgeText: "5.0 ★" })}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>💬</span>
                <span className="tpl-name" style={{ margin: 0 }}>User Testimonial Review</span>
              </div>
              <div className="tpl-desc">Customer quote &amp; avatar review card</div>
            </div>

            <div className="section-title" style={{ marginTop: 14 }}>🛡️ Badges &amp; Trust Pills</div>
            <div className="grid-2">
              <div className="asset-btn" style={{ padding: 10 }} onClick={() => addBadgePill({ text: "🔒 256-Bit Encrypted", icon: "lock", iconColor: "#29D398" })}>
                <span style={{ fontSize: 11 }}>🔒 Security Shield</span>
              </div>
              <div className="asset-btn" style={{ padding: 10 }} onClick={() => addBadgePill({ text: "🛡️ Play Protect Verified", icon: "shield", iconColor: "#5B8CFF" })}>
                <span style={{ fontSize: 11 }}>🛡️ Play Protect</span>
              </div>
              <div className="asset-btn" style={{ padding: 10 }} onClick={() => addBadgePill({ text: "✓ 100% Free · No Ads", icon: "check", iconColor: "#29D398" })}>
                <span style={{ fontSize: 11 }}>✓ Ad-Free Pill</span>
              </div>
              <div className="asset-btn" style={{ padding: 10 }} onClick={() => addBadgePill({ text: "🚀 10M+ Downloads", icon: "star", iconColor: "#F5A623" })}>
                <span style={{ fontSize: 11 }}>🚀 10M+ Users</span>
              </div>
            </div>

            <div className="section-title" style={{ marginTop: 14 }}>📱 Store Download Badges</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="asset-btn" style={{ padding: "10px 14px", flexDirection: "row", justifyContent: "flex-start", gap: 10 }} onClick={() => addStoreBadge("play")}>
                <span style={{ fontSize: 20 }}>▶</span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 9, color: "var(--text-2)" }}>GET IT ON</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Google Play</div>
                </div>
              </div>
              <div className="asset-btn" style={{ padding: "10px 14px", flexDirection: "row", justifyContent: "flex-start", gap: 10 }} onClick={() => addStoreBadge("appstore")}>
                <span style={{ fontSize: 20 }}></span>
                <div style={{ textAlign: "left" }}>
                  <div style={{ fontSize: 9, color: "var(--text-2)" }}>Download on the</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>App Store</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "text" && (
          <div className="panel-scroll">
            <div className="section-title">Add text</div>
            <div className="asset-btn" style={{ width: "100%", flexDirection: "row", justifyContent: "center", padding: 12 }} onClick={() => addTextAsset("heading")}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Add heading</span>
            </div>
            <div style={{ height: 8 }} />
            <div className="asset-btn" style={{ width: "100%", flexDirection: "row", justifyContent: "center", padding: 10 }} onClick={() => addTextAsset("body")}>
              <span style={{ fontSize: 12 }}>Add body text</span>
            </div>
            <div className="section-title">Text effects presets</div>
            {[
              ["shadow", "Drop shadow", "Soft shadow for legibility over photos"],
              ["stroke", "Outline", "Bold stroke, great over busy art"],
              ["glow", "Glow", "Soft accent-colored glow"],
              ["highlight", "Highlight block", "Solid backdrop behind the text"],
            ].map(([fx, name, desc]) => (
              <div
                key={fx}
                className="tpl-card"
                onClick={() => {
                  if (!selectedObject || selectedObject.type !== "text") {
                    showToast("Select a text layer first");
                    return;
                  }
                  if (fx === "shadow") dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { shadow: { on: true, color: "#000000", blur: 14, x: 0, y: 6, opacity: 0.5 } } });
                  if (fx === "stroke") dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { strokeOn: true, stroke: "#000000", strokeWidth: 3 } });
                  if (fx === "glow") dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { shadow: { on: true, color: "#29D398", blur: 26, x: 0, y: 0, opacity: 0.85 } } });
                  if (fx === "highlight") dispatch({ type: "PATCH_OBJECT", id: selectedObject.id, shared: selectedIsShared, patch: { highlightOn: true, highlightColor: "rgba(0,0,0,0.65)" } });
                }}
              >
                <div className="tpl-name">{name}</div>
                <div className="tpl-desc">{desc}</div>
              </div>
            ))}
          </div>
        )}

        {tab === "bg" && <BackgroundPanel />}

        {tab === "device" && (
          <div className="panel-scroll">
            <div className="section-title">Phone mockups</div>
            <div className="asset-btn" style={{ width: "100%", flexDirection: "row", padding: 12, gap: 10 }} onClick={() => addDeviceAsset("phone-plain")}>
              <IconSvg path="M7 2h10v20H7z" size={26} /><span style={{ fontSize: 11.5 }}>Minimal frame</span>
            </div>
            <div style={{ height: 8 }} />
            <div className="asset-btn" style={{ width: "100%", flexDirection: "row", padding: 12, gap: 10 }} onClick={() => addDeviceAsset("phone-notch")}>
              <IconSvg path="M6 1.5h12v21H6zM9.5 3h5v1.4h-5z" size={26} /><span style={{ fontSize: 11.5 }}>Notch frame</span>
            </div>
            <div className="section-title">Tablet mockups</div>
            <div className="asset-btn" style={{ width: "100%", flexDirection: "row", padding: 12, gap: 10 }} onClick={() => addDeviceAsset("tablet-plain")}>
              <IconSvg path="M4 3h16v18H4z" size={26} /><span style={{ fontSize: 11.5 }}>Tablet frame</span>
            </div>
            <div className="section-title">Tip</div>
            <div style={{ fontSize: 11, color: "var(--text-2)", lineHeight: 1.6 }}>
              Upload a screenshot, select a device on the canvas, then click the uploaded image — it drops inside the screen automatically.
              Use the Tilt sliders in the right panel for a 3D angled look.
            </div>
          </div>
        )}

        {tab === "uploads" && (
          <div className="panel-scroll">
            <div className="section-title">Upload images</div>
            <div
              className="upload-zone"
              onClick={() => document.getElementById("file-input").click()}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; }}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files.length) {
                  handleFiles(e.dataTransfer.files);
                }
              }}
            >
              Click to upload PNG / JPG
              <br />
              or drag files here / onto canvas
            </div>
            <input id="file-input" type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleFiles(e.target.files)} />
            <div className="upload-thumb-grid">
              {uploads.map((rec) => (
                <div key={rec.id} className="upload-thumb" title="Click to add to canvas" onClick={() => addImageToCanvas(rec)}>
                  <img src={rec.dataUrl} alt={rec.name} />
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "templates" && (
          <div className="panel-scroll">
            <div className="seg" style={{ marginBottom: 12 }}>
              <button
                type="button"
                className={templateFilter === "multi" ? "active" : ""}
                onClick={() => setTemplateFilter("multi")}
              >
                🎨 Listing Sets
              </button>
              <button
                type="button"
                className={templateFilter === "video" ? "active" : ""}
                onClick={() => setTemplateFilter("video")}
              >
                🎬 Video Templates
              </button>
              <button
                type="button"
                className={templateFilter === "single" ? "active" : ""}
                onClick={() => setTemplateFilter("single")}
              >
                Single Style
              </button>
            </div>

            {templateFilter === "video" && (
              <>
                <div className="section-title">Animated Promo Video Templates</div>
                <div style={{ fontSize: 10.5, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 10 }}>
                  Full multi-scene animated video projects with pre-configured entrance motions, continuous float/pulse loops, and synchronized electronic soundtracks.
                </div>
                {VIDEO_TEMPLATES.map((v) => (
                  <div key={v.id} className="tpl-card" onClick={() => setConfirmVideo(v)}>
                    <div className="tpl-swatch" style={{ background: v.swatch }} />
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div className="tpl-name">{v.name}</div>
                      <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: "rgba(99,102,241,0.2)", color: "#818cf8", fontWeight: 600 }}>
                        {v.scenes.length} scenes · {v.soundtrack.title}
                      </span>
                    </div>
                    <div className="tpl-desc">{v.tagline}</div>
                  </div>
                ))}
              </>
            )}

            {templateFilter === "multi" && (
              <>
                <div className="section-title">Multi-screen sets ({MULTI_TEMPLATES.length} templates)</div>
                <div style={{ fontSize: 10.5, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 10 }}>
                  Generates a full set of screens with a shared logo and consistent style — different shapes, icons, gradients and device tilts across the set.
                </div>
                {MULTI_TEMPLATES.map((t) => (
                  <div key={t.id} className="tpl-card" onClick={() => setConfirmMulti(t)}>
                    <div className="tpl-swatch" style={{ background: t.swatch }} />
                    <div className="tpl-name">{t.name}</div>
                    <div className="tpl-desc">{t.tagline}</div>
                  </div>
                ))}
              </>
            )}

            {templateFilter === "single" && (
              <>
                <div className="section-title">Single-screen styles</div>
                {TEMPLATES.map((t) => (
                  <div key={t.name} className="tpl-card" onClick={() => applyTemplate(t)}>
                    <div className="tpl-swatch" style={{ background: `linear-gradient(120deg, ${t.bg.c1}, ${t.bg.c2})` }} />
                    <div className="tpl-name">{t.name}</div>
                    <div className="tpl-desc">{t.desc}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {confirmMulti && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmMulti(null); }}>
          <div className="modal">
            <h3>Apply "{confirmMulti.name}"?</h3>
            <div style={{ fontSize: 12.5, color: "var(--text-1)", lineHeight: 1.6 }}>
              This replaces every screen in the current project with a new {confirmMulti.screenCount}-screen set
              ({confirmMulti.tagline}). This can be undone with Ctrl+Z.
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirmMulti(null)}>Cancel</button>
              <button className="btn primary" onClick={() => applyMultiTemplate(confirmMulti)}>Replace screens</button>
            </div>
          </div>
        </div>
      )}

      {confirmVideo && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setConfirmVideo(null); }}>
          <div className="modal">
            <h3>Load "{confirmVideo.name}"?</h3>
            <div style={{ fontSize: 12.5, color: "var(--text-1)", lineHeight: 1.6 }}>
              This loads a complete {confirmVideo.scenes.length}-scene animated promo video project with {confirmVideo.soundtrack.title} soundtrack and switches into the Promo Video Studio.
            </div>
            <div className="modal-actions">
              <button className="btn" onClick={() => setConfirmVideo(null)}>Cancel</button>
              <button className="btn primary" onClick={() => applyVideoTemplate(confirmVideo)}>Load Video Template</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BackgroundPanel() {
  const { project, activeCanvas, dispatch } = useApp();
  const cfg = project.connectBackground ? project.globalBackground : activeCanvas.background;

  function setType(v) {
    const patch = { type: v };
    if (v !== "solid" && !cfg.color1) {
      patch.color1 = "#0F2027";
      patch.color2 = "#2C5364";
      patch.angle = 120;
    }
    dispatch({ type: "SET_CANVAS_BACKGROUND", patch });
  }

  return (
    <div className="panel-scroll">
      <div className="section-title">Fill type</div>
      <div className="seg">
        {["solid", "linear", "radial"].map((v) => (
          <button key={v} className={cfg.type === v ? "active" : ""} onClick={() => setType(v)}>
            {v[0].toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}>
        {cfg.type === "solid" ? (
          <div className="field">
            <label>Color</label>
            <div className="color-field">
              <input
                type="color"
                value={cfg.color || "#222222"}
                onChange={(e) => dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { color: e.target.value } }, { commit: false })}
                onBlur={() => dispatch({ type: "COMMIT" })}
              />
              <input
                type="text"
                value={cfg.color || "#222222"}
                spellCheck={false}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^#[0-9a-fA-F]{6}$/.test(val) || /^#[0-9a-fA-F]{3}$/.test(val)) {
                    dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { color: val } }, { commit: false });
                  }
                }}
                onBlur={() => dispatch({ type: "COMMIT" })}
              />
            </div>
          </div>
        ) : (
          <>
            <div className="field-row">
              <div className="field">
                <label>Color 1</label>
                <div className="color-field">
                  <input
                    type="color"
                    value={cfg.color1 || "#0F2027"}
                    onChange={(e) => dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { color1: e.target.value } }, { commit: false })}
                    onBlur={() => dispatch({ type: "COMMIT" })}
                  />
                  <input
                    type="text"
                    value={cfg.color1 || "#0F2027"}
                    spellCheck={false}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9a-fA-F]{6}$/.test(val) || /^#[0-9a-fA-F]{3}$/.test(val)) {
                        dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { color1: val } }, { commit: false });
                      }
                    }}
                    onBlur={() => dispatch({ type: "COMMIT" })}
                  />
                </div>
              </div>
              <div className="field">
                <label>Color 2</label>
                <div className="color-field">
                  <input
                    type="color"
                    value={cfg.color2 || "#2C5364"}
                    onChange={(e) => dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { color2: e.target.value } }, { commit: false })}
                    onBlur={() => dispatch({ type: "COMMIT" })}
                  />
                  <input
                    type="text"
                    value={cfg.color2 || "#2C5364"}
                    spellCheck={false}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#[0-9a-fA-F]{6}$/.test(val) || /^#[0-9a-fA-F]{3}$/.test(val)) {
                        dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { color2: val } }, { commit: false });
                      }
                    }}
                    onBlur={() => dispatch({ type: "COMMIT" })}
                  />
                </div>
              </div>
            </div>
            {cfg.type === "linear" && (
              <div className="field">
                <label>Angle</label>
                <div className="range-row">
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={cfg.angle || 90}
                    onChange={(e) => dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { angle: +e.target.value } }, { commit: false })}
                    onMouseUp={() => dispatch({ type: "COMMIT" })}
                  />
                  <span className="range-val">{cfg.angle || 90}°</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <div className="section-title">Gradient presets</div>
      <div className="grid-2">
        {GRADIENT_PRESETS.map((g, i) => (
          <div
            key={i}
            className="grad-preset"
            style={{ background: `linear-gradient(${g.angle}deg, ${g.c1}, ${g.c2})` }}
            onClick={() => dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { type: "linear", color1: g.c1, color2: g.c2, angle: g.angle } })}
          />
        ))}
      </div>
      <div className="section-title">Solid palette</div>
      <div className="color-swatch-row">
        {SOLID_PALETTE.map((col) => (
          <div key={col} className="swatch" style={{ background: col }} onClick={() => dispatch({ type: "SET_CANVAS_BACKGROUND", patch: { type: "solid", color: col } })} />
        ))}
      </div>
    </div>
  );
}
