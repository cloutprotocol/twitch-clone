import { create } from "zustand";

interface CreatorSidebarStore {
  collapsed: boolean;
  onExpand: () => void;
  onCollapse: () => void;
  onToggle: () => void;
}

export const useCreatorSidebar = create<CreatorSidebarStore>((set, get) => ({
  collapsed: false,
  onExpand: () => set(() => ({ collapsed: false })),
  onCollapse: () => set(() => ({ collapsed: true })),
  onToggle: () => set(() => ({ collapsed: !get().collapsed })),
}));
