// ── CLOUD SYNC MANAGER (Vercel KV / Upstash Redis) ─────────────────────────

let syncTimeout = null;

export async function fetchCloudData() {
  try {
    const res = await fetch('/api/sync', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const result = await res.json();
    return result;
  } catch (err) {
    console.warn('[CloudSync] Fetch failed or not configured:', err.message);
    return { success: false, error: err.message };
  }
}

export function triggerCloudSave({ students, cfg, finances }, onStatusChange) {
  if (syncTimeout) clearTimeout(syncTimeout);

  if (onStatusChange) onStatusChange('syncing');

  syncTimeout = setTimeout(async () => {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students, cfg, finances }),
      });
      const result = await res.json();
      if (result.success) {
        if (onStatusChange) onStatusChange('synced');
      } else {
        if (onStatusChange) onStatusChange(result.configured === false ? 'unconfigured' : 'error');
      }
    } catch (err) {
      console.warn('[CloudSync] Save failed:', err.message);
      if (onStatusChange) onStatusChange('error');
    }
  }, 600); // 600ms debounce
}
