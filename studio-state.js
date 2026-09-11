(() => {
  'use strict';
  const KEY = 'anteneh-ai-studio-project-v3';
  const LEGACY = 'anteneh-ai-studio-project-v2';
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();

  const normalizeScene = (s, i) => ({
    id: s?.id || `scene-${Date.now()}-${i}`,
    title: clean(s?.title) || `Scene ${i + 1}`,
    narration: clean(s?.narration),
    visual: clean(s?.visual),
    visualType: clean(s?.visualType) || 'concept',
    caption: clean(s?.caption || s?.narration),
    duration: Math.max(2, Number(s?.duration) || 5),
    keywords: Array.isArray(s?.keywords) ? s.keywords.map(clean).filter(Boolean) : []
  });

  const normalize = p => ({
    version: 3,
    id: p?.id || `project-${Date.now()}`,
    topic: clean(p?.topic),
    length: clean(p?.length) || '60 sec',
    style: clean(p?.style) || 'Clean explainer',
    mode: clean(p?.mode) || 'Explainer',
    scenes: Array.isArray(p?.scenes) ? p.scenes.map(normalizeScene) : [],
    narration: { recorded: !!p?.narration?.recorded },
    updatedAt: new Date().toISOString()
  });

  let state = normalize({});
  const listeners = new Set();

  function emit(reason) {
    const snapshot = structuredClone ? structuredClone(state) : JSON.parse(JSON.stringify(state));
    listeners.forEach(fn => { try { fn(snapshot, reason); } catch (_) {} });
    window.dispatchEvent(new CustomEvent('anteneh:statechange', { detail: { state: snapshot, reason } }));
  }

  function setProject(partial, reason='update') {
    state = normalize({ ...state, ...partial, scenes: partial.scenes ?? state.scenes });
    emit(reason);
    return state;
  }
  function setScenes(scenes, reason='scenes') { return setProject({ scenes }, reason); }
  function getProject() { return state; }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  function save() {
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(state));
    localStorage.setItem(LEGACY, JSON.stringify(state));
    emit('save');
    return true;
  }
  function load() {
    try {
      const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.scenes)) return false;
      state = normalize(parsed);
      emit('load');
      return true;
    } catch (_) { return false; }
  }
  function clear() {
    localStorage.removeItem(KEY); localStorage.removeItem(LEGACY);
    state = normalize({}); emit('clear'); return true;
  }
  function exportJSON() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a');
    a.href = url; a.download = `${(state.topic || 'anteneh-ai-lesson').replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'').toLowerCase() || 'lesson'}.json`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  window.antenehStudioState = { KEY, normalize, getProject, setProject, setScenes, save, load, clear, exportJSON, subscribe };
  window.addEventListener('beforeunload', () => { if (state.scenes.length) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (_) {} } });
  load();
})();
