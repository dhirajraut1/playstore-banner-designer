import { uid, baseObject, MAX_SCREENS } from "./constants.js";

const W = 1080, H = 1920;
const STUB = { width: W, height: H };

function text(partial) {
  return baseObject({ type: "text", fontFamily: "Space Grotesk", fontWeight: 700, align: "left", lineHeight: 1.05, ...partial }, STUB);
}
function body(partial) {
  return baseObject({ type: "text", fontFamily: "Inter", fontWeight: 500, align: "left", lineHeight: 1.35, ...partial }, STUB);
}
function device(partial) {
  return baseObject({ type: "device", style: "phone-notch", frameColor: "#0B1220", shadow: { on: true, color: "#000000", blur: 36, x: 0, y: 26, opacity: 0.4 }, ...partial }, STUB);
}
function shape(type, partial) {
  return baseObject({ type, ...partial }, STUB);
}
function icon(name, partial) {
  return baseObject({ type: "icon", icon: name, ...partial }, STUB);
}

/* ============================================================
   Shared "chrome" builders — logo mark + decorative motif,
   pushed into project.sharedObjects so they flow identically
   across every screen in the set (and stay linked if edited).
   ============================================================ */
function brandMark(brand, accent) {
  return [
    shape("circle", { x: W * 0.09, y: H * 0.9, width: W * 0.07, height: W * 0.07, fill: accent }),
    text({ text: brand, x: W * 0.18, y: H * 0.9, width: W * 0.6, height: 80, fill: accent, fontSize: Math.round(W * 0.06) }),
  ];
}
function cornerDecor(accent, kind) {
  if (kind === "blob") {
    return [
      shape("blob", { x: W * 0.62, y: -H * 0.03, width: W * 0.5, height: W * 0.5, rotation: 20, opacity: 0.1, fill: accent }),
      shape("blob", { x: W * 0.78, y: H * 0.02, width: W * 0.28, height: W * 0.28, rotation: -10, opacity: 0.14, fill: accent }),
    ];
  }
  if (kind === "wave") {
    return [shape("wave", { x: -W * 0.1, y: H * 0.02, width: W * 1.2, height: H * 0.1, opacity: 0.12, fill: accent })];
  }
  if (kind === "circles") {
    return [
      shape("circle", { x: W * 0.72, y: -H * 0.04, width: W * 0.5, height: W * 0.5, opacity: 0.1, fill: accent }),
      shape("circle", { x: W * 0.86, y: H * 0.06, width: W * 0.22, height: W * 0.22, opacity: 0.16, fill: accent }),
    ];
  }
  return [];
}

/* ============================================================
   Per-screen layout builders — each one leans on a different
   mix of shape/text/device features so the set "showcases"
   the tool's range as it grows across screens.
   ============================================================ */
function screenHeroDevice(cfg) {
  const { headline, subtext, tiltX = -10, tiltY = 16, rotation = -9, accent, subColor } = cfg;
  const objects = [];
  objects.push(text({ text: headline, x: W * 0.09, y: H * 0.06, width: W * 0.82, height: 130, fill: accent, fontSize: Math.round(W * 0.115) }));
  objects.push(body({ text: subtext, x: W * 0.09, y: H * 0.16, width: W * 0.74, height: 160, fill: subColor, fontSize: Math.round(W * 0.04) }));
  const dw = W * 0.62, dh = dw * 2.02;
  objects.push(device({ style: "phone-notch", width: dw, height: dh, x: W * 0.14, y: H * 0.42, rotation, tiltX, tiltY }));
  return { background: null, objects };
}

function screenBadgeCallout(cfg) {
  const { headline, subtext, iconName, accent, cardColor, subColor } = cfg;
  const objects = [];
  objects.push(shape("rect", { x: W * 0.08, y: H * 0.08, width: W * 0.84, height: H * 0.22, cornerRadius: 28, fill: cardColor, opacity: 0.92, shadow: { on: true, color: "#000000", blur: 30, x: 0, y: 14, opacity: 0.25 } }));
  objects.push(icon(iconName, { x: W * 0.14, y: H * 0.115, width: W * 0.12, height: W * 0.12, fill: accent }));
  objects.push(text({ text: headline, x: W * 0.32, y: H * 0.1, width: W * 0.5, height: 90, fill: "#101216", fontSize: Math.round(W * 0.065) }));
  objects.push(body({ text: subtext, x: W * 0.32, y: H * 0.17, width: W * 0.5, height: 90, fill: "#4a4f5a", fontSize: Math.round(W * 0.033) }));
  const dw = W * 0.6, dh = dw * 2.02;
  objects.push(device({ style: "phone-notch", width: dw, height: dh, x: (W - dw) / 2, y: H * 0.36, rotation: 6, tiltX: 8, tiltY: -12 }));
  return { background: null, objects };
}

