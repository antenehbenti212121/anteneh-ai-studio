(() => {
  const style = document.getElementById('style');
  const formNote = document.getElementById('formNote');
  if (!style) return;

  const modes = {
    'Clean explainer': 'Explainer presentation',
    'Whiteboard': 'Whiteboard lesson',
    'Modern presentation': 'Modern lesson',
    'Minimal motion graphics': 'Motion lesson'
  };

  const refresh = () => {
    const label = modes[style.value] || 'Explainer presentation';
    style.dataset.educationMode = label;
    if (formNote && !formNote.dataset.busy) {
      formNote.textContent = `${label} mode selected — scenes, diagrams, motion and narration timing adapt to the lesson.`;
    }
  };

  style.addEventListener('change', refresh);
  refresh();
})();
