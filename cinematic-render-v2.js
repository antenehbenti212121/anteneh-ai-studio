(() => {
  const original = document.getElementById('videoBtn');
  if (!original) return;
  const button = original.cloneNode(true);
  original.replaceWith(button);
  const $ = id => document.getElementById(id);
  const status = $('videoStatus');
  const state = $('projectState');
  const preview = $('videoPreview');
  const download = $('downloadVideo');
  const audioPreview = $('audioPreview');
  const styleSelect = $('style');
  let outputUrl = null;

  const stopWords = new Set('the a an and or but for to of in on with from into about this that is are was were be been being it its as by at through using use used how what why when where which who your you they their them we our can may will should simple explain lesson idea example important more most than then also very'.split(' '));
  const words = text => String(text || '').trim().split(/\s+/).filter(Boolean);
  const cleanWords = text => words(text).map(w => w.replace(/[^a-zA-Z0-9%'-]/g, '')).filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()));
  const wrap = (ctx, text, width) => { const lines=[]; let line=''; for (const word of words(text)) { const next=line ? `${line} ${word}` : word; if (ctx.measureText(next).width > width && line) { lines.push(line); line=word; } else line=next; } if(line) lines.push(line); return lines; };
  const rr = (ctx,x,y,w,h,r=18) => { r=Math.min(r,w/2,h/2); ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); };
  const sceneData = () => [...document.querySelectorAll('.scene')].map((n,i)=>({title:n.querySelector('.scene-title')?.value || n.querySelector('strong')?.textContent || `Scene ${i+1}`, narration:n.querySelector('.scene-narration')?.value || n.querySelector('p')?.textContent || '', visual:n.querySelector('.scene-visual')?.value || ''}));
  const mode = s => { const t=`${s.title} ${s.visual} ${s.narration}`.toLowerCase(); if(/timeline|history|year|century|era|past|future|ancient/.test(t))return'timeline'; if(/cycle|circular|repeat|water cycle|carbon cycle|life cycle/.test(t))return'cycle'; if(/cause|effect|because|leads to|results in|impact|consequence/.test(t))return'cause'; if(/formula|equation|calculate|percentage|percent|math|number|rate|ratio|finance/.test(t))return'formula'; if(/hierarchy|levels|types|categories|classification|layers/.test(t))return'hierarchy'; if(/before|after|transform|change|growth|improve|conversion/.test(t))return'before'; if(/compare|comparison|versus|difference|similar/.test(t))return'compare'; if(/mistake|misconception|avoid|warning|error|wrong/.test(t))return'warning'; if(/example|real-world|application|case study/.test(t))return'example'; if(/recap|takeaway|key point|remember|summary|closing/.test(t))return'recap'; if(/step|process|how it works|how to|method|stages/.test(t))return'steps'; return'concept'; };
  const theme = style => style==='Whiteboard' ? {bg:'#fffdf7',ink:'#172033',muted:'#59677d',accent:'#2457d6',soft:'#e7edf7',grid:'#dbe3ef',card:'#ffffff'} : style==='Minimal motion graphics' ? {bg:'#f6f8fc',ink:'#141b2d',muted:'#58657b',accent:'#5b55d6',soft:'#e6e8fb',grid:'#dde2ed',card:'#ffffff'} : style==='Modern presentation' ? {bg:'#090d1d',ink:'#ffffff',muted:'#b8c1d7',accent:'#a878ff',soft:'rgba(168,120,255,.15)',grid:'rgba(255,255,255,.10)',card:'rgba(255,255,255,.055)'} : {bg:'#071426',ink:'#ffffff',muted:'#b8c1d7',accent:'#42c8e8',soft:'rgba(66,200,232,.12)',grid:'rgba(255,255,255,.09)',card:'rgba(255,255,255,.055)'};
  const arrow=(ctx,x1,y1,x2,y2,color,alpha=1)=>{ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1);ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-14*Math.cos(a-.5),y2-14*Math.sin(a-.5));ctx.lineTo(x2-14*Math.cos(a+.5),y2-14*Math.sin(a+.5));ctx.closePath();ctx.fill();ctx.restore();};
  const chip=(ctx,text,x,y,t,active=false)=>{ctx.save();ctx.font='800 14px system-ui';const w=ctx.measureText(text).width+28;ctx.fillStyle=active?t.accent:t.soft;rr(ctx,x,y,w,34,17);ctx.fill();ctx.fillStyle=active?'#fff':t.ink;ctx.textAlign='center';ctx.fillText(text,x+w/2,y+23);ctx.restore();return w;};
  const label=(ctx,text,x,y,t,size=13)=>{ctx.save();ctx.fillStyle=t.muted;ctx.font=`800 ${size}px system-ui`;ctx.fillText(text.toUpperCase(),x,y);ctx.restore();};

  function drawDiagram(ctx,s,m,p,t,topic){
    const x=748,y=118,w=472,h=438; ctx.save();
    ctx.fillStyle=t.card; rr(ctx,x,y,w,h,30); ctx.fill(); ctx.strokeStyle=t.grid;ctx.lineWidth=2;ctx.stroke();
    label(ctx,`${m} • visual lesson`,x+28,y+32,t,12);
    const q=topic.slice(0,3);
    if(m==='concept'){
      ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(984,y+190,78+8*Math.sin(p*Math.PI),0,Math.PI*2);ctx.fill();
      ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 22px system-ui';wrap(ctx,q[0]||'CORE IDEA',150).slice(0,2).forEach((v,i)=>ctx.fillText(v,984,y+184+i*28));
      const labels=['WHY IT MATTERS','HOW IT WORKS','KEY TAKEAWAY']; labels.forEach((v,i)=>{const a=-Math.PI*.78+i*Math.PI*.39;const cx=984+Math.cos(a)*155,cy=y+190+Math.sin(a)*155;arrow(ctx,984+Math.cos(a)*85,y+190+Math.sin(a)*85,cx-Math.cos(a)*58,cy-Math.sin(a)*34,t.accent,.65);ctx.fillStyle=t.soft;rr(ctx,cx-62,cy-25,124,50,14);ctx.fill();ctx.fillStyle=t.ink;ctx.font='800 11px system-ui';ctx.fillText(v,cx,cy+4);});
    } else if(m==='steps'){
      const labels=['START','LEARN','APPLY']; labels.forEach((v,i)=>{const bx=x+28+i*145, by=y+130+Math.sin(p*Math.PI+i)*7;const active=i<=Math.floor(p*3);ctx.fillStyle=active?t.accent:t.soft;rr(ctx,bx,by,120,100,20);ctx.fill();ctx.fillStyle=active?'#fff':t.ink;ctx.textAlign='center';ctx.font='900 15px system-ui';ctx.fillText(v,bx+60,by+56);ctx.font='700 11px system-ui';ctx.fillText((q[i]||'NEXT IDEA').slice(0,16),bx+60,by+78);if(i<2)arrow(ctx,bx+120,by+50,bx+143,by+50,t.accent,.8);});
    } else if(m==='compare'){
      ['A','B'].forEach((v,i)=>{const bx=x+38+i*210;ctx.fillStyle=i===Math.floor(p*2)?t.accent:t.soft;rr(ctx,bx,y+115,170,210,24);ctx.fill();ctx.fillStyle=i===Math.floor(p*2)?'#fff':t.ink;ctx.textAlign='center';ctx.font='900 32px system-ui';ctx.fillText(v,bx+85,y+158);ctx.font='800 13px system-ui';ctx.fillText((q[i]||`OPTION ${v}`).slice(0,20),bx+85,y+190);['FEATURE 1','FEATURE 2','FEATURE 3'].forEach((z,j)=>{ctx.font='700 11px system-ui';ctx.fillText(z,bx+85,y+230+j*25);});});
    } else if(m==='cause'){
      const nodes=[['CAUSE',x+42,y+105],['EVENT',x+180,y+235],['EFFECT',x+322,y+105]]; nodes.forEach((n,i)=>{ctx.fillStyle=i===1?t.accent:t.soft;rr(ctx,n[1],n[2],110,62,18);ctx.fill();ctx.fillStyle=i===1?'#fff':t.ink;ctx.textAlign='center';ctx.font='900 13px system-ui';ctx.fillText(n[0],n[1]+55,n[2]+38);});arrow(ctx,x+152,y+137,x+180,y+255,t.accent,.85);arrow(ctx,x+290,y+255,x+322,y+137,t.accent,.85);
    } else if(m==='timeline'){
      ctx.strokeStyle=t.accent;ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x+50,y+245);ctx.lineTo(x+420,y+245);ctx.stroke();['PAST','CHANGE','NOW'].forEach((v,i)=>{const px=x+60+i*175;ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(px,y+245,15,0,Math.PI*2);ctx.fill();ctx.fillStyle=t.ink;ctx.textAlign='center';ctx.font='900 13px system-ui';ctx.fillText(v,px,y+292);ctx.font='700 11px system-ui';ctx.fillText((q[i]||'MILESTONE').slice(0,17),px,y+315);});
    } else if(m==='cycle'){
      ctx.strokeStyle=t.accent;ctx.lineWidth=9;ctx.beginPath();ctx.arc(984,y+220,112,-Math.PI*.7,Math.PI*1.18);ctx.stroke();const a=-Math.PI*.7+p*Math.PI*1.88;ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(984+Math.cos(a)*112,y+220+Math.sin(a)*112,13,0,Math.PI*2);ctx.fill();ctx.fillStyle=t.ink;ctx.textAlign='center';ctx.font='900 22px system-ui';ctx.fillText(q[0]||'CYCLE',984,y+225);['START','CHANGE','REPEAT'].forEach((v,i)=>chip(ctx,v,x+55+i*120,y+340,t,i===Math.floor(p*3)));
    } else if(m==='formula'){
      ctx.textAlign='center';ctx.fillStyle=t.ink;ctx.font='900 38px system-ui';ctx.fillText(`${q[0]||'INPUT'}  +  ${q[1]||'RULE'}  =  ${q[2]||'RESULT'}`,984,y+205);['INPUT','RULE','RESULT'].forEach((v,i)=>{const bx=x+55+i*135;chip(ctx,v,bx,y+285,t,i===Math.floor(p*3));});
    } else if(m==='hierarchy'){
      ctx.fillStyle=t.accent;rr(ctx,x+146,y+76,190,62,17);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 15px system-ui';ctx.fillText((q[0]||'MAIN IDEA').slice(0,18),x+241,y+114);['TYPE A','TYPE B','TYPE C'].forEach((v,i)=>{const bx=x+35+i*138;arrow(ctx,x+241,y+138,bx+60,y+210,t.accent,.7);ctx.fillStyle=t.soft;rr(ctx,bx,y+220,120,56,14);ctx.fill();ctx.fillStyle=t.ink;ctx.font='800 11px system-ui';ctx.fillText((q[i+1]||v).slice(0,16),bx+60,y+253);});
    } else if(m==='before'){
      ['BEFORE','CHANGE','AFTER'].forEach((v,i)=>{const bx=x+28+i*145;ctx.fillStyle=i===1?t.accent:t.soft;rr(ctx,bx,y+150,120,90,18);ctx.fill();ctx.fillStyle=i===1?'#fff':t.ink;ctx.textAlign='center';ctx.font='900 12px system-ui';ctx.fillText(v,bx+60,y+190);if(i<2)arrow(ctx,bx+120,y+195,bx+143,y+195,t.accent,.8);});
    } else if(m==='warning'){
      ctx.fillStyle='#f59e0b';ctx.beginPath();ctx.moveTo(984,y+90);ctx.lineTo(x+105,y+330);ctx.lineTo(x+369,y+330);ctx.closePath();ctx.fill();ctx.fillStyle='#172033';ctx.textAlign='center';ctx.font='900 48px system-ui';ctx.fillText('!',984,y+270);ctx.fillStyle=t.ink;ctx.font='900 15px system-ui';ctx.fillText('COMMON ERROR',984,y+365);ctx.font='700 12px system-ui';ctx.fillText('then replace it with the correct idea',984,y+390);
    } else if(m==='example'){
      ctx.fillStyle=t.soft;rr(ctx,x+35,y+120,155,205,22);ctx.fill();ctx.fillStyle=t.accent;ctx.font='900 15px system-ui';ctx.textAlign='center';ctx.fillText('IDEA',x+112,y+158);ctx.fillStyle=t.ink;ctx.font='800 13px system-ui';ctx.fillText((q[0]||'CONCEPT').slice(0,18),x+112,y+205);arrow(ctx,x+195,y+220,x+270,y+220,t.accent);ctx.fillStyle=t.soft;rr(ctx,x+282,y+120,155,205,22);ctx.fill();ctx.fillStyle=t.accent;ctx.font='900 15px system-ui';ctx.fillText('REAL WORLD',x+360,y+158);ctx.fillStyle=t.ink;ctx.font='800 13px system-ui';ctx.fillText((q[1]||'EXAMPLE').slice(0,18),x+360,y+205);
    } else if(m==='recap'){
      ['REMEMBER','USE','EXPLAIN'].forEach((v,i)=>{const bx=x+34+i*145;ctx.fillStyle=i===Math.floor(p*3)?t.accent:t.soft;rr(ctx,bx,y+145,120,125,18);ctx.fill();ctx.fillStyle=i===Math.floor(p*3)?'#fff':t.ink;ctx.textAlign='center';ctx.font='900 13px system-ui';ctx.fillText(v,bx+60,y+192);ctx.font='700 11px system-ui';ctx.fillText((q[i]||'KEY IDEA').slice(0,15),bx+60,y+225);});
    } else { ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(984,y+215,82,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='900 20px system-ui';ctx.fillText((q[0]||'CORE IDEA').slice(0,16),984,y+222); }
    ctx.restore();
  }

  function draw(ctx,s,i,total,p,style){
    const t=theme(style),W=ctx.canvas.width,H=ctx.canvas.height,m=mode(s),topic=cleanWords(`${s.title} ${s.narration}`).slice(0,5);ctx.clearRect(0,0,W,H);
    ctx.fillStyle=t.bg;ctx.fillRect(0,0,W,H);
    if(style==='Whiteboard'){ctx.strokeStyle=t.grid;ctx.lineWidth=1;for(let y=92;y<H;y+=34){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}for(let x=30;x<W;x+=180){ctx.beginPath();ctx.moveTo(x,92);ctx.lineTo(x,H);ctx.stroke();}}
    if(style==='Minimal motion graphics'){for(let k=0;k<9;k++){ctx.globalAlpha=.08;ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(80+k*160+Math.sin(p*4+k)*24,120+Math.cos(p*3+k)*42,30+(k%3)*18,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
    if(style==='Clean explainer'||style==='Modern presentation'){const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,style==='Modern presentation'?'#080b1d':'#071426');g.addColorStop(.55,style==='Modern presentation'?'#1b1234':'#10233c');g.addColorStop(1,'#050812');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);for(let k=0;k<5;k++){ctx.globalAlpha=.055;ctx.fillStyle=t.accent;ctx.beginPath();ctx.arc(90+k*285,95+Math.sin(p*4+k)*38,75+k*10,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
    ctx.fillStyle=t.accent;ctx.font='900 17px system-ui';ctx.fillText('ANTENEH AI STUDIO',48,40);label(ctx,`SCENE ${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}  •  ${m}`,48,67,t,11);
    const enter=Math.min(1,p*5),slide=(1-enter)*60;ctx.save();ctx.globalAlpha=enter;ctx.translate(-slide,0);
    const titleLines=wrap(ctx,s.title,610).slice(0,2);ctx.fillStyle=t.ink;ctx.font='900 47px system-ui';titleLines.forEach((v,n)=>ctx.fillText(v,48,150+n*55));
    const narrY=150+titleLines.length*55+28;ctx.fillStyle=t.muted;ctx.font='400 20px system-ui';wrap(ctx,s.narration,610).slice(0,5).forEach((v,n)=>ctx.fillText(v,52,narrY+n*29));
    let cx=48;for(const k of topic.slice(0,3)){cx+=chip(ctx,k.slice(0,18),cx,Math.min(355,narrY+165),t,cx===48)+10;}ctx.restore();
    drawDiagram(ctx,s,m,p,t,topic);
    const all=words(s.narration), count=Math.max(1,Math.ceil(all.length/9)), idx=Math.min(Math.max(0,all.length-1),Math.floor(p*all.length)), start=Math.floor(idx/9)*9, cap=all.slice(start,start+9).join(' ')||s.title;
    ctx.fillStyle='rgba(0,0,0,.84)';rr(ctx,128,H-112,1024,62,18);ctx.fill();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.font='800 20px system-ui';wrap(ctx,cap,930).slice(0,2).forEach((v,n)=>ctx.fillText(v,640,H-78+n*24));
    ctx.textAlign='left';ctx.fillStyle=t.muted;ctx.font='500 12px system-ui';wrap(ctx,s.visual,1050).slice(0,1).forEach(v=>ctx.fillText(v,48,H-47));ctx.fillStyle=t.accent;ctx.fillRect(48,H-23,(W-96)*((i+p)/total),4);
  }

  const mime = () => ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>MediaRecorder.isTypeSupported(x)) || '';
  async function getAudio(){
    if(!audioPreview?.src || audioPreview.hidden) return {stream:null,ms:0,a:null,cleanup:()=>{}};
    const a=new Audio(audioPreview.src);a.preload='auto';await new Promise((resolve,reject)=>{a.onloadedmetadata=resolve;a.onerror=reject;});const ms=Number.isFinite(a.duration)?a.duration*1000:0;
    try{const AC=window.AudioContext||window.webkitAudioContext;if(!AC)throw new Error('no audio context');const ctx=new AC();const src=ctx.createMediaElementSource(a);const dest=ctx.createMediaStreamDestination();src.connect(dest);src.connect(ctx.destination);await ctx.resume();return{stream:dest.stream,ms,a,cleanup:()=>{try{src.disconnect();dest.disconnect();ctx.close();}catch(_){}}};}
    catch(_){const stream=a.captureStream?.()||a.mozCaptureStream?.()||null;return{stream,ms,a,cleanup:()=>{}};}
  }
  async function render(){
    const ss=sceneData();if(!ss.length){status.textContent='Create a project first.';return;}if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video recording is not supported by this browser.';return;}
    button.disabled=true;state.textContent='Rendering';preview.hidden=true;download.hidden=true;status.textContent='Preparing polished educational render…';if(outputUrl)URL.revokeObjectURL(outputUrl);
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const ctx=canvas.getContext('2d');const stream=canvas.captureStream(24);let au={stream:null,ms:0,a:null,cleanup:()=>{}};try{au=await getAudio();}catch(_){ }
    if(au.stream)au.stream.getAudioTracks().forEach(track=>stream.addTrack(track));
    const counts=ss.map(s=>Math.max(2,words(s.narration).length)),sum=counts.reduce((a,b)=>a+b,0);const durations=counts.map(n=>au.ms?Math.max(1700,au.ms*n/sum):Math.max(2800,Math.min(9000,n/2.2*1000)));const total=durations.reduce((a,b)=>a+b,0),type=mime();
    if(!type){status.textContent='No supported video format is available on this browser.';button.disabled=false;state.textContent='Draft';return;}
    let recorder;try{recorder=new MediaRecorder(stream,{mimeType:type,videoBitsPerSecond:2600000,audioBitsPerSecond:128000});}catch(_){status.textContent='The browser could not start the video encoder.';button.disabled=false;state.textContent='Draft';return;}
    const chunks=[];let encoderError='';recorder.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};recorder.onerror=e=>{encoderError=e?.error?.name||'encoder error';};const stopped=new Promise(resolve=>{recorder.addEventListener('stop',resolve,{once:true});});recorder.start(250);if(au.a)try{await au.a.play();}catch(_){ }
    for(let i=0;i<ss.length;i++){const d=durations[i],start=performance.now();while(performance.now()-start<d){const p=Math.min(1,(performance.now()-start)/d);draw(ctx,ss[i],i,ss.length,p,styleSelect?.value||'Clean explainer');const completed=durations.slice(0,i).reduce((a,b)=>a+b,0)+p*d;status.textContent=`Rendering scene ${i+1} of ${ss.length}  •  ${Math.round(completed/total*100)}%`;await new Promise(requestAnimationFrame);}}
    recorder.stop();await stopped;stream.getTracks().forEach(track=>track.stop());au.cleanup();if(au.a)au.a.pause();
    if(encoderError){status.textContent=`Rendering stopped: ${encoderError}. Please try again.`;button.disabled=false;state.textContent='Draft';return;}
    const blob=new Blob(chunks,{type:recorder.mimeType||type});if(!blob.size){status.textContent='No video data was produced. Please try again.';button.disabled=false;state.textContent='Draft';return;}
    outputUrl=URL.createObjectURL(blob);preview.src=outputUrl;preview.hidden=false;download.href=outputUrl;const ext=(recorder.mimeType||type).includes('mp4')?'mp4':'webm';download.download=`anteneh-ai-studio-${Date.now()}.${ext}`;download.textContent=`Download ${ext.toUpperCase()} video`;download.hidden=false;state.textContent='Video ready';status.textContent=`Video ready  •  ${ext.toUpperCase()}  •  polished educational render${au.stream?'  •  narration included':'  •  no recorded narration'}  •  ${Math.round(total/1000)} seconds`;button.disabled=false;
  }
  button.addEventListener('click',()=>render().catch(error=>{console.error(error);status.textContent='Rendering failed. Please try again.';button.disabled=false;state.textContent='Draft';}));
})();
