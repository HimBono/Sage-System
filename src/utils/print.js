// ── PRINT HELPER ──────────────────────────────────────────────────────────────

/**
 * Opens a new popup window, writes an HTML document into it,
 * and triggers the browser print dialog after a short delay.
 *
 * @param {string} html  - Inner HTML body content (no <html>/<head> wrapper needed)
 * @param {string} title - Window/document title shown in the print dialog
 */
export const printDoc = (html, title = 'Print') => {
  try {
    const w = window.open('', '_blank', 'width=860,height=700');
    if (!w) {
      alert('Allow popups to use the print feature.');
      return;
    }
    w.document.write(
      `<!DOCTYPE html><html><head><title>${title}</title>` +
      `<style>body{margin:32px;font-family:system-ui,sans-serif;color:#1E293B}` +
      `@media print{@page{margin:18mm}}</style></head>` +
      `<body>${html}` +
      `<` + `script>setTimeout(()=>{window.print();},350);<` + `/script>` +
      `</body></html>`,
    );
    w.document.close();
  } catch (e) {
    alert('Could not open print window — please allow popups.');
  }
};
