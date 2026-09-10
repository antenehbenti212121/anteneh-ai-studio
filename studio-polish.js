(() => {
  const prompt = document.getElementById('prompt');
  const style = document.getElementById('style');
  const storyList = document.querySelector('.story-list');
  const formNote = document.getElementById('formNote');
  if (!storyList) return;

  const stop = new Set(['the','and','for','with','that','this','from','into','your','about','what','when','where','will','have','does','more','than','then','they','their','are','you','how','why']);
  const words = text => String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean);

  function getScenes() {
    return [...document.querySelectorAll('.scene')].map(scene => ({
      title: scene.querySelector('.scene-title')?.value || '',
      narration: scene.querySelector('.scene-narration')?.value || '',
      visual: scene.querySelector('.scene-visual')?.value || ''
    }));
  }

  function saveQuietly() {
    try {
      const existing = JSON.parse(localStorage.getItem('anteneh-ai-studio-project') || '{}');
      localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({
        ...existing,
        topic: prompt?.value?.trim() || existing.topic || '',
        style: style?.value || existing.style || '',
        scenes: getScenes()
      }));
    } catch (_) {}
  }

  function addIntelligenceBar() {
    const old = document.getElementById('lessonIntelligence');
    if (old) old.remove();
    const scenes = getScenes();
    if (!scenes.length) return;
    const all = scenes.flatMap(s => words(`${s.title} ${s.narration}`));
    const freq = {};
    all.forEach(w => { if (w.length > 4 && !stop.has(w)) freq[w] = (freq[w] || 0) + 1; });
    const top = Object.entries(freq).sort((a,b) => b[1] - a[1]).slice(0, 4).map(([w]) => w);
    const text = document.createElement('div');
    text.id = 'lessonIntelligence';
    text.className = 'lesson-intelligence';
    text.innerHTML = `<strong>Lesson intelligence</strong><span>${scenes.length} scenes</span><span>${all.length} narration words</span><span>${top.length ? `Focus: ${top.join(' • ')}` : 'Ready for rendering'}</span>`;
    const pipeline = document.querySelector('.pipeline');
    if (pipeline?.parentNode) pipeline.parentNode.insertBefore(text, pipeline);
  }

  function decorateScenes() {
    document.querySelectorAll('.scene').forEach((scene, index) => {
      let meta = scene.querySelector('.scene-meta');
      if (!meta) {
        meta = document.createElement('div');
        meta.className = 'scene-meta';
        scene.querySelector('.scene-content')?.appendChild(meta);
      }
      const narration = scene.querySelector('.scene-narration')?.value || '';
      const count = words(narration).length;
      meta.textContent = `${count} words • scene ${String(index + 1).padStart(2, '0')}`;
    });
  }

  function refresh() {
    decorateScenes();
    addIntelligenceBar();
  }

  const observer = new MutationObserver(() => setTimeout(refresh, 0));
  observer.observe(storyList, { childList: true, subtree: true });
  storyList.addEventListener('input', () => {
    saveQuietly();
    decorateScenes();
  });
  prompt?.addEventListener('input', saveQuietly);
  style?.addEventListener('change', saveQuietly);

  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
      event.preventDefault();
      saveQuietly();
      if (formNote) formNote.textContent = 'Project saved automatically on this device.';
    }
  });

  refresh();
})();
