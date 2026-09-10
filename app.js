const prompt = document.getElementById('prompt');
const length = document.getElementById('length');
const style = document.getElementById('style');
const createBtn = document.getElementById('createBtn');
const formNote = document.getElementById('formNote');
const projectState = document.getElementById('projectState');
const storyList = document.querySelector('.story-list');
const videoBtn = document.getElementById('videoBtn');
const videoStatus = document.getElementById('videoStatus');
const videoPreview = document.getElementById('videoPreview');
const downloadVideo = document.getElementById('downloadVideo');
let currentVideoUrl = null;

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

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/); const lines=[]; let line='';
  for (const word of words) { const test=line ? line+' '+word : word; if(ctx.measureText(test).width>maxWidth && line){lines.push(line);line=word;}else line=test; }
  if(line) lines.push(line); return lines;
}

function drawVideoFrame(ctx, canvas, scene, index, total, progress) {
  const w=canvas.width, h=canvas.height;
  const grad=ctx.createLinearGradient(0,0,w,h); grad.addColorStop(0,'#0b1020'); grad.addColorStop(1,'#171331');
  ctx.fillStyle=grad; ctx.fillRect(0,0,w,h);
  const drift=Math.sin(progress*Math.PI)*50;
  ctx.globalAlpha=.18; ctx.fillStyle='#7c5cff'; ctx.beginPath(); ctx.arc(w*.82+drift,h*.18,150,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#22d3ee'; ctx.beginPath(); ctx.arc(w*.12-drift*.35,h*.88,110,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  ctx.fillStyle='#8b9cff'; ctx.font='700 26px system-ui'; ctx.fillText('ANTENEH AI STUDIO',70,70);
  ctx.fillStyle='#77819a'; ctx.font='600 20px system-ui'; ctx.fillText(`SCENE ${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,70,112);
  const titleX=70, titleY=205; ctx.fillStyle='#ffffff'; ctx.font='800 58px system-ui';
  const titleLines=wrapText(ctx,scene.title, w-140).slice(0,2); titleLines.forEach((line,i)=>ctx.fillText(line,titleX,titleY+i*68));
  ctx.fillStyle='#c7cddd'; ctx.font='400 28px system-ui';
  const narration=wrapText(ctx,scene.narration,w-160).slice(0,5); narration.forEach((line,i)=>ctx.fillText(line,80,390+i*40));
  ctx.fillStyle='#69738c'; ctx.font='400 18px system-ui'; const visual=wrapText(ctx,scene.visual,w-160).slice(0,2); visual.forEach((line,i)=>ctx.fillText(line,80,620+i*27));
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(70,h-55,w-140,5);ctx.fillStyle='#8b5cf6';ctx.fillRect(70,h-55,(w-140)*((index+progress)/total),5);
}

async function generateVideo() {
  const scenes=collectScenes();
  if(!scenes.length){videoStatus.textContent='Create a storyboard first.';return;}
  if(!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream){videoStatus.textContent='This browser does not support in-browser video recording.';return;}
  videoBtn.disabled=true; projectState.textContent='Rendering'; videoStatus.textContent='Rendering video locally… keep this page open.'; downloadVideo.hidden=true; videoPreview.hidden=true;
  if(currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
  const canvas=document.createElement('canvas'); canvas.width=1280; canvas.height=720; const ctx=canvas.getContext('2d');
  const stream=canvas.captureStream(24); const mimeCandidates=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'];
  const mime=mimeCandidates.find(type=>MediaRecorder.isTypeSupported(type)) || '';
  let recorder; try { recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:1800000}:{videoBitsPerSecond:1800000}); } catch(error){ videoStatus.textContent='Video recording could not start on this browser.'; videoBtn.disabled=false; return; }
  const chunks=[]; recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  const finished=new Promise(resolve=>recorder.onstop=resolve); recorder.start(500);
  const sceneMs=3000;
  for(let i=0;i<scenes.length;i++){
    const start=performance.now();
    while(performance.now()-start<sceneMs){
      const progress=Math.min(1,(performance.now()-start)/sceneMs); drawVideoFrame(ctx,canvas,scenes[i],i,scenes.length,progress);
      videoStatus.textContent=`Rendering scene ${i+1} of ${scenes.length}…`;
      await new Promise(requestAnimationFrame);
    }
  }
  recorder.stop(); await finished; stream.getTracks().forEach(track=>track.stop());
  const blob=new Blob(chunks,{type:mime||'video/webm'}); currentVideoUrl=URL.createObjectURL(blob); videoPreview.src=currentVideoUrl; videoPreview.hidden=false; videoPreview.load(); downloadVideo.href=currentVideoUrl; downloadVideo.download='anteneh-ai-studio-video.webm'; downloadVideo.textContent=`Download video (${Math.max(1,Math.round(blob.size/1024/1024*10)/10)} MB)`; downloadVideo.hidden=false; projectState.textContent='Video ready'; videoStatus.textContent='Video rendered successfully on this device. Format: WebM.'; videoBtn.disabled=false;
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
videoBtn?.addEventListener('click', generateVideo);
