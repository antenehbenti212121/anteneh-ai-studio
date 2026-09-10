(() => {
  const list = document.querySelector('.story-list');
  const panel = document.querySelector('.storyboard-panel');
  if (!list || !panel) return;

  const box = document.createElement('div');
  box.className = 'studio-dashboard';
  box.innerHTML = `
    <div class="dashboard-head"><strong>Lesson intelligence</strong><span class="dashboard-live">LIVE</span></div>
    <div class="dashboard-stats">
      <div><b id="dashScenes">0</b><span>scenes</span></div>
      <div><b id="dashWords">0</b><span>words</span></div>
      <div><b id="dashMinutes">0:00</b><span>estimated</span></div>
    </div>
    <div class="dashboard-actions">
      <button type="button" id="copyOutlineBtn">Copy outline</button>
      <button type="button" id="exportJsonBtn">Export JSON</button>
    </div>`;
  panel.appendChild(box);

  const scenes = () => [...document.querySelectorAll('.scene')].map((node, i) => ({
    title: node.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
    narration: node.querySelector('.scene-narration')?.value || '',
    visual: node.querySelector('.scene-visual')?.value || ''
  }));

  const update = () => {
    const data = scenes();
    const wordCount = data.reduce((sum, s) => sum + s.narration.trim().split(/\s+/).filter(Boolean).length, 0);
    const seconds = Math.max(0, Math.round(wordCount / 2.4));
    document.getElementById('dashScenes').textContent = data.length;
    document.getElementById('dashWords').textContent = wordCount;
    document.getElementById('dashMinutes').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  };

  const outline = () => scenes().map((s, i) => `${String(i + 1).padStart(2, '0')}. ${s.title}\n${s.narration}`).join('\n\n');

  document.getElementById('copyOutlineBtn').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(outline());
      document.getElementById('copyOutlineBtn').textContent = 'Copied ✓';
      setTimeout(() => document.getElementById('copyOutlineBtn').textContent = 'Copy outline', 1400);
    } catch {
      const area = document.createElement('textarea'); area.value = outline(); document.body.appendChild(area); area.select(); document.execCommand('copy'); area.remove();
      document.getElementById('copyOutlineBtn').textContent = 'Copied ✓';
      setTimeout(() => document.getElementById('copyOutlineBtn').textContent = 'Copy outline', 1400);
    }
  });

  document.getElementById('exportJsonBtn').addEventListener('click', () => {
    const payload = {
      studio: 'ANTENEH AI STUDIO',
      topic: document.getElementById('prompt')?.value.trim() || '',
      length: document.getElementById('length')?.value || '',
      style: document.getElementById('style')?.value || '',
      scenes: scenes()
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'anteneh-ai-studio-project.json'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  list.addEventListener('input', update);
  new MutationObserver(update).observe(list, { childList: true, subtree: true });
  update();
})();
