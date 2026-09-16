(()=>{
  const KEY='journalRequirements';
  const PACKAGE_KEY='publicationPackage';
  const FIELDS=[
    ['articleType','Manuscript/article type'],['wordCount','Word count / limit'],['abstract','Abstract format / limit'],['keywords','Keywords'],['structure','Required section structure'],['reportingGuideline','Reporting guideline / checklist'],['referenceStyle','Reference style'],['referenceLimit','Reference limits'],['figuresTables','Figures / tables limits'],['supplementary','Supplementary material'],['ethicsConsent','Ethics / informed consent'],['fundingCoiData','Funding / COI / data availability'],['registration','Registration / protocol'],['aiUse','AI-use / disclosure policy'],['coverLetter','Cover letter'],['authorsOrcid','Author contribution / ORCID'],['dataCode','Data / code availability'],['fileFormat','File format / submission files'],['anonymization','Anonymization / blinding'],['preprint','Preprint policy'],['other','Other journal-specific requirements']
  ];
  const load=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const save=v=>localStorage.setItem(KEY,JSON.stringify(v));
  const pkg=()=>{try{return JSON.parse(localStorage.getItem(PACKAGE_KEY)||'{}')}catch{return {}}};
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const fp=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return (h>>>0).toString(16).padStart(8,'0')};
  function render(){
    if(document.getElementById('journalRequirementsRuntime'))return;
    const stage=document.getElementById('stage21')||document.querySelector('[data-stage="21"]'); if(!stage)return;
    const box=document.createElement('section');box.id='journalRequirementsRuntime';box.className='research-runtime-card';
    const old=load()||{}; const req=old.requirements||{};
    box.innerHTML=`<h3>Journal Requirements Verification</h3><p>Enter the target journal/venue and the actual Instructions for Authors or submission-policy URL. This tool records requirements; it never invents journal rules.</p>
      <div class="grid"><label>Target journal / venue<input id="jrVenue" value="${esc(old.venue||'')}"></label><label>Instructions / policy URL<input id="jrUrl" type="url" value="${esc(old.sourceUrl||'')}"></label></div>
      <p><button id="jrSave">Save verification record</button> <button id="jrExport">Export JSON</button></p>
      <div id="jrStatus"></div><div id="jrRows"></div>`;
    stage.appendChild(box);
    const rows=document.getElementById('jrRows');
    const statuses=['unverified','verified','not_applicable','missing'];
    rows.innerHTML=FIELDS.map(([id,label])=>{const r=req[id]||{};return `<div class="jr-row"><strong>${esc(label)}</strong><select data-jr="${id}">${statuses.map(s=>`<option value="${s}" ${r.status===s?'selected':''}>${s.replace('_',' ')}</option>`).join('')}</select><input data-jrn="${id}" placeholder="Evidence / exact requirement / notes" value="${esc(r.note||'')}"></div>`}).join('');
    document.getElementById('jrSave').onclick=()=>{
      const venue=document.getElementById('jrVenue').value.trim(), sourceUrl=document.getElementById('jrUrl').value.trim();
      const requirements={};FIELDS.forEach(([id])=>requirements[id]={status:document.querySelector(`[data-jr="${id}"]`).value,note:document.querySelector(`[data-jrn="${id}"]`).value.trim()});
      const record={venue,sourceUrl,retrievedAt:new Date().toISOString(),requirements,verificationPolicy:'Only explicitly supplied/source-verified requirements may be marked verified',fingerprint:fp(JSON.stringify({venue,sourceUrl,requirements}))};
      save(record);const p=pkg();p.journalRequirements=record;p.journalRequirementsFingerprint=record.fingerprint;localStorage.setItem(PACKAGE_KEY,JSON.stringify(p));
      document.getElementById('jrStatus').innerHTML='<span>Saved. Unverified items remain unverified until you verify them against the journal source.</span>';
    };
    document.getElementById('jrExport').onclick=()=>{const v=load()||{};const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(v,null,2)],{type:'application/json'}));a.download='journal-requirements-verification.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  }
  const start=()=>{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render()};start();
  window.JournalRequirementsRuntime={load,save,fields:FIELDS};
})();