(() => {
  const prompt = document.getElementById('prompt');
  const length = document.getElementById('length');
  const style = document.getElementById('style');
  const list = document.querySelector('.story-list');
  const create = document.getElementById('createBtn');
  if (!prompt || !length || !style || !list) return;

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
    if (/\b(why|cause|effect|impact|climate|pollution|greenhouse|history|war|revolution)\b/.test(s)) return 'cause';
    if (/\b(math|equation|algebra|geometry|fraction|physics|chemistry|biology|photosynthesis|science)\b/.test(s)) return 'science';
    if (/\b(compare|comparison|difference|versus|vs|better|pros|cons)\b/.test(s)) return 'compare';
    return 'concept';
  };
  const special = topic => {
    const s = topic.toLowerCase();
    if (/greenhouse effect/.test(s)) return [
      ['Hook','Why is Earth warm enough for life? The greenhouse effect is one important reason.','SUNLIGHT → EARTH → ATMOSPHERE: reveal the heat balance.'],
      ['What it is','Certain gases in Earth’s atmosphere absorb and re-radiate some heat leaving the surface.','Surface heat meets greenhouse gases; show absorption and re-radiation.'],
      ['How it works','Sunlight warms the surface, the surface releases heat, and some outgoing heat is absorbed and re-radiated by greenhouse gases.','SUNLIGHT → WARM SURFACE → OUTGOING HEAT → ATMOSPHERE.'],
      ['Why it matters','The natural greenhouse effect supports life, while increased greenhouse-gas concentrations strengthen warming and contribute to global warming.','Compare natural heat balance with increased greenhouse-gas influence.'],
      ['Recap','Remember: the greenhouse effect is natural, greenhouse gases regulate temperature, and human activity has increased their concentrations.','Three takeaway cards: NATURAL • HEAT BALANCE • HUMAN INFLUENCE.']
    ];
    if (/photosynthesis/.test(s)) return [
      ['Hook','How can a plant turn sunlight into the chemical energy it needs to grow? The answer is photosynthesis.','SUNLIGHT meets a green leaf; reveal the lesson title.'],
      ['Inputs','Plants use light energy, carbon dioxide from the air, and water absorbed by the roots.','LIGHT + CO₂ + WATER flow toward a leaf.'],
      ['Process','Inside chloroplasts, light energy drives a process that transforms water and carbon dioxide into glucose while oxygen is released.','LIGHT → LEAF → GLUCOSE + OXYGEN.'],
      ['Example','A houseplant near a window demonstrates the idea: light provides energy while roots supply water and leaves exchange gases.','Window + plant + roots + leaf gas exchange.'],
      ['Recap','Photosynthesis captures light energy and stores it in glucose, while releasing oxygen.','Three takeaway cards: LIGHT • GLUCOSE • OXYGEN.']
    ];
    return null;
  };
  const packs = {
    concept: [
      ['Hook', t => `Why should we care about ${t}? Start with a simple question or surprising idea.`, 'Opening question card.'],
      ['Core idea', t => `Define ${t} in clear, everyday language before adding detail.`, 'Central concept with three supporting ideas.'],
      ['How it works', t => `Break ${t} into its most important parts so the viewer can follow easily.`, 'Step-by-step concept diagram.'],
      ['Example', t => `Give a practical real-world example that makes ${t} easier to understand.`, 'Abstract idea → concrete example.'],
      ['Why it matters', t => `Explain where ${t} appears in real life and why it is useful.`, 'Three application cards.'],
      ['Recap', t => `Review the main points about ${t} in a few short sentences.`, 'Remember • Use • Explain.'],
      ['Closing', t => `End with one memorable sentence that encourages further learning about ${t}.`, 'Clean final statement.']
    ],
    cause: [
      ['Hook', t => `What is the key question behind ${t}? Start with the mystery or problem.`, 'Question card with a reveal.'],
      ['Core idea', t => `Define ${t} in plain language before explaining why it happens.`, 'Central concept map.'],
      ['Causes', t => `Explain the main causes or forces connected to ${t}.`, 'Three causes → central event.'],
      ['Effects', t => `Explain the most important effects of ${t} and why they matter.`, 'CAUSE → EVENT → EFFECT.'],
      ['Example', t => `Use one concrete example to make ${t} easier to understand.`, 'Real-world example with labels.'],
      ['Recap', t => `Summarize the relationship between causes, effects, and the central idea of ${t}.`, 'Three takeaway cards.'],
      ['Closing', t => `Finish with one memorable sentence that captures the lesson about ${t}.`, 'Key statement end card.']
    ],
    science: [
      ['Hook', t => `What happens when we look closely at ${t}? Start with a question the viewer can answer by the end.`, 'Question → zoom into the topic.'],
      ['Core idea', t => `Define ${t} using everyday language before introducing technical terms.`, 'Central concept card.'],
      ['How it works', t => `Explain ${t} from beginning to end in clear stages.`, 'Numbered process diagram.'],
      ['Example', t => `Connect ${t} to something the viewer can observe in real life.`, 'Labeled real-world example.'],
      ['Why it matters', t => `Explain why ${t} is useful and what it helps us understand.`, 'Three application cards.'],
      ['Recap', t => `Repeat the three most important facts about ${t}.`, 'Three-point recap.'],
      ['Closing', t => `End with a curiosity question that invites further learning about ${t}.`, 'Curiosity end card.']
    ],
    howto: [
      ['Hook', t => `What result do we want from ${t}? Start with the outcome.`, 'Finished result → lesson title.'],
      ['What you need', t => `Introduce the key ideas, tools, or information needed before starting ${t}.`, 'Animated checklist.'],
      ['Step by step', t => `Walk through the most important steps of ${t} in the correct order.`, 'START → LEARN → APPLY.'],
      ['Common mistake', t => `Point out one common mistake related to ${t} and explain the correction.`, 'MISTAKE → CORRECTION.'],
      ['Example', t => `Show a practical example of ${t} so the method connects to real life.`, 'Inputs → result.'],
      ['Recap', t => `Review the method for ${t} in a compact sequence the viewer can remember.`, 'Three-step recap.'],
      ['Closing', t => `End with one simple action the viewer can take to practice ${t}.`, 'Practice challenge.']
    ],
    compare: [
      ['Hook', t => `What is the key difference we need to understand about ${t}?`, 'Split-screen comparison.'],
      ['Option A', t => `Explain the first side of ${t} in simple terms.`, 'Focused A card.'],
      ['Option B', t => `Explain the second side of ${t} using the same structure.`, 'Focused B card.'],
      ['Side by side', t => `Compare the most important features of ${t} directly.`, 'Animated comparison table.'],
      ['Best fit', t => `Explain when each option makes more sense depending on the goal.`, 'Two-branch decision path.'],
      ['Takeaway', t => `Summarize the biggest difference and best fit for each side of ${t}.`, 'Two-column takeaway.'],
      ['Closing', t => `End with a short decision rule the viewer can remember.`, 'One-sentence rule.']
    ]
  };
  function placeholder() {
    const titles = [...list.querySelectorAll('.scene-title')].map(x => clean(x.value).toLowerCase());
    return !titles.length || titles.every(x => ['hook','core idea','visual example','recap'].includes(x));
  }
  function render(scenes) {
    list.innerHTML = scenes.map((x,i) => `<article class="scene${i===0?' active':''}"><span class="scene-num">${String(i+1).padStart(2,'0')}</span><div class="scene-content"><input class="scene-title" value="${esc(x.title)}" aria-label="Scene title"><textarea class="scene-narration" aria-label="Scene narration">${esc(x.narration)}</textarea><input class="scene-visual" value="${esc(x.visual)}" aria-label="Visual direction"></div></article>`).join('');
    list.querySelectorAll('.scene').forEach(n => n.addEventListener('click', () => { list.querySelectorAll('.scene').forEach(x => x.classList.remove('active')); n.classList.add('active'); }));
    list.dataset.lessonTopic = clean(prompt.value);
  }
  function build() {
    const raw = clean(prompt.value); if (!raw) return false;
    const topic = topicFrom(raw), pack = special(topic), base = pack || packs[kind(topic)].map(([title,narration,visual]) => [title,narration(topic),visual]);
    const target = length.value === '5 min' ? 7 : length.value === '2 min' ? 6 : 5;
    const chosen = base.slice(0,target); while (chosen.length < target) chosen.push(base[base.length-1]);
    render(chosen.map(x => ({title:x[0], narration:x[1], visual:`${x[2]} Style: ${style.value}. Topic: ${topic}.`})));
    const note = document.getElementById('formNote'); if (note) note.textContent = `Lesson ready: ${topic} • ${chosen.length} scenes synced to the renderer.`;
    return true;
  }
  create?.addEventListener('click', () => setTimeout(build, 20));
  document.addEventListener('click', e => {
    if (!e.target.closest('#videoBtn')) return;
    const topic = clean(prompt.value);
    if (topic && (placeholder() || list.dataset.lessonTopic !== topic)) setTimeout(build, 0);
  }, true);
  window.antenehEnsureLesson = () => {
    const topic = clean(prompt.value);
    return topic && (placeholder() || list.dataset.lessonTopic !== topic) ? build() : true;
  };
  if (!placeholder() && !list.dataset.lessonTopic) list.dataset.lessonTopic = clean(prompt.value);
})();
