/* ANTENEH RESEARCH HUB — multilingual XLSForm exporter */
(()=>{
 const LANGS={am:{name:'Amharic',label:'አማርኛ',xls:'Amharic (am)'},om:{name:'Afaan Oromoo',label:'Afaan Oromoo',xls:'Afaan Oromoo (om)'},sid:{name:'Sidamic',label:'Sidaamu Afoo',xls:'Sidamic (sid)'}};
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const add=h=>{const c=document.getElementById('content');if(c&&!document.getElementById('xlsform-exporter'))c.insertAdjacentHTML('afterbegin',h)};
 const slug=x=>String(x||'option').toLowerCase().trim().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').replace(/^([0-9])/,'x_$1')||'option';
 const unique=(base,used)=>{let n=base||'option',i=2;while(used.has(n))n=`${base||'option'}_${i++}`;used.add(n);return n};
 const csv=v=>`"${String(v??'').replace(/"/g,'""')}"`;
 const makeCsv=(headers,rows)=>[headers,...rows].map(r=>r.map(csv).join(',')).join('\r\n');
 const loadXlsx=()=>new Promise((resolve,reject)=>{if(window.XLSX)return resolve(window.XLSX);const s=document.createElement('script');s.src='https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js';s.onload=()=>resolve(window.XLSX);s.onerror=reject;document.head.appendChild(s)});
 function build(){
  const s=read(),q=Array.isArray(s.questionnaire)?s.questionnaire:[];
  const ids=(s.collectionLanguages||['am','om','sid']).filter(x=>LANGS[x]);
  const langs=ids.length?ids:['am'];
  const def=LANGS[s.collectionDefault]&&langs.includes(s.collectionDefault)?s.collectionDefault:langs[0];
  if(!q.length){alert('Add at least one questionnaire question first.');return null}
  const surveyHeaders=['type','name'];
  langs.forEach(id=>surveyHeaders.push(`label::${LANGS[id].xls}`));
  surveyHeaders.push('required');
  const choicesHeaders=['list_name','name'];
  langs.forEach(id=>choicesHeaders.push(`label::${LANGS[id].xls}`));
  const survey=[],choices=[],usedChoiceNames=new Set();
  q.forEach(item=>{
   const type=item.type==='select_one'||item.type==='select_multiple'?`${item.type} ${slug(item.name)}_choices`:item.type;
   const row=[type,item.name];
   langs.forEach(id=>row.push(item.labels?.[id]||''));
   row.push(item.required?'TRUE':'');
   survey.push(row);
   if(item.type==='select_one'||item.type==='select_multiple'){
    const listName=`${slug(item.name)}_choices`;
    (item.choices||[]).forEach(choice=>{
      const base=slug(choice),choiceName=unique(base,usedChoiceNames),r=[listName,choiceName];
      langs.forEach(id=>r.push(choice));
      choices.push(r);
    });
   }
  });
  const title=s.title||'ANTENEH Research Questionnaire';
  const settingsHeaders=['form_title','version','default_language'];
  const settingsRow=[title,new Date().toISOString().slice(0,10).replace(/-/g,''),LANGS[def].xls];
  return {surveyHeaders,survey,choicesHeaders,choices,settingsHeaders,settings:[settingsRow],languages:langs.map(id=>LANGS[id].xls),title};
 }
 async function exportXlsx(){
  try{
   const data=build();if(!data)return;
   const XLSX=await loadXlsx();
   const wb=XLSX.utils.book_new();
   XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([data.surveyHeaders,...data.survey]),'survey');
   XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([data.choicesHeaders,...data.choices]),'choices');
   XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([data.settingsHeaders,...data.settings]),'settings');
   const safe=slug(data.title).slice(0,48)||'research_questionnaire';
   XLSX.writeFile(wb,`${safe}_multilingual_xlsform.xlsx`);
   const s=read();s.lastXlsformExport={at:new Date().toISOString(),languages:data.languages,title:data.title,questionCount:data.survey.length,choiceCount:data.choices.length};localStorage.setItem('arlab',JSON.stringify(s));
  }catch(e){console.error(e);alert('XLSForm export could not be completed. Check your connection and try again.')}
 }
 function render(stage){if(stage!==9)return;add(`<div class="card" id="xlsform-exporter"><h4>📥 Kobo XLSForm Export</h4><p>Export the saved multilingual questionnaire as an XLSForm with <b>survey</b>, <b>choices</b>, and <b>settings</b> worksheets. Stable question/choice names remain analysis-safe.</p><div class="notice">The exported form uses the selected Amharic, Afaan Oromoo, and Sidaamu Afoo translation columns. Review all translations with fluent speakers before deployment.</div><button class="btn primary" id="xlsExport" style="margin-top:10px">Download multilingual XLSForm (.xlsx)</button><div class="muted" style="margin-top:8px">KoboToolbox/KoboCollect can use the language selector after the translated form is deployed.</div></div>`);document.getElementById('xlsExport').onclick=exportXlsx}
 window.XLSFormExporter={render,build,exportXlsx};
 const go=()=>render(Number(read().current||0));if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();setInterval(go,1500);
})();
