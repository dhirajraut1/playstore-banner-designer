import React, { forwardRef } from "react";
import { Rect, Ellipse, Line, RegularPolygon, Path, Text, Image as KImage, Group } from "react-konva";
import { blobPath, wavePath, starPolygonPath, hexagonPath, speechBubblePath, ICONS } from "../constants.js";
import { useHtmlImage } from "../hooks/useHtmlImage.js";

function shadowProps(obj) {
  if (!obj.shadow || !obj.shadow.on) return {};
  return {
    shadowColor: obj.shadow.color || "#000000",
    shadowBlur: obj.shadow.blur ?? 12,
    shadowOffsetX: obj.shadow.x ?? 0,
    shadowOffsetY: obj.shadow.y ?? 6,
    shadowOpacity: obj.shadow.opacity ?? 0.5,
  };
}

function commonProps(obj, handlers) {
  return {
    x: obj.x,
    y: obj.y,
    rotation: obj.rotation || 0,
    opacity: obj.hidden ? 0 : obj.opacity ?? 1,
    draggable: !obj.locked,
    scaleX: obj.scaleX || 1,
    scaleY: obj.scaleY || 1,
    skewX: Math.tan(((obj.tiltX || 0) * Math.PI) / 180),
    skewY: Math.tan(((obj.tiltY || 0) * Math.PI) / 180),
    id: obj.id,
    name: "editable",
    hitStrokeWidth: 12,
    onClick: handlers.onSelect,
    onTap: handlers.onSelect,
    onDragMove: handlers.onDragMove,
    onDragEnd: handlers.onDragEnd,
    onTransformEnd: handlers.onTransformEnd,
    ...shadowProps(obj),
  };
}

function roundRectClip(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

const DeviceMockup = forwardRef(function DeviceMockup({ obj, handlers }, ref) {
  const w = obj.width, h = obj.height;
  const frameColor = obj.frameColor || "#0B1220";
  const isTablet = obj.style === "tablet-plain";
  const radius = isTablet ? w * 0.06 : w * 0.11;
  const bezel = isTablet ? w * 0.035 : w * 0.045;
  const img = useHtmlImage(obj.imageSrc);

  const containerW = Math.max(10, w - bezel * 2);
  const containerH = Math.max(10, h - bezel * 2);

  let imgX = bezel, imgY = bezel, imgW = containerW, imgH = containerH;
  if (img && img.width && img.height) {
    const scale = Math.max(containerW / img.width, containerH / img.height);
    imgW = img.width * scale;
    imgH = img.height * scale;
    imgX = bezel + (containerW - imgW) / 2;
    imgY = bezel + (containerH - imgH) / 2;
  }

  return (
    <Group ref={ref} {...commonProps(obj, handlers)}>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={radius} fill={frameColor} {...shadowProps(obj)} />
      <Group clipFunc={(ctx) => roundRectClip(ctx, bezel, bezel, containerW, containerH, radius * 0.6)}>
        <Rect x={bezel} y={bezel} width={containerW} height={containerH} fill="#dfe3ea" />
        {img ? (
          <KImage x={imgX} y={imgY} image={img} width={imgW} height={imgH} />
        ) : (
          <Text
            x={bezel + 10} y={h / 2 - 14} width={containerW - 20} align="center"
            text="Drop a screenshot" fontSize={Math.max(12, w * 0.045)} fill="#8a93a3" fontFamily="Inter"
          />
        )}
      </Group>
      {obj.style === "phone-notch" && (
        <Rect
          x={(w - w * 0.34) / 2} y={bezel * 0.35} width={w * 0.34} height={Math.max(6, h * 0.018 * 3)}
          cornerRadius={20} fill={frameColor}
        />
      )}
      {isTablet && (
        <Ellipse x={w / 2} y={bezel * 0.5} radiusX={3.5} radiusY={3.5} fill="#3b4252" />
      )}
    </Group>
  );
});

// App Store Rating Component (Score + Stars + Review count)
const RatingNode = forwardRef(function RatingNode({ obj, handlers }, ref) {
  const w = obj.width || 340, h = obj.height || 100;
  const radius = obj.cornerRadius ?? 20;
  const score = obj.score || "4.9";
  const count = obj.countText || "120K+ Reviews";
  const category = obj.categoryText || "#1 in Productivity";
  const starColor = obj.starColor || "#F5A623";

  return (
    <Group ref={ref} {...commonProps(obj, handlers)}>
      <Rect
        x={0} y={0} width={w} height={h} cornerRadius={radius}
        fill={obj.fill || "#141722"}
        stroke={obj.stroke || "rgba(255,255,255,0.18)"}
        strokeWidth={obj.strokeWidth ?? 1}
        {...shadowProps(obj)}
      />
      <Text
        x={20} y={16}
        text={score}
        fontFamily="Space Grotesk"
        fontSize={42}
        fontStyle="bold"
        fill={obj.textColor || "#ffffff"}
      />
      <Group x={108} y={20}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Path
            key={i}
            x={i * 22}
            data={ICONS.star}
            fill={starColor}
            scaleX={18 / 24}
            scaleY={18 / 24}
          />
        ))}
      </Group>
      <Text
        x={108} y={44}
        text={count}
        fontFamily="Inter"
        fontSize={14}
        fontStyle="bold"
        fill={obj.textColor || "#ffffff"}
      />
      <Text
        x={22} y={68} width={w - 44}
        text={category}
        fontFamily="Inter"
        fontSize={12}
        fill="rgba(255,255,255,0.68)"
      />
    </Group>
  );
});

