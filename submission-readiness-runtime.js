/* ANTENEH RESEARCH HUB — submission readiness auditor */
(()=>{
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16)};
 const val=(x)=>{if(x===true)return'verified';if(x===false)return'missing';if(x==null||x==='')return'missing';if(typeof x==='object'&&x.status)return String(x.status);return String(x).trim()?'verified':'missing'};
 const ok=v=>v==='verified'||v==='not_applicable';
 const audit=s=>{
  const p=s.publicationPackage||{}, manuscript=s.manuscript||{}, ethics=s.ethics||{};
  const checklist=p.submissionChecklist||{};
  const items=[
   ['Final publication package',ok(val(p.finalPublicationApproved||p.approved))?'verified':'missing', 'Final publication package approval is required.'],
   ['Target journal / venue',val(p.journal), 'Enter the actual target journal or venue.'],
   ['Article type',val(p.articleType), 'Specify the article type accepted by the target venue.'],
   ['Author information',val(p.authors||p.authorNames), 'Confirm author names and order.'],
   ['Corresponding author',val(checklist.correspondingAuthor), 'Verify the corresponding author/contact details.'],
   ['Reporting guideline',val(p.reportingGuideline), 'Select the appropriate study-design reporting guideline or mark not applicable.'],
   ['Journal requirements',val(p.verifiedRequirements), 'Verify the journal\'s current instructions for authors.'],
   ['Reference audit',ok(val(s.referenceAuditApproved))?'verified':'missing', 'Reference audit must be approved.'],
   ['Academic QC',ok(val(s.academicQCApproved||s.academicQcApproved))?'verified':'missing', 'Academic quality control must be approved.'],
   ['Manuscript readiness',ok(val(s.manuscriptReadinessApproved))?'verified':'missing', 'Manuscript readiness must be approved.'],
   ['Title / abstract / keywords',val(checklist.titleAbstractKeywords), 'Confirm title, abstract and keywords are present and consistent.'],
   ['Ethics statement',val(ethics.status||checklist.ethics), 'Verify ethics approval/exemption or explicitly mark not applicable.'],
   ['Informed consent',val(checklist.informedConsent), 'Verify consent status or explicitly mark not applicable.'],
   ['Funding statement',val(checklist.funding), 'Verify funding or explicitly mark not applicable.'],
   ['Conflict of interest',val(checklist.conflictOfInterest), 'Verify conflicts or explicitly mark none/not applicable.'],
   ['Data availability',val(checklist.dataAvailability), 'Verify data availability statement.'],
   ['Registration / protocol ID',val(checklist.registration), 'Verify registration/protocol ID or explicitly mark not applicable.'],
   ['Supplementary files',val(checklist.supplementaryFiles), 'Verify supplementary materials or explicitly mark not applicable.'],
   ['Cover letter',val(p.coverLetterNotes||checklist.coverLetter), 'Complete a cover letter or explicitly record that it is not required.'],
   ['Researcher approval',ok(val(checklist.researcherApproval))?'verified':'missing', 'Final submission requires explicit researcher approval.']
  ];
  const blockers=items.filter(x=>!ok(x[1]));
  const warnings=[];
  if(val(p.reportingGuideline)==='missing')warnings.push('Guideline selection is missing; EQUATOR lists study-design-specific reporting guidance.');
  if(val(p.verifiedRequirements)==='missing')warnings.push('Journal requirements have not been verified from the current journal instructions.');
  if(val(checklist.dataAvailability)==='unverified')warnings.push('Data availability is still unverified.');
  const fingerprint=hash(JSON.stringify(items));
  return {items,blockers,warnings,fingerprint,ready:blockers.length===0};
 };
 const render=stage=>{if(Number(stage)!==21)return;const root=document.getElementById('content');if(!root)return;document.getElementById('submissionReadinessRuntime')?.remove();const s=read(),a=audit(s),box=document.createElement('div');box.id='submissionReadinessRuntime';box.className='card';
  box.innerHTML=`<h4>Submission Readiness Auditor</h4><p>Deterministic pre-submission audit. Unknown or unverified requirements never count as passed.</p><div class="paper"><b>Status:</b> <span id="sraOverall">${a.ready?'READY FOR RESEARCHER APPROVAL':'BLOCKED — ACTION REQUIRED'}</span><br><b>Audit fingerprint:</b> <code>${a.fingerprint}</code></div><div id="sraList"></div><div class="actions"><button class="btn primary" id="sraRun">Run audit</button><button class="btn" id="sraExport">Export audit JSON</button><button class="btn" id="sraApprove">Record researcher approval</button></div><div id="sraStatus"></div>`;
  root.prepend(box);
  const list=document.getElementById('sraList');list.innerHTML=a.items.map(x=>`<div class="paper"><b>${esc(x[0])}</b> — <span>${esc(x[1])}</span><br><small>${esc(x[2])}</small></div>`).join('');
  document.getElementById('sraRun').onclick=()=>render(21);
  document.getElementById('sraExport').onclick=()=>{const x=read(),r=audit(x);const out={exportedAt:new Date().toISOString(),ready:r.ready,blockers:r.blockers,warnings:r.warnings,items:r.items,fingerprint:r.fingerprint};const u=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'})),d=document.createElement('a');d.href=u;d.download='anteneh-submission-readiness-audit.json';d.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
  document.getElementById('sraApprove').onclick=()=>{const x=read(),r=audit(x);if(!r.ready){document.getElementById('sraStatus').innerHTML='<p class="notice"><b>Approval blocked.</b> Resolve every submission blocker first.</p>';return}x.publicationPackage={...(x.publicationPackage||{}),submissionChecklist:{...(x.publicationPackage?.submissionChecklist||{}),researcherApproval:'verified',researcherApprovedAt:new Date().toISOString(),auditFingerprint:r.fingerprint}};write(x);document.getElementById('sraStatus').innerHTML='<p class="notice"><b>Researcher approval recorded.</b> The audit fingerprint is stored with the submission package.</p>'};
 };
 window.SubmissionReadinessRuntime={render,audit};
})();
