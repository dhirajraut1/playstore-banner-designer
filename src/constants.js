export const MAX_SCREENS = 7;

export const CANVAS_PRESETS = [
  { name: "Phone portrait", w: 1080, h: 1920 },
  { name: "Phone landscape", w: 1920, h: 1080 },
  { name: "Tall phone", w: 1242, h: 2208 },
  { name: "Feature graphic", w: 1440, h: 2560 },
];

export const SOLID_PALETTE = [
  "#0B1220", "#14213D", "#1F2937", "#29D398", "#1A8FBF",
  "#7C5CFF", "#F5A623", "#FF6161", "#F4F1EA", "#FFFFFF",
];

export const GRADIENT_PRESETS = [
  { c1: "#0F2027", c2: "#2C5364", angle: 120 },
  { c1: "#1A2980", c2: "#26D0CE", angle: 135 },
  { c1: "#8E2DE2", c2: "#4A00E0", angle: 90 },
  { c1: "#FF512F", c2: "#DD2476", angle: 135 },
  { c1: "#134E5E", c2: "#71B280", angle: 120 },
  { c1: "#F7971E", c2: "#FFD200", angle: 100 },
];

export const ICONS = {
  star: "M12 2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.3l7.1-.7L12 2z",
  heart: "M12 21s-7.5-4.6-10-9.2C.4 8.1 2.2 4.5 5.9 4c2-.3 3.9.7 6.1 3 2.2-2.3 4.1-3.3 6.1-3 3.7.5 5.5 4.1 3.9 7.8C19.5 16.4 12 21 12 21z",
  arrow: "M4 12h15M13 5l7 7-7 7",
  bolt: "M13 2 3 14h7l-1 8 11-14h-7l1-6z",
  check: "M4 12l5 5L20 6",
  plus: "M12 4v16M4 12h16",
  shield: "M12 2L3 6v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V6l-9-4z",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0",
  lock: "M19 11h-1V7a6 6 0 0 0-12 0v4H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM8 7a4 4 0 0 1 8 0v4H8V7z",
  flame: "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z",
  trophy: "M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2M4 5h16M12 17v4M8 21h8M12 3a6 6 0 0 0-6 6v3a6 6 0 0 0 12 0V9a6 6 0 0 0-6-6z",
  sparkles: "M12 3l2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  bag: "M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z M3 6h18 M16 10a4 4 0 0 1-8 0",
  pin: "M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z M12 6a3 3 0 1 1 0 6 3 3 0 0 1 0-6z",
  chart: "M3 3v18h18 M18 17V9 M13 17V5 M8 17v-3",
  headphones: "M3 18v-6a9 9 0 0 1 18 0v6 M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  play: "M5 3l14 9-14 9V3z",
  tag: "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z M7 7h.01",
  gift: "M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35",
};

export const TEMPLATES = [
  {
    name: "Wallet — tilted phone",
    desc: "Rounded card, tilted phone, headline + subtext + logo — like the reference set",
    bg: { c1: "#2FA94E", c2: "#1E7A38" },
    accent: "#FFFFFF",
    headline: "Pay",
    subtext: "Pay your utility bills.\nEarn cash back & reward point.",
    brand: "PayNepal",
    special: "tilted-wallet",
  },
  { name: "Finance app", desc: "Deep navy + mint accent, bold numerals", bg: { c1: "#0B1220", c2: "#123B2E" }, accent: "#29D398", headline: "Track every rupee." },
  { name: "Shopping app", desc: "Warm coral gradient, punchy sale copy", bg: { c1: "#FF512F", c2: "#DD2476" }, accent: "#FFFFFF", headline: "Deals you'll love." },
  { name: "Fitness app", desc: "High-energy dark + electric lime", bg: { c1: "#0F2027", c2: "#2C5364" }, accent: "#A6FF00", headline: "Train smarter." },
  { name: "Food delivery", desc: "Golden hour gradient, friendly tone", bg: { c1: "#F7971E", c2: "#FFD200" }, accent: "#0B1220", headline: "Hot, fast, fresh." },
  { name: "Social media", desc: "Playful violet-to-pink gradient", bg: { c1: "#8E2DE2", c2: "#4A00E0" }, accent: "#FFFFFF", headline: "Say it your way." },
  { name: "Education", desc: "Calm teal, confident serif-free type", bg: { c1: "#134E5E", c2: "#71B280" }, accent: "#FFFFFF", headline: "Learn something new." },
  { name: "Productivity", desc: "Slate + amber, focused and clear", bg: { c1: "#1F2937", c2: "#374151" }, accent: "#F5A623", headline: "Get it all done." },
];