function screenTriptychShapes(cfg) {
  const { headline, subtext, accent, subColor } = cfg;
  const objects = [];
  objects.push(text({ text: headline, x: W * 0.09, y: H * 0.07, width: W * 0.82, height: 120, fill: accent, fontSize: Math.round(W * 0.1) }));
  objects.push(body({ text: subtext, x: W * 0.09, y: H * 0.165, width: W * 0.74, height: 130, fill: subColor, fontSize: Math.round(W * 0.038) }));
  objects.push(shape("triangle", { x: W * 0.12, y: H * 0.55, width: W * 0.2, height: W * 0.2, rotation: -8, opacity: 0.9, fill: accent }));
  objects.push(shape("circle", { x: W * 0.4, y: H * 0.62, width: W * 0.16, height: W * 0.16, opacity: 0.75, fill: "#ffffff" }));
  objects.push(shape("rect", { x: W * 0.62, y: H * 0.58, width: W * 0.26, height: W * 0.26, cornerRadius: 22, rotation: 10, opacity: 0.85, fill: accent }));
  objects.push(shape("line", { x: W * 0.12, y: H * 0.82, width: W * 0.76, height: 6, strokeWidth: 6, fill: "#ffffff" }));
  return { background: null, objects };
}

function screenDeviceGrid(cfg) {
  const { headline, subtext, accent, subColor } = cfg;
  const objects = [];
  objects.push(text({ text: headline, x: W * 0.09, y: H * 0.06, width: W * 0.82, height: 120, fill: accent, fontSize: Math.round(W * 0.1) }));
  objects.push(body({ text: subtext, x: W * 0.09, y: H * 0.155, width: W * 0.78, height: 120, fill: subColor, fontSize: Math.round(W * 0.037) }));
  const dw = W * 0.42, dh = dw * 2.02;
  objects.push(device({ style: "phone-plain", width: dw, height: dh, x: W * 0.08, y: H * 0.4, rotation: -14, tiltX: -14, tiltY: 10, scaleX: 0.92, scaleY: 0.92, opacity: 0.85 }));
  objects.push(device({ style: "phone-notch", width: dw, height: dh, x: W * 0.42, y: H * 0.34, rotation: 6, tiltX: 6, tiltY: -10 }));
  return { background: null, objects };
}

function screenRadialFocus(cfg) {
  const { headline, subtext, accent, subColor, radialAccent } = cfg;
  const objects = [];
  objects.push(shape("blob", { x: W * 0.5 - W * 0.42, y: H * 0.3, width: W * 0.84, height: W * 0.84, opacity: 0.16, fill: radialAccent || accent }));
  objects.push(text({ text: headline, x: W * 0.09, y: H * 0.08, width: W * 0.82, height: 130, fill: accent, fontSize: Math.round(W * 0.11), align: "center" }));
  objects.push(body({ text: subtext, x: W * 0.14, y: H * 0.18, width: W * 0.72, height: 130, fill: subColor, fontSize: Math.round(W * 0.038), align: "center" }));
  const dw = W * 0.58, dh = dw * 2.02;
  objects.push(device({ style: "phone-notch", width: dw, height: dh, x: (W - dw) / 2, y: H * 0.4, rotation: 0, tiltX: 0, tiltY: 0 }));
  return { background: { type: "radial", color1: cfg.radialC1, color2: cfg.radialC2 }, objects };
}

