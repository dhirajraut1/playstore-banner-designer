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
      blob: "Blob", wave: "Wave", icon: "Icon", text: "Text", image: "Image", device: "Device mockup",
    }[t] || t
  );
}
