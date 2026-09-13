/* ANTENEH RESEARCH HUB — secure KoboToolbox client bridge */
(()=>{
  const R=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
  const W=x=>localStorage.setItem('arlab',JSON.stringify(x));
  const E=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const add=html=>{const c=document.getElementById('content');if(c&&!document.getElementById('kobo-card'))c.insertAdjacentHTML('afterbegin',html)};
  function validate(headers,rows){
    const errors=[];const warnings=[];
    if(!headers.length)errors.push('Kobo dataset contains no columns.');
    if(headers.some(x=>!String(x).trim()))errors.push('Kobo dataset contains an unnamed column.');
    if(new Set(headers.map(x=>String(x).trim().toLowerCase())).size!==headers.length)errors.push('Kobo dataset contains duplicate column names.');
    if(!rows.length)errors.push('Kobo project contains no submission records.');
    if(rows.some(r=>r.length!==headers.length))errors.push('Kobo records have inconsistent column counts.');
    if(rows.length>100000)warnings.push('Large dataset: browser memory limits may affect analysis.');
    return{errors,warnings};
  }
  function dictionary(headers,rows){
    return headers.map((name,j)=>{
      const raw=rows.map(r=>String(r[j]??'').trim()),present=raw.filter(Boolean);
      const numeric=present.length>0&&present.every(x=>Number.isFinite(Number(x)));
      return{name,role:numeric?'numeric':'categorical',rows:rows.length,missing:rows.length-present.length,missingPct:rows.length?Math.round((rows.length-present.length)/rows.length*1000)/10:0,unique:new Set(present).size,numeric};
    });
  }
  function render(stage){
    if(stage!==10&&stage!==11&&stage!==12)return;
    const s=R();
    add(`<div class="card" id="kobo-card"><h4>KoboToolbox → Research Hub</h4><p>Connect a Kobo project by its asset UID. The API token stays server-side and is never entered into this browser.</p><div class="field"><label>KOBO PROJECT ASSET UID</label><input id="koboUid" placeholder="e.g. a4etXeWtqcoodSxLV8a6Uq" autocomplete="off"></div><button class="btn primary" id="koboLoad">Fetch Kobo data</button><div class="notice" id="koboStatus" style="margin-top:10px">Ready. Dataset analysis remains blocked until the quality gate passes.</div></div>`);
    const input=document.getElementById('koboUid'),btn=document.getElementById('koboLoad'),status=document.getElementById('koboStatus');
    if(!input||!btn||!status)return;
    input.value=s.kobo?.assetUid||'';
    btn.onclick=async()=>{
      const assetUid=input.value.trim();
      if(!/^[A-Za-z0-9_-]+$/.test(assetUid)){status.innerHTML='<b>Invalid asset UID.</b> Enter the Kobo project UID only.';return;}
      btn.disabled=true;status.textContent='Fetching Kobo submissions securely…';
      try{
        const r=await fetch('/api/kobo',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assetUid})});
        const d=await r.json().catch(()=>({}));
        if(!r.ok||!d.ok)throw new Error(d.error||'Kobo ingestion failed.');
        const ds=d.dataset||{},headers=Array.isArray(ds.headers)?ds.headers:[],rows=Array.isArray(ds.data)?ds.data:[],v=validate(headers,rows),now=new Date().toISOString();
        const next=R();
        next.kobo={assetUid:d.assetUid,fetchedAt:d.fetchedAt,recordCount:d.recordCount,pages:d.pages,connected:true};
        if(v.errors.length){next.dataset=null;W(next);status.innerHTML='<b>Dataset blocked.</b><br>'+v.errors.map(E).join('<br>');return;}
        const dict=dictionary(headers,rows);
        next.dataset={...ds,dataDictionary:dict,quality:{validated:true,warnings:v.warnings,validatedAt:now},provenance:{source:'KoboToolbox',assetUid:d.assetUid,fetchedAt:d.fetchedAt,recordCount:d.recordCount,pages:d.pages}};
        W(next);
        status.innerHTML=`<b>✓ Kobo data loaded.</b><br>${E(d.recordCount)} records · ${E(headers.length)} columns · ${E(d.pages)} page(s)<br><span class="muted">Quality gate passed. Statistical execution still requires the approved analysis plan.</span>`;
        const dq=document.getElementById('dq');if(dq)dq.innerHTML='<b>Data dictionary</b><br>'+dict.map(x=>E(x.name)+' — '+x.role+' · missing '+x.missingPct+'% · '+x.unique+' unique').join('<br>')+(v.warnings.length?'<br><br><b>Warnings</b><br>'+v.warnings.map(E).join('<br>'):'');
        window.AnalysisEngine?.render?.();window.ResultsEngine?.render?.();window.InferentialEngine?.render?.();window.WebREngine?.render?.();window.RAnalysisEngine?.render?.();
      }catch(e){status.innerHTML='<b>Kobo connection failed:</b> '+E(e.message||'Unknown error');}
      finally{btn.disabled=false;}
    };
  }
  window.KoboUI={render};
})();
