import type { IMousePosition } from "../types/types";

export default function SplitLines({
  mousePosition,
}: {
  mousePosition: IMousePosition;
}) {
  // ======== STATE TO STORE CURRENT MOUSE POSITION ========

  return (
    <>
      {/* ======== VERTICAL LINE - FOLLOW MOUSE'S X POSTION ========== */}
      <div
        className="absolute top-0 h-screen w-0.5 bg-[#768ba1] pointer-events-none z-[9999]"
        style={{ left: `${mousePosition.x}px` }} // ====== MOVES HORIZONTALLY ======
      />
      {/* ======== HORIZONTAL LINE - FOLLOW MOUSE'S Y POSITION ========== */}
      <div
        className="absolute left-0 w-screen h-0.5 bg-[#768ba1] pointer-events-none z-[9999]"
        style={{ top: `${mousePosition.y}px` }} // ====== MOVES VERTICALLY ======
      />
    </>
  );
}