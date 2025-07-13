import { create } from "zustand";

interface RoadmapData {
  category: any;
  introParagraph: string;
  courses: any[];
}

interface RoadmapStore {
  data: RoadmapData | null;
  setData: (data: RoadmapData) => void;
}

export const useRoadmapStore = create<RoadmapStore>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
