import React, { forwardRef } from "react";
import { Rect, Ellipse, Line, RegularPolygon, Path, Text, Image as KImage, Group } from "react-konva";
import { blobPath, wavePath, ICONS } from "../constants.js";
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
  const radius = w * 0.11;
  const bezel = w * 0.045;
  const img = useHtmlImage(obj.imageSrc);
  return (
    <Group ref={ref} {...commonProps(obj, handlers)}>
      <Rect x={0} y={0} width={w} height={h} cornerRadius={radius} fill={frameColor} {...shadowProps(obj)} />
      <Group clipFunc={(ctx) => roundRectClip(ctx, bezel, bezel, w - bezel * 2, h - bezel * 2, radius * 0.6)}>
        <Rect x={bezel} y={bezel} width={w - bezel * 2} height={h - bezel * 2} fill="#dfe3ea" />
        {img ? (
          <KImage x={bezel} y={bezel} image={img} width={w - bezel * 2} height={h - bezel * 2} />
        ) : (
          <Text
            x={bezel} y={h / 2 - 10} width={w - bezel * 2} align="center"
            text="Drop a screenshot" fontSize={Math.max(12, w * 0.045)} fill="#8a93a3" fontFamily="Inter"
          />
        )}
      </Group>
      {obj.style === "phone-notch" && (
        <Rect
          x={(w - w * 0.34) / 2} y={bezel * 0.4} width={w * 0.34} height={Math.max(6, h * 0.018 * 3)}
          cornerRadius={20} fill={frameColor}
        />
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
    case "icon":
      return (
        <Path
          ref={ref} {...props} data={ICONS[obj.icon] || ICONS.star} fill={obj.fill}
          scaleX={(obj.width / 24) * (obj.scaleX || 1)} scaleY={(obj.height / 24) * (obj.scaleY || 1)}
        />
      );
    case "text":
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
