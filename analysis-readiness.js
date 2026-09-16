/* ANTENEH RESEARCH HUB — analysis readiness control */
(()=>{
 const R=()=>JSON.parse(localStorage.getItem('arlab')||'{}'),W=x=>localStorage.setItem('arlab',JSON.stringify(x));
 const add=h=>{const c=document.getElementById('content');if(c&&!document.getElementById('analysis-readiness'))c.insertAdjacentHTML('afterbegin',h)};
 function render(stage){if(stage!==13)return;const s=R();add(`<div class="card" id="analysis-readiness"><h4>📊 Analysis Readiness</h4><p>Statistical execution is released only after the researcher has approved the analysis plan and completed the dataset quality review.</p><div id="arStatus" class="notice"></div><div class="actions"><button class="btn primary" id="arApprove">Approve dataset for analysis</button></div></div>`);const status=document.getElementById('arStatus'),btn=document.getElementById('arApprove');const refresh=()=>{const plan=!!s.analysisPlanApproved,quality=!!s.dataQualityApproved,blocked=!(plan&&quality);status.innerHTML=`Analysis plan: <b>${plan?'approved':'not approved'}</b><br>Data quality review: <b>${quality?'completed':'not completed'}</b><br><br>${blocked?'🔒 Analysis remains locked until both controls are approved.':'✓ Dataset is eligible to enter the approved statistical workflow.'}`;btn.disabled=blocked||!!s.analysisDatasetApproved;btn.textContent=s.analysisDatasetApproved?'✓ Dataset approved for analysis':'Approve dataset for analysis'};btn.onclick=()=>{s.analysisDatasetApproved=true;s.analysisDatasetApprovedAt=new Date().toISOString();W(s);refresh()};refresh()}
 window.AnalysisReadiness={render};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>render(Number(R().current||0)));else render(Number(R().current||0));
 setInterval(()=>render(Number(R().current||0)),1800);
})();
