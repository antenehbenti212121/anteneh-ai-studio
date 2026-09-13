/* ANTENEH RESEARCH AI LAB — evidence-driven problem/gap engine */
(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
  const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
  const search=async q=>{
    const u='https://api.openalex.org/works?search='+encodeURIComponent(q)+'&per-page=12&select=id,display_name,publication_year,cited_by_count,primary_location,authorships,doi,type';
    const r=await fetch(u); if(!r.ok) throw Error('OpenAlex '+r.status); const j=await r.json();
    return (j.results||[]).filter(x=>x.display_name).map(x=>({title:x.display_name,year:x.publication_year,cited:x.cited_by_count||0,journal:x.primary_location?.source?.display_name||'Unknown source',authors:(x.authorships||[]).map(a=>a.author?.display_name).filter(Boolean),url:x.doi||x.id,type:x.type}));
  };
  const evidence=async(title,ctx)=>{
    const papers=await search(title);
    const years=papers.map(p=>p.year).filter(Boolean), recent=papers.filter(p=>p.year&&p.year>=new Date().getFullYear()-5);
    const themes=papers.slice(0,8).map(p=>p.title);
    return {papers,years,recent,themes,title,ctx};
  };
  function renderMap(e){
    const box=document.getElementById('evidence'); if(!box)return;
    box.innerHTML=`<div class="card"><h4>Evidence map — live OpenAlex records</h4><p>These are candidate records, not automatically accepted evidence. Open and screen them before making scientific claims.</p>${e.papers.slice(0,10).map((p,i)=>`<div class="paper"><b>${i+1}. ${esc(p.title)}</b><span>${esc(p.year||'Year unavailable')} · ${esc(p.journal)} · ${p.cited} citations</span><span>${esc(p.authors.slice(0,4).join(', '))}</span><a href="${esc(p.url)}" target="_blank" rel="noopener">Open scholarly record</a></div>`).join('')}</div>`;
  }
  function candidateText(e){
    const range=e.years.length?`${Math.min(...e.years)}–${Math.max(...e.years)}`:'not available';
    const recent=e.recent.length;
    return `EVIDENCE-GROUNDED WORKING DRAFT\n\nResearch title: ${e.title}\nContext: ${e.ctx||'Not specified'}\n\nEvidence searched: OpenAlex\nRecords retrieved: ${e.papers.length}\nPublication-year range: ${range}\nRecords from the last five years: ${recent}\n\nCANDIDATE PROBLEM STATEMENT\nThe research problem should be formulated only after screening the retrieved studies for the population, setting, outcome/exposure, study design and limitations. The current search establishes a literature starting point, not proof of a problem magnitude or causal relationship.\n\nCANDIDATE KNOWLEDGE-GAP MAP\n• Evidence gap: identify which important outcome/exposure/question is insufficiently answered after full-text screening.\n• Population/context gap: check whether the target population or Ethiopian/local setting is underrepresented.\n• Methodological gap: compare study designs, measurement instruments, sampling and analytical approaches.\n• Contradictory evidence: record findings that disagree rather than forcing a single conclusion.\n\nINITIAL LITERATURE SIGNALS\n${e.themes.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nHUMAN DECISION GATE\nDo not approve this section until the researcher has screened the relevant papers and replaced the placeholders with claims supported by specific sources. No prevalence, effect size, causation or conclusion has been invented by this engine.`;
  }
  function install(){
    const b=$('blueprint'); if(!b)return;
    b.addEventListener('click',async ev=>{
      ev.preventDefault(); ev.stopImmediatePropagation();
      const title=$('title')?.value.trim(),ctx=$('context')?.value.trim();
      if(!title){alert('Enter a research title first.');return;}
      b.disabled=true;b.textContent='Searching + mapping evidence...';
      try{
        const e=await evidence(title,ctx); const s=read(); s.title=title;s.context=ctx;s.evidence=e.papers;s.s0=candidateText(e);s.current=0;write(s);
        renderMap(e); const w=$('work'); if(w)w.value=s.s0; alert(`Evidence map ready: ${e.papers.length} scholarly records retrieved.`);
      }catch(err){alert('Live scholarly search failed. No citations or findings were fabricated. Check your internet connection and try again.');}
      finally{b.disabled=false;b.textContent='Build research intelligence';}
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
