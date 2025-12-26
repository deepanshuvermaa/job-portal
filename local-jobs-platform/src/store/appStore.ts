import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Language, Location } from '../types';

interface AppStore {
  language: Language;
  setLanguage: (lang: Language) => void;
  currentLocation: Location | null;
  setCurrentLocation: (location: Location | null) => void;
  isLocationPermissionGranted: boolean;
  setLocationPermission: (granted: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      language: 'hi', // Default to Hindi for Tier 2/3 cities
      setLanguage: (lang) => set({ language: lang }),

      currentLocation: null,
      setCurrentLocation: (location) => set({ currentLocation: location }),

      isLocationPermissionGranted: false,
      setLocationPermission: (granted) =>
        set({ isLocationPermissionGranted: granted }),
    }),
    {
      name: 'app-storage',
    }
  )
);

