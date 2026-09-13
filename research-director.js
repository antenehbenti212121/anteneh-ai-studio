/* ANTENEH RESEARCH HUB — evidence-driven research director */
(()=>{
 const R=()=>JSON.parse(localStorage.getItem('arlab')||'{}'),W=x=>localStorage.setItem('arlab',JSON.stringify(x));
 const E=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const add=h=>{const c=document.getElementById('content');if(c&&!document.getElementById('director-card'))c.insertAdjacentHTML('afterbegin',h)};
 const packet=s=>({title:s.title||'',context:s.context||'',stage:Number(s.current||0),evidence:(s.evidence||[]).slice(0,30).map(x=>({title:x.title,year:x.year,journal:x.journal,source:x.source,url:x.url})),methodology:s.methodology||null,analysisPlan:s.analysisPlan||null,dataset:s.dataset?{name:s.dataset.name,rows:s.dataset.rows,columns:s.dataset.columns,headers:s.dataset.headers,summary:s.dataset.summary||s.dataset.dataDictionary}:null,rExecution:s.rExecution?{engine:s.rExecution.engine,verifiedAt:s.rExecution.verifiedAt}:null,rAnalyses:(s.rAnalyses||[]).map(x=>({test:x.test,outcome:x.outcome,predictor:x.predictor,generatedAt:x.generatedAt,engine:x.engine,dataset:x.dataset,analysisPlanVersion:x.analysisPlanVersion})),results:s.resultsSnapshot||null,qualityControl:s.qualityControl||null});
 const gaps=s=>{const p=packet(s),g=[];if(!p.title)g.push('Research title');if(!p.evidence.length)g.push('Scholarly evidence map');if(!p.methodology?.approved)g.push('Approved methodology');if(p.dataset&&!p.analysisPlan?.approved)g.push('Approved statistical analysis plan');if(p.dataset&&!p.rExecution)g.push('R data audit');return g};
 const pct=s=>Math.min(100,Math.round(((Number(s.current||0)+1)/22)*100));
 async function runAI(){
  const btn=document.getElementById('directorAI'); const out=document.getElementById('directorAIOutput');
  if(btn) {btn.disabled=true;btn.textContent='Running Research Director…';}
  if(out) out.textContent='Sending the evidence packet to the secure server AI gateway…';
  try{
   const r=await fetch('/api/research-ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({packet:packet(R())})});
   const d=await r.json();
   if(!r.ok||!d.ok) throw new Error(d.error||'Research AI request failed');
   if(out) out.textContent=d.text||'No structured guidance returned.';
   const s=R();s.researchDirectorAI={model:d.model,provider:d.provider,text:d.text,generatedAt:d.generatedAt};W(s);
  }catch(e){if(out)out.textContent='AI gateway unavailable: '+(e?.message||'Unknown error')+'\n\nYour research packet remains unchanged.';}
  finally{if(btn){btn.disabled=false;btn.textContent='Run Research Director AI';}}
 }
 function render(){const s=R(),p=packet(s),g=gaps(s),progress=pct(s),approved=[p.methodology?.approved,p.analysisPlan?.approved,p.rExecution].filter(Boolean).length,evidence=p.evidence.length;
 add(`<div class="card" id="director-card"><div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap"><div><div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;opacity:.7">RESEARCH CONTROL CENTER</div><h4 style="margin:5px 0">Research Director</h4><p style="margin:0">Evidence first. Human-approved decisions. Reproducible analysis. No invented findings or citations.</p></div><div class="notice" style="min-width:120px;text-align:center"><b>${progress}%</b><br><small>lifecycle</small></div></div>
 <div style="height:8px;border-radius:99px;background:rgba(127,127,127,.18);margin:16px 0 18px;overflow:hidden"><div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#6d5dfc,#19c37d);border-radius:99px"></div></div>
 <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-bottom:16px"><div class="notice"><b>${evidence}</b><br><small>evidence records</small></div><div class="notice"><b>${approved}/3</b><br><small>approved gates</small></div><div class="notice"><b>${p.dataset?E(p.dataset.rows||0):'—'}</b><br><small>dataset rows</small></div><div class="notice"><b>${p.rExecution?.verifiedAt?'Verified':'Pending'}</b><br><small>R execution</small></div></div>
 <div class="notice"><b>Research:</b> ${E(p.title||'No title')}<br><b>Current stage:</b> ${E(s.stageName||('Stage '+(p.stage+1)))}<br><b>Evidence:</b> ${evidence?'Connected to scholarly discovery':'Not yet built'}</div>
 <h5 style="margin-bottom:8px">Decision queue</h5>${g.length?g.map(x=>`<div class="paper">⚠ ${E(x)}</div>`).join(''):'<div class="paper">✓ No blocking decision detected.</div>'}
 <div class="paper" style="margin-top:12px"><b>AI Research Director</b><br><small>Uses the secure server-side AI gateway. API credentials remain server-side and are never stored in the browser.</small><div class="actions"><button class="btn primary" id="directorAI">Run Research Director AI</button></div><pre id="directorAIOutput" style="white-space:pre-wrap;max-height:360px;overflow:auto;margin-top:10px">${E(s.researchDirectorAI?.text||'No AI guidance run yet.')}</pre></div>
 <div class="actions"><button class="btn primary" id="directorSnapshot">Save research-director snapshot</button><button class="btn" id="directorExport">Copy research packet</button></div><textarea id="directorPacket" style="min-height:220px;margin-top:10px" readonly>${E(JSON.stringify(p,null,2))}</textarea></div>`);
 const snap=document.getElementById('directorSnapshot');if(snap)snap.onclick=()=>{const x=R();x.researchDirector={packet:packet(x),blockingDecisions:gaps(x),lifecycleProgress:progress,generatedAt:new Date().toISOString()};W(x);alert('Research Director snapshot saved.')};
 const cp=document.getElementById('directorExport');if(cp)cp.onclick=()=>navigator.clipboard?.writeText(JSON.stringify(packet(R()),null,2));
 const ai=document.getElementById('directorAI');if(ai)ai.onclick=runAI;
 }
 window.ResearchDirector={render,packet,gaps,runAI};setTimeout(render,1000);
})();
