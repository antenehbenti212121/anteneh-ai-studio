(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const clean = v => String(v || '').replace(/\s+/g, ' ').trim();
  const words = v => clean(v).split(/\s+/).filter(Boolean);
  const esc = v => String(v || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stop = new Set('the a an and or but for to of in on with from into about this that is are was were be been it its as by at through using use used how what why when where which who your you they their them we our can may will should very more most than then also simple explain lesson idea important one reason something called'.split(' '));

  function classify(title, narration, visual) {
    const t = `${title} ${narration} ${visual}`.toLowerCase();
    if (/recap|summary|takeaway|remember/.test(t)) return 'recap';
    if (/mistake|misconception|warning|error|avoid/.test(t)) return 'warning';
    if (/compare|comparison|versus|\bvs\b|difference|option|side by side|trade-off/.test(t)) return 'compare';
    if (/example|real-world|case|application/.test(t)) return 'example';
    if (/cause|effect|because|leads to|results in|impact/.test(t)) return 'cause';
    if (/step|process|stage|how it works|method|sequence|flow/.test(t)) return 'process';
    if (/input|ingredient|materials|components/.test(t)) return 'inputs';
    return 'concept';
  }

  function extractKeywords(title, narration, topic) {
    const seen = new Set();
    return words(`${title} ${narration} ${topic}`).map(x => x.replace(/[^a-zA-Z0-9%'-]/g, ''))
      .filter(x => x.length > 3 && !stop.has(x.toLowerCase()))
      .filter(x => { const k=x.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 5);
  }

  function visualDirection(type, title, narration, topic, index) {
    const k = extractKeywords(title, narration, topic);
    const a = k[0] || 'IDEA', b = k[1] || 'PROCESS', c = k[2] || 'RESULT';
    const map = {
      concept: `Cinematic concept: ${a} at center, ${b} and ${c} as supporting ideas, subtle depth and a clear visual hierarchy.`,
      process: `Animated process: ${a} → ${b} → ${c}; reveal each stage sequentially with directional arrows and a highlighted active stage.`,
      inputs: `Labeled system: show ${a}, ${b}, and ${c} entering the central system; use clean labels and directional flow.`,
      cause: `Cause-and-effect chain: ${a} → ${b} → ${c}; visually emphasize the causal connection rather than decorative imagery.`,
      example: `Real-world application: connect the core idea ${a} to a recognizable example involving ${b}; show the result ${c}.`,
      compare: `Side-by-side comparison: A and B with matched criteria; highlight the decisive difference and trade-off.`,
      warning: `Mistake → correction visual: make the incorrect path obvious, then animate the correct path with a clear check.`,
      recap: `Three-part recap: ${a} • ${b} • ${c}; reveal the takeaways one at a time and finish with the central lesson.`
    };
    return map[type] || map.concept;
  }

  function improveStoryboard() {
    const list = document.querySelector('.story-list');
    const prompt = $('prompt');
    if (!list || !prompt?.value) return;
    const topic = clean(prompt.value);
    [...list.querySelectorAll('.scene')].forEach((node, i) => {
      const title = clean(node.querySelector('.scene-title')?.value);
      const narration = clean(node.querySelector('.scene-narration')?.value);
      const visual = node.querySelector('.scene-visual');
      if (!visual || !narration) return;
      const type = classify(title, narration, visual.value);
      const current = clean(visual.value);
      const looksGeneric = /BIG IDEA:|START → LEARN → APPLY|three connected steps|concept card|central concept card/i.test(current);
      if (!current || looksGeneric || node.dataset.cinematicTopic !== topic) visual.value = visualDirection(type, title, narration, topic, i);
      node.dataset.cinematicTopic = topic;
      const meta = node.querySelector('.scene-meta span');
      if (meta && (!meta.textContent || /concept|steps/i.test(meta.textContent))) meta.textContent = type === 'process' ? 'process' : type === 'inputs' ? 'labeled diagram' : type;
    });
    list.dispatchEvent(new Event('input', {bubbles:true}));
  }

  function theme(style) {
    if (style === 'Whiteboard') return {bg:'#fffdf8', ink:'#182235', muted:'#667085', accent:'#315dcc', soft:'#e9eef8', card:'#ffffff', grid:'#d9dfeb'};
    if (style === 'Minimal motion graphics') return {bg:'#f3f5fa', ink:'#151b2b', muted:'#596579', accent:'#5a54d6', soft:'#e8e8fb', card:'#ffffff', grid:'#dce1ec'};
    if (style === 'Modern presentation') return {bg:'#090b18', ink:'#ffffff', muted:'#b8c0d4', accent:'#b47cff', soft:'rgba(180,124,255,.16)', card:'rgba(255,255,255,.055)', grid:'rgba(255,255,255,.1)'};
    return {bg:'#071526', ink:'#ffffff', muted:'#b8c5d9', accent:'#43c9e8', soft:'rgba(67,201,232,.13)', card:'rgba(255,255,255,.055)', grid:'rgba(255,255,255,.1)'};
  }
  const rr=(c,x,y,w,h,r=18)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
  const arrow=(c,x1,y1,x2,y2,col)=>{c.strokeStyle=col;c.fillStyle=col;c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();const a=Math.atan2(y2-y1,x2-x1);c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-15*Math.cos(a-.5),y2-15*Math.sin(a-.5));c.lineTo(x2-15*Math.cos(a+.5),y2-15*Math.sin(a+.5));c.closePath();c.fill();};
  const wrap=(c,t,w)=>{let out=[],line='';for(const q of words(t)){const n=line?line+' '+q:q;if(line&&c.measureText(n).width>w){out.push(line);line=q}else line=n}if(line)out.push(line);return out;};
  function chip(c,t,x,y,text,active){c.fillStyle=active?t.accent:t.soft;rr(c,x,y,112,30,15);c.fill();c.fillStyle=active?'#fff':t.ink;c.textAlign='center';c.font='800 11px system-ui';c.fillText(text.slice(0,17),x+56,y+20);}

  function diagram(c,t,type,k,p,topic) {
    const x=730,y=105,w=500,h=450; c.fillStyle=t.card;rr(c,x,y,w,h,28);c.fill();c.strokeStyle=t.grid;c.lineWidth=2;c.stroke();
    const a=k[0]||'IDEA', b=k[1]||'PROCESS', d=k[2]||'RESULT';
    c.fillStyle=t.muted;c.textAlign='left';c.font='800 11px system-ui';c.fillText((type+' • visual explanation').toUpperCase(),x+25,y+28);
    if(/greenhouse/i.test(topic)) return greenhouse(c,t,x,y);
    if(/photosynthesis/i.test(topic)) return photo(c,t,x,y);
    if(/volcano/i.test(topic)) return volcano(c,t,x,y,p);
    if(type==='process'||type==='inputs'){['INPUT','TRANSFORM','OUTPUT'].forEach((q,i)=>{chip(c,t,x+25+i*155,y+170,q,i===Math.floor(p*3));c.fillStyle=t.ink;c.textAlign='center';c.font='800 14px system-ui';c.fillText([a,b,d][i].slice(0,20),x+81+i*155,y+225);if(i<2)arrow(c,x+137+i*155,y+185,x+165+i*155,y+185,t.accent);});}
    else if(type==='compare'){chip(c,t,x+40,y+130,'OPTION A',p<.5);chip(c,t,x+310,y+130,'OPTION B',p>=.5);['KEY FEATURE','TRADE-OFF','BEST FIT'].forEach((q,i)=>{c.fillStyle=t.muted;c.textAlign='center';c.font='800 11px system-ui';c.fillText(q,x+250,y+235+i*58);c.strokeStyle=t.grid;c.beginPath();c.moveTo(x+55,y+250+i*58);c.lineTo(x+445,y+250+i*58);c.stroke();});}
    else if(type==='cause'){node(c,t,x+35,y+165,125,90,'CAUSE',a,p>.15);node(c,t,x+190,y+215,125,90,'EVENT',b,p>.5);node(c,t,x+345,y+165,125,90,'EFFECT',d,p>.8);arrow(c,x+160,y+210,x+190,y+260,t.accent);arrow(c,x+315,y+260,x+345,y+210,t.accent);}
    else if(type==='warning'){c.fillStyle='#f3b43f';c.beginPath();c.moveTo(x+250,y+80);c.lineTo(x+95,y+300);c.lineTo(x+405,y+300);c.closePath();c.fill();c.fillStyle='#182235';c.textAlign='center';c.font='900 58px system-ui';c.fillText('!',x+250,y+250);c.fillStyle=t.ink;c.font='900 14px system-ui';c.fillText('CHECK → CORRECT → APPLY',x+250,y+355);}
    else if(type==='example'){node(c,t,x+30,y+145,175,180,'IDEA',a,p<.5);arrow(c,x+210,y+235,x+290,y+235,t.accent);node(c,t,x+310,y+145,160,180,'EXAMPLE',b,p>=.5);}
    else if(type==='recap'){['REMEMBER','UNDERSTAND','APPLY'].forEach((q,i)=>{node(c,t,x+30+i*155,y+165,125,125,q,[a,b,d][i],i===Math.floor(p*3));});}
    else {c.fillStyle=t.accent;c.beginPath();c.arc(x+250,y+220,82+10*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();c.fillStyle='#fff';c.textAlign='center';c.font='900 20px system-ui';wrap(c,a,145).slice(0,2).forEach((q,i)=>c.fillText(q,x+250,y+215+i*25));['WHY','HOW','RESULT'].forEach((q,i)=>chip(c,t,x+35+i*145,y+360,q,i===Math.floor(p*3)));}
  }
  function node(c,t,x,y,w,h,head,text,active){c.fillStyle=active?t.accent:t.soft;rr(c,x,y,w,h,18);c.fill();c.fillStyle=active?'#fff':t.ink;c.textAlign='center';c.font='900 11px system-ui';c.fillText(head,x+w/2,y+27);c.font='700 13px system-ui';wrap(c,text,w-20).slice(0,3).forEach((q,i)=>c.fillText(q,x+w/2,y+55+i*17));}
  function greenhouse(c,t,x,y){c.fillStyle='#f3c74d';c.beginPath();c.arc(x+90,y+180,40,0,Math.PI*2);c.fill();c.fillStyle=t.ink;c.textAlign='center';c.font='900 11px system-ui';c.fillText('SUN',x+90,y+184);c.fillStyle='#4d7dbd';c.beginPath();c.arc(x+255,y+335,100,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='900 17px system-ui';c.fillText('EARTH',x+255,y+341);arrow(c,x+125,y+180,x+195,y+275,t.accent);arrow(c,x+135,y+195,x+205,y+290,t.accent);c.strokeStyle='#f0a23a';c.lineWidth=5;c.beginPath();c.arc(x+255,y+335,140,Math.PI*1.12,Math.PI*1.88);c.stroke();arrow(c,x+350,y+260,x+390,y+175,'#f0a23a');c.fillStyle=t.ink;c.font='800 12px system-ui';c.fillText('SUNLIGHT IN',x+28,y+105);c.fillText('HEAT OUT',x+360,y+120);c.fillText('GREENHOUSE GASES',x+300,y+420);}
  function photo(c,t,x,y){c.fillStyle='#5dbd69';c.beginPath();c.ellipse(x+250,y+245,88,140,-.35,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.textAlign='center';c.font='900 20px system-ui';c.fillText('LEAF',x+250,y+250);c.fillStyle='#f3c74d';c.beginPath();c.arc(x+75,y+125,40,0,Math.PI*2);c.fill();c.fillStyle=t.ink;c.font='800 11px system-ui';c.fillText('LIGHT',x+75,y+181);arrow(c,x+110,y+145,x+185,y+205,t.accent);arrow(c,x+250,y+90,x+250,y+110,t.accent);arrow(c,x+390,y+195,x+315,y+225,t.accent);arrow(c,x+250,y+390,x+250,y+455,t.accent);c.fillStyle=t.ink;c.font='800 12px system-ui';c.fillText('CO₂',x+395,y+195);c.fillText('WATER',x+250,y+438);c.fillText('GLUCOSE + O₂',x+250,y+475);}
  function volcano(c,t,x,y,p){c.fillStyle='#8b6b5a';c.beginPath();c.moveTo(x+120,y+390);c.lineTo(x+250,y+145);c.lineTo(x+380,y+390);c.closePath();c.fill();c.fillStyle='#d95b43';c.beginPath();c.moveTo(x+220,y+390);c.lineTo(x+250,y+245);c.lineTo(x+280,y+390);c.closePath();c.fill();c.fillStyle='#b83f32';c.beginPath();c.ellipse(x+250,y+395,100,38,0,0,Math.PI*2);c.fill();c.fillStyle='#f0a23a';c.beginPath();c.arc(x+250,y+395,45+15*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();arrow(c,x+250,y+380,x+250,y+205,t.accent);c.fillStyle=t.ink;c.textAlign='center';c.font='900 13px system-ui';c.fillText('VENT',x+250,y+175);c.fillText('MAGMA CHAMBER',x+250,y+455);c.fillText('PRESSURE + GAS',x+250,y+105);}

  function renderVideo() {
    const list=[...document.querySelectorAll('.scene')].map((n,i)=>({title:clean(n.querySelector('.scene-title')?.value)||`Scene ${i+1}`,narration:clean(n.querySelector('.scene-narration')?.value),visual:clean(n.querySelector('.scene-visual')?.value),type:classify(n.querySelector('.scene-title')?.value||'',n.querySelector('.scene-narration')?.value||'',n.querySelector('.scene-visual')?.value||'')})).filter(s=>s.narration);
    const button=$('videoBtn'), status=$('videoStatus'), preview=$('videoPreview'), download=$('downloadVideo'), audio=$('audioPreview');
    if(!button||!status||!preview||!download||!list.length) return;
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='This browser cannot render video locally.';return;}
    button.disabled=true;status.textContent='Rendering cinematic lesson…';preview.hidden=true;download.hidden=true;
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const c=canvas.getContext('2d');const stream=canvas.captureStream(24);let audioEl=null, audioStream=null;
    const getAudio=async()=>{if(!audio?.src||audio.hidden)return;try{audioEl=new Audio(audio.src);await new Promise((r,j)=>{audioEl.onloadedmetadata=r;audioEl.onerror=j});const AC=window.AudioContext||window.webkitAudioContext;if(AC){const ac=new AC(),src=ac.createMediaElementSource(audioEl),dest=ac.createMediaStreamDestination();src.connect(dest);src.connect(ac.destination);audioStream=dest.stream;await ac.resume().catch(()=>{});}}catch(_){audioEl=null;}};
    getAudio().then(()=>{const combined=new MediaStream();stream.getVideoTracks().forEach(x=>combined.addTrack(x));audioStream?.getAudioTracks().forEach(x=>combined.addTrack(x));const mime=['video/mp4','video/webm;codecs=vp9,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x))||'';let rec;try{rec=new MediaRecorder(combined,mime?{mimeType:mime,videoBitsPerSecond:3000000,audioBitsPerSecond:128000}:{videoBitsPerSecond:3000000});}catch(_){status.textContent='Video recording could not start on this browser.';button.disabled=false;return;}const chunks=[];rec.ondataavailable=e=>e.data.size&&chunks.push(e.data);rec.onstop=()=>{const blob=new Blob(chunks,{type:rec.mimeType||'video/webm'});const url=URL.createObjectURL(blob);preview.src=url;preview.hidden=false;download.href=url;download.download=`anteneh-ai-studio-${Date.now()}.${(rec.mimeType||'').includes('mp4')?'mp4':'webm'}`;download.hidden=false;status.textContent=`Finished • ${list.length} cinematic scenes${audioEl?' • narration included':''}`;button.disabled=false;};rec.start(250);if(audioEl)audioEl.play().catch(()=>{});const durations=list.map(s=>Math.max(3.5,Math.min(9,words(s.narration).length/2.35)));const total=durations.reduce((a,b)=>a+b,0);let elapsed=0;list.forEach((s,i)=>{const frames=Math.max(1,Math.round(durations[i]*24));for(let f=0;f<frames;f++){const p=f/frames;drawFrame(c,s,i,list.length,p,elapsed/total,$('style')?.value||'Clean explainer');}elapsed+=durations[i];});
      // redraw with timing so the capture receives every frame in order
      let i=0, start=performance.now(), sceneStart=0;const tick=now=>{if(i>=list.length){rec.stop();return;}const local=(now-start-sceneStart)/1000,d=durations[i],p=Math.min(1,Math.max(0,local/d));drawFrame(c,list[i],i,list.length,p,(sceneStart+local)/total,$('style')?.value||'Clean explainer');if(p>=1){sceneStart+=d;i++;}requestAnimationFrame(tick);};requestAnimationFrame(tick);});
  }
  function drawFrame(c,s,i,total,p,global,style){const t=theme(style),topic=clean($('prompt')?.value);c.fillStyle=t.bg;c.fillRect(0,0,1280,720);if(style!=='Whiteboard'){const g=c.createLinearGradient(0,0,1280,720);g.addColorStop(0,t.bg);g.addColorStop(1,style==='Modern presentation'?'#17132b':'#10283e');c.fillStyle=g;c.fillRect(0,0,1280,720);}else{c.strokeStyle=t.grid;c.lineWidth=1;for(let y=80;y<720;y+=36){c.beginPath();c.moveTo(0,y);c.lineTo(1280,y);c.stroke();}}
c.fillStyle=t.accent;c.textAlign='left';c.font='900 17px system-ui';c.fillText('ANTENEH AI STUDIO',48,35);c.fillStyle=t.muted;c.font='800 11px system-ui';c.fillText(`EDUCATIONAL LESSON  •  SCENE ${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,48,56);c.fillStyle=t.ink;c.font='900 43px system-ui';wrap(c,s.title,610).slice(0,2).forEach((q,n)=>c.fillText(q,48,132+n*50));c.fillStyle=t.muted;c.font='400 18px system-ui';wrap(c,s.narration,610).slice(0,5).forEach((q,n)=>c.fillText(q,48,270+n*29));extractKeywords(s.title,s.narration,topic).forEach((q,n)=>chip(c,t,48+n*114,445,q,n===Math.floor(p*5)));diagram(c,t,s.type,extractKeywords(s.title,s.narration,topic),p,topic);c.fillStyle='rgba(0,0,0,.84)';rr(c,48,600,1184,68,18);c.fill();const cap=wrap(c,s.narration,1120);c.fillStyle='#fff';c.textAlign='center';c.font='800 17px system-ui';c.fillText(cap[Math.min(cap.length-1,Math.floor(p*cap.length))]||s.narration,640,642);c.fillStyle=t.accent;c.fillRect(48,704,1184*Math.min(1,global+p/total),4);}

  document.addEventListener('click', e => { if(e.target?.id==='createBtn') setTimeout(improveStoryboard,80); }, false);
  $('videoBtn')?.addEventListener('click', e => { e.preventDefault(); e.stopImmediatePropagation(); renderVideo(); }, true);
  new MutationObserver(() => setTimeout(improveStoryboard,60)).observe(document.querySelector('.story-list')||document.body,{childList:true,subtree:true});
  setTimeout(improveStoryboard,300);
})();
