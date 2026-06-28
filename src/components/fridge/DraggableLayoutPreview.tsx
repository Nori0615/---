import type {
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  TouchEvent as ReactTouchEvent,
} from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { clsx } from "clsx";
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

interface DraggableLayoutPreviewProps {
  selectedAreaId?: string;
  onSelectArea?: (areaId: string) => void;
  compact?: boolean;
  className?: string;
  storageKey: string;
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

function clampPosition(position: Point, width: number, height: number, bottomGap: number) {
  const maxX = Math.max(EDGE_GAP, window.innerWidth - width - EDGE_GAP);
  const maxY = Math.max(EDGE_GAP, window.innerHeight - height - bottomGap);

  return {
    x: Math.min(maxX, Math.max(EDGE_GAP, position.x)),
    y: Math.min(maxY, Math.max(EDGE_GAP, position.y)),
  };
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

export function DraggableLayoutPreview({ selectedAreaId, onSelectArea, compact = false, className, storageKey }: DraggableLayoutPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | undefined>(undefined);
  const lastPositionRef = useRef<Point | undefined>(undefined);
  const suppressClickRef = useRef(false);
  const [position, setPosition] = useState<Point>();
  const [dragging, setDragging] = useState(false);
  const bottomGap = compact ? MOBILE_BOTTOM_GAP : EDGE_GAP;

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
  }, [bottomGap, compact, storageKey]);

  const startDrag = (clientX: number, clientY: number, pointerId?: number) => {
    const rect = previewRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0 || dragRef.current) return;

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

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse") return;
    startDrag(event.clientX, event.clientY, event.pointerId);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    moveDrag(event.clientX, event.clientY, () => event.preventDefault());
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    finishDrag();
  };

  const handleMouseDown = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || dragRef.current) return;
    startDrag(event.clientX, event.clientY);

    const move = (moveEvent: MouseEvent) => {
      moveDrag(moveEvent.clientX, moveEvent.clientY, () => moveEvent.preventDefault());
    };
    const up = () => {
      window.removeEventListener("mousemove", move);
      finishDrag();
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up, { once: true });
  };

  const handleTouchStart = (event: ReactTouchEvent<HTMLDivElement>) => {
    if (dragRef.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    startDrag(touch.clientX, touch.clientY);

    const move = (moveEvent: TouchEvent) => {
      const nextTouch = moveEvent.touches[0];
      if (!nextTouch) return;
      moveDrag(nextTouch.clientX, nextTouch.clientY, () => moveEvent.preventDefault());
    };
    const end = () => {
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", end);
      window.removeEventListener("touchcancel", end);
      finishDrag();
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

  return (
    <div
      ref={previewRef}
      className={clsx("fixed z-40 touch-none select-none", dragging ? "cursor-grabbing" : "cursor-grab", className)}
      style={fallbackStyle}
      onPointerDownCapture={handlePointerDown}
      onPointerMoveCapture={handlePointerMove}
      onPointerUpCapture={handlePointerUp}
      onMouseDownCapture={handleMouseDown}
      onTouchStartCapture={handleTouchStart}
      onClickCapture={handleClickCapture}
      title="ドラッグで移動"
    >
      <LayoutMiniPreview compact={compact} selectedAreaId={selectedAreaId} onSelectArea={onSelectArea} />
    </div>
  );
}
