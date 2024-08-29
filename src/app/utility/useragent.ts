import { useEffect } from "react";
import { IUserAgent } from "../types";

function getBrowserDetect(userAgent: NavigatorID["userAgent"]): IUserAgent {
  const isAndroid = () => Boolean(userAgent.match(/Android/i));
  const isIos = () => Boolean(userAgent.match(/iPhone|iPad|iPod/i));
  const isOpera = () => Boolean(userAgent.match(/Opera Mini/i));
  const isWindows = () => Boolean(userAgent.match(/IEMobile/i));
  const isSSR = () => Boolean(userAgent.match(/SSR/i));
  const isSafari = () => Boolean(userAgent.match(/Safari/i)) && !userAgent.match(/Chrome|CriOS/i);
  const isMobile = () => Boolean(isAndroid() || isIos() || isOpera() || isWindows());
  const isDesktop = () => Boolean(!isMobile() && !isSSR());

  return {
    isMobile,
    isDesktop,
    isAndroid,
    isIos,
    isSSR,
    isSafari,
  };
}

export default function useBrowserDetect() {
  useEffect(() => {}, []);
  const userAgent = typeof navigator === "undefined" ? "SSR" : navigator.userAgent;
  return getBrowserDetect(userAgent);
}