function screenClosingCTA(cfg) {
  const { headline, subtext, accent, subColor } = cfg;
  const objects = [];
  objects.push(shape("wave", { x: -W * 0.1, y: H * 0.62, width: W * 1.2, height: H * 0.18, opacity: 0.14, fill: "#ffffff" }));
  objects.push(text({ text: headline, x: W * 0.09, y: H * 0.34, width: W * 0.82, height: 140, fill: accent, fontSize: Math.round(W * 0.13) }));
  objects.push(body({ text: subtext, x: W * 0.09, y: H * 0.47, width: W * 0.78, height: 130, fill: subColor, fontSize: Math.round(W * 0.042) }));
  objects.push(shape("rect", { x: W * 0.09, y: H * 0.58, width: W * 0.4, height: 84, cornerRadius: 42, fill: "#ffffff" }));
  objects.push(text({ text: "Get started", x: W * 0.15, y: H * 0.595, width: W * 0.3, height: 60, fill: accent, fontFamily: "Space Grotesk", fontSize: Math.round(W * 0.045), fontWeight: 700 }));
  return { background: null, objects };
}

const BUILDERS = {
  hero: screenHeroDevice,
  badge: screenBadgeCallout,
  triptych: screenTriptychShapes,
  grid: screenDeviceGrid,
  radial: screenRadialFocus,
  cta: screenClosingCTA,
};

/* ============================================================
   Template catalogue — each defines up to 7 screens, mixing
   builders so shapes, icons, gradients, tilts and device
   mockups are all showcased across the set.
   ============================================================ */
