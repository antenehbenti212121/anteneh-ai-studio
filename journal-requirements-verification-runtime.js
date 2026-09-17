/* ANTENEH RESEARCH HUB — Stage 21 Journal Requirements Verification */
(()=>{
 const read=()=>{try{return JSON.parse(localStorage.getItem('arlab')||'{}')}catch{return {}}};
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16).padStart(8,'0')};
 const rows=[
  ['Article type / manuscript category','articleType'],['Word count / length','wordLimit'],['Abstract format / limit','abstract'],['Keywords','keywords'],['Required section structure','formatting'],['Reporting guideline / checklist','reporting'],['Reference style / reference limits','references'],['Figures / tables / supplements','figuresSupplements'],['Ethics / informed consent / approvals','ethics'],['Funding / conflict of interest','declarations'],['Data / code availability','dataAvailability'],['Registration / protocol identifier','registration'],['AI-use / disclosure policy','aiPolicy'],['Cover letter / submission files','submissionFiles'],['Author contributions / ORCID / corresponding author','authorInfo'],['File format / upload requirements','fileFormat'],['Anonymization / blinded review','anonymization'],['Preprint policy','preprint'],['Other journal-specific requirements','other']
 ];
 const render=stage=>{
  if(Number(stage)!==21)return;const root=document.getElementById('content');if(!root)return;
  document.getElementById('journalRequirementsVerificationRuntime')?.remove();
  const s=read(),p=s.publicationPackage||{},v=p.journalRequirementsVerification||{};
  const box=document.createElement('div');box.id='journalRequirementsVerificationRuntime';box.className='card';
  box.innerHTML=`<h4>Journal Requirements Verification</h4><p>Verify requirements from the journal's current official Instructions for Authors or submission source. The system never invents or remembers requirements as facts. A requirement marked Verified must include an evidence note.</p><div class="field"><label>TARGET JOURNAL / VENUE</label><input id="jrvJournal" value="${esc(p.journal||v.journal||'')}" placeholder="Journal or venue name"></div><div class="field"><label>OFFICIAL JOURNAL INSTRUCTIONS URL</label><input id="jrvUrl" value="${esc(v.sourceUrl||'')}" placeholder="https://journal.../instructions-for-authors"></div><div class="field"><label>SOURCE TITLE / VERSION / PAGE</label><input id="jrvTitle" value="${esc(v.sourceTitle||'')}" placeholder="Current Instructions for Authors — version/date if shown"></div><div class="field"><label>VERIFIED ON</label><input id="jrvDate" type="date" value="${esc(v.verifiedOn||'')}"></div><div class="field"><label>SOURCE NOTES</label><textarea id="jrvNotes" placeholder="Record version/date notices and exactly what source was checked.">${esc(v.sourceNotes||'')}</textarea></div><h5>Requirement matrix</h5>${rows.map(([label,key])=>`<div class="paper"><b>${label}</b><select id="jrv_${key}"><option value="unverified">Unverified</option><option value="verified">Verified</option><option value="missing">Missing</option><option value="not_applicable">Not applicable</option></select><textarea id="jrvn_${key}" placeholder="Evidence note required when marked Verified; record the requirement actually found in the source."></textarea></div>`).join('')}<div class="actions"><button class="btn primary" id="jrvSave">Save verification</button><button class="btn" id="jrvExport">Export verification JSON</button></div><div id="jrvStatus"></div>`;
  root.prepend(box);
  rows.forEach(([label,key])=>{document.getElementById('jrv_'+key).value=v.items?.[key]?.status||'unverified';document.getElementById('jrvn_'+key).value=v.items?.[key]?.note||''});
  document.getElementById('jrvSave').onclick=()=>{
   const journal=jrvJournal.value.trim(),sourceUrl=jrvUrl.value.trim(),sourceTitle=jrvTitle.value.trim(),verifiedOn=jrvDate.value,sourceNotes=jrvNotes.value.trim();
   if(!journal||!sourceUrl){jrvStatus.innerHTML='<p class="notice"><b>Save blocked.</b> Enter the target journal/venue and the official Instructions for Authors or submission requirements URL before recording verification.</p>';return}
   let invalid=false;const items={};
   rows.forEach(([label,key])=>{const status=document.getElementById('jrv_'+key).value,note=document.getElementById('jrvn_'+key).value.trim();if(status==='verified'&&!note)invalid=true;items[key]={label,status,note}});
   if(invalid){jrvStatus.innerHTML='<p class="notice"><b>Save blocked.</b> Every requirement marked Verified must include an evidence note from the source. Use Unverified, Missing, or Not applicable when appropriate.</p>';return}
   const payload={journal,sourceUrl,sourceTitle,verifiedOn,sourceNotes,items};
   const fingerprint=hash(JSON.stringify(payload));
   const x=read();x.publicationPackage={...(x.publicationPackage||{}),journal,journalRequirementsVerification:{...payload,retrievedAt:new Date().toISOString(),fingerprint,savedAt:new Date().toISOString()}};write(x);
   const counts={verified:0,missing:0,unverified:0,not_applicable:0};Object.values(items).forEach(i=>counts[i.status]++);
   jrvStatus.innerHTML=`<p class="notice"><b>Verification record saved.</b> Verified: ${counts.verified}; Missing: ${counts.missing}; Unverified: ${counts.unverified}; N/A: ${counts.not_applicable}. Fingerprint: ${esc(fingerprint)}</p>`;
  };
  document.getElementById('jrvExport').onclick=()=>{const x=read(),v=x.publicationPackage?.journalRequirementsVerification||{};const u=URL.createObjectURL(new Blob([JSON.stringify({exportedAt:new Date().toISOString(),...v},null,2)],{type:'application/json'})),a=document.createElement('a');a.href=u;a.download='anteneh-journal-requirements-verification.json';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
 };
 window.JournalRequirementsVerificationRuntime={render,fields:rows};
})();
