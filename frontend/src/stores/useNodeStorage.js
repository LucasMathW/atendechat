import create from 'zustand';

export const useNodeStorage = create((set) => ({
  node: "",
  connect: "",
  action: "idle",
  setNodesStorage: (node) => set((state) => ({ ...state, node })),
  setConnectsStorage: (connects) => set((state) => ({ ...state, connect: connects })),
  setAct: (act) => set((state) => ({ ...state, action: act }))
}));