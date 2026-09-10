(() => {
  const save = document.getElementById('saveBtn');
  const actions = document.querySelector('.story-actions');
  const list = document.querySelector('.story-list');
  const prompt = document.getElementById('prompt');
  const length = document.getElementById('length');
  const style = document.getElementById('style');
  if (!save || !actions || !list) return;

  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json,application/json';
  input.hidden = true;
  input.id = 'projectImportInput';
  document.body.appendChild(input);

  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Import JSON';
  actions.appendChild(button);

  button.addEventListener('click', () => input.click());
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!Array.isArray(data.scenes) || !data.scenes.length) throw new Error('No scenes found');
      prompt.value = data.topic || '';
      if (data.length) length.value = data.length;
      if (data.style) style.value = data.style;
      list.innerHTML = data.scenes.map((scene, i) => `
        <article class="scene${i === 0 ? ' active' : ''}">
          <span class="scene-num">${String(i + 1).padStart(2, '0')}</span>
          <div class="scene-content">
            <input class="scene-title" value="${escapeValue(scene.title)}" aria-label="Scene title">
            <textarea class="scene-narration" aria-label="Scene narration">${escapeValue(scene.narration)}</textarea>
            <input class="scene-visual" value="${escapeValue(scene.visual)}" aria-label="Visual direction">
          </div>
        </article>`).join('');
      document.querySelectorAll('.scene').forEach(scene => scene.addEventListener('click', () => {
        document.querySelectorAll('.scene').forEach(item => item.classList.remove('active'));
        scene.classList.add('active');
      }));
      localStorage.setItem('anteneh-ai-studio-project', JSON.stringify(data));
      document.getElementById('formNote').textContent = 'Project imported successfully.';
      input.value = '';
    } catch (error) {
      document.getElementById('formNote').textContent = 'Could not import that JSON project.';
    }
  });

  function escapeValue(value) {
    return String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
})();
