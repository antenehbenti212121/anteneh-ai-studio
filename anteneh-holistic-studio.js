(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const qs = s => document.querySelector(s);
  const prompt = $('prompt');
  if (!prompt || document.getElementById('holisticShell')) return;
  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();

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
    <section id="learningBrief" class="holistic-tools panel" aria-label="Learning brief">
      <div class="panel-head"><div><span class="step">LEARNING BRIEF</span><h2>Make the lesson teachable</h2></div><span class="badge">Editable</span></div>
      <div class="learning-grid">
        <label>Learning objective<textarea id="learningObjective" rows="2" placeholder="By the end, the learner will be able to…"></textarea></label>
        <label>Key terms<textarea id="learningTerms" rows="2" placeholder="term 1, term 2, term 3"></textarea></label>
        <label>Useful examples<textarea id="learningExamples" rows="2" placeholder="A concrete example or real-world connection…"></textarea></label>
        <label>Common misconception<textarea id="learningMisconception" rows="2" placeholder="What learners often get wrong…"></textarea></label>
        <label>Recap<textarea id="learningRecap" rows="2" placeholder="The 2–3 ideas the learner should remember…"></textarea></label>
        <label>Check for understanding<textarea id="learningCheck" rows="2" placeholder="Write a short question that tests the lesson…"></textarea></label>
      </div>
      <div class="library-actions"><button id="generateLearningBtn" type="button">Build learning brief</button><button id="saveLearningBtn" type="button">Save brief</button></div>
      <p id="learningNote" class="form-note">Generated locally from the current lesson. No external AI service is required.</p>
    </section>
    <section id="library" class="holistic-tools panel" aria-label="Project library and templates">
      <div class="panel-head"><div><span class="step">LIBRARY</span><h2>Start faster</h2></div><span class="badge">Local</span></div>
      <div class="template-grid">
        <button data-template="Explain a scientific concept clearly for a beginner. Include the definition, how it works, a real-world example, one common misconception, a short check-for-understanding question and a recap.">🔬 Science lesson</button>
        <button data-template="Teach a process step by step. Explain what is needed, the sequence, one common mistake, an example, a check question and a recap.">⚙️ Step-by-step tutorial</button>
        <button data-template="Compare two options fairly. Explain each option, compare the important differences, discuss trade-offs, give a practical decision rule and recap the choice.">⚖️ Comparison</button>
        <button data-template="Explain a cause-and-effect relationship. Identify the causes, central event, effects, real-world example, misconception and why it matters.">🔗 Cause & effect</button>
      </div>
      <div class="library-actions"><button id="newProjectBtn">New project</button><button id="restoreProjectBtn">Restore saved project</button><button id="clearProjectBtn">Clear local project</button></div>
      <p id="libraryNote" class="form-note">Projects stay on this device unless you export them.</p>
    </section>
    <section id="help" class="holistic-guide panel" aria-label="Studio guide">
      <div class="panel-head"><div><span class="step">GUIDE</span><h2>Build a better lesson</h2></div></div>
      <div class="guide-grid"><article><b>1. Teach one idea</b><span>Use a focused topic or paste your own script.</span></article><article><b>2. Show relationships</b><span>Processes, comparisons, diagrams and examples make abstract ideas visible.</span></article><article><b>3. Edit before rendering</b><span>Every scene's title, narration and visual direction can be changed.</span></article><article><b>4. Add your voice</b><span>Preview device speech or record a real narration track.</span></article><article><b>5. Check learning</b><span>Use the objective, key terms, misconception and check question before export.</span></article><article><b>6. Stay $0</b><span>The core workflow uses browser capabilities and local storage rather than paid API services.</span></article></div>
    </section>`;

  qs('.hero')?.insertAdjacentElement('afterend', shell);
  const jump = target => { const map={create:'.create-panel',storyboard:'.storyboard-panel',voice:'.voice-panel',export:'.video-panel',library:'#library',help:'#help'}; qs(map[target]||'.create-panel')?.scrollIntoView({behavior:'smooth',block:'start'}); };
  shell.querySelectorAll('.studio-nav button').forEach(btn => btn.addEventListener('click', () => { shell.querySelectorAll('.studio-nav button').forEach(x => x.classList.remove('active')); btn.classList.add('active'); jump(btn.dataset.go); }));
  shell.querySelectorAll('[data-template]').forEach(btn => btn.addEventListener('click', () => { prompt.value=btn.dataset.template; prompt.focus(); $('formNote').textContent='Template loaded. Replace it with your topic or script, then create the lesson.'; jump('create'); }));

  function currentScenes() {
    if (window.antenehStoryboardEditor?.collect) return window.antenehStoryboardEditor.collect();
    return [...document.querySelectorAll('.story-list .scene')].map((n,i) => ({title:clean(n.querySelector('.scene-title')?.value)||`Scene ${i+1}`, narration:clean(n.querySelector('.scene-narration')?.value), visual:clean(n.querySelector('.scene-visual')?.value), visualType:clean(n.querySelector('.scene-type')?.value)||'concept', caption:clean(n.querySelector('.scene-caption')?.value), duration:Number(n.querySelector('.scene-duration')?.value)||5, keywords:[]}));
  }
  function deriveLearning() {
    const scenes=currentScenes().filter(s=>s.narration);
    const topic=clean(prompt.value).split(/[.!?\n]/)[0].replace(/^(explain|teach|describe|what is|how does|how to)\s+/i,'').trim() || 'this topic';
    const words=clean(prompt.value).split(/\s+/).filter(Boolean);
    const candidates=[];
    scenes.forEach(s => (s.keywords||[]).forEach(k => candidates.push(k)));
    const rawTerms=[...candidates, ...words.filter(w=>/^[A-Za-z][A-Za-z-]{4,}$/.test(w))].map(w=>w.replace(/[^A-Za-z0-9-]/g,''));
    const terms=[...new Set(rawTerms.map(w=>w.toLowerCase()))].filter(w=>!['about','these','their','which','where','there','because','through','using','lesson','topic'].includes(w)).slice(0,8);
    const exampleScene=scenes.find(s=>s.visualType==='example')||scenes.find(s=>/example|instance|such as/i.test(s.narration));
    const warningScene=scenes.find(s=>s.visualType==='warning')||scenes.find(s=>/misconception|mistake|avoid|wrong|warning/i.test(s.narration));
    const recapScene=scenes.find(s=>s.visualType==='recap')||scenes[scenes.length-1];
    return {
      objective:`By the end of this lesson, the learner will be able to explain ${topic} and describe its main relationship, process or purpose.`,
      keyTerms:terms.join(', '),
      examples:exampleScene?.narration || `Connect ${topic} to one concrete real-world example.`,
      misconception:warningScene?.narration || `Do not confuse the central idea of ${topic} with a related but different concept.`,
      recap:recapScene?.narration || `Remember the main idea, the key relationship and why ${topic} matters.`,
      check:`In your own words, what is ${topic}, and what is the most important relationship or step to remember?`
    };
  }
  function readLearning(){return {objective:$('learningObjective').value,keyTerms:$('learningTerms').value.split(',').map(clean).filter(Boolean),examples:$('learningExamples').value.split(/\n+/).map(clean).filter(Boolean),misconception:$('learningMisconception').value,recap:$('learningRecap').value,check:$('learningCheck').value};}
  function renderLearning(data){ if(!data)return; $('learningObjective').value=data.objective||''; $('learningTerms').value=(data.keyTerms||[]).join(', '); $('learningExamples').value=(data.examples||[]).join('\n'); $('learningMisconception').value=data.misconception||''; $('learningRecap').value=data.recap||''; $('learningCheck').value=data.check||''; }
  function saveLearning(reason='learning') { if(!window.antenehStudioState)return; window.antenehStudioState.setProject({topic:clean(prompt.value),length:$('length')?.value,style:$('style')?.value,learning:readLearning(),scenes:currentScenes(),narration:{recorded:!!window.antenehNarrationBlob}},reason); }

  $('generateLearningBtn').addEventListener('click',()=>{const data=deriveLearning();renderLearning(data);saveLearning('learning-generated');$('learningNote').textContent='Learning brief built from the current topic and storyboard. Review it before rendering.';});
  $('saveLearningBtn').addEventListener('click',()=>{saveLearning('learning-save');window.antenehStudioState?.save();$('learningNote').textContent='Learning brief saved locally with the project.';});

  $('newProjectBtn').addEventListener('click',()=>{prompt.value='';if(window.antenehStudioState)window.antenehStudioState.clear();const list=qs('.story-list');if(list)list.innerHTML='<article class="scene active"><span class="scene-num">01</span><div><strong>Ready</strong><p>Enter a topic and create a lesson.</p></div></article>';$('projectState').textContent='Draft';renderLearning({});$('libraryNote').textContent='New local project started.';jump('create');});
  $('restoreProjectBtn').addEventListener('click',()=>{try{const state=window.antenehStudioState;const data=state?.getProject?.()?.scenes?.length?state.getProject():JSON.parse(localStorage.getItem('anteneh-ai-studio-project-v3')||localStorage.getItem('anteneh-ai-studio-project-v2')||'null');if(!data?.scenes?.length)throw Error('none');prompt.value=data.topic||'';if(data.length&&[...$('length').options].some(o=>o.value===data.length))$('length').value=data.length;if(data.style&&[...$('style').options].some(o=>o.value===data.style))$('style').value=data.style;window.antenehStoryboardEditor?.renderEditor?.(data.scenes);renderLearning(data.learning);$('projectState').textContent='Restored';$('libraryNote').textContent=`Restored ${data.scenes.length} scenes and the learning brief.`;jump('storyboard');}catch{$('libraryNote').textContent='No saved project was found on this device.';}});
  $('clearProjectBtn').addEventListener('click',()=>{window.antenehStudioState?.clear();$('libraryNote').textContent='Local project data cleared.';});

  function update(){const scenes=currentScenes();const words=scenes.reduce((n,s)=>n+clean(s.narration).split(/\s+/).filter(Boolean).length,0);$('healthScenes').textContent=scenes.length;$('healthWords').textContent=words;$('healthProject').textContent=prompt.value.trim()?'Active':'Draft';$('healthMedia').textContent=window.antenehNarrationBlob?'Narration ready':'No audio';}
  qs('.story-list')?.addEventListener('input',update); prompt.addEventListener('input',update); window.addEventListener('storage',update); window.addEventListener('anteneh:statechange',e=>{if(e.detail?.state?.learning && document.activeElement?.id!=='learningObjective')renderLearning(e.detail.state.learning);update();});
  setInterval(update,1200); update();
})();
