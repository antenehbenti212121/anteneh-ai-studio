(()=>{
  const loadOnce=(src,key)=>{
    if(window[key]||document.querySelector(`script[data-rh-runtime="${src}"]`))return;
    const s=document.createElement('script');
    s.src=src;
    s.dataset.rhRuntime=src;
    s.async=false;
    document.body.appendChild(s);
    window[key]=true;
  };
  loadOnce('/research-assistant.js','__researchAssistantLoaded');
  loadOnce('/research-stage-aesthetic.js','__researchStageAestheticLoaded');
  const relabel=()=>{
    document.querySelectorAll('.stage[data-i="21"]').forEach(b=>{
      const small=b.querySelector('small');
      b.childNodes.forEach(n=>{if(n.nodeType===3&&/^22\.\s*Export/.test(n.nodeValue.trim()))n.nodeValue='22. Journal requirements & submission'});
      if(small)small.textContent='Journal requirements, submission readiness, manifest & final audit';
    });
    document.querySelectorAll('.mobile button[data-i="21"]').forEach(b=>{b.innerHTML='22<br>Journal';});
  };
  const boot=()=>{relabel();setTimeout(relabel,150);setTimeout(relabel,600);};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  new MutationObserver(relabel).observe(document.body,{childList:true,subtree:true});
})();
