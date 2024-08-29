"use client";
import React, { useEffect } from "react";
import useBrowserDetect from "../utility/useragent";
import { BrowserStore } from "../store/browser";

export default function BrowserDetectionLayout({ children }: { children: React.ReactNode }) {
  const { setState } = BrowserStore();
  const browserDetection = useBrowserDetect();
  const isSafari = browserDetection.isSafari();
  useEffect(() => {
    if (isSafari) {
      setState({
        unsupportedBrowser: true,
      });
    }
  }, [isSafari, setState]);
  return children;
}
