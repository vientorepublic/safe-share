"use client";
import useBrowserDetect from "../utility/useragent";
import { BrowserStore } from "../store/browser";
import React, { useEffect } from "react";

const blockUnsupportedBrowser = Boolean(process.env.NEXT_PUBLIC_ENFORCE_BLOCK_UNSUPPORTED_BROWSER);

export default function BrowserDetectionLayout({ children }: { children: React.ReactNode }) {
  const { setState } = BrowserStore();
  const browserDetection = useBrowserDetect();
  const isSafari = browserDetection.isSafari();
  useEffect(() => {
    if (blockUnsupportedBrowser && isSafari) {
      setState({
        unsupportedBrowser: true,
      });
    }
  }, [isSafari, setState]);
  return children;
}
