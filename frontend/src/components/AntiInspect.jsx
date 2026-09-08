import { useEffect } from 'react';

/*
  Client-side deterrent against casual copying / inspection.
  NOTE: this cannot truly stop a determined user — all frontend code is
  downloadable. It only blocks right-click and the common DevTools shortcuts.
  Disabled automatically in development so we can still debug.
*/
export default function AntiInspect() {
  useEffect(() => {
    if (import.meta.env.DEV) return; // keep DevTools in local dev

    const blockContextMenu = (e) => e.preventDefault();

    const blockKeys = (e) => {
      const k = (e.key || '').toLowerCase();
      const ctrlOrCmd = e.ctrlKey || e.metaKey;
      // F12
      if (k === 'f12') { e.preventDefault(); return; }
      // Ctrl/Cmd+Shift+I / J / C  (DevTools, console, inspector)
      if (ctrlOrCmd && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) { e.preventDefault(); return; }
      // Ctrl/Cmd+U (view source)
      if (ctrlOrCmd && k === 'u') { e.preventDefault(); return; }
      // Ctrl/Cmd+S (save page)
      if (ctrlOrCmd && k === 's') { e.preventDefault(); return; }
    };

    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeys);
    return () => {
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeys);
    };
  }, []);

  return null;
}
