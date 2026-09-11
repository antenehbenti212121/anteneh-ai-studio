(() => {
  'use strict';
  const list = document.querySelector('.story-list');
  if (!list) return;

  const $ = id => document.getElementById(id);
  const clean = v => String(v ?? '').replace(/\s+/g, ' ').trim();
  const words = v => clean(v).split(/\s+/).filter(Boolean);
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const typeFrom = scene => {
    const t = clean(`${scene.title} ${scene.narration} ${scene.visual}`).toLowerCase();
    if (/recap|summary|remember|takeaway/.test(t)) return 'recap';
    if (/warning|mistake|misconception|error|avoid/.test(t)) return 'warning';
    if (/compare|comparison|versus|difference|option|side by side/.test(t)) return 'comparison';
    if (/example|real world|case|application/.test(t)) return 'example';
    if (/cause|effect|impact|leads to|because/.test(t)) return 'cause-effect';
    if (/step|process|how it works|method|stages|sequence/.test(t)) return 'process';
    if (/input|ingredient|component|parts/.test(t)) return 'inputs';
    return 'concept';
  };

  const topicKind = text => {
    const t = clean(text).toLowerCase();
    if (/greenhouse effect/.test(t)) return 'greenhouse';
    if (/photosynthesis/.test(t)) return 'photosynthesis';
    if (/volcano|eruption|magma/.test(t)) return 'volcano';
    if (/water cycle|hydrologic cycle/.test(t)) return 'cycle';
    if (/food chain|food web/.test(t)) return 'foodweb';
    if (/cell|mitosis|meiosis|dna/.test(t)) return 'biology';
    if (/equation|formula|math|algebra|geometry|fraction|percentage/.test(t)) return 'formula';
    return 'general';
  };

  const extractKeywords = scene => {
    const stop = new Set('the a an and or but for to of in on with from into about this that is are was were be been it its as by at through using use used how what why when where which who your you they their them we our can may will should very more most than then also simple explain lesson idea important one reason something called'.split(' '));
    const seen = new Set();
    return words(`${scene.title} ${scene.narration} ${scene.visual}`)
      .map(x => x.replace(/[^\p{L}\p{N}%'-]/gu, ''))
      .filter(x => x.length > 3 && !stop.has(x.toLowerCase()))
      .filter(x => { const k=x.toLowerCase(); if(seen.has(k)) return false; seen.add(k); return true; })
      .slice(0, 6);
  };

  function enrichScene(scene, index, all) {
    const type = typeFrom(scene);
    const topic = clean($('prompt')?.value) || list.dataset.lessonTopic || 'this topic';
    const kind = topicKind(topic);
    const k = extractKeywords(scene);
    const focus = {
      concept: 'Make the central idea visible with one dominant object and supporting relationships.',
      process: 'Show change over time with a clear left-to-right or top-to-bottom sequence.',
      inputs: 'Separate the inputs, show where they come from, then converge on the system.',
      'cause-effect': 'Make the causal chain explicit: condition → change → consequence.',
      comparison: 'Use matched visual regions so differences are immediately scannable.',
      example: 'Bridge the abstract idea to one concrete situation the learner can recognize.',
      warning: 'Visually contrast the misconception with the correct mental model.',
      recap: 'Reduce the lesson to three memorable takeaways without introducing new information.'
    }[type] || 'Keep one clear educational idea on screen at a time.';

    const domainVisuals = {
      greenhouse: {
        concept: 'SUN → EARTH → ATMOSPHERE • show incoming sunlight and outgoing infrared heat',
        process: 'SUNLIGHT → SURFACE WARMS → INFRARED HEAT → ATMOSPHERE → RE-RADIATION',
        inputs: 'SUNLIGHT + ATMOSPHERE + GREENHOUSE GASES → EARTH ENERGY BALANCE',
        'cause-effect': 'HUMAN ACTIVITY → MORE GREENHOUSE GASES → LESS HEAT ESCAPES → WARMING',
        comparison: 'NATURAL GREENHOUSE EFFECT ↔ STRENGTHENED EFFECT FROM HIGHER GHG CONCENTRATIONS',
        example: 'EARTH ENERGY SYSTEM • sunlight enters → surface emits heat → gases affect escape',
        warning: 'MISCONCEPTION: greenhouse effect is not the same as the ozone hole • show the distinction',
        recap: 'SUNLIGHT • HEAT BALANCE • GREENHOUSE GASES • HUMAN INFLUENCE'
      },
      photosynthesis: {
        concept: 'LEAF / CHLOROPLAST • sunlight powers the conversion of CO₂ and water into stored chemical energy',
        process: 'SUNLIGHT + CO₂ + H₂O → CHLOROPLAST → GLUCOSE + O₂',
        inputs: 'SUNLIGHT + CARBON DIOXIDE + WATER → LEAF',
        'cause-effect': 'LIGHT ENERGY → CHEMICAL REACTIONS → GLUCOSE STORED + OXYGEN RELEASED',
        comparison: 'INPUTS ↔ OUTPUTS • light, CO₂, water ↔ glucose and oxygen',
        example: 'HOUSEPLANT BY A WINDOW • light → leaves • roots → water • air → CO₂',
        warning: 'MISCONCEPTION: plants do not get their food directly from soil • photosynthesis makes glucose',
        recap: 'LIGHT • CO₂ • WATER → GLUCOSE + OXYGEN'
      },
      volcano: {
        concept: 'MAGMA CHAMBER → PRESSURE → VENT → ERUPTION',
        process: 'MAGMA RISES → PRESSURE CHANGES → GASES EXPAND → VENT OPENS → ERUPTION',
        inputs: 'MAGMA + DISSOLVED GASES + PRESSURE → VOLCANIC SYSTEM',
        'cause-effect': 'PRESSURE / GAS EXPANSION → MAGMA MOVEMENT → SURFACE ERUPTION',
        comparison: 'EFFUSIVE ERUPTION ↔ EXPLOSIVE ERUPTION • lava flow ↔ ash and fragments',
        example: 'CROSS-SECTION OF VOLCANO • chamber → conduit → vent → lava / ash / gases',
        warning: 'MISCONCEPTION: magma is underground; once it reaches the surface it is called lava',
        recap: 'MAGMA • PRESSURE • GASES • VENT → ERUPTION'
      }
    };

    const visual = domainVisuals[kind]?.[type] || `${type.toUpperCase()} • ${focus}`;
    const shot = type === 'concept' ? 'Hero diagram with slow camera push-in' : type === 'process' ? 'Progressive sequence with directional motion' : type === 'comparison' ? 'Split-screen comparison with synchronized reveals' : type === 'warning' ? 'High-contrast misconception → correction reveal' : type === 'recap' ? 'Three-card recap with staggered entrances' : 'Focused educational diagram with subtle parallax';
    return { ...scene, visual, visualType: type, keywords: k, shot, teachingIntent: focus, sequenceIndex: index, sequenceTotal: all.length };
  }

  function improve() {
    const nodes = [...list.querySelectorAll('.scene')];
    if (!nodes.length || !nodes[0].querySelector('.scene-title')) return;
    const raw = nodes.map((n,i) => ({
      title: clean(n.querySelector('.scene-title')?.value) || `Scene ${i+1}`,
      narration: clean(n.querySelector('.scene-narration')?.value),
      visual: clean(n.querySelector('.scene-visual')?.value),
      visualType: clean(n.querySelector('.scene-meta span')?.textContent) || 'concept'
    }));
    raw.forEach((scene,i) => {
      const e = enrichScene(scene,i,raw);
      const visual = nodes[i].querySelector('.scene-visual');
      if (visual && (!visual.dataset.userEdited || visual.value === scene.visual || !scene.visual)) visual.value = e.visual;
      const meta = nodes[i].querySelector('.scene-meta');
      if (meta) {
        const spans = meta.querySelectorAll('span');
        if (spans[0]) spans[0].textContent = e.visualType;
        if (spans[1]) spans[1].textContent = scene.duration ? `${scene.duration}s` : (spans[1].textContent || '6s');
      }
      nodes[i].dataset.cinematicType = e.visualType;
      nodes[i].dataset.teachingIntent = e.teachingIntent;
      nodes[i].dataset.shot = e.shot;
      nodes[i].dataset.keywords = e.keywords.join('|');
      nodes[i].classList.add('cinematic-scene');
    });
    list.classList.add('cinematic-storyboard');
  }

  list.addEventListener('input', e => { if(e.target.matches('.scene-visual')) e.target.dataset.userEdited='1'; });
  new MutationObserver(() => setTimeout(improve, 30)).observe(list,{childList:true,subtree:true});
  $('prompt')?.addEventListener('input', () => setTimeout(improve,40));
  document.addEventListener('anteneh:statechange', () => setTimeout(improve,40));
  setTimeout(improve,150);
})();
