/* ANTENEH RESEARCH HUB — multilingual XLSForm exporter + Kobo publisher */
(()=>{
 const LANGS={am:{name:'Amharic',label:'አማርኛ',xls:'Amharic (am)'},om:{name:'Afaan Oromoo',label:'Afaan Oromoo',xls:'Afaan Oromoo (om)'},sid:{name:'Sidamic',label:'Sidaamu Afoo',xls:'Sidamic (sid)'}};
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const add=h=>{const c=document.getElementById('content');if(c&&!document.getElementById('xlsform-exporter'))c.insertAdjacentHTML('afterbegin',h)};
 const slug=x=>String(x||'option').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').replace(/^([0-9])/,'x_$1')||'option';
 const unique=(base,used)=>{let n=base||'option',i=2;while(used.has(n))n=`${base||'option'}_${i++}`;used.add(n);return n};
 const loadXlsx=()=>new Promise((resolve,reject)=>{if(window.XLSX)return resolve(window.XLSX);const s=document.createElement('script');s.src='https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';s.onload=()=>resolve(window.XLSX);s.onerror=reject;document.head.appendChild(s)});
 function build(){
  const s=read(),q=Array.isArray(s.questionnaire)?s.questionnaire:[];
  const ids=(s.collectionLanguages||['am','om','sid']).filter(x=>LANGS[x]);
  const langs=ids.length?ids:['am'];
  const def=LANGS[s.collectionDefault]&&langs.includes(s.collectionDefault)?s.collectionDefault:langs[0];
  if(!q.length){alert('Add at least one questionnaire question first.');return null}
  const surveyHeaders=['type','name']; langs.forEach(id=>surveyHeaders.push(`label::${LANGS[id].xls}`)); surveyHeaders.push('required');
  const choicesHeaders=['list_name','name']; langs.forEach(id=>choicesHeaders.push(`label::${LANGS[id].xls}`));
  const survey=[],choices=[],usedChoiceNames=new Set();
  q.forEach(item=>{
   const type=item.type==='select_one'||item.type==='select_multiple'?`${item.type} ${slug(item.name)}_choices`:item.type;
   const row=[type,item.name]; langs.forEach(id=>row.push(item.labels?.[id]||'')); row.push(item.required?'TRUE':''); survey.push(row);
   if(item.type==='select_one'||item.type==='select_multiple'){
    const listName=`${slug(item.name)}_choices`;
    (item.choices||[]).forEach(choice=>{const base=slug(choice),choiceName=unique(base,usedChoiceNames),r=[listName,choiceName];langs.forEach(id=>r.push(choice));choices.push(r)});
   }
  });
  const title=s.title||'ANTENEH Research Questionnaire';
  const settingsHeaders=['form_title','version','default_language'];
  const settingsRow=[title,new Date().toISOString().slice(0,10).replace(/-/g,''),LANGS[def].xls];
  return {surveyHeaders,survey,choicesHeaders,choices,settingsHeaders,settings:[settingsRow],languages:langs.map(id=>LANGS[id].xls),title};
 }
 async function workbookBase64(data){
  const XLSX=await loadXlsx(),wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([data.surveyHeaders,...data.survey]),'survey');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([data.choicesHeaders,...data.choices]),'choices');
  XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([data.settingsHeaders,...data.settings]),'settings');
  return {XLSX,wb,base64:XLSX.write(wb,{bookType:'xlsx',type:'base64'}),fileName:`${slug(data.title).slice(0,48)||'research_questionnaire'}_multilingual_xlsform.xlsx`};
 }
 async function exportXlsx(){
  try{const data=build();if(!data)return;const {XLSX,wb,fileName}=await workbookBase64(data);XLSX.writeFile(wb,fileName);const s=read();s.lastXlsformExport={at:new Date().toISOString(),languages:data.languages,title:data.title,questionCount:data.survey.length,choiceCount:data.choices.length};write(s)}catch(e){console.error(e);alert('XLSForm export could not be completed. Check your connection and try again.')}
 }
 async function publishToKobo(){
  const status=document.getElementById('koboPublishStatus'),btn=document.getElementById('koboPublish');
  try{
   const data=build();if(!data)return;btn.disabled=true;status.innerHTML='Preparing the questionnaire for secure KoboToolbox publishing…';
   const pack=await workbookBase64(data),s=read(),existing=s.kobo?.assetUid||'';
   const r=await fetch('/api/kobo-publish',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({fileBase64:pack.base64,fileName:pack.fileName,title:data.title,assetUid:existing})});
   const out=await r.json().catch(()=>({}));if(!r.ok||!out.ok)throw new Error(out.error||'Kobo publishing failed.');
   const now=new Date().toISOString();s.kobo={...(s.kobo||{}),assetUid:out.assetUid,title:out.title||data.title,publishedAt:now,connected:true,deployed:true,koboProjectUrl:out.koboProjectUrl,koboCollectServer:out.koboCollectServer,lastQuestionCount:data.survey.length};s.koboHistory=Array.isArray(s.koboHistory)?s.koboHistory:[];s.koboHistory.push({assetUid:out.assetUid,publishedAt:now,questionCount:data.survey.length,versionId:out.versionId||''});s.koboHistory=s.koboHistory.slice(-20);write(s);
   status.innerHTML=`<b>✓ Questionnaire published and deployed to KoboToolbox.</b><br>Asset: ${esc(out.assetUid)}<br><a href="${esc(out.koboProjectUrl)}" target="_blank" rel="noopener">Open Kobo project</a><br><span class="muted">KoboCollect will receive the deployed form when its project is configured to download/sync forms.</span>`;
  }catch(e){status.innerHTML='<b>⚠ Kobo publishing failed:</b> '+esc(e.message||'Unknown error')+'<br><span class="muted">The questionnaire was not marked as deployed in the Hub.</span>'}finally{btn.disabled=false}
 }
 function render(stage){if(stage!==9)return;const s=read();add(`<div class="card" id="xlsform-exporter"><h4>📲 KoboToolbox / KoboCollect Bridge</h4><p>The saved questionnaire can now be published directly to KoboToolbox. The Hub keeps the Kobo API token server-side, uploads the XLSForm, deploys it, and stores the asset UID for future updates.</p><div class="notice"><b>Workflow:</b> Research Hub questionnaire → Publish & deploy → KoboCollect downloads/syncs the deployed form → field data is submitted to KoboToolbox → Research Hub syncs the submissions for quality control and analysis.</div><div class="actions" style="margin-top:10px"><button class="btn primary" id="koboPublish">Publish questionnaire to KoboToolbox</button><button class="btn" id="xlsExport">Download XLSForm (.xlsx)</button></div><div id="koboPublishStatus" class="notice" style="margin-top:10px">${s.kobo?.assetUid?`Connected Kobo asset: <b>${esc(s.kobo.assetUid)}</b> · ${s.kobo.deployed?'deployed':'not deployed'}.`:'Kobo is not yet connected to a deployed questionnaire.'}</div><div class="muted" style="margin-top:8px">Before first use, KOBO_SERVER_URL and KOBO_API_TOKEN must be configured in the Research Hub server environment. The token is never stored in this browser.</div></div>`);document.getElementById('xlsExport').onclick=exportXlsx;document.getElementById('koboPublish').onclick=publishToKobo}
 window.XLSFormExporter={render,build,exportXlsx,publishToKobo};
 const go=()=>render(Number(read().current||0));if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();setInterval(go,1500);
})();
