(() => {
  const button = document.getElementById('videoBtn');
  const style = document.getElementById('style');
  if (!button || !style || document.getElementById('renderPolishBadge')) return;

  const badge = document.createElement('span');
  badge.id = 'renderPolishBadge';
  badge.className = 'render-style-badge';
  badge.setAttribute('aria-live', 'polite');
  badge.textContent = `Style: ${style.value}`;
  const panel = button.closest('.video-panel');
  const panelHead = panel?.querySelector('.panel-head');
  panelHead?.appendChild(badge);

  const styleTag = document.createElement('style');
  styleTag.textContent = `
    .render-style-badge{margin-left:auto;display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border:1px solid rgba(255,255,255,.1);border-radius:999px;background:rgba(255,255,255,.035);color:#cbd1df;font-size:10px;font-weight:800;transition:.2s ease}
    .render-style-badge[data-style="whiteboard"]{background:rgba(255,255,255,.08);color:#f4ead4;border-color:rgba(245,222,179,.2)}
    .render-style-badge[data-style="modern-presentation"]{background:rgba(139,92,246,.1);color:#ddd5ff;border-color:rgba(139,92,246,.22)}
    .render-style-badge[data-style="minimal-motion-graphics"]{background:rgba(34,211,238,.07);color:#c7f5fa;border-color:rgba(34,211,238,.18)}
    .render-style-badge[data-style="clean-explainer"]{background:rgba(99,102,241,.09);color:#d8dcff;border-color:rgba(99,102,241,.2)}
    .video-panel[data-render-style="whiteboard"]{background:linear-gradient(180deg,rgba(40,38,31,.92),rgba(20,19,17,.96))}
    .video-panel[data-render-style="modern-presentation"]{box-shadow:0 28px 90px rgba(77,55,150,.18)}
    .video-panel[data-render-style="minimal-motion-graphics"]{background:linear-gradient(180deg,rgba(18,27,38,.94),rgba(10,16,25,.97))}
    .video-status[data-state="rendering"]{color:#c8c1ff}
    .video-status[data-state="ready"]{color:#62dfb1}
    .video-status[data-state="attention"]{color:#ffabb7}
    @media(prefers-reduced-motion:reduce){.render-style-badge{transition:none}}
  `;
  document.head.appendChild(styleTag);

  const update = () => {
    const key = style.value.toLowerCase().replace(/\s+/g, '-');
    badge.textContent = `Style: ${style.value}`;
    badge.dataset.style = key;
    if (panel) panel.dataset.renderStyle = key;
  };
  style.addEventListener('change', update);
  update();

  const status = document.getElementById('videoStatus');
  const originalText = status?.textContent || '';
  if (status) {
    const observer = new MutationObserver(() => {
      const text = status.textContent || '';
      if (/Rendering scene|Rendering video/i.test(text)) status.dataset.state = 'rendering';
      else if (/Video ready/i.test(text)) status.dataset.state = 'ready';
      else if (/failed|error|silent|could not/i.test(text)) status.dataset.state = 'attention';
      else status.dataset.state = 'idle';
    });
    observer.observe(status, { childList: true, characterData: true, subtree: true });
    status.textContent = originalText;
  }
})();
