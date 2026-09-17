/* ANTENEH RESEARCH HUB — secure KoboToolbox client bridge + automatic sync */
(()=>{
 const R=()=>JSON.parse(localStorage.getItem('arlab')||'{}'),W=x=>localStorage.setItem('arlab',JSON.stringify(x));
 const E=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const add=h=>{const c=document.getElementById('content');if(c&&!document.getElementById('kobo-card'))c.insertAdjacentHTML('afterbegin',h)};
 const validate=(h,r)=>{const e=[],w=[];if(!h.length)e.push('Kobo dataset contains no columns.');if(h.some(x=>!String(x).trim()))e.push('Kobo dataset contains an unnamed column.');if(new Set(h.map(x=>String(x).trim().toLowerCase())).size!==h.length)e.push('Kobo dataset contains duplicate column names.');if(!r.length)e.push('Kobo project contains no submission records.');if(r.some(x=>x.length!==h.length))e.push('Kobo records have inconsistent column counts.');if(r.length>100000)w.push('Large dataset: browser memory limits may affect analysis.');return{errors:e,warnings:w}};
 const dictionary=(h,r)=>h.map((name,j)=>{const raw=r.map(x=>String(x[j]??'').trim()),p=raw.filter(Boolean),numeric=p.length>0&&p.every(x=>Number.isFinite(Number(x)));return{name,role:numeric?'numeric':'categorical',rows:r.length,missing:r.length-p.length,missingPct:r.length?Math.round((r.length-p.length)/r.length*1000)/10:0,unique:new Set(p).size,numeric}});
 const hash=async ds=>{const raw=JSON.stringify({assetUid:ds.assetUid,headers:ds.headers,data:ds.data}),bytes=new TextEncoder().encode(raw);if(crypto?.subtle){const d=await crypto.subtle.digest('SHA-256',bytes);return Array.from(new Uint8Array(d)).map(b=>b.toString(16).padStart(2,'0')).join('')}return `local-${ds.recordCount||0}-${ds.headers?.length||0}`};
 let timer=null;
 function clearAuto(){if(timer){clearInterval(timer);timer=null}}
 async function sync(assetUid,silent=false){
  const status=document.getElementById('koboStatus'),btn=document.getElementById('koboLoad');if(!assetUid)return false;
  if(!silent&&status)status.textContent='Fetching Kobo submissions securely…';
  try{
   const r=await fetch('/api/kobo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assetUid})}),d=await r.json().catch(()=>({}));
   if(!r.ok||!d.ok)throw new Error(d.error||'Kobo ingestion failed.');
   const ds=d.dataset||{},h=Array.isArray(ds.headers)?ds.headers:[],rows=Array.isArray(ds.data)?ds.data:[],v=validate(h,rows),now=new Date().toISOString(),next=R();
   next.kobo={...(next.kobo||{}),assetUid:d.assetUid,fetchedAt:d.fetchedAt,recordCount:d.recordCount,pages:d.pages,connected:true,lastSync:now};
   if(v.errors.length){next.dataset=null;W(next);if(status)status.innerHTML='<b>Dataset blocked.</b><br>'+v.errors.map(E).join('<br>');return false}
   const dict=dictionary(h,rows),dataset={...ds,dataDictionary:dict,quality:{validated:true,warnings:v.warnings,validatedAt:now},provenance:{source:'KoboToolbox',assetUid:d.assetUid,fetchedAt:d.fetchedAt,recordCount:d.recordCount,pages:d.pages,ingestedAt:now}};dataset.provenance.sha256=await hash(dataset);
   next.dataset=dataset;next.koboHistory=Array.isArray(next.koboHistory)?next.koboHistory:[];
   const previous=next.koboHistory[next.koboHistory.length-1];
   const changed=!previous||previous.sha256!==dataset.provenance.sha256;
   next.koboHistory.push({assetUid:d.assetUid,fetchedAt:d.fetchedAt,ingestedAt:now,recordCount:d.recordCount,pages:d.pages,sha256:dataset.provenance.sha256});next.koboHistory=next.koboHistory.slice(-20);W(next);
   if(status)status.innerHTML=`<b>✓ Kobo data ${changed?'synchronized':'checked'}.</b><br>${E(d.recordCount)} records · ${E(h.length)} columns · ${E(d.pages)} page(s)<br><span class="muted">Quality gate passed. The approved analysis plan remains the authority for inferential/statistical execution.</span>`;
   const dq=document.getElementById('dq');if(dq)dq.innerHTML='<b>Data dictionary</b><br>'+dict.map(x=>E(x.name)+' — '+x.role+' · missing '+x.missingPct+'% · '+x.unique+' unique').join('<br>')+(v.warnings.length?'<br><br><b>Warnings</b><br>'+v.warnings.map(E).join('<br>'):'')+'<br><br><b>Dataset fingerprint</b><br><small>'+E(dataset.provenance.sha256)+'</small>';
   window.AnalysisEngine?.render?.();window.ResultsEngine?.render?.();window.InferentialEngine?.render?.();window.WebREngine?.render?.();window.RAnalysisEngine?.render?.();return true;
  }catch(e){if(status&&!silent)status.innerHTML='<b>Kobo connection failed:</b> '+E(e.message||'Unknown error');return false}
  finally{if(btn)btn.disabled=false}
 }
 function render(stage){
  clearAuto();if(stage!==10&&stage!==11&&stage!==12)return;const s=R();add(`<div class="card" id="kobo-card"><h4>🔄 KoboToolbox → Research Hub</h4><p>Connect a deployed Kobo project once. The Hub keeps the API token server-side, retrieves submissions, validates the dataset, fingerprints each synchronized version, and refreshes the analysis views.</p><div class="field"><label>KOBO PROJECT ASSET UID</label><input id="koboUid" placeholder="e.g. a4etXeWtqcoodSxLV8a6Uq" autocomplete="off"></div><div class="actions"><button class="btn primary" id="koboLoad">Sync Kobo data now</button><button class="btn" id="koboAuto">Start automatic sync</button>${s.kobo?.koboProjectUrl?`<a class="btn" href="${E(s.kobo.koboProjectUrl)}" target="_blank" rel="noopener">Open Kobo project</a>`:''}</div><div class="notice" id="koboStatus" style="margin-top:10px">${s.kobo?.lastSync?`Connected. Last sync: ${E(s.kobo.lastSync)} · ${E(s.kobo.recordCount||0)} records.`:'Ready. Dataset analysis remains blocked until the quality gate passes.'}</div><div class="muted" style="margin-top:8px">Automatic sync checks Kobo every 60 seconds while this Research Hub page is open. KoboCollect itself can collect offline and send submissions when connected.</div></div>`);
  const input=document.getElementById('koboUid'),btn=document.getElementById('koboLoad'),auto=document.getElementById('koboAuto'),status=document.getElementById('koboStatus');if(!input||!btn||!status)return;input.value=s.kobo?.assetUid||'';
  btn.onclick=async()=>{btn.disabled=true;const uid=input.value.trim();if(!/^[A-Za-z0-9_-]+$/.test(uid)){status.innerHTML='<b>Invalid asset UID.</b> Enter the Kobo project UID only.';btn.disabled=false;return}await sync(uid,false)};
  auto.onclick=()=>{const uid=input.value.trim();if(!/^[A-Za-z0-9_-]+$/.test(uid)){status.innerHTML='<b>Enter a valid Kobo asset UID first.</b>';return}if(timer){clearAuto();auto.textContent='Start automatic sync';status.innerHTML+=' <br>Automatic sync stopped.';return}sync(uid,true);timer=setInterval(()=>{const live=R().kobo?.assetUid||uid;if(Number(R().current||0)!==12){clearAuto();return}sync(live,true)},60000);auto.textContent='Stop automatic sync';status.innerHTML='<b>Automatic sync enabled.</b> Checking Kobo every 60 seconds while this page is open.'};
 }
 window.KoboUI={render,sync};
})();
