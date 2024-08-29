import { create } from "zustand";
import { IBrowserDetection } from "../types";

const value: IBrowserDetection = {
  unsupportedBrowser: false,
};

interface Browser extends IBrowserDetection {
  setState: (data: IBrowserDetection) => void;
}

export const BrowserStore = create<Browser>((set) => ({
  ...value,
  setState: (data) => {
    const { unsupportedBrowser } = data;
    set(() => ({
      unsupportedBrowser,
    }));
  },
}));
