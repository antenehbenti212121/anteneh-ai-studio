(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const prompt = $('prompt'), length = $('length'), style = $('style'), list = document.querySelector('.story-list');
  const createBtn = $('createBtn'), videoBtn = $('videoBtn'), status = $('videoStatus'), state = $('projectState'), note = $('formNote'), preview = $('videoPreview'), download = $('downloadVideo');
  if (!prompt || !length || !style || !list || !createBtn || !videoBtn) return;

  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();
  const words = v => clean(v).split(/\s+/).filter(Boolean);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const storageKey = 'anteneh-ai-studio-project-v2';
  let outputUrl = null;

  const topicFrom = raw => {
    const s = clean(raw);
    if (words(s).length <= 22) return s.replace(/^explain\s+/i, '').replace(/[.!?]+$/, '');
    const first = s.split(/[.!?]/).map(clean).find(x => x.length >= 8 && x.length <= 120);
    return first || s.slice(0, 120);
  };
  const durationSeconds = value => value === '5 min' ? 300 : value === '2 min' ? 120 : value === '90 sec' ? 90 : 60;
  const sceneCount = value => value === '5 min' ? 8 : value === '2 min' ? 7 : 6;

  const specialLesson = topic => {
    const t = topic.toLowerCase();
    if (t.includes('greenhouse effect')) return [
      ['Hook','Earth receives energy from the Sun, but it does not send all of that energy straight back to space. The greenhouse effect helps explain why our planet stays warm enough for life.','concept','SUN → EARTH → WARMTH'],
      ['What is the greenhouse effect?','Certain gases in Earth’s atmosphere absorb some outgoing infrared heat and re-radiate it in different directions. This natural process helps regulate Earth’s temperature.','labeled diagram','ATMOSPHERE • GREENHOUSE GASES • HEAT'],
      ['Sunlight warms Earth','Most incoming sunlight passes through the atmosphere and warms land and oceans. The warmed surface then emits energy as infrared radiation.','process','SUNLIGHT → SURFACE → INFRARED HEAT'],
      ['Greenhouse gases','Water vapor, carbon dioxide, methane and other gases interact with outgoing infrared radiation. Some of the energy is absorbed and re-radiated, including back toward the surface.','cause/effect','HEAT → GREENHOUSE GASES ↔ RE-RADIATION'],
      ['Why the natural effect matters','Without the natural greenhouse effect, Earth would be much colder. The issue is not that the greenhouse effect exists; it is that human activity has increased concentrations of several greenhouse gases.','comparison','NATURAL BALANCE ↔ INCREASED WARMING'],
      ['Human influence','Burning fossil fuels, changing land use and some industrial and agricultural activities increase greenhouse-gas concentrations. This strengthens the heat-trapping effect and contributes to global warming.','cause/effect','HUMAN ACTIVITY → MORE GHGs → MORE WARMING'],
      ['Real-world heat balance','Think of Earth as an energy system: sunlight enters, infrared energy leaves, and greenhouse gases affect how efficiently heat escapes. A changing balance changes the planet’s temperature.','system diagram','ENERGY IN ↔ ENERGY OUT'],
      ['Recap','The greenhouse effect is a natural process. Greenhouse gases influence Earth’s heat balance, and human activities have increased their concentrations, strengthening warming.','recap','NATURAL • HEAT BALANCE • HUMAN INFLUENCE']
    ];
    if (t.includes('photosynthesis')) return [
      ['Hook','How can a green plant use sunlight to build the chemical energy it needs? The answer is photosynthesis.','concept','SUNLIGHT → GREEN LEAF'],
      ['The ingredients','Plants use light energy, carbon dioxide from the air and water absorbed by the roots. These are the key inputs for photosynthesis.','labeled diagram','LIGHT + CO₂ + H₂O'],
      ['Inside the leaf','Photosynthesis takes place in chloroplasts. Chlorophyll helps capture light energy, which drives chemical reactions inside plant cells.','labeled diagram','LEAF → CELL → CHLOROPLAST'],
      ['The process','Light energy helps the plant rearrange carbon dioxide and water into glucose, which stores chemical energy. Oxygen is released as a product.','process','LIGHT + CO₂ + H₂O → GLUCOSE + O₂'],
      ['Why glucose matters','The glucose made by photosynthesis can be used as an energy source or built into other substances the plant needs for growth and storage.','concept','GLUCOSE → ENERGY • GROWTH • STORAGE'],
      ['A plant by a window','A houseplant makes the idea visible: leaves capture light and exchange gases, while roots take up water. The plant connects all three inputs in one system.','example','WINDOW → LEAF ↔ AIR + ROOTS → WATER'],
      ['Recap','Photosynthesis captures light energy and stores it in glucose while releasing oxygen. Remember the three key inputs: light, carbon dioxide and water.','recap','LIGHT • CO₂ • WATER → GLUCOSE + O₂']
    ];
    if (t.includes('volcano') && /erupt|eruption/.test(t)) return [
      ['Hook','A volcanic eruption begins deep below the surface, where hot molten rock and gases build pressure.','concept','MAGMA + GAS + PRESSURE'],
      ['Magma chamber','Magma can collect in a reservoir beneath a volcano. Dissolved gases and changing pressure influence how magma behaves.','labeled diagram','SURFACE → VENT → MAGMA CHAMBER'],
      ['Pressure builds','As magma rises, pressure changes allow dissolved gases to expand. This can help drive magma upward through cracks and volcanic vents.','cause/effect','PRESSURE ↑ → GAS EXPANSION → MAGMA RISE'],
      ['The vent opens','A vent provides a pathway from the interior toward the surface. Magma moving through the vent can emerge as lava, while gases and ash may also be released.','process','MAGMA CHAMBER → VENT → SURFACE'],
      ['The eruption','If pressure and magma movement overcome resistance, an eruption occurs. Some eruptions produce flowing lava, while others can be explosive and send ash and fragments into the air.','comparison','EFFUSIVE ↔ EXPLOSIVE'],
      ['Lava, ash and gases','At the surface, magma is called lava. Eruptions can also release ash and volcanic gases, creating different hazards and landscapes.','example','LAVA • ASH • GASES'],
      ['Recap','Volcanoes erupt through a chain of processes involving magma, pressure, gases and pathways to the surface. The eruption style depends on the volcanic system and magma properties.','recap','MAGMA → PRESSURE → VENT → ERUPTION']
    ];
    return null;
  };

  const genericLesson = topic => {
    const t = topic.toLowerCase();
    let kind = /how to|tutorial|guide|steps|make|build|learn/.test(t) ? 'howto' : /why|cause|effect|impact|climate|history|pollution/.test(t) ? 'cause' : /math|equation|physics|chemistry|biology|science/.test(t) ? 'science' : /compare|difference|versus|vs\b|pros|cons/.test(t) ? 'compare' : 'concept';
    const packs = {
      howto: [
        ['Hook',`What result are we trying to achieve with ${topic}? This lesson breaks the goal into a sequence you can understand and apply.`,'concept',`${topic} → RESULT`],
        ['Key ideas',`Before starting ${topic}, identify the important ideas, terms or conditions that control the outcome.`,'hierarchy','KEY IDEAS → METHOD → RESULT'],
        ['Step 1',`Start with the first essential stage of ${topic}. Keep the action focused so the next stage has a clear foundation.`,'process','1 → 2 → 3'],
        ['Step 2',`Continue with the next stage of ${topic}. Check the important condition before moving to the final result.`,'process','STEP 1 → STEP 2 → STEP 3'],
        ['Common mistake',`A common problem with ${topic} is skipping an important condition or applying the idea in the wrong order. Check the sequence before finishing.`,'warning','MISTAKE → CHECK → CORRECTION'],
        ['Example',`Imagine using ${topic} in a real situation. Connect the inputs to the action and then to the observable result.`,'example','INPUTS → ACTION → RESULT'],
        ['Recap',`Remember the goal, the key idea and the correct sequence for ${topic}. A good explanation should make the process easy to repeat.`,'recap','GOAL • METHOD • RESULT']
      ],
      cause: [
        ['Hook',`What causes ${topic}, and what happens because of it? Start with the question that connects the whole lesson.`,'concept',`WHY ${topic.toUpperCase()}?`],
        ['Core idea',`${topic} can be understood by separating the central event from the conditions and forces around it.`,'concept','CONDITIONS → CENTRAL EVENT'],
        ['Causes',`Look for the main factors connected to ${topic}. Different causes can combine, reinforce one another or change the size of the effect.`,'cause/effect','CAUSE A + CAUSE B → EVENT'],
        ['Effects',`The consequences of ${topic} can appear immediately or develop over time. Separate direct effects from later outcomes.`,'cause/effect','EVENT → EFFECT A + EFFECT B'],
        ['Example',`A concrete example makes ${topic} easier to understand. Follow the chain from the starting condition to the visible outcome.`,'example','REAL CASE → CAUSE → EFFECT'],
        ['Why it matters',`Understanding ${topic} helps us explain what is happening, recognize important factors and reason about possible outcomes.`,'concept','UNDERSTAND → EXPLAIN → PREDICT'],
        ['Recap',`The key lesson is the relationship between the main causes, the central event and its most important effects.`,'recap','CAUSES → EVENT → EFFECTS']
      ],
      science: [
        ['Hook',`What happens when we look closely at ${topic}? By the end, you should be able to explain its main mechanism.`,'concept',`OBSERVE → EXPLAIN ${topic.toUpperCase()}`],
        ['Definition',`${topic} is easier to understand when we first define it in everyday language, then connect that definition to the scientific terms.`,'labeled diagram','TERM → MEANING → SYSTEM'],
        ['How it works',`Follow ${topic} from its starting conditions through the important stages to the final outcome.`,'process','INPUT → PROCESS → OUTPUT'],
        ['Key relationship',`The parts of ${topic} interact rather than acting alone. Changing one important factor can change the outcome.`,'cause/effect','FACTOR A ↔ FACTOR B → OUTCOME'],
        ['Example',`Connect ${topic} to something observable in everyday life. The example is a bridge between the abstract mechanism and what we can see.`,'example','CONCEPT → OBSERVATION'],
        ['Why it matters',`Learning ${topic} gives us a model for understanding real systems and asking better questions about the world.`,'concept','KNOW → CONNECT → APPLY'],
        ['Recap',`Remember the definition, the mechanism and the real-world example. Those three pieces form a useful mental model of ${topic}.`,'recap','DEFINITION • MECHANISM • EXAMPLE']
      ],
      compare: [
        ['Hook',`What is the most important difference in ${topic}? Start with the decision or question the comparison should answer.`,'comparison','A ↔ B'],
        ['Option A',`Describe the first side of ${topic} using the same criteria we will use for the second side.`,'comparison','OPTION A'],
        ['Option B',`Describe the second side of ${topic} using matching criteria so the comparison stays fair.`,'comparison','OPTION B'],
        ['Side by side',`Compare the most important features of ${topic} directly. Focus on meaningful differences rather than surface details.`,'comparison','A | FEATURE | B'],
        ['Best fit',`Different choices can be better for different goals. Match the option to the situation instead of assuming one answer fits everyone.`,'decision flow','GOAL → A OR B'],
        ['Example',`Use one realistic situation to see how the comparison changes a decision.`,'example','SITUATION → CHOICE'],
        ['Recap',`The best comparison identifies the key difference, the trade-off and the situation where each option makes sense.`,'recap','DIFFERENCE • TRADE-OFF • FIT']
      ],
      concept: [
        ['Hook',`Why does ${topic} matter? Start with the question or surprising idea that gives the learner a reason to care.`,'concept',`WHY ${topic.toUpperCase()}?`],
        ['Core idea',`The central idea of ${topic} can be understood by naming the main thing, defining it simply and connecting it to related parts.`,'concept','MAIN IDEA ↔ SUPPORTING IDEAS'],
        ['How it works',`Break ${topic} into a sequence of relationships. Follow what enters the system, what changes and what comes out.`,'process','INPUT → CHANGE → OUTPUT'],
        ['Key relationship',`The important parts of ${topic} influence one another. Seeing those relationships is often more useful than memorizing isolated facts.`,'cause/effect','PART A ↔ PART B → OUTCOME'],
        ['Example',`A practical example turns ${topic} from an abstract idea into something you can recognize in the real world.`,'example','IDEA → REAL EXAMPLE'],
        ['Why it matters',`Understanding ${topic} helps you explain it, recognize it in context and use the idea when facing a new problem.`,'concept','UNDERSTAND → RECOGNIZE → APPLY'],
        ['Recap',`Remember the central idea, the important relationship and the example. Together they give you a compact mental model of ${topic}.`,'recap','IDEA • RELATIONSHIP • EXAMPLE']
      ]
    };
    return packs[kind];
  };

  function buildLesson() {
    const raw = clean(prompt.value);
    if (!raw) return null;
    const topic = topicFrom(raw);
    const special = specialLesson(topic);
    const base = special || genericLesson(topic);
    const count = Math.min(sceneCount(length.value), base.length);
    const chosen = base.slice(0, count);
    const total = durationSeconds(length.value);
    const weights = chosen.map(s => Math.max(8, words(s[1]).length));
    const weightSum = weights.reduce((a,b) => a+b, 0);
    return chosen.map((s,i) => ({
      id: `scene-${Date.now()}-${i}`,
      title: s[0], narration: s[1], visual: s[3], visualType: s[2],
      caption: s[1], duration: Math.max(4, Math.round(total * weights[i] / weightSum)), keywords: clean(`${topic} ${s[0]} ${s[3]}`).split(/\s+/).slice(0,10)
    }));
  }

  function renderScenes(scenes) {
    list.innerHTML = scenes.map((s,i) => `<article class="scene${i===0?' active':''}" data-index="${i}"><span class="scene-num">${String(i+1).padStart(2,'0')}</span><div class="scene-content"><input class="scene-title" value="${esc(s.title)}" aria-label="Scene title"><textarea class="scene-narration" aria-label="Scene narration">${esc(s.narration)}</textarea><input class="scene-visual" value="${esc(s.visual)}" aria-label="Visual direction"><div class="scene-meta"><span>${esc(s.visualType)}</span><span>${s.duration}s</span></div></div></article>`).join('');
    list.querySelectorAll('.scene').forEach(n => n.addEventListener('click', () => { list.querySelectorAll('.scene').forEach(x=>x.classList.remove('active')); n.classList.add('active'); }));
    list.dataset.lessonTopic = clean(prompt.value);
  }

  function collectScenes() {
    return [...list.querySelectorAll('.scene')].map((n,i) => ({ title: clean(n.querySelector('.scene-title')?.value) || `Scene ${i+1}`, narration: clean(n.querySelector('.scene-narration')?.value), visual: clean(n.querySelector('.scene-visual')?.value), visualType: clean(n.querySelector('.scene-meta span')?.textContent) || 'concept' }));
  }

  function save() {
    const data = {version:2, topic:clean(prompt.value), length:length.value, style:style.value, scenes:collectScenes(), savedAt:new Date().toISOString()};
    localStorage.setItem(storageKey, JSON.stringify(data));
    if (note) note.textContent = 'Project saved on this device.';
    if (state) state.textContent = 'Saved';
  }

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(storageKey));
      if (!data?.scenes?.length) return false;
      prompt.value = data.topic || ''; if ([...length.options].some(o=>o.value===data.length)) length.value=data.length; if ([...style.options].some(o=>o.value===data.style)) style.value=data.style;
      renderScenes(data.scenes); if(note) note.textContent='Your saved project was restored on this device.'; if(state) state.textContent='Restored'; return true;
    } catch (_) { return false; }
  }

  function drawText(c,text,x,y,maxWidth,size,color,weight='400',maxLines=4) {
    c.fillStyle=color; c.font=`${weight} ${size}px system-ui, sans-serif`; const out=[]; let line='';
    for(const w of words(text)){const test=line?line+' '+w:w;if(c.measureText(test).width>maxWidth&&line){out.push(line);line=w;}else line=test;} if(line)out.push(line); out.slice(0,maxLines).forEach((v,i)=>c.fillText(v,x,y+i*(size*1.28))); return out.slice(0,maxLines).length;
  }
  const rr=(c,x,y,w,h,r=20)=>{r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();};
  const arrow=(c,x1,y1,x2,y2,color,p=1)=>{const q=Math.max(0,Math.min(1,p)),x=x1+(x2-x1)*q,y=y1+(y2-y1)*q;c.strokeStyle=color;c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(x1,y1);c.lineTo(x,y);c.stroke();if(q>.88){const a=Math.atan2(y2-y1,x2-x1);c.fillStyle=color;c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-15*Math.cos(a-.5),y2-15*Math.sin(a-.5));c.lineTo(x2-15*Math.cos(a+.5),y2-15*Math.sin(a+.5));c.closePath();c.fill();}};

  function drawVisual(c,s,p,theme){
    const x=735,y=125,w=490,h=445, light=theme.light, ink=theme.ink, muted=theme.muted, accent=theme.accent, accent2=theme.accent2;
    c.fillStyle=light?'rgba(255,255,255,.9)':'rgba(255,255,255,.055)'; c.strokeStyle=theme.line; c.lineWidth=2; rr(c,x,y,w,h,28); c.fill(); c.stroke();
    c.fillStyle=muted;c.font='800 13px system-ui';c.fillText(s.visualType.toUpperCase(),x+28,y+31);
    const t=(s.title+' '+s.narration+' '+s.visual).toLowerCase();
    if(/greenhouse|sunlight.*earth|greenhouse gases|heat balance|ghgs/.test(t)){
      c.fillStyle='#f59e0b';c.beginPath();c.arc(x+75,y+125,38,0,Math.PI*2);c.fill();c.fillStyle=ink;c.font='800 14px system-ui';c.fillText('SUN',x+53,y+182);c.fillStyle=light?'#dcfce7':'#123d32';rr(c,x+180,y+115,145,145,72);c.fill();c.fillStyle=ink;c.textAlign='center';c.font='900 20px system-ui';c.fillText('EARTH',x+252,y+198);c.textAlign='left';arrow(c,x+112,y+125,x+175,y+145,accent2,1);arrow(c,x+325,y+145,x+425,y+105,accent, p);arrow(c,x+425,y+105,x+325,y+185,accent2,p);c.fillStyle=muted;c.font='700 13px system-ui';c.fillText('incoming sunlight',x+25,y+250);c.fillText('outgoing heat',x+330,y+75);c.fillText('greenhouse gases',x+310,y+230);
    } else if(/photosynthesis|chloroplast|glucose|co₂|water/.test(t)){
      c.fillStyle='#86efac';rr(c,x+175,y+130,145,210,70);c.fill();c.fillStyle='#166534';c.font='900 18px system-ui';c.textAlign='center';c.fillText('LEAF',x+247,y+240);c.textAlign='left';arrow(c,x+60,y+95,x+180,y+145,accent, p);arrow(c,x+90,y+350,x+180,y+315,accent2,p);arrow(c,x+320,y+205,x+425,y+150,accent,p);arrow(c,x+320,y+260,x+425,y+325,accent2,p);c.fillStyle=ink;c.font='800 15px system-ui';c.fillText('SUNLIGHT',x+25,y+82);c.fillText('CO₂',x+50,y+385);c.fillText('GLUCOSE',x+365,y+145);c.fillText('O₂',x+410,y+330);c.fillStyle=muted;c.font='700 12px system-ui';c.fillText('chloroplasts inside leaf cells',x+170,y+370);
    } else if(/volcano|magma|lava|eruption|vent/.test(t)){
      c.fillStyle=light?'#fee2e2':'#3b1720';c.beginPath();c.moveTo(x+90,y+350);c.lineTo(x+175,y+160);c.lineTo(x+245,y+105);c.lineTo(x+315,y+160);c.lineTo(x+405,y+350);c.closePath();c.fill();c.fillStyle='#f97316';c.beginPath();c.arc(x+245,y+330,78,0,Math.PI*2);c.fill();arrow(c,x+245,y+320,x+245,y+135,accent,p);c.fillStyle=ink;c.font='800 14px system-ui';c.fillText('VENT',x+262,y+145);c.fillText('MAGMA CHAMBER',x+185,y+425);c.fillText('LAVA / ASH / GASES',x+285,y+100);
    } else if(s.visualType==='process'){
      ['INPUT','CHANGE','OUTPUT'].forEach((v,i)=>{const bx=x+30+i*145;const q=Math.min(1,Math.max(0,p*3-i));c.globalAlpha=q;c.fillStyle=i===1?accent:theme.soft;rr(c,bx,y+150,112,90,18);c.fill();c.fillStyle=i===1?'#fff':ink;c.textAlign='center';c.font='900 14px system-ui';c.fillText(v,bx+56,y+202);c.textAlign='left';if(i<2)arrow(c,bx+115,y+195,bx+140,y+195,accent2,q);});c.globalAlpha=1;
    } else if(s.visualType==='cause/effect'){
      c.fillStyle=theme.soft;rr(c,x+30,y+130,135,82,16);c.fill();c.fillStyle=ink;c.font='900 15px system-ui';c.fillText('CAUSE',x+70,y+180);arrow(c,x+170,y+170,x+300,y+170,accent,p);c.fillStyle=accent;rr(c,x+310,y+130,145,82,16);c.fill();c.fillStyle='#fff';c.fillText('EFFECT',x+350,y+180);
    } else if(s.visualType==='comparison'){
      c.fillStyle=theme.soft;rr(c,x+25,y+125,175,180,18);c.fill();c.fillStyle=accent;rr(c,x+290,y+125,175,180,18);c.fill();c.fillStyle=ink;c.font='900 22px system-ui';c.textAlign='center';c.fillText('A',x+112,y+225);c.fillStyle='#fff';c.fillText('B',x+377,y+225);c.textAlign='left';arrow(c,x+210,y+215,x+280,y+215,accent2,p);
    } else if(s.visualType==='warning'){
      c.fillStyle='#f59e0b';c.beginPath();c.moveTo(x+245,y+90);c.lineTo(x+390,y+350);c.lineTo(x+100,y+350);c.closePath();c.fill();c.fillStyle='#111827';c.font='900 60px system-ui';c.textAlign='center';c.fillText('!',x+245,y+285);c.textAlign='left';
    } else if(s.visualType==='recap'){
      ['01','02','03'].forEach((v,i)=>{const bx=x+35+i*145;c.fillStyle=i===1?accent:theme.soft;rr(c,bx,y+145,112,120,18);c.fill();c.fillStyle=i===1?'#fff':ink;c.font='900 26px system-ui';c.fillText(v,bx+40,y+200);c.font='800 12px system-ui';c.fillText(['REMEMBER','CONNECT','APPLY'][i],bx+23,y+235);});
    } else {
      c.fillStyle=theme.soft;rr(c,x+65,y+145,360,105,22);c.fill();c.fillStyle=accent;c.beginPath();c.arc(x+135,y+198,30,0,Math.PI*2);c.fill();c.fillStyle=ink;c.font='900 20px system-ui';c.fillText('MAIN IDEA',x+185,y+205);arrow(c,x+245,y+265,x+125,y+330,accent2,p);arrow(c,x+245,y+265,x+365,y+330,accent2,p);c.fillStyle=theme.soft;rr(c,x+60,y+315,130,55,14);c.fill();rr(c,x+300,y+315,130,55,14);c.fill();c.fillStyle=muted;c.font='700 12px system-ui';c.fillText('SUPPORT',x+92,y+348);c.fillText('EXAMPLE',x+332,y+348);
    }
  }

  function themeFor(name){
    if(name==='Whiteboard') return {light:true,ink:'#172033',muted:'#526174',accent:'#2563eb',accent2:'#0ea5e9',line:'#d8e1ec',soft:'#eef4fb',bg:'#fffdf7'};
    if(name==='Minimal motion graphics') return {light:true,ink:'#101827',muted:'#526174',accent:'#5b5bd6',accent2:'#06b6d4',line:'#dfe4ee',soft:'#e9eafd',bg:'#f5f7fb'};
    if(name==='Modern presentation') return {light:false,ink:'#fff',muted:'#b8c2d7',accent:'#9b7cff',accent2:'#22d3ee',line:'rgba(255,255,255,.13)',soft:'rgba(155,124,255,.13)',bg:'#090d1c'};
    return {light:false,ink:'#fff',muted:'#b9c3d8',accent:'#7c6cff',accent2:'#22d3ee',line:'rgba(255,255,255,.13)',soft:'rgba(124,108,255,.13)',bg:'#0b1224'};
  }

  function frame(c,s,i,total,p,caption){
    const th=themeFor(style.value),w=c.canvas.width,h=c.canvas.height;c.fillStyle=th.bg;c.fillRect(0,0,w,h);
    if(!th.light){const g=c.createLinearGradient(0,0,w,h);g.addColorStop(0,'#050a17');g.addColorStop(.55,style.value==='Modern presentation'?'#1a1531':'#101a34');g.addColorStop(1,'#070b15');c.fillStyle=g;c.fillRect(0,0,w,h);c.globalAlpha=.12;c.fillStyle=th.accent;c.beginPath();c.arc(1110,100,210+25*Math.sin(p*Math.PI),0,Math.PI*2);c.fill();c.globalAlpha=1;} else if(style.value==='Whiteboard'){c.strokeStyle=th.line;c.lineWidth=1;for(let y=100;y<650;y+=42){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}}
    c.fillStyle=th.accent;c.font='900 18px system-ui';c.fillText('ANTENEH AI STUDIO',55,48);c.fillStyle=th.muted;c.font='800 13px system-ui';c.fillText(`SCENE ${String(i+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`,55,73);
    const intro=Math.min(1,p*5),lift=(1-intro)*22;c.save();c.globalAlpha=intro;c.translate(0,lift);c.fillStyle=th.ink;c.font='900 48px system-ui';drawText(c,s.title,55,170,620,48,th.ink,'900',2);c.fillStyle=th.accent;c.fillRect(55,285,110+70*intro,5);drawText(c,s.narration,58,330,620,21,th.muted,'400',6);c.restore();
    drawVisual(c,s,p,th);
    if(caption){c.fillStyle=th.light?'rgba(255,255,255,.94)':'rgba(4,8,20,.88)';rr(c,50,585,1180,70,16);c.fill();c.fillStyle=th.ink;c.font='700 20px system-ui';c.textAlign='center';drawText(c,caption,w/2,628,1080,20,th.ink,'700',2);c.textAlign='left';}
    c.fillStyle=th.accent;c.fillRect(55,h-28,(w-110)*((i+p)/total),5);
  }

  function mimeType(){return ['video/mp4;codecs=avc1.42E01E,mp4a.40.2','video/mp4','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(x=>window.MediaRecorder?.isTypeSupported?.(x))||'';}
  async function getAudio(){
    const audio=$('audioPreview'); if(!audio?.src||audio.hidden) return {stream:null,duration:0,play:null,cleanup:()=>{}};
    const a=new Audio(audio.src);a.preload='auto';await new Promise((ok,bad)=>{a.onloadedmetadata=ok;a.onerror=bad;});const duration=Number.isFinite(a.duration)?a.duration:0;
    try{const AC=window.AudioContext||window.webkitAudioContext;const ctx=new AC();const src=ctx.createMediaElementSource(a);const dest=ctx.createMediaStreamDestination();src.connect(dest);src.connect(ctx.destination);await ctx.resume();return {stream:dest.stream,duration,a,play:()=>a.play(),cleanup:()=>{try{src.disconnect();dest.disconnect();ctx.close();}catch(_){}}};}catch(_){return {stream:a.captureStream?.()||a.mozCaptureStream?.()||null,duration,a,play:()=>a.play(),cleanup:()=>{}};}
  }

  async function renderVideo(){
    const items=collectScenes(); if(!items.length){status.textContent='Create a lesson first.';return;}
    if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){status.textContent='Video recording is not supported here. Try Chrome on Android or desktop.';return;}
    videoBtn.disabled=true;state.textContent='Rendering';preview.hidden=true;download.hidden=true;status.textContent='Preparing your educational video…';
    if(outputUrl)URL.revokeObjectURL(outputUrl);
    const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=720;const c=canvas.getContext('2d');const stream=canvas.captureStream(24);let au={stream:null,duration:0,cleanup:()=>{}};
    try{au=await getAudio();}catch(_){au={stream:null,duration:0,cleanup:()=>{}};} if(au.stream)au.stream.getAudioTracks().forEach(t=>stream.addTrack(t));
    const totalWords=items.reduce((n,s)=>n+Math.max(1,words(s.narration).length),0);const target=durationSeconds(length.value);const weights=items.map(s=>Math.max(1,words(s.narration).length));const sum=weights.reduce((a,b)=>a+b,0);const durations=items.map((s,i)=>au.duration?Math.max(2.5,au.duration*weights[i]/sum):Math.max(3,target*weights[i]/sum));const total=durations.reduce((a,b)=>a+b,0);const type=mimeType();
    let rec;try{rec=new MediaRecorder(stream,type?{mimeType:type,videoBitsPerSecond:2200000,audioBitsPerSecond:128000}:{videoBitsPerSecond:2200000});}catch(_){status.textContent='Video recording could not start on this browser. Try Chrome on Android or desktop.';videoBtn.disabled=false;state.textContent='Draft';au.cleanup();return;}
    const chunks=[];rec.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};rec.onerror=()=>{status.textContent='Video encoding stopped unexpectedly. Please try again.'};const stopped=new Promise(resolve=>rec.onstop=resolve);rec.start(250);
    if(au.play)try{await au.play();}catch(_){ }
    let completed=0;
    for(let i=0;i<items.length;i++){const d=durations[i],start=performance.now();while(performance.now()-start<d){const p=Math.min(1,(performance.now()-start)/d);const caption=words(items[i].narration).slice(Math.floor(p* Math.max(0,words(items[i].narration).length-1)/2),Math.floor(p* Math.max(0,words(items[i].narration).length-1)/2)+8).join(' ');frame(c,items[i],i,items.length,p,caption);const percent=Math.round((completed+p*d)/total*100);status.textContent=`Rendering scene ${i+1} of ${items.length} • ${percent}%`;await new Promise(requestAnimationFrame);}completed+=d;}
    if(au.a){au.a.pause();au.a.currentTime=0;}rec.stop();await stopped;stream.getTracks().forEach(t=>t.stop());au.cleanup();const blob=new Blob(chunks,{type:rec.mimeType||type||'video/webm'});if(!blob.size){status.textContent='No video data was produced. Please try again.';videoBtn.disabled=false;return;}
    outputUrl=URL.createObjectURL(blob);preview.src=outputUrl;preview.hidden=false;preview.load();download.href=outputUrl;const ext=(rec.mimeType||type||'').includes('mp4')?'mp4':'webm';download.download=`anteneh-ai-studio-${Date.now()}.${ext}`;download.textContent=`Download ${ext.toUpperCase()} video (${Math.max(1,Math.round(blob.size/1024/1024*10)/10)} MB)`;download.hidden=false;state.textContent='Video ready';status.textContent=au.stream?`Video ready • ${ext.toUpperCase()} • narration included.`:`Video ready • ${ext.toUpperCase()} • no narration audio was recorded for this video.`;videoBtn.disabled=false;
  }

  // Make this file the single authoritative event owner. Capture phase prevents older renderer layers from racing it.
  document.addEventListener('click', e => {
    if(e.target.closest('#createBtn')){
      e.preventDefault();e.stopImmediatePropagation();
      const topic=clean(prompt.value);if(!topic){prompt.focus();note.textContent='We could not create the lesson. Please enter a topic or script and try again.';return;}
      createBtn.disabled=true;createBtn.textContent='Building lesson…';state.textContent='Creating';note.textContent='Building a topic-driven educational lesson locally — no API key or paid service.';
      setTimeout(()=>{const scenes=buildLesson();if(!scenes){note.textContent='We could not create the lesson. Please enter a topic or script and try again.';createBtn.disabled=false;return;}renderScenes(scenes);localStorage.setItem(storageKey,JSON.stringify({version:2,topic:clean(prompt.value),length:length.value,style:style.value,scenes}));state.textContent='Lesson ready';note.textContent=`Lesson ready: ${scenes.length} scenes created from “${topic.slice(0,70)}${topic.length>70?'…':''}”. Review them, then generate the video.`;createBtn.disabled=false;createBtn.textContent='Generate again →';},80);
    } else if(e.target.closest('#videoBtn')){
      e.preventDefault();e.stopImmediatePropagation();renderVideo().catch(err=>{console.error(err);status.textContent='Rendering failed. Please try again.';videoBtn.disabled=false;state.textContent='Draft';});
    }
  }, true);

  $('saveBtn')?.addEventListener('click',save);
  if(!load()) { const starter=buildLesson(); if(starter) renderScenes(starter); }
})();
