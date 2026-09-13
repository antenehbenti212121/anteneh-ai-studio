/* ANTENEH RESEARCH HUB — browser R execution via WebR */
(()=>{
 const R=()=>JSON.parse(localStorage.getItem('arlab')||'{}'),W=x=>localStorage.setItem('arlab',JSON.stringify(x));
 let webR=null,ready=null;
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 async function boot(){
  if(ready)return ready;
  ready=(async()=>{
   const mod=await import('https://webr.r-wasm.org/latest/webr.mjs');
   webR=new mod.WebR(); await webR.init(); return webR;
  })().catch(e=>{ready=null;throw e});
  return ready;
 }
 function csv(d){const h=d.headers.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',');const rows=d.data.map(r=>r.map(x=>`"${String(x??'').replace(/"/g,'""')}"`).join(',')).join('\n');return h+'\n'+rows;}
 async function run(code){const r=await boot();await r.FS.writeFile('/data.csv',new TextEncoder().encode(csv(R().dataset)));return await r.evalRString(code)}
 function render(){const c=document.getElementById('content');if(!c)return;const s=R(),d=s.dataset;if(!d?.headers||!d?.data)return;c.insertAdjacentHTML('afterbegin','<div class="card"><h4>R execution engine</h4><p>Real R runs locally in this browser through WebR. The dataset is written to the R virtual filesystem; it is not sent to a research server.</p><div class="actions"><button class="btn primary" id="rinit">Start R</button><button class="btn" id="raudit">Run R data audit</button></div><div id="rout" class="notice" style="margin-top:10px">R is not started.</div></div>');rinit.onclick=async()=>{rinit.disabled=true;rinit.textContent='Starting R…';try{await boot();rout.textContent='R is ready in the browser.'}catch(e){rout.textContent='R startup failed: '+e.message}finally{rinit.disabled=false;rinit.textContent='Start R'}};raudit.onclick=async()=>{raudit.disabled=true;rout.textContent='Running R audit…';try{const out=await run('d <- read.csv("/data.csv", check.names=FALSE, stringsAsFactors=FALSE); paste(capture.output({cat("Rows:",nrow(d),"\\nColumns:",ncol(d),"\\n\\nStructure:\\n"); str(d); cat("\\nSummary:\\n"); print(summary(d))}),collapse="\\n")');const s=R();s.rExecution={engine:'WebR',verifiedAt:new Date().toISOString(),dataset:d.name,audit:out};W(s);rout.innerHTML='<pre style="white-space:pre-wrap">'+esc(out)+'</pre><div class="muted">Audit saved with provenance. Use the approved analysis plan for inferential models.</div>'}catch(e){rout.textContent='R execution failed: '+e.message}finally{raudit.disabled=false}}}
 window.WebREngine={boot,run,render};
})();
