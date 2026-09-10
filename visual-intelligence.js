(() => {
  const GENERIC = /show an example|show a diagram|simple diagram|visual example|show the process|visual explanation/i;

  const topicWords = (scene) => {
    const stop = new Set('the a an and or of to in on for with from is are be this that it its as by into how what why when where which their they them you your our we can will should about'.split(' '));
    return `${scene.title} ${scene.narration}`.replace(/[^a-z0-9\s-]/gi, ' ').split(/\s+/).filter(w => w.length > 3 && !stop.has(w.toLowerCase())).slice(0, 5);
  };

  const classify = (scene) => {
    const text = `${scene.title} ${scene.narration}`.toLowerCase();
    if (/timeline|history|year|century|era|before|after|ancient|historical/.test(text)) return 'timeline';
    if (/cycle|water cycle|carbon cycle|life cycle|cell cycle|circular|repeat/.test(text)) return 'cycle';
    if (/cause|effect|because|leads to|results in|impact|consequence/.test(text)) return 'cause';
    if (/hierarchy|levels|classification|category|categories|types of|layers|organize/.test(text)) return 'hierarchy';
    if (/formula|equation|calculate|percentage|percent|number|math|finance|money|rate|ratio/.test(text)) return 'formula';
    if (/before|after|transform|change|improve|growth|conversion|turn.*into/.test(text)) return 'beforeafter';
    if (/compare|versus| vs\.? |difference|similar|pros|cons|advantage|disadvantage/.test(text)) return 'compare';
    if (/mistake|misconception|wrong|avoid|warning|common error|myth/.test(text)) return 'warning';
    if (/example|real-world|application|case study|imagine|for instance/.test(text)) return 'example';
    if (/step|process|how to|how it works|method|stage|first|second|third|then|finally/.test(text)) return 'steps';
    if (/recap|summary|takeaway|remember|key point|in short|conclusion/.test(text)) return 'recap';
    return 'concept';
  };

  const recipe = (scene, index) => {
    const mode = classify(scene);
    const n = index + 1;
    const words = topicWords(scene);
    const topic = words.slice(0, 3).join(' ') || 'the topic';
    if (mode === 'timeline') return `Visual ${n}: ${topic} timeline — 4 milestone cards arranged left-to-right; reveal each date/era with a moving progress line.`;
    if (mode === 'cycle') return `Visual ${n}: ${topic} cycle — circular 4-stage loop with arrows; animate one stage at a time and return to the starting point.`;
    if (mode === 'cause') return `Visual ${n}: cause → effect — show 2 causes feeding into the main event, then 2 consequences branching outward.`;
    if (mode === 'hierarchy') return `Visual ${n}: ${topic} hierarchy — top-level category connected to three lower levels/types using a clean tree diagram.`;
    if (mode === 'formula') return `Visual ${n}: formula focus — large equation/number relationship in the center, with labeled inputs on the left and result on the right.`;
    if (mode === 'beforeafter') return `Visual ${n}: before → after — two large side-by-side states connected by an animated transformation arrow; emphasize what changed.`;
    if (mode === 'steps') return `Visual ${n}: ${topic} 3-step flow — Start → Learn → Apply; animate the active step and connect each stage with arrows.`;
    if (mode === 'compare') return `Visual ${n}: ${topic} A vs B — two side-by-side cards with matching criteria; highlight the deciding difference.`;
    if (mode === 'warning') return `Visual ${n}: ${topic} mistake alert — warning symbol, incorrect idea on the left, corrected idea on the right.`;
    if (mode === 'example') return `Visual ${n}: ${topic} concept → real-world example — connect the abstract idea to a concrete everyday case.`;
    if (mode === 'recap') return `Visual ${n}: ${topic} 3-point recap — Remember, Use, Explain; reveal each takeaway one at a time.`;
    return `Visual ${n}: ${topic} concept map — place the main idea in the center and connect three supporting ideas around it.`;
  };

  const enhance = () => {
    document.querySelectorAll('.scene').forEach((node, index) => {
      const title = node.querySelector('.scene-title');
      const narration = node.querySelector('.scene-narration');
      const visual = node.querySelector('.scene-visual');
      if (!title || !narration || !visual) return;
      const current = visual.value.trim();
      if (!visual.dataset.smartEnhanced || GENERIC.test(current) || current.length < 45) {
        visual.value = recipe({ title: title.value, narration: narration.value }, index);
        visual.dataset.smartEnhanced = 'true';
        visual.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  };

  const start = () => {
    enhance();
    const list = document.querySelector('.story-list');
    if (list) new MutationObserver(() => setTimeout(enhance, 0)).observe(list, { childList: true, subtree: true });
    document.getElementById('createBtn')?.addEventListener('click', () => setTimeout(enhance, 40));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
