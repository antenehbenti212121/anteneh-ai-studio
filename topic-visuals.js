(() => {
  const list = document.querySelector('.story-list');
  if (!list) return;

  const topicWords = () => (document.getElementById('prompt')?.value || '').trim();
  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

  function classify(scene) {
    const text = `${scene.title} ${scene.narration} ${scene.visual}`.toLowerCase();
    if (/compare|comparison|versus|\bvs\b|difference|similar/.test(text)) return 'compare';
    if (/mistake|misconception|avoid|warning|error|wrong/.test(text)) return 'warning';
    if (/example|real-world|application|case study/.test(text)) return 'example';
    if (/recap|takeaway|summary|remember|closing/.test(text)) return 'recap';
    if (/step|process|how it works|how to|method|stages/.test(text)) return 'steps';
    return 'concept';
  }

  function topicPhrase(topic) {
    const text = clean(topic);
    return text.length > 72 ? `${text.slice(0, 72)}…` : text;
  }

  function makeVisual(scene, index, topic) {
    const mode = classify(scene);
    const shortTopic = topicPhrase(topic) || 'this topic';
    const map = {
      concept: `BIG IDEA: ${shortTopic} — central concept card with 2 supporting keywords.`,
      steps: `PROCESS: ${shortTopic} — three connected steps with numbered nodes and arrows.`,
      example: `EXAMPLE: ${shortTopic} — concept on the left, practical real-world example on the right.`,
      compare: `COMPARISON: ${shortTopic} — two side-by-side options with 3 key differences.`,
      warning: `MISTAKE CHECK: ${shortTopic} — highlight the common error, then show the correct idea.`,
      recap: `RECAP: ${shortTopic} — three memorable takeaway cards: remember, use, explain.`
    };
    return map[mode] || map.concept;
  }

  function enhance() {
    const topic = topicWords();
    if (!topic) return;
    const nodes = [...list.querySelectorAll('.scene')];
    nodes.forEach((node, index) => {
      const visual = node.querySelector('.scene-visual');
      const title = node.querySelector('.scene-title')?.value || '';
      if (!visual) return;
      const current = clean(visual.value);
      if (!current || node.dataset.topicEnhanced === topic) return;
      const scene = {
        title,
        narration: node.querySelector('.scene-narration')?.value || '',
        visual: current
      };
      visual.value = makeVisual(scene, index, topic);
      node.dataset.topicEnhanced = topic;
    });
  }

  const observer = new MutationObserver(() => setTimeout(enhance, 20));
  observer.observe(list, { childList: true, subtree: true });
  document.getElementById('prompt')?.addEventListener('input', () => {
    list.querySelectorAll('.scene').forEach(node => delete node.dataset.topicEnhanced);
  });
  setTimeout(enhance, 100);
})();
