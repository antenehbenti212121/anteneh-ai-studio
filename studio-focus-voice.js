(() => {
  'use strict';
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();
  const $ = id => document.getElementById(id);

  function buildLearning() {
    const brief = $('learningBrief');
    if (!brief) return;
    const prompt = $('prompt');
    const scenes = [...document.querySelectorAll('.story-list .scene')].map((n,i) => ({
      title: clean(n.querySelector('.scene-title')?.value) || `Scene ${i + 1}`,
      narration: clean(n.querySelector('.scene-narration')?.value),
      visual: clean(n.querySelector('.scene-visual')?.value),
      type: clean(n.querySelector('.scene-type')?.value || n.querySelector('.scene-meta span')?.textContent)
    })).filter(s => s.narration);
    if (!scenes.length) return;
    const topic = clean(prompt?.value).split(/[.!?\n]/)[0].replace(/^(explain|teach|describe|what is|how does|how to)\s+/i,'').trim() || 'this topic';
    const words = clean(prompt?.value).split(/\s+/).filter(w => /^[A-Za-z][A-Za-z-]{4,}$/.test(w));
    const stop = new Set(['about','these','their','which','where','there','because','through','using','lesson','topic','explain','human','activity']);
    const terms = [...new Set(words.map(w => w.replace(/[^A-Za-z0-9-]/g,'').toLowerCase()))].filter(w => !stop.has(w)).slice(0,8);
    const example = scenes.find(s => s.type === 'example') || scenes.find(s => /example|instance|real-world/i.test(s.narration));
    const warning = scenes.find(s => s.type === 'warning') || scenes.find(s => /mistake|misconception|wrong|avoid/i.test(s.narration));
    const recap = scenes.find(s => s.type === 'recap') || scenes[scenes.length - 1];
    const data = {
      objective: `By the end of this lesson, the learner will be able to explain ${topic} and describe its main process, relationship or purpose.`,
      keyTerms: terms.join(', '),
      examples: example?.narration || `Connect ${topic} to one concrete real-world example.`,
      misconception: warning?.narration || `Do not confuse the central idea of ${topic} with a related concept.`,
      recap: recap?.narration || `Remember the main idea, key relationship and why ${topic} matters.`,
      check: `In your own words, what is ${topic}, and what is the most important relationship or step to remember?`
    };
    ['objective','terms','examples','misconception','recap','check'].forEach(k => { const el = $(`learning${k[0].toUpperCase()+k.slice(1)}`); if (el) el.readOnly = true; });
    if ($('learningObjective')) $('learningObjective').value = data.objective;
    if ($('learningTerms')) $('learningTerms').value = data.keyTerms;
    if ($('learningExamples')) $('learningExamples').value = data.examples;
    if ($('learningMisconception')) $('learningMisconception').value = data.misconception;
    if ($('learningRecap')) $('learningRecap').value = data.recap;
    if ($('learningCheck')) $('learningCheck').value = data.check;
    const actions = brief.querySelector('.library-actions');
    if (actions) actions.style.display = 'none';
    const note = $('learningNote');
    if (note) note.textContent = 'Automatically built from your lesson and storyboard. No manual filling or API key required.';
    if (window.antenehStudioState) {
      window.antenehStudioState.setProject({topic: clean(prompt?.value), length: $('length')?.value, style: $('style')?.value, learning: data, scenes, narration:{recorded:!!window.antenehNarrationBlob}}, 'learning-auto');
    }
  }

  function focusVoices() {
    const select = $('voiceSelect');
    if (!select || !('speechSynthesis' in window)) return;
    const all = speechSynthesis.getVoices().filter(v => v && /^(en|am|om)([-_]|$)/i.test(v.lang || ''));
    const previous = select.value;
    select.innerHTML = '';
    if (!all.length) {
      const o = document.createElement('option');
      o.value = ''; o.textContent = 'English / Amharic / Afaan Oromoo voices not installed';
      select.appendChild(o);
      return;
    }
    all.forEach((v,i) => { const o=document.createElement('option'); o.value=String(i); o.textContent=`${v.name} — ${v.lang}`; select.appendChild(o); });
    if (all.some((v,i)=>String(i)===previous)) select.value=previous;
    window.antenehFocusedVoices = all;
  }

  function init() {
    const observer = new MutationObserver(() => { if ($('learningBrief')) buildLearning(); });
    observer.observe(document.body, {childList:true, subtree:true});
    document.addEventListener('click', e => { if (e.target?.closest('#createBtn')) setTimeout(buildLearning, 100); }, true);
    document.addEventListener('input', e => { if (e.target?.closest('.scene-narration,.scene-title,.scene-visual,#prompt')) clearTimeout(window.__learningTimer), window.__learningTimer=setTimeout(buildLearning,350); });
    focusVoices();
    if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', focusVoices);
    window.addEventListener('antene:statechange', () => setTimeout(buildLearning, 50));
    setTimeout(buildLearning, 300);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();