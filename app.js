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
const voiceSelect = document.getElementById('voiceSelect');
const voiceRate = document.getElementById('voiceRate');
const speakBtn = document.getElementById('speakBtn');
const stopSpeakBtn = document.getElementById('stopSpeakBtn');
const voiceStatus = document.getElementById('voiceStatus');
const recordBtn = document.getElementById('recordBtn');
const stopRecordBtn = document.getElementById('stopRecordBtn');
const recordStatus = document.getElementById('recordStatus');
const audioPreview = document.getElementById('audioPreview');
let currentVideoUrl = null;
let deviceVoices = [];
let narrationBlob = null;
let narrationUrl = null;
let narrationRecorder = null;
let narrationStream = null;

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
  bindSceneSelection();
  localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({topic:prompt.value.trim(), length:length.value, style:style.value, script}));
}

function bindSceneSelection() {
  document.querySelectorAll('.scene').forEach(scene => scene.addEventListener('click', () => {
    document.querySelectorAll('.scene').forEach(item=>item.classList.remove('active'));
    scene.classList.add('active');
    voiceStatus.textContent = 'Active scene selected. Press “Speak active scene” to preview it.';
  }));
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
  localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({ topic:prompt.value.trim(), length:length.value, style:style.value, scenes }));
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
  const titleLines=wrapText(ctx,scene.title,w-140).slice(0,2); titleLines.forEach((line,i)=>ctx.fillText(line,titleX,titleY+i*68));
  ctx.fillStyle='#c7cddd'; ctx.font='400 28px system-ui';
  const narration=wrapText(ctx,scene.narration,w-160).slice(0,5); narration.forEach((line,i)=>ctx.fillText(line,80,390+i*40));
  ctx.fillStyle='#69738c'; ctx.font='400 18px system-ui'; const visual=wrapText(ctx,scene.visual,w-160).slice(0,2); visual.forEach((line,i)=>ctx.fillText(line,80,620+i*27));
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(70,h-55,w-140,5);ctx.fillStyle='#8b5cf6';ctx.fillRect(70,h-55,(w-140)*((index+progress)/total),5);
}

