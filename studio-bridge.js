(() => {
  'use strict';
  const state = () => window.antenehStudioState;
  const prompt = document.getElementById('prompt');
  const length = document.getElementById('length');
  const style = document.getElementById('style');
  const list = document.querySelector('.story-list');
  if (!prompt || !length || !style || !list) return;

  function syncFromEditor(reason='editor') {
    if (!state()?.setScenes || !window.antenehStoryboardEditor?.collect) return;
    state().setProject({
      topic: prompt.value,
      length: length.value,
      style: style.value,
      scenes: window.antenehStoryboardEditor.collect()
    }, reason);
  }

  document.addEventListener('input', e => {
    if (!e.target.closest('.story-list')) return;
    clearTimeout(window.__antenehStateTimer);
    window.__antenehStateTimer = setTimeout(() => syncFromEditor('editor-input'), 180);
  });
  document.addEventListener('change', e => {
    if (!e.target.closest('.story-list')) return;
    syncFromEditor('editor-change');
  });

  document.addEventListener('click', e => {
    if (e.target.id === 'saveBtn') syncFromEditor('save');
    if (e.target.id === 'exportProjectBtn') state()?.exportJSON();
  }, true);

  window.addEventListener('anteneh:statechange', e => {
    const p = e.detail?.state;
    if (!p) return;
    if (p.topic && prompt.value !== p.topic && e.detail.reason === 'load') prompt.value = p.topic;
    if (p.length && length.value !== p.length && e.detail.reason === 'load') length.value = p.length;
    if (p.style && style.value !== p.style && e.detail.reason === 'load') style.value = p.style;
  });

  // Make the centralized state available to the existing renderer without changing its API.
  window.antenehStudioGetScenes = () => state()?.getProject().scenes || window.antenehStoryboardEditor?.collect?.() || [];
  window.antenehStudioSync = syncFromEditor;
})();
