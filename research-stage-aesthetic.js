/* ANTENEH RESEARCH HUB — stage-specific workspace polish */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
  .main[data-stage]{position:relative;overflow:hidden}
  .main[data-stage]:before{content:"";position:absolute;right:-90px;top:-90px;width:230px;height:230px;border-radius:50%;border:1px solid rgba(56,216,245,.07);box-shadow:0 0 0 22px rgba(7,137,48,.018),0 0 0 44px rgba(15,71,175,.014);pointer-events:none}
  .main[data-stage]>.card:first-of-type{position:relative;z-index:1}
  .main[data-stage="0"] #titleFields,.main[data-stage="0"] #content{border-left:2px solid rgba(56,216,245,.28);padding-left:16px}
  .main[data-stage="1"] #content,.main[data-stage="2"] #content,.main[data-stage="3"] #content,.main[data-stage="4"] #content,.main[data-stage="5"] #content{border-left:2px solid rgba(7,137,48,.30);padding-left:16px}
  .main[data-stage="6"] #content,.main[data-stage="7"] #content,.main[data-stage="8"] #content,.main[data-stage="9"] #content,.main[data-stage="10"] #content,.main[data-stage="11"] #content,.main[data-stage="12"] #content{border-left:2px solid rgba(252,221,9,.24);padding-left:16px}
  .main[data-stage="13"] #content,.main[data-stage="14"] #content,.main[data-stage="15"] #content,.main[data-stage="16"] #content,.main[data-stage="17"] #content{border-left:2px solid rgba(56,216,245,.24);padding-left:16px}
  .main[data-stage="18"] #content,.main[data-stage="19"] #content,.main[data-stage="20"] #content,.main[data-stage="21"] #content{border-left:2px solid rgba(15,71,175,.30);padding-left:16px}
  .main[data-stage="7"] .card,.main[data-stage="8"] .card,.main[data-stage="12"] .card{box-shadow:0 14px 34px rgba(7,137,48,.07);border-color:rgba(252,221,9,.18)!important}
  .main[data-stage="7"] .card:first-of-type,.main[data-stage="8"] .card:first-of-type,.main[data-stage="12"] .card:first-of-type{background:linear-gradient(135deg,rgba(7,137,48,.10),rgba(12,29,46,.96))!important}
  .main[data-stage="14"] .card:first-of-type,.main[data-stage="15"] .card:first-of-type,.main[data-stage="16"] .card:first-of-type{background:linear-gradient(135deg,rgba(56,216,245,.07),rgba(12,29,46,.96))!important}
  .main[data-stage="18"] .card:first-of-type,.main[data-stage="19"] .card:first-of-type,.main[data-stage="20"] .card:first-of-type,.main[data-stage="21"] .card:first-of-type{background:linear-gradient(135deg,rgba(15,71,175,.09),rgba(12,29,46,.96))!important}
  @media(max-width:700px){.main[data-stage] #content,.main[data-stage] #titleFields{padding-left:11px!important}.main[data-stage]:before{width:150px;height:150px;right:-70px;top:-70px}}
  `;
  document.head.appendChild(style);
  const read=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
  const apply=()=>{const main=document.querySelector('.main');if(main)main.dataset.stage=String(Number(read().current||0))};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply);else apply();
  setInterval(apply,900);
  const load=()=>{if(window.__stageWorkspaceLoaded)return;window.__stageWorkspaceLoaded=true;const s=document.createElement('script');s.src='/stage-workspace.js';document.head.appendChild(s);const d=document.createElement('script');d.src='/research-decision-record.js';d.onload=()=>window.ResearchDecisionRecord?.render?.();document.head.appendChild(d);const m=document.createElement('script');m.src='/multilingual-collection.js';m.onload=()=>window.MultilingualCollection?.render?.(Number(read().current||0));document.head.appendChild(m);const q=document.createElement('script');q.src='/questionnaire-builder.js';q.onload=()=>window.QuestionnaireBuilder?.render?.(Number(read().current||0));document.head.appendChild(q);const x=document.createElement('script');x.src='/xlsform-exporter.js';x.onload=()=>window.XLSFormExporter?.render?.(Number(read().current||0));document.head.appendChild(x);const c=document.createElement('script');c.src='/data-collection-stage.js';c.onload=()=>window.DataCollectionStage?.render?.(Number(read().current||0));document.head.appendChild(c);const ql=document.createElement('script');ql.src='/data-quality-runtime.js';ql.onload=()=>window.DataQualityRuntime?.render?.(Number(read().current||0));document.head.appendChild(ql);const apr=document.createElement('script');apr.src='/analysis-plan-runtime.js';apr.onload=()=>window.AnalysisPlanRuntime?.render?.(Number(read().current||0));document.head.appendChild(apr);const ar=document.createElement('script');ar.src='/analysis-readiness.js';ar.onload=()=>window.AnalysisReadiness?.render?.(Number(read().current||0));document.head.appendChild(ar);const po=document.createElement('script');po.src='/publication-output-runtime.js';po.onload=()=>window.PublicationOutputRuntime?.render?.(Number(read().current||0));document.head.appendChild(po)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load);else load();
})();
