import React from 'react';
import styled from 'styled-components';
import { ToolButtonObject } from './ToolButtonObject';

interface ToolbarProps {
  selectedTool: string;
  onToolSelect: (tool: string) => void;
  drawingColor: string;
  drawingWidth: number;
  onColorChange: (color: string) => void;
  onWidthChange: (width: number) => void;
  eraserWidth: number;
  onEraserWidthChange: (width: number) => void;
  gridSize: number;
  onGridSizeChange: (size: number) => void;
  baseResolution: { width: number; height: number };
  onBaseResolutionChange: (res: { width: number; height: number }) => void;
}

const ToolbarContainer = styled.div`
  width: 32px;
  background-color: #ffffff;
  border-right: 1px solid #e0e0e0;
  padding: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const ColorPicker = styled.input`
  width: 100%;
  height: 30px;
  margin: 5px 0;
  padding: 0;
  border: none;
  cursor: pointer;
`;

const WidthSlider = styled.input`
  width: 100%;
  margin: 5px 0;
`;

const Toolbar: React.FC<ToolbarProps> = ({
  selectedTool,
  onToolSelect,
  drawingColor,
  drawingWidth,
  onColorChange,
  onWidthChange,
  eraserWidth,
  onEraserWidthChange,
  gridSize,
  onGridSizeChange,
  baseResolution,
  onBaseResolutionChange,
}) => {
  const tools = [
    { id: 'select', icon: '👆', label: '선택' },
    { id: 'pencil', icon: '✏️', label: '연필' },
    { id: 'eraser', icon: '🧹', label: '지우개' },
    { id: 'text', icon: '📝', label: '텍스트' },
    { id: 'image', icon: '🖼️', label: '이미지' },
    { id: 'shape', icon: '⬜', label: '도형' },
    { id: 'button', icon: '🔘', label: '버튼' },
  ];

  return (
    <ToolbarContainer>
      {tools.map((tool) => (
        <ToolButtonObject
          key={tool.id}
          icon={tool.icon}
          label={tool.label}
          isSelected={selectedTool === tool.id}
          onClick={() => onToolSelect(tool.id)}
        />
      ))}
      {(selectedTool === 'pencil') && (
        <>
          <ColorPicker
            type="color"
            value={drawingColor}
            onChange={(e) => onColorChange(e.target.value)}
          />
          <WidthSlider
            type="range"
            min="1"
            max="20"
            value={drawingWidth}
            onChange={(e) => onWidthChange(Number(e.target.value))}
          />
        </>
      )}
      {(selectedTool === 'eraser') && (
        <>
          <WidthSlider
            type="range"
            min="8"
            max="80"
            value={eraserWidth}
            onChange={(e) => onEraserWidthChange(Number(e.target.value))}
          />
          <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{eraserWidth}px</div>
        </>
      )}
      <div style={{ marginTop: 'auto', paddingTop: 12 }}>
        <label style={{ fontSize: 12, color: '#888' }}>그리드 간격</label>
        <input
          type="range"
          min={10}
          max={100}
          step={1}
          value={gridSize}
          onChange={e => onGridSizeChange(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{gridSize}px</div>
        <div style={{ marginTop: 16 }}>
          <label style={{ fontSize: 12, color: '#888' }}>기준 해상도</label>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <input
              type="number"
              min={100}
              max={10000}
              value={baseResolution.width}
              onChange={e => onBaseResolutionChange({ ...baseResolution, width: Number(e.target.value) })}
              style={{ width: 40, fontSize: 12 }}
            />
            <span style={{ fontSize: 12 }}>x</span>
            <input
              type="number"
              min={100}
              max={10000}
              value={baseResolution.height}
              onChange={e => onBaseResolutionChange({ ...baseResolution, height: Number(e.target.value) })}
              style={{ width: 40, fontSize: 12 }}
            />
          </div>
        </div>
      </div>
    </ToolbarContainer>
  );
};

export default Toolbar; 