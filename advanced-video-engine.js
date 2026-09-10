(() => {
  const original = document.getElementById('videoBtn');
  if (!original) return;
  const button = original.cloneNode(true);
  original.replaceWith(button);

  const status = document.getElementById('videoStatus');
  const state = document.getElementById('projectState');
  const preview = document.getElementById('videoPreview');
  const download = document.getElementById('downloadVideo');
  const audioPreview = document.getElementById('audioPreview');
  const styleSelect = document.getElementById('style');
  let outputUrl = null;

  const getScenes = () => [...document.querySelectorAll('.scene')].map((node, i) => ({
    title: node.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
    narration: node.querySelector('.scene-narration')?.value || '',
    visual: node.querySelector('.scene-visual')?.value || ''
  }));

  const words = text => String(text).trim().split(/\s+/).filter(Boolean);
  const clean = text => String(text).replace(/[^a-z0-9\s-]/gi, ' ').replace(/\s+/g, ' ').trim();
  const keywords = text => words(clean(text).toLowerCase()).filter(w => w.length > 3 && !['this','that','with','from','into','about','your','they','their','what','when','where','which','using','will','have','does','more','than','then','also','because','these','those'].includes(w)).slice(0, 5);

  const wrap = (ctx, text, width) => {
    const result = []; let line = '';
    for (const word of words(text)) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > width && line) { result.push(line); line = word; }
      else line = test;
    }
    if (line) result.push(line);
    return result;
  };

  const rr = (ctx, x, y, w, h, r = 18) => {
    const q = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + q, y); ctx.arcTo(x + w, y, x + w, y + h, q);
    ctx.arcTo(x + w, y + h, x, y + h, q); ctx.arcTo(x, y + h, x, y, q);
    ctx.arcTo(x, y, x + w, y, q); ctx.closePath();
  };

  const arrow = (ctx, x1, y1, x2, y2) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 14 * Math.cos(a - .5), y2 - 14 * Math.sin(a - .5));
    ctx.lineTo(x2 - 14 * Math.cos(a + .5), y2 - 14 * Math.sin(a + .5));
    ctx.closePath(); ctx.fill();
  };

  const mode = scene => {
    const t = `${scene.title} ${scene.visual} ${scene.narration}`.toLowerCase();
    if (/timeline|history|year|century|before|after|evolution|development/.test(t)) return 'timeline';
    if (/cycle|water cycle|carbon cycle|cell cycle|circular|repeat/.test(t)) return 'cycle';
    if (/cause|effect|leads to|results in|because/.test(t)) return 'cause';
    if (/formula|equation|calculate|number|percent|percentage|math|finance|money|rate/.test(t)) return 'formula';
    if (/hierarchy|levels|types|categories|classif|layers|parts of/.test(t)) return 'hierarchy';
    if (/before|after|transform|change|improve|growth/.test(t)) return 'before';
    if (/compare|comparison|versus| vs |difference|similar/.test(t)) return 'compare';
    if (/mistake|misconception|avoid|warning|common error|wrong/.test(t)) return 'warning';
    if (/example|real-world|application|case study/.test(t)) return 'example';
    if (/recap|takeaway|key point|remember|summary|closing/.test(t)) return 'recap';
    if (/step|process|how it works|how to|method|stages/.test(t)) return 'steps';
    if (/definition|what is|meaning|concept|big idea|introduc/.test(t)) return 'concept';
    return 'concept';
  };

  const drawWhiteboard = (ctx, scene, i, p, w, h) => {
    ctx.fillStyle = '#fffdf5'; ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#20252f'; ctx.fillStyle = '#20252f'; ctx.lineWidth = 4;
    const k = keywords(`${scene.title} ${scene.narration}`); const m = mode(scene);
    ctx.font = '800 24px system-ui'; ctx.fillText('ANTENEH AI STUDIO • WHITEBOARD', 65, 60);
    ctx.font = '800 48px system-ui';
    wrap(ctx, scene.title, 650).slice(0,2).forEach((line,n) => ctx.fillText(line,65,145+n*55));
    ctx.font = '600 20px system-ui'; ctx.fillStyle = '#4b5563'; ctx.fillText(`Lesson ${i+1} • ${m}`, 68, 245);
    ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 5;
    if (m === 'steps') {
      ['START','LEARN','APPLY'].forEach((s,n) => { const x=720+n*155; ctx.beginPath(); ctx.arc(x,300,52,0,Math.PI*2); ctx.stroke(); ctx.fillStyle='#20252f'; ctx.font='800 16px system-ui'; ctx.textAlign='center'; ctx.fillText(s,x,306); if(n<2){ctx.strokeStyle='#16a34a';arrow(ctx,x+55,300,x+100,300);ctx.strokeStyle='#2563eb';} });
    } else if (m === 'timeline') {
      ctx.beginPath();ctx.moveTo(700,330);ctx.lineTo(1160,330);ctx.stroke();
      ['PAST','CHANGE','TODAY'].forEach((s,n)=>{const x=730+n*210;ctx.beginPath();ctx.arc(x,330,18,0,Math.PI*2);ctx.fillStyle='#2563eb';ctx.fill();ctx.fillStyle='#20252f';ctx.font='800 18px system-ui';ctx.textAlign='center';ctx.fillText(s,x,380);});
    } else if (m === 'cycle') {
      ctx.beginPath();ctx.arc(940,330,125,0,Math.PI*2);ctx.stroke(); ctx.fillStyle='#16a34a';ctx.font='800 22px system-ui';ctx.textAlign='center';ctx.fillText('CYCLE',940,338); arrow(ctx,940,195,1035,250); arrow(ctx,1070,330,1010,420); arrow(ctx,870,450,810,380); arrow(ctx,810,280,875,220);
    } else if (m === 'cause') {
      ctx.fillStyle='#fee2e2';rr(ctx,700,260,160,100,18);ctx.fill();ctx.fillStyle='#20252f';ctx.font='800 20px system-ui';ctx.textAlign='center';ctx.fillText('CAUSE',780,315);ctx.strokeStyle='#dc2626';ctx.fillStyle='#dc2626';arrow(ctx,865,310,1010,310);ctx.fillStyle='#dc2626';rr(ctx,1020,260,160,100,18);ctx.fill();ctx.fillStyle='#fff';ctx.fillText('EFFECT',1100,315);
    } else if (m === 'formula') {
      ctx.fillStyle='#e0f2fe';rr(ctx,700,260,480,130,24);ctx.fill();ctx.fillStyle='#0f172a';ctx.font='800 42px system-ui';ctx.textAlign='center';ctx.fillText(k[0] ? k.slice(0,2).join(' + ') : 'INPUT × RATE = RESULT',940,340);
    } else if (m === 'hierarchy') {
      ctx.fillStyle='#dbeafe';rr(ctx,860,255,160,65,16);ctx.fill();ctx.fillStyle='#0f172a';ctx.font='800 18px system-ui';ctx.textAlign='center';ctx.fillText('MAIN IDEA',940,295); ['TYPE A','TYPE B','TYPE C'].forEach((s,n)=>{const x=715+n*150;ctx.strokeStyle='#64748b';arrow(ctx,940,325,x,395);ctx.fillStyle='#f1f5f9';rr(ctx,x-60,400,120,60,14);ctx.fill();ctx.fillStyle='#0f172a';ctx.fillText(s,x,437);});
    } else if (m === 'before') {
      ctx.fillStyle='#f1f5f9';rr(ctx,700,255,180,120,18);ctx.fill();ctx.fillStyle='#dc2626';ctx.font='800 22px system-ui';ctx.fillText('BEFORE',790,320);ctx.strokeStyle='#16a34a';ctx.fillStyle='#16a34a';arrow(ctx,890,315,1000,315);ctx.fillStyle='#dcfce7';rr(ctx,1010,255,180,120,18);ctx.fill();ctx.fillStyle='#166534';ctx.fillText('AFTER',1100,320);
    } else {
      ctx.fillStyle='#2563eb';ctx.beginPath();ctx.arc(940,320,75+8*Math.sin(p*Math.PI),0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 23px system-ui';ctx.textAlign='center';ctx.fillText(m==='example'?'EXAMPLE':m==='compare'?'A  VS  B':m==='warning'?'AVOID THIS':m==='recap'?'TAKEAWAYS':'BIG IDEA',940,328);
    }
    ctx.textAlign='left'; ctx.fillStyle='#4b5563'; ctx.font='600 17px system-ui';
    if(k.length) ctx.fillText(`Key ideas: ${k.join(' • ')}`,65,h-70);
    ctx.strokeStyle='#94a3b8';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(65,h-45);ctx.lineTo(w-65,h-45);ctx.stroke();
  };

  const drawPresentation = (ctx, scene, i, total, p, w, h) => {
    const grad=ctx.createLinearGradient(0,0,w,h);grad.addColorStop(0,'#071225');grad.addColorStop(1,'#211642');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    const m=mode(scene), k=keywords(`${scene.title} ${scene.narration}`); const slide=(1-Math.min(1,p*5))*45;
    ctx.save();ctx.translate(-slide,0);ctx.fillStyle='#9da9ff';ctx.font='700 25px system-ui';ctx.fillText('ANTENEH AI STUDIO • EXPLAINER',65,65);ctx.fillStyle='#7e8aa5';ctx.font='600 18px system-ui';ctx.fillText(`SCENE ${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')} • ${m.toUpperCase()}`,65,100);ctx.fillStyle='#fff';ctx.font='800 52px system-ui';wrap(ctx,scene.title,610).slice(0,2).forEach((l,n)=>ctx.fillText(l,65,190+n*60));ctx.fillStyle='#c9d0df';ctx.font='400 24px system-ui';wrap(ctx,scene.narration,610).slice(0,6).forEach((l,n)=>ctx.fillText(l,70,350+n*34));ctx.restore();
    ctx.save();ctx.globalAlpha=Math.min(1,p*4);ctx.fillStyle='rgba(255,255,255,.055)';rr(ctx,730,145,470,400,28);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.12)';ctx.stroke();ctx.textAlign='center';
    const centerX=965; if(m==='timeline'){ctx.strokeStyle='#22d3ee';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(785,350);ctx.lineTo(1145,350);ctx.stroke();['PAST','CHANGE','NOW'].forEach((s,n)=>{const x=805+n*170;ctx.fillStyle='#22d3ee';ctx.beginPath();ctx.arc(x,350,13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 16px system-ui';ctx.fillText(s,x,395);});} else if(m==='cycle'){ctx.strokeStyle='#22d3ee';ctx.lineWidth=5;ctx.beginPath();ctx.arc(centerX,350,120,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#8b5cf6';ctx.font='800 25px system-ui';ctx.fillText('CYCLE',centerX,360);} else if(m==='cause'){ctx.fillStyle='#27304d';rr(ctx,765,290,145,105,18);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 20px system-ui';ctx.fillText('CAUSE',837,350);ctx.strokeStyle='#22d3ee';ctx.fillStyle='#22d3ee';arrow(ctx,920,342,1020,342);ctx.fillStyle='#3a2c63';rr(ctx,1025,290,145,105,18);ctx.fill();ctx.fillStyle='#fff';ctx.fillText('EFFECT',1097,350);} else if(m==='formula'){ctx.fillStyle='#22d3ee';rr(ctx,775,270,380,150,24);ctx.fillStyle='#06121f';ctx.font='800 30px system-ui';ctx.fillText(k.length?k.slice(0,3).join(' • '):'INPUT  →  FORMULA  →  RESULT',965,355);} else if(m==='hierarchy'){ctx.fillStyle='#8b5cf6';rr(ctx,885,235,160,60,15);ctx.fillStyle='#fff';ctx.font='800 17px system-ui';ctx.fillText('MAIN IDEA',965,273);['A','B','C'].forEach((s,n)=>{ctx.strokeStyle='#66708a';arrow(ctx,965,300,825+n*140,400);ctx.fillStyle='#27304d';rr(ctx,765+n*140,405,120,65,14);ctx.fillStyle='#fff';ctx.fillText(`TYPE ${s}`,825+n*140,445);});} else if(m==='before'){ctx.fillStyle='#27304d';rr(ctx,765,290,155,105,18);ctx.fillStyle='#fff';ctx.font='800 19px system-ui';ctx.fillText('BEFORE',842,350);ctx.strokeStyle='#22d3ee';ctx.fillStyle='#22d3ee';arrow(ctx,930,342,1000,342);ctx.fillStyle='#164a58';rr(ctx,1010,290,155,105,18);ctx.fillStyle='#fff';ctx.fillText('AFTER',1087,350);} else {ctx.fillStyle=m==='warning'?'#f59e0b':'#8b5cf6';ctx.beginPath();ctx.arc(centerX,340,82+7*Math.sin(p*Math.PI),0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='900 22px system-ui';ctx.fillText(m==='warning'?'WATCH OUT':m==='example'?'REAL EXAMPLE':m==='compare'?'A  VS  B':m==='recap'?'3 TAKEAWAYS':'BIG IDEA',centerX,348);}
    ctx.restore();ctx.textAlign='left';ctx.fillStyle='#68738d';ctx.font='400 16px system-ui';ctx.fillText(k.length?`Visual focus: ${k.join(' • ')}`:scene.visual,65,h-65);ctx.fillStyle='rgba(255,255,255,.13)';ctx.fillRect(65,h-42,w-130,5);ctx.fillStyle='#8b5cf6';ctx.fillRect(65,h-42,(w-130)*((i+p)/total),5);
  };

  const durations = (items, audioMs) => { const ws=items.map(s=>Math.max(1,words(s.narration).length)); if(audioMs>0){const sum=ws.reduce((a,b)=>a+b,0);return ws.map(w=>audioMs*w/sum);} return ws.map(w=>Math.max(2600,Math.min(9000,w/2.4*1000))); };

  async function render(){
    const items=getScenes(); if(!items.length){status.textContent='Create a storyboard first.';return;}
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='This browser cannot render video locally.';return;}
    button.disabled=true; state.textContent='Rendering'; preview.hidden=true;download.hidden=true;status.textContent='Building explainer scenes…'; if(outputUrl)URL.revokeObjectURL(outputUrl);
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');const stream=canvas.captureStream(24);let audio=null,audioStream=null,audioMs=0;
    if(audioPreview?.src&&!audioPreview.hidden){audio=new Audio(audioPreview.src);audio.preload='auto';try{await new Promise((ok,bad)=>{audio.onloadedmetadata=ok;audio.onerror=bad});audioMs=Number.isFinite(audio.duration)?audio.duration*1000:0;audioStream=audio.captureStream?audio.captureStream():audio.mozCaptureStream?audio.mozCaptureStream():null;}catch(_){audio=null;audioStream=null;}}
    if(audioStream)audioStream.getAudioTracks().forEach(t=>stream.addTrack(t));
    const ds=durations(items,audioMs),total=ds.reduce((a,b)=>a+b,0);const mime=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x));if(!mime){status.textContent='No supported video recording format found.';button.disabled=false;return;}
    const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:1800000,audioBitsPerSecond:128000});const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data)};
    const style=styleSelect?.value||'Clean explainer';let started=false;
    const finish=()=>new Promise(resolve=>{recorder.onstop=()=>resolve();recorder.stop()});
    recorder.start(250);started=true;if(audio)audio.play().catch(()=>{});
    const start=performance.now();
    for(let i=0;i<items.length;i++){const until=performance.now()+ds[i];while(performance.now()<until){const p=Math.min(1,1-(until-performance.now())/ds[i]);if(style==='Whiteboard')drawWhiteboard(ctx,items[i],i,p,1280,720);else drawPresentation(ctx,items[i],i,items.length,p,1280,720);status.textContent=`Rendering scene ${i+1} of ${items.length} • ${Math.round(((performance.now()-start)/total)*100)}%`;await new Promise(r=>requestAnimationFrame(r));}}
    if(audio)audio.pause();if(started)await finish();stream.getTracks().forEach(t=>t.stop());outputUrl=URL.createObjectURL(new Blob(chunks,{type:mime.split(';')[0]}));preview.src=outputUrl;preview.hidden=false;download.href=outputUrl;download.download=`anteneh-ai-studio-${Date.now()}.webm`;download.textContent='Download WebM video';download.hidden=false;state.textContent='Video ready';status.textContent=audioStream?'Advanced explainer video ready with recorded narration.':'Advanced explainer video ready. Add recorded narration to include voice in the video.';button.disabled=false;
  }
  button.addEventListener('click',render);
})();
