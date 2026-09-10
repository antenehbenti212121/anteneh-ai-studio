(() => {
  const prompt = document.getElementById('prompt');
  const style = document.getElementById('style');
  const storyList = document.querySelector('.story-list');
  const formNote = document.getElementById('formNote');
  const panel = document.querySelector('.storyboard-panel');
  if (!storyList) return;

  const stop = new Set(['the','and','for','with','that','this','from','into','your','about','what','when','where','will','have','does','more','than','then','they','their','are','you','how','why']);
  const words = text => String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean);

  function getScenes() {
    return [...document.querySelectorAll('.scene')].map((scene, index) => ({
      title: scene.querySelector('.scene-title')?.value || scene.querySelector('strong')?.textContent || `Scene ${index + 1}`,
      narration: scene.querySelector('.scene-narration')?.value || scene.querySelector('p')?.textContent || '',
      visual: scene.querySelector('.scene-visual')?.value || ''
    }));
  }

  function saveQuietly() {
    try {
      const existing = JSON.parse(localStorage.getItem('anteneh-ai-studio-project') || '{}');
      localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({ ...existing, topic: prompt?.value?.trim() || existing.topic || '', style: style?.value || existing.style || '', scenes: getScenes() }));
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

  function addDashboard() {
    if (!panel || document.getElementById('studioDashboard')) return;
    const box = document.createElement('div');
    box.id = 'studioDashboard';
    box.className = 'studio-dashboard';
    box.innerHTML = `<div class="dashboard-head"><strong>Lesson dashboard</strong><span>LIVE</span></div><div class="dashboard-stats"><div><b id="dashScenes">0</b><small>scenes</small></div><div><b id="dashWords">0</b><small>words</small></div><div><b id="dashTime">0:00</b><small>estimated</small></div></div><div class="dashboard-actions"><button type="button" id="copyOutlineBtn">Copy outline</button><button type="button" id="exportJsonBtn">Export JSON</button></div>`;
    const pipeline = panel.querySelector('.pipeline');
    pipeline ? panel.insertBefore(box, pipeline) : panel.appendChild(box);

    box.querySelector('#copyOutlineBtn').addEventListener('click', async () => {
      const text = getScenes().map((s,i) => `${String(i+1).padStart(2,'0')}. ${s.title}\n${s.narration}`).join('\n\n');
      try { await navigator.clipboard.writeText(text); } catch { const a=document.createElement('textarea');a.value=text;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove(); }
      const b = box.querySelector('#copyOutlineBtn'); b.textContent='Copied ✓'; setTimeout(()=>b.textContent='Copy outline',1400);
    });

    box.querySelector('#exportJsonBtn').addEventListener('click', () => {
      const payload={studio:'ANTENEH AI STUDIO',topic:prompt?.value?.trim()||'',length:document.getElementById('length')?.value||'',style:style?.value||'',scenes:getScenes()};
      const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}));
      const a=document.createElement('a');a.href=url;a.download='anteneh-ai-studio-project.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    });
  }

  function updateDashboard() {
    const scenes=getScenes();
    const count=scenes.reduce((n,s)=>n+words(s.narration).length,0);
    const sec=Math.max(0,Math.round(count/2.4));
    document.getElementById('dashScenes')?.replaceChildren(String(scenes.length));
    document.getElementById('dashWords')?.replaceChildren(String(count));
    document.getElementById('dashTime')?.replaceChildren(`${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`);
  }

  function decorateScenes() {
    document.querySelectorAll('.scene').forEach((scene,index) => {
      let meta=scene.querySelector('.scene-meta');
      if(!meta){meta=document.createElement('div');meta.className='scene-meta';scene.querySelector('.scene-content')?.appendChild(meta);}
      meta.textContent=`${words(scene.querySelector('.scene-narration')?.value || '').length} words • scene ${String(index+1).padStart(2,'0')}`;
    });
  }

  function refresh(){ addDashboard(); decorateScenes(); addIntelligenceBar(); updateDashboard(); }
  const observer=new MutationObserver(()=>setTimeout(refresh,0));
  observer.observe(storyList,{childList:true,subtree:true});
  storyList.addEventListener('input',()=>{saveQuietly();decorateScenes();addIntelligenceBar();updateDashboard();});
  prompt?.addEventListener('input',saveQuietly); style?.addEventListener('change',saveQuietly);
  document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='s'){event.preventDefault();saveQuietly();if(formNote)formNote.textContent='Project saved automatically on this device.';}});
  refresh();
})();
