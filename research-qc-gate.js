/* ANTENEH RESEARCH HUB — lightweight research QC gate */
(()=>{
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const checks=s=>[
  ['Research title',!!s.title],
  ['Evidence map',Array.isArray(s.evidence)&&s.evidence.length>0],
  ['Methodology approved',!!s.methodology?.approved],
  ['Analysis plan approved when data exists',!s.dataset||!!s.analysisPlan?.approved],
  ['Dataset provenance recorded when data exists',!s.dataset||!!s.dataset.provenance],
  ['Results trace recorded when results exist',!s.resultsSnapshot&&!s.inferentialResults?.length||!!s.resultsSnapshot||!!s.inferentialResults],
  ['R verification recorded for inferential results',!s.inferentialResults?.length||Array.isArray(s.rAnalyses)&&s.rAnalyses.length>0]
 ];
 const render=()=>{
  const s=read(),c=checks(s),pass=c.filter(x=>x[1]).length;
  let box=document.getElementById('researchQcGate');
  if(!box){box=document.createElement('div');box.id='researchQcGate';box.className='notice';const main=document.querySelector('.main');if(main)main.insertBefore(box,main.firstChild)}
  box.innerHTML='<b>Research integrity gate</b><br><small>'+pass+'/'+c.length+' checks currently satisfied. This is a workflow safeguard, not a substitute for researcher or supervisor review.</small><div style="margin-top:8px">'+c.map(x=>'<div> '+(x[1]?'✓':'⚠')+' '+esc(x[0])+'</div>').join('')+'</div>';
  box.style.borderColor=pass===c.length?'rgba(25,195,125,.35)':'rgba(255,190,80,.28)';
 };
 window.ResearchQCGate={checks,render,save:()=>{const s=read();s.qualityGate={checks:checks(s).map(x=>({item:x[0],pass:x[1]})),savedAt:new Date().toISOString()};write(s);render();}};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
 setInterval(render,1500);
})();
