/* ANTENEH RESEARCH HUB — reporting checklist mapping runtime */
(()=>{
  const KEY='arlab';
  const read=()=>JSON.parse(localStorage.getItem(KEY)||'{}');
  const write=(s)=>localStorage.setItem(KEY,JSON.stringify(s));
  const esc=(x)=>String(x??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const hash=(str)=>{let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')};
  const guidelines={STROBE:'STROBE',CONSORT:'CONSORT',PRISMA:'PRISMA',SPIRIT:'SPIRIT / PRISMA-P',STARD:'STARD',TRIPOD:'TRIPOD',CARE:'CARE',SRQR:'SRQR / COREQ',SQUIRE:'SQUIRE',CHEERS:'CHEERS',ARRIVE:'ARRIVE',AGREE:'AGREE / RIGHT'};
  const getPackage=(s)=>s.publicationPackage||{};
  const getRows=(s)=>getPackage(s).submissionChecklistMapping?.items||[];
  const render=()=>{
    const stage=Number(read().current||0); if(stage!==21)return;
    const host=document.querySelector('#content')||document.querySelector('.main'); if(!host)return;
    if(document.getElementById('submissionChecklistMappingCard'))return;
    const s=read(), pkg=getPackage(s), existing=pkg.submissionChecklistMapping||{};
    const currentGuideline=existing.guideline||pkg.submissionPlan?.reportingGuideline||pkg.reportingGuideline||'';
    const defaultItems=existing.items?.length?existing.items:[];
    const card=document.createElement('section'); card.id='submissionChecklistMappingCard'; card.className='card';
    card.innerHTML=`<div class="section-title">Reporting checklist mapping</div>
      <p class="muted">Map each reporting item to where it is addressed in the manuscript. Page numbers and locations must be supplied or verified by you; this tool never invents them.</p>
      <div class="grid two">
        <label>Guideline<select id="scmGuideline"><option value="">Select/confirm guideline</option>${Object.entries(guidelines).map(([k,v])=>`<option value="${k}">${esc(v)}</option>`).join('')}</select></label>
        <label>Checklist source URL<input id="scmSource" placeholder="Paste the exact checklist/source URL"></label>
      </div>
      <div class="grid two"><label>Item ID<input id="scmId" placeholder="e.g. 11a"></label><label>Reporting item<textarea id="scmItem" rows="2" placeholder="Paste the checklist item text"></textarea></label></div>
      <div class="grid three"><label>Status<select id="scmStatus"><option value="addressed">Addressed</option><option value="not_applicable">Not applicable</option><option value="missing">Missing</option><option value="unverified">Unverified</option></select></label><label>Page / section<input id="scmLocation" placeholder="e.g. p. 7, Methods — Sampling"></label><label>Notes / N/A rationale<input id="scmNotes" placeholder="Why N/A, or what remains to verify"></label></div>
      <div class="row"><button class="btn" id="scmAdd">Add checklist item</button><button class="btn secondary" id="scmExport">Export mapping JSON</button><button class="btn secondary" id="scmClear">Clear mapping</button></div>
      <div id="scmSummary" class="muted" style="margin-top:10px"></div><div id="scmTable" style="margin-top:10px"></div>`;
    host.appendChild(card);
    document.getElementById('scmGuideline').value=currentGuideline;
    document.getElementById('scmSource').value=existing.sourceUrl||'';
    const save=(items)=>{const st=read();const p=st.publicationPackage||{};const g=document.getElementById('scmGuideline').value;const source=document.getElementById('scmSource').value.trim();const canonical={guideline:g,sourceUrl:source,items};const fp=hash(JSON.stringify(canonical));p.submissionChecklistMapping={...canonical,fingerprint:fp,updatedAt:new Date().toISOString()};st.publicationPackage=p;write(st);return p.submissionChecklistMapping};
    const refresh=()=>{const rows=getRows(read());const counts=rows.reduce((a,r)=>(a[r.status]=(a[r.status]||0)+1,a),{});document.getElementById('scmSummary').textContent=`Items: ${rows.length} · Addressed: ${counts.addressed||0} · N/A: ${counts.not_applicable||0} · Missing: ${counts.missing||0} · Unverified: ${counts.unverified||0}`;
      document.getElementById('scmTable').innerHTML=rows.length?`<table class="data-table"><thead><tr><th>ID</th><th>Item</th><th>Status</th><th>Location</th><th>Notes</th><th></th></tr></thead><tbody>${rows.map((r,i)=>`<tr><td>${esc(r.id)}</td><td>${esc(r.item)}</td><td>${esc(r.status)}</td><td>${esc(r.location)}</td><td>${esc(r.notes)}</td><td><button class="btn secondary scmDel" data-i="${i}">Remove</button></td></tr>`).join('')}</tbody></table>`:'<div class="muted">No checklist items mapped yet.</div>';
      document.querySelectorAll('.scmDel').forEach(b=>b.onclick=()=>{const st=read();const rows=getRows(st).slice();rows.splice(Number(b.dataset.i),1);save(rows);refresh()});
    };
    defaultItems.length&&refresh();
    document.getElementById('scmAdd').onclick=()=>{const id=document.getElementById('scmId').value.trim(),item=document.getElementById('scmItem').value.trim();if(!id||!item){alert('Add an item ID and checklist item first.');return}const rows=getRows(read()).slice();const status=document.getElementById('scmStatus').value;const location=document.getElementById('scmLocation').value.trim();const notes=document.getElementById('scmNotes').value.trim();if(status==='not_applicable'&&!notes){alert('For Not applicable, add the rationale.');return}rows.push({id,item,status,location,notes});save(rows);['scmId','scmItem','scmLocation','scmNotes'].forEach(id=>document.getElementById(id).value='');refresh()};
    document.getElementById('scmExport').onclick=()=>{const m=read().publicationPackage?.submissionChecklistMapping||{};const blob=new Blob([JSON.stringify(m,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='submission-checklist-mapping.json';a.click();URL.revokeObjectURL(a.href)};
    document.getElementById('scmClear').onclick=()=>{if(!confirm('Clear the reporting checklist mapping?'))return;const st=read();if(st.publicationPackage)delete st.publicationPackage.submissionChecklistMapping;write(st);refresh()};
  };
  window.SubmissionChecklistMappingRuntime={render};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
  setInterval(()=>{if(!document.getElementById('submissionChecklistMappingCard'))render()},1000);
})();
