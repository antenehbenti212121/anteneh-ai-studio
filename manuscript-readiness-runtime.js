/* ANTENEH RESEARCH HUB — publication manuscript readiness runtime */
(()=>{
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16)};
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const checks=s=>[
  ['Publication readiness approved',!!s.publicationReadinessApproved],
  ['Academic QC approved',!!s.qualityControlApproved||!!s.academicQCApproved],
  ['Reference audit approved',!!s.referenceAuditApproved],
  ['Discussion approved',!!s.discussionApproved],
  ['Conclusion approved',!!s.conclusionApproved],
  ['Traceable results available',!!s.resultsSnapshot||Array.isArray(s.resultsTrace)&&s.resultsTrace.length>0],
  ['Literature synthesis available',Array.isArray(s.literatureSynthesis)&&s.literatureSynthesis.length>0],
  ['Manuscript draft assembled',!!s.s20]
 ];
 const render=stage=>{if(Number(stage)!==20)return;const root=document.getElementById('content');if(!root)return;document.getElementById('manuscriptReadinessRuntime')?.remove();const s=read(),c=checks(s),box=document.createElement('div');box.id='manuscriptReadinessRuntime';box.className='card';box.innerHTML=`<h4>Final manuscript integrity gate</h4><p>The manuscript can be assembled for export only after the research lifecycle gates have been reviewed. This is a reporting/readiness check, not a guarantee of scientific validity or journal acceptance.</p>${c.map(x=>`<div class="paper"><b>${x[1]?'✓':'⚠'} ${esc(x[0])}</b></div>`).join('')}<label>Final researcher notes</label><textarea id="mrNotes" placeholder="Remaining caveats, journal requirements, reporting guideline, or expert review notes."></textarea><div class="actions"><button class="btn primary" id="mrApprove">Approve manuscript readiness</button></div><div id="mrStatus"></div>`;root.prepend(box);document.getElementById('mrApprove').onclick=()=>{const x=read(),cc=checks(x);if(cc.some(q=>!q[1])){alert('Complete all required manuscript gates before approval.');return}x.manuscriptReadiness={approved:true,notes:mrNotes.value.trim(),approvedAt:new Date().toISOString(),fingerprint:hash(JSON.stringify({title:x.title||'',checks:cc,manuscript:x.s20||''}))};x.manuscriptReadinessApproved=true;write(x);document.getElementById('mrStatus').innerHTML='<p class="notice">Manuscript readiness approved and fingerprint recorded.</p>'};};window.ManuscriptReadinessRuntime={render};})();