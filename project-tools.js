(() => {
  const storyPanel = document.querySelector('.storyboard-panel');
  const list = document.querySelector('.story-list');
  const prompt = document.getElementById('prompt');
  const length = document.getElementById('length');
  const style = document.getElementById('style');
  if (!storyPanel || !list) return;

  const actions = storyPanel.querySelector('.story-actions');
  if (!actions || document.getElementById('exportJsonBtn')) return;

  const exportBtn = document.createElement('button');
  exportBtn.id = 'exportJsonBtn';
  exportBtn.type = 'button';
  exportBtn.textContent = 'Export JSON';

  const importBtn = document.createElement('button');
  importBtn.id = 'importJsonBtn';
  importBtn.type = 'button';
  importBtn.textContent = 'Import JSON';

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.hidden = true;

  actions.append(exportBtn, importBtn);
  storyPanel.appendChild(input);

  const collect = () => [...list.querySelectorAll('.scene')].map((scene, i) => ({
    title: scene.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
    narration: scene.querySelector('.scene-narration')?.value || '',
    visual: scene.querySelector('.scene-visual')?.value || ''
  }));

  const download = (name, text, type) => {
    const url = URL.createObjectURL(new Blob([text], { type }));
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  exportBtn.addEventListener('click', () => {
    const project = {
      version: 1,
      app: 'Anteneh AI Studio',
      exportedAt: new Date().toISOString(),
      topic: prompt?.value.trim() || '',
      length: length?.value || '60 sec',
      style: style?.value || 'Clean explainer',
      scenes: collect()
    };
    download('anteneh-ai-studio-project.json', JSON.stringify(project, null, 2), 'application/json');
  });

  importBtn.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || !Array.isArray(data.scenes) || !data.scenes.length) throw new Error('Invalid project');
      if (prompt) prompt.value = String(data.topic || '');
      if (length && [...length.options].some(o => o.value === data.length)) length.value = data.length;
      if (style && [...style.options].some(o => o.value === data.style)) style.value = data.style;
      list.innerHTML = data.scenes.map((scene, i) => {
        const esc = value => String(value || '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch]));
        return `<article class="scene${i === 0 ? ' active' : ''}"><span class="scene-num">${String(i + 1).padStart(2, '0')}</span><div class="scene-content"><input class="scene-title" value="${esc(scene.title)}" aria-label="Scene title"><textarea class="scene-narration" aria-label="Scene narration">${esc(scene.narration)}</textarea><input class="scene-visual" value="${esc(scene.visual)}" aria-label="Visual direction"></div></article>`;
      }).join('');
      document.querySelectorAll('.scene').forEach(scene => scene.addEventListener('click', () => {
        document.querySelectorAll('.scene').forEach(x => x.classList.remove('active'));
        scene.classList.add('active');
      }));
      localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({ topic: prompt?.value.trim() || '', length: length?.value, style: style?.value, scenes: data.scenes }));
      const note = document.getElementById('formNote');
      if (note) note.textContent = `Imported ${data.scenes.length} scenes from your project file.`;
      document.getElementById('projectState').textContent = 'Imported';
      list.dispatchEvent(new Event('input', { bubbles: true }));
    } catch (error) {
      const note = document.getElementById('formNote');
      if (note) note.textContent = 'That file is not a valid Anteneh AI Studio project.';
    }
  });
})();
