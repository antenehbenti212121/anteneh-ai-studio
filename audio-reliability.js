(() => {
  const button = document.getElementById('videoBtn');
  if (!button) return;

  const old = button;
  const replacement = old.cloneNode(true);
  old.replaceWith(replacement);

  const $ = id => document.getElementById(id);
  const status = $('videoStatus');
  const state = $('projectState');
  const audioPreview = $('audioPreview');
  const recordStatus = $('recordStatus');

  function hasRecordedAudio() {
    return !!(audioPreview && audioPreview.src && !audioPreview.hidden);
  }

  function setMessage(text) {
    if (status) status.textContent = text;
  }

  async function testAudioRoute() {
    if (!hasRecordedAudio()) return { ok: false, reason: 'no-recording' };
    if (!(window.AudioContext || window.webkitAudioContext)) return { ok: false, reason: 'no-web-audio' };

    let ctx, element;
    try {
      element = new Audio(audioPreview.src);
      element.preload = 'auto';
      await new Promise((resolve, reject) => {
        element.onloadedmetadata = resolve;
        element.onerror = () => reject(new Error('Recorded narration could not be loaded.'));
      });
      const Ctx = window.AudioContext || window.webkitAudioContext;
      ctx = new Ctx();
      const source = ctx.createMediaElementSource(element);
      const destination = ctx.createMediaStreamDestination();
      source.connect(destination);
      source.connect(ctx.destination);
      await ctx.resume();
      const tracks = destination.stream.getAudioTracks();
      source.disconnect();
      destination.disconnect();
      await ctx.close();
      return { ok: tracks.length > 0, reason: tracks.length ? 'ok' : 'no-track' };
    } catch (error) {
      try { if (ctx) await ctx.close(); } catch (_) {}
      return { ok: false, reason: error?.message || 'audio-route-failed' };
    }
  }

  function announceRecordingReady() {
    if (!recordStatus || !hasRecordedAudio()) return;
    recordStatus.textContent = 'Narration ready • video export can route this recording into the final stream.';
  }

  document.addEventListener('visibilitychange', announceRecordingReady);
  announceRecordingReady();

  replacement.addEventListener('click', async () => {
    if (!hasRecordedAudio()) return;
    setMessage('Checking narration route before rendering…');
    const result = await testAudioRoute();
    if (result.ok) {
      setMessage('Narration route ready • starting video render…');
      if (state) state.textContent = 'Rendering with narration';
      return;
    }
    if (result.reason === 'no-recording') return;
    setMessage('Narration could not be routed by this browser. The video renderer will continue without audio if necessary.');
  }, { once: true });
})();
