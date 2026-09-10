(() => {
  const old = document.getElementById('videoBtn');
  if (!old) return;
  const button = old.cloneNode(true);
  old.replaceWith(button);

  const $ = id => document.getElementById(id);
  const status = $('videoStatus'), state = $('projectState'), preview = $('videoPreview'), download = $('downloadVideo');
  const audioPreview = $('audioPreview'), styleSelect = $('style');
  let outputUrl = null;

  const scenes = () => [...document.querySelectorAll('.scene')].map((n, i) => ({
    title: n.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
    narration: n.querySelector('.scene-narration')?.value || '',
    visual: n.querySelector('.scene-visual')?.value || ''
  }));
  const words = s => String(s).trim().split(/\s+/).filter(Boolean);
  const wrap = (ctx, text, width) => { const out=[]; let line=''; for(const w of words(text)){const t=line?`${line} ${w}`:w;if(ctx.measureText(t).width>width&&line){out.push(line);line=w;}else line=t;}if(line)out.push(line);return out; };
  const rr = (c,x,y,w,h,r=20)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
  const arrow=(c,x1,y1,x2,y2)=>{const a=Math.atan2(y2-y1,x2-x1);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-16*Math.cos(a-.5),y2-16*Math.sin(a-.5));c.lineTo(x2-16*Math.cos(a+.5),y2-16*Math.sin(a+.5));c.closePath();c.fill();};
  const mode = s => {const t=`${s.title} ${s.visual} ${s.narration}`.toLowerCase();if(/timeline|history|year|century|era|past|future/.test(t))return'timeline';if(/cycle|circular|repeat|water cycle|carbon cycle/.test(t))return'cycle';if(/cause|effect|because|leads to|results in|impact/.test(t))return'cause';if(/formula|equation|calculate|percentage|percent|math|number|rate|ratio/.test(t))return'formula';if(/hierarchy|levels|types|categories|classification|layers/.test(t))return'hierarchy';if(/before|after|transform|change|growth|improve/.test(t))return'before';if(/compare|comparison|versus|difference|similar/.test(t))return'compare';if(/mistake|misconception|avoid|warning|error|wrong/.test(t))return'warning';if(/example|real-world|application|case study/.test(t))return'example';if(/recap|takeaway|key point|remember|summary|closing/.test(t))return'recap';if(/step|process|how it works|how to|method|stages/.test(t))return'steps';return'concept';};

  function drawDiagram(c,s,m,style,p,w,h){
    const dark=style!=='Whiteboard'; const ink=dark?'#fff':'#18212f'; const muted=dark?'#bfc8dc':'#566174';
    const x=760,y=170,bw=430,bh=390; c.save(); c.textAlign='center';
    if(dark){c.fillStyle='rgba(255,255,255,.055)';rr(c,x,y,bw,bh,28);c.fill();c.strokeStyle='rgba(255,255,255,.12)';c.stroke();} else {c.strokeStyle='#cbd5e1';c.lineWidth=3;rr(c,x,y,bw,bh,22);c.stroke();}
    const accent=dark?'#8b5cf6':'#2563eb', green=dark?'#22d3ee':'#16a34a';
    c.fillStyle=muted;c.font='700 17px system-ui';c.fillText(m.toUpperCase(),x+bw/2,y+45);
    if(m==='steps'){['START','LEARN','APPLY'].forEach((v,i)=>{const bx=x+25+i*135,by=y+115+Math.sin(p*Math.PI+i)*5;c.fillStyle=i===1?accent:(dark?'#27304d':'#eef2ff');rr(c,bx,by,105,80,18);c.fill();c.fillStyle=ink;c.font='900 18px system-ui';c.fillText(`${i+1}`,bx+52,by+31);c.font='700 13px system-ui';c.fillText(v,bx+52,by+56);if(i<2){c.strokeStyle=green;c.fillStyle=green;c.lineWidth=3;arrow(c,bx+108,by+40,bx+128,by+40);}});}
    else if(m==='timeline'){c.strokeStyle=green;c.lineWidth=6;c.beginPath();c.moveTo(x+55,y+205);c.lineTo(x+bw-55,y+205);c.stroke();['PAST','CHANGE','NOW'].forEach((v,i)=>{const q=x+70+i*145;c.fillStyle=accent;c.beginPath();c.arc(q,y+205,15,0,Math.PI*2);c.fill();c.fillStyle=ink;c.font='800 16px system-ui';c.fillText(v,q,y+255);});}
    else if(m==='cycle'){c.strokeStyle=green;c.lineWidth=6;c.beginPath();c.arc(x+215,y+215,120,0,Math.PI*2);c.stroke();c.fillStyle=accent;c.font='900 24px system-ui';c.fillText('CYCLE',x+215,y+223);arrow(c,x+215,y+90,x+305,y+145);arrow(c,x+345,y+225,x+290,y+315);arrow(c,x+215,y+345,x+125,y+290);}
    else if(m==='cause'){c.fillStyle=dark?'#27304d':'#fee2e2';rr(c,x+25,y+135,145,90,16);c.fill();c.fillStyle=ink;c.font='800 18px system-ui';c.fillText('CAUSE',x+97,y+190);c.strokeStyle=green;c.fillStyle=green;c.lineWidth=4;arrow(c,x+180,y+180,x+245,y+180);c.fillStyle=dark?'#3a2c63':'#dcfce7';rr(c,x+250,y+135,155,90,16);c.fill();c.fillStyle=ink;c.fillText('EFFECT',x+327,y+190);}
    else if(m==='formula'){c.fillStyle=dark?'#22d3ee':'#dbeafe';rr(c,x+30,y+135,370,120,24);c.fill();c.fillStyle=dark?'#06121f':ink;c.font='900 30px system-ui';c.fillText('INPUT  →  RULE  →  RESULT',x+215,y+205);}
    else if(m==='hierarchy'){c.fillStyle=accent;rr(c,x+135,y+105,160,62,15);c.fillStyle='#fff';c.font='800 17px system-ui';c.fillText('MAIN IDEA',x+215,y+144);['TYPE A','TYPE B','TYPE C'].forEach((v,i)=>{c.strokeStyle=green;c.fillStyle=green;c.lineWidth=2;arrow(c,x+215,y+170,x+75+i*140,y+245);c.fillStyle=dark?'#27304d':'#eef2ff';rr(c,x+20+i*140,y+255,110,58,14);c.fillStyle=ink;c.font='700 13px system-ui';c.fillText(v,x+75+i*140,y+290);});}
    else if(m==='before'||m==='compare'){c.fillStyle=dark?'#27304d':'#f1f5f9';rr(c,x+25,y+140,155,105,18);c.fill();c.fillStyle=ink;c.font='800 18px system-ui';c.fillText(m==='compare'?'OPTION A':'BEFORE',x+102,y+198);c.strokeStyle=green;c.fillStyle=green;c.lineWidth=4;arrow(c,x+190,y+190,x+240,y+190);c.fillStyle=dark?'#164a58':'#dcfce7';rr(c,x+250,y+140,155,105,18);c.fill();c.fillStyle=ink;c.fillText(m==='compare'?'OPTION B':'AFTER');}
    else {c.fillStyle=m==='warning'?'#f59e0b':accent;c.beginPath();c.arc(x+215,y+205,82+8*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font='900 22px system-ui';c.fillText(m==='warning'?'WATCH OUT':m==='example'?'REAL EXAMPLE':m==='recap'?'3 TAKEAWAYS':'BIG IDEA',x+215,y+212);}
    c.restore();
  }

  function draw(c,s,i,total,p,style){
    const w=c.canvas.width,h=c.canvas.height,m=mode(s); c.clearRect(0,0,w,h);
    if(style==='Whiteboard'){c.fillStyle='#fffdf7';c.fillRect(0,0,w,h);c.strokeStyle='#dbe4ef';c.lineWidth=1;for(let y=90;y<h;y+=42){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}}
    else if(style==='Minimal motion graphics'){c.fillStyle='#f7f8fb';c.fillRect(0,0,w,h);c.fillStyle='#e8eaf4';c.beginPath();c.arc(1100,100,180,0,Math.PI*2);c.fill();}
    else {const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#071225');g.addColorStop(1,style==='Modern presentation'?'#211642':'#141b35');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='rgba(34,211,238,.12)';c.beginPath();c.arc(1100,100,170+30*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();}
    const ink=style==='Whiteboard'||style==='Minimal motion graphics'?'#172033':'#fff',muted=style==='Whiteboard'||style==='Minimal motion graphics'?'#536176':'#bdc6d8';
    c.fillStyle=style==='Whiteboard'?'#2563eb':'#9da9ff';c.font='800 24px system-ui';c.fillText('ANTENEH AI STUDIO',60,58);c.fillStyle=muted;c.font='700 17px system-ui';c.fillText(`SCENE ${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,60,92);
    c.save();c.globalAlpha=Math.min(1,p*5);const slide=(1-Math.min(1,p*5))*35;c.translate(-slide,0);c.fillStyle=ink;c.font='900 52px system-ui';wrap(c,s.title,620).slice(0,2).forEach((v,n)=>c.fillText(v,60,185+n*62));c.fillStyle=muted;c.font='400 23px system-ui';wrap(c,s.narration,620).slice(0,6).forEach((v,n)=>c.fillText(v,65,350+n*34));c.restore();
    drawDiagram(c,s,m,style,p,w,h);c.fillStyle=muted;c.font='500 15px system-ui';c.fillText(s.visual,60,h-78);c.fillStyle=style==='Whiteboard'?'#2563eb':'#8b5cf6';c.fillRect(60,h-48,(w-120)*((i+p)/total),5);
  }

  function mime(){const types=['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];return types.find(t=>MediaRecorder.isTypeSupported(t))||'';}
  async function audioTrack(){
    if(!audioPreview?.src||audioPreview.hidden) return {stream:null,ms:0,cleanup:()=>{}};
    const a=new Audio(audioPreview.src);a.preload='auto';a.crossOrigin='anonymous';
    await new Promise((ok,bad)=>{a.onloadedmetadata=ok;a.onerror=bad;}); const ms=Number.isFinite(a.duration)?a.duration*1000:0;
    let ctx=null,src=null,dest=null;try{ctx=new (window.AudioContext||window.webkitAudioContext)();src=ctx.createMediaElementSource(a);dest=ctx.createMediaStreamDestination();src.connect(dest);src.connect(ctx.destination);await ctx.resume();return {stream:dest.stream,ms,a,play:()=>a.play(),cleanup:()=>{try{src.disconnect();dest.disconnect();ctx.close();}catch(_){}}};}catch(_){try{return {stream:a.captureStream?a.captureStream():null,ms,a,play:()=>a.play(),cleanup:()=>{}};}catch(e){return {stream:null,ms,a,play:()=>a.play(),cleanup:()=>{}};}}
  }

  async function render(){
    const items=scenes(); if(!items.length){status.textContent='Create a project first.';return;}
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video recording is not supported by this browser.';return;}
    button.disabled=true;state.textContent='Rendering';preview.hidden=true;download.hidden=true;status.textContent='Preparing video…';if(outputUrl)URL.revokeObjectURL(outputUrl);
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const c=canvas.getContext('2d');const video=canvas.captureStream(24);let au={stream:null,ms:0,cleanup:()=>{}};
    try{au=await audioTrack();}catch(_){au={stream:null,ms:0,cleanup:()=>{}};}
    if(au.stream)au.stream.getAudioTracks().forEach(t=>video.addTrack(t));
    const ws=items.map(s=>Math.max(1,words(s.narration).length));const sum=ws.reduce((a,b)=>a+b,0);const durations=ws.map(x=>au.ms?Math.max(1400,au.ms*x/sum):Math.max(2200,Math.min(9000,x/2.4*1000)));const total=durations.reduce((a,b)=>a+b,0);const type=mime();
    let rec;try{rec=new MediaRecorder(video,type?{mimeType:type,videoBitsPerSecond:2200000,audioBitsPerSecond:128000}:{videoBitsPerSecond:2200000});}catch(e){status.textContent='This browser could not start its video encoder.';button.disabled=false;state.textContent='Draft';au.cleanup();return;}
    const chunks=[];rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};rec.onerror=()=>{status.textContent='Video encoding stopped unexpectedly. Try again.';};
    const stopped=new Promise(resolve=>rec.onstop=resolve);rec.start(250);
    if(au.play)try{await au.play();}catch(_){ }
    let elapsed=0;
    for(let i=0;i<items.length;i++){const d=durations[i],start=performance.now();while(performance.now()-start<d){const p=Math.min(1,(performance.now()-start)/d);draw(c,items[i],i,items.length,p,styleSelect?.value||'Clean explainer');elapsed+=0;const percent=Math.round(((durations.slice(0,i).reduce((a,b)=>a+b,0)+p*d)/total)*100);status.textContent=`Rendering scene ${i+1} of ${items.length} • ${percent}%`;await new Promise(r=>requestAnimationFrame(r));}}
    rec.stop();await stopped;video.getTracks().forEach(t=>t.stop());au.cleanup();if(au.a)au.a.pause();
    const blob=new Blob(chunks,{type:rec.mimeType||type||'video/webm'});if(!blob.size){status.textContent='No video data was produced. Please try again.';button.disabled=false;state.textContent='Draft';return;}
    outputUrl=URL.createObjectURL(blob);preview.src=outputUrl;preview.hidden=false;download.href=outputUrl;const ext=(rec.mimeType||type||'').includes('mp4')?'mp4':'webm';download.download=`anteneh-ai-studio-${Date.now()}.${ext}`;download.textContent=`Download ${ext.toUpperCase()} video`;download.hidden=false;state.textContent='Video ready';status.textContent=`Video ready • ${ext.toUpperCase()} • ${Math.round(total/1000)} seconds`;
    button.disabled=false;
  }
  button.addEventListener('click',()=>render().catch(e=>{console.error(e);status.textContent='Rendering failed. Please try again.';button.disabled=false;state.textContent='Draft';}));
})();
