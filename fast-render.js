/* ANTENEH AI STUDIO — lightweight render helpers. Loaded optionally by the visual studio. */
(()=>{
  window.antenehFastRender={
    fps:12,
    bitrate:(w,h)=>Math.min(3200000,Math.max(700000,Math.round(w*h*1.7))),
    frameDelay:83
  };
})();
