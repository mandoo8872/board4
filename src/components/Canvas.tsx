import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Text, Image, Circle, Rect, Line, Transformer, Path } from 'react-konva';
import type { CanvasObject, Point, Size, ViewCam, Stroke } from '../types/types';
import { calculateScale, snapToGrid, createStroke, interpolatePoints, simplifyPoints } from '../lib/drawUtils';
import getStroke from 'perfect-freehand';

interface CanvasProps {
  objects: CanvasObject[];
  strokes: Stroke[];
  viewCam: ViewCam;
  selectedObjectId: string | null;
  onObjectSelect: (object: CanvasObject | null) => void;
  onCanvasClick?: (point: Point) => void;
  isDrawing?: boolean;
  drawingColor?: string;
  drawingWidth?: number;
  eraserWidth?: number;
  onStrokeComplete?: (stroke: Stroke) => void;
  onObjectTransform?: (objectId: string, transform: { position?: Point; size?: Size; rotation?: number }) => void;
  gridSize?: number;
  baseResolution: { width: number; height: number };
}

const Canvas: React.FC<CanvasProps> = ({
  objects,
  strokes,
  viewCam,
  selectedObjectId,
  onObjectSelect,
  onCanvasClick,
  isDrawing = false,
  drawingColor = '#000000',
  drawingWidth = 2,
  eraserWidth = 24,
  onStrokeComplete,
  onObjectTransform,
  gridSize = 20,
  baseResolution,
}) => {
  const [canvasSize, setCanvasSize] = useState<Size>({ width: 800, height: 600 });
  const [currentPoints, setCurrentPoints] = useState<Point[]>([]);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [cursorPos, setCursorPos] = useState<Point | null>(null);
  const stageRef = useRef<any>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    const updateCanvasSize = () => {
      if (wrapperRef.current) {
        setCanvasSize({
          width: wrapperRef.current.offsetWidth,
          height: wrapperRef.current.offsetHeight,
        });
      }
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    setIsDrawingMode(isDrawing);
  }, [isDrawing]);

  useEffect(() => {
    if (transformerRef.current && selectedObjectId) {
      const selectedNode = stageRef.current.findOne(`#${selectedObjectId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      }
    }
  }, [selectedObjectId]);

  // 기준 해상도 좌표계로 변환하는 함수
  const toBaseCoord = (clientX: number, clientY: number) => {
    if (!wrapperRef.current) return { x: 0, y: 0 };
    const rect = wrapperRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    const scale = Math.min(
      rect.width / baseResolution.width,
      rect.height / baseResolution.height
    );
    return {
      x: relX / scale,
      y: relY / scale,
    };
  };

  // 마우스/터치 이벤트에서 좌표 변환 적용
  const handleMouseDown = (e: any) => {
    const { x, y } = toBaseCoord(e.evt.clientX, e.evt.clientY);
    if (isDrawingMode) {
      setCurrentPoints([{ x, y }]);
    } else if (onCanvasClick) {
      onCanvasClick({ x, y });
    }
  };

  const handleMouseMove = (e: any) => {
    if (isDrawingMode && currentPoints.length > 0) {
      const { x, y } = toBaseCoord(e.evt.clientX, e.evt.clientY);
      const lastPoint = currentPoints[currentPoints.length - 1];
      const interpolatedPoints = interpolatePoints(lastPoint, { x, y });
      setCurrentPoints([...currentPoints, ...interpolatedPoints]);
    }
  };

  const handleMouseUp = () => {
    if (isDrawingMode && currentPoints.length > 0) {
      const stroke = createStroke(currentPoints, drawingColor, drawingWidth, drawingColor === '#ffffff' ? 'eraser' : 'pencil');
      if (onStrokeComplete) {
        onStrokeComplete(stroke);
      }
      setCurrentPoints([]);
    }
  };

  const handleTouchStart = (e: any) => {
    e.evt.preventDefault();
    const touch = e.evt.touches[0];
    const { x, y } = toBaseCoord(touch.clientX, touch.clientY);
    if (isDrawingMode) {
      setCurrentPoints([{ x, y }]);
    } else if (onCanvasClick) {
      onCanvasClick({ x, y });
    }
  };

  const handleTouchMove = (e: any) => {
    e.evt.preventDefault();
    if (isDrawingMode && currentPoints.length > 0) {
      const touch = e.evt.touches[0];
      const { x, y } = toBaseCoord(touch.clientX, touch.clientY);
      const lastPoint = currentPoints[currentPoints.length - 1];
      const interpolatedPoints = interpolatePoints(lastPoint, { x, y });
      setCurrentPoints([...currentPoints, ...interpolatedPoints]);
    }
  };

  const handleTouchEnd = () => {
    if (isDrawingMode && currentPoints.length > 0) {
      const stroke = createStroke(currentPoints, drawingColor, drawingWidth, drawingColor === '#ffffff' ? 'eraser' : 'pencil');
      if (onStrokeComplete) {
        onStrokeComplete(stroke);
      }
      setCurrentPoints([]);
    }
  };

  const handleObjectClick = (objectId: string) => {
    const object = objects.find(obj => obj.id === objectId);
    onObjectSelect(object || null);
  };

  const handleDragStart = (e: any) => {
    const objectId = e.target.id();
    const object = objects.find(obj => obj.id === objectId);
    if (object) {
      onObjectSelect(object);
    }
  };

  const handleDragEnd = (e: any) => {
    const objectId = e.target.id();
    if (onObjectTransform) {
      const position = snapToGrid({
        x: e.target.x(),
        y: e.target.y(),
      });
      onObjectTransform(objectId, { position });
    }
  };

  const handleTransform = (e: any) => {
    const node = e.target;
    const objectId = node.id();
    const object = objects.find(obj => obj.id === objectId);
    if (!object || !onObjectTransform) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const rotation = node.rotation();
    const position = snapToGrid({
      x: node.x(),
      y: node.y(),
    });

    onObjectTransform(objectId, {
      position,
      size: {
        width: object.size.width * scaleX,
        height: object.size.height * scaleY,
      },
      rotation,
    });

    // Reset scale to avoid accumulation
    node.scaleX(1);
    node.scaleY(1);
  };

  // 마우스 이동 시 커서 위치 추적
  const handleStageMouseMove = (e: any) => {
    const { x, y } = toBaseCoord(e.evt.clientX, e.evt.clientY);
    setCursorPos({ x, y });
  };
  const handleStageMouseLeave = () => setCursorPos(null);

  const renderObject = (object: CanvasObject) => {
    const isSelected = object.id === selectedObjectId;
    const commonProps = {
      id: object.id,
      x: object.position.x,
      y: object.position.y,
      width: object.size.width,
      height: object.size.height,
      rotation: object.rotation,
      onClick: () => handleObjectClick(object.id),
      onTap: () => handleObjectClick(object.id),
      draggable: !isDrawingMode,
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd,
      onTransformEnd: handleTransform,
    };

    switch (object.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={object.properties.text}
            fontSize={20}
            fill="#000000"
            stroke={isSelected ? '#2196f3' : 'transparent'}
            strokeWidth={2}
          />
        );
      case 'image':
        return (
          <Image
            {...commonProps}
            image={new window.Image()}
            stroke={isSelected ? '#2196f3' : 'transparent'}
            strokeWidth={2}
          />
        );
      case 'shape':
        const shapeType = object.properties.shapeType;
        if (shapeType === 'circle') {
          return (
            <Circle
              {...commonProps}
              radius={object.size.width / 2}
              fill="#ffffff"
              stroke={isSelected ? '#2196f3' : '#000000'}
              strokeWidth={2}
            />
          );
        }
        return (
          <Rect
            {...commonProps}
            fill="#ffffff"
            stroke={isSelected ? '#2196f3' : '#000000'}
            strokeWidth={2}
          />
        );
      case 'button':
        return (
          <Rect
            {...commonProps}
            fill="#ffffff"
            stroke={isSelected ? '#2196f3' : '#000000'}
            strokeWidth={2}
            cornerRadius={4}
          />
        );
      default:
        return null;
    }
  };

  // 스케일 계산
  const scale = Math.min(
    canvasSize.width / baseResolution.width,
    canvasSize.height / baseResolution.height
  );

  // 그리드 렌더링 함수
  const renderGrid = () => {
    const lines = [];
    const { width, height } = baseResolution;
    for (let x = 0; x <= width; x += gridSize) {
      lines.push(
        <Line
          key={`v-${x}`}
          points={[x, 0, x, height]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }
    for (let y = 0; y <= height; y += gridSize) {
      lines.push(
        <Line
          key={`h-${y}`}
          points={[0, y, width, y]}
          stroke="#e0e0e0"
          strokeWidth={1}
        />
      );
    }
    return lines;
  };

  // perfect-freehand 결과를 SVG path로 변환
  function getSvgPathFromStroke(stroke: number[][]) {
    if (!stroke.length) return '';
    const d = stroke.map((point, i) => {
      const [x, y] = point;
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    }).join(' ');
    return d + ' Z';
  }

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* 커스텀 커서 */}
      {((isDrawingMode && drawingColor !== '#ffffff') || (isDrawingMode && drawingColor === '#ffffff')) && cursorPos && (
        <div
          style={{
            position: 'absolute',
            left: `calc(${(cursorPos.x * scale).toFixed(2)}px - ${(drawingColor === '#ffffff' ? eraserWidth : drawingWidth) / 2}px)` ,
            top: `calc(${(cursorPos.y * scale).toFixed(2)}px - ${(drawingColor === '#ffffff' ? eraserWidth : drawingWidth) / 2}px)` ,
            pointerEvents: 'none',
            zIndex: 10,
            width: drawingColor === '#ffffff' ? eraserWidth : drawingWidth,
            height: drawingColor === '#ffffff' ? eraserWidth : drawingWidth,
            borderRadius: '50%',
            background: drawingColor === '#ffffff' ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.0)',
            border: drawingColor === '#ffffff'
              ? '2px solid #888'
              : '2px solid #222',
            boxSizing: 'border-box',
            transition: 'background 0.1s',
          }}
        >
          {drawingColor !== '#ffffff' && (
            <svg width={drawingWidth} height={drawingWidth} style={{ display: 'block' }}>
              <path d="M2,18 Q8,2 18,2" stroke="#222" strokeWidth="2" fill="none" />
            </svg>
          )}
        </div>
      )}
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={e => { handleMouseMove(e); handleStageMouseMove(e); }}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseLeave={handleStageMouseLeave}
      >
        {/* 일반 레이어 (배경, 그리드, 오브젝트, 연필) */}
        <Layer
          x={0}
          y={0}
          scale={{ x: scale, y: scale }}
        >
          {/* 배경 */}
          <Rect
            x={0}
            y={0}
            width={baseResolution.width}
            height={baseResolution.height}
            fill="#f8f8f8"
            listening={false}
          />
          {/* 그리드 */}
          {renderGrid()}
          {/* 오브젝트/트랜스포머 */}
          {objects.map(renderObject)}
          {/* 연필(필기) stroke만 Path로 렌더 */}
          {strokes.filter(s => s.tool !== 'eraser').map((stroke, index) => {
            const pfStroke = getStroke(stroke.points, { size: drawingWidth, thinning: 0.7, smoothing: 0.7, streamline: 0.5 });
            const pathData = getSvgPathFromStroke(pfStroke);
            return (
              <Path
                key={`stroke_${index}`}
                data={pathData}
                stroke={stroke.color}
                strokeWidth={1}
                lineCap="round"
                lineJoin="round"
                fillEnabled={false}
              />
            );
          })}
          {isDrawingMode && currentPoints.length > 0 && (
            (() => {
              const pfStroke = getStroke(currentPoints, { size: drawingWidth, thinning: 0.7, smoothing: 0.7, streamline: 0.5 });
              const pathData = getSvgPathFromStroke(pfStroke);
              return (
                <Path
                  data={pathData}
                  stroke={drawingColor}
                  strokeWidth={1}
                  lineCap="round"
                  lineJoin="round"
                  fillEnabled={false}
                />
              );
            })()
          )}
          {selectedObjectId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // 최소 크기 제한
                if (newBox.width < 5 || newBox.height < 5) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          )}
        </Layer>
        {/* 지우개 stroke만 별도 레이어에 destination-out으로 Path로 렌더 */}
        <Layer x={0} y={0} scale={{ x: scale, y: scale }} globalCompositeOperation="destination-out">
          {strokes.filter(s => s.tool === 'eraser').map((stroke, index) => {
            const pfStroke = getStroke(stroke.points, { size: eraserWidth, thinning: 0.7, smoothing: 0.7, streamline: 0.5 });
            const pathData = getSvgPathFromStroke(pfStroke);
            return (
              <Path
                key={`eraser_${index}`}
                data={pathData}
                stroke="#ffffff"
                strokeWidth={1}
                lineCap="round"
                lineJoin="round"
                fillEnabled={false}
              />
            );
          })}
          {isDrawingMode && drawingColor === '#ffffff' && currentPoints.length > 0 && (
            (() => {
              const pfStroke = getStroke(currentPoints, { size: eraserWidth, thinning: 0.7, smoothing: 0.7, streamline: 0.5 });
              const pathData = getSvgPathFromStroke(pfStroke);
              return (
                <Path
                  data={pathData}
                  stroke="#ffffff"
                  strokeWidth={1}
                  lineCap="round"
                  lineJoin="round"
                  fillEnabled={false}
                />
              );
            })()
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas; 