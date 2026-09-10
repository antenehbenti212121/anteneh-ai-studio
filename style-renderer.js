(() => {
  const button = document.getElementById('videoBtn');
  if (!button) return;

  const renderButton = button.cloneNode(true);
  button.replaceWith(renderButton);
  const status = document.getElementById('videoStatus');
  const state = document.getElementById('projectState');
  const preview = document.getElementById('videoPreview');
  const download = document.getElementById('downloadVideo');
  const audioPreview = document.getElementById('audioPreview');
  let outputUrl = null;

  const getScenes = () => [...document.querySelectorAll('.scene')].map((node, i) => ({
    title: node.querySelector('.scene-title')?.value || node.querySelector('strong')?.textContent || `Scene ${i + 1}`,
    narration: node.querySelector('.scene-narration')?.value || node.querySelector('p')?.textContent || '',
    visual: node.querySelector('.scene-visual')?.value || ''
  }));

  const styleName = () => (document.getElementById('style')?.value || 'Clean explainer').toLowerCase();
  const wrap = (ctx, text, width) => {
    const words = String(text || '').trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > width && line) { lines.push(line); line = word; } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };
  const rounded = (ctx, x, y, w, h, r) => {
    const q = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + q, y); ctx.arcTo(x + w, y, x + w, y + h, q); ctx.arcTo(x + w, y + h, x, y + h, q); ctx.arcTo(x, y + h, x, y, q); ctx.arcTo(x, y, x + w, y, q); ctx.closePath();
  };
  const arrow = (ctx, x1, y1, x2, y2) => {
    const a = Math.atan2(y2 - y1, x2 - x1);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x2 - 18 * Math.cos(a - Math.PI / 6), y2 - 18 * Math.sin(a - Math.PI / 6)); ctx.lineTo(x2 - 18 * Math.cos(a + Math.PI / 6), y2 - 18 * Math.sin(a + Math.PI / 6)); ctx.closePath(); ctx.fill();
  };
  const mode = (scene, index) => {
    const t = `${scene.title} ${scene.visual} ${scene.narration}`.toLowerCase();
    if (/timeline|history|historical|century|era|ancient|before|after/.test(t)) return 'timeline';
    if (/cycle|circular|repeat|water cycle|carbon cycle|life cycle/.test(t)) return 'cycle';
    if (/cause|effect|because|leads to|results in|impact|consequence/.test(t)) return 'cause';
    if (/hierarchy|levels|classification|category|categories|types of|layers/.test(t)) return 'hierarchy';
    if (/formula|equation|calculate|percentage|percent|number|math|finance|money|rate|ratio/.test(t)) return 'formula';
    if (/before and after|transform|change|improve|growth|conversion|turn into/.test(t)) return 'beforeafter';
    if (/compare|comparison|versus| vs |difference|similar/.test(t)) return 'compare';
    if (/mistake|misconception|avoid|warning|common error|wrong/.test(t)) return 'warning';
    if (/example|real-world|application|case study/.test(t)) return 'example';
    if (/recap|takeaway|key point|remember|summary|closing/.test(t)) return 'recap';
    if (/step|process|how it works|how to|method|stages/.test(t)) return 'steps';
    if (/definition|what is|meaning|concept|big idea|introduc/.test(t)) return 'concept';
    return ['concept', 'steps', 'example', 'compare', 'recap'][index % 5];
  };

  function drawDiagram(ctx, scene, index, p, style) {
    const m = mode(scene, index), x = 760, y = 185, w = 440, h = 365;
    const white = style === 'whiteboard', modern = style === 'modern presentation', minimal = style === 'minimal motion graphics';
    ctx.save();
    ctx.fillStyle = white ? 'rgba(30,41,59,.06)' : modern ? 'rgba(255,255,255,.10)' : minimal ? 'rgba(255,255,255,.04)' : 'rgba(255,255,255,.055)';
    rounded(ctx, x, y, w, h, white ? 10 : 28); ctx.fill();
    ctx.strokeStyle = white ? '#94a3b8' : 'rgba(255,255,255,.14)'; ctx.lineWidth = white ? 3 : 2; rounded(ctx, x, y, w, h, white ? 10 : 28); ctx.stroke();
    ctx.globalAlpha = Math.min(1, p * 4);
    const ink = white ? '#172033' : '#fff', muted = white ? '#475569' : '#aeb7d1', accent = modern ? '#2563eb' : '#8b5cf6', cyan = '#0891b2';
    ctx.fillStyle = muted; ctx.font = '700 18px system-ui'; ctx.fillText(m === 'concept' ? 'CORE IDEA' : m.toUpperCase(), x + 30, y + 48);

    if (m === 'timeline') {
      ctx.strokeStyle = accent; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x + 55, y + 190); ctx.lineTo(x + 385, y + 190); ctx.stroke();
      ['PAST','CHANGE','NOW','NEXT'].forEach((v,i)=>{const cx=x+55+i*110;ctx.fillStyle=accent;ctx.beginPath();ctx.arc(cx,y+190,16,0,Math.PI*2);ctx.fill();ctx.fillStyle=ink;ctx.font='800 13px system-ui';ctx.textAlign='center';ctx.fillText(v,cx,y+245);ctx.textAlign='left';});
    } else if (m === 'cycle') {
      const cx=x+220,cy=y+195,r=95;ctx.strokeStyle=accent;ctx.lineWidth=18;ctx.beginPath();ctx.arc(cx,cy,r,-Math.PI*.85,Math.PI*1.15);ctx.stroke();ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='800 20px system-ui';ctx.fillText('REPEAT',cx,cy+7);ctx.textAlign='left';
      ctx.fillStyle=cyan;['1','2','3','4'].forEach((v,i)=>{const a=-Math.PI/2+i*Math.PI/2;ctx.beginPath();ctx.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,17,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.fillText(v,cx+Math.cos(a)*r,cy+6+Math.sin(a)*r);ctx.fillStyle=cyan;ctx.textAlign='left';});
    } else if (m === 'cause') {
      ctx.fillStyle=accent; rounded(ctx,x+155,y+135,130,90,20);ctx.fill();ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='800 18px system-ui';ctx.fillText('MAIN EVENT',x+220,y+188);ctx.fillStyle=muted;ctx.font='700 15px system-ui';ctx.fillText('CAUSES',x+75,y+115);ctx.fillText('EFFECTS',x+365,y+115);ctx.strokeStyle=cyan;ctx.lineWidth=4;arrow(ctx,x+80,y+125,x+155,y+160);arrow(ctx,x+285,y+160,x+360,y+125);ctx.textAlign='left';
    } else if (m === 'hierarchy') {
      ctx.fillStyle=accent;rounded(ctx,x+155,y+90,130,65,16);ctx.fill();ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='800 17px system-ui';ctx.fillText('TOP LEVEL',x+220,y+130);for(let i=0;i<3;i++){ctx.fillStyle=white?'#e2e8f0':'#293552';rounded(ctx,x+35+i*135,y+220,105,70,14);ctx.fill();ctx.fillStyle=ink;ctx.font='700 13px system-ui';ctx.fillText(`TYPE ${i+1}`,x+87+i*135,y+260);}ctx.strokeStyle=cyan;ctx.lineWidth=3;for(let i=0;i<3;i++)arrow(ctx,x+220,y+155,x+87+i*135,y+220);ctx.textAlign='left';
    } else if (m === 'formula') {
      ctx.fillStyle=accent;rounded(ctx,x+55,y+115,330,120,22);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 38px system-ui';ctx.fillText('INPUT  +  INPUT  =  RESULT',x+220,y+188);ctx.fillStyle=muted;ctx.font='600 14px system-ui';ctx.fillText('show the relationship clearly',x+220,y+215);ctx.textAlign='left';
    } else if (m === 'beforeafter') {
      ctx.fillStyle=white?'#e2e8f0':'#293552';rounded(ctx,x+30,y+125,155,120,18);ctx.fill();ctx.fillStyle=accent;rounded(ctx,x+255,y+125,155,120,18);ctx.fill();ctx.fillStyle=cyan;ctx.lineWidth=5;ctx.strokeStyle=cyan;arrow(ctx,x+195,y+185,x+250,y+185);ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='800 17px system-ui';ctx.fillText('BEFORE',x+107,y+192);ctx.fillStyle='#fff';ctx.fillText('AFTER',x+332,y+192);ctx.textAlign='left';
    } else if (m === 'steps') {
      ['START','LEARN','APPLY'].forEach((v,i)=>{const bx=x+25+i*135;ctx.fillStyle=i===1?accent:(white?'#e2e8f0':'#293552');rounded(ctx,bx,y+135,110,78,16);ctx.fill();ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='800 15px system-ui';ctx.fillText(`${i+1}. ${v}`,bx+55,y+180);if(i<2){ctx.strokeStyle=cyan;ctx.fillStyle=cyan;ctx.lineWidth=3;arrow(ctx,bx+112,y+174,bx+130,y+174);}});ctx.textAlign='left';
    } else if (m === 'example') {
      ctx.fillStyle=cyan;ctx.beginPath();ctx.arc(x+110,y+180,55,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='800 18px system-ui';ctx.fillText('IDEA',x+110,y+187);ctx.strokeStyle=accent;ctx.fillStyle=accent;ctx.lineWidth=4;arrow(ctx,x+170,y+180,x+255,y+180);rounded(ctx,x+270,y+125,125,110,20);ctx.fill();ctx.fillStyle='#fff';ctx.font='800 18px system-ui';ctx.fillText('REAL',x+332,y+177);ctx.fillText('EXAMPLE',x+332,y+202);ctx.textAlign='left';
    } else if (m === 'compare') {
      ctx.fillStyle=white?'#e2e8f0':'#293552';rounded(ctx,x+30,y+125,160,140,20);ctx.fill();ctx.fillStyle=accent;rounded(ctx,x+250,y+125,160,140,20);ctx.fill();ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='900 28px system-ui';ctx.fillText('A',x+110,y+190);ctx.fillStyle='#fff';ctx.fillText('B',x+330,y+190);ctx.fillStyle=cyan;ctx.font='700 13px system-ui';ctx.fillText('KEY DIFFERENCE',x+220,y+300);ctx.textAlign='left';
    } else if (m === 'warning') {
      ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.moveTo(x+220,y+100);ctx.lineTo(x+285,y+225);ctx.lineTo(x+155,y+225);ctx.closePath();ctx.fill();ctx.fillStyle='#221507';ctx.textAlign='center';ctx.font='900 48px system-ui';ctx.fillText('!',x+220,y+200);ctx.fillStyle=ink;ctx.font='800 20px system-ui';ctx.fillText('CHECK THE COMMON MISTAKE',x+220,y+290);ctx.textAlign='left';
    } else if (m === 'recap') {
      ['REMEMBER','USE','EXPLAIN'].forEach((v,i)=>{ctx.fillStyle=i===1?accent:(white?'#e2e8f0':'#293552');rounded(ctx,x+25+i*135,y+135,115,100,16);ctx.fill();ctx.fillStyle=ink;ctx.textAlign='center';ctx.font='800 14px system-ui';ctx.fillText(v,x+82+i*135,y+190);});ctx.textAlign='left';
    } else {
      ctx.fillStyle=accent;ctx.beginPath();ctx.arc(x+220,y+185,70+Math.sin(p*Math.PI)*6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 22px system-ui';ctx.fillText('BIG IDEA',x+220,y+192);ctx.textAlign='left';
    }
    ctx.restore();
  }

  function draw(ctx, canvas, scene, index, total, p) {
    const w=canvas.width,h=canvas.height,s=styleName();
    const white=s==='whiteboard', modern=s==='modern presentation', minimal=s==='minimal motion graphics';
    if(white){ctx.fillStyle='#f8fafc';ctx.fillRect(0,0,w,h);} else if(modern){const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#0f172a');g.addColorStop(1,'#1d4ed8');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);} else if(minimal){ctx.fillStyle='#111827';ctx.fillRect(0,0,w,h);} else {const g=ctx.createLinearGradient(0,0,w,h);g.addColorStop(0,'#080d1c');g.addColorStop(1,'#1a1437');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);}
    ctx.globalAlpha=.12;ctx.fillStyle=modern?'#93c5fd':'#8b5cf6';ctx.beginPath();ctx.arc(w*.86,h*.16,150+Math.sin(p*Math.PI)*20,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.fillStyle=white?'#64748b':'#a3afff';ctx.font='800 24px system-ui';ctx.fillText('ANTENEH AI STUDIO',65,62);
    ctx.fillStyle=white?'#475569':'#77819a';ctx.font='700 18px system-ui';ctx.fillText(`SCENE ${String(index+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,65,96);
    ctx.fillStyle=white?'#0f172a':'#fff';ctx.font='900 50px system-ui';wrap(ctx,scene.title,620).slice(0,2).forEach((line,i)=>ctx.fillText(line,65,190+i*60));
    ctx.fillStyle=white?'#334155':'#c7cddd';ctx.font='400 24px system-ui';wrap(ctx,scene.narration,620).slice(0,6).forEach((line,i)=>ctx.fillText(line,70,350+i*35));
    drawDiagram(ctx,scene,index,p,s);
    ctx.fillStyle=white?'#cbd5e1':'rgba(255,255,255,.14)';ctx.fillRect(65,h-42,w-130,5);ctx.fillStyle=modern?'#60a5fa':white?'#2563eb':'#8b5cf6';ctx.fillRect(65,h-42,(w-130)*((index+p)/total),5);
    ctx.fillStyle=white?'#64748b':'#69738c';ctx.font='500 15px system-ui';wrap(ctx,scene.visual,1100).slice(0,1).forEach(line=>ctx.fillText(line,65,h-62));
  }

  const durations=(items,audioMs)=>{const weights=items.map(s=>Math.max(1,s.narration.trim().split(/\s+/).filter(Boolean).length));if(audioMs>0){const sum=weights.reduce((a,b)=>a+b,0);return weights.map(w=>audioMs*w/sum);}return weights.map(w=>Math.max(2200,Math.min(10000,w/2.5*1000)));};

  async function getAudioStream() {
    if (!audioPreview?.src || audioPreview.hidden) return { stream:null, duration:0, cleanup:()=>{} };
    const audio = new Audio(audioPreview.src); audio.preload='auto'; audio.crossOrigin='anonymous';
    try { await new Promise((resolve,reject)=>{audio.onloadedmetadata=resolve;audio.onerror=reject;}); } catch (_) { return {stream:null,duration:0,cleanup:()=>{}}; }
    const duration=Number.isFinite(audio.duration)?audio.duration*1000:0;
    let context=null, destination=null, source=null;
    try {
      const AudioCtx=window.AudioContext||window.webkitAudioContext;
      if(AudioCtx && typeof audio.captureStream !== 'function' && typeof audio.mozCaptureStream !== 'function') {
        context=new AudioCtx(); destination=context.createMediaStreamDestination(); source=context.createMediaElementSource(audio); source.connect(destination); source.connect(context.destination);
        return {stream:destination.stream,duration,audio,cleanup:()=>{try{source.disconnect();}catch(_){}try{context.close();}catch(_){}}};
      }
      const direct=audio.captureStream?audio.captureStream():audio.mozCaptureStream();
      return {stream:direct,duration,audio,cleanup:()=>{try{audio.pause();}catch(_){}}};
    } catch (_) { return {stream:null,duration, audio, cleanup:()=>{try{audio.pause();}catch(_){}}}; }
  }

  async function render(){
    const items=getScenes();
    if(!items.length){status.textContent='Create a storyboard first.';return;}
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='This browser does not support in-browser video recording.';return;}
    renderButton.disabled=true;state.textContent='Rendering';status.textContent='Preparing the educational video…';preview.hidden=true;download.hidden=true;if(outputUrl)URL.revokeObjectURL(outputUrl);
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');const videoStream=canvas.captureStream(24);
    const audioInfo=await getAudioStream();const stream=new MediaStream(videoStream.getVideoTracks());if(audioInfo.stream?.getAudioTracks().length)stream.addTrack(audioInfo.stream.getAudioTracks()[0]);
    const ds=durations(items,audioInfo.duration);const mime=['video/mp4;codecs=avc1,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(t=>MediaRecorder.isTypeSupported(t))||'';
    const recorder=new MediaRecorder(stream,mime?{mimeType:mime,videoBitsPerSecond:1800000,audioBitsPerSecond:128000}:{videoBitsPerSecond:1800000});const chunks=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
    const done=new Promise(resolve=>recorder.onstop=resolve);recorder.start(250);const total=ds.reduce((a,b)=>a+b,0);let elapsed=0;
    if(audioInfo.audio){try{await audioInfo.audio.play();}catch(_){}}
    for(let i=0;i<items.length;i++){const start=performance.now();while(performance.now()-start<ds[i]){const p=Math.min(1,(performance.now()-start)/ds[i]);draw(ctx,canvas,items[i],i,items.length,p);elapsed+=0;const percent=Math.round(((i+p)/items.length)*100);status.textContent=`Rendering scene ${i+1} of ${items.length} · ${percent}%`;await new Promise(r=>setTimeout(r,41));}}
    draw(ctx,canvas,items[items.length-1],items.length-1,items.length,1);recorder.stop();await done;audioInfo.cleanup();stream.getTracks().forEach(t=>t.stop());
    const blob=new Blob(chunks,{type:recorder.mimeType||'video/webm'});outputUrl=URL.createObjectURL(blob);preview.src=outputUrl;preview.hidden=false;download.href=outputUrl;const mp4=blob.type.includes('mp4');download.download=`anteneh-ai-studio-lesson.${mp4?'mp4':'webm'}`;download.textContent=`Download ${mp4?'MP4':'WebM'} video`;download.hidden=false;state.textContent='Video ready';status.textContent=`Video ready · ${mp4?'MP4':'WebM'} · ${Math.max(1,Math.round(blob.size/1024/1024*10)/10)} MB`;
    renderButton.disabled=false;
  }
  renderButton.addEventListener('click',render);
})();
