export interface IMousePosition {
  x: number;
  y: number;
}

// export interface IPill {
//   pillId: number;
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   color: string;
//   originalId?: number; // To track splits from the same original pill
// }

export interface IPill {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  originalRadius: number;
}