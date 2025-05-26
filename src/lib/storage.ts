import type { BoardState, StorageData } from '../types/types';

const STORAGE_KEY = 'shared-board-state';

export const saveBoardState = (boardState: BoardState): void => {
  const storageData: StorageData = {
    boardState,
    lastModified: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
};

export const loadBoardState = (): BoardState | null => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) return null;

  try {
    const { boardState } = JSON.parse(storedData) as StorageData;
    return boardState;
  } catch (error) {
    console.error('Failed to load board state:', error);
    return null;
  }
};

export const clearBoardState = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const getLastModified = (): number | null => {
  const storedData = localStorage.getItem(STORAGE_KEY);
  if (!storedData) return null;

  try {
    const { lastModified } = JSON.parse(storedData) as StorageData;
    return lastModified;
  } catch (error) {
    console.error('Failed to get last modified time:', error);
    return null;
  }
}; 