/* ANTENEH RESEARCH HUB — unified research artifact hub */
(()=>{
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const defs=[
  ['researchProject','Research Project','The master research workspace containing the complete study lifecycle.','Always'],
  ['proposal','Research Proposal','The planning/approval document: problem, gap, objectives, questions, methods, sampling, ethics and analysis plan.','Planning'],
  ['protocol','Research Protocol / Study Plan','The operationally detailed plan used to conduct the approved study.','Planning → Fieldwork'],
  ['manuscript','Research Manuscript','The publication-focused report of the completed research, including results, discussion and conclusion.','Reporting'],
  ['submissionPackage','Journal Submission Package','The journal-specific final package: manuscript, checklist, declarations, cover letter and required files.','Submission']
 ];
 const stageName=n=>({0:'Intelligence',1:'Problem',2:'Gap',3:'Objectives',4:'Questions',5:'Hypotheses',6:'Framework',7:'Methodology',8:'Sampling',9:'Questionnaire',10:'Kobo',11:'Collection',12:'Data quality',13:'Analysis plan',14:'Analysis',15:'Results',16:'Literature synthesis',17:'Discussion',18:'Conclusion',19:'References / QC',20:'Manuscript',21:'Publication / submission'}[n]||'Research');
 const render=stage=>{
  const root=document.getElementById('content');if(!root)return;
  document.getElementById('researchArtifactHub')?.remove();
  const s=read(),n=Number(stage??s.current??0),p=s.publicationPackage||{};
  const box=document.createElement('div');box.id='researchArtifactHub';box.className='card';
  box.innerHTML=`<h4>Research Workspace</h4><p class="muted">One research project, with connected documents and evidence—not separate disconnected projects.</p><div class="paper"><b>Current stage:</b> ${esc(stageName(n))} (${n})</div><div class="paper" style="display:grid;gap:8px">${defs.map(([id,name,desc,phase])=>{
    const status=id==='researchProject'?'Master workspace':(id==='proposal'?(n<=13?'Evolving':'Archived snapshot'):(id==='manuscript'?(n>=20?'Active':'Not yet primary'):(id==='submissionPackage'?(n===21?'Active':'Later'):'Connected')));
    return `<div><b>${esc(name)}</b> — <span>${esc(status)}</span><br><small>${esc(desc)} <i>${esc(phase)}</i></small></div>`;
  }).join('')}</div><div class="notice"><b>Important:</b> the proposal is not the whole research project, and the manuscript is not the proposal copied forward. They share the same research evidence, decisions, dataset and provenance while serving different purposes.</div>`;
  root.prepend(box);
 };
 window.ResearchArtifactHub={render};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>render(Number(read().current||0)));else render(Number(read().current||0));
})();
