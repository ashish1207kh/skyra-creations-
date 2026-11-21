/**
 * SKYRA CREATIONS — Client-Side Platform Integrity & Anti-Tamper Shield
 * 
 * Protects frontend assets from casual source inspection, right-click cloning,
 * key combination snooping (F12, Ctrl+U, Ctrl+Shift+I), image theft, and unauthorized scraping.
 */

export function initPlatformSecurityShield(): void {
  if (typeof window === 'undefined') return;

  // 1. Disable Right-Click Context Menu
  window.addEventListener('contextmenu', (e: MouseEvent) => {
    // Allow right click if inside an input or textarea for convenience, otherwise block
    const target = e.target as HTMLElement | null;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
      return;
    }
    e.preventDefault();
  }, { passive: false });

  // 2. Intercept DevTools & View Source Keyboard Shortcuts
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();

    // Block F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Block Ctrl+U / Cmd+U (View Source)
    if (isCtrlOrMeta && key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Block Ctrl+S / Cmd+S (Save Page)
    if (isCtrlOrMeta && key === 's') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Block Ctrl+Shift+I / Cmd+Opt+I (Developer Tools)
    if (isCtrlOrMeta && e.shiftKey && (key === 'i' || key === 'j' || key === 'c')) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
  }, { passive: false });

  // 3. Prevent dragging photos & branding assets off the page
  window.addEventListener('dragstart', (e: DragEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.tagName === 'IMG') {
      e.preventDefault();
    }
  }, { passive: false });

  // 4. Output Official Security Notice
  try {
    const noticeStyle = 'color: #C6FF00; font-size: 16px; font-weight: bold; background: #050507; padding: 6px 12px; border-left: 4px solid #C6FF00;';
    const subStyle = 'color: #BFC3C7; font-size: 11px; margin-top: 4px;';
    console.log('%cSKYRA CREATIONS — PLATFORM INTEGRITY SHIELD ACTIVE', noticeStyle);
    console.log('%cProtected under active rate-limiting, blind indexing, and anti-tamper safeguards.', subStyle);
  } catch {
    // Ignore in stripped environments
  }
}
