(() => {
  'use strict';
  const panel = document.querySelector('.video-panel');
  if (!panel || document.getElementById('studioHealth')) return;
  const box = document.createElement('div');
  box.id = 'studioHealth'; box.className = 'studio-health';
  box.innerHTML = '<div><strong>Studio health</strong><small>Live checks for the current project.</small></div><div class="health-items"></div>';
  panel.appendChild(box);
  const items = box.querySelector('.health-items');
  const ok = (label, good, detail) => `<span class="health-item ${good?'good':'bad'}"><b>${good?'✓':'!'}</b><span><strong>${label}</strong><small>${detail}</small></span></span>`;
  function refresh() {
    const p = window.antenehStudioState?.getProject?.() || {};
    const scenes = window.antenehStudioGetScenes?.() || p.scenes || [];
    const words = scenes.reduce((n,s)=>n+String(s.narration||'').trim().split(/\s+/).filter(Boolean).length,0);
    items.innerHTML =
      ok('Lesson', !!p.topic || !!document.getElementById('prompt')?.value.trim(), 'Topic or script present') +
      ok('Storyboard', scenes.length > 0, `${scenes.length} scene${scenes.length===1?'':'s'} ready`) +
      ok('Narration', words > 0, `${words} narration words`) +
      ok('Video capture', !!HTMLCanvasElement.prototype.captureStream && !!window.MediaRecorder, 'Canvas + recorder available') +
      ok('Local storage', !!window.localStorage, 'Projects can stay on this device');
  }
  refresh(); setInterval(refresh, 1500);
})();
