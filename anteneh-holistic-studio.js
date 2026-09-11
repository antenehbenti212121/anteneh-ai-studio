(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const qs = s => document.querySelector(s);
  const prompt = $('prompt');
  const storyboard = qs('.storyboard-panel');
  if (!prompt || !storyboard || document.getElementById('learningBrief')) return;
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();

  const brief = document.createElement('section');
  brief.id = 'learningBrief';
  brief.className = 'learning-brief panel';
  brief.setAttribute('aria-label', 'Learning brief');
  brief.innerHTML = `
    <div class="panel-head"><div><span class="step">LEARNING FOCUS</span><h2>Make the lesson teachable</h2></div><span class="badge">Optional</span></div>
    <div class="learning-grid">
      <label>Learning objective<textarea id="learningObjective" rows="2" placeholder="By the end, the learner will be able to…"></textarea></label>
      <label>Key terms<textarea id="learningTerms" rows="2" placeholder="term 1, term 2, term 3"></textarea></label>
      <label>Useful example<textarea id="learningExamples" rows="2" placeholder="A concrete real-world connection…"></textarea></label>
      <label>Common misconception<textarea id="learningMisconception" rows="2" placeholder="What learners often get wrong…"></textarea></label>
      <label>Recap<textarea id="learningRecap" rows="2" placeholder="The ideas the learner should remember…"></textarea></label>
      <label>Check for understanding<textarea id="learningCheck" rows="2" placeholder="A short question that tests the lesson…"></textarea></label>
    </div>
    <div class="library-actions"><button id="generateLearningBtn" type="button">Build learning focus</button><button id="saveLearningBtn" type="button">Save</button></div>
    <p id="learningNote" class="form-note">Built locally from your lesson and storyboard. No API key required.</p>`;
  storyboard.insertAdjacentElement('afterend', brief);

  function currentScenes() {
    if (window.antenehStoryboardEditor?.collect) return window.antenehStoryboardEditor.collect();
    return [...document.querySelectorAll('.story-list .scene')].map((n,i) => ({title:clean(n.querySelector('.scene-title')?.value)||`Scene ${i+1}`, narration:clean(n.querySelector('.scene-narration')?.value), visual:clean(n.querySelector('.scene-visual')?.value), visualType:clean(n.querySelector('.scene-type')?.value)||'concept', caption:clean(n.querySelector('.scene-caption')?.value), duration:Number(n.querySelector('.scene-duration')?.value)||5, keywords:[]}));
  }
  function deriveLearning() {
    const scenes=currentScenes().filter(s=>s.narration);
    const topic=clean(prompt.value).split(/[.!?\n]/)[0].replace(/^(explain|teach|describe|what is|how does|how to)\s+/i,'').trim() || 'this topic';
    const words=clean(prompt.value).split(/\s+/).filter(Boolean);
    const candidates=[]; scenes.forEach(s => (s.keywords||[]).forEach(k => candidates.push(k)));
    const rawTerms=[...candidates,...words.filter(w=>/^[A-Za-z][A-Za-z-]{4,}$/.test(w))].map(w=>w.replace(/[^A-Za-z0-9-]/g,''));
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
  function renderLearning(data){if(!data)return;$('learningObjective').value=data.objective||'';$('learningTerms').value=(data.keyTerms||[]).join(', ');$('learningExamples').value=(data.examples||[]).join('\n');$('learningMisconception').value=data.misconception||'';$('learningRecap').value=data.recap||'';$('learningCheck').value=data.check||'';}
  function saveLearning(reason){if(!window.antenehStudioState)return;window.antenehStudioState.setProject({topic:clean(prompt.value),length:$('length')?.value,style:$('style')?.value,learning:readLearning(),scenes:currentScenes(),narration:{recorded:!!window.antenehNarrationBlob}},reason);}

  $('generateLearningBtn').addEventListener('click',()=>{renderLearning(deriveLearning());saveLearning('learning-generated');$('learningNote').textContent='Learning focus built from the current lesson. Review it before rendering.';});
  $('saveLearningBtn').addEventListener('click',()=>{saveLearning('learning-save');window.antenehStudioState?.save();$('learningNote').textContent='Learning focus saved locally.';});
  window.addEventListener('anteneh:statechange',e=>{if(e.detail?.state?.learning && !brief.contains(document.activeElement))renderLearning(e.detail.state.learning);});
})();
