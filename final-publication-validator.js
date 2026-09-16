/* ANTENEH RESEARCH HUB — final publication package integrity validator */
(()=>{
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16)};
 const val=(s,k)=>{const v=s[k];return v!==undefined&&v!==null&&v!==''};
 const render=stage=>{if(Number(stage)!==21)return;const root=document.getElementById('content');if(!root)return;document.getElementById('finalPublicationValidator')?.remove();const s=read();const refs=Array.isArray(s.referenceAudit)?s.referenceAudit:[];const library=Array.isArray(s.referenceLibrary)?s.referenceLibrary:[];const trace=Array.isArray(s.resultsTrace)?s.resultsTrace:[];const lit=Array.isArray(s.literatureSynthesis?.entries)?s.literatureSynthesis.entries:[];const pkg=s.publicationPackage||{};const checks=[
 ['Publication-readiness approval',!!s.publicationReadiness?.approved,'Approve the publication-readiness gate.'],
 ['Reporting guideline selected',!!pkg.reportingGuideline,'Select the study-design reporting guideline.'],
 ['Reference audit approved',!!s.referenceAuditApproved,'Complete and approve the reference audit.'],
 ['Reference library usable',library.length>0||refs.length>0,'Import or record at least one reference.'],
 ['No unverified audited references',!refs.some(r=>r.status==='Not yet verified'),'Verify or explicitly exclude unverified references.'],
 ['Results traceability present',trace.length>0,'Record traceable results before final publication.'],
 ['Literature synthesis present',lit.length>0,'Add screened literature synthesis entries.'],
 ['Academic QC approved',!!(s.academicQCApproved||s.academicQCOk),'Pass the academic quality-control gate.'],
 ['Manuscript readiness approved',!!s.manuscriptReadinessApproved,'Approve manuscript readiness.'],
 ['Manuscript content present',String(s.s20||s.manuscript||'').trim().length>0,'Assemble the manuscript before export.']
 ];
 const ok=checks.every(x=>x[1]);const fingerprint=hash(JSON.stringify({checks:checks.map(x=>[x[0],x[1]]),referenceAuditFingerprint:s.referenceAuditFingerprint,publicationReadiness:s.publicationReadiness||null,reportingGuideline:pkg.reportingGuideline||null,resultsTraceCount:trace.length,literatureCount:lit.length,manuscript:String(s.s20||s.manuscript||'').length}));
 const box=document.createElement('div');box.id='finalPublicationValidator';box.className='card';box.innerHTML=`<h4>Final publication package integrity gate</h4><p>One final deterministic check before a manuscript package is treated as publication-ready. This does not guarantee journal acceptance.</p><div class="paper"><b>Status:</b> ${ok?'READY — all required integrity gates pass.':'NOT READY — one or more gates remain open.'}<br><b>Package fingerprint:</b> ${esc(fingerprint)}</div><div>${checks.map(x=>`<div class="paper"><b>${x[1]?'✓':'○'} ${esc(x[0])}</b>${x[1]?'':'<br><small>'+esc(x[2])+'</small>'}</div>`).join('')}</div><div class="actions"><button class="btn primary" id="fpvRun">Re-run validation</button><button class="btn" id="fpvApprove" ${ok?'':'disabled'}>Approve final package</button><button class="btn" id="fpvExport">Export validation JSON</button></div><div class="notice" id="fpvStatus">${ok?'All required gates pass. Researcher approval is still required before treating this as the final package.':'Resolve the listed gates and re-run validation.'}</div>`;root.prepend(box);
 const refresh=()=>render(21);
 fpvRun.onclick=refresh;
 fpvApprove.onclick=()=>{const x=read();if(!checks.every(c=>c[1]))return;const fp=hash(JSON.stringify({checks:checks.map(c=>[c[0],c[1]]),referenceAuditFingerprint:x.referenceAuditFingerprint,publicationReadiness:x.publicationReadiness||null,reportingGuideline:(x.publicationPackage||{}).reportingGuideline||null,resultsTraceCount:trace.length,literatureCount:lit.length,manuscript:String(x.s20||x.manuscript||'').length}));x.finalPublicationPackageApproved=true;x.finalPublicationPackageApprovedAt=new Date().toISOString();x.finalPublicationPackageFingerprint=fp;write(x);alert('Final publication package approved. Fingerprint saved.');refresh()};
 fpvExport.onclick=()=>{const x=read();const payload={exportedAt:new Date().toISOString(),project:'ANTENEH RESEARCH HUB',approved:!!x.finalPublicationPackageApproved,fingerprint,checks:checks.map(c=>({name:c[0],passed:c[1],action:c[2]})),reportingGuideline:(x.publicationPackage||{}).reportingGuideline||null,referenceAuditApproved:!!x.referenceAuditApproved,referenceCount:library.length||refs.length,resultsTraceCount:trace.length,literatureCount:lit.length};const b=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download='anteneh-final-publication-validation.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
 };
 window.FinalPublicationValidator={render};
})();