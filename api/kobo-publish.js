export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'POST required' });

  const server = String(process.env.KOBO_SERVER_URL || '').replace(/\/$/, '');
  const token = process.env.KOBO_API_TOKEN;
  if (!server || !token) {
    return res.status(503).json({ ok: false, configured: false, error: 'KoboToolbox server configuration is not available on the server.' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const fileBase64 = String(body.fileBase64 || '').trim();
  const fileName = String(body.fileName || 'research_questionnaire.xlsx').replace(/[^A-Za-z0-9._-]/g, '_');
  const existingUid = String(body.assetUid || '').trim();
  const title = String(body.title || 'ANTENEH Research Questionnaire').trim().slice(0, 200);

  if (!fileBase64 || fileBase64.length > 20 * 1024 * 1024) {
    return res.status(400).json({ ok: false, error: 'A valid XLSForm file is required and must be reasonably sized.' });
  }
  if (existingUid && !/^[A-Za-z0-9_-]+$/.test(existingUid)) {
    return res.status(400).json({ ok: false, error: 'Invalid Kobo asset UID.' });
  }

  const headers = { Authorization: `Token ${token}`, Accept: 'application/json' };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  try {
    const bytes = Buffer.from(fileBase64, 'base64');
    const form = new FormData();
    form.append('library', 'false');
    form.append('file', new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), fileName);
    if (existingUid) form.append('destination', `${server}/api/v2/assets/${encodeURIComponent(existingUid)}/`);

    const imported = await fetch(`${server}/api/v2/imports/?format=json`, { method: 'POST', headers, body: form });
    const importPayload = await imported.json().catch(() => ({}));
    if (!imported.ok) return res.status(imported.status).json({ ok: false, error: importPayload?.detail || importPayload?.error || 'Kobo XLSForm import failed.' });

    const importUid = importPayload.uid;
    const importUrl = importPayload.url || `${server}/api/v2/imports/${encodeURIComponent(importUid)}/`;
    if (!importUid) throw new Error('Kobo did not return an import UID.');

    let result = importPayload;
    for (let i = 0; i < 40; i += 1) {
      await sleep(1500);
      const check = await fetch(importUrl, { headers });
      result = await check.json().catch(() => ({}));
      const status = String(result.status || '').toLowerCase();
      if (status === 'complete' || status === 'completed' || result.messages?.created?.length) break;
      if (status === 'failed' || status === 'error') throw new Error(result.error || result.detail || 'Kobo XLSForm import failed.');
    }

    const createdUid = result?.messages?.created?.[0]?.uid || result?.messages?.created?.[0]?.asset?.uid || existingUid;
    if (!createdUid) throw new Error('Kobo import completed without an asset UID.');

    const assetUrl = `${server}/api/v2/assets/${encodeURIComponent(createdUid)}/`;
    const assetResponse = await fetch(assetUrl, { headers });
    const asset = await assetResponse.json().catch(() => ({}));
    if (!assetResponse.ok) throw new Error(asset?.detail || 'Kobo asset could not be read after import.');

    const versionId = asset.version_id || asset.deployed_version_id;
    const deploymentUrl = `${server}/api/v2/assets/${encodeURIComponent(createdUid)}/deployment/`;
    const deploymentForm = new FormData();
    deploymentForm.append('active', 'true');
    if (versionId) deploymentForm.append('version_id', versionId);
    const deploy = await fetch(deploymentUrl, { method: existingUid ? 'PATCH' : 'POST', headers, body: deploymentForm });
    const deployment = await deploy.json().catch(() => ({}));
    if (!deploy.ok) throw new Error(deployment?.detail || deployment?.error || 'Kobo form deployment failed.');

    return res.status(200).json({
      ok: true,
      assetUid: createdUid,
      title: asset.name || title,
      importedAt: new Date().toISOString(),
      importUid,
      versionId: deployment.version_id || versionId || '',
      deployed: deployment.active !== false,
      koboProjectUrl: `${server}/#/forms/${encodeURIComponent(createdUid)}/summary`,
      koboCollectServer: server.includes('eu.kobotoolbox.org') ? 'https://kc-eu.kobotoolbox.org/' : 'https://kc.kobotoolbox.org/'
    });
  } catch (error) {
    return res.status(502).json({ ok: false, error: error?.message || 'Kobo publish failed.' });
  }
}
