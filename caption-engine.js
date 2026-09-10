(() => {
  const old = document.getElementById('videoBtn');
  if (!old) return;
  const button = old.cloneNode(true);
  old.replaceWith(button);
  const $ = id => document.getElementById(id);
  const status = $('videoStatus');
  const state = $('projectState');
  const preview = $('videoPreview');
  const download = $('downloadVideo');
  const audioPreview = $('audioPreview');
  const styleSelect = $('style');
  let outputUrl = null;

  const getScenes = () => [...document.querySelectorAll('.scene')].map((n, i) => ({
    title: n.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
    narration: n.querySelector('.scene-narration')?.value || '',
    visual: n.querySelector('.scene-visual')?.value || ''
  }));
  const words = s => String(s).trim().split(/\s+/).filter(Boolean);
  const wrap = (ctx, text, width) => {
    const out = []; let line = '';
    for (const word of words(text)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width > width && line) { out.push(line); line = word; } else line = next;
    }
    if (line) out.push(line); return out;
  };
  const round = (c,x,y,w,h,r=18) => { r=Math.min(r,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); };
  const mode = s => { const t=`${s.title} ${s.visual} ${s.narration}`.toLowerCase();
    if (/timeline|history|year|century|era|past|future/.test(t)) return 'timeline';
    if (/cycle|circular|repeat|water cycle|carbon cycle/.test(t)) return 'cycle';
    if (/cause|effect|because|leads to|results in|impact/.test(t)) return 'cause';
    if (/formula|equation|calculate|percentage|percent|math|number|rate|ratio/.test(t)) return 'formula';
    if (/hierarchy|levels|types|categories|classification|layers/.test(t)) return 'hierarchy';
    if (/before|after|transform|change|growth|improve/.test(t)) return 'before';
    if (/compare|comparison|versus|difference|similar/.test(t)) return 'compare';
    if (/mistake|misconception|avoid|warning|error|wrong/.test(t)) return 'warning';
    if (/example|real-world|application|case study/.test(t)) return 'example';
    if (/recap|takeaway|key point|remember|summary|closing/.test(t)) return 'recap';
    if (/step|process|how it works|how to|method|stages/.test(t)) return 'steps';
    return 'concept';
  };
  const palette = style => style === 'Whiteboard' ? {bg:'#fffdf7',ink:'#172033',muted:'#536176',accent:'#2563eb',line:'#dbe4ef'} : style === 'Minimal motion graphics' ? {bg:'#f7f8fb',ink:'#172033',muted:'#536176',accent:'#5b5bd6',line:'#dfe3ef'} : {bg:'#0b1224',ink:'#fff',muted:'#b9c3d8',accent:'#8b5cf6',line:'rgba(255,255,255,.14)'};
  const captionChunks = text => { const ws=words(text); const size=9; const out=[]; for(let i=0;i<ws.length;i+=size) out.push(ws.slice(i,i+size).join(' ')); return out.length?out:['']; };

  function drawDiagram(c, s, m, p, pal) {
    const x=760,y=155,w=440,h=400; c.save(); c.textAlign='center'; c.fillStyle=pal.bg==='#fffdf7'?'#fff': 'rgba(255,255,255,.055)'; c.strokeStyle=pal.line; c.lineWidth=2; round(c,x,y,w,400,26); c.fill(); c.stroke(); c.fillStyle=pal.muted; c.font='800 16px system-ui'; c.fillText(m.toUpperCase(),980,y+38);
    c.strokeStyle=pal.accent; c.fillStyle=pal.accent; c.lineWidth=5;
    if(m==='steps'){ ['START','LEARN','APPLY'].forEach((v,i)=>{const bx=x+28+i*137,by=y+105+Math.sin(p*Math.PI+i)*5;c.fillStyle=i===1?pal.accent:pal.line;round(c,bx,by,108,82,18);c.fill();c.fillStyle=i===1?'#fff':pal.ink;c.font='900 18px system-ui';c.fillText(i+1,bx+54,by+32);c.font='700 13px system-ui';c.fillText(v,bx+54,by+57);}); }
    else if(m==='timeline'){c.beginPath();c.moveTo(x+60,y+205);c.lineTo(x+380,y+205);c.stroke();['PAST','CHANGE','NOW'].forEach((v,i)=>{const q=x+70+i*150;c.beginPath();c.arc(q,y+205,14,0,Math.PI*2);c.fill();c.fillStyle=pal.ink;c.font='800 15px system-ui';c.fillText(v,q,y+250);c.fillStyle=pal.accent;});}
    else if(m==='cycle'){c.beginPath();c.arc(980,y+210,120,0,Math.PI*2);c.stroke();c.fillStyle=pal.ink;c.font='900 25px system-ui';c.fillText('CYCLE',980,y+218);}
    else if(m==='cause'){c.fillStyle=pal.line;round(c,x+35,y+140,145,85,16);c.fill();c.fillStyle=pal.ink;c.font='800 18px system-ui';c.fillText('CAUSE',x+108,y+190);c.fillStyle=pal.accent;round(c,x+260,y+140,145,85,16);c.fill();c.fillStyle='#fff';c.fillText('EFFECT',x+332,y+190);}
    else if(m==='formula'){c.fillStyle=pal.line;round(c,x+35,y+140,370,120,22);c.fill();c.fillStyle=pal.ink;c.font='900 27px system-ui';c.fillText('INPUT  →  RULE  →  RESULT',980,y+210);}
    else if(m==='hierarchy'){c.fillStyle=pal.accent;round(c,x+140,y+90,160,62,15);c.fillStyle='#fff';c.font='800 16px system-ui';c.fillText('MAIN IDEA',980,y+128);['TYPE A','TYPE B','TYPE C'].forEach((v,i)=>{c.fillStyle=pal.line;round(c,x+25+i*135,y+245,110,58,14);c.fillStyle=pal.ink;c.font='700 13px system-ui';c.fillText(v,x+80+i*135,y+280);});}
    else { c.fillStyle=m==='warning'?'#f59e0b':pal.accent; c.beginPath();c.arc(980,y+210,82+7*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='900 20px system-ui';c.fillText(m==='warning'?'WATCH OUT':m==='example'?'REAL EXAMPLE':m==='recap'?'TAKEAWAY':'BIG IDEA',980,y+217); }
    c.restore();
  }

  function draw(c,s,i,total,p,style,caption) {
    const pal=palette(style), w=c.canvas.width,h=c.canvas.height,m=mode(s); c.clearRect(0,0,w,h); c.fillStyle=pal.bg;c.fillRect(0,0,w,h);
    if(style==='Clean explainer'||style==='Modern presentation'){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#071225');g.addColorStop(1,style==='Modern presentation'?'#251744':'#141b35');c.fillStyle=g;c.fillRect(0,0,w,h);}
    if(style==='Whiteboard'){c.strokeStyle=pal.line;c.lineWidth=1;for(let y=90;y<h;y+=42){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}}
    c.fillStyle=pal.accent;c.font='900 22px system-ui';c.fillText('ANTENEH AI STUDIO',55,52);c.fillStyle=pal.muted;c.font='700 15px system-ui';c.fillText(`SCENE ${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,55,80);
    const slide=(1-Math.min(1,p*5))*30;c.save();c.globalAlpha=Math.min(1,p*5);c.translate(-slide,0);c.fillStyle=pal.ink;c.font='900 50px system-ui';wrap(c,s.title,620).slice(0,2).forEach((v,n)=>c.fillText(v,55,175+n*58));c.fillStyle=pal.muted;c.font='400 22px system-ui';wrap(c,s.narration,620).slice(0,6).forEach((v,n)=>c.fillText(v,60,335+n*32));c.restore();
    drawDiagram(c,s,m,p,pal);
    if(caption){c.fillStyle='rgba(0,0,0,.78)';round(c,150,h-145,980,70,20);c.fill();c.fillStyle='#fff';c.font='800 23px system-ui';wrap(c,caption,900).slice(0,2).forEach((v,n)=>c.fillText(v,640,h-105+n*28));}
    c.fillStyle=pal.muted;c.font='500 14px system-ui';c.fillText(s.visual,55,h-62);c.fillStyle=pal.accent;c.fillRect(55,h-36,(w-110)*((i+p)/total),5);
  }

  function mime(){const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return types.find(t=>MediaRecorder.isTypeSupported(t))||'';}
  async function audioTrack(){
    if(!audioPreview?.src||audioPreview.hidden)return {stream:null,ms:0,cleanup:()=>{}};
    const a=new Audio(audioPreview.src);a.preload='auto'; await new Promise((ok,bad)=>{a.onloadedmetadata=ok;a.onerror=bad;}); const ms=Number.isFinite(a.duration)?a.duration*1000:0;
    try{const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error('no audio context');const ctx=new C();const src=ctx.createMediaElementSource(a);const dest=ctx.createMediaStreamDestination();src.connect(dest);src.connect(ctx.destination);await ctx.resume();return{stream:dest.stream,ms,a,play:()=>a.play(),cleanup:()=>{try{src.disconnect();dest.disconnect();ctx.close();}catch(_){}}};}catch(_){return{stream:a.captureStream?a.captureStream():null,ms,a,play:()=>a.play(),cleanup:()=>{}};}
  }
  async function render(){
    const items=getScenes();if(!items.length){status.textContent='Create a project first.';return;}if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video recording is not supported by this browser.';return;}
    button.disabled=true;state.textContent='Rendering';preview.hidden=true;download.hidden=true;status.textContent='Preparing captions and video…';if(outputUrl)URL.revokeObjectURL(outputUrl);
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const c=canvas.getContext('2d');const stream=canvas.captureStream(24);let au={stream:null,ms:0,cleanup:()=>{}};try{au=await audioTrack();}catch(_){ }
    if(au.stream)au.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
    const ws=items.map(s=>Math.max(1,words(s.narration).length)),sum=ws.reduce((a,b)=>a+b,0);const durations=ws.map(x=>au.ms?Math.max(1400,au.ms*x/sum):Math.max(2200,Math.min(9000,x/2.4*1000)));const total=durations.reduce((a,b)=>a+b,0);const type=mime();let rec;try{rec=new MediaRecorder(stream,type?{mimeType:type,videoBitsPerSecond:2200000,audioBitsPerSecond:128000}:{videoBitsPerSecond:2200000});}catch(_){status.textContent='This browser could not start its video encoder.';button.disabled=false;state.textContent='Draft';au.cleanup();return;}
    const chunks=[];rec.ondataavailable=e=>e.data?.size&&chunks.push(e.data);const stopped=new Promise(resolve=>rec.onstop=resolve);rec.start(250);if(au.play)try{await au.play();}catch(_){ }
    for(let i=0;i<items.length;i++){const d=durations[i],start=performance.now(),caps=captionChunks(items[i].narration);while(performance.now()-start<d){const p=Math.min(1,(performance.now()-start)/d);const ci=Math.min(caps.length-1,Math.floor(p*caps.length));draw(c,items[i],i,items.length,p,styleSelect?.value||'Clean explainer',caps[ci]);const percent=Math.round(((durations.slice(0,i).reduce((a,b)=>a+b,0)+p*d)/total)*100);status.textContent=`Rendering scene ${i+1} of ${items.length} • ${percent}%`;await new Promise(r=>requestAnimationFrame(r));}}
    rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());au.cleanup();if(au.a)au.a.pause();const blob=new Blob(chunks,{type:rec.mimeType||type||'video/webm'});if(!blob.size){status.textContent='No video data was produced. Please try again.';button.disabled=false;state.textContent='Draft';return;}
    outputUrl=URL.createObjectURL(blob);preview.src=outputUrl;preview.hidden=false;download.href=outputUrl;const ext=(rec.mimeType||type||'').includes('mp4')?'mp4':'webm';download.download=`anteneh-ai-studio-${Date.now()}.${ext}`;download.textContent=`Download ${ext.toUpperCase()} video`;download.hidden=false;state.textContent='Video ready';status.textContent=`Video ready • ${ext.toUpperCase()} • captions included • ${Math.round(total/1000)} seconds`;button.disabled=false;
  }
  button.addEventListener('click',()=>render().catch(e=>{console.error(e);status.textContent='Rendering failed. Please try again.';button.disabled=false;state.textContent='Draft';}));
})();
