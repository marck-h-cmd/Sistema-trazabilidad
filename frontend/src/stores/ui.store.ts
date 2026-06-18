import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type SidebarVariant = 'expanded' | 'collapsed';

interface UIState {
  sidebarVariant: SidebarVariant;
  mobileMenuOpen: boolean;
  commandPaletteOpen: boolean;
  setSidebarVariant: (variant: SidebarVariant) => void;
  toggleSidebar: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarVariant: 'expanded',
      mobileMenuOpen: false,
      commandPaletteOpen: false,

      setSidebarVariant: (variant) => set({ sidebarVariant: variant }),

      toggleSidebar: () =>
        set({
          sidebarVariant: get().sidebarVariant === 'expanded' ? 'collapsed' : 'expanded',
        }),

      setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),

      toggleMobileMenu: () => set({ mobileMenuOpen: !get().mobileMenuOpen }),

      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      toggleCommandPalette: () =>
        set({ commandPaletteOpen: !get().commandPaletteOpen }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarVariant: state.sidebarVariant,
      }),
    }
  )
);