function chooseVideoMime() {
  return ['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(type=>MediaRecorder.isTypeSupported(type)) || '';
}

async function generateVideo() {
  const scenes=collectScenes();
  if(!scenes.length){videoStatus.textContent='Create a storyboard first.';return;}
  if(!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream){videoStatus.textContent='This browser does not support in-browser video recording.';return;}
  videoBtn.disabled=true; projectState.textContent='Rendering'; videoStatus.textContent=narrationBlob ? 'Rendering video with your recorded narration… keep this page open.' : 'Rendering video locally… keep this page open.'; downloadVideo.hidden=true; videoPreview.hidden=true;
  if(currentVideoUrl) URL.revokeObjectURL(currentVideoUrl);
  const canvas=document.createElement('canvas'); canvas.width=1280; canvas.height=720; const ctx=canvas.getContext('2d');
  const videoStream=canvas.captureStream(24);
  let audioElement=null, audioStream=null;
  if(narrationBlob){
    narrationUrl=narrationUrl || URL.createObjectURL(narrationBlob);
    audioElement=new Audio(narrationUrl); audioElement.preload='auto'; audioElement.volume=1;
    try { await new Promise((resolve,reject)=>{audioElement.onloadedmetadata=resolve; audioElement.onerror=reject;}); audioStream=audioElement.captureStream ? audioElement.captureStream() : (audioElement.mozCaptureStream ? audioElement.mozCaptureStream() : null); } catch(error){ audioStream=null; }
  }
  const combined=new MediaStream(); videoStream.getVideoTracks().forEach(track=>combined.addTrack(track)); if(audioStream) audioStream.getAudioTracks().forEach(track=>combined.addTrack(track));
  const mime=chooseVideoMime();
  let recorder; try { recorder=new MediaRecorder(combined,mime?{mimeType:mime,videoBitsPerSecond:1800000,audioBitsPerSecond:128000}:{videoBitsPerSecond:1800000,audioBitsPerSecond:128000}); } catch(error){ videoStatus.textContent='Video recording could not start on this browser.'; videoBtn.disabled=false; return; }
  const chunks=[]; recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
  const finished=new Promise(resolve=>recorder.onstop=resolve); recorder.start(500);
  const audioDuration=audioElement?.duration && Number.isFinite(audioElement.duration) ? audioElement.duration*1000 : 0;
  const totalMs=audioDuration>0 ? Math.max(audioDuration,scenes.length*2000) : scenes.length*3000;
  const sceneMs=totalMs/scenes.length;
  if(audioElement) { try { await audioElement.play(); } catch(error) {} }
  for(let i=0;i<scenes.length;i++){
    const start=performance.now();
    while(performance.now()-start<sceneMs){
      const progress=Math.min(1,(performance.now()-start)/sceneMs); drawVideoFrame(ctx,canvas,scenes[i],i,scenes.length,progress);
      videoStatus.textContent=`Rendering scene ${i+1} of ${scenes.length}${narrationBlob?' with narration':''}…`;
      await new Promise(requestAnimationFrame);
    }
  }
  if(audioElement){audioElement.pause();audioElement.currentTime=0;}
  recorder.stop(); await finished; combined.getTracks().forEach(track=>track.stop()); videoStream.getTracks().forEach(track=>track.stop());
  const blob=new Blob(chunks,{type:mime||'video/webm'}); currentVideoUrl=URL.createObjectURL(blob); videoPreview.src=currentVideoUrl; videoPreview.hidden=false; videoPreview.load(); downloadVideo.href=currentVideoUrl; downloadVideo.download=narrationBlob?'anteneh-ai-studio-video-with-narration.webm':'anteneh-ai-studio-video.webm'; downloadVideo.textContent=`Download video${narrationBlob?' with narration':''} (${Math.max(1,Math.round(blob.size/1024/1024*10)/10)} MB)`; downloadVideo.hidden=false; projectState.textContent='Video ready'; videoStatus.textContent=narrationBlob ? 'Video rendered successfully with your narration. Format: WebM.' : 'Video rendered successfully on this device. Format: WebM.'; videoBtn.disabled=false;
}

function populateVoices() {
  if(!('speechSynthesis' in window) || !voiceSelect) return;
  deviceVoices=window.speechSynthesis.getVoices().filter(voice=>voice.lang&&voice.name);
  if(!deviceVoices.length) return;
  const english=deviceVoices.filter(voice=>/^en(-|_)/i.test(voice.lang));
  const voices=english.length?english:deviceVoices;
  voiceSelect.innerHTML=voices.map((voice,index)=>`<option value="${index}">${escapeHtml(voice.name)} — ${escapeHtml(voice.lang)}</option>`).join('');
  voiceSelect._voiceList=voices;
  voiceStatus.textContent=`${voices.length} device voice${voices.length===1?'':'s'} available.`;
}

function speakActiveScene() {
  if(!('speechSynthesis' in window)){voiceStatus.textContent='Speech synthesis is not available in this browser.';return;}
  const active=document.querySelector('.scene.active'); const text=active?.querySelector('.scene-narration')?.value?.trim();
  if(!text){voiceStatus.textContent='The active scene has no narration.';return;}
  const voices=voiceSelect?._voiceList||deviceVoices; window.speechSynthesis.cancel(); const utterance=new SpeechSynthesisUtterance(text); const selected=voices[Number(voiceSelect?.value)];
  if(selected) utterance.voice=selected; utterance.rate=Number(voiceRate?.value||1); utterance.pitch=1;
  utterance.onstart=()=>{voiceStatus.textContent='Speaking the active scene…';}; utterance.onend=()=>{voiceStatus.textContent='Voice preview finished.';}; utterance.onerror=()=>{voiceStatus.textContent='The device could not play this voice preview.';}; window.speechSynthesis.speak(utterance);
}

async function startNarrationRecording() {
  if(!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder){recordStatus.textContent='This browser cannot record microphone audio.';return;}
  try{
    narrationStream=await navigator.mediaDevices.getUserMedia({audio:true});
    const mime=['audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'].find(type=>MediaRecorder.isTypeSupported(type))||'';
    narrationRecorder=new MediaRecorder(narrationStream,mime?{mimeType:mime}:{ });
    const chunks=[]; narrationRecorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    narrationRecorder.onstop=()=>{
      narrationBlob=new Blob(chunks,{type:narrationRecorder.mimeType||mime||'audio/webm'});
      if(narrationUrl) URL.revokeObjectURL(narrationUrl); narrationUrl=URL.createObjectURL(narrationBlob); audioPreview.src=narrationUrl; audioPreview.hidden=false;
      narrationStream?.getTracks().forEach(track=>track.stop()); narrationStream=null; recordBtn.disabled=false; stopRecordBtn.disabled=true; recordStatus.textContent=`Narration recorded (${Math.max(1,Math.round(narrationBlob.size/1024))} KB). It will be included in the next video render.`;
    };
    narrationRecorder.start(); recordBtn.disabled=true; stopRecordBtn.disabled=false; recordStatus.textContent='Recording… speak your narration clearly, then press Stop recording.';
  }catch(error){recordStatus.textContent='Microphone permission was not granted or recording failed.';}
}

function stopNarrationRecording(){ if(narrationRecorder&&narrationRecorder.state!=='inactive') narrationRecorder.stop(); }

createBtn.addEventListener('click',()=>{
  const topic=prompt.value.trim(); if(!topic){prompt.focus();formNote.textContent='Add a topic or idea first, then create your project.';return;}
  createBtn.disabled=true; createBtn.innerHTML='Building storyboard <span>…</span>'; projectState.textContent='Creating'; formNote.textContent='Creating your educational storyboard locally — no API key or paid service is used.';
  setTimeout(()=>{renderScript(buildFreeStoryboard(topic,length.value,style.value));projectState.textContent='Storyboard ready';formNote.textContent=`Free storyboard created for “${topic.slice(0,72)}${topic.length>72?'…':''}”. Edit any scene, then save it on your device.`;createBtn.innerHTML='Generate again <span>↻</span>';createBtn.disabled=false;},350);
});

document.getElementById('exportBtn')?.addEventListener('click',exportProject);
document.getElementById('saveBtn')?.addEventListener('click',()=>saveProject());
videoBtn?.addEventListener('click',generateVideo);
speakBtn?.addEventListener('click',speakActiveScene);
stopSpeakBtn?.addEventListener('click',()=>{if('speechSynthesis' in window)window.speechSynthesis.cancel();voiceStatus.textContent='Voice preview stopped.';});
recordBtn?.addEventListener('click',startNarrationRecording);
stopRecordBtn?.addEventListener('click',stopNarrationRecording);
if('speechSynthesis' in window){populateVoices();window.speechSynthesis.onvoiceschanged=populateVoices;}
bindSceneSelection();
