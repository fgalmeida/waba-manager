import { create } from "zustand";
import type { Template, TemplateStatus, TemplateCategory } from "@/types/meta";

interface TemplateFilters {
  status: TemplateStatus | "";
  category: TemplateCategory | "";
  search: string;
}

interface TemplateStore {
  templates: Template[];
  filters: TemplateFilters;
  loading: boolean;
  error: string | null;

  setFilter: (key: keyof TemplateFilters, value: string) => void;
  clearFilters: () => void;
  fetchTemplates: () => Promise<void>;
  removeTemplate: (name: string) => void;
}

const initialState: TemplateFilters = {
  status: "",
  category: "",
  search: "",
};

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  templates: [],
  filters: { ...initialState },
  loading: false,
  error: null,

  setFilter: (key, value) => {
    set((state) => ({
      filters: { ...state.filters, [key]: value },
    }));
  },

  clearFilters: () => {
    set({ filters: { ...initialState } });
  },

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      if (filters.status) params.set("status", filters.status);
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("name", filters.search);

      const res = await fetch(`/api/templates?${params.toString()}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erro ao buscar templates");
      }
      const templates = await res.json();
      set({ templates, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  removeTemplate: (name) => {
    set((state) => ({
      templates: state.templates.filter((t) => t.name !== name),
    }));
  },
}));
