"use clinet";

import PWAInstall from "@khmyznikov/pwa-install/react-legacy";
import { PWAInstallElement } from "@khmyznikov/pwa-install";
import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    promptEvent: any;
  }
}

const PwaHelper = () => {
  const appName = "My PWA";

  const [promptEvent, setPromptEvent] = useState(null);
  const pwaInstallRef = useRef<PWAInstallElement>(null);

  useEffect(() => {
    let lastPromptEvent = window.promptEvent;

    const intervalId = setInterval(() => {
      if (window.promptEvent !== lastPromptEvent) {
        lastPromptEvent = window.promptEvent;
        setPromptEvent(window.promptEvent);
      }
    }, 100);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  /* buttons was used here just for sample, not a direct guide
  name and icon props was used just for test, prefer manifest in your app.
  */

  return (
    <PWAInstall
      ref={pwaInstallRef}
      name={"stashpad"}
      icon={"./images/icon512_rounded.png"}
      externalPromptEvent={promptEvent}
      onPwaInstallAvailableEvent={(event) => console.log(event)}
    ></PWAInstall>
  );
};

export default PwaHelper;
