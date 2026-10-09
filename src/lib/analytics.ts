import { track } from "@vercel/analytics";

export function trackEvent(name: string, data?: Record<string, string | number>) {
  try {
    track(name, data);
  } catch {}
}
