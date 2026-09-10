import { create } from 'zustand';
import { SelectedEntity } from '../types';

interface FloodState {
  selectedTimeWindow: '0h' | '1h' | '2h' | '3h';
  activeRoute: 'primary' | 'alternate' | 'both';
  selectedFeature: SelectedEntity;
  layerVisibility: {
    streets: boolean;
    drainage: boolean;
  };
  setTimeWindow: (window: '0h' | '1h' | '2h' | '3h') => void;
  setActiveRoute: (route: 'primary' | 'alternate' | 'both') => void;
  setSelectedFeature: (feature: SelectedEntity) => void;
  toggleLayerVisibility: (layer: 'streets' | 'drainage') => void;
}

export const useFloodStore = create<FloodState>((set) => ({
  selectedTimeWindow: '0h',
  activeRoute: 'both',
  selectedFeature: null,
  layerVisibility: {
    streets: true,
    drainage: true,
  },
  setTimeWindow: (window) => set({ selectedTimeWindow: window }),
  setActiveRoute: (route) => set({ activeRoute: route }),
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
  toggleLayerVisibility: (layer) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [layer]: !state.layerVisibility[layer],
      },
    })),
}));
