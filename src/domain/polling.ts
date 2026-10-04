// Adaptive polling (ADR 0007): the database is the source of truth, push only speeds things up.

export const POLL_MS = { live: 3000, idle: 15000, safetyNet: 30000 } as const;

/** Milliseconds until the next poll, or null to pause (hidden tab). */
export const pollInterval = ({ live, visible, pushConnected }: { live: boolean; visible: boolean; pushConnected: boolean }) => {
  if (!visible) return null;
  if (pushConnected) return POLL_MS.safetyNet;
  return live ? POLL_MS.live : POLL_MS.idle;
};
