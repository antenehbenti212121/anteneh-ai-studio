(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const qs = s => document.querySelector(s);
  const prompt = $('prompt');
  if (!prompt || document.getElementById('holisticShell')) return;

  const shell = document.createElement('div');
  shell.id = 'holisticShell';
  shell.innerHTML = `
    <div class="studio-nav" role="navigation" aria-label="Studio workspace">
      <button data-go="create" class="active">Create</button><button data-go="storyboard">Storyboard</button><button data-go="voice">Voice</button><button data-go="export">Export</button><button data-go="library">Library</button><button data-go="help">Guide</button>
    </div>
    <section class="holistic-overview panel" aria-label="Studio overview">
      <div><span class="eyebrow">YOUR EDUCATION WORKSPACE</span><h2>One studio for the whole learning-video workflow.</h2><p>Plan the lesson, shape the story, build visuals, prepare narration, check the project and export — without leaving the studio.</p></div>
      <div class="health-grid"><div><b id="healthProject">Draft</b><small>project</small></div><div><b id="healthScenes">0</b><small>scenes</small></div><div><b id="healthWords">0</b><small>words</small></div><div><b id="healthMedia">No audio</b><small>media</small></div></div>
    </section>
    <section id="library" class="holistic-tools panel" aria-label="Project library and templates">
      <div class="panel-head"><div><span class="step">LIBRARY</span><h2>Start faster</h2></div><span class="badge">Local</span></div>
      <div class="template-grid">
        <button data-template="Explain a scientific concept clearly for a beginner. Include the definition, how it works, a real-world example and a recap.">🔬 Science lesson</button>
        <button data-template="Teach a process step by step. Explain what is needed, the sequence, one common mistake, an example and a recap.">⚙️ Step-by-step tutorial</button>
        <button data-template="Compare two options fairly. Explain each option, compare the important differences, discuss trade-offs and give a practical decision rule.">⚖️ Comparison</button>
        <button data-template="Explain a cause-and-effect relationship. Identify the causes, the central event, the effects, an example and why it matters.">🔗 Cause & effect</button>
      </div>
      <div class="library-actions"><button id="newProjectBtn">New project</button><button id="restoreProjectBtn">Restore saved project</button><button id="clearProjectBtn">Clear local project</button></div>
      <p id="libraryNote" class="form-note">Projects stay on this device unless you export them.</p>
    </section>
    <section id="help" class="holistic-guide panel" aria-label="Studio guide">
      <div class="panel-head"><div><span class="step">GUIDE</span><h2>Build a better lesson</h2></div></div>
      <div class="guide-grid"><article><b>1. Teach one idea</b><span>Use a focused topic or paste your own script.</span></article><article><b>2. Show relationships</b><span>Processes, comparisons, diagrams and examples make abstract ideas visible.</span></article><article><b>3. Edit before rendering</b><span>Every scene's title, narration and visual direction can be changed.</span></article><article><b>4. Add your voice</b><span>Preview device speech or record a real narration track.</span></article><article><b>5. Check the result</b><span>Preview the actual video before sharing or downloading it.</span></article><article><b>6. Stay $0</b><span>The core workflow uses browser capabilities and local storage rather than paid API services.</span></article></div>
    </section>`;

  qs('.hero')?.insertAdjacentElement('afterend', shell);
  const jump = target => { const map={create:'.create-panel',storyboard:'.storyboard-panel',voice:'.voice-panel',export:'.video-panel',library:'#library',help:'#help'}; qs(map[target]||'.create-panel')?.scrollIntoView({behavior:'smooth',block:'start'}); };
  shell.querySelectorAll('.studio-nav button').forEach(btn=>btn.addEventListener('click',()=>{shell.querySelectorAll('.studio-nav button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');jump(btn.dataset.go);}));
  shell.querySelectorAll('[data-template]').forEach(btn=>btn.addEventListener('click',()=>{prompt.value=btn.dataset.template;prompt.focus();$('formNote').textContent='Template loaded. Add your topic, then create the lesson.';jump('create');}));
  $('newProjectBtn').addEventListener('click',()=>{prompt.value='';const list=qs('.story-list');if(list)list.innerHTML='<article class="scene active"><span class="scene-num">01</span><div><strong>Ready</strong><p>Enter a topic and create a lesson.</p></div></article>';$('projectState').textContent='Draft';$('libraryNote').textContent='New local project started.';jump('create');});
  $('restoreProjectBtn').addEventListener('click',()=>{try{const data=JSON.parse(localStorage.getItem('anteneh-ai-studio-project-v2')||localStorage.getItem('anteneh-ai-studio-project')||'null');if(!data?.scenes?.length)throw Error('none');prompt.value=data.topic||'';if(data.length&&[...$('length').options].some(o=>o.value===data.length))$('length').value=data.length;if(data.style&&[...$('style').options].some(o=>o.value===data.style))$('style').value=data.style;const list=qs('.story-list');list.innerHTML=data.scenes.map((s,i)=>`<article class="scene${i===0?' active':''}"><span class="scene-num">${String(i+1).padStart(2,'0')}</span><div class="scene-content"><input class="scene-title" value="${esc(s.title)}"><textarea class="scene-narration">${esc(s.narration)}</textarea><input class="scene-visual" value="${esc(s.visual)}"></div></article>`).join('');list.querySelectorAll('.scene').forEach(n=>n.addEventListener('click',()=>{list.querySelectorAll('.scene').forEach(x=>x.classList.remove('active'));n.classList.add('active')}));$('projectState').textContent='Restored';$('libraryNote').textContent=`Restored ${data.scenes.length} scenes.`;jump('storyboard');}catch{$('libraryNote').textContent='No saved project was found on this device.';}});
  $('clearProjectBtn').addEventListener('click',()=>{localStorage.removeItem('anteneh-ai-studio-project-v2');localStorage.removeItem('anteneh-ai-studio-project');$('libraryNote').textContent='Local project data cleared.';});
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function update(){const scenes=[...document.querySelectorAll('.scene')];const words=scenes.reduce((n,s)=>n+String(s.querySelector('.scene-narration')?.value||'').trim().split(/\s+/).filter(Boolean).length,0);$('healthScenes').textContent=scenes.length;$('healthWords').textContent=words;$('healthProject').textContent=prompt.value.trim()?'Active':'Draft';$('healthMedia').textContent=window.antenehNarrationBlob?'Narration ready':'No audio';}
  qs('.story-list')?.addEventListener('input',update);prompt.addEventListener('input',update);window.addEventListener('storage',update);setInterval(update,1200);update();
})();
