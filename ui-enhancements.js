/* ANTENEH RESEARCH HUB — premium body/workspace aesthetic */
(()=>{
  const style=document.createElement('style');
  style.textContent=`
  :root{
    --et-green:#078930;--et-yellow:#FCDD09;--et-red:#DA121A;--et-blue:#0F47AF;
    --ink:#07111d;--surface:#0c1929;--surface2:#101f32;--line:#243a52;
    --text:#f5f8fc;--muted:#93a7bc;--soft:#b9c7d6;--accent:#7c5cff;--cyan:#38d8f5;
    --radius:18px;--shadow:0 18px 55px rgba(0,0,0,.22)
  }
  body{
    background:
      radial-gradient(900px 500px at 8% -8%,rgba(15,71,175,.20),transparent 62%),
      radial-gradient(700px 420px at 92% 2%,rgba(7,137,48,.12),transparent 60%),
      linear-gradient(180deg,#06101c 0%,#081321 52%,#06101c 100%)!important;
    color:var(--text);letter-spacing:.005em
  }
  body:before{content:"";position:fixed;z-index:9999;left:0;right:0;top:0;height:3px;background:linear-gradient(90deg,var(--et-green),var(--et-yellow),var(--et-red));pointer-events:none}
  .app{max-width:1480px!important;padding:22px 22px 28px!important}
  .top{padding:8px 2px 24px!important;align-items:center}
  .brand{gap:13px!important}
  .logo{width:48px!important;height:48px!important;border-radius:15px!important;background:linear-gradient(145deg,var(--et-green),var(--et-blue) 65%,var(--et-red))!important;box-shadow:0 10px 28px rgba(7,137,48,.18);font-size:19px}
  .brand h1{font-size:18px!important;letter-spacing:.015em}.brand p{font-size:12px!important;color:#8fa5ba!important}
  .badge{padding:8px 11px!important;background:rgba(7,137,48,.08);border-color:rgba(252,221,9,.22)!important;color:#bfe8d0!important}
  .hero{
    padding:28px 30px 30px!important;margin-bottom:18px;border:1px solid rgba(111,139,169,.18);border-radius:24px;
    background:linear-gradient(135deg,rgba(15,71,175,.13),rgba(12,25,41,.88) 46%,rgba(7,137,48,.08));
    box-shadow:var(--shadow);position:relative;overflow:hidden
  }
  .hero:before{content:"";position:absolute;inset:0;background:linear-gradient(115deg,transparent 0 58%,rgba(252,221,9,.035) 58% 59%,transparent 59%);pointer-events:none}
  .hero:after{content:"";position:absolute;left:30px;bottom:0;width:180px;height:3px;background:linear-gradient(90deg,var(--et-green),var(--et-yellow),var(--et-red));border-radius:99px}
  .hero h2{font-size:clamp(32px,5vw,58px)!important;letter-spacing:-.035em!important;max-width:920px!important;line-height:1.02!important;position:relative;z-index:1}
  .hero p{font-size:15px!important;color:#a9bbcd!important;max-width:760px!important;margin-top:15px!important;line-height:1.7!important;position:relative;z-index:1}
  .workspace{grid-template-columns:265px minmax(0,1fr) 300px!important;gap:16px!important;align-items:start}
  .panel{background:linear-gradient(180deg,rgba(14,29,47,.96),rgba(9,21,35,.96))!important;border:1px solid rgba(102,133,165,.20)!important;border-radius:20px!important;padding:16px!important;box-shadow:0 12px 38px rgba(0,0,0,.14)}
  .left{position:sticky;top:16px}.right{display:grid;gap:16px}
  .panel h3{font-size:13px!important;letter-spacing:.04em;text-transform:uppercase;color:#d8e4ef;margin:0 0 13px!important}
  .stages{gap:7px!important;max-height:calc(100vh - 170px)!important;padding-right:2px}
  .stage{background:rgba(8,23,39,.72)!important;color:#8fa5ba!important;border:1px solid rgba(77,105,133,.22)!important;padding:11px 12px!important;border-radius:12px!important;line-height:1.25;transition:all .18s ease!important}
  .stage:hover{background:#10253a!important;color:#dce8f2!important;transform:translateX(3px);border-color:rgba(252,221,9,.28)!important}
  .stage.active{background:linear-gradient(90deg,rgba(7,137,48,.20),rgba(15,71,175,.13))!important;color:#fff!important;border-color:rgba(252,221,9,.25)!important;border-left:3px solid var(--et-green)!important;box-shadow:0 8px 22px rgba(0,0,0,.16)!important}
  .stage small{color:inherit;opacity:.7;font-size:10px!important;margin-top:4px!important}
  .main{min-height:650px!important;padding:22px!important}
  #stageTitle{font-size:22px!important;letter-spacing:-.02em!important;text-transform:none!important;color:#fff!important;margin-bottom:18px!important}
  .field{margin:16px 0!important}.field label{font-size:10px!important;letter-spacing:.08em;color:#91a8bd!important;margin-bottom:7px!important}
  .field input,.field textarea,.field select{background:#071522!important;border:1px solid #27415a!important;color:#f4f8ff!important;border-radius:13px!important;padding:13px!important;outline:none;transition:.18s ease;box-shadow:inset 0 1px 0 rgba(255,255,255,.025)}
  .field input:focus,.field textarea:focus,.field select:focus{border-color:rgba(56,216,245,.62)!important;box-shadow:0 0 0 3px rgba(56,216,245,.08)!important}
  .field textarea{min-height:150px!important}
  .actions{gap:9px!important}.btn{padding:11px 15px!important;border:1px solid rgba(102,133,165,.22)!important;border-radius:11px!important;background:#12283d!important;transition:.18s ease!important}.btn:hover{transform:translateY(-1px);border-color:rgba(56,216,245,.38)!important;background:#16324a!important}.btn.primary{background:linear-gradient(135deg,var(--et-green),var(--et-blue))!important;border-color:rgba(252,221,9,.28)!important;box-shadow:0 9px 25px rgba(7,137,48,.18)!important}
  .progress{height:8px!important;background:#122337!important;margin:20px 0!important}.progress i{background:linear-gradient(90deg,var(--et-green),var(--et-yellow),var(--et-red))!important}
  .card{background:linear-gradient(145deg,rgba(15,31,50,.95),rgba(8,21,35,.95))!important;border:1px solid rgba(95,128,159,.22)!important;border-radius:16px!important;padding:16px!important;margin-top:14px!important;box-shadow:0 10px 28px rgba(0,0,0,.12)}
  .card h4{font-size:13px!important;color:#f5f8fc!important;margin-bottom:8px!important}.card p{font-size:13px!important;line-height:1.65!important;color:#afc0d1!important}
  .rh-director{border-color:rgba(252,221,9,.24)!important;background:linear-gradient(145deg,rgba(16,44,31,.72),rgba(10,24,39,.96))!important}
  .rh-director .rh-dot{width:8px!important;height:8px!important;background:var(--et-green)!important}
  .metric{font-size:38px!important;letter-spacing:-.04em;color:#fff}.muted{font-size:11px!important;color:#849bb0!important}
  .notice{background:rgba(15,71,175,.06);border-color:rgba(56,216,245,.15)!important;padding:13px!important;line-height:1.6!important}
  .source{background:rgba(8,23,39,.55);border-color:rgba(77,105,133,.20)!important;padding:11px!important;border-radius:12px!important;transition:.18s ease}.source:hover{transform:translateY(-1px);border-color:rgba(252,221,9,.22)!important}.source b{font-size:12px!important;margin-bottom:3px}
  footer{padding:25px 0 10px!important;color:#657c92!important}
  .rh-shell{margin:0 0 16px!important;grid-template-columns:minmax(0,1fr) auto!important;gap:12px!important}
  .rh-command{border-radius:20px!important;padding:19px!important;background:linear-gradient(135deg,rgba(7,137,48,.11),rgba(12,29,47,.96) 48%,rgba(15,71,175,.08))!important;box-shadow:var(--shadow)!important}
  .rh-command h3{font-size:clamp(20px,3vw,28px)!important;text-transform:none!important;letter-spacing:-.02em!important;color:#fff!important}
  .rh-command p{font-size:13px!important;color:#9eb2c6!important}.rh-actions{margin-top:15px!important}.rh-action{padding:10px 13px!important;border-radius:11px!important}.rh-action.primary{background:linear-gradient(135deg,var(--et-green),var(--et-blue))!important}
  .rh-metrics{gap:8px!important;min-width:270px!important}.rh-metric{background:rgba(9,23,38,.92)!important;border-color:rgba(102,133,165,.20)!important;border-radius:15px!important;padding:14px!important}.rh-metric strong{font-size:22px!important}.rh-metric span{font-size:10px!important;color:#849bb0!important}
  .rh-ethiopia-mark{background:rgba(15,71,175,.06)!important;border-color:rgba(252,221,9,.18)!important}
  @media(max-width:1050px){.workspace{grid-template-columns:220px minmax(0,1fr)!important}.right{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:12px}.left{position:static}.rh-shell{grid-template-columns:1fr!important}.rh-metrics{min-width:0!important}}
  @media(max-width:700px){
    .app{padding:12px 11px 20px!important}.top{padding-bottom:17px!important}.hero{padding:23px 19px 25px!important;border-radius:19px!important;margin-bottom:13px}.hero h2{font-size:34px!important}.hero p{font-size:13px!important;line-height:1.6!important}.hero:after{left:19px;width:130px}
    .rh-shell{gap:9px!important}.rh-command{padding:15px!important;border-radius:17px!important}.rh-command h3{font-size:20px!important}.rh-command p{font-size:12px!important}.rh-actions{display:grid!important;grid-template-columns:1fr!important}.rh-action{width:100%!important}.rh-metrics{grid-template-columns:repeat(3,1fr)!important}.rh-metric{padding:10px 6px!important}.rh-metric strong{font-size:18px!important}.rh-metric span{font-size:9px!important}
    .workspace{display:block!important}.main{min-height:600px!important;padding:15px!important;border-radius:17px!important}.panel{border-radius:17px!important}.left,.right{display:none!important}.main{margin-bottom:65px!important}#stageTitle{font-size:20px!important;margin-bottom:14px!important}.field textarea{min-height:170px!important}
    .mobile{background:rgba(5,15,26,.97)!important;backdrop-filter:blur(14px);border-top:1px solid rgba(102,133,165,.25)!important;padding:7px!important}.mobile button{flex:0 0 72px!important;color:#7f96ab!important}.mobile button.active{background:linear-gradient(135deg,rgba(7,137,48,.35),rgba(15,71,175,.25))!important;color:#fff!important}
  }
  `;
  document.head.appendChild(style);
})();
