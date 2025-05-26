import type { Point, Size, ViewCam, Stroke, CanvasObject } from '../types/types';

export const calculateScale = (
  containerSize: Size,
  baseResolution: Size
): number => {
  const scaleX = containerSize.width / baseResolution.width;
  const scaleY = containerSize.height / baseResolution.height;
  return Math.min(scaleX, scaleY);
};

export const calculateCanvasSize = (
  containerSize: Size,
  baseResolution: Size
): Size => {
  const scale = calculateScale(containerSize, baseResolution);
  return {
    width: baseResolution.width * scale,
    height: baseResolution.height * scale,
  };
};

export const calculateCanvasOffset = (
  containerSize: Size,
  canvasSize: Size
): Point => {
  return {
    x: (containerSize.width - canvasSize.width) / 2,
    y: (containerSize.height - canvasSize.height) / 2,
  };
};

export const screenToCanvasPoint = (
  screenPoint: Point,
  canvasOffset: Point,
  scale: number
): Point => {
  return {
    x: (screenPoint.x - canvasOffset.x) / scale,
    y: (screenPoint.y - canvasOffset.y) / scale,
  };
};

export const canvasToScreenPoint = (
  canvasPoint: Point,
  canvasOffset: Point,
  scale: number
): Point => {
  return {
    x: canvasPoint.x * scale + canvasOffset.x,
    y: canvasPoint.y * scale + canvasOffset.y,
  };
};

export const isPointInViewCam = (point: Point, viewCam: ViewCam): boolean => {
  const transformedPoint = {
    x: (point.x - viewCam.position.x) / viewCam.scale,
    y: (point.y - viewCam.position.y) / viewCam.scale,
  };
  return (
    transformedPoint.x >= 0 &&
    transformedPoint.x <= window.innerWidth / viewCam.scale &&
    transformedPoint.y >= 0 &&
    transformedPoint.y <= window.innerHeight / viewCam.scale
  );
};

export const snapToGrid = (point: Point, gridSize: number = 10): Point => {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
};

export const createStroke = (
  points: Point[],
  color: string = '#000000',
  width: number = 2,
  tool: 'pencil' | 'eraser' = 'pencil'
): Stroke => {
  return {
    points,
    color,
    width,
    tool,
  };
};

export const interpolatePoints = (p1: Point, p2: Point): Point[] => {
  const points: Point[] = [];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const steps = Math.max(Math.floor(distance), 1);

  for (let i = 0; i <= steps; i++) {
    points.push({
      x: p1.x + (dx * i) / steps,
      y: p1.y + (dy * i) / steps,
    });
  }

  return points;
};

export const simplifyPoints = (points: Point[], tolerance: number = 1): Point[] => {
  if (points.length <= 2) return points;

  const squaredDistance = (p1: Point, p2: Point) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return dx * dx + dy * dy;
  };

  const squaredDistanceToSegment = (p: Point, p1: Point, p2: Point) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = dx * dx + dy * dy;
    if (length === 0) return squaredDistance(p, p1);

    const t = Math.max(0, Math.min(1, (
      ((p.x - p1.x) * dx + (p.y - p1.y) * dy) / length
    )));

    const x = p1.x + t * dx;
    const y = p1.y + t * dy;
    return squaredDistance(p, { x, y });
  };

  const simplifySegment = (start: number, end: number): Point[] => {
    if (end - start <= 1) return [points[start]];

    let maxDistance = 0;
    let maxIndex = start;

    for (let i = start + 1; i < end; i++) {
      const distance = squaredDistanceToSegment(
        points[i],
        points[start],
        points[end]
      );
      if (distance > maxDistance) {
        maxDistance = distance;
        maxIndex = i;
      }
    }

    if (maxDistance > tolerance * tolerance) {
      const first = simplifySegment(start, maxIndex);
      const second = simplifySegment(maxIndex, end);
      return [...first, ...second.slice(1)];
    }

    return [points[start]];
  };

  const simplified = simplifySegment(0, points.length - 1);
  simplified.push(points[points.length - 1]);
  return simplified;
};

export const createNewObject = (type: string, position: Point): CanvasObject | null => {
  const id = `obj_${Date.now()}`;
  const size: Size = { width: 100, height: 100 };
  const snappedPosition = snapToGrid(position);

  switch (type) {
    case 'text':
      return {
        id,
        type: 'text',
        position: snappedPosition,
        size,
        rotation: 0,
        zIndex: 0,
        properties: {
          text: '새 텍스트',
        },
      };
    case 'image':
      return {
        id,
        type: 'image',
        position: snappedPosition,
        size,
        rotation: 0,
        zIndex: 0,
        properties: {
          imageUrl: '',
        },
      };
    case 'shape':
      return {
        id,
        type: 'shape',
        position: snappedPosition,
        size,
        rotation: 0,
        zIndex: 0,
        properties: {
          shapeType: 'rectangle',
        },
      };
    case 'button':
      return {
        id,
        type: 'button',
        position: snappedPosition,
        size,
        rotation: 0,
        zIndex: 0,
        properties: {
          buttonType: 'pencil',
        },
      };
    default:
      return null;
  }
}; 