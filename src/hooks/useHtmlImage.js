import { useEffect, useState } from "react";

const cache = new Map();

export function useHtmlImage(src) {
  const [img, setImg] = useState(() => (src && cache.has(src) ? cache.get(src) : null));

  useEffect(() => {
    if (!src) {
      setImg(null);
      return;
    }
    if (cache.has(src)) {
      setImg(cache.get(src));
      return;
    }
    let cancelled = false;
    const el = new window.Image();
    el.onload = () => {
      if (cancelled) return;
      cache.set(src, el);
      setImg(el);
    };
    el.src = src;
    return () => {
      cancelled = true;
    };
  }, [src]);

  return img;
}
