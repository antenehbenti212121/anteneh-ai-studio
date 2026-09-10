const prompt = document.getElementById('prompt');
const createBtn = document.getElementById('createBtn');
const formNote = document.getElementById('formNote');
const projectState = document.getElementById('projectState');
const scenes = document.querySelectorAll('.scene');

createBtn.addEventListener('click', () => {
  const topic = prompt.value.trim();
  if (!topic) {
    prompt.focus();
    formNote.textContent = 'Add a topic or idea first, then create your project.';
    formNote.style.color = '#f0c674';
    return;
  }

  projectState.textContent = 'Project created';
  projectState.style.color = '#68e0b0';
  formNote.textContent = `Draft created for “${topic.slice(0, 72)}${topic.length > 72 ? '…' : ''}”. This is the editable planning stage.`;
  formNote.style.color = '#8fd8bf';
  createBtn.innerHTML = 'Project created <span>✓</span>';

  scenes.forEach((scene, index) => {
    scene.classList.toggle('active', index === 0);
  });
});

scenes.forEach(scene => {
  scene.addEventListener('click', () => {
    scenes.forEach(item => item.classList.remove('active'));
    scene.classList.add('active');
  });
});
