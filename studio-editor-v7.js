(() => {
  'use strict';
  const list=document.querySelector('.story-list'); if(!list)return;
  const $=id=>document.getElementById(id);
  const save=()=>window.antenehStudioSync?.();
  const active=()=>list.querySelector('.scene.active');
  const mark=()=>{const s=active(); if(s){s.scrollIntoView({behavior:'smooth',block:'nearest'});}}
  list.addEventListener('input',e=>{if(e.target.closest('.editor-scene')){clearTimeout(window.__studioSaveTimer);window.__studioSaveTimer=setTimeout(save,180);}});
  list.addEventListener('change',e=>{if(e.target.closest('.editor-scene'))save();});
  document.addEventListener('click',e=>{const s=e.target.closest('.editor-scene');if(!s)return;if(e.target.closest('[data-action]')){setTimeout(()=>{save();mark()},20);}});
  const observer=new MutationObserver(()=>{list.querySelectorAll('.editor-scene').forEach((s,i)=>{s.setAttribute('aria-label',`Scene ${i+1}`);s.querySelectorAll('input,textarea,select').forEach(x=>x.addEventListener('focus',()=>{list.querySelectorAll('.scene').forEach(n=>n.classList.remove('active'));s.classList.add('active')},{once:true}))})});
  observer.observe(list,{childList:true,subtree:true});
  setTimeout(()=>observer.takeRecords(),0);
})();
