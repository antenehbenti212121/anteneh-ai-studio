/* ANTENEH RESEARCH HUB — final publication integrity gate */
(()=>{
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16)};
 const arr=x=>Array.isArray(x)?x:[];
 const manuscript=s=>String(s.s20||'');
 const referenceIds=s=>{const a=arr(s.referenceLibrary),seen=new Set(),dupes=[];a.forEach(r=>{const id=String(r.doi||r.DOI||r.pmid||r.PMID||r.openalexId||r.openalex||r.url||r.URL||'').trim().toLowerCase();if(id){if(seen.has(id))dupes.push(id);else seen.add(id)}});return {count:a.length,dupes}};
 const build=s=>{
   const refs=referenceIds(s),m=manuscript(s);
   const checks=[
    ['Publication-readiness approved',!!s.publicationReadiness?.approved||!!s.publicationReadinessApproved],
    ['Reporting guideline selected',!!s.publicationPackage?.reportingGuideline],
    ['Academic QC approved',!!s.academicQCOk||!!s.academicQCApproved||!!s.qualityControlApproved],
    ['Reference audit approved',!!s.referenceAuditApproved],
    ['Reference library has no duplicate stable identifiers',refs.dupes.length===0],
    ['Reference audit contains no unverified records',!arr(s.referenceAudit).some(r=>r.status==='Not yet verified')],
    ['Results traceability available when results are present',!/(^|\\n)3\\. RESULTS\\s*$/m.test(m)||arr(s.resultsTrace).length>0||!!s.resultsSnapshot],
    ['Literature synthesis present',arr(s.literatureSynthesis?.entries).length>0||typeof s.literatureSynthesis==='string'],
    ['Discussion output exists',!!s.s16||!!s.discussionDraft||!!s.discussionApproved],
    ['Conclusion output exists',!!s.s17||!!s.conclusionDraft||!!s.conclusionApproved],
    ['Manuscript readiness approved',!!s.manuscriptReadiness?.approved||!!s.manuscriptReadinessApproved],
    ['Manuscript assembled',!!m],
    ['Researcher explicitly approved final package',!!s.finalPublicationGate?.researcherApproved]
   ];
   return {checks,refs,manuscriptFingerprint:hash(m)};
 };
 const render=stage=>{if(Number(stage)!==21)return;const root=document.getElementById('content');if(!root)return;document.getElementById('finalPublicationGateRuntime')?.remove();const s=read(),g=build(s),box=document.createElement('div');box.id='finalPublicationGateRuntime';box.className='card';box.innerHTML=`<h4>Final publication integrity gate</h4><p>This gate checks package integrity and traceability before export. Passing it is not a guarantee of scientific validity, peer-review acceptance, or journal acceptance.</p><div class="paper" id="fpgChecks"></div><div class="paper"><b>Reference records:</b> ${g.refs.count}<br><b>Duplicate stable identifiers:</b> ${g.refs.dupes.length}<br><b>Manuscript fingerprint:</b> ${esc(g.manuscriptFingerprint)}</div><label>Final researcher approval note</label><textarea id="fpgNote" placeholder="Confirm that you reviewed the final research package and accept responsibility for the scientific decisions and remaining limitations."></textarea><div class="actions"><button class="btn primary" id="fpgValidate">Re-run integrity check</button><button class="btn" id="fpgApprove">Approve final publication package</button><button class="btn" id="fpgJSON">Export integrity snapshot</button></div><div id="fpgStatus"></div>`;root.prepend(box);
 const refresh=()=>{const x=build(read());document.getElementById('fpgChecks').innerHTML=x.checks.map(([n,v])=>`<div><b>${v?'✓':'⚠'} ${esc(n)}</b></div>`).join('');return x};
 document.getElementById('fpgValidate').onclick=()=>{const x=refresh();document.getElementById('fpgStatus').innerHTML=`<p><b>${x.checks.filter(q=>q[1]).length}/${x.checks.length} integrity checks pass.</b></p>`};
 document.getElementById('fpgApprove').onclick=()=>{const x=build(read());if(x.checks.some(q=>!q[1]&&q[0]!=='Researcher explicitly approved final package')){alert('Resolve every required integrity blocker before final approval.');refresh();return}const fresh=read();fresh.finalPublicationGate={researcherApproved:true,approvedAt:new Date().toISOString(),note:fpgNote.value.trim(),checks:x.checks,referenceCount:x.refs.count,duplicateStableIdentifiers:x.refs.dupes,manuscriptFingerprint:x.manuscriptFingerprint};fresh.finalPublicationGateFingerprint=hash(JSON.stringify(fresh.finalPublicationGate));write(fresh);refresh();document.getElementById('fpgStatus').innerHTML='<p class="notice"><b>Final publication package approved.</b> Integrity snapshot and fingerprint recorded.</p>'};
 document.getElementById('fpgJSON').onclick=()=>{const x=build(read());const payload={generatedAt:new Date().toISOString(),checks:x.checks,referenceCount:x.refs.count,duplicateStableIdentifiers:x.refs.dupes,manuscriptFingerprint:x.manuscriptFingerprint,finalPublicationGate:read().finalPublicationGate||null};const u=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='anteneh-final-publication-integrity.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
 refresh();
 };
 window.FinalPublicationGateRuntime={render,build};
})();
