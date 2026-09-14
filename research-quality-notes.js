/* ANTENEH RESEARCH HUB — data quality guidance */
(()=>{
  const R=()=>JSON.parse(localStorage.getItem('arlab')||'{}');
  function render(){
    const c=document.getElementById('content');
    if(!c||document.getElementById('quality-guidance'))return;
    const s=R();
    if(!s.dataset)return;
    c.insertAdjacentHTML('afterbegin','<div class="card" id="quality-guidance"><h4>Research data quality checklist</h4><p>Before interpreting results, verify completeness, consistency, plausibility and reproducibility of the dataset.</p><div class="paper"><b>Check before analysis</b><br>• Missing values and their pattern<br>• Duplicate records or identifiers<br>• Impossible or implausible values<br>• Variable definitions and coding<br>• Outliers and influential observations<br>• Dataset version and source<br>• Reproducible processing steps</div><div class="notice">Quality review is a research decision gate. The hub should not silently alter the data to make results look better.</div></div>');
  }
  window.ResearchQualityNotes={render};
  setTimeout(render,1000);
})();
