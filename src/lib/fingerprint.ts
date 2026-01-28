// Server-side fingerprint utilities
// Note: Full fingerprinting happens on the client side

import crypto from "crypto";

export interface ClientInfo {
  userAgent: string;
  language: string;
  timezone?: string;
  screenResolution?: string;
  colorDepth?: number;
  platform?: string;
  canvasHash?: string;
}

export function generateServerFingerprint(request: Request): string {
  const userAgent = request.headers.get("user-agent") || "";
  const acceptLanguage = request.headers.get("accept-language") || "";
  const acceptEncoding = request.headers.get("accept-encoding") || "";

  const components = [userAgent, acceptLanguage, acceptEncoding].join("|");

  return crypto.createHash("sha256").update(components).digest("hex").substring(0, 32);
}

export function hashFingerprint(data: string): string {
  return crypto.createHash("sha256").update(data).digest("hex").substring(0, 32);
}

// Client-side fingerprinting script to be injected
export const fingerprintScript = `
(function() {
  function getFingerprint() {
    const components = [];

    // Screen
    components.push(screen.width + 'x' + screen.height);
    components.push(screen.colorDepth);

    // Timezone
    components.push(Intl.DateTimeFormat().resolvedOptions().timeZone);

    // Language
    components.push(navigator.language);

    // Platform
    components.push(navigator.platform);

    // Canvas fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 200;
      canvas.height = 50;
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('JEE Intelligence Fingerprint', 2, 2);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('JEE Intelligence Fingerprint', 4, 17);
      components.push(canvas.toDataURL().slice(-50));
    } catch (e) {
      components.push('canvas-error');
    }

    // Create hash
    const data = components.join('|');
    return simpleHash(data);
  }

  function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  window.__jeeFingerprint = getFingerprint();
})();
`;

export function getClientFingerprint(): string | null {
  if (typeof window !== "undefined" && (window as unknown as { __jeeFingerprint?: string }).__jeeFingerprint) {
    return (window as unknown as { __jeeFingerprint: string }).__jeeFingerprint;
  }
  return null;
}