// Feature / Testimonial / Notification Card
const CardNode = forwardRef(function CardNode({ obj, handlers }, ref) {
  const w = obj.width || 380, h = obj.height || 135;
  const radius = obj.cornerRadius ?? 22;
  const iconD = obj.icon && ICONS[obj.icon] ? ICONS[obj.icon] : ICONS.bolt;
  const iconBg = obj.iconBg || "rgba(41, 211, 152, 0.16)";
  const iconColor = obj.iconColor || "#29D398";
  const title = obj.title || "Instant Cloud Backup";
  const subtitle = obj.subtitle || "Keep your data safely backed up & synced everywhere.";
  const badgeText = obj.badgeText;

  return (
    <Group ref={ref} {...commonProps(obj, handlers)}>
      <Rect
        x={0} y={0} width={w} height={h} cornerRadius={radius}
        fill={obj.fill || "#161822"}
        stroke={obj.stroke || "rgba(255,255,255,0.14)"}
        strokeWidth={obj.strokeWidth ?? 1}
        {...shadowProps(obj)}
      />
      <Group x={18} y={20}>
        <Rect width={48} height={48} cornerRadius={12} fill={iconBg} />
        <Path x={12} y={12} data={iconD} fill={iconColor} scaleX={1} scaleY={1} />
      </Group>
      <Text
        x={80} y={20} width={w - 96}
        text={title}
        fontFamily="Space Grotesk"
        fontSize={17}
        fontStyle="bold"
        fill={obj.textColor || "#ffffff"}
      />
      <Text
        x={80} y={48} width={w - 96}
        text={subtitle}
        fontFamily="Inter"
        fontSize={12.5}
        lineHeight={1.35}
        fill="rgba(255,255,255,0.72)"
      />
      {badgeText && (
        <Group x={w - 74} y={16}>
          <Rect width={58} height={20} cornerRadius={10} fill="rgba(255,255,255,0.12)" />
          <Text width={58} y={3.5} text={badgeText} align="center" fontSize={9.5} fontStyle="bold" fill="#29D398" />
        </Group>
      )}
    </Group>
  );
});

// Badge Pill Node
const BadgeNode = forwardRef(function BadgeNode({ obj, handlers }, ref) {
  const w = obj.width || 280, h = obj.height || 54;
  const radius = obj.cornerRadius ?? h / 2;
  const iconD = obj.icon && ICONS[obj.icon] ? ICONS[obj.icon] : null;
  const iconSize = Math.round(h * 0.44);
  const textX = iconD ? 16 + iconSize + 10 : 18;
  const textW = w - textX - 16;

  return (
    <Group ref={ref} {...commonProps(obj, handlers)}>
      <Rect
        x={0} y={0} width={w} height={h} cornerRadius={radius}
        fill={obj.fill || "rgba(255,255,255,0.12)"}
        stroke={obj.stroke || "rgba(255,255,255,0.22)"}
        strokeWidth={obj.strokeWidth ?? 1}
        {...shadowProps(obj)}
      />
      {iconD && (
        <Group x={16} y={(h - iconSize) / 2}>
          <Path
            data={iconD}
            fill={obj.iconColor || "#29D398"}
            scaleX={iconSize / 24}
            scaleY={iconSize / 24}
          />
        </Group>
      )}
      <Text
        x={textX}
        y={(h - (obj.fontSize || Math.round(h * 0.38))) / 2}
        width={textW}
        text={obj.text || "Badge Pill"}
        fontFamily={obj.fontFamily || "Space Grotesk"}
        fontSize={obj.fontSize || Math.round(h * 0.38)}
        fontStyle={obj.fontWeight >= 700 ? "bold" : "600"}
        fill={obj.textColor || "#ffffff"}
        align={obj.align || "left"}
        ellipsis={true}
      />
    </Group>
  );
});

