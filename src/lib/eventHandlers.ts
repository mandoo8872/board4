import type { Point } from '../types/types';
import { screenToCanvasPoint, snapToGrid } from './drawUtils';

export const getMousePosition = (
  event: MouseEvent | TouchEvent,
  canvasOffset: Point,
  scale: number
): Point => {
  const clientX = 'touches' in event
    ? event.touches[0].clientX
    : event.clientX;
  const clientY = 'touches' in event
    ? event.touches[0].clientY
    : event.clientY;

  const screenPoint: Point = {
    x: clientX,
    y: clientY,
  };

  const canvasPoint = screenToCanvasPoint(screenPoint, canvasOffset, scale);
  return snapToGrid(canvasPoint);
};

export const getTouchPosition = (
  event: TouchEvent,
  canvasOffset: Point,
  scale: number
): Point => {
  return getMousePosition(event, canvasOffset, scale);
};

export const preventDefault = (event: Event): void => {
  event.preventDefault();
};

export const stopPropagation = (event: Event): void => {
  event.stopPropagation();
};

export const handleWheel = (
  event: WheelEvent,
  callback: (deltaX: number, deltaY: number) => void
): void => {
  event.preventDefault();
  callback(event.deltaX, event.deltaY);
}; 