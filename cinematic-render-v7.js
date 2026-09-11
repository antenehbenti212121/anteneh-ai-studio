(() => {
  'use strict';
  const clean = v => String(v ?? '').replace(/\s+/g,' ').trim();
  const topic = () => clean(document.getElementById('prompt')?.value || '');
  const type = s => clean(s?.visualType || s?.type || 'concept').toLowerCase().replace(/ /g,'-');
  const theme = style => style === 'Whiteboard' ? {bg:'#fffdf8',fg:'#182235',muted:'#667085',accent:'#315dcc'} : style === 'Modern presentation' ? {bg:'#090b18',fg:'#fff',muted:'#b8c0d4',accent:'#b47cff'} : {bg:'#071526',fg:'#fff',muted:'#b8c5d9',accent:'#43c9e8'};
  const rr=(c,x,y,w,h,r=18)=>{c.beginPath();c.roundRect(x,y,w,h,r);c.closePath()};
  const txt=(c,s,x,y,size=24,fill='#fff',weight=700,align='left')=>{c.fillStyle=fill;c.font=`${weight} ${size}px system-ui`;c.textAlign=align;c.textBaseline='middle';c.fillText(s,x,y)};
  function renderScene(c,s,p,style){const t=theme(style),w=c.canvas.width,h=c.canvas.height;c.fillStyle=t.bg;c.fillRect(0,0,w,h);c.globalAlpha=.16;c.fillStyle=t.accent;c.beginPath();c.arc(w*.86,h*.18,150+25*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();c.globalAlpha=1;txt(c,'ANTENEH AI STUDIO',56,52,13,t.muted,800);txt(c,clean(s?.title)||'Lesson',56,100,34,t.fg,850);txt(c,type(s).toUpperCase(),56,145,12,t.accent,850);rr(c,70,215,1140,250,28);c.fillStyle='rgba(255,255,255,.07)';c.fill();txt(c,clean(s?.narration).slice(0,115),105,285,28,t.fg,750);txt(c,clean(s?.narration).slice(115,230),105,340,22,t.muted,650);txt(c,clean(s?.visual).slice(0,120),105,420,16,t.muted,650);txt(c,topic().slice(0,90),70,610,18,t.accent,800);txt(c,`${Number(s?.index||0)+1} / ${s?.total||1}`,1160,660,13,t.muted,800,'right')}
  window.antenehCinematicRenderV7={renderScene};
  const ensureVideoButton=()=>{if(document.getElementById('videoBtn'))return;const out=document.getElementById('videoOutput');if(!out)return;const b=document.createElement('button');b.id='videoBtn';b.type='button';b.className='studio-hidden-control';b.setAttribute('aria-hidden','true');b.tabIndex=-1;b.textContent='Render video';out.insertBefore(b,out.firstChild)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensureVideoButton,{once:true});else ensureVideoButton();
})();
