(() => {
  const button = document.getElementById('videoBtn');
  const style = document.getElementById('style');
  if (!button || !style || document.getElementById('renderPolishBadge')) return;

  const badge = document.createElement('span');
  badge.id = 'renderPolishBadge';
  badge.className = 'render-style-badge';
  badge.setAttribute('aria-live', 'polite');
  badge.textContent = `Style: ${style.value}`;
  const panelHead = button.closest('.video-panel')?.querySelector('.panel-head');
  panelHead?.appendChild(badge);

  const update = () => {
    badge.textContent = `Style: ${style.value}`;
    badge.dataset.style = style.value.toLowerCase().replace(/\s+/g, '-');
  };
  style.addEventListener('change', update);
  update();

  const status = document.getElementById('videoStatus');
  const originalText = status?.textContent || '';
  if (status) {
    const observer = new MutationObserver(() => {
      const text = status.textContent || '';
      if (/Rendering scene/.test(text)) status.dataset.state = 'rendering';
      else if (/Video ready/.test(text)) status.dataset.state = 'ready';
      else if (/failed|error|silent/i.test(text)) status.dataset.state = 'attention';
      else status.dataset.state = 'idle';
    });
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    status.textContent = originalText;
  }
})();
