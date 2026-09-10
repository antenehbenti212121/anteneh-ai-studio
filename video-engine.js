(() => {
  const button = document.getElementById('videoBtn');
  if (!button) return;

  // Replace the original renderer so this enhancement owns the button cleanly.
  const enhancedButton = button.cloneNode(true);
  button.replaceWith(enhancedButton);

  const status = document.getElementById('videoStatus');
  const state = document.getElementById('projectState');
  const preview = document.getElementById('videoPreview');
  const download = document.getElementById('downloadVideo');
  const audioPreview = document.getElementById('audioPreview');
  let outputUrl = null;

  const scenes = () => [...document.querySelectorAll('.scene')].map((node, i) => ({
    title: node.querySelector('.scene-title')?.value || `Scene ${i + 1}`,
    narration: node.querySelector('.scene-narration')?.value || '',
    visual: node.querySelector('.scene-visual')?.value || ''
  }));

  const wrap = (ctx, text, width) => {
    const words = String(text).trim().split(/\s+/).filter(Boolean);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > width && line) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    if (line) lines.push(line);
    return lines;
  };

  // Estimate natural narration time locally from word count. No network service is used.
  const estimateDurations = (items, audioDuration) => {
    if (audioDuration > 0) {
      const weights = items.map(s => Math.max(1, s.narration.trim().split(/\s+/).filter(Boolean).length));
      const total = weights.reduce((a, b) => a + b, 0);
      return weights.map(w => Math.max(1800, audioDuration * w / total));
    }
    const raw = items.map(s => {
      const words = s.narration.trim().split(/\s+/).filter(Boolean).length;
      return Math.max(2200, Math.min(10000, (words / 2.5) * 1000));
    });
    return raw;
  };

  const draw = (ctx, canvas, scene, index, total, progress, previousProgress = 0) => {
    const w = canvas.width, h = canvas.height;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#080d1c');
    grad.addColorStop(1, '#1a1437');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const t = progress;
    const scale = 0.96 + 0.04 * Math.sin(t * Math.PI);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.scale(scale, scale);
    ctx.translate(-w / 2, -h / 2);

    ctx.globalAlpha = 0.16;
    ctx.fillStyle = '#7c5cff';
    ctx.beginPath();
    ctx.arc(w * 0.82 + Math.sin(t * Math.PI) * 70, h * 0.18, 155, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(w * 0.12 - Math.sin(t * Math.PI) * 45, h * 0.86, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#a3afff';
    ctx.font = '700 26px system-ui';
    ctx.fillText('ANTENEH AI STUDIO', 70, 70);
    ctx.fillStyle = '#77819a';
    ctx.font = '600 20px system-ui';
    ctx.fillText(`SCENE ${String(index + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, 70, 112);

    const alphaIn = Math.min(1, progress * 5);
    ctx.globalAlpha = alphaIn;
    ctx.fillStyle = '#fff';
    ctx.font = '800 58px system-ui';
    wrap(ctx, scene.title, w - 140).slice(0, 2).forEach((line, i) => ctx.fillText(line, 70, 205 + i * 68));
    ctx.fillStyle = '#c7cddd';
    ctx.font = '400 28px system-ui';
    wrap(ctx, scene.narration, w - 160).slice(0, 5).forEach((line, i) => ctx.fillText(line, 80, 390 + i * 40));
    ctx.fillStyle = '#69738c';
    ctx.font = '400 18px system-ui';
    wrap(ctx, scene.visual, w - 160).slice(0, 2).forEach((line, i) => ctx.fillText(line, 80, 620 + i * 27));
    ctx.restore();

    // Global progress bar.
    ctx.fillStyle = 'rgba(255,255,255,.12)';
    ctx.fillRect(70, h - 55, w - 140, 5);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(70, h - 55, (w - 140) * ((index + progress) / total), 5);
  };

  async function render() {
    const items = scenes();
    if (!items.length) { status.textContent = 'Create a storyboard first.'; return; }
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) {
      status.textContent = 'This browser does not support in-browser video recording.';
      return;
    }

    enhancedButton.disabled = true;
    state.textContent = 'Rendering';
    status.textContent = 'Calculating natural scene timing…';
    preview.hidden = true;
    download.hidden = true;
    if (outputUrl) URL.revokeObjectURL(outputUrl);

    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    const videoStream = canvas.captureStream(24);

    let audioElement = null;
    let audioStream = null;
    let audioDuration = 0;
    if (audioPreview?.src && !audioPreview.hidden) {
      audioElement = new Audio(audioPreview.src);
      audioElement.preload = 'auto';
      try {
        await new Promise((resolve, reject) => {
          audioElement.onloadedmetadata = resolve;
          audioElement.onerror = reject;
        });
        audioDuration = Number.isFinite(audioElement.duration) ? audioElement.duration * 1000 : 0;
        audioStream = audioElement.captureStream ? audioElement.captureStream() : (audioElement.mozCaptureStream ? audioElement.mozCaptureStream() : null);
      } catch (_) {
        audioElement = null;
      }
    }

    const durations = estimateDurations(items, audioDuration);
    const totalMs = durations.reduce((a, b) => a + b, 0);
    status.textContent = `Natural timing: ${(totalMs / 1000).toFixed(1)} seconds.`;

    const combined = new MediaStream();
    videoStream.getVideoTracks().forEach(track => combined.addTrack(track));
    if (audioStream) audioStream.getAudioTracks().forEach(track => combined.addTrack(track));

    const mime = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t)) || '';
    let recorder;
    try {
      recorder = new MediaRecorder(combined, mime ? { mimeType: mime, videoBitsPerSecond: 1800000, audioBitsPerSecond: 128000 } : { videoBitsPerSecond: 1800000 });
    } catch (_) {
      status.textContent = 'Video recording could not start on this browser.';
      enhancedButton.disabled = false;
      return;
    }

    const chunks = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    const finished = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.start(500);
    if (audioElement) { try { await audioElement.play(); } catch (_) {} }

    for (let i = 0; i < items.length; i++) {
      const start = performance.now();
      const duration = durations[i];
      while (performance.now() - start < duration) {
        const progress = Math.min(1, (performance.now() - start) / duration);
        draw(ctx, canvas, items[i], i, items.length, progress);
        const elapsed = durations.slice(0, i).reduce((a, b) => a + b, 0) + (performance.now() - start);
        status.textContent = `Rendering scene ${i + 1} of ${items.length} — ${Math.min(100, Math.round(elapsed / totalMs * 100))}%`;
        await new Promise(requestAnimationFrame);
      }
    }

    if (audioElement) { audioElement.pause(); audioElement.currentTime = 0; }
    recorder.stop();
    await finished;
    combined.getTracks().forEach(track => track.stop());
    videoStream.getTracks().forEach(track => track.stop());

    const blob = new Blob(chunks, { type: mime || 'video/webm' });
    outputUrl = URL.createObjectURL(blob);
    preview.src = outputUrl;
    preview.hidden = false;
    preview.load();
    download.href = outputUrl;
    download.download = audioStream ? 'anteneh-ai-studio-video-with-narration.webm' : 'anteneh-ai-studio-video.webm';
    download.textContent = `Download video${audioStream ? ' with narration' : ''} (${Math.max(1, Math.round(blob.size / 1024 / 1024 * 10) / 10)} MB)`;
    download.hidden = false;
    state.textContent = 'Video ready';
    status.textContent = audioStream ? 'Video ready with your recorded narration and automatic scene timing.' : 'Video ready with automatic scene timing.';
    enhancedButton.disabled = false;
  }

  enhancedButton.addEventListener('click', render);
})();
