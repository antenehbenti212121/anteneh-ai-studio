/* ANTENEH RESEARCH AI LAB — evidence-driven research intelligence engine */
(()=>{
  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
  const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
  const abstractFromIndex=idx=>{
    if(!idx)return '';
    const words=[];Object.entries(idx).forEach(([word,positions])=>positions.forEach(p=>words[p]=word));
    return words.filter(Boolean).join(' ');
  };
  const search=async q=>{
    const u='https://api.openalex.org/works?search='+encodeURIComponent(q)+'&per-page=12&select=id,display_name,publication_year,cited_by_count,primary_location,authorships,doi,type,abstract_inverted_index';
    const r=await fetch(u); if(!r.ok) throw Error('OpenAlex '+r.status); const j=await r.json();
    return (j.results||[]).filter(x=>x.display_name).map(x=>({
      id:x.id,title:x.display_name,year:x.publication_year,cited:x.cited_by_count||0,
      journal:x.primary_location?.source?.display_name||'Unknown source',
      authors:(x.authorships||[]).map(a=>a.author?.display_name).filter(Boolean),
      url:x.doi||x.id,type:x.type,abstract:abstractFromIndex(x.abstract_inverted_index)
    }));
  };
  const evidence=async(title,ctx)=>{
    const papers=await search(title);
    const years=papers.map(p=>p.year).filter(Boolean), recent=papers.filter(p=>p.year&&p.year>=new Date().getFullYear()-5);
    const withAbstract=papers.filter(p=>p.abstract).length;
    const themes=papers.slice(0,8).map(p=>p.title);
    return {papers,years,recent,themes,withAbstract,title,ctx,generatedAt:new Date().toISOString()};
  };
  function renderMap(e){
    const box=document.getElementById('evidence'); if(!box)return;
    box.innerHTML=`<div class="card"><h4>Evidence map — live OpenAlex records</h4><p>Retrieved scholarly metadata is shown transparently. Abstracts are displayed only when OpenAlex provides them; records must still be screened before scientific claims are approved.</p><div class="notice">${e.papers.length} records · ${e.withAbstract} abstracts available · ${e.recent.length} records from the last five years</div>${e.papers.slice(0,10).map((p,i)=>`<div class="paper"><b>${i+1}. ${esc(p.title)}</b><span>${esc(p.year||'Year unavailable')} · ${esc(p.journal)} · ${p.cited} citations · ${esc(p.type||'work')}</span><span>${esc(p.authors.slice(0,4).join(', '))}</span>${p.abstract?`<span>${esc(p.abstract.slice(0,500))}${p.abstract.length>500?'…':''}</span>`:''}<a href="${esc(p.url)}" target="_blank" rel="noopener">Open scholarly record</a></div>`).join('')}</div>`;
  }
  function candidateText(e){
    const range=e.years.length?`${Math.min(...e.years)}–${Math.max(...e.years)}`:'not available';
    return `EVIDENCE-GROUNDED RESEARCH INTELLIGENCE\n\nResearch title: ${e.title}\nContext: ${e.ctx||'Not specified'}\n\nSEARCH RECORD\nSource: OpenAlex\nRecords retrieved: ${e.papers.length}\nRecords with abstracts: ${e.withAbstract}\nPublication-year range: ${range}\nRecords from the last five years: ${e.recent.length}\nGenerated: ${e.generatedAt}\n\nCANDIDATE PROBLEM STATEMENT\nThe problem statement must be written from screened evidence. The current search identifies relevant scholarly records but does not establish prevalence, causation, effect size, or local magnitude. Those claims require source-level verification and, where appropriate, full-text review.\n\nCANDIDATE KNOWLEDGE-GAP MAP\n• Evidence gap: identify the important question/outcome/exposure that remains insufficiently answered after screening.\n• Population/context gap: check representation of the target population, Ethiopia and the specific study setting.\n• Methodological gap: compare study designs, measurements, sampling and analytical approaches.\n• Contradictory evidence: record disagreements between studies rather than forcing consensus.\n• Replication/translation gap: identify findings that have not been tested in the target context.\n\nINITIAL LITERATURE SIGNALS\n${e.themes.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nHUMAN DECISION GATE\nScreen the records, open the relevant sources, and approve or edit the working statement before proceeding to methodology. This engine never invents citations, statistics, prevalence, causal claims or findings.`;
  }
  function install(){
    const b=$('blueprint'); if(!b)return;
    b.addEventListener('click',async ev=>{
      ev.preventDefault(); ev.stopImmediatePropagation();
      const title=$('title')?.value.trim(),ctx=$('context')?.value.trim();
      if(!title){alert('Enter a research title first.');return;}
      b.disabled=true;b.textContent='Searching + mapping evidence...';
      try{
        const e=await evidence(title,ctx); const s=read(); s.title=title;s.context=ctx;s.evidence=e.papers;s.evidenceMeta={withAbstract:e.withAbstract,generatedAt:e.generatedAt};s.s0=candidateText(e);s.current=0;write(s);
        renderMap(e); const w=$('work'); if(w)w.value=s.s0; alert(`Evidence map ready: ${e.papers.length} scholarly records retrieved.`);
      }catch(err){console.error(err);alert('Live scholarly search failed. No citations or findings were fabricated. Check your internet connection and try again.');}
      finally{b.disabled=false;b.textContent='Build research intelligence';}
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install);else install();
})();
