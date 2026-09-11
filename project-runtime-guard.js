(() => {
  const prompt = document.getElementById('prompt');
  const length = document.getElementById('length');
  const style = document.getElementById('style');
  const list = document.querySelector('.story-list');
  if (!prompt || !length || !style || !list) return;

  // The public UI has one Generate Video action, but the rendering engines
  // still use the legacy videoBtn internally. Keep that control in the DOM,
  // hidden from users, so every renderer remains compatible.
  let videoBtn = document.getElementById('videoBtn');
  if (!videoBtn) {
    videoBtn = document.createElement('button');
    videoBtn.id = 'videoBtn';
    videoBtn.type = 'button';
    videoBtn.textContent = 'Render video';
    videoBtn.className = 'studio-hidden-control';
    const output = document.getElementById('videoOutput');
    (output || document.body).appendChild(videoBtn);
  }

  const clean = v => String(v || '').replace(/\s+/g, ' ').trim();
  const esc = v => String(v ?? '').replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const fullScript = text => clean(text).split(/\s+/).filter(Boolean).length > 35 || /scene\s*\d|narration:/i.test(text);
  const topicFrom = text => {
    const s = clean(text);
    if (!fullScript(s)) return s;
    const first = s.split(/[.!?]/).map(clean).find(x => x.length >= 8 && x.length <= 110);
    return first || s.slice(0, 100);
  };
  const kind = topic => {
    const s = topic.toLowerCase();
    if (/\b(how to|tutorial|learn|make|build|install|guide|steps?)\b/.test(s)) return 'howto';
    if (/\b(why|cause|effect|impact|climate|pollution|greenhouse|history|war|revolution|volcano)\b/.test(s)) return 'cause';
    if (/\b(math|equation|algebra|geometry|fraction|physics|chemistry|biology|photosynthesis|science)\b/.test(s)) return 'science';
    if (/\b(compare|comparison|difference|versus|vs|better|pros|cons)\b/.test(s)) return 'compare';
    return 'concept';
  };

  const special = topic => {
    const s = topic.toLowerCase();
    if (/greenhouse effect/.test(s)) return [
      ['Hook','Why is Earth warm enough for life? The greenhouse effect is one important reason.','SUNLIGHT → EARTH → ATMOSPHERE: introduce the heat balance.','concept'],
      ['What is the greenhouse effect?','The greenhouse effect is the natural process in which gases in Earth’s atmosphere absorb and re-radiate some heat leaving the surface.','EARTH SURFACE + ATMOSPHERE: greenhouse gases absorb outgoing heat and re-radiate it.','cause'],
      ['Sunlight and heat','Sunlight passes through the atmosphere and warms Earth’s surface. The warmed surface then emits infrared heat upward.','SUNLIGHT ↓ SURFACE ↑ INFRARED HEAT: animate energy moving in opposite directions.','process'],
      ['Greenhouse gases','Water vapor, carbon dioxide, methane and other greenhouse gases interact with outgoing infrared energy, helping retain heat in the Earth system.','ATMOSPHERE: H₂O • CO₂ • CH₄ → absorb/re-radiate infrared heat.','concept'],
      ['Why the natural effect matters','Without the natural greenhouse effect, Earth would be much colder. It helps maintain temperatures suitable for life.','NATURAL HEAT BALANCE: compare a colder Earth with the life-supporting range.','compare'],
      ['Human influence','Human activities have increased concentrations of several greenhouse gases, strengthening the greenhouse effect and contributing to global warming.','HUMAN ACTIVITIES → MORE GREENHOUSE GASES → MORE HEAT RETAINED.','cause'],
      ['Real-world example','A warmer atmosphere changes the balance of incoming and outgoing energy. The greenhouse effect is about energy balance, not a solid glass roof around Earth.','ENERGY BALANCE: incoming sunlight vs outgoing infrared heat.','example'],
      ['Recap','Remember: the greenhouse effect is natural, greenhouse gases regulate Earth’s temperature, and human activity has increased their concentrations.','NATURAL EFFECT • GREENHOUSE GASES • HUMAN INFLUENCE','recap']
    ];
    if (/photosynthesis/.test(s)) return [
      ['Hook','How can a plant turn sunlight into the chemical energy it needs to grow? The answer is photosynthesis.','SUNLIGHT → GREEN LEAF: reveal the question and answer.','concept'],
      ['Inputs','Plants use light energy, carbon dioxide from the air, and water absorbed by the roots.','SUNLIGHT + CO₂ + WATER → LEAF','process'],
      ['Inside the leaf','In plant cells, chloroplasts contain chlorophyll and the machinery that captures light energy for photosynthesis.','LEAF → CHLOROPLAST → LIGHT ENERGY','concept'],
      ['The process','Light energy drives chemical reactions that transform water and carbon dioxide into glucose, while oxygen is released.','6CO₂ + 6H₂O + LIGHT → C₆H₁₂O₆ + 6O₂','formula'],
      ['Where the materials come from','Carbon dioxide enters through tiny openings in leaves, while water travels upward from the roots through the plant.','AIR CO₂ → LEAF ↔ ROOT WATER → LEAF','process'],
      ['Why it matters','Photosynthesis stores captured light energy in glucose and releases oxygen, supporting plants and much of life on Earth.','LIGHT ENERGY → GLUCOSE + OXYGEN','cause'],
      ['Recap','Photosynthesis captures light energy and stores it in glucose using carbon dioxide and water, while releasing oxygen.','LIGHT • CO₂ • WATER → GLUCOSE • OXYGEN','recap']
    ];
    if (/volcano/.test(s)) return [
      ['Hook','What makes a volcano erupt? Deep underground, heat and pressure drive molten rock toward the surface.','EARTH CROSS-SECTION → MAGMA CHAMBER → VENT','concept'],
      ['Magma chamber','Magma can collect in a reservoir beneath a volcano. Pressure and changing conditions can help drive magma upward.','MAGMA CHAMBER: molten rock accumulates beneath the volcano.','cause'],
      ['Pressure builds','As magma rises, dissolved gases can expand and pressure can increase. The surrounding rock and magma system respond to these forces.','MAGMA + EXPANDING GASES → PRESSURE ↑','process'],
      ['The vent','A vent is an opening or pathway through which magma and volcanic gases can move toward the surface.','MAGMA CHAMBER → CONDUIT/VENT → SURFACE','process'],
      ['The eruption','When magma and gas reach the surface, an eruption can release lava, ash, rock fragments and volcanic gases.','VENT → LAVA + ASH + GASES','cause'],
      ['Different eruption styles','Some eruptions produce flowing lava, while others can be explosive when gas-rich magma fragments violently.','EFFUSIVE LAVA ↔ EXPLOSIVE ASH: compare eruption styles.','compare'],
      ['Real-world view','A volcano is part of a larger geologic system. Its shape, magma chemistry, gas content and local geology influence how it erupts.','VOLCANO SYSTEM: MAGMA • GAS • ROCK • GEOLOGY','example'],
      ['Recap','A volcano can erupt when magma and its gases move upward through a volcanic system and reach the surface, releasing lava, ash and gases.','MAGMA → PRESSURE → VENT → ERUPTION','recap']
    ];
    return null;
  };

  const packs = {
    concept:[
      ['Hook',t=>`Why should we care about ${t}? Start with a question that the lesson will answer.`,'QUESTION → TOPIC','concept'],
      ['Core idea',t=>`Define ${t} in clear, everyday language before adding detail.`,'CENTRAL IDEA with three supporting concepts.','concept'],
      ['How it works',t=>`Break ${t} into its most important parts so the viewer can follow the relationship.`,'PART 1 → PART 2 → PART 3','process'],
      ['Example',t=>`Give a concrete example that makes ${t} easier to understand.`,'CONCEPT → REAL-WORLD EXAMPLE','example'],
      ['Why it matters',t=>`Explain where ${t} appears in real life and why understanding it is useful.`,'IDEA → APPLICATION → RESULT','cause'],
      ['Recap',t=>`Review the main points about ${t} in a few short sentences.`,'KEY POINT 1 • KEY POINT 2 • KEY POINT 3','recap'],
      ['Closing',t=>`End with one memorable sentence that encourages further learning about ${t}.`,'REMEMBER THE CENTRAL IDEA','concept']
    ],
    cause:[
      ['Hook',t=>`What is the key question behind ${t}? Start with the mystery or problem.`,'QUESTION → INVESTIGATION','concept'],
      ['Core idea',t=>`Define ${t} in plain language before explaining why it happens.`,'CENTRAL EVENT with labeled context.','concept'],
      ['Causes',t=>`Explain the main causes or forces connected to ${t}.`,'CAUSE A + CAUSE B → EVENT','cause'],
      ['Effects',t=>`Explain the most important effects of ${t} and why they matter.`,'CAUSE → EVENT → EFFECT','cause'],
      ['Example',t=>`Use one concrete example to make ${t} easier to understand.`,'REAL-WORLD CASE → OUTCOME','example'],
      ['Recap',t=>`Summarize the relationship between causes, effects, and the central idea of ${t}.`,'CAUSES • EVENT • EFFECTS','recap'],
      ['Closing',t=>`Finish with one memorable sentence that captures the lesson about ${t}.`,'KEY RELATIONSHIP','concept']
    ],
    science:[
      ['Hook',t=>`What happens when we look closely at ${t}? Start with a question the viewer can answer by the end.`,'QUESTION → OBSERVATION','concept'],
      ['Core idea',t=>`Define ${t} using everyday language before introducing technical terms.`,'CENTRAL CONCEPT + LABELS','concept'],
      ['How it works',t=>`Explain ${t} from beginning to end in clear stages.`,'STAGE 1 → STAGE 2 → STAGE 3','process'],
      ['Example',t=>`Connect ${t} to something the viewer can observe in real life.`,'SCIENCE → OBSERVABLE EXAMPLE','example'],
      ['Why it matters',t=>`Explain why ${t} is useful and what it helps us understand.`,'PROCESS → RESULT → USE','cause'],
      ['Recap',t=>`Repeat the three most important facts about ${t}.`,'FACT 1 • FACT 2 • FACT 3','recap'],
      ['Closing',t=>`End with a curiosity question that invites further learning about ${t}.`,'NEXT QUESTION','concept']
    ],
    howto:[
      ['Hook',t=>`What result do we want from ${t}? Start with the outcome.`,'GOAL → METHOD','concept'],
      ['What you need',t=>`Introduce the key ideas, tools, or information needed before starting ${t}.`,'REQUIREMENT 1 • 2 • 3','hierarchy'],
      ['Step by step',t=>`Walk through the most important steps of ${t} in the correct order.`,'STEP 1 → STEP 2 → STEP 3','process'],
      ['Common mistake',t=>`Point out one common mistake related to ${t} and explain the correction.`,'MISTAKE → CORRECTION','warning'],
      ['Example',t=>`Show a practical example of ${t} so the method connects to real life.`,'INPUT → METHOD → RESULT','example'],
      ['Recap',t=>`Review the method for ${t} in a compact sequence the viewer can remember.`,'STEP 1 • STEP 2 • STEP 3','recap'],
      ['Closing',t=>`End with one simple action the viewer can take to practice ${t}.`,'PRACTICE CHALLENGE','concept']
    ],
    compare:[
      ['Hook',t=>`What is the key difference we need to understand about ${t}?`,'A ↔ B: identify the comparison.','compare'],
      ['Option A',t=>`Explain the first side of ${t} in simple terms.`,'OPTION A with labeled features.','compare'],
      ['Option B',t=>`Explain the second side of ${t} using the same structure.`,'OPTION B with matching features.','compare'],
      ['Side by side',t=>`Compare the most important features of ${t} directly.`,'A | FEATURE | B comparison.','compare'],
      ['Best fit',t=>`Explain when each option makes more sense depending on the goal.`,'GOAL → A or B','compare'],
      ['Takeaway',t=>`Summarize the biggest difference and best fit for each side of ${t}.`,'A: BEST FOR… • B: BEST FOR…','recap'],
      ['Closing',t=>`End with a short decision rule the viewer can remember.`,'CHOOSE BASED ON THE GOAL','concept']
    ]
  };

  const placeholder = () => {
    const titles = [...list.querySelectorAll('.scene-title')].map(x=>clean(x.value).toLowerCase());
    return !titles.length || titles.every(x=>['hook','core idea','visual example','recap'].includes(x));
  };

  function render(scenes, topic) {
    list.innerHTML = scenes.map((x,i)=>`<article class="scene${i===0?' active':''}" data-scene-type="${esc(x.type || 'concept')}"><span class="scene-num">${String(i+1).padStart(2,'0')}</span><div class="scene-content"><input class="scene-title" value="${esc(x.title)}" aria-label="Scene title"><textarea class="scene-narration" aria-label="Scene narration">${esc(x.narration)}</textarea><input class="scene-visual" value="${esc(x.visual)}" aria-label="Visual direction"><input type="hidden" class="scene-caption" value="${esc(x.caption || x.narration)}"></div></article>`).join('');
    list.querySelectorAll('.scene').forEach(n=>n.addEventListener('click',()=>{list.querySelectorAll('.scene').forEach(x=>x.classList.remove('active'));n.classList.add('active');}));
    list.dataset.lessonTopic = topic;
    list.dataset.lessonVersion = '2';
  }

  function build() {
    const raw = clean(prompt.value);
    if (!raw) return false;
    const topic = topicFrom(raw);
    const specialPack = special(topic);
    const base = specialPack || packs[kind(topic)].map(([title,narration,visual,type])=>[title,narration(topic),visual,type]);
    const target = length.value === '5 min' ? 8 : length.value === '2 min' ? 6 : 5;
    const chosen = base.slice(0,target);
    while (chosen.length < target) chosen.push(base[base.length-1]);
    const scenes = chosen.map(x=>({title:x[0], narration:x[1], visual:`${x[2]} Style: ${style.value}. Topic: ${topic}.`, type:x[3], caption:x[1]}));
    render(scenes, topic);
    const note=document.getElementById('formNote');
    if(note) note.textContent=`Lesson ready: ${topic} • ${scenes.length} topic-specific scenes created locally.`;
    try { localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({topic:raw,length:length.value,style:style.value,scenes})); } catch(_) {}
    return true;
  }

  createBtn?.addEventListener('click',()=>setTimeout(build,20));
  document.addEventListener('click',e=>{
    if(!e.target.closest('#videoBtn')) return;
    const raw = clean(prompt.value);
    if(raw && (placeholder() || list.dataset.lessonTopic !== topicFrom(raw) || list.dataset.lessonVersion !== '2')) build();
  },true);
  window.antenehEnsureLesson=()=>{const raw=clean(prompt.value);return raw && (placeholder() || list.dataset.lessonTopic !== topicFrom(raw) || list.dataset.lessonVersion !== '2') ? build() : true;};
  if(!placeholder()&&!list.dataset.lessonTopic) list.dataset.lessonTopic=topicFrom(prompt.value);
})();

// Reliable download fallback: if any renderer creates a blob URL for the
// preview but forgets to expose the download link, expose it automatically.
(() => {
  const preview = document.getElementById('videoPreview');
  const download = document.getElementById('downloadVideo');
  const output = document.getElementById('videoOutput');
  if (!preview || !download) return;

  const syncDownload = () => {
    const src = preview.currentSrc || preview.src || '';
    if (!src || !/^blob:|^data:/.test(src)) return;
    download.href = src;
    download.download = 'anteneh-ai-studio-video.webm';
    download.textContent = 'Download video';
    download.hidden = false;
    download.style.display = 'inline-flex';
    if (output) output.classList.add('output-ready');
  };

  new MutationObserver(syncDownload).observe(preview, {attributes:true, attributeFilter:['src']});
  preview.addEventListener('loadedmetadata', syncDownload);
  preview.addEventListener('loadeddata', syncDownload);
  window.addEventListener('antene:video-ready', syncDownload);
  setInterval(syncDownload, 500);
})();