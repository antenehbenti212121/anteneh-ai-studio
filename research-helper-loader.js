(()=>{
  if(!document.getElementById('aiFab')){
    const s=document.createElement('script');
    s.src='/research-assistant.js';
    document.body.appendChild(s);
  }
  const relabel=()=>{
    document.querySelectorAll('.stage[data-i="21"]').forEach(b=>{
      const small=b.querySelector('small');
      b.childNodes.forEach(n=>{if(n.nodeType===3&&/^22\.\s*Export/.test(n.nodeValue.trim()))n.nodeValue='22. Journal requirements & submission'});
      if(small)small.textContent='Journal requirements, submission readiness, manifest & final audit';
    });
    document.querySelectorAll('.mobile button[data-i="21"]').forEach(b=>{b.innerHTML='22<br>Journal';});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',relabel);else relabel();
  new MutationObserver(relabel).observe(document.body,{childList:true,subtree:true});
})();