// App Store / Google Play Download Badge
const StoreBadgeNode = forwardRef(function StoreBadgeNode({ obj, handlers }, ref) {
  const w = obj.width || 210, h = obj.height || 62;
  const isGooglePlay = obj.platform !== "appstore";

  return (
    <Group ref={ref} {...commonProps(obj, handlers)}>
      <Rect
        x={0} y={0} width={w} height={h} cornerRadius={12}
        fill="#000000"
        stroke="#4a5060"
        strokeWidth={1}
        {...shadowProps(obj)}
      />
      {isGooglePlay ? (
        <>
          <Path x={16} y={13} data="M3 2L15 12L3 22V2Z" fill="#00E676" scaleX={1.5} scaleY={1.5} />
          <Path x={16} y={13} data="M3 2L10 16L15 12L3 2Z" fill="#00B0FF" scaleX={1.5} scaleY={1.5} />
          <Path x={16} y={13} data="M3 22L10 8L15 12L3 22Z" fill="#FF1744" scaleX={1.5} scaleY={1.5} />
          <Path x={16} y={13} data="M10 8L15 12L10 16L3 12L10 8Z" fill="#FFD600" scaleX={1.5} scaleY={1.5} />
          <Text x={54} y={12} text="GET IT ON" fontSize={9} fontFamily="Inter" fill="#aaaaaa" />
          <Text x={54} y={24} text="Google Play" fontSize={18} fontStyle="bold" fontFamily="Space Grotesk" fill="#ffffff" />
        </>
      ) : (
        <>
          <Path
            x={16} y={12}
            data="M15.5 13.5c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.57-2.73-1.78-3.32-1.8-1.41-.14-2.78.84-3.5.84-.73 0-1.85-.82-3.04-.8-1.55.02-3 1-3.8 2.39-1.63 2.82-.42 7 1.17 9.29.77 1.12 1.7 2.38 2.92 2.33 1.16-.04 1.6-.75 3.01-.75 1.4 0 1.8.75 3.02.73 1.24-.03 2.03-1.13 2.8-2.25.88-1.28 1.24-2.53 1.27-2.6-.03-.01-2.45-.94-2.49-3.73zM13.2 6.4c.64-.78 1.07-1.86.95-2.95-.92.04-2.03.61-2.69 1.39-.58.67-1.09 1.77-.95 2.83 1.02.08 2.05-.5 2.69-1.27z"
            fill="#ffffff"
            scaleX={1.5}
            scaleY={1.5}
          />
          <Text x={54} y={12} text="Download on the" fontSize={9} fontFamily="Inter" fill="#aaaaaa" />
          <Text x={54} y={24} text="App Store" fontSize={18} fontStyle="bold" fontFamily="Space Grotesk" fill="#ffffff" />
        </>
      )}
    </Group>
  );
});

