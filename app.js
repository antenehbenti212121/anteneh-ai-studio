const prompt = document.getElementById('prompt');
const length = document.getElementById('length');
const style = document.getElementById('style');
const createBtn = document.getElementById('createBtn');
const formNote = document.getElementById('formNote');
const projectState = document.getElementById('projectState');
const storyList = document.querySelector('.story-list');
const scenes = () => document.querySelectorAll('.scene');

function escapeHtml(value) {
  return String(value || '').replace(/[&<>'"]/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

function renderScript(script) {
  const items = [];
  items.push({ title: 'Hook', narration: script.hook, visual: 'Opening hook: ' + (script.title || 'Introduce the topic') });
  (script.scenes || []).forEach(scene => items.push(scene));
  items.push({ title: 'Recap', narration: script.recap, visual: 'Simple recap card showing the key takeaway.' });

  storyList.innerHTML = items.map((scene, index) => `
    <article class="scene${index === 0 ? ' active' : ''}">
      <span class="scene-num">${String(index + 1).padStart(2, '0')}</span>
      <div>
        <strong>${escapeHtml(scene.title)}</strong>
        <p>${escapeHtml(scene.narration)}</p>
        <small>${escapeHtml(scene.visual)}</small>
      </div>
    </article>
  `).join('');

  document.querySelectorAll('.scene').forEach(scene => {
    scene.addEventListener('click', () => {
      document.querySelectorAll('.scene').forEach(item => item.classList.remove('active'));
      scene.classList.add('active');
    });
  });
}

createBtn.addEventListener('click', async () => {
  const topic = prompt.value.trim();
  if (!topic) {
    prompt.focus();
    formNote.textContent = 'Add a topic or idea first, then create your project.';
    return;
  }

  createBtn.disabled = true;
  createBtn.innerHTML = 'Generating script <span>…</span>';
  projectState.textContent = 'Generating';
  formNote.textContent = 'AI is turning your idea into a structured educational script…';

  try {
    const response = await fetch('/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, length: length.value, style: style.value })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Script generation failed.');

    renderScript(data.script);
    projectState.textContent = 'Script ready';
    projectState.style.color = '#68e0b0';
    formNote.textContent = `AI script created for “${topic.slice(0, 72)}${topic.length > 72 ? '…' : ''}”. Review the scenes below.`;
    createBtn.innerHTML = 'Generate again <span>↻</span>';
  } catch (error) {
    projectState.textContent = 'Needs setup';
    formNote.textContent = error.message;
    createBtn.innerHTML = 'Try again <span>↻</span>';
  } finally {
    createBtn.disabled = false;
  }
});
