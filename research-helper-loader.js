(()=>{
  const src='/research-stage-aesthetic.js';
  const boot=()=>{
    if(window.__researchStageAestheticReady||window.__researchStageAestheticLoading)return;
    const existing=document.querySelector('script[data-rh-runtime="'+src+'"]');
    if(existing){window.__researchStageAestheticLoading=true;return}
    window.__researchStageAestheticLoading=true;
    const s=document.createElement('script');
    s.src=src;
    s.dataset.rhRuntime=src;
    s.async=false;
    s.onload=()=>{window.__researchStageAestheticReady=true;window.__researchStageAestheticLoading=false};
    s.onerror=()=>{window.__researchStageAestheticLoading=false;s.remove();setTimeout(boot,1000)};
    document.head.appendChild(s);
  };
  const loadAssistant=()=>{
    if(window.__researchAssistantLoaded||window.ResearchAssistant)return;
    const s=document.createElement('script');
    s.src='/research-assistant.js';
    s.async=false;
    s.onload=()=>window.__researchAssistantLoaded=true;
    document.head.appendChild(s);
  };
  const loadFreshUI=()=>{
    if(window.__researchPremiumUIRefresh)return;
    const premiumAlreadyApplied=(()=>{try{return !!getComputedStyle(document.documentElement).getPropertyValue('--et-green').trim()}catch(e){return false}})();
    if(premiumAlreadyApplied){window.__researchPremiumUIRefresh=true;window.__researchPremiumUIReady=true;return}
    window.__researchPremiumUIRefresh=true;
    const s=document.createElement('script');
    s.src='/ui-enhancements.js';
    s.async=true;
    s.onload=()=>{window.__researchPremiumUIReady=true};
    s.onerror=()=>{window.__researchPremiumUIRefresh=false};
    document.head.appendChild(s);
  };
  const relabel=()=>{
    document.querySelectorAll('.stage[data-i="21"]').forEach(b=>{
      const small=b.querySelector('small');
      b.childNodes.forEach(n=>{if(n.nodeType===3&&/^22\.\s*Export/.test(n.nodeValue.trim()))n.nodeValue='22. Journal requirements & submission'});
      if(small)small.textContent='Journal requirements, submission readiness, manifest & final audit';
    });
    document.querySelectorAll('.mobile button[data-i="21"]').forEach(b=>{b.innerHTML='22<br>Journal';});
  };
  const bootUI=()=>{loadAssistant();boot();relabel();setTimeout(loadFreshUI,0);setTimeout(relabel,150);setTimeout(relabel,600);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootUI);else bootUI();
  new MutationObserver(relabel).observe(document.body,{childList:true,subtree:true});
})();