const CanvasObjectNode = forwardRef(function CanvasObjectNode({ obj, handlers }, ref) {
  const img = useHtmlImage(obj.type === "image" ? obj.imageSrc : null);
  const props = commonProps(obj, handlers);

  switch (obj.type) {
    case "rect":
      return <Rect ref={ref} {...props} width={obj.width} height={obj.height} fill={obj.fill}
        cornerRadius={obj.cornerRadius || 0} stroke={obj.stroke || undefined} strokeWidth={obj.strokeWidth || 0} />;
    case "circle":
      return <Ellipse ref={ref} {...props} radiusX={obj.width / 2} radiusY={obj.height / 2} fill={obj.fill}
        stroke={obj.stroke || undefined} strokeWidth={obj.strokeWidth || 0} />;
    case "line":
      return <Line ref={ref} {...props} points={[0, 0, obj.width, 0]} stroke={obj.fill} strokeWidth={obj.strokeWidth || 6} lineCap="round" />;
    case "triangle":
      return <RegularPolygon ref={ref} {...props} sides={3} radius={obj.width / 2} fill={obj.fill}
        stroke={obj.stroke || undefined} strokeWidth={obj.strokeWidth || 0} />;
    case "blob":
      return <Path ref={ref} {...props} data={blobPath(obj.width, obj.height)} fill={obj.fill} />;
    case "wave":
      return <Path ref={ref} {...props} data={wavePath(obj.width, obj.height)} fill={obj.fill} />;
    case "star5":
      return <Path ref={ref} {...props} data={starPolygonPath(obj.width, obj.height)} fill={obj.fill} stroke={obj.stroke} strokeWidth={obj.strokeWidth} />;
    case "hexagon":
      return <Path ref={ref} {...props} data={hexagonPath(obj.width, obj.height)} fill={obj.fill} stroke={obj.stroke} strokeWidth={obj.strokeWidth} />;
    case "speech":
      return <Path ref={ref} {...props} data={speechBubblePath(obj.width, obj.height)} fill={obj.fill} stroke={obj.stroke} strokeWidth={obj.strokeWidth} />;
    case "icon":
      return (
        <Path
          ref={ref} {...props} data={ICONS[obj.icon] || ICONS.star} fill={obj.fill}
          scaleX={(obj.width / 24) * (obj.scaleX || 1)} scaleY={(obj.height / 24) * (obj.scaleY || 1)}
        />
      );
    case "badge":
      return <BadgeNode ref={ref} obj={obj} handlers={handlers} />;
    case "rating":
      return <RatingNode ref={ref} obj={obj} handlers={handlers} />;
    case "card":
      return <CardNode ref={ref} obj={obj} handlers={handlers} />;
    case "store_badge":
      return <StoreBadgeNode ref={ref} obj={obj} handlers={handlers} />;
    case "text":
      if (obj.highlightOn) {
        return (
          <Group ref={ref} {...props}>
            <Rect
              x={-8} y={-4}
              width={obj.width + 16}
              height={Math.max(obj.height || 40, (obj.fontSize || 48) * (obj.lineHeight || 1.15) + 12)}
              fill={obj.highlightColor || "rgba(0,0,0,0.65)"}
              cornerRadius={8}
            />
            <Text
              x={0} y={0}
              text={obj.text} fontFamily={obj.fontFamily || "Inter"} fontSize={obj.fontSize || 48}
              fontStyle={obj.fontWeight >= 700 ? "bold" : "normal"} fill={obj.fill || "#ffffff"} align={obj.align || "left"}
              width={obj.width} letterSpacing={obj.letterSpacing || 0} lineHeight={obj.lineHeight || 1.15}
              stroke={obj.strokeOn ? obj.stroke : undefined} strokeWidth={obj.strokeOn ? obj.strokeWidth || 2 : 0}
            />
          </Group>
        );
      }
      return (
        <Text
          ref={ref} {...props} text={obj.text} fontFamily={obj.fontFamily || "Inter"} fontSize={obj.fontSize || 48}
          fontStyle={obj.fontWeight >= 700 ? "bold" : "normal"} fill={obj.fill || "#ffffff"} align={obj.align || "left"}
          width={obj.width} letterSpacing={obj.letterSpacing || 0} lineHeight={obj.lineHeight || 1.15}
          stroke={obj.strokeOn ? obj.stroke : undefined} strokeWidth={obj.strokeOn ? obj.strokeWidth || 2 : 0}
        />
      );
    case "image":
      return img ? (
        <KImage ref={ref} {...props} image={img} width={obj.width} height={obj.height} cornerRadius={obj.cornerRadius || 0} />
      ) : (
        <Rect ref={ref} {...props} width={obj.width} height={obj.height} fill="#33384299" dash={[6, 6]} stroke="#666" strokeWidth={1} />
      );
    case "device":
      return <DeviceMockup ref={ref} obj={obj} handlers={handlers} />;
    default:
      return <Rect ref={ref} {...props} width={obj.width || 100} height={obj.height || 100} fill="#999" />;
  }
});

export default CanvasObjectNode;
