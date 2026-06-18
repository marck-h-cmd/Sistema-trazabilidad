import { create } from 'zustand';

interface WarehouseState {
  selectedWarehouseId: string | null;
  selectedLocationId: string | null;
  viewMode: 'grid' | 'list' | 'map';
  filters: {
    search: string;
    estado: string;
    categoria: string;
  };
  setSelectedWarehouse: (id: string | null) => void;
  setSelectedLocation: (id: string | null) => void;
  setViewMode: (mode: 'grid' | 'list' | 'map') => void;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;
}

const initialFilters = {
  search: '',
  estado: '',
  categoria: '',
};

export const useWarehouseStore = create<WarehouseState>()((set) => ({
  selectedWarehouseId: null,
  selectedLocationId: null,
  viewMode: 'grid',
  filters: { ...initialFilters },

  setSelectedWarehouse: (id) => set({ selectedWarehouseId: id, selectedLocationId: null }),

  setSelectedLocation: (id) => set({ selectedLocationId: id }),

  setViewMode: (viewMode) => set({ viewMode }),

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    })),

  clearFilters: () => set({ filters: { ...initialFilters } }),
}));