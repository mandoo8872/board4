import React from 'react';
import styled from 'styled-components';

interface ToolButtonObjectProps {
  icon: string;
  label: string;
  isSelected: boolean;
  onClick: () => void;
}

const Button = styled.button.withConfig({
  shouldForwardProp: (prop) => prop !== 'isSelected',
})<{ isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 4px;
  background: ${props => props.isSelected ? '#e0e0e0' : 'white'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  position: relative;

  &:hover {
    background: #f0f0f0;
  }

  &:active {
    background: #e0e0e0;
  }

  &::after {
    content: attr(data-label);
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    white-space: nowrap;
    color: #666;
  }
`;

export const ToolButtonObject: React.FC<ToolButtonObjectProps> = ({
  icon,
  label,
  isSelected,
  onClick,
}) => {
  return (
    <Button
      isSelected={isSelected}
      onClick={onClick}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 9, marginTop: 2 }}>{label}</span>
      </div>
    </Button>
  );
}; 