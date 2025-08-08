import { useEffect, useState } from "react";

export default function SplitLines() {
  // ======== STATE TO STORE CURRENT MOUSE POSITION ========
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // console.log("component mounted");
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY }); // ===== UPDATE POSITION ON MOUSE MOVE ======
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return (
    <div className="cursor-pointer">
      {/* ======== VERTICAL LINE - FOLLOW MOUSE'S X POSTION ========== */}
      <div
        className="fixed top-0 h-screen w-0.5 bg-[#768ba1] z-[9999]"
        style={{ left: `${mousePosition.x}px` }} // ====== MOVES HORIZONTALLY ======
      />
      {/* ======== HORIZONTAL LINE - FOLLOW MOUSE'S Y POSITION ========== */}
      <div
        className="fixed left-0 w-screen h-0.5 bg-[#768ba1] z-[9999]"
        style={{ top: `${mousePosition.y}px` }} // ====== MOVES VERTICALLY ======
      />
    </div>
  );
}