export const MULTI_TEMPLATES = [
  {
    id: "wallet-flow",
    name: "Wallet flow",
    tagline: "5 screens · tilted phones, synced logo, flowing gradient",
    screenCount: 5,
    swatch: "linear-gradient(120deg,#2FA94E,#1E7A38)",
    accent: "#FFFFFF",
    brand: "PayNepal",
    connectBackground: true,
    bg: { c1: "#2FA94E", c2: "#1E7A38", angle: 120 },
    decor: "blob",
    screens: [
      { builder: "hero", headline: "Pay", subtext: "Pay your utility bills.\nEarn cash back & reward point." },
      { builder: "badge", headline: "Send", subtext: "Send to any user, instantly.", iconName: "arrow", cardColor: "#EAFBF1" },
      { builder: "hero", headline: "Top Up", subtext: "Recharge mobile & data\nin a few taps.", rotation: 9, tiltX: 10, tiltY: -14 },
      { builder: "badge", headline: "Rewards", subtext: "Earn points on every payment.", iconName: "star", cardColor: "#EAFBF1" },
      { builder: "cta", headline: "Start free", subtext: "Join millions managing money\nthe simple way." },
    ],
  },
  {
    id: "fitness-pulse",
    name: "Fitness pulse",
    tagline: "6 screens · dark energy, icons, radial focus",
    screenCount: 6,
    swatch: "linear-gradient(120deg,#0F2027,#2C5364)",
    accent: "#A6FF00",
    brand: "Pulse",
    connectBackground: false,
    bg: { c1: "#0F2027", c2: "#2C5364", angle: 120 },
    decor: "wave",
    screens: [
      { builder: "hero", headline: "Train smarter", subtext: "Personalized plans that adapt\nto your progress." },
      { builder: "badge", headline: "Track", subtext: "Every rep, every rundown.", iconName: "bolt", cardColor: "#101827" },
      { builder: "triptych", headline: "Your way", subtext: "Strength, cardio, mobility —\nmix it up." },
      { builder: "grid", headline: "Any device", subtext: "Phone, tablet, watch — synced." },
      { builder: "radial", headline: "Stay in it", subtext: "Streaks that actually\nkeep you coming back.", radialC1: "#1B2A3A", radialC2: "#0F2027", radialAccent: "#A6FF00" },
      { builder: "cta", headline: "Join free", subtext: "No credit card. Cancel anytime." },
    ],
  },
  {
    id: "marketplace-deals",
    name: "Marketplace deals",
    tagline: "7 screens · badges, callouts, tilted showcases",
    screenCount: 7,
    swatch: "linear-gradient(120deg,#FF512F,#DD2476)",
    accent: "#FFFFFF",
    brand: "Deala",
    connectBackground: true,
    bg: { c1: "#FF512F", c2: "#DD2476", angle: 135 },
    decor: "circles",
    screens: [
      { builder: "hero", headline: "Deals you'll love", subtext: "New drops daily, up to 70% off." },
      { builder: "badge", headline: "Flash sale", subtext: "Limited-time offers, live now.", iconName: "bolt", cardColor: "#FFF1EC" },
      { builder: "triptych", headline: "Shop by mood", subtext: "Curated picks made for you." },
      { builder: "hero", headline: "Track & save", subtext: "Wishlist it, we'll watch\nthe price.", rotation: 8, tiltX: 9, tiltY: -13 },
      { builder: "badge", headline: "Fast delivery", subtext: "Most orders arrive next day.", iconName: "arrow", cardColor: "#FFF1EC" },
      { builder: "radial", headline: "Members save more", subtext: "Extra perks, every order.", radialC1: "#B23A63", radialC2: "#7A2249", radialAccent: "#FFFFFF" },
      { builder: "cta", headline: "Shop now", subtext: "Your next favorite thing\nis one tap away." },
    ],
  },
  {
    id: "productivity-suite",
    name: "Productivity suite",
    tagline: "4 screens · clean, minimal tilt, checklist icons",
    screenCount: 4,
    swatch: "linear-gradient(120deg,#1F2937,#374151)",
    accent: "#F5A623",
    brand: "Flow",
    connectBackground: false,
    bg: { c1: "#1F2937", c2: "#374151", angle: 120 },
    decor: "circles",
    screens: [
      { builder: "hero", headline: "Get it all done", subtext: "One place for tasks, notes\nand focus time.", rotation: 0, tiltX: 0, tiltY: 0 },
      { builder: "badge", headline: "Stay on track", subtext: "Checklists that keep you honest.", iconName: "check", cardColor: "#F4F1EA" },
      { builder: "grid", headline: "Everywhere", subtext: "Desktop, phone, tablet — synced live." },
      { builder: "cta", headline: "Try it free", subtext: "Set up your first project\nin under a minute." },
    ],
  },
  {
    id: "crypto-vault",
    name: "Crypto Vault & Web3",
    tagline: "5 screens · obsidian & emerald, 3D tilt mockups, security badges",
    screenCount: 5,
    swatch: "linear-gradient(120deg,#0B1220,#123B2E)",
    accent: "#29D398",
    brand: "VaultX",
    connectBackground: true,
    bg: { c1: "#0B1220", c2: "#142F24", angle: 135 },
    decor: "blob",
    screens: [
      { builder: "hero", headline: "Next-gen crypto", subtext: "Buy, trade, and custody assets\nwith zero compromise.", rotation: -9, tiltX: -12, tiltY: 15 },
      { builder: "badge", headline: "Instant Swap", subtext: "Cross-chain swaps in sub-seconds.", iconName: "bolt", cardColor: "#11241C" },
      { builder: "hero", headline: "Deep security", subtext: "Self-custody keys powered by\nmulti-party computation.", rotation: 8, tiltX: 10, tiltY: -12 },
      { builder: "badge", headline: "Earn rewards", subtext: "Up to 8.5% APY on stablecoins.", iconName: "star", cardColor: "#11241C" },
      { builder: "cta", headline: "Claim wallet", subtext: "Create your free wallet\nin 30 seconds." },
    ],
  },
  {
    id: "zen-wellness",
    name: "Zen Wellness & Health",
    tagline: "5 screens · peaceful sage & dawn peach, heart streaks, calm focus",
    screenCount: 5,
    swatch: "linear-gradient(120deg,#1B4332,#2D6A4F)",
    accent: "#E2FCD6",
    brand: "Zenith",
    connectBackground: false,
    bg: { c1: "#1B4332", c2: "#2D6A4F", angle: 120 },
    decor: "wave",
    screens: [
      { builder: "hero", headline: "Breathe easier", subtext: "Guided mindfulness, sleep audio\nand daily habits.", rotation: -4, tiltX: -4, tiltY: 6 },
      { builder: "badge", headline: "Daily streaks", subtext: "Small rituals that build resilience.", iconName: "heart", cardColor: "#22543D" },
      { builder: "radial", headline: "Deep restorative sleep", subtext: "Soundscapes designed by neuroscientists.", radialC1: "#2D6A4F", radialC2: "#1B4332", radialAccent: "#E2FCD6" },
      { builder: "badge", headline: "Track mood", subtext: "Visualize patterns across weeks.", iconName: "star", cardColor: "#22543D" },
      { builder: "cta", headline: "Begin journey", subtext: "Start with a 7-day free trial." },
    ],
  },
  {
    id: "foodie-express",
    name: "Foodie Express & Dining",
    tagline: "5 screens · golden hour sunset, live tracking, order badges",
    screenCount: 5,
    swatch: "linear-gradient(120deg,#FF416C,#FF4B2B)",
    accent: "#FFFFFF",
    brand: "Foodie",
    connectBackground: true,
    bg: { c1: "#FF416C", c2: "#FF4B2B", angle: 135 },
    decor: "circles",
    screens: [
      { builder: "hero", headline: "Cravings satisfied", subtext: "Top restaurants delivered to\nyour door in minutes.", rotation: -8, tiltX: -10, tiltY: 14 },
      { builder: "badge", headline: "Live tracking", subtext: "Watch your order from kitchen to door.", iconName: "arrow", cardColor: "#FFF0F3" },
      { builder: "hero", headline: "Zero fee perks", subtext: "Free delivery on all orders\nover $15.", rotation: 8, tiltX: 9, tiltY: -12 },
      { builder: "badge", headline: "Curated chefs", subtext: "Hand-picked local culinary gems.", iconName: "star", cardColor: "#FFF0F3" },
      { builder: "cta", headline: "Order fresh", subtext: "$10 off your first delivery." },
    ],
  },
  {
    id: "ai-copilot",
    name: "AI Copilot & Intelligence",
    tagline: "5 screens · deep space violet, conversational bubbles, smart badges",
    screenCount: 5,
    swatch: "linear-gradient(120deg,#0C0A1E,#3B1D6B)",
    accent: "#E2D9FF",
    brand: "Nova AI",
    connectBackground: false,
    bg: { c1: "#0C0A1E", c2: "#2A1448", angle: 120 },
    decor: "blob",
    screens: [
      { builder: "hero", headline: "Supercharge work", subtext: "Your AI partner for writing, research\nand complex problem solving.", rotation: -6, tiltX: -8, tiltY: 10 },
      { builder: "badge", headline: "Ultra fast", subtext: "Instant responses under 50ms.", iconName: "bolt", cardColor: "#1D163B" },
      { builder: "triptych", headline: "Work across apps", subtext: "Integrates with your calendar, notes & docs." },
      { builder: "radial", headline: "Private by design", subtext: "Encrypted end-to-end.", radialC1: "#381559", radialC2: "#0C0A1E", radialAccent: "#29D398" },
      { builder: "cta", headline: "Try Nova AI", subtext: "Free forever plan available." },
    ],
  },
];

