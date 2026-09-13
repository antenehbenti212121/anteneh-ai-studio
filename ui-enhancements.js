/* ANTENEH RESEARCH HUB — responsive research workspace UI */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .rh-shell{margin:4px 0 14px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:stretch}
  .rh-command{background:linear-gradient(135deg,rgba(124,92,255,.20),rgba(56,216,245,.10));border:1px solid #355276;border-radius:18px;padding:16px;box-shadow:0 14px 40px rgba(0,0,0,.18)}
  .rh-command .eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#58e6a3;font-weight:900}
  .rh-command h3{font-size:clamp(18px,3vw,28px);margin:5px 0 5px}
  .rh-command p{margin:0;color:#a9bbcf;line-height:1.5;max-width:760px}
  .rh-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
  .rh-action{border:1px solid #355276;background:#0a1727;color:#fff;border-radius:10px;padding:9px 11px;font-weight:800;cursor:pointer}
  .rh-action.primary{background:linear-gradient(135deg,#7c5cff,#5e8cff);border-color:transparent}
  .rh-metrics{display:grid;grid-template-columns:repeat(3,minmax(90px,1fr));gap:7px;min-width:250px}
  .rh-metric{background:#0a1727;border:1px solid #203852;border-radius:14px;padding:11px;text-align:center}
  .rh-metric strong{display:block;font-size:20px}.rh-metric span{display:block;color:#91a6bd;font-size:10px;margin-top:3px}
  .rh-stage-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
  .rh-stage-badge{font-size:10px;border:1px solid #355276;border-radius:99px;padding:5px 8px;color:#58e6a3;background:#0a1727}
  .stage{transition:transform .15s,border-color .15s,background .15s}.stage:hover{transform:translateX(2px);border-color:#5e8cff}.stage.active{box-shadow:0 0 0 1px rgba(124,92,255,.15),0 6px 18px rgba(0,0,0,.18)}
  .rh-director{border:1px solid #355276!important;background:linear-gradient(180deg,#0d1c2e,#0a1727)!important}
  .rh-director .rh-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#58e6a3;margin-right:6px;box-shadow:0 0 10px rgba(88,230,163,.65)}
  @media(max-width:1050px){.rh-shell{grid-template-columns:1fr}.rh-metrics{min-width:0}}
  @media(max-width:700px){.rh-shell{margin-bottom:10px}.rh-command{padding:13px;border-radius:15px}.rh-metrics{grid-template-columns:repeat(3,1fr)}.rh-metric{padding:8px}.rh-metric strong{font-size:17px}.rh-command p{font-size:12px}.rh-action{flex:1;min-width:110px}}
  `;
  document.head.appendChild(style);

  const state=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
  const save=s=>localStorage.setItem('arlab',JSON.stringify(s));
  function injectShell(){
    if(document.getElementById('rhShell'))return;
    const main=document.querySelector('.main');
    if(!main)return;
    const shell=document.createElement('div');shell.id='rhShell';shell.className='rh-shell';
    shell.innerHTML=`<div class="rh-command"><div class="eyebrow">RESEARCH CONTROL CENTER</div><h3 id="rhTitle">Build evidence. Approve decisions. Analyze reproducibly.</h3><p id="rhSubtitle">Your workspace is local-first and evidence-driven. Critical scientific decisions stay under researcher control.</p><div class="rh-actions"><button class="rh-action primary" id="rhIntel">Run evidence intelligence</button><button class="rh-action" id="rhSave">Save workspace</button><button class="rh-action" id="rhExport">Export backup</button></div></div><div class="rh-metrics"><div class="rh-metric"><strong id="rhPct">5%</strong><span>Lifecycle</span></div><div class="rh-metric"><strong id="rhEvidence">0</strong><span>Evidence records</span></div><div class="rh-metric"><strong id="rhReady">0</strong><span>Approved gates</span></div></div>`;
    const hero=document.querySelector('.hero');hero?.after(shell);
    document.getElementById('rhIntel').onclick=()=>document.getElementById('blueprint')?.click();
    document.getElementById('rhSave').onclick=()=>document.getElementById('save')?.click();
    document.getElementById('rhExport').onclick=()=>{const blob=new Blob([JSON.stringify(state(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='anteneh-research-hub-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)};
  }
  function update(){
    const s=state(),total=22,current=Math.min(total,Number(s.current||0)+1),pct=Math.round(current/total*100);
    const e=Array.isArray(s.evidence)?s.evidence.length:0;
    let ready=0;if(s.methodology?.approved)ready++;if(s.analysisPlan?.approved)ready++;if(s.qualityControl?.approved)ready++;
    const p=document.getElementById('rhPct'),ev=document.getElementById('rhEvidence'),r=document.getElementById('rhReady');if(p)p.textContent=pct+'%';if(ev)ev.textContent=e;if(r)r.textContent=ready;
    document.querySelectorAll('.card h4').forEach(h=>{if(h.textContent.trim()==='Research director'){h.parentElement.classList.add('rh-director');h.innerHTML='<span class="rh-dot"></span>Research director';}});
    const title=document.getElementById('stageTitle');const sub=document.getElementById('rhSubtitle');if(title&&sub)sub.textContent='Current stage: '+title.textContent.replace(/^\d+\s·\s/,'')+' · Evidence and approved decisions remain traceable.';
  }
  function boot(){injectShell();update();setTimeout(update,700);setInterval(update,2500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
