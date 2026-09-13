export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST required' });

  const server = String(process.env.KOBO_SERVER_URL || '').replace(/\/$/, '');
  const token = process.env.KOBO_API_TOKEN;
  const assetUid = String(req.body?.assetUid || '').trim();

  if (!server || !token) {
    return res.status(503).json({
      ok: false,
      configured: false,
      error: 'KoboToolbox server configuration is not available on the server.'
    });
  }
  if (!assetUid || !/^[A-Za-z0-9_-]+$/.test(assetUid)) {
    return res.status(400).json({ ok: false, error: 'A valid Kobo asset UID is required.' });
  }

  try {
    let url = `${server}/api/v2/assets/${encodeURIComponent(assetUid)}/data/`;
    const rows = [];
    const headers = { Authorization: `Token ${token}`, Accept: 'application/json' };
    let pages = 0;

    while (url) {
      pages += 1;
      if (pages > 10000) throw new Error('Kobo pagination safety limit exceeded.');
      const response = await fetch(url, { headers });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        return res.status(response.status).json({ ok: false, error: payload?.detail || 'KoboToolbox request failed.' });
      }
      if (!Array.isArray(payload?.results)) throw new Error('Unexpected KoboToolbox v2 response shape.');
      rows.push(...payload.results);
      url = payload.next || null;
    }

    const columns = Array.from(new Set(rows.flatMap(row => Object.keys(row || {}))));
    const data = rows.map(row => columns.map(column => row?.[column] ?? ''));
    const importedAt = new Date().toISOString();

    return res.status(200).json({
      ok: true,
      source: 'KoboToolbox',
      assetUid,
      fetchedAt: importedAt,
      recordCount: rows.length,
      pages,
      dataset: {
        name: `Kobo ${assetUid}`,
        rows: rows.length,
        columns: columns.length,
        headers: columns,
        data,
        dataDictionary: {},
        quality: { validated: false, warnings: ['Dataset must pass the Research Hub quality gate before analysis.'] },
        importedAt,
        provenance: { source: 'KoboToolbox', assetUid, fetchedAt: importedAt, recordCount: rows.length }
      }
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error?.message || 'KoboToolbox ingestion failed.' });
  }
}
