import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import type { BoardState, CanvasObject, Point, Size, ViewCam, Stroke } from '../types/types';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import { PropertyPanel } from '../components/PropertyPanel';
import { loadBoardState, saveBoardState } from '../lib/storage';
import { snapToGrid, createNewObject } from '../lib/drawUtils';

const TOOLBAR_WIDTH = 32;
const CANVAS_MARGIN = 16;

const PageContainer = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  overflow: hidden;
`;

const ToolbarWrapper = styled.div`
  width: ${TOOLBAR_WIDTH}px;
  height: 100%;
  background: #fff;
  border-right: 1px solid #eee;
  z-index: 2;
`;

const CanvasWrapper = styled.div`
  flex: 1;
  height: calc(100vh - ${CANVAS_MARGIN}px);
  width: calc(100vw - ${TOOLBAR_WIDTH}px - ${CANVAS_MARGIN}px);
  position: relative;
  z-index: 1;
  margin: ${CANVAS_MARGIN / 2}px;
  overflow: hidden;
`;

// 두 점 사이 거리 계산
function distance(p1: { x: number; y: number }, p2: { x: number; y: number }) {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// 지우개 경로와 stroke가 가까운지 판단
function isStrokeErased(eraserPoints: { x: number; y: number }[], strokePoints: { x: number; y: number }[], threshold = 16) {
  return strokePoints.some(sp => eraserPoints.some(ep => distance(ep, sp) < threshold));
}

// 지우개 경로와 객체가 겹치는지 판단 (bounding box)
function isObjectErased(eraserPoints: { x: number; y: number }[], obj: CanvasObject, threshold = 16) {
  return eraserPoints.some(ep =>
    ep.x >= obj.position.x - threshold &&
    ep.x <= obj.position.x + obj.size.width + threshold &&
    ep.y >= obj.position.y - threshold &&
    ep.y <= obj.position.y + obj.size.height + threshold
  );
}

export const AdminPage: React.FC = () => {
  const [boardState, setBoardState] = useState<{
    objects: CanvasObject[];
    strokes: Stroke[];
  }>({
    objects: [],
    strokes: [],
  });
  const [selectedTool, setSelectedTool] = useState<string>('select');
  const [selectedObject, setSelectedObject] = useState<CanvasObject | null>(null);
  const [viewCam, setViewCam] = useState<ViewCam>({
    position: { x: 0, y: 0 },
    scale: 1,
  });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingColor, setDrawingColor] = useState('#000000');
  const [drawingWidth, setDrawingWidth] = useState(2);
  const [eraserWidth, setEraserWidth] = useState(24);
  const [gridSize, setGridSize] = useState(20);
  const [baseResolution, setBaseResolution] = useState({ width: 1920, height: 1080 });

  useEffect(() => {
    const savedState = loadBoardState();
    if (savedState) {
      setBoardState(savedState);
    }
  }, []);

  useEffect(() => {
    const saveInterval = setInterval(() => {
      saveBoardState(boardState);
    }, 10000); // 10초마다 자동 저장

    return () => clearInterval(saveInterval);
  }, [boardState]);

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
    setSelectedObject(null);
    setIsDrawing(tool === 'pencil' || tool === 'eraser');
    if (tool === 'eraser') {
      setDrawingColor('#ffffff');
    } else if (tool === 'pencil') {
      setDrawingColor('#000000');
    }
  };

  const handleObjectSelect = (object: CanvasObject | null) => {
    setSelectedObject(object);
  };

  const handleCanvasClick = (point: Point) => {
    if (selectedTool === 'select') return;

    const newObject = createNewObject(selectedTool, point);
    if (newObject) {
      setBoardState(prev => ({
        ...prev,
        objects: [...prev.objects, newObject],
      }));
    }
  };

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedObject) return;

    const updatedObject = { ...selectedObject };
    if (property === 'position') {
      updatedObject.position = value as Point;
    } else if (property === 'size') {
      updatedObject.size = value as Size;
    } else {
      (updatedObject as any)[property] = value;
    }

    setBoardState(prev => ({
      ...prev,
      objects: prev.objects.map(obj =>
        obj.id === selectedObject.id ? updatedObject : obj
      ),
    }));
  };

  const handleStrokeComplete = (stroke: Stroke) => {
    if (stroke.tool === 'eraser') {
      // 벡터 단위 지우개: 필기와 객체 삭제
      setBoardState(prev => ({
        ...prev,
        strokes: prev.strokes.filter(s => !isStrokeErased(stroke.points, s.points)),
        objects: prev.objects.filter(obj => !isObjectErased(stroke.points, obj)),
      }));
    } else {
      setBoardState(prev => ({
        ...prev,
        strokes: [...prev.strokes, stroke],
      }));
    }
  };

  const handleObjectTransform = (objectId: string, transform: { position?: Point; size?: Size; rotation?: number }) => {
    setBoardState(prev => ({
      ...prev,
      objects: prev.objects.map(obj => {
        if (obj.id === objectId) {
          return {
            ...obj,
            position: transform.position || obj.position,
            size: transform.size || obj.size,
            rotation: transform.rotation !== undefined ? transform.rotation : obj.rotation,
          };
        }
        return obj;
      }),
    }));
  };

  return (
    <PageContainer>
      <ToolbarWrapper>
        <Toolbar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          drawingColor={drawingColor}
          drawingWidth={drawingWidth}
          onColorChange={setDrawingColor}
          onWidthChange={setDrawingWidth}
          eraserWidth={eraserWidth}
          onEraserWidthChange={setEraserWidth}
          gridSize={gridSize}
          onGridSizeChange={setGridSize}
          baseResolution={baseResolution}
          onBaseResolutionChange={setBaseResolution}
        />
      </ToolbarWrapper>
      <CanvasWrapper>
        <Canvas
          objects={boardState.objects}
          strokes={boardState.strokes}
          viewCam={viewCam}
          selectedObjectId={selectedObject?.id || null}
          onObjectSelect={handleObjectSelect}
          onCanvasClick={handleCanvasClick}
          isDrawing={isDrawing}
          drawingColor={drawingColor}
          drawingWidth={drawingWidth}
          eraserWidth={eraserWidth}
          onStrokeComplete={handleStrokeComplete}
          onObjectTransform={handleObjectTransform}
          gridSize={gridSize}
          baseResolution={baseResolution}
        />
      </CanvasWrapper>
      <PropertyPanel
        selectedObject={selectedObject}
        onPropertyChange={handlePropertyChange}
      />
    </PageContainer>
  );
}; 