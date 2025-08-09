import { useEffect, useState } from "react";
import type { IMousePosition } from "../types/types";

export default function SplitLines() {
  // ======== STATE TO STORE CURRENT MOUSE POSITION ========
  const [mousePosition, setMousePosition] = useState<IMousePosition>({ x: 0, y: 0 });

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



// import { useEffect, useRef, useState } from "react";
// import SplitLines from "./SplitLines";
// import type { IMousePosition, IPill } from "../types/types";
// import { getRandomColor } from "../utils/getRandomColor";

// export default function PillSplitter() {
//   const [pills, setPills] = useState<IPill[]>([]); // ====== TO STORE ALL CREATED PILL =====
//   const [isDrawing, setIsDrawing] = useState<boolean>(false); // ====== TO TRACK IF WE ARE DRAWING A PILL =====
//   const [draggingPillId, setDraggingPillId] = useState<number | null>(null);

//   const startRef = useRef<IMousePosition | null>(null); // ====== REF TO STORE START POSITION OF PILL DRAWING =====
//   const dragOffset = useRef<IMousePosition>({ x: 0, y: 0 });
//   const currentPillId = useRef<number>(0); // ====== REF TO TRACK CURRENT PILL ID =====

//   // ======= HANDLE WHEN MOUSE IS PRESSED / START DRAGGING =======
//   // ===== TO DRAW NEW PILL // ✅ Handle mousedown on background (to draw new pill) =======
//   const handleMouseDown = (e: React.MouseEvent) => {
//     const target = e.target as HTMLElement;
//     if (target.dataset.pill === "true") return; // 🛑 If clicked on a pill, don't draw

//     startRef.current = { x: e.clientX, y: e.clientY };
//     setIsDrawing(true);
//   };

//   // ======= HANDLE WHEN MOUSE IS RELEASED / STOP DRAGGING =======
//   // ✅ Handle mouseup to finish drawing pill
//   const handleMouseUp = (e: MouseEvent) => {
//     if (isDrawing && startRef.current) {
//       const end = { x: e.clientX, y: e.clientY };
//       const width = Math.max(Math.abs(end.x - startRef.current.x), 40);
//       const height = Math.max(Math.abs(end.y - startRef.current.y), 40);

//       const newPill: IPill = {
//         pillId: currentPillId.current++,
//         x: Math.min(startRef.current.x, end.x),
//         y: Math.min(startRef.current.y, end.y),
//         width,
//         height,
//         color: getRandomColor(),
//       };

//       setPills((prevPills) => [...prevPills, newPill]);
//       setIsDrawing(false);
//       startRef.current = null;
//     }
//     // if (!isDrawing || !startRef.current) return;

//     // const end = { x: e.clientX, y: e.clientY };
//     // const width = Math.max(Math.abs(end.x - startRef.current.x), 40);
//     // const height = Math.max(Math.abs(end.y - startRef.current.y), 40);

//     // const newPill: IPill = {
//     //   pillId: crrentPillId.current++,
//     //   x: Math.min(startRef.current.x, end.x),
//     //   y: Math.min(startRef.current.y, end.y),
//     //   width,
//     //   height,
//     //   color: getRandomColor(),
//     // };

//     // setPills((prevPills) => [...prevPills, newPill]);
//     // setIsDrawing(false);
//     // startRef.current = null;
//     setDraggingPillId(null);
//   };

//   // const handleDragStart = (e: React.MouseEvent, id: number) => {
//   //   const pill = pills.find((p) => p.pillId === id);
//   //   if (!pill) return;

//   //   setDraggingPillId(id);
//   //   dragOffset.current = {
//   //     x: e.clientX - pill.x,
//   //     y: e.clientY - pill.y,
//   //   };
//   // };

//   // ====== UPDATE PILL POSITION ON MOUSE MOVE ======
//   const handleMouseMove = (e: MouseEvent) => {
//     // if (draggingPillId === null) return;

//     // setPills((prev) =>
//     //   prev.map((pill) =>
//     //     pill.pillId === draggingPillId
//     //       ? {
//     //           ...pill,
//     //           x: e.clientX - dragOffset.current.x,
//     //           y: e.clientY - dragOffset.current.y,
//     //         }
//     //       : pill
//     //   )
//     // );
//     if (draggingPillId !== null) {
//       setPills((prevPills) =>
//         prevPills.map((pill) =>
//           pill.pillId === draggingPillId
//             ? {
//                 ...pill,
//                 x: e.clientX - dragOffset.current.x,
//                 y: e.clientY - dragOffset.current.y,
//               }
//             : pill
//         )
//       );
//     }
//   };

//    // ✅ Handle mousedown on a pill to start dragging
//   const handleDragStart = (e: MouseEvent, id: number) => {
//     e.stopPropagation(); // prevent triggering draw mode
//     const pill = pills.find((p) => p.pillId === id);
//     if (!pill) return;

//     dragOffset.current = {
//       x: e.clientX - pill.x,
//       y: e.clientY - pill.y,
//     };
//     setDraggingPillId(id);
//   };

//   // ✅ Global listeners for mousemove/mouseup
//   useEffect(() => {
//     window.addEventListener("mousemove", handleMouseMove);
//     window.addEventListener("mouseup", handleMouseUp);

//     return () => {
//       window.removeEventListener("mousemove", handleMouseMove);
//       window.removeEventListener("mouseup", handleMouseUp);
//     };
//   });

//   return (
//     <div
//       className="bg-[#bedaff] h-screen w-screen relative overflow-hidden"
//       onMouseDown={handleMouseDown}
//       // onMouseUp={handleMouseUp}
//       // onMouseMove={handleMouseMove}
//     >
//       <SplitLines />
//       {pills.map((pill) => (
//         <div
//           key={pill.pillId}
//           data-pill="true"
//           data-pill-id={pill.pillId}
//           onMouseDown={(e) => handleDragStart(e, pill.pillId)}
//           className="absolute cursor-pointer rounded-[20px] opacity-70 border border-[#899f93]"
//           style={{
//             top: pill.y,
//             left: pill.x,
//             width: pill.width,
//             height: pill.height,
//             backgroundColor: pill.color,
//           }}
//         />
//       ))}
//     </div>
//   );
// }

