const prompt = document.getElementById('prompt');
const length = document.getElementById('length');
const style = document.getElementById('style');
const createBtn = document.getElementById('createBtn');
const formNote = document.getElementById('formNote');
const projectState = document.getElementById('projectState');
const storyList = document.querySelector('.story-list');

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[char]));
}

function buildFreeStoryboard(topic, videoLength, visualStyle) {
  const title = topic.length > 70 ? topic.slice(0, 70) + '…' : topic;
  const count = videoLength === '5 min' ? 7 : videoLength === '2 min' ? 6 : 5;
  const templates = [
    ['Hook', `Why does ${topic} matter? Start with a simple question or surprising fact.`, `Opening title card for “${title}”.`],
    ['The big idea', `Introduce ${topic} in clear, simple language and explain the main idea.`, `Clean ${visualStyle.toLowerCase()} showing the central concept.`],
    ['How it works', `Break ${topic} into its most important steps or parts so the viewer can follow easily.`, 'Simple diagram or step-by-step visual.'],
    ['Example', `Give a practical example that helps the viewer understand the idea of ${topic}.`, 'Relatable real-world example with short labels.'],
    ['Key takeaway', `Summarize the most useful point the viewer should remember about ${topic}.`, 'Three concise takeaway cards.'],
    ['Quick recap', `Review the main points from the lesson in a few short sentences.`, 'Animated recap with the main keywords.'],
    ['Closing', `End with one memorable sentence that encourages the viewer to keep learning.`, 'Clean end card with the lesson title.']
  ];
  return { title, hook: templates[0][1], scenes: templates.slice(1, count - 1).map(([title, narration, visual]) => ({ title, narration, visual })), recap: templates[count - 1][1] };
}

function renderScript(script) {
  const items = [{ title:'Hook', narration:script.hook, visual:'Opening hook: ' + script.title }, ...(script.scenes || []), { title:'Recap', narration:script.recap, visual:'Simple recap card showing the key takeaway.' }];
  storyList.innerHTML = items.map((scene,index) => `<article class="scene${index===0?' active':''}"><span class="scene-num">${String(index+1).padStart(2,'0')}</span><div class="scene-content"><input class="scene-title" value="${escapeHtml(scene.title)}" aria-label="Scene title"><textarea class="scene-narration" aria-label="Scene narration">${escapeHtml(scene.narration)}</textarea><input class="scene-visual" value="${escapeHtml(scene.visual)}" aria-label="Visual direction"></div></article>`).join('');
  document.querySelectorAll('.scene').forEach(scene => scene.addEventListener('click', () => { document.querySelectorAll('.scene').forEach(item=>item.classList.remove('active')); scene.classList.add('active'); }));
  localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({topic:prompt.value.trim(), length:length.value, style:style.value, script}));
}

function collectScenes() {
  return [...document.querySelectorAll('.scene')].map((scene,index) => ({
    title: scene.querySelector('.scene-title')?.value || `Scene ${index+1}`,
    narration: scene.querySelector('.scene-narration')?.value || '',
    visual: scene.querySelector('.scene-visual')?.value || ''
  }));
}

function saveProject(message = 'Project saved on this device.') {
  const scenes = collectScenes();
  localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({ topic: prompt.value.trim(), length: length.value, style: style.value, scenes }));
  formNote.textContent = message;
}

function exportProject() {
  const text = collectScenes().map((scene,index) => `${String(index+1).padStart(2,'0')}. ${scene.title}\nNarration: ${scene.narration}\nVisual: ${scene.visual}`).join('\n\n');
  const blob=new Blob([`ANTENEH AI STUDIO\n${prompt.value.trim()}\nLength: ${length.value}\nStyle: ${style.value}\n\n${text}`],{type:'text/plain;charset=utf-8'});
  const url=URL.createObjectURL(blob); const link=document.createElement('a'); link.href=url; link.download='anteneh-ai-studio-storyboard.txt'; link.click(); URL.revokeObjectURL(url);
}

createBtn.addEventListener('click', () => {
  const topic=prompt.value.trim();
  if(!topic){prompt.focus();formNote.textContent='Add a topic or idea first, then create your project.';return;}
  createBtn.disabled=true; createBtn.innerHTML='Building storyboard <span>…</span>'; projectState.textContent='Creating';
  formNote.textContent='Creating your educational storyboard locally — no API key or paid service is used.';
  setTimeout(()=>{renderScript(buildFreeStoryboard(topic,length.value,style.value));projectState.textContent='Storyboard ready';formNote.textContent=`Free storyboard created for “${topic.slice(0,72)}${topic.length>72?'…':''}”. Edit any scene, then save it on your device.`;createBtn.innerHTML='Generate again <span>↻</span>';createBtn.disabled=false;},350);
});

document.getElementById('exportBtn')?.addEventListener('click', exportProject);
document.getElementById('saveBtn')?.addEventListener('click', () => saveProject());
