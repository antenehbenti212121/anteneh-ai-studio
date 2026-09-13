/* ANTENEH RESEARCH HUB — responsive research workspace UI + Ethiopian visual identity */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
  :root{--et-green:#078930;--et-yellow:#FCDD09;--et-red:#DA121A;--et-blue:#0F47AF;--et-ink:#07140d;--et-gold:#d8a91e}
  body{background:radial-gradient(circle at 15% 0%,rgba(7,137,48,.10),transparent 28%),radial-gradient(circle at 85% 0%,rgba(218,18,26,.08),transparent 28%),#07111d}
  body:before{content:"";position:fixed;z-index:9999;left:0;right:0;top:0;height:4px;background:linear-gradient(90deg,var(--et-green) 0 33.33%,var(--et-yellow) 33.33% 66.66%,var(--et-red) 66.66%);pointer-events:none}
  .hero{position:relative;overflow:hidden;border-top:1px solid rgba(252,221,9,.18)}
  .hero:after{content:"";position:absolute;inset:auto 0 0;height:5px;background:linear-gradient(90deg,var(--et-green),var(--et-yellow),var(--et-red));opacity:.9}
  .rh-shell{margin:8px 0 14px;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:stretch;position:relative}
  .rh-shell:before{content:"🇪🇹";position:absolute;right:12px;top:-9px;font-size:22px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.35));z-index:2}
  .rh-command{background:linear-gradient(135deg,rgba(7,137,48,.20),rgba(15,71,175,.10) 48%,rgba(218,18,26,.12));border:1px solid rgba(252,221,9,.28);border-radius:18px;padding:16px;box-shadow:0 14px 40px rgba(0,0,0,.18);position:relative;overflow:hidden}
  .rh-command:after{content:"";position:absolute;right:-55px;bottom:-70px;width:170px;height:170px;border:2px solid rgba(252,221,9,.12);transform:rotate(45deg);box-shadow:0 0 0 16px rgba(7,137,48,.03),0 0 0 32px rgba(218,18,26,.025);pointer-events:none}
  .rh-command .eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--et-yellow);font-weight:900}
  .rh-command h3{font-size:clamp(18px,3vw,28px);margin:5px 0 5px}
  .rh-command p{margin:0;color:#b7c9d9;line-height:1.5;max-width:760px}
  .rh-actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
  .rh-action{border:1px solid rgba(252,221,9,.24);background:#0a1727;color:#fff;border-radius:10px;padding:9px 11px;font-weight:800;cursor:pointer;transition:.18s ease}
  .rh-action:hover{transform:translateY(-1px);border-color:var(--et-yellow)}
  .rh-action.primary{background:linear-gradient(135deg,var(--et-green),#0c6d3a 55%,var(--et-blue));border-color:rgba(252,221,9,.45);box-shadow:0 7px 22px rgba(7,137,48,.22)}
  .rh-metrics{display:grid;grid-template-columns:repeat(3,minmax(90px,1fr));gap:7px;min-width:250px}
  .rh-metric{background:linear-gradient(180deg,rgba(7,137,48,.10),#0a1727);border:1px solid rgba(252,221,9,.18);border-radius:14px;padding:11px;text-align:center}
  .rh-metric strong{display:block;font-size:20px;color:#fff}.rh-metric span{display:block;color:#91a6bd;font-size:10px;margin-top:3px}
  .rh-stage-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
  .rh-stage-badge{font-size:10px;border:1px solid rgba(252,221,9,.3);border-radius:99px;padding:5px 8px;color:var(--et-yellow);background:#0a1727}
  .stage{transition:transform .15s,border-color .15s,background .15s}.stage:hover{transform:translateX(2px);border-color:var(--et-yellow)}.stage.active{box-shadow:0 0 0 1px rgba(7,137,48,.25),0 6px 18px rgba(0,0,0,.18);border-left:3px solid var(--et-green)}
  .rh-director{border:1px solid rgba(252,221,9,.28)!important;background:linear-gradient(180deg,#10261b,#0a1727)!important}
  .rh-director .rh-dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--et-green);margin-right:6px;box-shadow:0 0 10px rgba(7,137,48,.75)}
  .rh-ethiopia-mark{display:inline-flex;align-items:center;gap:7px;margin:4px 0 10px;padding:5px 9px;border-radius:999px;background:rgba(15,71,175,.10);border:1px solid rgba(252,221,9,.22);font-size:11px;font-weight:800;color:#dfeaf4}
  .rh-ethiopia-mark i{display:block;width:28px;height:9px;border-radius:2px;background:linear-gradient(#078930 0 33%,#FCDD09 33% 66%,#DA121A 66%)}
  .rh-footer-line{height:3px;margin-top:20px;background:linear-gradient(90deg,transparent,var(--et-green),var(--et-yellow),var(--et-red),transparent);opacity:.75;border-radius:99px}
  @media(max-width:1050px){.rh-shell{grid-template-columns:1fr}.rh-metrics{min-width:0}}
  @media(max-width:700px){.rh-shell{margin-bottom:10px}.rh-command{padding:13px;border-radius:15px}.rh-metrics{grid-template-columns:repeat(3,1fr)}.rh-metric{padding:8px}.rh-metric strong{font-size:17px}.rh-command p{font-size:12px}.rh-action{flex:1;min-width:110px}.rh-shell:before{right:8px;top:-7px;font-size:18px}}
  `;
  document.head.appendChild(style);

  const state=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
  const save=s=>localStorage.setItem('arlab',JSON.stringify(s));
  function injectShell(){
    if(document.getElementById('rhShell'))return;
    const main=document.querySelector('.main');
    if(!main)return;
    const shell=document.createElement('div');shell.id='rhShell';shell.className='rh-shell';
    shell.innerHTML=`<div class="rh-command"><div class="eyebrow">RESEARCH CONTROL CENTER · ETHIOPIA</div><div class="rh-ethiopia-mark"><i></i><span>ANTENEH RESEARCH HUB · የምርምር ማዕከል</span></div><h3 id="rhTitle">Build evidence. Approve decisions. Analyze reproducibly.</h3><p id="rhSubtitle">Your workspace is local-first and evidence-driven. Critical scientific decisions stay under researcher control.</p><div class="rh-actions"><button class="rh-action primary" id="rhIntel">Run evidence intelligence</button><button class="rh-action" id="rhSave">Save workspace</button><button class="rh-action" id="rhExport">Export backup</button></div></div><div class="rh-metrics"><div class="rh-metric"><strong id="rhPct">5%</strong><span>Lifecycle</span></div><div class="rh-metric"><strong id="rhEvidence">0</strong><span>Evidence records</span></div><div class="rh-metric"><strong id="rhReady">0</strong><span>Approved gates</span></div></div>`;
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
