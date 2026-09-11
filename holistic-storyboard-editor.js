(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const prompt = $('prompt');
  const list = document.querySelector('.story-list');
  const createBtn = $('createBtn');
  if (!prompt || !list || !createBtn) return;

  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();
  const wordCount = v => clean(v).split(/\s+/).filter(Boolean).length;
  const types = ['concept','process','cause/effect','comparison','timeline','cycle','formula','hierarchy','example','warning','recap','decision flow','labeled diagram'];

  function titleFor(text, index) {
    const first = clean(text).replace(/[.!?]+$/, '');
    const words = first.split(/\s+/).filter(Boolean);
    if (words.length <= 7) return first || `Scene ${index + 1}`;
    const stop = /^(and|but|so|because|then|this|that|these|those|it|they)\b/i;
    const head = words.slice(0, 8).join(' ');
    return stop.test(head) ? `Key idea ${index + 1}` : head + '…';
  }

  function inferType(text, index, total) {
    const t = clean(text).toLowerCase();
    if (index === total - 1 || /\b(recap|summary|remember|in short|key takeaway)\b/.test(t)) return 'recap';
    if (/\b(step|first|second|third|next|finally|begin|start|then)\b/.test(t)) return 'process';
    if (/\b(because|causes?|leads? to|results? in|therefore|as a result|due to)\b/.test(t)) return 'cause/effect';
    if (/\b(compare|compared|difference|whereas|while|versus|vs\.?|similar)\b/.test(t)) return 'comparison';
    if (/\b(before|after|in \d{4}|later|earlier|timeline|year)\b/.test(t)) return 'timeline';
    if (/\b(example|for instance|imagine|such as)\b/.test(t)) return 'example';
    if (/\b(warning|avoid|danger|careful|mistake|risk)\b/.test(t)) return 'warning';
    if (/\b(=|formula|equation|equals|plus|minus|times|divided)\b/.test(t)) return 'formula';
    return 'concept';
  }

  function visualFor(text, type, topic) {
    const compact = clean(text);
    if (type === 'process') return `${topic} • INPUT → PROCESS → OUTPUT`;
    if (type === 'cause/effect') return `CAUSE → ${topic.toUpperCase()} → EFFECT`;
    if (type === 'comparison') return `A ↔ B • ${topic}`;
    if (type === 'timeline') return `PAST → NOW → NEXT • ${topic}`;
    if (type === 'example') return `REAL EXAMPLE • ${topic}`;
    if (type === 'warning') return `⚠ CHECK • ${topic}`;
    if (type === 'recap') return `KEY TAKEAWAYS • ${topic}`;
    if (type === 'formula') return `FORMULA • ${topic}`;
    return `${topic} • ${compact.split(/\s+/).slice(0, 7).join(' ')}`;
  }

  function splitScript(raw) {
    const paragraphs = raw.split(/\n\s*\n/).map(clean).filter(Boolean);
    const source = paragraphs.length > 1 ? paragraphs : raw.split(/(?<=[.!?])\s+/).map(clean).filter(Boolean);
    if (source.length < 2) return null;
    const max = 12;
    const chunks = [];
    let current = '';
    source.forEach(part => {
      const candidate = current ? `${current} ${part}` : part;
      if (current && wordCount(candidate) > 55) { chunks.push(current); current = part; }
      else current = candidate;
    });
    if (current) chunks.push(current);
    return chunks.slice(0, max);
  }

  function fullScriptScenes() {
    const raw = clean(prompt.value.replace(/\r/g, '\n'));
    if (!raw || wordCount(raw) < 30) return null;
    const parts = splitScript(prompt.value);
    if (!parts || parts.length < 2) return null;
    const topicWords = parts[0].split(/\s+/).slice(0, 6).join(' ').replace(/[.!?,:;]+$/, '');
    const topic = topicWords || 'Lesson';
    const totalWords = parts.reduce((n, p) => n + wordCount(p), 0);
    const target = $('length')?.value === '5 min' ? 300 : $('length')?.value === '2 min' ? 120 : $('length')?.value === '90 sec' ? 90 : 60;
    return parts.map((text, i) => {
      const type = inferType(text, i, parts.length);
      const seconds = Math.max(4, Math.round(target * wordCount(text) / totalWords));
      return {title: titleFor(text, i), narration: text, visual: visualFor(text, type, topic), visualType: type, caption: text, duration: seconds, keywords: `${topic} ${text}`.split(/\s+/).filter(Boolean).slice(0, 12)};
    });
  }

  function renderEditor(scenes) {
    list.innerHTML = scenes.map((s, i) => `<article class="scene editor-scene${i === 0 ? ' active' : ''}" data-index="${i}">
      <div class="scene-toolbar"><span class="scene-num">${String(i + 1).padStart(2, '0')}</span><button type="button" data-action="up" title="Move scene up">↑</button><button type="button" data-action="down" title="Move scene down">↓</button><button type="button" data-action="duplicate" title="Duplicate scene">＋</button><button type="button" data-action="delete" title="Delete scene">×</button></div>
      <div class="scene-content"><label>Title<input class="scene-title" value="${esc(s.title)}"></label><label>Narration<textarea class="scene-narration">${esc(s.narration)}</textarea></label><div class="editor-grid"><label>Visual direction<input class="scene-visual" value="${esc(s.visual)}"></label><label>Visual type<select class="scene-type">${types.map(t => `<option ${t === s.visualType ? 'selected' : ''}>${t}</option>`).join('')}</select></label><label>Seconds<input class="scene-duration" type="number" min="2" max="120" value="${Number(s.duration) || 5}"></label></div><label>Caption<textarea class="scene-caption">${esc(s.caption || s.narration)}</textarea></label><label>Keywords<input class="scene-keywords" value="${esc((s.keywords || []).join(', '))}"></label></div>
    </article>`).join('');
    bindEditor();
  }

  function collect() {
    return [...list.querySelectorAll('.scene')].map((n, i) => ({
      title: clean(n.querySelector('.scene-title')?.value) || `Scene ${i + 1}`,
      narration: clean(n.querySelector('.scene-narration')?.value),
      visual: clean(n.querySelector('.scene-visual')?.value),
      visualType: clean(n.querySelector('.scene-type')?.value) || 'concept',
      caption: clean(n.querySelector('.scene-caption')?.value),
      duration: Math.max(2, Number(n.querySelector('.scene-duration')?.value) || 5),
      keywords: clean(n.querySelector('.scene-keywords')?.value).split(',').map(clean).filter(Boolean)
    }));
  }

  function refreshNumbers() {
    [...list.querySelectorAll('.scene')].forEach((n, i) => { n.dataset.index = i; const num = n.querySelector('.scene-num'); if (num) num.textContent = String(i + 1).padStart(2, '0'); });
  }

  function bindEditor() {
    list.querySelectorAll('.scene').forEach(scene => scene.addEventListener('click', e => {
      const button = e.target.closest('[data-action]');
      if (button) {
        const all = [...list.querySelectorAll('.scene')];
        const i = all.indexOf(scene); const action = button.dataset.action;
        if (action === 'up' && i > 0) scene.parentNode.insertBefore(scene, all[i - 1]);
        if (action === 'down' && i < all.length - 1) scene.parentNode.insertBefore(all[i + 1], scene);
        if (action === 'duplicate') scene.after(scene.cloneNode(true));
        if (action === 'delete' && all.length > 1) scene.remove();
        refreshNumbers(); bindEditor();
        return;
      }
      list.querySelectorAll('.scene').forEach(x => x.classList.remove('active')); scene.classList.add('active');
    }));
  }

  document.addEventListener('click', e => {
    if (e.target !== createBtn) return;
    setTimeout(() => {
      const scenes = fullScriptScenes();
      if (!scenes) return;
      renderEditor(scenes);
      const note = $('formNote'); if (note) note.textContent = `Your script was split into ${scenes.length} editable scenes. The original narration is preserved.`;
      const state = $('projectState'); if (state) state.textContent = 'Script mapped';
      list.dataset.lessonTopic = clean(prompt.value);
    }, 40);
  }, true);

  // Expose a small bridge for future modules and diagnostics.
  window.antenehStoryboardEditor = { collect, renderEditor, fullScriptScenes };
})();
