import type {
  CSSProperties,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { clsx } from "clsx";
import { Maximize2 } from "lucide-react";
import { LayoutMiniPreview } from "./LayoutMiniPreview";

interface Point {
  x: number;
  y: number;
}

interface DragState {
  pointerId?: number;
  startClientX: number;
  startClientY: number;
  startX: number;
  startY: number;
  width: number;
  height: number;
  moved: boolean;
}

interface ResizeState {
  pointerId?: number;
  startClientX: number;
  startClientY: number;
  startWidth: number;
  startHeight: number;
  startX: number;
  startY: number;
  moved: boolean;
}

interface DraggableLayoutPreviewProps {
  selectedAreaId?: string;
  onSelectArea?: (areaId: string) => void;
  compact?: boolean;
  className?: string;
  storageKey: string;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

const EDGE_GAP = 12;
const MOBILE_BOTTOM_GAP = 84;

function readStoredPosition(storageKey: string) {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Point;
    if (Number.isFinite(parsed.x) && Number.isFinite(parsed.y)) {
      return parsed;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

function saveStoredPosition(storageKey: string, position: Point) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(position));
  } catch {
    // Local storage can be unavailable in private contexts. Dragging still works for this session.
  }
}

function readStoredWidth(storageKey: string) {
  try {
    const raw = window.localStorage.getItem(`${storageKey}:width`);
    const parsed = raw ? Number(raw) : Number.NaN;
    return Number.isFinite(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function saveStoredWidth(storageKey: string, width: number) {
  try {
    window.localStorage.setItem(`${storageKey}:width`, String(Math.round(width)));
  } catch {
    // Local storage can be unavailable in private contexts. Resizing still works for this session.
  }
}

function clampPosition(position: Point, width: number, height: number, bottomGap: number) {
  const maxX = Math.max(EDGE_GAP, window.innerWidth - width - EDGE_GAP);
  const maxY = Math.max(EDGE_GAP, window.innerHeight - height - bottomGap);

  return {
    x: Math.min(maxX, Math.max(EDGE_GAP, position.x)),
    y: Math.min(maxY, Math.max(EDGE_GAP, position.y)),
  };
}

function clampWidth(width: number, minWidth: number, maxWidth: number) {
  const viewportMax = Math.max(minWidth, window.innerWidth - EDGE_GAP * 2);
  return Math.round(Math.min(maxWidth, viewportMax, Math.max(minWidth, width)));
}

function defaultPosition(width: number, height: number, compact: boolean) {
  const bottomGap = compact ? MOBILE_BOTTOM_GAP : EDGE_GAP;

  return clampPosition(
    {
      x: window.innerWidth - width - EDGE_GAP,
      y: compact ? window.innerHeight - height - bottomGap : 96,
    },
    width,
    height,
    bottomGap,
  );
}

function isResizeTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("[data-preview-resize]"));
}

export function DraggableLayoutPreview({
  selectedAreaId,
  onSelectArea,
  compact = false,
  className,
  storageKey,
  defaultWidth,
  minWidth,
  maxWidth,
}: DraggableLayoutPreviewProps) {
  const initialWidth = defaultWidth ?? (compact ? 84 : 260);
  const minPreviewWidth = minWidth ?? (compact ? 68 : 190);
  const maxPreviewWidth = maxWidth ?? (compact ? 150 : 380);
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | undefined>(undefined);
  const resizeRef = useRef<ResizeState | undefined>(undefined);
  const lastPositionRef = useRef<Point | undefined>(undefined);
  const lastWidthRef = useRef(initialWidth);
  const suppressClickRef = useRef(false);
  const [position, setPosition] = useState<Point>();
  const [previewWidth, setPreviewWidth] = useState(initialWidth);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const bottomGap = compact ? MOBILE_BOTTOM_GAP : EDGE_GAP;

  useLayoutEffect(() => {
    const storedWidth = readStoredWidth(storageKey);
    if (!storedWidth) {
      const width = clampWidth(initialWidth, minPreviewWidth, maxPreviewWidth);
      lastWidthRef.current = width;
      setPreviewWidth(width);
      return;
    }
    const width = clampWidth(storedWidth, minPreviewWidth, maxPreviewWidth);
    lastWidthRef.current = width;
    setPreviewWidth(width);
  }, [initialWidth, maxPreviewWidth, minPreviewWidth, storageKey]);

  useLayoutEffect(() => {
    const placePreview = () => {
      const rect = previewRef.current?.getBoundingClientRect();
      if (!rect || rect.width === 0 || rect.height === 0) return;

      setPosition((current) => {
        const next = current ?? readStoredPosition(storageKey) ?? defaultPosition(rect.width, rect.height, compact);
        const clamped = clampPosition(next, rect.width, rect.height, bottomGap);
        lastPositionRef.current = clamped;
        return clamped;
      });
    };

    placePreview();
    window.addEventListener("resize", placePreview);
    return () => window.removeEventListener("resize", placePreview);
  }, [bottomGap, compact, previewWidth, storageKey]);

  const startDrag = (clientX: number, clientY: number, pointerId?: number) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0 || dragRef.current || resizeRef.current) return;

    const current = position ?? { x: rect.left, y: rect.top };
    dragRef.current = {
      pointerId,
      startClientX: clientX,
      startClientY: clientY,
      startX: current.x,
      startY: current.y,
      width: rect.width,
      height: rect.height,
      moved: false,
    };
    lastPositionRef.current = current;
    setPosition(current);
    setDragging(true);
  };

  const moveDrag = (clientX: number, clientY: number, preventDefault?: () => void) => {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = clientX - drag.startClientX;
    const dy = clientY - drag.startClientY;
    const moved = drag.moved || Math.abs(dx) + Math.abs(dy) > 5;
    drag.moved = moved;

    if (!moved) return;

    preventDefault?.();
    const next = clampPosition({ x: drag.startX + dx, y: drag.startY + dy }, drag.width, drag.height, bottomGap);
    lastPositionRef.current = next;
    setPosition(next);
  };

  const finishDrag = () => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 120);
    }

    if (lastPositionRef.current) {
      saveStoredPosition(storageKey, lastPositionRef.current);
    }

    dragRef.current = undefined;
    setDragging(false);
  };

  const startResize = (clientX: number, clientY: number, pointerId?: number) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0 || dragRef.current || resizeRef.current) return;

    const current = position ?? { x: rect.left, y: rect.top };
    resizeRef.current = {
      pointerId,
      startClientX: clientX,
      startClientY: clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      startX: current.x,
      startY: current.y,
      moved: false,
    };
    lastPositionRef.current = current;
    setPosition(current);
    setResizing(true);
  };

  const moveResize = (clientX: number, clientY: number, preventDefault?: () => void) => {
    const resize = resizeRef.current;
    if (!resize) return;

    const dx = clientX - resize.startClientX;
    const dy = clientY - resize.startClientY;
    const moved = resize.moved || Math.abs(dx) + Math.abs(dy) > 5;
    resize.moved = moved;

    if (!moved) return;

    preventDefault?.();
    const dominantDelta = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    const nextWidth = clampWidth(resize.startWidth + dominantDelta, minPreviewWidth, maxPreviewWidth);
    const nextHeight = resize.startHeight * (nextWidth / resize.startWidth);
    const nextPosition = clampPosition({ x: resize.startX, y: resize.startY }, nextWidth, nextHeight, bottomGap);
    lastPositionRef.current = nextPosition;
    lastWidthRef.current = nextWidth;
    setPreviewWidth(nextWidth);
    setPosition(nextPosition);
  };

  const finishResize = () => {
    const resize = resizeRef.current;
    if (!resize) return;

    if (resize.moved) {
      suppressClickRef.current = true;
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 120);
    }

    if (lastPositionRef.current) {
      saveStoredPosition(storageKey, lastPositionRef.current);
    }
    saveStoredWidth(storageKey, lastWidthRef.current);

    resizeRef.current = undefined;
    setResizing(false);
  };

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    if (isResizeTarget(event.target)) {
      startResize(event.clientX, event.clientY, event.pointerId);
    } else {
      startDrag(event.clientX, event.clientY, event.pointerId);
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;
    if (resize && resize.pointerId === event.pointerId) {
      moveResize(event.clientX, event.clientY, () => event.preventDefault());
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    moveDrag(event.clientX, event.clientY, () => event.preventDefault());
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;
    if (resize && resize.pointerId === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
      finishResize();
      return;
    }
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    finishDrag();
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || dragRef.current || resizeRef.current) return;
    const resizeTarget = isResizeTarget(event.target);
    if (resizeTarget) {
      startResize(event.clientX, event.clientY);
    } else {
      startDrag(event.clientX, event.clientY);
    }

    const move = (moveEvent: MouseEvent) => {
      if (resizeTarget) {
        moveResize(moveEvent.clientX, moveEvent.clientY, () => moveEvent.preventDefault());
      } else {
        moveDrag(moveEvent.clientX, moveEvent.clientY, () => moveEvent.preventDefault());
      }
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      if (resizeTarget) {
        finishResize();
      } else {
        finishDrag();
      }
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up, { once: true });
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (dragRef.current || resizeRef.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    const resizeTarget = isResizeTarget(event.target);
    if (resizeTarget) {
      startResize(touch.clientX, touch.clientY);
    } else {
      startDrag(touch.clientX, touch.clientY);
    }

    const move = (moveEvent: TouchEvent) => {
      const nextTouch = moveEvent.touches[0];
      if (!nextTouch) return;
      if (resizeTarget) {
        moveResize(nextTouch.clientX, nextTouch.clientY, () => moveEvent.preventDefault());
      } else {
        moveDrag(nextTouch.clientX, nextTouch.clientY, () => moveEvent.preventDefault());
      }
    };
    const end = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
      if (resizeTarget) {
        finishResize();
      } else {
        finishDrag();
      }
    };

    window.addEventListener("touchmove", move, { passive: false });
    window.addEventListener("touchend", end);
    window.addEventListener("touchcancel", end);
  };

  const handleClickCapture = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) return;
    event.preventDefault();
    event.stopPropagation();
  };

  const fallbackStyle = position ? { left: position.x, top: position.y } : { right: EDGE_GAP, bottom: bottomGap };
  const previewStyle: CSSProperties = { ...fallbackStyle, width: previewWidth };
  const interactionClass = resizing ? "cursor-nwse-resize" : dragging ? "cursor-grabbing" : "cursor-grab";

  return (
    <div
      ref={previewRef}
      className={clsx("fixed z-40 touch-none select-none", interactionClass, className)}
      style={previewStyle}
      onPointerDownCapture={handlePointerDown}
      onPointerMoveCapture={handlePointerMove}
      onPointerUpCapture={handlePointerUp}
      onMouseDownCapture={handleMouseDown}
      onTouchStartCapture={handleTouchStart}
      onClickCapture={handleClickCapture}
      title="ドラッグで移動"
    >
      <LayoutMiniPreview compact={compact} fluid selectedAreaId={selectedAreaId} onSelectArea={onSelectArea} />
      <button
        type="button"
        data-preview-resize
        className={clsx(
          "focus-ring absolute bottom-1 right-1 z-50 grid place-items-center rounded-full border border-slate-200 bg-white/95 text-slate-700 shadow-sm backdrop-blur transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950/90 dark:text-slate-200 dark:hover:bg-slate-800",
          compact ? "h-6 w-6" : "h-8 w-8",
        )}
        aria-label="PiPのサイズを変更"
        title="ドラッグでサイズ変更"
      >
        <Maximize2 size={compact ? 12 : 15} />
      </button>
    </div>
  );
}
