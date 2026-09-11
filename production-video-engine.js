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
    visual: n.querySelector('.scene-visual')?.value || '',
    type: n.dataset.sceneType || ''
  }));
  const words = s => String(s).trim().split(/\s+/).filter(Boolean);
  const wrap = (ctx, text, width) => { const out=[]; let line=''; for(const w of words(text)){const t=line?`${line} ${w}`:w;if(ctx.measureText(t).width>width&&line){out.push(line);line=w;}else line=t;}if(line)out.push(line);return out; };
  const rr = (c,x,y,w,h,r=20)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
  const arrow=(c,x1,y1,x2,y2)=>{const a=Math.atan2(y2-y1,x2-x1);c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke();c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-16*Math.cos(a-.5),y2-16*Math.sin(a-.5));c.lineTo(x2-16*Math.cos(a+.5),y2-16*Math.sin(a+.5));c.closePath();c.fill();};
  const mode = s => {const t=`${s.title} ${s.visual} ${s.narration}`.toLowerCase();if(/greenhouse effect|greenhouse gases|infrared heat|earth surface/.test(t))return'greenhouse';if(/photosynthesis|chloroplast|glucose|co₂|6co₂/.test(t))return'photosynthesis';if(/volcano|magma chamber|lava|eruption|volcanic/.test(t))return'volcano';if(/timeline|history|year|century|era|past|future/.test(t))return'timeline';if(/cycle|circular|repeat|water cycle|carbon cycle/.test(t))return'cycle';if(/cause|effect|because|leads to|results in|impact|consequence/.test(t))return'cause';if(/formula|equation|calculate|percentage|percent|math|number|rate|ratio/.test(t))return'formula';if(/hierarchy|levels|types|categories|classification|layers/.test(t))return'hierarchy';if(/before|after|transform|change|growth|improve/.test(t))return'before';if(/compare|comparison|versus|difference|similar/.test(t))return'compare';if(/mistake|misconception|avoid|warning|error|wrong/.test(t))return'warning';if(/example|real-world|application|case study/.test(t))return'example';if(/recap|takeaway|key point|remember|summary|closing/.test(t))return'recap';if(/step|process|how it works|how to|method|stages/.test(t))return'steps';return'concept';};

  function label(c,text,x,y,ink){c.fillStyle=ink;c.font='800 16px system-ui';c.textAlign='center';c.fillText(text,x,y);c.textAlign='left';}

  function drawDiagram(c,s,m,style,p,w,h){
    const dark=style!=='Whiteboard'; const ink=dark?'#fff':'#18212f'; const muted=dark?'#bfc8dc':'#566174';
    const x=760,y=145,bw=455,bh=430; c.save(); c.textAlign='center';
    if(dark){c.fillStyle='rgba(255,255,255,.055)';rr(c,x,y,bw,bh,28);c.fill();c.strokeStyle='rgba(255,255,255,.12)';c.stroke();} else {c.strokeStyle='#cbd5e1';c.lineWidth=3;rr(c,x,y,bw,bh,22);c.stroke();}
    const accent=dark?'#8b5cf6':'#2563eb', green=dark?'#22d3ee':'#16a34a', warm=dark?'#f59e0b':'#ea580c';
    c.fillStyle=muted;c.font='700 17px system-ui';c.fillText(m.toUpperCase(),x+bw/2,y+38);

    if(m==='greenhouse'){
      c.fillStyle=warm;c.beginPath();c.arc(x+80,y+145,38,0,Math.PI*2);c.fill();label(c,'SUN',x+80,y+205,ink);
      c.strokeStyle=warm;c.lineWidth=5;arrow(c,x+120,y+145,x+190,y+180);
      c.fillStyle=dark?'#164a58':'#dcfce7';rr(c,x+190,y+120,170,115,22);c.fill();label(c,'EARTH SURFACE',x+275,y+170,ink);label(c,'WARMING',x+275,y+198,ink);
      c.strokeStyle=green;c.lineWidth=5;arrow(c,x+275,y+120,x+275,y+75);arrow(c,x+315,y+235,x+315,y+285);
      c.strokeStyle=accent;c.lineWidth=4;c.beginPath();c.arc(x+275,y+225,155,Math.PI*1.08,Math.PI*1.92);c.stroke();
      c.fillStyle=accent;c.font='800 15px system-ui';c.fillText('ATMOSPHERE / GREENHOUSE GASES',x+275,y+335);c.fillStyle=muted;c.font='600 14px system-ui';c.fillText('some outgoing infrared heat is absorbed',x+275,y+375);c.fillText('and re-radiated within the Earth system',x+275,y+400);
    }
    else if(m==='photosynthesis'){
      c.fillStyle=warm;c.beginPath();c.arc(x+55,y+105,28,0,Math.PI*2);c.fill();label(c,'SUNLIGHT',x+55,y+155,ink);
      c.fillStyle=dark?'#14532d':'#dcfce7';rr(c,x+155,y+90,150,95,28);c.fill();label(c,'GREEN LEAF',x+230,y+128,ink);label(c,'CHLOROPLAST',x+230,y+155,ink);
      c.strokeStyle=warm;c.lineWidth=5;c.fillStyle=warm;arrow(c,x+90,y+110,x+150,y+125);
      c.fillStyle=accent;c.font='900 19px system-ui';c.fillText('CO₂ + H₂O + LIGHT',x+225,y+250);c.strokeStyle=green;c.lineWidth=4;arrow(c,x+225,y+275,x+225,y+325);
      c.fillStyle=dark?'#27304d':'#eef2ff';rr(c,x+80,y+335,155,62,15);c.fill();label(c,'GLUCOSE',x+158,y+374,ink);
      c.fillStyle=dark?'#164a58':'#dcfce7';rr(c,x+255,y+335,155,62,15);c.fill();label(c,'OXYGEN',x+332,y+374,ink);
    }
    else if(m==='volcano'){
      c.strokeStyle=dark?'#d5b89a':'#8b7355';c.lineWidth=7;c.beginPath();c.moveTo(x+50,y+390);c.quadraticCurveTo(x+170,y+120,x+275,y+390);c.stroke();c.beginPath();c.moveTo(x+500-150,y+390);c.quadraticCurveTo(x+330,y+120,x+275,y+390);c.stroke();
      c.fillStyle=dark?'#7c2d12':'#fed7aa';c.beginPath();c.ellipse(x+275,y+335,95,58,0,0,Math.PI*2);c.fill();label(c,'MAGMA CHAMBER',x+275,y+342,ink);
      c.strokeStyle=warm;c.lineWidth=12;c.beginPath();c.moveTo(x+275,y+335);c.lineTo(x+275,y+205);c.stroke();
      c.fillStyle=warm;c.beginPath();c.arc(x+275,y+185,20,0,Math.PI*2);c.fill();label(c,'VENT',x+275,y+155,ink);
      c.fillStyle='#ef4444';c.beginPath();c.arc(x+205,y+95,9,0,Math.PI*2);c.arc(x+275,y+75,8,0,Math.PI*2);c.arc(x+345,y+105,10,0,Math.PI*2);c.fill();
      c.fillStyle=muted;c.font='600 14px system-ui';c.fillText('pressure + gases can drive magma upward',x+275,y+425);
    }
    else if(m==='steps'){
      [1,2,3].forEach((v,i)=>{const bx=x+20+i*145,by=y+105+Math.sin(p*Math.PI+i)*5;c.fillStyle=i===1?accent:(dark?'#27304d':'#eef2ff');rr(c,bx,by,110,85,18);c.fill();c.fillStyle=ink;c.font='900 24px system-ui';c.fillText(String(v),bx+55,by+34);c.font='700 13px system-ui';c.fillText('STEP '+v,bx+55,by+62);if(i<2){c.strokeStyle=green;c.fillStyle=green;c.lineWidth=3;arrow(c,bx+112,by+42,bx+138,by+42);}});
    }
    else if(m==='timeline'){c.strokeStyle=green;c.lineWidth=6;c.beginPath();c.moveTo(x+55,y+205);c.lineTo(x+bw-55,y+205);c.stroke();['PAST','CHANGE','NOW'].forEach((v,i)=>{const q=x+70+i*145;c.fillStyle=accent;c.beginPath();c.arc(q,y+205,15,0,Math.PI*2);c.fill();label(c,v,q,y+255,ink);});}
    else if(m==='cycle'){c.strokeStyle=green;c.lineWidth=6;c.beginPath();c.arc(x+225,y+220,125,0,Math.PI*2);c.stroke();label(c,'CYCLE',x+225,y+228,ink);arrow(c,x+225,y+95,x+315,y+150);arrow(c,x+355,y+230,x+300,y+325);arrow(c,x+225,y+350,x+135,y+295);}
    else if(m==='cause'){c.fillStyle=dark?'#27304d':'#fee2e2';rr(c,x+20,y+135,145,90,16);c.fill();label(c,'CAUSE',x+92,y+190,ink);c.strokeStyle=green;c.fillStyle=green;c.lineWidth=4;arrow(c,x+170,y+180,x+245,y+180);c.fillStyle=dark?'#3a2c63':'#dcfce7';rr(c,x+250,y+135,170,90,16);c.fill();label(c,'EFFECT',x+335,y+190,ink);}
    else if(m==='formula'){c.fillStyle=dark?'#22d3ee':'#dbeafe';rr(c,x+30,y+135,395,120,24);c.fill();c.fillStyle=dark?'#06121f':ink;c.font='900 25px system-ui';c.fillText((s.visual.match(/6CO₂[^.]+/)||['INPUT → RULE → RESULT'])[0].slice(0,42),x+227,y+205);}
    else if(m==='hierarchy'){c.fillStyle=accent;rr(c,x+145,y+105,160,62,15);c.fillStyle='#fff';label(c,'MAIN IDEA',x+225,y+144,'#fff');['TYPE A','TYPE B','TYPE C'].forEach((v,i)=>{c.strokeStyle=green;c.fillStyle=green;c.lineWidth=2;arrow(c,x+225,y+170,x+85+i*140,y+245);c.fillStyle=dark?'#27304d':'#eef2ff';rr(c,x+30+i*140,y+255,110,58,14);label(c,v,x+85+i*140,y+290,ink);});}
    else if(m==='before'||m==='compare'){c.fillStyle=dark?'#27304d':'#f1f5f9';rr(c,x+25,y+140,155,105,18);c.fill();label(c,m==='compare'?'OPTION A':'BEFORE',x+102,y+198,ink);c.strokeStyle=green;c.fillStyle=green;c.lineWidth=4;arrow(c,x+190,y+190,x+240,y+190);c.fillStyle=dark?'#164a58':'#dcfce7';rr(c,x+250,y+140,155,105,18);c.fill();label(c,m==='compare'?'OPTION B':'AFTER',x+327,y+198,ink);}
    else if(m==='warning'){c.fillStyle='#f59e0b';c.beginPath();c.moveTo(x+225,y+105);c.lineTo(x+320,y+290);c.lineTo(x+130,y+290);c.closePath();c.fill();label(c,'CHECK THE CLAIM',x+225,y+345,ink);}
    else if(m==='example'){c.fillStyle=accent;c.beginPath();c.arc(x+225,y+215,78+8*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();label(c,'REAL EXAMPLE',x+225,y+222,'#fff');}
    else if(m==='recap'){c.fillStyle=accent;c.font='900 22px system-ui';c.fillText('KEY TAKEAWAYS',x+225,y+95);const parts=s.visual.split('•').map(v=>v.trim()).filter(Boolean).slice(0,3);(parts.length?parts:['KEY POINT 1','KEY POINT 2','KEY POINT 3']).forEach((v,i)=>{c.fillStyle=dark?'#27304d':'#eef2ff';rr(c,x+45,y+125+i*78,360,58,15);c.fill();label(c,v.slice(0,34),x+225,y+161+i*78,ink);});}
    else {c.fillStyle=accent;c.beginPath();c.arc(x+225,y+210,78+8*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();label(c,'CENTRAL CONCEPT',x+225,y+217,'#fff');}
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
    drawDiagram(c,s,m,style,p,w,h);c.fillStyle=muted;c.font='500 15px system-ui';wrap(c,s.visual,620).slice(0,2).forEach((v,n)=>c.fillText(v,60,h-90+n*20));c.fillStyle=style==='Whiteboard'?'#2563eb':'#8b5cf6';c.fillRect(60,h-48,(w-120)*((i+p)/total),5);
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
    for(let i=0;i<items.length;i++){const d=durations[i],start=performance.now();while(performance.now()-start<d){const p=Math.min(1,(performance.now()-start)/d);draw(c,items[i],i,items.length,p,styleSelect?.value||'Clean explainer');const percent=Math.round(((durations.slice(0,i).reduce((a,b)=>a+b,0)+p*d)/total)*100);status.textContent=`Rendering scene ${i+1} of ${items.length} • ${percent}%`;await new Promise(r=>requestAnimationFrame(r));}}
    rec.stop();await stopped;video.getTracks().forEach(t=>t.stop());au.cleanup();if(au.a)au.a.pause();
    const blob=new Blob(chunks,{type:rec.mimeType||type||'video/webm'});if(!blob.size){status.textContent='No video data was produced. Please try again.';button.disabled=false;state.textContent='Draft';return;}
    outputUrl=URL.createObjectURL(blob);preview.src=outputUrl;preview.hidden=false;download.href=outputUrl;const ext=(rec.mimeType||type||'').includes('mp4')?'mp4':'webm';download.download=`anteneh-ai-studio-${Date.now()}.${ext}`;download.textContent=`Download ${ext.toUpperCase()} video`;download.hidden=false;state.textContent='Video ready';status.textContent=`Video ready • ${ext.toUpperCase()} • ${Math.round(total/1000)} seconds${au.stream?' • Narration included':' • No narration audio was recorded for this video.'}`;
    button.disabled=false;
  }
  button.addEventListener('click',()=>{window.antenehEnsureLesson?.();render().catch(e=>{console.error(e);status.textContent='Rendering failed. Please try again.';button.disabled=false;state.textContent='Draft';});});
})();