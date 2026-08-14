"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/**
 * Fires a page-level view event once on mount. Keeps server components free of
 * a "use client" boundary just to report that a page was seen.
 */
export function TrackView({ event }: { event: AnalyticsEvent }) {
  useEffect(() => {
    track(event);
    // Intentionally once per mount; the event describes the page view itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
