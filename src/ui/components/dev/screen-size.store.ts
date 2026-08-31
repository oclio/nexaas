import { create, StateCreator } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export type SizeType = 'sm' | 'md' | 'lg';
export type PositionType =
  'bottomLeft' | 'bottomRight' | 'topRight' | 'topLeft';

interface ScreenSizeState {
  size: SizeType;
  setSize: (size: SizeType) => void;

  position: PositionType;
  setPosition: (position: PositionType) => void;

  isColored: boolean;
  setIsColored: (isColored: boolean) => void;
}

export const useScreenSizeStore = create<ScreenSizeState>()(
  persist(
    devtools((set) => ({
      size: 'md',
      setSize: (size: SizeType) => set({ size }, false, 'screenSize/setSize'),

      position: 'bottomLeft',
      setPosition: (position: PositionType) =>
        set({ position }, false, 'screenSize/setPosition'),

      isColored: false,
      setIsColored: (isColored: boolean) =>
        set({ isColored }, false, 'screenSize/setIsColored'),
    })),
    {
      name: 'screen-size-storage',
    },
  ) as unknown as StateCreator<ScreenSizeState, [], []>,
);
