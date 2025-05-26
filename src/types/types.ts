export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ViewCam {
  position: Point;
  scale: number;
}

export interface CanvasObject {
  id: string;
  type: 'text' | 'image' | 'shape' | 'button';
  position: Point;
  size: Size;
  rotation: number;
  zIndex: number;
  properties: {
    text?: string;
    imageUrl?: string;
    shapeType?: 'rectangle' | 'circle' | 'triangle';
    buttonType?: 'pencil' | 'eraser';
    [key: string]: any;
  };
}

export interface Stroke {
  points: Point[];
  color: string;
  width: number;
  tool: 'pencil' | 'eraser';
}

export interface BoardState {
  objects: CanvasObject[];
  strokes: Stroke[];
}

export interface StorageData {
  boardState: BoardState;
  lastModified: number;
} 