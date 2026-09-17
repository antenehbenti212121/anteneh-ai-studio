/* ANTENEH RESEARCH HUB — final cross-section consistency audit */
(()=>{
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const hash=x=>{let h=2166136261;for(const c of String(x))h=Math.imul(h^c.charCodeAt(0),16777619);return (h>>>0).toString(16)};
 const present=x=>x!==undefined&&x!==null&&String(x).trim()!=='';
 const journalReqStatus=p=>{const r=p.journalRequirementsVerification||{};if(!r.sourceUrl||!r.journal||p.journal!==r.journal)return'missing';const items=Object.values(r.items||{});if(!items.length)return'unverified';const payload={journal:r.journal,sourceUrl:r.sourceUrl,sourceTitle:r.sourceTitle||'',verifiedOn:r.verifiedOn||'',sourceNotes:r.sourceNotes||'',items:r.items};if(hash(JSON.stringify(payload))!==r.fingerprint)return'unverified';if(items.some(x=>x.status==='missing'))return'missing';if(items.some(x=>x.status==='unverified'))return'unverified';return'verified'};
 const audit=s=>{
  const p=s.publicationPackage||{}, m=s.manuscript||{}, ap=s.analysisPlan||{}, r=s.results||{}, lit=s.literatureSynthesis||{}, d=s.discussion||{}, c=s.conclusion||{}, refs=s.referenceLibrary||[];
  const items=[];
  const add=(label,status,detail)=>items.push({label,status,detail});
  add('Research title ↔ manuscript title',present(s.title)&&present(m.title)?(String(s.title).trim()===String(m.title).trim()?'aligned':'review'): 'missing');
  add('Objectives ↔ research questions',present(s.objectives||s.objective)?'present':'missing','Check semantic alignment manually; this audit does not invent equivalence.');
  add('Objectives ↔ methodology',present(s.objectives||s.objective)&&present(s.methodology||s.design)?'present':'missing','Verify every primary objective has an appropriate method.');
  add('Sampling ↔ analysis plan',present(s.sampling)&&present(ap)?'present':'missing','Verify sample design, unit of analysis and planned tests agree.');
  add('Analysis plan ↔ results trace',present(ap)&&present(r)?'present':'missing','Results should only contain analyses released by the approved plan.');
  add('Results ↔ discussion',present(r)&&present(d)?'present':'missing','Discussion should interpret reported results without introducing new untraceable statistics.');
  add('Discussion ↔ conclusion',present(d)&&present(c)?'present':'missing','Conclusions should remain within the evidence reported.');
  add('Literature synthesis ↔ discussion',present(lit)&&present(d)?'present':'missing','Verify claims in discussion are supported by the audited literature where appropriate.');
  add('References ↔ audited library',Array.isArray(refs)&&refs.length?'present':'missing',Array.isArray(refs)?`${refs.length} reference records available.`:'No reference library records.');
  add('Reference audit approval',s.referenceAuditApproved===true||s.referenceAuditApproved==='verified'?'verified':'missing','Required before final publication approval.');
  add('Academic QC approval',s.academicQCApproved===true||s.academicQcApproved===true?'verified':'missing','Required before final publication approval.');
  add('Manuscript readiness approval',s.manuscriptReadinessApproved===true?'verified':'missing','Required before final publication approval.');
  const jrs=journalReqStatus(p);add('Journal requirements verification',jrs,'Current official Instructions for Authors must be checked; assumptions never count as verified.');
  const jrv=p.journalRequirementsVerification||{};add('Journal requirements fingerprint integrity',jrs==='verified'&&present(jrv.fingerprint)?'verified':jrs==='missing'?'missing':'unverified','The stored fingerprint must match the saved verification record.');
  const scm=p.submissionChecklistMapping;add('Submission checklist mapping',scm?(scm.items?.length?'verified':'unverified'):p.reportingGuideline?'unverified':'missing','Page/section locations must be supplied from the actual manuscript, not guessed.');
  const manifest=p.submissionManifest;add('Submission manifest ↔ journal requirements',manifest&&manifest.journalRequirementsFingerprint&&manifest.journalRequirementsFingerprint===jrv.fingerprint?'verified':manifest?'unverified':'missing','The saved manifest must carry the same journal-requirements fingerprint as the current verification record.');
  const blockers=items.filter(x=>['missing'].includes(x.status));
  const reviews=items.filter(x=>x.status==='review');
  const unverified=items.filter(x=>x.status==='unverified');
  const fingerprint=hash(JSON.stringify(items));
  return {items,blockers,reviews,unverified,fingerprint,ready:blockers.length===0&&reviews.length===0&&unverified.length===0};
 };
 const render=stage=>{
  if(Number(stage)!==21)return;const root=document.getElementById('content');if(!root)return;
  document.getElementById('finalConsistencyAuditRuntime')?.remove();const s=read(),a=audit(s),box=document.createElement('div');box.id='finalConsistencyAuditRuntime';box.className='card';
  box.innerHTML=`<h4>Final Consistency Audit</h4><p>Cross-checks the research record before submission. It flags missing evidence and items needing human review; it does not claim semantic equivalence automatically.</p><div class="paper"><b>Status:</b> ${a.ready?'CONSISTENT ON AVAILABLE RECORD':'REVIEW REQUIRED'}<br><b>Audit fingerprint:</b> <code>${a.fingerprint}</code></div><div>${a.items.map(x=>`<div class="paper"><b>${esc(x.label)}</b> — ${esc(x.status)}<br><small>${esc(x.detail)}</small></div>`).join('')}</div><div class="paper"><b>Missing:</b> ${a.blockers.length}<br><b>Manual review:</b> ${a.reviews.length}<br><b>Unverified:</b> ${a.unverified.length}</div><div class="actions"><button class="btn" id="fcaExport">Export consistency audit</button><button class="btn primary" id="fcaSave">Save audit record</button></div><div id="fcaStatus"></div>`;root.appendChild(box);
  document.getElementById('fcaExport').onclick=()=>{const out={exportedAt:new Date().toISOString(),stage:21,...audit(read())};const u=URL.createObjectURL(new Blob([JSON.stringify(out,null,2)],{type:'application/json'})),d=document.createElement('a');d.href=u;d.download='anteneh-final-consistency-audit.json';d.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
  document.getElementById('fcaSave').onclick=()=>{const x=read(),a2=audit(x);x.finalConsistencyAudit={auditedAt:new Date().toISOString(),ready:a2.ready,fingerprint:a2.fingerprint,items:a2.items,missing:a2.blockers.length,manualReview:a2.reviews.length,unverified:a2.unverified.length};write(x);document.getElementById('fcaStatus').innerHTML='<p class="notice"><b>Consistency audit saved.</b> This does not submit the manuscript or replace researcher review.</p>'};
 };
 window.FinalConsistencyAuditRuntime={render,audit};
})();
