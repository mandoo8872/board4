import React from 'react';
import styled from '@emotion/styled';
import type { CanvasObject } from '../types/types';

interface PropertyPanelProps {
  selectedObject: CanvasObject | null;
  onPropertyChange: (property: string, value: any) => void;
}

const PanelContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 200px;
`;

const PropertyGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const PropertyLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  color: #666;
`;

const PropertyInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #999;
  }
`;

const PropertySelect = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;

  &:focus {
    outline: none;
    border-color: #999;
  }
`;

export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedObject,
  onPropertyChange,
}) => {
  if (!selectedObject) {
    return null;
  }

  const renderTextProperties = () => (
    <PropertyGroup>
      <PropertyLabel>Text</PropertyLabel>
      <PropertyInput
        type="text"
        value={selectedObject.properties.text || ''}
        onChange={(e) => onPropertyChange('text', e.target.value)}
      />
    </PropertyGroup>
  );

  const renderImageProperties = () => (
    <PropertyGroup>
      <PropertyLabel>Image URL</PropertyLabel>
      <PropertyInput
        type="text"
        value={selectedObject.properties.imageUrl || ''}
        onChange={(e) => onPropertyChange('imageUrl', e.target.value)}
      />
    </PropertyGroup>
  );

  const renderShapeProperties = () => (
    <PropertyGroup>
      <PropertyLabel>Shape Type</PropertyLabel>
      <PropertySelect
        value={selectedObject.properties.shapeType || 'rectangle'}
        onChange={(e) => onPropertyChange('shapeType', e.target.value)}
      >
        <option value="rectangle">Rectangle</option>
        <option value="circle">Circle</option>
        <option value="triangle">Triangle</option>
      </PropertySelect>
    </PropertyGroup>
  );

  const renderCommonProperties = () => (
    <>
      <PropertyGroup>
        <PropertyLabel>Position X</PropertyLabel>
        <PropertyInput
          type="number"
          value={selectedObject.position.x}
          onChange={(e) => onPropertyChange('position.x', Number(e.target.value))}
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Position Y</PropertyLabel>
        <PropertyInput
          type="number"
          value={selectedObject.position.y}
          onChange={(e) => onPropertyChange('position.y', Number(e.target.value))}
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Width</PropertyLabel>
        <PropertyInput
          type="number"
          value={selectedObject.size.width}
          onChange={(e) => onPropertyChange('size.width', Number(e.target.value))}
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Height</PropertyLabel>
        <PropertyInput
          type="number"
          value={selectedObject.size.height}
          onChange={(e) => onPropertyChange('size.height', Number(e.target.value))}
        />
      </PropertyGroup>
      <PropertyGroup>
        <PropertyLabel>Rotation</PropertyLabel>
        <PropertyInput
          type="number"
          value={selectedObject.rotation}
          onChange={(e) => onPropertyChange('rotation', Number(e.target.value))}
        />
      </PropertyGroup>
    </>
  );

  return (
    <PanelContainer>
      {selectedObject.type === 'text' && renderTextProperties()}
      {selectedObject.type === 'image' && renderImageProperties()}
      {selectedObject.type === 'shape' && renderShapeProperties()}
      {renderCommonProperties()}
    </PanelContainer>
  );
}; 