export function buildMultiTemplateProject(templateId) {
  const t = MULTI_TEMPLATES.find((m) => m.id === templateId);
  if (!t) return null;
  const count = Math.min(t.screenCount, MAX_SCREENS);

  const canvases = [];
  for (let i = 0; i < count; i++) {
    const s = t.screens[i] || t.screens[t.screens.length - 1];
    const builder = BUILDERS[s.builder] || BUILDERS.hero;
    const result = builder({
      headline: s.headline,
      subtext: s.subtext,
      accent: t.accent,
      subColor: hexWithAlpha(t.accent, 0.92),
      cardColor: s.cardColor || "#ffffff",
      iconName: s.iconName || "star",
      rotation: s.rotation,
      tiltX: s.tiltX,
      tiltY: s.tiltY,
      radialC1: s.radialC1 || t.bg.c1,
      radialC2: s.radialC2 || t.bg.c2,
      radialAccent: s.radialAccent || t.accent,
    });
    canvases.push({
      id: uid("scr"),
      name: `Screen ${i + 1} — ${s.headline}`,
      width: W,
      height: H,
      background: result.background || { type: "linear", color1: t.bg.c1, color2: t.bg.c2, angle: t.bg.angle || 120 },
      objects: result.objects,
    });
  }

  const sharedObjects = [...brandMark(t.brand, t.accent), ...cornerDecor(t.accent, t.decor)];

  return {
    canvases,
    sharedObjects,
    connectBackground: t.connectBackground,
    globalBackground: { type: "linear", color1: t.bg.c1, color2: t.bg.c2, angle: t.bg.angle || 120 },
  };
}

function hexWithAlpha(hex) {
  // Properties don't support alpha on solid hex fill inputs, so just soften
  // near-white text slightly for readability against photo-like device art.
  return hex === "#FFFFFF" || hex === "#ffffff" ? "#F3FBF7" : hex;
}
