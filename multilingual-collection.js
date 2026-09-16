/* ANTENEH RESEARCH HUB — multilingual data collection workspace */
(()=>{
 const LANGS=[
  {id:'am',name:'Amharic',label:'አማርኛ',kobo:'Amharic (am)',dir:'ltr'},
  {id:'om',name:'Afaan Oromoo',label:'Afaan Oromoo',kobo:'Afaan Oromoo (om)',dir:'ltr'},
  {id:'sid',name:'Sidamic',label:'Sidaamu Afoo',kobo:'Sidamic (sid)',dir:'ltr'}
 ];
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const add=h=>{const c=document.getElementById('content');if(c&&!document.getElementById('multilingual-card'))c.insertAdjacentHTML('afterbegin',h)};
 const schema=langs=>langs.map(x=>`label::${x.kobo}`).join(' | ');
 function render(stage){
  if(stage!==9&&stage!==10)return;
  const s=read();
  add(`<div class="card" id="multilingual-card"><h4>🌍 Multilingual Data Collection</h4><p>Prepare one questionnaire for <b>አማርኛ</b>, <b>Afaan Oromoo</b>, and <b>Sidaamu Afoo</b>. The same form can be deployed to KoboToolbox/KoboCollect with a language selector.</p><div class="paper"><b>Supported languages</b><br>${LANGS.map(l=>`<label style="display:block;margin:7px 0"><input type="checkbox" class="mlang" value="${l.id}"> ${l.label} — ${l.name} <span class="muted">(${l.id})</span></label>`).join('')}</div><div class="field"><label>DEFAULT COLLECTION LANGUAGE</label><select id="mdefault">${LANGS.map(l=>`<option value="${l.id}">${l.label} — ${l.name}</option>`).join('')}</select></div><button class="btn primary" id="mSave">Save multilingual configuration</button><div class="notice" id="mStatus" style="margin-top:10px"></div><div id="mSchema" class="paper" style="margin-top:10px"></div></div>`);
  const selected=new Set((s.collectionLanguages||['am','om','sid']).filter(x=>LANGS.some(l=>l.id===x)));
  document.querySelectorAll('.mlang').forEach(x=>x.checked=selected.has(x.value));
  document.getElementById('mdefault').value=s.collectionDefault||'am';
  const show=()=>{const ids=[...document.querySelectorAll('.mlang:checked')].map(x=>x.value);const ls=LANGS.filter(x=>ids.includes(x.id));document.getElementById('mSchema').innerHTML=ls.length?`<b>Kobo/XLSForm translation columns</b><br><code>${esc(schema(ls))}</code><br><br><b>Also translate</b>: hints, guidance hints, required messages, constraint messages, choice labels, and respondent-facing media.<br><br><span class="muted">Question names, choice names, and list names remain stable for analysis.</span>`:'Select at least one language.'};
  document.querySelectorAll('.mlang').forEach(x=>x.onchange=show);show();
  document.getElementById('mSave').onclick=()=>{const x=read(),ids=[...document.querySelectorAll('.mlang:checked')].map(e=>e.value);if(!ids.length){document.getElementById('mStatus').textContent='Select at least one collection language.';return}const def=document.getElementById('mdefault').value;x.collectionLanguages=ids;x.collectionDefault=ids.includes(def)?def:ids[0];x.koboTranslationSchema=LANGS.filter(l=>ids.includes(l.id)).map(l=>({language:l.name,label:l.label,code:l.id,xlsform:l.kobo,labelColumn:`label::${l.kobo}`,hintColumn:`hint::${l.kobo}`,choiceLabelColumn:`label::${l.kobo}`}));x.multilingualUpdatedAt=new Date().toISOString();write(x);document.getElementById('mStatus').textContent='✓ Multilingual configuration saved for this research project.'};
 }
 window.MultilingualCollection={render,langs:LANGS};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>render(Number(read().current||0)));else render(Number(read().current||0));
 setInterval(()=>render(Number(read().current||0)),1500);
})();
