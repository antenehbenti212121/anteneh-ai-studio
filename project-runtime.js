(() => {
  const prompt = document.getElementById('prompt');
  const length = document.getElementById('length');
  const style = document.getElementById('style');
  const storyList = document.querySelector('.story-list');
  const videoBtn = document.getElementById('videoBtn');
  const formNote = document.getElementById('formNote');
  if (!prompt || !length || !style || !storyList || !videoBtn) return;

  const esc = value => String(value || '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const topicText = () => prompt.value.replace(/\s+/g, ' ').trim();

  function buildStoryboard(topic, videoLength, visualStyle) {
    const clean = topic.replace(/\s+/g, ' ').trim();
    const lower = clean.toLowerCase();
    const count = videoLength === '5 min' ? 7 : videoLength === '2 min' ? 6 : 5;
    const kind = /how to|tutorial|learn|make|build|use|install|steps?|guide/.test(lower) ? 'howto'
      : /why|cause|effect|impact|problem|climate|pollution|history|war|revolution|greenhouse/.test(lower) ? 'cause'
      : /math|equation|algebra|geometry|fraction|physics|chemistry|biology|photosynthesis|science/.test(lower) ? 'science'
      : /compare|difference|versus|vs\b|better|pros|cons/.test(lower) ? 'compare' : 'concept';
    const sets = {
      howto: [
        ['Hook', `What are we trying to accomplish with ${clean}? Start with the result the viewer wants.`, `Show the finished result, then reveal the lesson title.`],
        ['What you need', `Introduce the key tools, ideas, or information needed before starting ${clean}.`, `Animated checklist of the essential items or ideas.`],
        ['Step by step', `Walk through the most important steps of ${clean} in the correct order.`, `Numbered process diagram with one step highlighted at a time.`],
        ['Common mistake', `Point out one mistake beginners can make with ${clean} and explain how to avoid it.`, `Before-and-after comparison showing the mistake and the fix.`],
        ['Example', `Show a short practical example of ${clean} so the viewer can see how the method works.`, `Example card with inputs on the left and result on the right.`],
        ['Recap', `Review the steps for ${clean} in a compact sequence the viewer can remember.`, `Animated 1-2-3 recap timeline.`],
        ['Closing', `End with one simple action the viewer can take to practice ${clean}.`, `Clean challenge card: try it yourself.`]
      ],
      cause: [
        ['Hook', `What is the surprising question behind ${clean}? Open with the problem or mystery.`, `Large question card with a subtle animated reveal.`],
        ['What is happening?', `Define ${clean} in plain language before explaining why it happens.`, `Simple concept map with the main idea in the center.`],
        ['Causes', `Break down the main causes or forces connected to ${clean}.`, `Three connected cause cards flowing toward one outcome.`],
        ['Effects', `Explain the most important effects of ${clean} and who or what they affect.`, `Cause-to-effect arrows with highlighted outcomes.`],
        ['Example', `Use one concrete example to make ${clean} easier to understand.`, `Timeline or before-and-after example.`],
        ['Key takeaway', `Summarize the main relationship between causes, effects, and the central idea of ${clean}.`, `Three takeaway cards connected by arrows.`],
        ['Closing', `Finish with one memorable sentence that captures the lesson about ${clean}.`, `Minimal final statement with the key phrase emphasized.`]
      ],
      science: [
        ['Hook', `Ask a simple question: what happens when we look closely at ${clean}?`, `Question card followed by a zoom-in animation.`],
        ['Core idea', `Define ${clean} using everyday language before introducing technical terms.`, `Central concept card with two plain-language labels.`],
        ['How it works', `Explain the process of ${clean} from beginning to end in clear stages.`, `Animated process diagram with numbered stages.`],
        ['Example', `Connect ${clean} to something the viewer can observe in real life.`, `Real-world example card with a labeled illustration.`],
        ['Why it matters', `Explain why understanding ${clean} is useful and what it helps us predict or do.`, `Three benefit cards appearing one by one.`],
        ['Recap', `Repeat the three most important facts about ${clean} in simple language.`, `Three-point recap with animated check marks.`],
        ['Closing', `End with one curiosity question that encourages the viewer to explore ${clean} further.`, `Curiosity card with a clean question reveal.`]
      ],
      compare: [
        ['Hook', `What is the key difference we need to understand about ${clean}?`, `Split-screen comparison with two labeled sides.`],
        ['Option A', `Explain the first side of ${clean} in simple terms, including its main strengths.`, `Focused card for the first option with three labels.`],
        ['Option B', `Explain the second side in the same clear structure so the comparison is fair.`, `Matching card for the second option.`],
        ['Side by side', `Compare the most important features of ${clean} directly.`, `Animated comparison table with rows appearing one at a time.`],
        ['Best fit', `Explain when one option may make more sense than the other, depending on the goal.`, `Decision path with two simple branches.`],
        ['Takeaway', `Summarize the biggest difference and the situation where each option fits best.`, `Two-column takeaway card.`],
        ['Closing', `End with a short decision rule the viewer can remember.`, `One-sentence rule on a clean final card.`]
      ],
      concept: [
        ['Hook', `Why should we care about ${clean}? Start with a simple question or surprising idea.`, `Opening question card with the lesson title.`],
        ['Core idea', `Introduce ${clean} in clear, simple language and define the central idea.`, `Central concept card with supporting labels.`],
        ['How it works', `Break ${clean} into its most important parts or steps so the viewer can follow easily.`, `Simple diagram or step-by-step visual.`],
        ['Example', `Give a practical example that makes ${clean} easier to understand.`, `Relatable real-world example with short labels.`],
        ['Why it matters', `Explain where ${clean} appears in real life and why the idea is useful.`, `Three use-case cards with gentle motion.`],
        ['Recap', `Review the main points from the lesson in a few short sentences.`, `Animated recap with the main keywords.`],
        ['Closing', `End with one memorable sentence that encourages the viewer to keep learning about ${clean}.`, `Clean end card with the lesson title.`]
      ]
    };
    const chosen = sets[kind];
    const selected = chosen.slice(0, count);
    if (count < chosen.length) selected[count - 1] = chosen[chosen.length - 2];
    return selected.map((item, i) => ({
      title: item[0],
      narration: item[1],
      visual: `${item[2]} Style: ${visualStyle}. Topic: ${clean}.`
    }));
  }

  function render(scenes) {
    storyList.innerHTML = scenes.map((scene, i) => `<article class="scene${i === 0 ? ' active' : ''}"><span class="scene-num">${String(i + 1).padStart(2,'0')}</span><div class="scene-content"><input class="scene-title" value="${esc(scene.title)}" aria-label="Scene title"><textarea class="scene-narration" aria-label="Scene narration">${esc(scene.narration)}</textarea><input class="scene-visual" value="${esc(scene.visual)}" aria-label="Visual direction"></div></article>`).join('');
    storyList.querySelectorAll('.scene').forEach(scene => scene.addEventListener('click', () => {
      storyList.querySelectorAll('.scene').forEach(x => x.classList.remove('active'));
      scene.classList.add('active');
    }));
    document.querySelectorAll('.scene-title,.scene-narration,.scene-visual').forEach(el => el.addEventListener('input', () => {
      const data = collect();
      localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({topic:topicText(),length:length.value,style:style.value,scenes:data}));
    }));
  }

  function collect() {
    return [...storyList.querySelectorAll('.scene')].map((scene, i) => ({
      title: scene.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
      narration: scene.querySelector('.scene-narration')?.value || '',
      visual: scene.querySelector('.scene-visual')?.value || ''
    }));
  }

  function isStarterStoryboard() {
    const items = [...storyList.querySelectorAll('.scene')];
    if (items.length === 0) return true;
    const text = items.map(x => x.textContent || '').join(' ').toLowerCase();
    return items.length <= 4 && /open with a simple question|break the concept into short|show an example or diagram|end with the key takeaway/.test(text);
  }

  function ensureLesson() {
    const topic = topicText();
    if (!topic) return false;
    const savedRaw = localStorage.getItem('anteneh-ai-studio-project');
    let saved = null;
    try { saved = savedRaw ? JSON.parse(savedRaw) : null; } catch (_) {}
    const current = collect();
    const starter = isStarterStoryboard();
    if (starter) {
      if (saved?.scenes?.length && saved.topic === topic) render(saved.scenes);
      else render(buildStoryboard(topic, length.value, style.value));
      localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({topic,length:length.value,style:style.value,scenes:collect()}));
      if (formNote) formNote.textContent = 'Lesson storyboard synced to the video renderer.';
      return true;
    }
    if (current.length) localStorage.setItem('anteneh-ai-studio-project', JSON.stringify({topic,length:length.value,style:style.value,scenes:current}));
    return true;
  }

  document.addEventListener('click', event => {
    if (event.target.closest('#videoBtn')) ensureLesson();
  }, true);

  prompt.addEventListener('input', () => {
    if (isStarterStoryboard()) return;
    formNote.textContent = 'Topic changed. Create project to generate a fresh lesson, or render your current storyboard.';
  });
})();