export function uid(prefix) {
  return prefix + "_" + Math.random().toString(36).slice(2, 9);
}

export function blobPath(w, h) {
  return `M${w * 0.5},0 C${w * 0.85},0 ${w},${h * 0.2} ${w},${h * 0.5} C${w},${h * 0.8} ${w * 0.8},${h} ${w * 0.5},${h} C${w * 0.2},${h} 0,${h * 0.8} 0,${h * 0.5} C0,${h * 0.2} ${w * 0.2},0 ${w * 0.5},0 Z`;
}
export function wavePath(w, h) {
  return `M0,${h * 0.5} C${w * 0.25},0 ${w * 0.25},${h} ${w * 0.5},${h * 0.5} C${w * 0.75},0 ${w * 0.75},${h} ${w},${h * 0.5} L${w},${h} L0,${h} Z`;
}
export function starPolygonPath(w, h) {
  const cx = w / 2, cy = h / 2, outerR = Math.min(w, h) / 2, innerR = outerR * 0.42;
  let d = "";
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += (i === 0 ? "M" : "L") + `${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return d + "Z";
}
export function hexagonPath(w, h) {
  const r = Math.min(w, h) / 2, cx = w / 2, cy = h / 2;
  let d = "";
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    d += (i === 0 ? "M" : "L") + `${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return d + "Z";
}
export function speechBubblePath(w, h) {
  const r = 16;
  return `M${r},0 L${w - r},0 A${r},${r} 0 0 1 ${w},${r} L${w},${h - 20 - r} A${r},${r} 0 0 1 ${w - r},${h - 20} L${Math.round(w * 0.35)},${h - 20} L${Math.round(w * 0.2)},${h} L${Math.round(w * 0.25)},${h - 20} L${r},${h - 20} A${r},${r} 0 0 1 0,${h - 20 - r} L0,${r} A${r},${r} 0 0 1 ${r},0 Z`;
}

export function newCanvasModel(name, w, h) {
  return {
    id: uid("scr"),
    name: name || "Screen",
    width: w || 1080,
    height: h || 1920,
    background: { type: "linear", color: "#1F2937", color1: "#0F2027", color2: "#2C5364", angle: 120 },
    objects: [],
  };
}

export function newProject() {
  return {
    id: uid("proj"),
    name: "Untitled project",
    connectBackground: false,
    globalBackground: { type: "linear", color1: "#0F2027", color2: "#2C5364", angle: 120 },
    sharedObjects: [], // objects that appear identically (same x/y) on every screen (flows across all screens, up to MAX_SCREENS)
    canvases: [newCanvasModel("Screen 1", 1080, 1920)],
  };
}

export function baseObject(partial, canvas) {
  return Object.assign(
    {
      id: uid("obj"),
      type: "rect",
      x: canvas.width / 2 - 80,
      y: canvas.height / 2 - 80,
      width: 160,
      height: 160,
      rotation: 0,
      tiltX: 0,
      tiltY: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      fill: "#29D398",
      locked: false,
      hidden: false,
      shadow: { on: false, color: "#000000", blur: 16, x: 0, y: 8, opacity: 0.4 },
    },
    partial
  );
}

export function labelForType(t) {
  return (
    {
      rect: "Rectangle", circle: "Ellipse", line: "Line", triangle: "Triangle",
      blob: "Blob", wave: "Wave", star5: "Star", hexagon: "Hexagon", speech: "Speech bubble",
      icon: "Icon", text: "Text", image: "Image", device: "Device mockup",
      badge: "Badge pill", rating: "Rating card", card: "Feature card", store_badge: "Store badge",
    }[t] || t
  );
}
