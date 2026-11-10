"use client";

import { useEffect, useState } from "react";

export function HeaderBar(): React.ReactElement {
  const [available, setAvailable] = useState<boolean | null>(null);
  useEffect(() => {
    fetch("/api/health").then((response) => response.json()).then((data: { hasApiKey: boolean }) => setAvailable(data.hasApiKey)).catch(() => setAvailable(false));
  }, []);
  return <header className="header-bar">
    <a className="brand" href="#top" aria-label="TrueLabel home"><img src="/brand/truelabel-mark.svg" alt="" /><span>TrueLabel</span></a>
    <div className={`api-status ${available ? "live" : "offline"}`}><span className="status-dot" />{available ? "Clocked API connected" : "CLOCKED_API_KEY required"}</div>
  </header>;
}
