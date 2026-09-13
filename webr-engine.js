/* ANTENEH RESEARCH HUB — browser R execution via WebR */
(()=>{
 const R=()=>JSON.parse(localStorage.getItem('arlab')||'{}'),W=x=>localStorage.setItem('arlab',JSON.stringify(x));
 let webR=null,ready=null;
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
 async function boot(){
  if(ready)return ready;
  ready=(async()=>{
   const mod=await import('https://webr.r-wasm.org/latest/webr.mjs');
   webR=new mod.WebR({channelType:mod.ChannelType.PostMessage});
   await webR.init(); return webR;
  })().catch(e=>{ready=null;throw e});
  return ready;
 }
 function csv(d){const h=d.headers.map(x=>`"${String(x).replace(/"/g,'""')}"`).join(',');const rows=d.data.map(r=>r.map(x=>`"${String(x??'').replace(/"/g,'""')}"`).join(',')).join('\n');return h+'\n'+rows;}
 async function run(code){const r=await boot();await r.FS.writeFile('/data.csv',new TextEncoder().encode(csv(R().dataset)));return await r.evalRString(code)}
 function render(){const c=document.getElementById('content');if(!c)return;const s=R(),d=s.dataset;if(!d?.headers||!d?.data)return;if(document.getElementById('r-execution-card'))return;c.insertAdjacentHTML('afterbegin','<div class="card" id="r-execution-card"><h4>R execution engine</h4><p>Real R runs locally in this browser through WebR. The dataset is written to the R virtual filesystem and is not uploaded by this engine.</p><div class="actions"><button class="btn primary" id="rinit">Start R</button><button class="btn" id="raudit">Run R data audit</button></div><div id="rout" class="notice" style="margin-top:10px">R is not started.</div></div>');const init=document.getElementById('rinit'),audit=document.getElementById('raudit'),out=document.getElementById('rout');init.onclick=async()=>{init.disabled=true;init.textContent='Starting R…';try{await boot();out.textContent='R is ready in the browser.'}catch(e){out.textContent='R startup failed: '+e.message}finally{init.disabled=false;init.textContent='Start R'}};audit.onclick=async()=>{audit.disabled=true;out.textContent='Running R audit…';try{const outText=await run('d <- read.csv("/data.csv", check.names=FALSE, stringsAsFactors=FALSE); paste(capture.output({cat("Rows:",nrow(d),"\\nColumns:",ncol(d),"\\n\\nStructure:\\n"); str(d); cat("\\nSummary:\\n"); print(summary(d))}),collapse="\\n")');const x=R();x.rExecution={engine:'WebR',channel:'PostMessage',verifiedAt:new Date().toISOString(),dataset:d.name,audit:outText};W(x);out.innerHTML='<pre style="white-space:pre-wrap">'+esc(outText)+'</pre><div class="muted">Audit saved with provenance. Use the approved analysis plan for inferential models.</div>'}catch(e){out.textContent='R execution failed: '+e.message}finally{audit.disabled=false}}}
 window.WebREngine={boot,run,render};
})();
