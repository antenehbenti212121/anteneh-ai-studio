/* ANTENEH RESEARCH HUB — Stage 21 Journal Requirements Verification
 * Purpose: record and audit actual journal/venue requirements without inventing them.
 * The researcher must provide the journal Instructions for Authors / submission URL
 * and explicitly verify each requirement. Unverified is never treated as verified.
 */
(()=>{
  const KEY='journalRequirements';
  const PACK='publicationPackage';
  const FIELDS=[
    ['articleType','Article type / manuscript category'],
    ['wordCount','Word count / length'],
    ['abstract','Abstract format and limit'],
    ['keywords','Keywords'],
    ['sectionStructure','Required section structure'],
    ['reportingGuideline','Reporting guideline / checklist'],
    ['referenceStyle','Reference / citation style'],
    ['referenceLimit','Reference limits'],
    ['figuresTables','Figures and tables limits / format'],
    ['supplementary','Supplementary material'],
    ['ethicsConsent','Ethics / informed consent'],
    ['fundingCOI','Funding / conflict of interest'],
    ['dataAvailability','Data / code availability'],
    ['registration','Registration / protocol identifier'],
    ['aiDeclaration','AI-use / AI declaration'],
    ['coverLetter','Cover letter'],
    ['authorInfo','Author contributions / ORCID / corresponding author'],
    ['fileFormat','File format / upload requirements'],
    ['anonymization','Anonymization / blinded review'],
    ['preprint','Preprint policy'],
    ['other','Other journal-specific requirements']
  ];
  const STATUS=['unverified','verified','missing','not_applicable'];
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[m]));
  const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'null')}catch{return null}};
  const getPack=()=>{try{return JSON.parse(localStorage.getItem(PACK)||'{}')}catch{return {}}};
  const save=(x)=>localStorage.setItem(KEY,JSON.stringify(x));
  const hash=async text=>{try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}catch{return btoa(unescape(encodeURIComponent(text))).slice(0,64)}};
  const normalize=x=>JSON.stringify(x,Object.keys(x).sort());
  function render(){
    if(!$('stageAesthetic')) return;
    if($('journalRequirementsRuntime')) return;
    const old=get()||{journal:'',url:'',sourceNote:'',retrievedAt:'',requirements:{},fingerprint:'',status:'unverified'};
    const wrap=document.createElement('section'); wrap.id='journalRequirementsRuntime'; wrap.className='research-stage-card';
    wrap.innerHTML=`<div style="padding:16px;border:1px solid #d7dce5;border-radius:16px;background:#fff;margin-top:14px">
      <div style="font-weight:800;font-size:18px">Journal Requirements Verification</div>
      <div style="font-size:13px;color:#667085;margin:6px 0 12px">Stage 21 gate. Record only requirements you can verify from the journal/venue's actual instructions. No requirement is guessed or auto-approved.</div>
      <div style="display:grid;gap:8px">
        <input id="jrJournal" placeholder="Target journal / venue" value="${esc(old.journal)}" style="padding:10px;border:1px solid #ccd2dc;border-radius:10px">
        <input id="jrUrl" placeholder="Instructions for Authors / submission URL" value="${esc(old.url)}" style="padding:10px;border:1px solid #ccd2dc;border-radius:10px">
        <input id="jrRetrieved" placeholder="Verification date/time (optional)" value="${esc(old.retrievedAt)}" style="padding:10px;border:1px solid #ccd2dc;border-radius:10px">
        <textarea id="jrNote" placeholder="Source note / edition / version / page notes" style="min-height:70px;padding:10px;border:1px solid #ccd2dc;border-radius:10px">${esc(old.sourceNote)}</textarea>
      </div>
      <div id="jrFields" style="display:grid;gap:8px;margin-top:12px"></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
        <button id="jrSave" style="padding:10px 14px;border:0;border-radius:10px;background:#176b3a;color:#fff;font-weight:700">Save verification</button>
        <button id="jrExport" style="padding:10px 14px;border:1px solid #176b3a;border-radius:10px;background:#fff;color:#176b3a;font-weight:700">Export JSON</button>
      </div>
      <div id="jrSummary" style="margin-top:12px;font-size:13px"></div>
    </div>`;
    const host=$('stageAesthetic'); host.appendChild(wrap);
    const fields=$('jrFields');
    FIELDS.forEach(([id,label])=>{
      const v=old.requirements?.[id]||{};
      const row=document.createElement('div'); row.style.cssText='display:grid;grid-template-columns:minmax(170px,1fr) 150px minmax(180px,2fr);gap:8px;align-items:start';
      row.innerHTML=`<div style="font-size:13px;font-weight:600;padding:9px 0">${esc(label)}</div><select data-jr="${id}" style="padding:9px;border:1px solid #ccd2dc;border-radius:9px">${STATUS.map(s=>`<option value="${s}" ${v.status===s?'selected':''}>${s.replace('_',' ')}</option>`).join('')}</select><input data-jrn="${id}" placeholder="Verified requirement / evidence note" value="${esc(v.note||'')}" style="padding:9px;border:1px solid #ccd2dc;border-radius:9px">`;
      fields.appendChild(row);
    });
    const summary=()=>{
      const vals=FIELDS.map(([id])=>({id,status:$(`jrFields`).querySelector(`[data-jr="${id}"]`).value}));
      const c=Object.fromEntries(STATUS.map(s=>[s,vals.filter(v=>v.status===s).length]));
      $('jrSummary').innerHTML=`<b>${esc(old.journal||'No journal selected')}</b> — verified ${c.verified}, missing ${c.missing}, not applicable ${c.not_applicable}, unverified ${c.unverified}.`;
    };
    summary();
    $('jrSave').onclick=async()=>{
      const req={}; FIELDS.forEach(([id])=>{req[id]={status:$('jrFields').querySelector(`[data-jr="${id}"]`).value,note:$('jrFields').querySelector(`[data-jrn="${id}"]`).value.trim()}});
      const record={version:1,journal:$('jrJournal').value.trim(),url:$('jrUrl').value.trim(),sourceNote:$('jrNote').value.trim(),retrievedAt:$('jrRetrieved').value.trim()||new Date().toISOString(),requirements:req};
      record.status=record.url&&record.journal?'recorded':'incomplete';
      record.fingerprint=await hash(normalize(record));
      save(record);
      const p=getPack(); p.journalRequirements=record; p.journalRequirementsFingerprint=record.fingerprint; localStorage.setItem(PACK,JSON.stringify(p));
      $('jrSummary').innerHTML=`<b>Saved.</b> ${esc(record.journal||'Journal not named')} — fingerprint ${esc(record.fingerprint.slice(0,16))}…`;
    };
    $('jrExport').onclick=()=>{const x=get(); if(!x)return alert('Save verification first.'); const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([JSON.stringify(x,null,2)],{type:'application/json'})); a.download='journal-requirements-verification.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
  }
  window.JournalRequirementsRuntime={render,fields:FIELDS};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render); else render();
})();