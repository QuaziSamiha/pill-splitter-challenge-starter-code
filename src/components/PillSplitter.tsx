import { useState, useRef, useCallback } from "react";
import type { IMousePosition, IPill } from "../types/types";
import SplitLines from "./SplitLines";
import { getRandomColor } from "../utils/getRandomColor";

const MIN_PILL_SIZE = 40;
const MIN_PART_SIZE = 20;
const BORDER_RADIUS = 20;

export default function PillSplitter() {
  const [pills, setPills] = useState<IPill[]>([]);
  const [mousePosition, setMousePosition] = useState<IMousePosition>({
    x: 0,
    y: 0,
  });
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [draggedPill, setDraggedPill] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [drawStart, setDrawStart] = useState<IMousePosition>({ x: 0, y: 0 });
  const [currentDraw, setCurrentDraw] = useState<IPill | null>(null);
  const [mouseDownPos, setMouseDownPos] = useState<IMousePosition>({
    x: 0,
    y: 0,
  });
  const [mouseDownTime, setMouseDownTime] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const generateId = (): string => Math.random().toString(36).substr(2, 9);

  const calculateBorderRadius = (pill: IPill): string => {
    // Ensure radius doesn't exceed half of the smallest dimension
    const maxRadius = Math.min(pill.width / 2, pill.height / 2);
    const actualRadius = Math.min(pill.originalRadius, maxRadius);
    return `${actualRadius}px`;
  };

  const getPillAtPosition = (x: number, y: number): IPill | null => {
    for (let i = pills.length - 1; i >= 0; i--) {
      const pill = pills[i];
      if (
        x >= pill.x &&
        x <= pill.x + pill.width &&
        y >= pill.y &&
        y <= pill.y + pill.height
      ) {
        return pill;
      }
    }
    return null;
  };

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setMousePosition({ x, y });

      // Handle drawing
      if (isDrawing && !isDragging) {
        const width = Math.abs(x - drawStart.x);
        const height = Math.abs(y - drawStart.y);

        if (width >= MIN_PILL_SIZE && height >= MIN_PILL_SIZE) {
          const newPill: IPill = {
            id: "temp",
            x: Math.min(drawStart.x, x),
            y: Math.min(drawStart.y, y),
            width,
            height,
            color: currentDraw?.color || getRandomColor(),
            originalRadius: BORDER_RADIUS,
          };
          setCurrentDraw(newPill);
        }
      }

      // Handle dragging
      if (isDragging && draggedPill) {
        setPills((prev) =>
          prev.map((pill) =>
            pill.id === draggedPill
              ? { ...pill, x: x - dragOffset.x, y: y - dragOffset.y }
              : pill
          )
        );
      }
    },
    [isDrawing, isDragging, drawStart, draggedPill, dragOffset, currentDraw]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setMouseDownPos({ x, y });
    setMouseDownTime(Date.now());

    // Check if clicking on a pill
    const clickedPill = getPillAtPosition(x, y);

    if (clickedPill) {
      // Prepare for potential dragging
      setDraggedPill(clickedPill.id);
      setDragOffset({
        x: x - clickedPill.x,
        y: y - clickedPill.y,
      });
    } else {
      // Start drawing new pill in empty space
      setIsDrawing(true);
      setDrawStart({ x, y });
      setCurrentDraw({
        id: "temp",
        x,
        y,
        width: 0,
        height: 0,
        color: getRandomColor(),
        originalRadius: BORDER_RADIUS,
      });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const timeDiff = Date.now() - mouseDownTime;
    const distance = Math.sqrt(
      Math.pow(x - mouseDownPos.x, 2) + Math.pow(y - mouseDownPos.y, 2)
    );

    // If we were drawing and created a valid pill
    if (
      isDrawing &&
      currentDraw &&
      currentDraw.width >= MIN_PILL_SIZE &&
      currentDraw.height >= MIN_PILL_SIZE
    ) {
      const newPill: IPill = {
        ...currentDraw,
        id: generateId(),
        cornerType: undefined, // ensure full border radius for newly drawn pill
      };
      setPills((prev) => [...prev, newPill]);
    }

    // If it was a quick click (not a drag), handle splitting
    if (draggedPill && timeDiff < 200 && distance < 10) {
      splitPillsAtPosition(mouseDownPos.x, mouseDownPos.y);
    }

    // Reset all states
    setIsDrawing(false);
    setIsDragging(false);
    setDraggedPill(null);
    setCurrentDraw(null);
  };

  const handleMouseMoveForDrag = useCallback(
    (e: React.MouseEvent) => {
      if (draggedPill && !isDrawing) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const distance = Math.sqrt(
          Math.pow(x - mouseDownPos.x, 2) + Math.pow(y - mouseDownPos.y, 2)
        );

        if (distance > 5) {
          setIsDragging(true);
        }
      }
    },
    [draggedPill, isDrawing, mouseDownPos]
  );

  const splitPillsAtPosition = (clickX: number, clickY: number): void => {
    setPills((prev) => {
      const newPills: IPill[] = [];

      prev.forEach((pill) => {
        const intersectsVertical =
          clickX >= pill.x && clickX <= pill.x + pill.width;
        const intersectsHorizontal =
          clickY >= pill.y && clickY <= pill.y + pill.height;
        const intersectsBoth = intersectsVertical && intersectsHorizontal;

        // Only assign cornerType if splitting a parent/original pill (cornerType is undefined)
        const assignCorners = pill.cornerType === undefined;

        if (intersectsBoth) {
          // Split the pill into 4 parts (clicked pill)
          const leftWidth = clickX - pill.x;
          const rightWidth = pill.width - leftWidth;
          const topHeight = clickY - pill.y;
          const bottomHeight = pill.height - topHeight;

          const parts: IPill[] = [];

          // Top-left
          if (leftWidth >= MIN_PART_SIZE && topHeight >= MIN_PART_SIZE) {
            parts.push({
              id: generateId(),
              x: pill.x,
              y: pill.y,
              width: leftWidth,
              height: topHeight,
              color: pill.color,
              originalRadius: pill.originalRadius,
              cornerType: assignCorners ? 'top-left' : undefined,
            });
          }

          // Top-right
          if (rightWidth >= MIN_PART_SIZE && topHeight >= MIN_PART_SIZE) {
            parts.push({
              id: generateId(),
              x: clickX,
              y: pill.y,
              width: rightWidth,
              height: topHeight,
              color: pill.color,
              originalRadius: pill.originalRadius,
              cornerType: assignCorners ? 'top-right' : undefined,
            });
          }

          // Bottom-left
          if (leftWidth >= MIN_PART_SIZE && bottomHeight >= MIN_PART_SIZE) {
            parts.push({
              id: generateId(),
              x: pill.x,
              y: clickY,
              width: leftWidth,
              height: bottomHeight,
              color: pill.color,
              originalRadius: pill.originalRadius,
              cornerType: assignCorners ? 'bottom-left' : undefined,
            });
          }

          // Bottom-right
          if (rightWidth >= MIN_PART_SIZE && bottomHeight >= MIN_PART_SIZE) {
            parts.push({
              id: generateId(),
              x: clickX,
              y: clickY,
              width: rightWidth,
              height: bottomHeight,
              color: pill.color,
              originalRadius: pill.originalRadius,
              cornerType: assignCorners ? 'bottom-right' : undefined,
            });
          }

          if (parts.length === 0) {
            // Move the pill if it can't be split
            const movedPill = { ...pill };
            if (leftWidth < MIN_PART_SIZE) {
              movedPill.x = clickX + 5;
            } else if (rightWidth < MIN_PART_SIZE) {
              movedPill.x = clickX - pill.width - 5;
            } else if (topHeight < MIN_PART_SIZE) {
              movedPill.y = clickY + 5;
            } else if (bottomHeight < MIN_PART_SIZE) {
              movedPill.y = clickY - pill.height - 5;
            }
            newPills.push(movedPill);
          } else {
            newPills.push(...parts);
          }
        } else if (intersectsVertical) {
          // Split vertically (vertical line passes through)
          const leftWidth = clickX - pill.x;
          const rightWidth = pill.width - leftWidth;

          if (leftWidth >= MIN_PART_SIZE && rightWidth >= MIN_PART_SIZE) {
            // Left part
            newPills.push({
              id: generateId(),
              x: pill.x,
              y: pill.y,
              width: leftWidth,
              height: pill.height,
              color: pill.color,
              originalRadius: pill.originalRadius,
              cornerType: assignCorners ? 'top-left' : undefined,
            });

            // Right part
            newPills.push({
              id: generateId(),
              x: clickX,
              y: pill.y,
              width: rightWidth,
              height: pill.height,
              color: pill.color,
              originalRadius: pill.originalRadius,
              cornerType: assignCorners ? 'top-right' : undefined,
            });
          } else {
            // Move the pill if it can't be split
            const movedPill = { ...pill };
            if (leftWidth < MIN_PART_SIZE) {
              movedPill.x = clickX + 5;
            } else {
              movedPill.x = clickX - pill.width - 5;
            }
            newPills.push(movedPill);
          }
        } else if (intersectsHorizontal) {
          // Split horizontally (horizontal line passes through)
          const topHeight = clickY - pill.y;
          const bottomHeight = pill.height - topHeight;

          if (topHeight >= MIN_PART_SIZE && bottomHeight >= MIN_PART_SIZE) {
            // Top part
            newPills.push({
              id: generateId(),
              x: pill.x,
              y: pill.y,
              width: pill.width,
              height: topHeight,
              color: pill.color,
              originalRadius: pill.originalRadius,
              cornerType: assignCorners ? 'top-left' : undefined,
            });

            // Bottom part
            newPills.push({
              id: generateId(),
              x: pill.x,
              y: clickY,
              width: pill.width,
              height: bottomHeight,
              color: pill.color,
              originalRadius: pill.originalRadius,
              cornerType: assignCorners ? 'bottom-left' : undefined,
            });
          } else {
            // Move the pill if it can't be split
            const movedPill = { ...pill };
            if (topHeight < MIN_PART_SIZE) {
              movedPill.y = clickY + 5;
            } else {
              movedPill.y = clickY - pill.height - 5;
            }
            newPills.push(movedPill);
          }
        } else {
          // No intersection, keep the pill as is
          newPills.push(pill);
        }
      });

      return newPills;
    });
  };

  return (
    <div className="w-full h-screen bg-[#bedaff] relative overflow-hidden">
      <div
        ref={containerRef}
        className="w-full h-full relative cursor-crosshair"
        onMouseMove={(e: React.MouseEvent) => {
          handleMouseMove(e);
          handleMouseMoveForDrag(e);
        }}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <SplitLines mousePosition={mousePosition} />

        {/* ===== RENDERNG EXISTING PILLS ========== */}
        {pills.map((pill) => {
          // If the pill is a newly drawn (not split) pill, give it full border radius
          let borderRadius = '0px';
          if (pill.cornerType === undefined) {
            borderRadius = calculateBorderRadius(pill);
          } else if (pill.cornerType === 'top-left') {
            borderRadius = `${pill.originalRadius}px 0 0 0`;
          } else if (pill.cornerType === 'top-right') {
            borderRadius = `0 ${pill.originalRadius}px 0 0`;
          } else if (pill.cornerType === 'bottom-left') {
            borderRadius = `0 0 0 ${pill.originalRadius}px`;
          } else if (pill.cornerType === 'bottom-right') {
            borderRadius = `0 0 ${pill.originalRadius}px 0`;
          }
          return (
            <div
              key={pill.id}
              className={`absolute border border-[#899f93] ${
                draggedPill === pill.id && isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
              }`}
              style={{
                left: pill.x,
                top: pill.y,
                width: pill.width,
                height: pill.height,
                backgroundColor: pill.color,
                borderRadius,
              }}
            />
          );
        })}

        {/* Current drawing pill */}
        {isDrawing &&
          currentDraw &&
          currentDraw.width >= MIN_PILL_SIZE &&
          currentDraw.height >= MIN_PILL_SIZE && (
            <div
              className="absolute border border-[#899f93] opacity-70"
              style={{
                left: currentDraw.x,
                top: currentDraw.y,
                width: currentDraw.width,
                height: currentDraw.height,
                backgroundColor: currentDraw.color,
                borderRadius: calculateBorderRadius(currentDraw),
              }}
            />
          )}
      </div>
    </div>
  );
}
