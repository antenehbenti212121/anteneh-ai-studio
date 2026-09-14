/* ANTENEH RESEARCH HUB — stage decision record */
(()=>{
 const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
 const write=s=>localStorage.setItem('arlab',JSON.stringify(s));
 const esc=x=>String(x??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
 const labels=['Research intelligence','Problem statement','Knowledge gap','Objectives','Research questions','Hypotheses','Conceptual framework','Methodology','Sampling','Questionnaire','Data collection','Data quality','Statistical analysis','Tables & charts','Results','Literature synthesis','Discussion','Conclusion','References','Quality control','Manuscript','Export'];
 const render=()=>{
  const s=read(),i=Math.max(0,Math.min(21,Number(s.current||0)));
  let box=document.getElementById('decisionRecord');
  if(!box){box=document.createElement('div');box.id='decisionRecord';box.className='card';const main=document.querySelector('.main');if(main)main.appendChild(box)}
  const last=(s.stageDecisions||[]).filter(x=>x.stage===i).slice(-1)[0];
  box.innerHTML='<h4>Stage decision record</h4><p><b>'+esc(labels[i])+'</b> — record the scientific decision before moving on.</p><label>Decision / approved output</label><textarea id="decisionText" style="min-height:100px">'+esc(last?.decision||'')+'</textarea><label>Evidence supporting the decision</label><textarea id="decisionEvidence" style="min-height:80px">'+esc(last?.evidence||'')+'</textarea><label>Uncertainty / limitations</label><textarea id="decisionUncertainty" style="min-height:80px">'+esc(last?.uncertainty||'')+'</textarea><label>Researcher approval</label><div><input id="decisionApproved" type="checkbox" '+(last?.approved?'checked':'')+'> I approve this decision for the current research stage.</div><button class="btn primary" id="saveDecision">Save stage decision</button><div id="decisionSaved" style="margin-top:8px;opacity:.75"></div>';
  document.getElementById('saveDecision').onclick=()=>{const x=read();x.stageDecisions=Array.isArray(x.stageDecisions)?x.stageDecisions:[];x.stageDecisions.push({stage:i,label:labels[i],decision:decisionText.value,evidence:decisionEvidence.value,uncertainty:decisionUncertainty.value,approved:decisionApproved.checked,savedAt:new Date().toISOString()});x.stageDecisions=x.stageDecisions.slice(-100);write(x);document.getElementById('decisionSaved').textContent='Saved '+new Date().toLocaleString();};
 };
 window.ResearchDecisionRecord={render};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();
 setInterval(render,2000);
})();
