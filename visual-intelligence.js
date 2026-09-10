(() => {
  const GENERIC = /show an example|show a diagram|simple diagram|visual example|show the process|visual explanation/i;

  const classify = (scene) => {
    const text = `${scene.title} ${scene.narration}`.toLowerCase();
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
    if (mode === 'steps') return `Visual ${n}: 3-step flow — Start → Learn → Apply; animate the active step and connect each stage with arrows.`;
    if (mode === 'compare') return `Visual ${n}: A vs B comparison — two side-by-side cards, matching criteria, then highlight the deciding difference.`;
    if (mode === 'warning') return `Visual ${n}: mistake alert — warning symbol, incorrect idea on the left, corrected idea on the right.`;
    if (mode === 'example') return `Visual ${n}: concept → real-world example — show the abstract idea as a labeled node, then connect it to a concrete everyday case.`;
    if (mode === 'recap') return `Visual ${n}: 3-point recap — Remember, Use, Explain; reveal each takeaway one at a time.`;
    return `Visual ${n}: core concept map — place the main idea in the center and connect two supporting ideas around it.`;
  };

  const enhance = () => {
    document.querySelectorAll('.scene').forEach((node, index) => {
      const title = node.querySelector('.scene-title');
      const narration = node.querySelector('.scene-narration');
      const visual = node.querySelector('.scene-visual');
      if (!title || !narration || !visual || visual.dataset.smartEnhanced === 'true') return;
      const current = visual.value.trim();
      if (!current || GENERIC.test(current) || current.length < 45) {
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
    document.getElementById('createBtn')?.addEventListener('click', () => setTimeout(enhance, 30));
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
