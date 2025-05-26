import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import type { BoardState, CanvasObject, Point, Size, ViewCam, Stroke } from '../types/types';
import Canvas from '../components/Canvas';
import Toolbar from '../components/Toolbar';
import { loadBoardState } from '../lib/storage';

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

export const ViewPage: React.FC = () => {
  const [boardState, setBoardState] = useState<{
    objects: CanvasObject[];
    strokes: Stroke[];
  }>({
    objects: [],
    strokes: [],
  });
  const [viewCam, setViewCam] = useState<ViewCam>({
    position: { x: 0, y: 0 },
    scale: 1,
  });
  const [selectedTool, setSelectedTool] = useState('pencil');
  const [gridSize, setGridSize] = useState(20);
  const [baseResolution, setBaseResolution] = useState({ width: 1920, height: 1080 });
  const [eraserWidth, setEraserWidth] = useState(24);

  useEffect(() => {
    const savedState = loadBoardState();
    if (savedState) {
      setBoardState(savedState);
    }
  }, []);

  const handleBoardStateChange = (newState: BoardState) => {
    setBoardState(newState);
  };

  const handleToolSelect = (tool: string) => {
    setSelectedTool(tool);
  };

  if (!boardState) {
    return (
      <PageContainer>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100%',
          fontSize: '24px',
          color: '#666'
        }}>
          로딩 중...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ToolbarWrapper>
        <Toolbar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          drawingColor="#000000"
          drawingWidth={2}
          onColorChange={() => {}}
          onWidthChange={() => {}}
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
          selectedObjectId={null}
          onObjectSelect={() => {}}
          gridSize={gridSize}
          baseResolution={baseResolution}
          eraserWidth={eraserWidth}
        />
      </CanvasWrapper>
    </PageContainer>
  );
}; 