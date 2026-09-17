/* ANTENEH RESEARCH HUB — command-center UI layer */
(()=>{
  const ready=()=>{
    const main=document.querySelector('.main');
    const hero=document.querySelector('.hero');
    if(!main||!hero||document.getElementById('rhShell')) return false;
    const shell=document.createElement('section');
    shell.id='rhShell';
    shell.className='rh-shell';
    shell.innerHTML=`
      <div class="rh-command">
        <div class="rh-eyebrow">RESEARCH CONTROL CENTER · ETHIOPIA</div>
        <div class="rh-mark"><span>ANTENEH RESEARCH HUB</span><b>የምርምር ማዕከል</b></div>
        <h3>Build evidence. Approve decisions. Analyze reproducibly.</h3>
        <p>Your research workspace stays evidence-driven, traceable, and under researcher control.</p>
        <div class="rh-actions">
          <button class="rh-action rh-primary" id="rhIntel">Run evidence intelligence</button>
          <button class="rh-action" id="rhSave">Save workspace</button>
          <button class="rh-action" id="rhBackup">Export backup</button>
        </div>
      </div>
      <div class="rh-metrics">
        <div class="rh-metric"><strong id="rhPct">5%</strong><span>Lifecycle</span></div>
        <div class="rh-metric"><strong id="rhEvidence">0</strong><span>Evidence records</span></div>
        <div class="rh-metric"><strong id="rhApproved">0</strong><span>Approved gates</span></div>
      </div>`;
    hero.after(shell);
    const style=document.createElement('style');
    style.textContent=`
      .rh-shell{display:grid;grid-template-columns:minmax(0,1fr) 285px;gap:14px;margin:0 0 18px;position:relative;z-index:2}
      .rh-command{padding:21px;border:1px solid rgba(145,166,189,.16);border-radius:20px;background:linear-gradient(135deg,rgba(7,137,48,.13),rgba(12,29,47,.96) 52%,rgba(15,71,175,.09));box-shadow:0 16px 45px rgba(0,0,0,.18)}
      .rh-eyebrow{font-size:10px;font-weight:900;letter-spacing:.12em;color:#FCDD09;margin-bottom:8px}.rh-mark{display:flex;gap:8px;align-items:center;flex-wrap:wrap;font-size:10px;color:#9eb2c4}.rh-mark b{color:#b9c9d8;font-weight:700}.rh-command h3{font-size:clamp(19px,2.6vw,29px);line-height:1.1;letter-spacing:-.025em;margin:11px 0 8px;color:#fff}.rh-command p{margin:0;color:#9eb2c4;font-size:12px;line-height:1.6}.rh-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.rh-action{min-height:42px;padding:9px 13px;border:1px solid rgba(145,166,189,.15);border-radius:11px;background:#0c1b2c;color:#eef6fc;font-weight:800;cursor:pointer}.rh-action:hover{border-color:rgba(56,216,245,.4);transform:translateY(-1px)}.rh-primary{background:linear-gradient(135deg,#078930,#0b6f3c 55%,#0F47AF);border-color:rgba(252,221,9,.3)}
      .rh-metrics{display:grid;grid-template-columns:1fr;gap:8px}.rh-metric{display:flex;flex-direction:column;justify-content:center;padding:15px;border:1px solid rgba(145,166,189,.13);border-radius:15px;background:linear-gradient(180deg,rgba(14,32,48,.96),rgba(8,18,29,.96))}.rh-metric strong{font-size:25px;letter-spacing:-.04em;color:#fff}.rh-metric span{font-size:10px;color:#7f95aa;margin-top:3px}
      @media(max-width:700px){.rh-shell{grid-template-columns:1fr;margin-bottom:14px}.rh-command{padding:16px;border-radius:17px}.rh-actions{display:grid;grid-template-columns:1fr}.rh-action{width:100%}.rh-metrics{grid-template-columns:repeat(3,1fr)}.rh-metric{padding:10px 7px}.rh-metric strong{font-size:18px}.rh-metric span{font-size:9px}}
    `;
    document.head.appendChild(style);
    const get=()=>{try{return JSON.parse(localStorage.getItem('arlab')||'{}')}catch{return {}}};
    const update=()=>{const s=get();const current=Number.isFinite(+s.current)?+s.current:0;const pct=Math.round(((current+1)/22)*100);const evidence=Array.isArray(s.evidence)?s.evidence.length:0;let approved=0;const p=s.publicationPackage||{};if(p.submissionReadinessAudit?.approvedAt)approved++;if(p.finalConsistencyAudit?.ready)approved++;document.getElementById('rhPct').textContent=pct+'%';document.getElementById('rhEvidence').textContent=evidence;document.getElementById('rhApproved').textContent=approved};
    document.getElementById('rhIntel').onclick=()=>document.getElementById('blueprint')?.click();
    document.getElementById('rhSave').onclick=()=>document.getElementById('save')?.click();
    document.getElementById('rhBackup').onclick=()=>{const blob=new Blob([JSON.stringify(get(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='anteneh-research-hub-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
    update();setInterval(update,1200);return true;
  };
  let n=0;const t=setInterval(()=>{if(ready()||++n>30)clearInterval(t)},300);
})();